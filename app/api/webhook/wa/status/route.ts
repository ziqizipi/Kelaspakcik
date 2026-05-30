import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function mapTwilioStatus(twilioStatus: string): string {
  switch (twilioStatus) {
    case "queued":
    case "sent":
      return "sent"
    case "delivered":
      return "delivered"
    case "read":
      return "read"
    case "failed":
    case "undelivered":
      return "failed"
    default:
      return "sent"
  }
}

/**
 * Twilio status webhook — receives delivery receipts.
 * Twilio sends status updates as POST with: MessageSid, MessageStatus, To, etc.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  let params: Record<string, string>
  try {
    params = Object.fromEntries(new URLSearchParams(rawBody))
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const { MessageSid: msgId, MessageStatus: twilioStatus } = params

  if (!msgId) {
    return NextResponse.json({ status: "ok" }, { status: 200 })
  }

  try {
    await prisma.message.updateMany({
      where: { waMsgId: msgId },
      data: { status: mapTwilioStatus(twilioStatus) },
    })
  } catch (error) {
    console.error("Failed to update message status:", error)
  }

  return NextResponse.json({ status: "ok" }, { status: 200 })
}
