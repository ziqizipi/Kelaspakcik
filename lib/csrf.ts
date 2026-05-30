/**
 * CSRF protection utilities.
 * NextAuth v5 handles CSRF automatically on all API routes via double-submit cookie.
 * Use these utilities for additional CSRF enforcement on specific endpoints.
 */
import crypto from "crypto"

const CSRF_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || ""
const CSRF_COOKIE_NAME = "csrf_token"
const CSRF_HEADER_NAME = "x-csrf-token"

/**
 * Generate a signed CSRF token.
 * The token is signed with the AUTH_SECRET to prevent tampering.
 */
export function generateCSRFToken(sessionId: string): string {
  const payload = `${sessionId}:${Date.now()}`
  const signature = crypto.createHmac("sha256", CSRF_SECRET).update(payload).digest("hex")
  return Buffer.from(`${payload}:${signature}`).toString("base64url")
}

/**
 * Verify a CSRF token.
 * Returns true if valid, false otherwise.
 */
export function verifyCSRFToken(token: string, sessionId: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8")
    const parts = decoded.split(":")
    if (parts.length !== 3) return false

    const [sid, timestamp, signature] = parts
    if (sid !== sessionId) return false

    // Re-compute signature and compare
    const payload = `${sid}:${timestamp}`
    const expectedSig = crypto.createHmac("sha256", CSRF_SECRET).update(payload).digest("hex")
    if (signature !== expectedSig) return false

    // Token valid for 1 hour
    const ageMs = Date.now() - parseInt(timestamp)
    if (ageMs > 60 * 60 * 1000) return false

    return true
  } catch {
    return false
  }
}

/**
 * Extract CSRF token from request headers.
 */
export function getCSRFTokenFromRequest(req: Request): string | null {
  return req.headers.get(CSRF_HEADER_NAME) || null
}

/**
 * Validate request has valid CSRF token.
 * Use this in state-changing API route handlers.
 */
export function validateCSRFFromRequest(req: Request, sessionId: string): boolean {
  const token = getCSRFTokenFromRequest(req)
  if (!token) return false
  return verifyCSRFToken(token, sessionId)
}