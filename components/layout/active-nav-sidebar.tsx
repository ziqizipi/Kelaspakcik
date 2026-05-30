"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface User {
  name: string
  email: string
  role: string
}

const navItems = [
  { href: "/dashboard", icon: "inbox", label: "Kotak Masuk" },
  { href: "/conversations", icon: "chat", label: "Percakapan" },
  { href: "/orders", icon: "shopping_bag", label: "Pesanan" },
  { href: "/customers", icon: "group", label: "Pelanggan" },
  { href: "/bulk-message", icon: "send", label: "Pesan Massal" },
  { href: "/ai-insights", icon: "trending_up", label: "AI Insights" },
  { href: "/settings", icon: "settings", label: "Pengaturan" },
]

export function ActiveNavSidebar({ user }: { user: User }) {
  const pathname = usePathname()

  function isActive(href: string): boolean {
    if (href === "/settings") {
      return pathname === "/settings" || pathname.startsWith("/settings/")
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <aside className="app-sidebar">
      {/* Brand logo */}
      <div className="app-sidebar-brand">
        <Link href="/" className="app-sidebar-brand-name no-underline">
          BalasBro<span>.ai</span>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="app-sidebar-nav">
        <div className="app-sidebar-section-label">Menu Utama</div>
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`app-nav-item ${active ? "active" : ""}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="app-sidebar-footer space-y-0.5">
        <div 
          onClick={() => alert("Pusat Bantuan: Hubungi support@balasbro.ai")} 
          className="app-nav-item"
        >
          <span className="material-symbols-outlined">help_outline</span>
          Pusat Bantuan
        </div>
        
        {/* User Profile / Logout Link */}
        <Link href="/logout" className="app-nav-item text-red-600 hover:bg-red-50 hover:text-red-700">
          <span className="material-symbols-outlined">logout</span>
          Keluar ({user.name})
        </Link>
      </div>
    </aside>
  )
}
