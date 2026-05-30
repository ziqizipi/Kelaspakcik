import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"
import { can } from "@/lib/rbac"

export async function GET(req: NextRequest) {
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
  const businessId = (session as any)?.user?.businessId || ""

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") || ""
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)
  const offset = parseInt(searchParams.get("offset") || "0")

  const where: any = { businessId, deletedAt: null }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ]
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: offset,
      take: limit,
      select: {
        id: true,
        name: true,
        phone: true,
        waId: true,
        lastMessageAt: true,
        createdAt: true,
        _count: { select: { conversations: true, orders: true } },
      },
    }),
    prisma.customer.count({ where }),
  ])

  return NextResponse.json({ customers, total }, { headers })
}

export async function POST(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "customers-post")
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

  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userRole = (session as any)?.user?.role || ""
  if (!can(userRole, "customers:write")) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }
  const businessId = (session as any)?.user?.businessId || ""

  const body = await req.json()
  const { name, phone, waId } = body

  const customer = await prisma.customer.create({
    data: { name, phone, waId, businessId },
  })
  return NextResponse.json({ customer }, { status: 201, headers })
}
