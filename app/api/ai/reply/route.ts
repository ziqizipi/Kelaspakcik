// Balas.ai — Customer Response & Order Handling Platform
// WhatsApp-first AI-powered platform for Indonesian MSMEs

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"
import { generateWithCircuitBreaker } from "@/lib/gemini"
import { sendWhatsAppMessage, getDecryptedTwilioAccount } from "@/lib/twilio"
import type { Prisma } from "@prisma/client"
import { logger } from "@/lib/logger"
import { can } from "@/lib/rbac"

const ReplySchema = z.object({
  messageId: z.string().min(1),
})

const AUTO_REPLY_PROMPT = `Kamu adalah AI customer service untuk Balas.ai - platform response WhatsApp UMKM Indonesia.

Nama bisnis: {businessName}
Tone: {tone} (friendly/formal/casual)
SOP: {sopContext}

Aturan:
- Balas dalam Bahasa Indonesia yang natural, bukan template
- Jangan terlalu formal, sound like manusia
- Kalau tidak tahu produk, bilang "Sebentar kami cek dulu ya"
- Kalau ORDER, arahkan ke follow up dengan manusia
- Maksimal 160 karakter per pesan (batas WA)

Konteks percakapan:
{conversationHistory}

Pesan customer: "{messageContent}"

Balas:`

async function getConversationHistory(conversationId: string, limit = 5): Promise<string> {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { content: true, direction: true },
  })
  return messages
    .reverse()
    .map((m) => `${m.direction === "INBOUND" ? "Customer" : "Bot"}: ${m.content}`)
    .join("\n")
}

async function getBusinessContext(businessId: string) {
  const config = await prisma.aIAutoReplyConfig.findUnique({
    where: { businessId },
  })
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  })
  const products = await prisma.product.findMany({
    where: { businessId },
    take: 10,
    select: { name: true, price: true, qty: true },
  })
  return { config, business, products }
}

export async function POST(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "reply-post")
  const { success, remaining, reset } = rateLimit(rateLimitKey, 50, 60000)
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded", code: "RATE_LIMIT_EXCEEDED" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
          "X-API-Version": API_VERSION,
        },
      }
    )
  }

  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }
    const userRole = (session as any)?.user?.role || ""
    if (!can(userRole, "ai:write")) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    const parsed = ReplySchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { messageId } = parsed.data

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: { include: { customer: true } } },
    })

    if (!message) {
      return NextResponse.json({ error: "Message not found", code: "NOT_FOUND" }, { status: 404 })
    }

    const userBusinessId = (session as any)?.user?.businessId
    if (!userBusinessId) return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    if (message.conversation.businessId !== userBusinessId) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    if (message.aiReplyUsed || message.repliedBy) {
      return NextResponse.json({ alreadyReplied: true })
    }

    // Get WhatsApp account with decrypted access token
    const waAccount = await getDecryptedTwilioAccount({ businessId: message.conversation.businessId })
    if (!waAccount) {
      return NextResponse.json({ error: "Twilio account not found", code: "NOT_FOUND" }, { status: 404 })
    }

    const { config, business, products } = await getBusinessContext(message.conversation.businessId)

    if (!config?.isEnabled) {
      return NextResponse.json({ aiDisabled: true })
    }

    if (config.workingHours) {
      const hours = config.workingHours as { start: string; end: string; timezone?: string }
      const now = new Date()
      const hour = now.getHours()
      const [start, end] = [hours.start, hours.end].map((t) => parseInt(t.split(":")[0]) || 0)
      if (hour < start || hour > end) {
        return NextResponse.json({ outsideWorkingHours: true })
      }
    }

    const history = await getConversationHistory(message.conversationId)

    const productList = products
      .map((p) => `- ${p.name}: Rp${Number(p.price).toLocaleString()} (stok: ${p.qty})`)
      .join("\n")

    const fullPrompt = AUTO_REPLY_PROMPT.replace("{businessName}", business?.name || "Bisnis")
      .replace("{tone}", config?.tone || "friendly")
      .replace(
        "{sopContext}",
        config?.sopContext
          ? `${config.sopContext}\n\nProduk:\n${productList || "Tidak ada produk"}`
          : "Balas dengan ramah dan helpful"
      )
      .replace("{conversationHistory}", history || "Tidak ada percakapan sebelumnya")
      .replace("{messageContent}", message.content)

    const result = await generateWithCircuitBreaker(fullPrompt)

    const aiReply =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ""

    if (!aiReply) {
      return NextResponse.json({ error: "No reply generated", code: "AI_ERROR" }, { status: 500 })
    }

    if (!message.fromNumber) {
      return NextResponse.json({ error: "Message has no fromNumber", code: "INVALID_MESSAGE" }, { status: 400 })
    }

    const sent = await sendWhatsAppMessage(message.fromNumber, aiReply, waAccount)

    await prisma.message.create({
      data: {
        conversationId: message.conversationId,
        direction: "OUTBOUND",
        content: aiReply,
        waMsgId: sent.waMsgId,
        status: "sent",
        aiReplyUsed: false,
        repliedBy: null,
      },
    })

    await prisma.message.update({
      where: { id: messageId },
      data: { aiReplyUsed: true },
    })

    return NextResponse.json({ success: true, reply: aiReply })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error("Auto-reply error", { error: err.message })
    return NextResponse.json({ error: "Failed to generate reply", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "reply-get")
  const { success, remaining, reset } = rateLimit(rateLimitKey, 10, 60000)
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded", code: "RATE_LIMIT_EXCEEDED" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
          "X-API-Version": API_VERSION,
        },
      }
    )
  }

  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }
    const userRole = (session as any)?.user?.role || ""
    if (!can(userRole, "ai:write")) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    const businessId = (session as any)?.user?.businessId || ""

    const pendingMessages = await prisma.message.findMany({
      where: {
        direction: "INBOUND",
        aiReplyUsed: false,
        repliedBy: null,
        intent: { not: null },
        conversation: { businessId },
      },
      include: { conversation: true },
      take: 10,
    })

    const results = []
    for (const msg of pendingMessages) {
      fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/ai/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId: msg.id }),
        }
      ).catch((err) =>
        logger.error("Auto-reply trigger failed", { error: err instanceof Error ? err.message : String(err) })
      )
      results.push(msg.id)
    }

    return NextResponse.json({ processed: results.length, messageIds: results })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error("Auto-reply GET error", { error: err.message })
    return NextResponse.json({ error: "Failed to process messages", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}