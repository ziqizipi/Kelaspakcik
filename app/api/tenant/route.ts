import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"
import { can } from "@/lib/rbac"

export async function GET(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "tenant-get")
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

  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const businessId = (session as any)?.user?.businessId || ""
  const business = await prisma.business.findUnique({ where: { id: businessId } })
  return NextResponse.json({ business }, { headers })
}

export async function PATCH(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "tenant-patch")
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
  if (!can(userRole, "settings:write")) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }
  const businessId = (session as any)?.user?.businessId || ""
  const body = await req.json()
  const { name, industry, address, phone } = body
  const business = await prisma.business.update({
    where: { id: businessId },
    data: { name, industry, address, phone }
  })
  return NextResponse.json({ business }, { headers })
}