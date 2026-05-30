import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"

const UpdateConversationSchema = z.object({
  status: z.string().optional(),
  assigneeId: z.string().nullable().optional(),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }

    const { id } = await params

    const conversation = await prisma.conversation.findUnique({
      where: { id, deletedAt: null },
      include: {
        customer: true,
        twilioAccount: { select: { id: true, whatsappNumber: true, businessName: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            content: true,
            direction: true,
            createdAt: true,
            intent: true,
            intentConfidence: true,
            aiReplyUsed: true,
            repliedBy: true
          }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found", code: "NOT_FOUND" }, { status: 404 })
    }

    const userBusinessId = (session as any)?.user?.businessId
    if (!userBusinessId) return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    if (conversation.businessId !== userBusinessId) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    return NextResponse.json({ conversation })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Conversation GET error:", err.message)
    return NextResponse.json({ error: "Failed to fetch conversation", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Rate limiting
  const rateLimitKey = getRateLimitKey(req, "conversations-patch")
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

  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }

    const { id } = await params

    const parsed = UpdateConversationSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400, headers }
      )
    }

    const { status, assigneeId } = parsed.data

    const conversation = await prisma.conversation.findUnique({ where: { id, deletedAt: null } })
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found", code: "NOT_FOUND" }, { status: 404, headers })
    }

    const userBusinessId = (session as any)?.user?.businessId
    if (!userBusinessId) return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403, headers })
    if (conversation.businessId !== userBusinessId) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403, headers })
    }

    const updateData: Record<string, unknown> = {}
    if (status !== undefined) updateData.status = status
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId

    const updated = await prisma.conversation.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ conversation: updated }, { headers })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Conversation PATCH error:", err.message)
    return NextResponse.json({ error: "Failed to update conversation", code: "INTERNAL_ERROR" }, { status: 500, headers })
  }
}