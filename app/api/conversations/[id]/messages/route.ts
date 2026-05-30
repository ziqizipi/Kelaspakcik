import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rateLimitKey = getRateLimitKey(req, "conversation-messages-get")
  const { success, remaining, reset } = rateLimit(rateLimitKey, 100, 60000)
  const headers = {
    "X-RateLimit-Limit": "100",
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

  const { id } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const businessId = (session as any)?.user?.businessId || ""
  const conversation = await prisma.conversation.findFirst({ where: { id, businessId } })
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const messages = await prisma.message.findMany({ where: { conversationId: id }, orderBy: { createdAt: "asc" } })
  return NextResponse.json({ messages }, { headers })
}