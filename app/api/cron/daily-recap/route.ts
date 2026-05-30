import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendWhatsAppMessage, getDecryptedTwilioAccount, type DecryptedTwilioAccount } from "@/lib/twilio"
import { API_VERSION } from "@/lib/api-version"

// QStash signature verification
async function verifyQStashRequest(req: NextRequest): Promise<boolean> {
  const signature = req.headers.get("upstash-signature")
  if (!signature) {
    if (process.env.QSTASH_DEV_MODE === "true") return true
    return false
  }
  const body = await req.text()
  const key = process.env.QSTASH_CURRENT_SIGNING_KEY || ""
  if (!key) return false

  try {
    const encoder = new TextEncoder()
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(key),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    )
    const [timestamp, sig] = signature.split(".")
    const data = `${timestamp}.${body}`
    const sigBytes = Uint8Array.from(atob(sig), (c) => c.charCodeAt(0))
    const valid = await crypto.subtle.verify("HMAC", cryptoKey, sigBytes, encoder.encode(data))
    return valid
  } catch {
    return false
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

async function generateRecapForBusiness(
  businessId: string,
  businessName: string,
  recipientPhone: string,
  account: DecryptedTwilioAccount
): Promise<void> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [orders, messagesCount, newCustomers, openConversations] = await Promise.all([
    prisma.order.findMany({
      where: { businessId, createdAt: { gte: today, lt: tomorrow }, deletedAt: null },
      select: { type: true, amount: true },
    }),
    prisma.message.count({
      where: { conversation: { businessId }, createdAt: { gte: today, lt: tomorrow } },
    }),
    prisma.customer.count({
      where: { businessId, createdAt: { gte: today, lt: tomorrow } },
    }),
    prisma.conversation.count({
      where: { businessId, status: "open", deletedAt: null },
    }),
  ])

  const totalOrders = orders.length
  const totalRevenue = orders.filter((o) => o.type === "INCOME").reduce((sum, o) => sum + Number(o.amount), 0)
  const totalExpense = orders.filter((o) => o.type === "EXPENSE").reduce((sum, o) => sum + Number(o.amount), 0)
  const netProfit = totalRevenue - totalExpense

  const dateStr = formatDate(today)
  let message = `📊 *Daily Recap — ${dateStr}*\n\n🏪 ${businessName}\n\n`
  message += `🛒 *Orders:* ${totalOrders} baru\n`
  message += `💰 *Revenue:* ${formatCurrency(totalRevenue)}\n`
  message += `💸 *Expense:* ${formatCurrency(totalExpense)}\n`
  message += `📈 *Net:* ${formatCurrency(netProfit)}\n\n`
  message += `💬 *Messages:* ${messagesCount}\n`
  message += `👥 *New Customers:* ${newCustomers}\n`
  message += `📌 *Open Conversations:* ${openConversations}\n\n`

  if (totalOrders === 0 && messagesCount === 0) {
    message += `🤔 *Insight:* Tidak ada aktivitas hari ini.`
  } else if (netProfit < 0) {
    message += `⚠️ *Insight:* Pengeluaran lebih besar dari pendapatan.`
  } else if (totalOrders > 5) {
    message += `🎉 *Insight:* Hari yang produktif! ${totalOrders} order.`
  } else {
    message += `💡 *Insight:* Hari berjalan lancar.`
  }

  const result = await sendWhatsAppMessage(recipientPhone, message, account)

  const summaryDate = new Date(today)
  summaryDate.setHours(0, 0, 0, 0)

  await prisma.dailySummary.upsert({
    where: { businessId_date: { businessId, date: summaryDate } },
    create: {
      date: summaryDate, businessId,
      totalOrders, totalRevenue, totalExpense,
      totalMessages: messagesCount, newCustomers, openConversations,
      insightText: message,
      sentAt: result.success ? new Date() : null,
    },
    update: {
      totalOrders, totalRevenue, totalExpense,
      totalMessages: messagesCount, newCustomers, openConversations,
      insightText: message,
      sentAt: result.success ? new Date() : null,
    },
  })
}

export async function POST(req: NextRequest) {
  const valid = await verifyQStashRequest(req)
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const headers = { "X-API-Version": API_VERSION }

  try {
    const businesses = await prisma.business.findMany({
      include: {
        twilioAccounts: { where: { isActive: true }, take: 1 },
      },
    })

    const results: { businessId: string; success: boolean; error?: string }[] = []

    for (const business of businesses) {
      const account = business.twilioAccounts[0]
      if (!account) {
        results.push({ businessId: business.id, success: false, error: "No Twilio account" })
        continue
      }

      const decrypted = await getDecryptedTwilioAccount({ id: account.id })
      if (!decrypted) {
        results.push({ businessId: business.id, success: false, error: "Failed to decrypt auth token" })
        continue
      }

      try {
        await generateRecapForBusiness(
          business.id,
          business.name,
          decrypted.whatsappNumber,
          decrypted
        )
        results.push({ businessId: business.id, success: true })
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err)
        console.error(`[DailyRecap] Business ${business.id} failed:`, error)
        results.push({ businessId: business.id, success: false, error })
      }
    }

    const successCount = results.filter((r) => r.success).length
    return NextResponse.json(
      { processed: results.length, successful: successCount, failed: results.length - successCount, results },
      { headers }
    )
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error)
    console.error("[DailyRecap] Error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500, headers })
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const businesses = await prisma.business.findMany({
    include: {
      twilioAccounts: { where: { isActive: true }, take: 1 },
    },
  })

  const results: { businessId: string; name: string; success: boolean; error?: string }[] = []

  for (const business of businesses) {
    const account = business.twilioAccounts[0]
    if (!account) {
      results.push({ businessId: business.id, name: business.name, success: false, error: "No Twilio account" })
      continue
    }

    const decrypted = await getDecryptedTwilioAccount({ id: account.id })
    if (!decrypted) {
      results.push({ businessId: business.id, name: business.name, success: false, error: "Failed to decrypt" })
      continue
    }

    try {
      await generateRecapForBusiness(business.id, business.name, decrypted.whatsappNumber, decrypted)
      results.push({ businessId: business.id, name: business.name, success: true })
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      results.push({ businessId: business.id, name: business.name, success: false, error })
    }
  }

  const successCount = results.filter((r) => r.success).length
  return NextResponse.json({
    processed: results.length,
    successful: successCount,
    failed: results.length - successCount,
    results,
  })
}
