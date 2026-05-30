import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { API_VERSION } from "@/lib/api-version"
import { can } from "@/lib/rbac"

const RefreshTokenSchema = z.object({
  authToken: z.string().min(1),
})

// GET — get single Twilio account
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

    const account = await prisma.twilioAccount.findFirst({
      where: { id, businessId },
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

    if (!account) {
      return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404, headers })
    }

    return NextResponse.json({ account }, { headers })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Twilio account GET error:", err.message)
    return NextResponse.json(
      { error: "Failed to fetch Twilio account", code: "INTERNAL_ERROR" },
      { status: 500, headers }
    )
  }
}

// PATCH — update Twilio account (toggle active, update businessName)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rateLimitKey = getRateLimitKey(req, "twilio-accounts-patch")
  const { success, remaining, reset } = rateLimit(rateLimitKey, 30, 60000)
  const headers = {
    "X-RateLimit-Limit": "30",
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

    const existing = await prisma.twilioAccount.findFirst({
      where: { id, businessId },
    })

    if (!existing) {
      return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404, headers })
    }

    const body = await req.json()
    const { isActive, businessName } = body

    const updateData: Record<string, unknown> = {}
    if (isActive !== undefined) updateData.isActive = isActive
    if (businessName !== undefined) updateData.businessName = businessName

    const account = await prisma.twilioAccount.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ account }, { headers })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Twilio account PATCH error:", err.message)
    return NextResponse.json(
      { error: "Failed to update Twilio account", code: "INTERNAL_ERROR" },
      { status: 500, headers }
    )
  }
}

// DELETE — remove Twilio account
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rateLimitKey = getRateLimitKey(req, "twilio-accounts-delete")
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
    if (!can(userRole, "channels:delete")) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    const businessId = (session as any)?.user?.businessId || ""

    const existing = await prisma.twilioAccount.findFirst({
      where: { id, businessId },
    })

    if (!existing) {
      return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404, headers })
    }

    await prisma.twilioAccount.delete({ where: { id } })

    return NextResponse.json({ success: true }, { headers })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Twilio account DELETE error:", err.message)
    return NextResponse.json(
      { error: "Failed to delete Twilio account", code: "INTERNAL_ERROR" },
      { status: 500, headers }
    )
  }
}
