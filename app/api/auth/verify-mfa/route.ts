import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifyTOTP, decryptMFASecret } from "@/lib/mfa"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"

/**
 * POST /api/auth/verify-mfa — Verify TOTP code during login flow
 * Accepts { email, code } (6-digit TOTP) and validates against stored MFA secret.
 * After verification, returns success so frontend can redirect to dashboard.
 */
const VerifyMFASchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
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
    const parsed = VerifyMFASchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400, headers }
      )
    }

    const { email, code } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { error: "User not found", code: "NOT_FOUND" },
        { status: 404, headers }
      )
    }

    if (!user.mfaEnabled || !user.mfaSecret) {
      return NextResponse.json(
        { error: "MFA not enabled for this user", code: "MFA_NOT_ENABLED" },
        { status: 400, headers }
      )
    }

    let decryptedSecret: string
    try {
      decryptedSecret = decryptMFASecret(user.mfaSecret)
    } catch {
      return NextResponse.json(
        { error: "Invalid MFA secret", code: "INVALID_SECRET" },
        { status: 500, headers }
      )
    }

    const valid = verifyTOTP(decryptedSecret, code)
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid code. Please try again.", code: "INVALID_CODE" },
        { status: 401, headers }
      )
    }

    // TOTP valid — user has proven their identity.
    return NextResponse.json(
      {
        success: true,
        user: { id: user.id, email: user.email, name: user.name },
      },
      { headers }
    )
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error)
    console.error("MFA verify error:", err)
    return NextResponse.json(
      { error: "Verification failed", code: "INTERNAL_ERROR" },
      { status: 500, headers }
    )
  }
}
