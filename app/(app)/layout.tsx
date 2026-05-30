import { redirect } from "next/navigation"
import { getSession } from "@/auth"
import { SessionProvider } from "@/components/providers/session-provider"
import { SWRProvider } from "@/components/providers/swr-provider"
import { ActiveNavSidebar } from "@/components/layout/active-nav-sidebar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  const user = {
    name: (session as any)?.name || (session as any)?.email?.split("@")[0] || "User",
    email: (session as any)?.email || "",
    role: (session as any)?.role || "staff",
  }

  return (
    <SessionProvider user={user}>
      <SWRProvider>
        <div className="flex h-screen bg-[#fafaf8]">
          <ActiveNavSidebar user={user} />
          {/* Main content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </SWRProvider>
    </SessionProvider>
  )
}