/**
 * Session management utilities.
 * Handles logout-all and session listing.
 */
import { prisma } from "@/lib/prisma"

/**
 * Invalidate all sessions for a user.
 * Call this when user clicks "logout all devices" or changes password.
 */
export async function logoutAllDevices(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  })
}

/**
 * Get active sessions count for a user.
 * Returns basic metadata for session management UI.
 */
export async function getActiveSessionsCount(userId: string): Promise<number> {
  const count = await prisma.session.count({
    where: {
      userId,
      expires: { gt: new Date() },
    },
  })
  return count
}