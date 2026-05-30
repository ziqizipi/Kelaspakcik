import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { createSession, setSessionCookie } from "@/lib/session"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "auth-login")
  const { success, remaining, reset } = rateLimit(rateLimitKey, 10, 15 * 60 * 1000)
  const headers = {
    "X-RateLimit-Limit": "10",
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(reset),
    "X-API-Version": API_VERSION,
  }

  if (!success) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi nanti.", code: "RATE_LIMIT_EXCEEDED" },
      { status: 429, headers }
    )
  }

  try {
    const parsed = LoginSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", code: "VALIDATION_ERROR" },
        { status: 400, headers }
      )
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({
      where: { email },
      include: { business: true },
    })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: "Email atau password salah", code: "INVALID_CREDENTIALS" },
        { status: 401, headers }
      )
    }

    if (user.mfaEnabled) {
      return NextResponse.json({ mfaRequired: true, email }, { status: 200, headers })
    }

    const token = await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      businessId: user.businessId,
    })

    const response = NextResponse.json({ success: true }, { status: 200, headers })
    setSessionCookie(response, token)
    return response
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error)
    console.error("[Login] Error:", err)
    return NextResponse.json(
      { error: "Login gagal", code: "INTERNAL_ERROR" },
      { status: 500, headers }
    )
  }
}