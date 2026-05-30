import { Sidebar } from "./sidebar"
import { TopBar } from "./top-bar"
import { BottomTabBar } from "./bottom-tab-bar"

export function AppShell({ children, title, tenantName }: { children: React.ReactNode; title?: string; tenantName?: string }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f5f2]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={title || tenantName} />
        <main className="flex-1 overflow-auto pb-12 md:pb-0">
          <div className="px-16 py-8">
            <div className="w-full max-w-[1200px]">
              {children}
            </div>
          </div>
        </main>
      </div>
      <BottomTabBar />
    </div>
  )
}