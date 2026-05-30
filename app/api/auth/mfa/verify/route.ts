import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifyTOTP, decryptMFASecret } from "@/lib/mfa"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"

const VerifySchema = z.object({
  token: z.string().min(6).max(6),
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "mfa-verify")
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
    const parsed = VerifySchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 })
    }

    const { token, email } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.mfaEnabled || !user.mfaSecret) {
      return NextResponse.json({ error: "MFA not enabled for this user" }, { status: 400 })
    }

    let decryptedSecret: string
    try {
      decryptedSecret = decryptMFASecret(user.mfaSecret)
    } catch {
      return NextResponse.json({ error: "Invalid MFA secret" }, { status: 500 })
    }

    const valid = verifyTOTP(decryptedSecret, token)
    if (!valid) {
      return NextResponse.json({ error: "Invalid TOTP token" }, { status: 401 })
    }

    // TOTP valid — user has proven their identity.
    // Return success with user data; the frontend will redirect to dashboard.
    // A new session will be established when they next sign in.
    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    }, { headers })
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error)
    console.error("MFA verify error:", err)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}