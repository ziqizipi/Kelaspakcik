import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"
import { can } from "@/lib/rbac"
import { encryptAuthToken } from "@/lib/twilio"

const TwilioAccountSchema = z.object({
  accountSid: z.string().min(1),
  authToken: z.string().min(1),
  whatsappNumber: z.string().min(1),
  messagingServiceSid: z.string().optional(),
  businessName: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "twilio-accounts-get")
  const { success, remaining, reset } = rateLimit(rateLimitKey, 60, 60000)
  const headers = {
    "X-RateLimit-Limit": "60",
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
    if (!can(userRole, "channels:read")) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    const businessId = (session as any)?.user?.businessId || ""

    const accounts = await prisma.twilioAccount.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        accountSid: true,
        whatsappNumber: true,
        messagingServiceSid: true,
        businessName: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ accounts }, { headers })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Twilio accounts GET error:", err.message)
    return NextResponse.json({ error: "Failed to fetch Twilio accounts", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "twilio-accounts-post")
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

    const parsed = TwilioAccountSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400, headers }
      )
    }

    const { accountSid, authToken, whatsappNumber, messagingServiceSid, businessName } = parsed.data

    // Check if accountSid already registered
    const existing = await prisma.twilioAccount.findUnique({ where: { accountSid } })
    if (existing) {
      return NextResponse.json(
        { error: "Twilio account already registered", code: "ALREADY_EXISTS" },
        { status: 409, headers }
      )
    }

    // Encrypt the auth token before storing
    const encryptedToken = encryptAuthToken(authToken)

    const account = await prisma.twilioAccount.create({
      data: {
        accountSid,
        authToken: encryptedToken,
        whatsappNumber,
        messagingServiceSid: messagingServiceSid || null,
        businessName,
        businessId,
      },
      select: {
        id: true,
        accountSid: true,
        whatsappNumber: true,
        messagingServiceSid: true,
        businessName: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ account }, { status: 201, headers })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Twilio accounts POST error:", err.message)
    return NextResponse.json(
      { error: "Failed to add Twilio account", code: "INTERNAL_ERROR" },
      { status: 500, headers }
    )
  }
}
