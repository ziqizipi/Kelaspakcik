/**
 * POST /api/auth/logout — sign out via Neon Auth and redirect to /
 */
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  await auth.signOut()
  return NextResponse.redirect(new URL("/", req.url))
}

export async function GET(req: NextRequest) {
  return POST(req)
}