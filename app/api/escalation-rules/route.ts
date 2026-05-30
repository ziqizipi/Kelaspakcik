import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"
import { can } from "@/lib/rbac"

const EscalationRuleSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["INTENT", "KEYWORD", "ORDER_VALUE"]),
  keywords: z.array(z.string()).optional().default([]),
  minOrderValue: z.number().positive().optional(),
  notifyVia: z.enum(["whatsapp", "email"]).default("whatsapp"),
  notifyUserId: z.string().optional(),
  messageTemplate: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
})

export async function GET(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "escalation-rules-get")
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

    const userRole = (session as any)?.user?.role || ""
    if (!can(userRole, "escalation:read")) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    const businessId = (session as any)?.user?.businessId || ""

    const rules = await prisma.escalationRule.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ rules }, { headers })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Escalation rules GET error:", err.message)
    return NextResponse.json({ error: "Failed to fetch escalation rules", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "escalation-rules-post")
  const { success, remaining, reset } = rateLimit(rateLimitKey, 20, 60000)
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
    if (!can(userRole, "escalation:write")) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    const businessId = (session as any)?.user?.businessId || ""

    const parsed = EscalationRuleSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, type, keywords, minOrderValue, notifyVia, notifyUserId, messageTemplate, isActive } = parsed.data

    const rule = await prisma.escalationRule.create({
      data: {
        name,
        type,
        keywords,
        minOrderValue: minOrderValue ? String(minOrderValue) : null,
        notifyVia,
        notifyUserId,
        messageTemplate,
        isActive,
        businessId,
      },
    })

    return NextResponse.json({ rule }, { status: 201, headers: { "X-API-Version": API_VERSION } })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Escalation rules POST error:", err.message)
    return NextResponse.json({ error: "Failed to create escalation rule", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}
