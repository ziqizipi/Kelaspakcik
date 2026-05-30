import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { createSession, setSessionCookie } from "@/lib/session"
import { API_VERSION } from "@/lib/api-version"

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  businessName: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const parsed = RegisterSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.flatten() },
        { status: 400, headers: { "X-API-Version": API_VERSION } }
      )
    }

    const { name, email, password, businessName } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409, headers: { "X-API-Version": API_VERSION } }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const business = await prisma.business.create({
      data: { name: businessName },
    })

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "owner",
        businessId: business.id,
      },
    })

    const token = await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      businessId: user.businessId,
    })

    const response = NextResponse.json(
      { success: true },
      { status: 201, headers: { "X-API-Version": API_VERSION } }
    )
    setSessionCookie(response, token)
    return response
  } catch (error) {
    console.error("[Register] Error:", error)
    return NextResponse.json(
      { error: "Registrasi gagal" },
      { status: 500, headers: { "X-API-Version": API_VERSION } }
    )
  }
}