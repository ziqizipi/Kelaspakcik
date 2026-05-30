import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const businessId = (session as any)?.user?.businessId || ""

  // Get intent distribution from recent messages
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const intentCounts = await prisma.message.groupBy({
    by: ["intent"],
    where: {
      conversation: { businessId, deletedAt: null },
      intent: { not: null },
      createdAt: { gte: sevenDaysAgo },
    },
    _count: true,
    orderBy: { _count: { intent: "desc" } },
  })

  const stats = intentCounts.map((ic) => ({
    intent: ic.intent,
    count: ic._count,
  }))

  return NextResponse.json({ stats })
}
