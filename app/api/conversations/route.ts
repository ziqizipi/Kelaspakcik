import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"

export async function GET(req: NextRequest) {
  // Rate limiting for list endpoint
  const rateLimitKey = getRateLimitKey(req, "conversations-get")
  const { success, remaining, reset } = rateLimit(rateLimitKey, 200, 60000)
  const headers = {
    "X-RateLimit-Limit": "200",
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

    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get("customerId")
    const status = searchParams.get("status")
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "200") || 200, 1), 200)
    const offset = Math.max(parseInt(searchParams.get("offset") || "0") || 0, 0)

    const businessId = (session as any)?.user?.businessId || ""

    const where: Record<string, unknown> = { businessId, deletedAt: null }
    if (customerId) where.customerId = customerId
    if (status) where.status = status

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        customer: true,
        twilioAccount: { select: { id: true, whatsappNumber: true, businessName: true } },
        _count: { select: { messages: true } }
      },
      orderBy: { lastMessageAt: "desc" },
      take: limit,
      skip: offset
    })

    return NextResponse.json({ conversations }, { headers })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Conversations GET error:", err.message)
    return NextResponse.json({ error: "Failed to fetch conversations", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}