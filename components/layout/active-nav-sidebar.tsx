"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface User {
  name: string
  email: string
  role: string
}

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    ),
  },
  {
    href: "/conversations",
    label: "Percakapan",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/customers",
    label: "Pelanggan",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/orders",
    label: "Pesanan",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/bulk-message",
    label: "Pesan Massal",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/ai-insights",
    label: "AI Insights",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

const settingsNavItems = [
  {
    href: "/settings",
    label: "Pengaturan",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/settings/team",
    label: "Tim",
    roles: ["owner", "admin"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/settings/billing",
    label: "Tagihan",
    roles: ["owner"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" />
        <path d="M1 10h22" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    ),
  },
]

function NavItem({
  href,
  icon,
  children,
  isActive,
}: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
        isActive
          ? "bg-[#111111] text-white"
          : "text-[#6b6b6b] hover:text-[#111111] hover:bg-[#f5f4f0]"
      }`}
    >
      <span className={isActive ? "text-white" : "text-[#8a8580]"}>{icon}</span>
      {children}
    </Link>
  )
}

export function ActiveNavSidebar({ user }: { user: User }) {
  const pathname = usePathname()

  function isActive(href: string): boolean {
    if (href === "/settings") {
      return pathname === "/settings"
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <aside className="w-60 bg-white border-r border-[#f0ede8] flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#f0ede8]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#3a7a55] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            className="text-base font-semibold text-[#111111]"
            style={{ fontFamily: "Instrument Serif, serif" }}
          >
            BalasBro
          </span>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            isActive={isActive(item.href)}
          >
            {item.label}
          </NavItem>
        ))}
      </nav>

      {/* Settings section */}
      <div className="px-3 py-4 border-t border-[#f0ede8] space-y-0.5">
        {settingsNavItems.map((item) => {
          // Role-based visibility
          if (item.roles) {
            if (!item.roles.includes(user.role)) return null
          }
          return (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              isActive={isActive(item.href)}
            >
              {item.label}
            </NavItem>
          )
        })}
      </div>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-[#f0ede8]">
        <Link
          href="/logout"
          className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#f5f4f0] transition-colors cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-full bg-[#3a7a55] flex items-center justify-center text-white text-xs font-medium">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#111111] truncate">
              {user.name || user.email}
            </p>
            <p className="text-xs text-[#8a8580] truncate capitalize">
              {user.role === "owner"
                ? "Owner"
                : user.role === "admin"
                ? "Admin"
                : "Staff"}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  )
}
