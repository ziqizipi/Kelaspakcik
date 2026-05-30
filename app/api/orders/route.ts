import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"
import { can } from "@/lib/rbac"
import type { Prisma } from "@prisma/client"

const CreateOrderSchema = z.object({
  conversationId: z.string().min(1),
  customerId: z.string().min(1),
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().optional(),
  items: z.record(z.string(), z.unknown()).optional(),
})

export async function GET(req: NextRequest) {
  // Rate limiting for list endpoint
  const rateLimitKey = getRateLimitKey(req, "orders-get")
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
    const limit = Math.min(parseInt(searchParams.get("limit") || "200") || 200, 200)
    const offset = Math.max(parseInt(searchParams.get("offset") || "0") || 0, 0)

    const businessId = (session as any)?.user?.businessId || ""

    const where: Record<string, unknown> = { businessId, deletedAt: null }
    if (customerId) where.customerId = customerId
    if (status) where.status = status

    const orders = await prisma.order.findMany({
      where,
      include: { customer: true, conversation: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset
    })

    return NextResponse.json({ orders }, { headers })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Orders GET error:", err.message)
    return NextResponse.json({ error: "Failed to fetch orders", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitKey = getRateLimitKey(req, "orders-post")
  const { success, remaining, reset } = rateLimit(rateLimitKey, 50, 60000)
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded", code: "RATE_LIMIT_EXCEEDED" },
      { status: 429, headers: { "X-RateLimit-Remaining": String(remaining), "X-RateLimit-Reset": String(reset), "X-API-Version": API_VERSION } }
    )
  }

  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }

    const userRole = (session as any)?.user?.role || ""
    if (!can(userRole, "orders:write")) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    const parsed = CreateOrderSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { conversationId, customerId, amount, category, description, items } = parsed.data

    const businessId = (session as any)?.user?.businessId || ""

    // Verify conversation belongs to user's business
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { businessId: true }
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found", code: "NOT_FOUND" }, { status: 404 })
    }

    if (conversation.businessId !== businessId) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    // Verify customer belongs to user's business
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { businessId: true }
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found", code: "NOT_FOUND" }, { status: 404 })
    }

    if (customer.businessId !== businessId) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    const order = await prisma.order.create({
      data: {
        conversationId,
        customerId,
        businessId,
        type: "INCOME",
        amount,
        category,
        description,
        items: (items ?? undefined) as Prisma.InputJsonValue | undefined,
        paymentStatus: "recorded"
      }
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Orders POST error:", err.message)
    return NextResponse.json({ error: "Failed to create order", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}