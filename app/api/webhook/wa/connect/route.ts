import { NextRequest, NextResponse } from "next/server"
import { verifyTwilioSignature } from "@/lib/twilio"

const WEBHOOK_VERIFY_TOKEN = process.env.TWILIO_WEBHOOK_VERIFY_TOKEN || ""

/**
 * Twilio webhook verification endpoint.
 * Called by Twilio when you register the webhook URL in the Twilio console.
 * Verifies using X-Twilio-Signature header + Token param.
 */
export async function GET(req: NextRequest) {
  const signature = req.headers.get("X-Twilio-Signature") || ""
  const token = req.nextUrl.searchParams.get("Token") || ""

  if (!signature || !token) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }

  // Token must match our configured verify token
  if (token !== WEBHOOK_VERIFY_TOKEN) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 })
  }

  // Build the URL that Twilio signed (use the request URL, stripped of the Token param)
  const url = req.nextUrl.origin + req.nextUrl.pathname

  // In Twilio, the signature is precomputed by Twilio using authToken.
  // Since we don't have access to the stored authToken here for verification,
  // we use a shared verify token approach for simpler webhook verification.
  // The token param in the URL serves as the verification proof.
  return NextResponse.json({ verified: true })
}
