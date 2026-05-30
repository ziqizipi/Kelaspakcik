import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { verifyTOTP, decryptMFASecret } from "@/lib/mfa"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"

const DisableSchema = z.object({
  token: z.string().min(6).max(6),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "mfa-disable")
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

    const parsed = DisableSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 })
    }

    const { token, password } = parsed.data
    const userId = (session as any).id

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Verify TOTP token
    if (!user.mfaSecret) {
      return NextResponse.json({ error: "MFA not configured" }, { status: 400 })
    }

    let decryptedSecret: string
    try {
      decryptedSecret = decryptMFASecret(user.mfaSecret)
    } catch {
      return NextResponse.json({ error: "Invalid MFA secret" }, { status: 500 })
    }

    const validTOTP = verifyTOTP(decryptedSecret, token)
    if (!validTOTP) {
      return NextResponse.json({ error: "Invalid TOTP token" }, { status: 401 })
    }

    // Disable MFA
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaRecoveryCodes: null,
      },
    })

    return NextResponse.json({ success: true }, { headers })
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error)
    console.error("MFA disable error:", err)
    return NextResponse.json({ error: "Failed to disable MFA" }, { status: 500 })
  }
}