import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"
import { ROLE_HIERARCHY } from "@/lib/rbac"

const UpdateConfigSchema = z.object({
  isEnabled: z.boolean().optional(),
  tone: z.enum(["friendly", "formal", "casual"]).optional(),
  sopContext: z.string().max(5000).optional(),
  fallbackReply: z.string().max(1000).optional(),
  workingHours: z
    .object({
      start: z.string(),
      end: z.string(),
      timezone: z.string().optional(),
    })
    .optional(),
  dailyRecapEnabled: z.boolean().optional(),
  dailyRecapTime: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
  }

  const businessId = (session as any)?.user?.businessId || ""

  const config = await prisma.aIAutoReplyConfig.findUnique({
    where: { businessId },
  })

  return NextResponse.json({ config })
}

export async function PATCH(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "ai-config-patch")
  const { success, remaining, reset } = await rateLimit(rateLimitKey, 30, 60000)
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded", code: "RATE_LIMIT_EXCEEDED" },
      { status: 429, headers: { "X-RateLimit-Remaining": String(remaining), "X-RateLimit-Reset": String(reset), "X-API-Version": API_VERSION } }
    )
  }

  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
  }

  const userRole = (session as any)?.user?.role || ""
  if (ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] < ROLE_HIERARCHY.admin) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  const businessId = (session as any)?.user?.businessId || ""

  const parsed = UpdateConfigSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const updated = await prisma.aIAutoReplyConfig.upsert({
    where: { businessId },
    create: { businessId, ...parsed.data },
    update: parsed.data,
  })

  return NextResponse.json({ config: updated }, { headers: { "X-API-Version": API_VERSION } })
}
