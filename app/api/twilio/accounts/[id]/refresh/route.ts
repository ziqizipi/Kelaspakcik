import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"
import { can } from "@/lib/rbac"
import { getDecryptedTwilioAccount } from "@/lib/twilio"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rateLimitKey = getRateLimitKey(req, "twilio-refresh-post")
  const { success, remaining, reset } = rateLimit(rateLimitKey, 10, 60000)
  const headers = {
    "X-RateLimit-Limit": "10",
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

    const userRole = (session as any)?.user?.role || ""
    if (!can(userRole, "channels:write")) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    const businessId = (session as any)?.user?.businessId || ""

    const account = await prisma.twilioAccount.findFirst({
      where: { id, businessId },
    })

    if (!account) {
      return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404, headers })
    }

    const decrypted = await getDecryptedTwilioAccount({ id })
    if (!decrypted) {
      return NextResponse.json(
        { error: "Failed to decrypt auth token", code: "TOKEN_ERROR" },
        { status: 500, headers }
      )
    }

    // Test the Twilio API — verify credentials are valid
    const auth = Buffer.from(`${decrypted.accountSid}:${decrypted.authToken}`).toString("base64")
    const twilioRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${decrypted.accountSid}.json`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!twilioRes.ok) {
      const err = await twilioRes.json().catch(() => ({}))
      return NextResponse.json(
        {
          error: "Twilio credentials invalid or expired. Please reconnect your account.",
          code: "TOKEN_EXPIRED",
        },
        { status: 401, headers }
      )
    }

    const twilioData = await twilioRes.json()

    return NextResponse.json({
      success: true,
      message: "Twilio connection is active",
      accountSid: account.accountSid,
      whatsappNumber: account.whatsappNumber,
      friendlyName: twilioData.friendlyName || null,
    })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Twilio refresh error:", err.message)
    return NextResponse.json(
      { error: "Failed to refresh Twilio connection", code: "INTERNAL_ERROR" },
      { status: 500, headers }
    )
  }
}
