import { auth } from "@/auth"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import type { NextRequest } from "next/server"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlers = (auth.handler() as any)

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
             req.headers.get("x-real-ip") ||
             "unknown"
  const key = `ratelimit:auth:login:${ip}`
  const { success } = rateLimit(key, 10, 15 * 60 * 1000) // 10 attempts per 15 min
  if (!success) {
    return new Response("Too Many Requests", { status: 429 })
  }
  return handlers.POST(req)
}

export const GET = handlers.GET