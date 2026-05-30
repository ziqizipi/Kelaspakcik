import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"
import type { Prisma } from "@prisma/client"
import { sendWhatsAppMessage, getDecryptedTwilioAccount } from "@/lib/twilio"
import { logger } from "@/lib/logger"
import { can } from "@/lib/rbac"

const EscalateSchema = z.object({
  conversationId: z.string().min(1),
  messageId: z.string().optional(),
  reason: z.string().optional(),
})

interface EscalationRule {
  id: string
  businessId: string
  keywords: string[]
  minOrderValue: number | Prisma.Decimal | null
  isActive: boolean
  createdAt: Date
}

interface ConversationForEscalation {
  id: string
  businessId: string
  status: string
  customer: { name: string | null; phone: string }
}

interface MessageForEscalation {
  id: string
  content: string
  direction: string
  conversationId: string
}

async function getEscalationConfig(businessId: string) {
  const rules: EscalationRule[] = await prisma.escalationRule.findMany({
    where: { businessId, isActive: true }
  })
  const config = await prisma.aIAutoReplyConfig.findUnique({
    where: { businessId }
  })
  const owner = await prisma.user.findFirst({
    where: { businessId, role: "owner" }
  })
  return { rules, config, owner }
}

function shouldEscalate(content: string, intent: string, rules: EscalationRule[], orderAmount?: number): boolean {
  // COMPLAINT always escalates
  if (intent === "COMPLAINT") return true

  // Check keyword rules
  for (const rule of rules) {
    if (rule.keywords && rule.keywords.length > 0) {
      const lowerContent = content.toLowerCase()
      for (const keyword of rule.keywords) {
        if (lowerContent.includes(keyword.toLowerCase())) return true
      }
    }
    // High value order
    if (rule.minOrderValue && orderAmount && Number(orderAmount) >= Number(rule.minOrderValue)) return true
  }

  return false
}

function buildEscalationMessage(conversation: ConversationForEscalation, message: MessageForEscalation, customer: { name: string | null; phone: string }, reason: string): string {
  const content = message?.content || ""
  const preview = content.length > 100
    ? content.substring(0, 100) + "..."
    : content

  return `🚨 [ESCALATION] Balas.ai

📩 Dari: ${customer.name || customer.phone}
🏷️ Alasan: ${reason}
💬 Pesan: "${preview}"
🕐 Waktu: ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}

🔗 Buka percakapan: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/inbox/${conversation.id}`
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitKey = getRateLimitKey(req, "escalate-post")
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

    const parsed = EscalateSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { conversationId, messageId, reason } = parsed.data

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        customer: true,
        business: { include: { users: true } }
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

    // Get Twilio account with decrypted auth token
    const waAccount = await getDecryptedTwilioAccount({ businessId: conversation.businessId })
    if (!waAccount) {
      return NextResponse.json({ error: "Twilio account not found", code: "NOT_FOUND" }, { status: 404 })
    }

    const message = messageId
      ? await prisma.message.findUnique({ where: { id: messageId } })
      : await prisma.message.findFirst({
          where: { conversationId, direction: "INBOUND" },
          orderBy: { createdAt: "desc" }
        })

    if (!message) {
      return NextResponse.json({ error: "Message not found", code: "NOT_FOUND" }, { status: 404 })
    }

    // Get escalation config
    const { config, owner } = await getEscalationConfig(conversation.businessId)

    if (!owner) {
      logger.error("Escalation error: No owner found", {})
      return NextResponse.json({ noOwner: true })
    }

    // Build escalation message
    const escMessage = buildEscalationMessage(
      conversation,
      message,
      conversation.customer,
      reason || "Escalation triggered"
    )

    // Send to owner via WhatsApp using Twilio account
    const sent = await sendWhatsAppMessage(
      waAccount.whatsappNumber,
      escMessage,
      waAccount
    )

    // Update conversation status to escalated
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: "escalated" }
    })

    // Create escalation log (optional future: EscalationLog model)
    logger.error("Escalation sent", { sentAt: new Date().toISOString() })

    return NextResponse.json({
      success: true,
      escalationId: `esc_${Date.now()}`
    })

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error("Escalation error", { error: err.message })
    return NextResponse.json({ error: "Failed to escalate conversation", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}