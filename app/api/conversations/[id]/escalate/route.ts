import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"
import { can } from "@/lib/rbac"

const ManualEscalateSchema = z.object({
  reason: z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limiting
  const rateLimitKey = getRateLimitKey(req, "manual-escalate-post")
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

    const { id } = await params

    const parsed = ManualEscalateSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { reason } = parsed.data

    const conversation = await prisma.conversation.findUnique({ where: { id } })
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found", code: "NOT_FOUND" }, { status: 404 })
    }

    const userBusinessId = (session as any)?.user?.businessId
    if (!userBusinessId) return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    if (conversation.businessId !== userBusinessId) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/ai/escalate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: id, reason: reason || "Manual escalation by staff" })
    }).catch((err) => {
      throw new Error(`Escalation fetch failed: ${err instanceof Error ? err.message : String(err)}`)
    })

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Manual escalate error:", err.message)
    return NextResponse.json({ error: "Failed to escalate conversation", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}