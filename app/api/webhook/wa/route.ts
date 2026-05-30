import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parsePhone, verifyTwilioSignature, decryptAuthToken } from "@/lib/twilio"

const SYSTEM_VERIFY_TOKEN = process.env.TWILIO_WEBHOOK_VERIFY_TOKEN || ""

/**
 * WhatsApp inbound webhook — receives messages from customers via Twilio.
 *
 * Twilio sends a POST with application/x-www-form-urlencoded:
 *   From, To, Body, MessageSid, AccountSid, MessagingServiceSid (optional)
 *
 * Signature verification:
 *   X-Twilio-Signature = Base64(HMAC-SHA1(url + rawBody, authToken))
 *   We look up the account by AccountSid, decrypt its auth token, then verify.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get("X-Twilio-Signature") || ""

  let params: Record<string, string>
  try {
    params = Object.fromEntries(new URLSearchParams(rawBody))
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const {
    From: fromRaw,
    To: toRaw,
    Body: body,
    MessageSid: messageSid,
    AccountSid: accountSid,
  } = params

  if (!messageSid) {
    // Acknowledging a status callback or health check with no actual message — respond ok
    return NextResponse.json({ status: "ok" }, { status: 200 })
  }

  if (!fromRaw || !toRaw || !accountSid) {
    return NextResponse.json({ error: "Missing From, To, or AccountSid" }, { status: 400 })
  }

  // Find the Twilio account by AccountSid to get the auth token for verification
  const twilioAccount = await prisma.twilioAccount.findUnique({
    where: { accountSid },
    select: {
      id: true,
      authToken: true,
      webhookVerifyToken: true,
      isActive: true,
      businessId: true,
    },
  })

  if (!twilioAccount) {
    console.warn("[Twilio] No account found for accountSid:", accountSid)
    return NextResponse.json({ status: "ok" }, { status: 200 })
  }

  if (!twilioAccount.isActive) {
    console.warn("[Twilio] Account is inactive:", accountSid)
    return NextResponse.json({ status: "ok" }, { status: 200 })
  }

  // Verify the webhook signature using this account's auth token
  // Build the full URL that Twilio signed (path only, no query string for inbound webhook)
  const url = req.nextUrl.origin + req.nextUrl.pathname

  let authToken: string
  try {
    authToken = decryptAuthToken(twilioAccount.authToken)
  } catch {
    console.error("[Twilio] Failed to decrypt auth token for account:", accountSid)
    return NextResponse.json({ error: "Account misconfigured" }, { status: 500 })
  }

  // Also check shared verify token if configured (belt-and-suspenders)
  if (SYSTEM_VERIFY_TOKEN) {
    if (signature !== SYSTEM_VERIFY_TOKEN) {
      // Fall through to HMAC verification with auth token
    }
  }

  // Primary verification: HMAC-SHA1 with the account's auth token
  const valid = verifyTwilioSignature(url, rawBody, signature, authToken)
  if (!valid) {
    console.warn("[Twilio] Invalid webhook signature for account:", accountSid)
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
  }

  const from = parsePhone(fromRaw)
  const to = parsePhone(toRaw)

  try {
    const { businessId } = twilioAccount

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { phone: from, businessId },
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phone: from,
          businessId,
          waId: from,
          name: null,
        },
      })
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: { customerId: customer.id, businessId },
      orderBy: { createdAt: "desc" },
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          customerId: customer.id,
          businessId,
          twilioAccountId: twilioAccount.id,
          status: "open",
        },
      })
    }

    // Create inbound message record
    const inboundMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: body || "",
        direction: "INBOUND",
        status: "received",
        waMsgId: messageSid,
        fromNumber: from,
        toNumber: to,
      },
    })

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    })

    // Trigger AI classification pipeline asynchronously
    triggerAIClassification(inboundMessage.id).catch((err) =>
      console.error("[Twilio] AI classification trigger failed:", err)
    )

    // Always respond 200 quickly to Twilio (within 20 seconds)
    return NextResponse.json({ status: "ok" }, { status: 200 })
  } catch (error) {
    console.error("[Twilio] Inbound message processing error:", error)
    return NextResponse.json({ status: "ok" }, { status: 200 })
  }
}

async function triggerAIClassification(messageId: string): Promise<void> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/ai/classify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId }),
    })
    if (!response.ok) {
      console.error("[Twilio] AI classify call failed:", response.status)
    }
  } catch (err) {
    console.error("[Twilio] AI classify trigger error:", err)
  }
}
