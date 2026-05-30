import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { generateTOTPSecret, generateRecoveryCodes, hashRecoveryCode, encryptMFASecret } from "@/lib/mfa"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"

/**
 * POST /api/auth/mfa/toggle — Enable or disable MFA for the current user.
 * If enabling: returns TOTP secret + QR URI + recovery codes (same as setup).
 * If disabling: clears MFA fields.
 * Note: For production, disabling should require password re-verification via /api/auth/mfa/disable.
 */
export async function POST(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "mfa-toggle")
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
    if (!(session as any).id) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }

    const userId = (session as any).id
    const userEmail = (session as any).email || ""

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "User not found", code: "NOT_FOUND" }, { status: 404 })
    }

    if (user.mfaEnabled) {
      // Disable MFA
      await prisma.user.update({
        where: { id: userId },
        data: {
          mfaEnabled: false,
          mfaSecret: null,
          mfaRecoveryCodes: null,
        },
      })
      return NextResponse.json(
        { enabled: false, message: "MFA has been disabled" },
        { headers }
      )
    } else {
      // Enable MFA — generate new secret and recovery codes
      const rawSecret = generateTOTPSecret()
      const encryptedSecret = encryptMFASecret(rawSecret)
      const plainCodes = generateRecoveryCodes(8)
      const hashedCodes = plainCodes.map(hashRecoveryCode)

      await prisma.user.update({
        where: { id: userId },
        data: {
          mfaEnabled: true,
          mfaSecret: encryptedSecret,
          mfaRecoveryCodes: JSON.stringify(hashedCodes),
        },
      })

      const otpauthUri = `otpauth://totp/BalasBro:${encodeURIComponent(userEmail)}?secret=${rawSecret}&issuer=BalasBro`

      return NextResponse.json(
        {
          enabled: true,
          secret: rawSecret,
          otpauthUri,
          recoveryCodes: plainCodes,
        },
        { headers }
      )
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("MFA toggle error:", err.message)
    return NextResponse.json(
      { error: "Failed to toggle MFA", code: "INTERNAL_ERROR" },
      { status: 500, headers }
    )
  }
}
