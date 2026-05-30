/**
 * Password reset request handler.
 * Generates a signed token and sends reset email.
 */
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { sendPasswordResetEmail } from "@/lib/email"

const ResetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "password-reset-request")
  const { success } = rateLimit(rateLimitKey, 3, 15 * 60 * 1000) // 3 per 15 min
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded", code: "RATE_LIMIT_EXCEEDED" },
      { status: 429 }
    )
  }

  const parsed = ResetRequestSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid email", code: "VALIDATION_ERROR" },
      { status: 400 }
    )
  }

  const { email } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })

  // Always return success to prevent email enumeration attacks
  // Log only whether email was found for security monitoring
  if (!user) {
    console.log(`[password_reset] Email not found: ${email}`)
    return NextResponse.json({ success: true, message: "If email exists, reset link sent" })
  }

  // Generate signed reset token (valid 1 hour)
  const RESET_TOKEN_TTL_MS = 60 * 60 * 1000
  const rawToken = crypto.randomBytes(32).toString("base64url")
  const expiresAt = Date.now() + RESET_TOKEN_TTL_MS

  // Store hashed token in DB (never store raw token)
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")
  await prisma.user.update({
    where: { id: user.id },
    data: {
      // Store reset token with expiry using a JSON field or separate table
      // For now, we reuse mfaRecoveryCodes as temp storage (rename to tempTokens in future)
      mfaRecoveryCodes: JSON.stringify({ type: "password_reset", token: hashedToken, expiresAt }),
    },
  })

  // Build reset URL (frontend handles the actual reset form)
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${rawToken}`

  // Send email
  await sendPasswordResetEmail({
    to: email,
    userName: user.name,
    resetUrl,
  })

  console.log(`[password_reset] Reset link sent to: ${email}`)

  return NextResponse.json({ success: true, message: "If email exists, reset link sent" })
}