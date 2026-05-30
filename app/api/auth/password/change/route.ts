import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "change-password")
  const { success, remaining, reset } = rateLimit(rateLimitKey, 5, 60 * 1000)
  const headers = {
    "X-RateLimit-Limit": "5",
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

  const session = await auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
  }

  const userId = (session as any).id
  const parsed = ChangePasswordSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400, headers }
    )
  }

  const { currentPassword, newPassword } = parsed.data

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ error: "User not found", code: "NOT_FOUND" }, { status: 404, headers })
  }

  const validPassword = await bcrypt.compare(currentPassword, user.password)
  if (!validPassword) {
    return NextResponse.json(
      { error: "Current password is incorrect", code: "INVALID_PASSWORD" },
      { status: 401, headers }
    )
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  })

  return NextResponse.json(
    { success: true, message: "Password changed successfully." },
    { headers }
  )
}
