import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { can } from "@/lib/rbac"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rateLimitKey = getRateLimitKey(req, "orders-get")
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
  const businessId = (session as any)?.user?.businessId || ""
  const order = await prisma.order.findFirst({
    where: { id, businessId, deletedAt: null },
    include: { customer: true, conversation: { include: { messages: true } } }
  })
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404, headers })
  return NextResponse.json({ order }, { headers })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rateLimitKey = getRateLimitKey(req, "orders-patch")
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
  if (!can(userRole, "orders:write")) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403, headers })
  }
  const businessId = (session as any)?.user?.businessId || ""
  const body = await req.json()
  const { paymentStatus, description } = body
  const order = await prisma.order.update({
    where: { id, businessId, deletedAt: null },
    data: { paymentStatus, description }
  })
  return NextResponse.json({ order }, { headers })
}
