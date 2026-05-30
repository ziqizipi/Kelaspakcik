import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { generateTOTPSecret, generateRecoveryCodes, hashRecoveryCode, encryptMFASecret } from "@/lib/mfa"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"

export async function POST(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "mfa-setup")
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session as any).id

    // Generate TOTP secret
    const rawSecret = generateTOTPSecret()
    const encryptedSecret = encryptMFASecret(rawSecret)

    // Generate recovery codes and hash them
    const plainCodes = generateRecoveryCodes(8)
    const hashedCodes = plainCodes.map(hashRecoveryCode)

    // Store encrypted secret and hashed recovery codes
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: true,
        mfaSecret: encryptedSecret,
        mfaRecoveryCodes: JSON.stringify(hashedCodes),
      },
    })

    // Build otpauth URI for QR code
    const userEmail = (session as any)?.user.email || ""
    const otpauthUri = `otpauth://totp/Balas.ai:${encodeURIComponent(userEmail)}?secret=${rawSecret}&issuer=Balas.ai`

    return NextResponse.json({
      secret: rawSecret,
      otpauthUri,
      recoveryCodes: plainCodes, // Plain text — shown only once
    }, { headers })
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error)
    console.error("MFA setup error:", err)
    return NextResponse.json({ error: "Failed to setup MFA" }, { status: 500 })
  }
}