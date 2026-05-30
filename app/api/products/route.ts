import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const businessId = (session as any)?.user?.businessId || ""

  const products = await prisma.product.findMany({
    where: { businessId },
    select: {
      id: true,
      name: true,
      sku: true,
      description: true,
      price: true,
      qty: true,
      imageUrl: true,
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json({ products })
}
