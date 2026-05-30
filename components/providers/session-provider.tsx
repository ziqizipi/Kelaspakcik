"use client"

import { createContext, useContext } from "react"

interface User {
  name: string
  email: string
  role: string
}

interface SessionContextType {
  user: User
  loading: boolean
}

const SessionCtx = createContext<SessionContextType>({
  user: { name: "", email: "", role: "staff" },
  loading: false,
})

export function SessionProvider({
  children,
  user,
}: {
  children: React.ReactNode
  user: { name: string; email: string; role: string }
}) {
  return (
    <SessionCtx.Provider value={{ user, loading: false }}>
      {children}
    </SessionCtx.Provider>
  )
}

export function useSession() {
  return useContext(SessionCtx)
}

export function useRole(): string {
  return useContext(SessionCtx).user.role
}

export function useUser(): User {
  return useContext(SessionCtx).user
}