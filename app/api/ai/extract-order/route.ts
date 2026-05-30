import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"
import type { Prisma } from "@prisma/client"
import { logger } from "@/lib/logger"
import { can } from "@/lib/rbac"

const ExtractOrderSchema = z.object({
  messageId: z.string().min(1),
})

const EXTRACTION_PROMPT = `Kamu adalah AI order extractor untuk Balas.ai - platform customer response WhatsApp UMKM Indonesia.

Ekstrak informasi pesanan dari pesan chat customer.

Daftar produk yang tersedia:
{productList}

Pesan chat: "{messageContent}"

Jika customer tidak menyebutkan produk yang jelas, tetap ekstrak sesuai yang disebutkan.

Respons JSON:
{
  "items": [{"name": "nama produk", "qty": jumlah, "price": harga_per_unit}],
  "total": total_harga,
  "notes": "catatan tambahan",
  "confidence": 0.0-1.0
}

Jika tidak ada order yang jelas, return:
{"items": [], "total": 0, "notes": "Tidak ada order yang jelas", "confidence": 0}`

async function getProductList(businessId: string): Promise<string> {
  const products = await prisma.product.findMany({
    where: { businessId },
    select: { name: true, price: true }
  })
  if (products.length === 0) return "Tidak ada produk di database"
  return products.map(p => `- ${p.name}: Rp${Number(p.price).toLocaleString()}`).join("\n")
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitKey = getRateLimitKey(req, "extract-order-post")
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
    if (!can(userRole, "ai:write")) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    const parsed = ExtractOrderSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { messageId } = parsed.data

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: { select: { businessId: true, customerId: true } } }
    })

    if (!message) {
      return NextResponse.json({ error: "Message not found", code: "NOT_FOUND" }, { status: 404 })
    }

    const userBusinessId = (session as any)?.user?.businessId
    if (!userBusinessId) return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    if (message.conversation.businessId !== userBusinessId) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    // Check if order already exists for this conversation
    const existingOrder = await prisma.order.findUnique({
      where: { conversationId: message.conversationId }
    })

    if (existingOrder) {
      return NextResponse.json({ alreadyExtracted: true, orderId: existingOrder.id })
    }

    // Get product list for context
    const productList = await getProductList(message.conversation.businessId)

    // Extract order using Gemini
    const { VertexAI } = await import("@google-cloud/vertexai")
    const vertexai = new VertexAI({
      project: process.env.GCP_PROJECT_ID || "balas-ai",
      location: "asia-southeast1"
    })
    const model = vertexai.getGenerativeModel({
      model: "gemini-2.0-flash",
    })

    const fullPrompt = EXTRACTION_PROMPT
      .replace("{productList}", productList)
      .replace("{messageContent}", message.content)

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }]
    })

    const responseText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!responseText) {
      return NextResponse.json({ error: "No response from Gemini", code: "AI_ERROR" }, { status: 500 })
    }

    let extracted: { items: unknown[]; total: number; notes?: string; confidence: number }
    try {
      extracted = JSON.parse(responseText)
    } catch (parseError) {
      logger.error("Failed to parse Gemini response", { error: parseError instanceof Error ? parseError.message : String(parseError) })
      return NextResponse.json({ error: "Failed to parse Gemini response", code: "AI_PARSE_ERROR" }, { status: 500 })
    }

    // Only create order if we have items
    if (extracted.items && extracted.items.length > 0) {
      const order = await prisma.order.create({
        data: {
          conversationId: message.conversationId,
          customerId: message.conversation.customerId,
          businessId: message.conversation.businessId,
          type: "INCOME",
          amount: extracted.total,
          category: "sales",
          description: extracted.notes || null,
          items: extracted.items as Prisma.InputJsonValue,
          paymentStatus: "recorded"
        }
      })

      return NextResponse.json({
        success: true,
        orderId: order.id,
        items: extracted.items as Prisma.InputJsonValue,
        total: extracted.total,
        confidence: extracted.confidence
      })
    }

    return NextResponse.json({
      noOrderDetected: true,
      confidence: extracted.confidence
    })

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error("Order extraction error", { error: err.message })
    return NextResponse.json({ error: "Failed to extract order", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}

// GET - trigger extraction for all ORDER-classified messages that haven't been extracted
export async function GET(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "extract-order-get")
  const { success, remaining, reset } = rateLimit(rateLimitKey, 10, 60000)
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
    if (!can(userRole, "ai:write")) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    const businessId = (session as any)?.user?.businessId || ""

    // Find messages with ORDER intent that haven't been processed, scoped to business
    const pendingMessages = await prisma.message.findMany({
      where: {
        intent: "ORDER",
        direction: "INBOUND",
        conversation: { businessId }
      },
      include: { conversation: { select: { businessId: true } } },
      take: 10
    })

    // For each, check if order already exists
    const results = []
    for (const msg of pendingMessages) {
      const existing = await prisma.order.findUnique({
        where: { conversationId: msg.conversationId }
      })

      if (!existing) {
        // Trigger extraction
        await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/ai/extract-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId: msg.id })
        })
        results.push(msg.id)
      }
    }

    return NextResponse.json({ processed: results.length, messageIds: results })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error("Order extraction GET error", { error: err.message })
    return NextResponse.json({ error: "Failed to process messages", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}