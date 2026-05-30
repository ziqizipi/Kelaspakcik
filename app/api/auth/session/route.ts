/**
 * GET /api/auth/session — get active session (Neon Auth only)
 * POST /api/auth/session — sign out and redirect to /
 */
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

export async function GET(_req: NextRequest) {
  const session = await auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
  }
  return NextResponse.json({
    user: {
      id: (session as any).id,
      name: (session as any).name,
      email: (session as any).email,
    },
  })
}

export async function POST(req: NextRequest) {
  await auth.signOut()
  return NextResponse.redirect(new URL("/", req.url))
}