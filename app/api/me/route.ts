import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  businessName: z.string().min(1).optional(),
})

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      mfaEnabled: true,
      business: {
        select: {
          id: true,
          name: true,
          industry: true,
          address: true,
          phone: true,
        },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({ user })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const parsed = UpdateSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const { name, businessName } = parsed.data

  // Update user name
  if (name) {
    await prisma.user.update({
      where: { id: session.userId },
      data: { name },
    })
  }

  // Update business name if provided
  if (businessName) {
    await prisma.business.update({
      where: { id: session.businessId },
      data: { name: businessName },
    })
  }

  return NextResponse.json({ success: true })
}
