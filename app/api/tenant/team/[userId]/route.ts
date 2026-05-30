import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { can } from "@/lib/rbac"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userRole = (session as any)?.user?.role || ""
  if (!can(userRole, "team:delete")) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }
  const businessId = (session as any)?.user?.businessId || ""
  const targetUser = await prisma.user.findUnique({ where: { id: userId } })
  if (!targetUser || targetUser.businessId !== businessId) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (targetUser.role === "owner") return NextResponse.json({ error: "Cannot remove owner" }, { status: 403 })
  await prisma.user.delete({ where: { id: userId } })
  return NextResponse.json({ success: true })
}