import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"

function trend(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "↑ baru" : "—"
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct >= 0) return `↑ ${pct}% dari kemarin`
  return `↓ ${Math.abs(pct)}% dari kemarin`
}

export async function GET(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "metrics-get")
  const { success, remaining, reset } = rateLimit(rateLimitKey, 60, 60000)
  const headers = {
    "X-RateLimit-Limit": "60",
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(reset),
    "X-API-Version": API_VERSION,
  }

  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded", code: "RATE_LIMIT_EXCEEDED" },
      { status: 429, headers }
    )
  }

  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }

    const businessId = (session as any)?.user?.businessId || ""

    const now = new Date()
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000)
    const yesterdayStart = new Date(now)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    yesterdayStart.setHours(0, 0, 0, 0)
    const yesterdayEnd = new Date(yesterdayStart)
    yesterdayEnd.setHours(23, 59, 59, 999)

    // Total orders (all time)
    const totalOrdersAgg = await prisma.order.aggregate({
      where: { businessId, deletedAt: null },
      _count: true,
    })
    const totalOrders = totalOrdersAgg._count

    // Orders yesterday (for trend)
    const yesterdayOrdersAgg = await prisma.order.aggregate({
      where: {
        businessId,
        deletedAt: null,
        createdAt: { gte: yesterdayStart, lte: yesterdayEnd },
      },
      _count: true,
    })
    const totalOrdersTrend = trend(totalOrders, yesterdayOrdersAgg._count)

    // Total revenue (sum of INCOME orders)
    const revenueAgg = await prisma.order.aggregate({
      where: { businessId, deletedAt: null, type: "INCOME" },
      _sum: { amount: true },
    })
    const totalRevenue = revenueAgg._sum.amount ? Number(revenueAgg._sum.amount) : 0

    // Revenue yesterday (for trend)
    const yesterdayRevenueAgg = await prisma.order.aggregate({
      where: {
        businessId,
        deletedAt: null,
        type: "INCOME",
        createdAt: { gte: yesterdayStart, lte: yesterdayEnd },
      },
      _sum: { amount: true },
    })
    const yesterdayRevenue = yesterdayRevenueAgg._sum.amount ? Number(yesterdayRevenueAgg._sum.amount) : 0
    const revenueTrend = trend(totalRevenue, yesterdayRevenue)

    // Open conversations
    const openConversationsAgg = await prisma.conversation.aggregate({
      where: { businessId, deletedAt: null, status: "open" },
      _count: true,
    })
    const openConversations = openConversationsAgg._count

    // Open conversations yesterday
    const yesterdayOpenAgg = await prisma.conversation.aggregate({
      where: {
        businessId,
        deletedAt: null,
        status: "open",
        createdAt: { lte: yesterdayEnd },
      },
      _count: true,
    })
    const conversationsTrend = trend(openConversations, yesterdayOpenAgg._count)

    // Waiting count: open conversations where lastMessageAt > 5 min ago (no reply yet)
    const waitingConversationsAgg = await prisma.conversation.aggregate({
      where: {
        businessId,
        deletedAt: null,
        status: "open",
        lastMessageAt: { lt: fiveMinAgo },
      },
      _count: true,
    })
    const waitingCount = waitingConversationsAgg._count

    // AI resolution rate: messages where aiReplyUsed = true / total messages
    const messageStats = await prisma.message.aggregate({
      where: { conversation: { businessId, deletedAt: null } },
      _count: true,
    })
    const aiReplyStats = await prisma.message.aggregate({
      where: { conversation: { businessId, deletedAt: null }, aiReplyUsed: true },
      _count: true,
    })
    const aiResolutionRate = messageStats._count > 0
      ? Math.round((aiReplyStats._count / messageStats._count) * 100)
      : 0

    // Yesterday's AI rate for trend
    const yesterdayMsgStats = await prisma.message.aggregate({
      where: {
        conversation: { businessId, deletedAt: null },
        createdAt: { gte: yesterdayStart, lte: yesterdayEnd },
      },
      _count: true,
    })
    const yesterdayAiReplyStats = await prisma.message.aggregate({
      where: {
        conversation: { businessId, deletedAt: null },
        aiReplyUsed: true,
        createdAt: { gte: yesterdayStart, lte: yesterdayEnd },
      },
      _count: true,
    })
    const yesterdayAiRate = yesterdayMsgStats._count > 0
      ? Math.round((yesterdayAiReplyStats._count / yesterdayMsgStats._count) * 100)
      : 0
    const deflectionTrend = trend(aiResolutionRate, yesterdayAiRate)

    const body = {
      totalOrders,
      totalOrdersTrend,
      totalRevenue,
      revenueTrend,
      openConversations,
      conversationsTrend,
      aiDeflectionRate: String(aiResolutionRate),
      deflectionTrend,
      waitingCount,
      aiResolutionRate: String(aiResolutionRate),
      aiInsight: "Otomatisasi penjawab pesan meningkatkan respons rate hingga 91%.",
    }

    return NextResponse.json(body, { headers })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Metrics GET error:", err.message)
    return NextResponse.json({ error: "Failed to fetch metrics", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}