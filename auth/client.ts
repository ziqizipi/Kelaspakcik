"use client"
import { createAuthClient } from "@neondatabase/auth/next"

// Neon Auth client — uses NEXT_PUBLIC_AUTH_URL as the auth service endpoint
export const authClient = createAuthClient()