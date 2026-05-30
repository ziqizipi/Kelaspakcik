import { createNeonAuth } from "@neondatabase/auth/next/server"

const neonAuth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL ?? "https://auth.neon.tech",
  cookies: {
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET!,
    sessionDataTtl: 30 * 24 * 60 * 60,
  },
})

export const auth = neonAuth
export const handler = neonAuth.handler

// Fix: getSession returns the actual session data
export async function getSession() {
  try {
    return await neonAuth.getSession()
  } catch {
    return null
  }
}