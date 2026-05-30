import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { API_VERSION } from "@/lib/api-version"

async function verifyQStashRequest(req: NextRequest): Promise<boolean> {
  const signature = req.headers.get("upstash-signature")
  if (!signature) {
    if (process.env.QSTASH_DEV_MODE === "true") return true
    return false
  }
  const key = process.env.QSTASH_CURRENT_SIGNING_KEY || ""
  if (!key) return false

  try {
    const encoder = new TextEncoder()
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(key),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    )
    const body = await req.text()
    const [timestamp, sig] = signature.split(".")
    const data = `${timestamp}.${body}`
    const sigBytes = Uint8Array.from(atob(sig), (c) => c.charCodeAt(0))
    const valid = await crypto.subtle.verify("HMAC", cryptoKey, sigBytes, encoder.encode(data))
    return valid
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const valid = await verifyQStashRequest(req)
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const headers = { "X-API-Version": API_VERSION }

  try {
    const now = new Date()
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Find open conversations with no response in 30+ minutes (potential follow-up needed)
    const staleConversations = await prisma.conversation.findMany({
      where: {
        status: "open",
        deletedAt: null,
        lastMessageAt: { lt: thirtyMinAgo },
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        business: {
          include: {
            twilioAccounts: { where: { isActive: true }, take: 1 },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })

    const results: { conversationId: string; customerName: string | null; action: string }[] = []

    for (const conv of staleConversations) {
      const account = conv.business.twilioAccounts[0]
      if (!account) continue

      // Check if customer has recent orders (follow-up eligible)
      const recentOrders = await prisma.order.count({
        where: {
          customerId: conv.customer.id,
          createdAt: { gte: sevenDaysAgo },
          deletedAt: null,
        },
      })

      if (recentOrders > 0) {
        // Mark conversation as pending for follow-up
        await prisma.conversation.update({
          where: { id: conv.id },
          data: { status: "pending" },
        })

        results.push({
          conversationId: conv.id,
          customerName: conv.customer.name,
          action: "Marked as pending for follow-up",
        })
      }
    }

    return NextResponse.json(
      {
        processed: staleConversations.length,
        actioned: results.length,
        results,
      },
      { headers }
    )
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error)
    console.error("[FollowUp] Error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500, headers })
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const staleConversations = await prisma.conversation.findMany({
    where: { status: "open", deletedAt: null, lastMessageAt: { lt: thirtyMinAgo } },
    include: {
      customer: { select: { id: true, name: true } },
      business: { select: { name: true } },
    },
  })

  const followUpEligible = []
  for (const conv of staleConversations) {
    const recentOrders = await prisma.order.count({
      where: { customerId: conv.customer.id, createdAt: { gte: sevenDaysAgo }, deletedAt: null },
    })
    if (recentOrders > 0) {
      followUpEligible.push({
        id: conv.id,
        customer: conv.customer.name,
        lastMessageAt: conv.lastMessageAt,
        business: conv.business.name,
      })
    }
  }

  return NextResponse.json({
    staleConversations: staleConversations.length,
    followUpEligible: followUpEligible.length,
    details: followUpEligible,
  })
}