import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"
import { logger } from "@/lib/logger"
import { can } from "@/lib/rbac"

const ClassifySchema = z.object({
  messageId: z.string().min(1),
})

const VALID_INTENTS = ["ORDER", "PRODUCT_INQUIRY", "COMPLAINT", "FOLLOW_UP", "GENERAL"] as const
type Intent = (typeof VALID_INTENTS)[number]

const CLASSIFICATION_PROMPT = `Kamu adalah AI classifier untuk Balas.ai - platform customer response WhatsApp untuk UMKM Indonesia. ответ dalam JSON saja, tanpa markdown code block.

Klasifikasikan pesan WA ke salah satu kategori:
- ORDER: Customer mau order / mau beli sesuatu (kata kunci: order, mau, pesan, belinya, mau order)
- PRODUCT_INQUIRY: Customer tanya harga, stok, info produk (kata kunci: harga, stok, ada, berapa, tanya)
- COMPLAINT: Customer komplain atau kecewa (kata kunci: kecewa, tidak puas, refund, rusak, tidak sesuai)
- FOLLOW_UP: Customer follow up pesanan atau conversation sebelumnya (kata kunci: belum, kapan, sudah, tracking)
- GENERAL: Lain-lain

Balas dengan JSON saja (tanpa markdown, tanpa penjelasan lain):
{"intent": "ORDER|PRODUCT_INQUIRY|COMPLAINT|FOLLOW_UP|GENERAL", "confidence": 0.0-1.0, "reasoning": "penjelasan singkat"}

Pesan: "{content}"`

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitKey = getRateLimitKey(req, "classify-post")
  const { success, remaining, reset } = rateLimit(rateLimitKey, 50, 60000)
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded", code: "RATE_LIMIT_EXCEEDED" },
      { status: 429, headers: { "X-RateLimit-Remaining": String(remaining), "X-RateLimit-Reset": String(reset), "X-API-Version": API_VERSION } }
    )
  }

  try {
    const session = await auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }
    const userId = (session as any).id
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, businessId: true },
    })
    if (!user || !can(user.role, "ai:write")) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    const parsed = ClassifySchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { messageId } = parsed.data

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: { select: { businessId: true } } }
    })
    if (!message) {
      return NextResponse.json({ error: "Message not found", code: "NOT_FOUND" }, { status: 404 })
    }

    const userBusinessId = user.businessId
    if (message.conversation.businessId !== userBusinessId) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    // Skip if already classified
    if (message.intent) {
      return NextResponse.json({ intent: message.intent, alreadyClassified: true })
    }

    const { VertexAI } = await import("@google-cloud/vertexai")
    const vertexai = new VertexAI({
      project: process.env.GCP_PROJECT_ID || "balas-ai",
      location: "asia-southeast1",
    })
    const model = vertexai.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: "Kamu classifier pesan WhatsApp. ответ dalam JSON saja, tanpa markdown code block.",
    })

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: CLASSIFICATION_PROMPT.replace("{content}", message.content) },
          ],
        },
      ],
      generationConfig: { responseMimeType: "application/json" },
    })

    const responseText =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!responseText) {
      return NextResponse.json({ error: "No response from Gemini", code: "AI_ERROR" }, { status: 500 })
    }

    let parsed_result: { intent: string; confidence: number; reasoning: string }
    try {
      parsed_result = JSON.parse(responseText)
    } catch {
      return NextResponse.json({ error: "Invalid JSON from Gemini", code: "AI_PARSE_ERROR" }, { status: 500 })
    }

    // Validate intent
    if (!VALID_INTENTS.includes(parsed_result.intent as Intent)) {
      return NextResponse.json(
        { error: `Invalid intent: ${parsed_result.intent}`, code: "INVALID_INTENT" },
        { status: 500 }
      )
    }

    // Update message with classification
    await prisma.message.update({
      where: { id: messageId },
      data: {
        intent: parsed_result.intent as Intent,
        intentConfidence: parsed_result.confidence,
      },
    })

    const nextAuthUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

    // COMPLAINT → escalate conversation + call escalation endpoint
    if (parsed_result.intent === "COMPLAINT") {
      await prisma.conversation.update({
        where: { id: message.conversationId },
        data: { status: "escalated" },
      })

      fetch(`${nextAuthUrl}/api/ai/escalate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: message.conversationId,
          messageId,
          reason: "COMPLAINT intent classified",
        }),
      }).catch((err) => logger.error("Escalation trigger failed", { error: err instanceof Error ? err.message : String(err) }))
    }

    // ORDER → trigger order extraction
    if (parsed_result.intent === "ORDER") {
      fetch(`${nextAuthUrl}/api/ai/extract-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      }).catch((err) => logger.error("Order extraction trigger failed", { error: err instanceof Error ? err.message : String(err) }))
    }

    return NextResponse.json({
      success: true,
      intent: parsed_result.intent,
      confidence: parsed_result.confidence,
      reasoning: parsed_result.reasoning,
    })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error("Classification error", { error: err.message })
    return NextResponse.json({ error: "Failed to classify message", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}

// GET: reprocess all unclassified messages
export async function GET(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "classify-get")
  const { success, remaining, reset } = rateLimit(rateLimitKey, 20, 60000)
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded", code: "RATE_LIMIT_EXCEEDED" },
      { status: 429, headers: { "X-RateLimit-Remaining": String(remaining), "X-RateLimit-Reset": String(reset), "X-API-Version": API_VERSION } }
    )
  }

  try {
    const session = await auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }
    const userId = (session as any).id
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, businessId: true },
    })
    if (!user || !can(user.role, "ai:write")) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200)
    const offset = parseInt(searchParams.get("offset") || "0")

    const businessId = user.businessId
    const where: Record<string, unknown> = {
      intent: null,
      direction: "INBOUND",
      conversation: { businessId },
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: { conversation: { select: { businessId: true } } },
        orderBy: { createdAt: "asc" },
        take: limit,
        skip: offset,
      }),
      prisma.message.count({ where }),
    ])

    if (messages.length === 0) {
      return NextResponse.json({ success: true, processed: 0, total, message: "No unclassified messages found" })
    }

    const { VertexAI } = await import("@google-cloud/vertexai")
    const vertexai = new VertexAI({
      project: process.env.GCP_PROJECT_ID || "balas-ai",
      location: "asia-southeast1",
    })
    const model = vertexai.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: "Kamu classifier pesan WhatsApp. ответ dalam JSON saja, tanpa markdown code block.",
    })

    const nextAuthUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const results: Array<{ messageId: string; intent: string; confidence: number; error?: string }> = []

    for (const message of messages) {
      try {
        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                { text: CLASSIFICATION_PROMPT.replace("{content}", message.content) },
              ],
            },
          ],
          generationConfig: { responseMimeType: "application/json" },
        })

        const responseText =
          result.response?.candidates?.[0]?.content?.parts?.[0]?.text

        if (!responseText) {
          results.push({ messageId: message.id, intent: "", confidence: 0, error: "No response from Gemini" })
          continue
        }

        const parsed_result = JSON.parse(responseText)

        if (!parsed_result || !VALID_INTENTS.includes(parsed_result.intent as Intent)) {
          results.push({ messageId: message.id, intent: "", confidence: 0, error: `Invalid intent: ${parsed_result?.intent}` })
          continue
        }

        await prisma.message.update({
          where: { id: message.id },
          data: {
            intent: parsed_result.intent as Intent,
            intentConfidence: parsed_result.confidence,
          },
        })

        // Trigger side effects
        if (parsed_result.intent === "COMPLAINT") {
          await prisma.conversation.update({
            where: { id: message.conversationId },
            data: { status: "escalated" },
          })
          fetch(`${nextAuthUrl}/api/ai/escalate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              conversationId: message.conversationId,
              messageId: message.id,
              reason: "COMPLAINT intent classified (batch)",
            }),
          }).catch((err) => logger.error("Escalation trigger failed", { error: err instanceof Error ? err.message : String(err) }))
        }

        if (parsed_result.intent === "ORDER") {
          fetch(`${nextAuthUrl}/api/ai/extract-order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messageId: message.id }),
          }).catch((err) => logger.error("Order extraction trigger failed", { error: err instanceof Error ? err.message : String(err) }))
        }

        results.push({ messageId: message.id, intent: parsed_result.intent, confidence: parsed_result.confidence })
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unknown error"
        results.push({ messageId: message.id, intent: "", confidence: 0, error: errMsg })
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.filter((r) => !r.error).length,
      failed: results.filter((r) => r.error).length,
      total,
      offset,
      limit,
      results,
    })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error("Batch classification error", { error: err.message })
    return NextResponse.json({ error: "Failed to classify messages", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}