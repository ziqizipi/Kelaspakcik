import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"
import { can } from "@/lib/rbac"

export async function GET(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "reports-get")
  const { success, remaining, reset } = rateLimit(rateLimitKey, 30, 60000)
  const headers = {
    "X-RateLimit-Limit": "30",
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

    const userRole = (session as any)?.user?.role || ""
    if (!can(userRole, "reports:read")) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "7d" // 7d, 30d, 90d
    const businessId = (session as any)?.user?.businessId || ""

    let days = 7
    if (period === "30d") days = 30
    else if (period === "90d") days = 90

    const now = new Date()
    const periodStart = new Date(now)
    periodStart.setDate(periodStart.getDate() - days)
    periodStart.setHours(0, 0, 0, 0)

    // Metrics for the period
    const [
      conversationsCount,
      customersCount,
      ordersCount,
      ordersRevenueAgg,
      messagesCount,
      aiRepliedCount,
    ] = await Promise.all([
      // Conversations in period
      prisma.conversation.count({
        where: { businessId, deletedAt: null, createdAt: { gte: periodStart } },
      }),
      // New customers in period
      prisma.customer.count({
        where: { businessId, deletedAt: null, createdAt: { gte: periodStart } },
      }),
      // Orders in period
      prisma.order.count({
        where: { businessId, deletedAt: null, createdAt: { gte: periodStart } },
      }),
      // Revenue
      prisma.order.aggregate({
        where: { businessId, deletedAt: null, type: "INCOME", createdAt: { gte: periodStart } },
        _sum: { amount: true },
      }),
      // Messages
      prisma.message.count({
        where: { conversation: { businessId, deletedAt: null }, createdAt: { gte: periodStart } },
      }),
      // AI replied
      prisma.message.count({
        where: {
          conversation: { businessId, deletedAt: null },
          createdAt: { gte: periodStart },
          aiReplyUsed: true,
        },
      }),
    ])

    // Daily breakdown for chart (last 7 days regardless of period)
    const dailyData = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now)
      dayStart.setDate(dayStart.getDate() - i)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)

      const [dayConversations, dayOrders] = await Promise.all([
        prisma.conversation.count({
          where: {
            businessId,
            deletedAt: null,
            createdAt: { gte: dayStart, lte: dayEnd },
          },
        }),
        prisma.order.count({
          where: { businessId, deletedAt: null, createdAt: { gte: dayStart, lte: dayEnd } },
        }),
      ])

      const dayName = dayStart.toLocaleDateString("en-US", { weekday: "short" })
      dailyData.push({
        day: dayName,
        conversations: dayConversations,
        orders: dayOrders,
      })
    }

    // Response rate = messages with any reply / total inbound
    const inboundCount = await prisma.message.count({
      where: {
        conversation: { businessId, deletedAt: null },
        direction: "INBOUND",
        createdAt: { gte: periodStart },
      },
    })
    const repliedCount = await prisma.message.count({
      where: {
        conversation: { businessId, deletedAt: null },
        direction: "INBOUND",
        createdAt: { gte: periodStart },
        repliedBy: { not: null },
      },
    })
    const responseRate = inboundCount > 0 ? Math.round((repliedCount / inboundCount) * 100) : 0

    // Top products by order count
    const topProducts = await prisma.order.groupBy({
      by: ["category"],
      where: { businessId, deletedAt: null, createdAt: { gte: periodStart } },
      _count: true,
      orderBy: { _count: { category: "desc" } },
      take: 5,
    })

    const totalRevenue = ordersRevenueAgg._sum.amount ? Number(ordersRevenueAgg._sum.amount) : 0

    return NextResponse.json(
      {
        period,
        overview: {
          conversations: { value: conversationsCount, change: null },
          customers: { value: customersCount, change: null },
          orders: { value: ordersCount, change: null },
          revenue: { value: totalRevenue, change: null },
          responseRate: { value: responseRate, change: null },
        },
        dailyData,
        topProducts: topProducts.map((p) => ({
          name: p.category || "Lainnya",
          orders: p._count,
        })),
      },
      { headers }
    )
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Reports GET error:", err.message)
    return NextResponse.json({ error: "Failed to fetch reports", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}
