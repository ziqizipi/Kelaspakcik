import { Redis } from "@upstash/redis"

/* ============ Rate Limit Utilities ============ */

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

/* In-memory fallback store for development / when Redis is not configured */
const IN_MEMORY_STORE = new Map<string, { count: number; resetAt: number }>()

function inMemoryLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const entry = IN_MEMORY_STORE.get(key)

  if (!entry || entry.resetAt < now) {
    IN_MEMORY_STORE.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1, reset: Math.ceil((now + windowMs) / 1000) }
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, reset: Math.ceil(entry.resetAt / 1000) }
  }

  entry.count++
  return { success: true, remaining: limit - entry.count, reset: Math.ceil(entry.resetAt / 1000) }
}

/* Lazy-initialized Redis client — null when env vars are missing */
let _redisClient: Redis | null = null
function getRedisClient(): Redis | null {
  if (_redisClient) return _redisClient
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  _redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  return _redisClient
}

/**
 * Sync version — uses in-memory store only (safe for all callers).
 * For Redis-backed rate limiting with proper distributed counting, use rateLimitAsync.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  return inMemoryLimit(key, limit, windowMs)
}

/**
 * Async version — uses Upstash Redis for distributed rate limiting.
 * Falls back to in-memory store when Redis is unavailable.
 */
export async function rateLimitAsync(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const redis = getRedisClient()
  const nowMs = Date.now()
  const windowSec = Math.ceil(windowMs / 1000)

  if (!redis) {
    return inMemoryLimit(key, limit, windowMs)
  }

  const count = await redis.incr(key)
  await redis.expire(key, windowSec)
  const resetAt = nowMs + windowMs

  if (count > limit) {
    return { success: false, remaining: 0, reset: Math.ceil(resetAt / 1000) }
  }

  return {
    success: true,
    remaining: limit - count,
    reset: Math.ceil(resetAt / 1000),
  }
}

export function getRateLimitKey(req: Request, category: string): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  return `ratelimit:${category}:${ip}`
}

export function getRateLimitKeySession(userId: string, category: string): string {
  return `ratelimit:${category}:${userId}`
}
