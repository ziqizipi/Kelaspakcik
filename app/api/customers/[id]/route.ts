import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"
import { can } from "@/lib/rbac"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rateLimitKey = getRateLimitKey(req, "customers-get")
  const { success, remaining, reset } = rateLimit(rateLimitKey, 100, 60000)
  const headers = {
    "X-RateLimit-Limit": "100",
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

  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      conversations: {
        orderBy: { lastMessageAt: "desc" },
        take: 10,
        select: { id: true, status: true, lastMessageAt: true, createdAt: true },
      },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, type: true, amount: true, paymentStatus: true, createdAt: true },
      },
    },
  })

  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const userBusinessId = (session as any)?.user?.businessId
  if (!userBusinessId) return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  if (customer.businessId !== userBusinessId) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  return NextResponse.json({ customer }, { headers })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rateLimitKey = getRateLimitKey(req, "customers-patch")
  const { success, remaining, reset } = rateLimit(rateLimitKey, 50, 60000)
  const headers = {
    "X-RateLimit-Limit": "50",
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

  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userRole = (session as any)?.user?.role || ""
  if (!can(userRole, "customers:write")) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }
  const { id } = await params

  const body = await req.json()
  const { name, phone } = body

  const customer = await prisma.customer.update({
    where: { id },
    data: { name, phone },
  })

  const userBusinessId = (session as any)?.user?.businessId
  if (!userBusinessId) return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  if (customer.businessId !== userBusinessId) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  return NextResponse.json({ customer }, { headers })
}