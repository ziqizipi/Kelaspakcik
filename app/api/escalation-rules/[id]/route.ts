import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"
import { can } from "@/lib/rbac"

const UpdateEscalationRuleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(["INTENT", "KEYWORD", "ORDER_VALUE"]).optional(),
  keywords: z.array(z.string()).optional(),
  minOrderValue: z.number().positive().optional().nullable(),
  notifyVia: z.enum(["whatsapp", "email"]).optional(),
  notifyUserId: z.string().optional().nullable(),
  messageTemplate: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

    const rule = await prisma.escalationRule.findFirst({
      where: { id, businessId },
    })

    if (!rule) {
      return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 })
    }

    return NextResponse.json({ rule }, { headers })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Escalation rule GET error:", err.message)
    return NextResponse.json({ error: "Failed to fetch escalation rule", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rateLimitKey = getRateLimitKey(req, "escalation-rules-patch")
  const { success, remaining, reset } = rateLimit(rateLimitKey, 30, 60000)
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

    const existing = await prisma.escalationRule.findFirst({
      where: { id, businessId },
    })

    if (!existing) {
      return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 })
    }

    const parsed = UpdateEscalationRuleSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    const { minOrderValue, ...rest } = parsed.data
    if (minOrderValue !== undefined) updateData.minOrderValue = minOrderValue !== null ? String(minOrderValue) : null
    Object.assign(updateData, rest)

    const rule = await prisma.escalationRule.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ rule }, { headers: { "X-API-Version": API_VERSION } })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Escalation rule PATCH error:", err.message)
    return NextResponse.json({ error: "Failed to update escalation rule", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rateLimitKey = getRateLimitKey(req, "escalation-rules-delete")
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
    if (!can(userRole, "escalation:delete")) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    const businessId = (session as any)?.user?.businessId || ""

    const existing = await prisma.escalationRule.findFirst({
      where: { id, businessId },
    })

    if (!existing) {
      return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 })
    }

    await prisma.escalationRule.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Escalation rule DELETE error:", err.message)
    return NextResponse.json({ error: "Failed to delete escalation rule", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}
