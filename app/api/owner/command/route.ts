import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { VertexAI } from "@google-cloud/vertexai"
import { sendWhatsAppMessage, getDecryptedTwilioAccount } from "@/lib/twilio"
import { getSession } from "@/auth"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"
import { can } from "@/lib/rbac"

const OwnerCommandSchema = z.object({
  from: z.string().min(1),
  content: z.string().min(1),
  twilioAccountId: z.string().optional(),
})

const vertexai = new VertexAI({ project: process.env.GCP_PROJECT_ID || "balas-ai", location: "asia-southeast1" })

export async function POST(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "owner-command-post")
  const { success, remaining, reset } = rateLimit(rateLimitKey, 30, 60000)
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded", code: "RATE_LIMIT_EXCEEDED" },
      { status: 429, headers: { "X-RateLimit-Remaining": String(remaining), "X-RateLimit-Reset": String(reset), "X-API-Version": API_VERSION } }
    )
  }

  try {
    const session = await getSession()
    if (!(session as any).id) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }
    const userRole = (session as any).role || ""
    if (userRole !== "owner") {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    const parsed = OwnerCommandSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { from, content, twilioAccountId } = parsed.data

    const rawCmd = content.toLowerCase().trim()
    const command = rawCmd.startsWith("/") ? rawCmd : `/${rawCmd}`

    if (!command.startsWith("/")) {
      return NextResponse.json({ error: "Not a command", code: "INVALID_COMMAND" }, { status: 400 })
    }

    const account = twilioAccountId
      ? await getDecryptedTwilioAccount({ id: twilioAccountId })
      : await getDecryptedTwilioAccount({ businessId: (session as any)?.user?.businessId })

    if (!account) {
      return NextResponse.json({ error: "Twilio account not found", code: "NOT_FOUND" }, { status: 404 })
    }

    let response = ""

    if (command === "/rekap" || command === "/rekap hari ini" || command === "/laporan" || command === "/summary") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const [orders, messages, newCustomers, openConversations] = await Promise.all([
        prisma.order.findMany({
          where: { businessId: account.businessId, createdAt: { gte: today, lt: tomorrow } }
        }),
        prisma.message.count({
          where: { conversation: { businessId: account.businessId }, createdAt: { gte: today, lt: tomorrow } }
        }),
        prisma.customer.count({
          where: { businessId: account.businessId, createdAt: { gte: today, lt: tomorrow } }
        }),
        prisma.conversation.count({
          where: { businessId: account.businessId, status: "open" }
        })
      ])

      const totalRevenue = orders.filter(o => o.type === "INCOME").reduce((sum, o) => sum + (Number(o.amount) || 0), 0)
      const totalExpense = orders.filter(o => o.type === "EXPENSE").reduce((sum, o) => sum + (Number(o.amount) || 0), 0)

      response = `📊 *Rekap Hari Ini - ${today.toLocaleDateString("id-ID")}*\n\n🏪 ${account.businessName || "Bisnis Anda"}\n\n📦 Pesanan: ${orders.length}\n💰 Penjualan: Rp${totalRevenue.toLocaleString("id-ID")}\n💸 Pengeluaran: Rp${totalExpense.toLocaleString("id-ID")}\n\n💬 Pesan: ${messages}\n👥 Pelanggan Baru: ${newCustomers}\n\n🔓 Terbuka: ${openConversations}`

    } else if (command === "/bantuan" || command === "/help") {
      response = `📋 *Daftar Perintah*\n\n/rekap - Rekap hari ini\n/laporan - Laporan hari ini\n/summary - Summary hari ini\n/bantuan - Daftar perintah\n/help - Help`

    } else {
      response = `Perintah tidak dikenal. Ketik /bantuan untuk melihat daftar perintah.`
    }

    await sendWhatsAppMessage(from, response, account)

    return NextResponse.json({ success: true, response })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Owner command error:", err.message)
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}
