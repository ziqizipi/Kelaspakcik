import { NextRequest, NextResponse } from "next/server"
import { auth } from "./auth"

export async function proxy(req: NextRequest) {
  const session = await auth.getSession()

  if (!session) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("redirect", req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl.toString())
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/conversations/:path*",
    "/customers/:path*",
    "/orders/:path*",
    "/settings/:path*",
    "/bulk-message/:path*",
    "/ai-insights/:path*",
    "/add-customer/:path*",
    "/add-order/:path*",
  ],
}