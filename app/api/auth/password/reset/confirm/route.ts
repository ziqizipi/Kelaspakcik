/**
 * Password reset confirmation handler.
 * Validates the signed token and updates the password.
 */
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"

const ResetConfirmSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "password-reset-confirm")
  const { success } = rateLimit(rateLimitKey, 5, 15 * 60 * 1000) // 5 per 15 min
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded", code: "RATE_LIMIT_EXCEEDED" },
      { status: 429 }
    )
  }

  const parsed = ResetConfirmSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { token, newPassword } = parsed.data

  // Hash the token to compare against stored hash
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

  // Find user with matching reset token
  const users = await prisma.user.findMany({
    where: {
      mfaRecoveryCodes: { not: "" },
    },
  })

  let targetUser = null
  for (const user of users) {
    try {
      const storedData = JSON.parse(user.mfaRecoveryCodes || "{}")
      if (
        storedData.type === "password_reset" &&
        storedData.token === hashedToken &&
        storedData.expiresAt > Date.now()
      ) {
        targetUser = user
        break
      }
    } catch {
      // Not valid JSON, skip
    }
  }

  if (!targetUser) {
    return NextResponse.json(
      { error: "Invalid or expired reset token", code: "INVALID_TOKEN" },
      { status: 400 }
    )
  }

  // Update password and clear reset token
  const hashedPassword = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: targetUser.id },
    data: {
      password: hashedPassword,
      mfaRecoveryCodes: null, // Clear reset token
    },
  })

  console.log(`[password_reset] Password reset completed for user: ${targetUser.email}`)

  return NextResponse.json({ success: true })
}