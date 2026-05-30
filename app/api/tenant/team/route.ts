import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { can } from "@/lib/rbac"

const inviteSchema = z.object({ email: z.string().email(), name: z.string(), role: z.string().default("staff") })

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userRole = (session as any)?.user?.role || ""
  if (!can(userRole, "team:read")) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }
  const businessId = (session as any)?.user?.businessId || ""
  const users = await prisma.user.findMany({ where: { businessId }, select: { id: true, email: true, name: true, role: true, createdAt: true } })
  return NextResponse.json({ users })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const businessId = (session as any)?.user?.businessId || ""
  const userRole = (session as any)?.user?.role || ""

  // Role enforcement: only owner/admin can invite team members
  if (userRole !== "owner" && userRole !== "admin") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  const body = await req.json()
  const { email, name, role } = inviteSchema.parse(body)
  const bcrypt = require("bcryptjs")
  const tempPassword = Math.random().toString(36).slice(-8)
  const hashedPassword = await bcrypt.hash(tempPassword, 10)
  const user = await prisma.user.create({ data: { email, name, role, businessId, password: hashedPassword } })
  return NextResponse.json({ user, tempPassword }, { status: 201 })
}