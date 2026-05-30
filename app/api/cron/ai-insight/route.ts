import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { API_VERSION } from "@/lib/api-version"

async function verifyQStashRequest(req: NextRequest): Promise<boolean> {
  const signature = req.headers.get("upstash-signature")
  if (!signature) {
    if (process.env.QSTASH_DEV_MODE === "true") return true
    return false
  }
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
    const body = await req.text()
    const [timestamp, sig] = signature.split(".")
    const data = `${timestamp}.${body}`
    const sigBytes = Uint8Array.from(atob(sig), (c) => c.charCodeAt(0))
    const valid = await crypto.subtle.verify("HMAC", cryptoKey, sigBytes, encoder.encode(data))
    return valid
  } catch {
    return false
  }
}

function computeTrend(current: number, previous: number): { direction: "up" | "down" | "flat"; pct: number } {
  if (previous === 0) return { direction: current > 0 ? "up" : "flat", pct: 0 }
  const pct = Math.round(((current - previous) / previous) * 100)
  return { direction: pct > 5 ? "up" : pct < -5 ? "down" : "flat", pct }
}

export async function POST(req: NextRequest) {
  const valid = await verifyQStashRequest(req)
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const headers = { "X-API-Version": API_VERSION }

  try {
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const yesterdayEnd = new Date(yesterdayStart)
    yesterdayEnd.setHours(23, 59, 59, 999)

    const businesses = await prisma.business.findMany({
      where: {
        aiAutoReplyConfig: { isEnabled: true },
      },
      include: {
        aiAutoReplyConfig: true,
        twilioAccounts: { where: { isActive: true }, take: 1 },
      },
    })

    const results: { businessId: string; name: string; insight: string }[] = []

    for (const business of businesses) {
      const account = business.twilioAccounts[0]
      if (!account) continue

      // Parallel data fetch for today's vs yesterday's
      const [
        todayOrders,
        yesterdayOrders,
        todayMessages,
        yesterdayMessages,
        todayAiReplies,
        yesterdayAiReplies,
        openConversations,
      ] = await Promise.all([
        prisma.order.count({
          where: { businessId: business.id, createdAt: { gte: todayStart }, deletedAt: null },
        }),
        prisma.order.count({
          where: { businessId: business.id, createdAt: { gte: yesterdayStart, lte: yesterdayEnd }, deletedAt: null },
        }),
        prisma.message.count({
          where: { conversation: { businessId: business.id }, createdAt: { gte: todayStart } },
        }),
        prisma.message.count({
          where: { conversation: { businessId: business.id }, createdAt: { gte: yesterdayStart, lte: yesterdayEnd } },
        }),
        prisma.message.count({
          where: { conversation: { businessId: business.id }, createdAt: { gte: todayStart }, aiReplyUsed: true },
        }),
        prisma.message.count({
          where: { conversation: { businessId: business.id }, createdAt: { gte: yesterdayStart, lte: yesterdayEnd }, aiReplyUsed: true },
        }),
        prisma.conversation.count({
          where: { businessId: business.id, status: "open", deletedAt: null },
        }),
      ])

      const todayDeflection =
        todayMessages > 0 ? Math.round((todayAiReplies / todayMessages) * 100) : 0
      const yesterdayDeflection =
        yesterdayMessages > 0 ? Math.round((yesterdayAiReplies / yesterdayMessages) * 100) : 0

      const deflectionTrend = computeTrend(todayDeflection, yesterdayDeflection)
      const ordersTrend = computeTrend(todayOrders, yesterdayOrders)

      let insight = ""
      if (deflectionTrend.direction === "down" && deflectionTrend.pct < -10) {
        insight = `AI deflection rate dropped ${Math.abs(deflectionTrend.pct)}% compared to yesterday. Consider reviewing your auto-reply settings.`
      } else if (ordersTrend.direction === "up" && ordersTrend.pct > 20) {
        insight = `Great job! Order volume increased ${ordersTrend.pct}% compared to yesterday. ${todayOrders} new orders.`
      } else if (openConversations > 10 && todayDeflection < 50) {
        insight = `You have ${openConversations} open conversations with only ${todayDeflection}% AI deflection. Customers may be waiting.`
      } else if (todayDeflection > 80) {
        insight = `Excellent! AI is handling ${todayDeflection}% of messages automatically. Keep up the good work!`
      } else if (todayMessages === 0) {
        insight = `No messages yet today. Make sure your WhatsApp integration is active.`
      } else {
        insight = `Today: ${todayOrders} orders, ${todayMessages} messages, ${todayDeflection}% AI deflection rate.`
      }

      results.push({ businessId: business.id, name: business.name, insight })

      // Store in DailySummary for dashboard retrieval
      const summaryDate = new Date(todayStart)

      await prisma.dailySummary.upsert({
        where: { businessId_date: { businessId: business.id, date: summaryDate } },
        create: {
          date: summaryDate,
          businessId: business.id,
          insightText: insight,
          totalOrders: todayOrders,
          totalRevenue: 0,
          totalExpense: 0,
          totalMessages: todayMessages,
          newCustomers: 0,
          openConversations,
        },
        update: { insightText: insight },
      })
    }

    return NextResponse.json(
      {
        processed: results.length,
        results,
      },
      { headers }
    )
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error)
    console.error("[AIInsight] Error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500, headers })
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const businesses = await prisma.business.findMany({
    include: { aiAutoReplyConfig: true, twilioAccounts: { where: { isActive: true }, take: 1 } },
  })

  const insights = []
  for (const biz of businesses) {
    if (!biz.aiAutoReplyConfig?.isEnabled) {
      insights.push({ businessId: biz.id, name: biz.name, status: "disabled" })
    } else if (biz.twilioAccounts.length === 0) {
      insights.push({ businessId: biz.id, name: biz.name, status: "no_wa_account" })
    } else {
      insights.push({ businessId: biz.id, name: biz.name, status: "enabled" })
    }
  }

  return NextResponse.json({ businesses: insights.length, details: insights })
}