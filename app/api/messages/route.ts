import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { validateCSRFFromRequest } from "@/lib/csrf"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"

export async function POST(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "messages-post")
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

  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // CSRF validation (NextAuth covers most routes; this is extra defense)
  const sessionId = (session as any)?.sessionId || ""
  if (!validateCSRFFromRequest(req, sessionId)) {
    return NextResponse.json({ error: "Invalid CSRF token", code: "CSRF_INVALID" }, { status: 403 })
  }

  const body = await req.json()
  const { conversationId, content, direction = "OUTBOUND", aiReplyUsed = false } = body
  const userId = (session as any).id || ""
  const businessId = (session as any).businessId || ""
  const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, businessId, deletedAt: null } })
  if (!conversation) return NextResponse.json({ error: "Not found or access denied", code: "FORBIDDEN" }, { status: 403 })
  const message = await prisma.message.create({
    data: { conversationId, content, direction, repliedBy: direction === "OUTBOUND" ? userId : null, aiReplyUsed: direction === "OUTBOUND" ? aiReplyUsed : false }
  })
  await prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } })
  return NextResponse.json({ message }, { status: 201, headers })
}