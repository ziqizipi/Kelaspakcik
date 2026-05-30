"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Inbox,
  ShoppingBag,
  Users,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Kotak Masuk", icon: Inbox },
  { href: "/orders", label: "Pesanan", icon: ShoppingBag },
  { href: "/customers", label: "Pelanggan", icon: Users },
  { href: "/settings", label: "Pengaturan", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="flex flex-col bg-white border-r border-[#e5e2dd] sticky top-0 h-screen w-[240px] shrink-0"
      style={{ animation: "sidebarIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both" }}
    >
      <style jsx>{`
        @keyframes sidebarIn {
          from {
            opacity: 0;
            transform: translateX(-16px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .app-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #666;
          cursor: pointer;
          transition: all 0.15s;
          margin-bottom: 2px;
          text-decoration: none;
        }
        .app-nav-item:hover {
          background: #f7f5f2;
          color: #111;
        }
        .app-nav-item.active {
          background: #111;
          color: #fff;
          font-weight: 600;
        }
        .app-sidebar-section-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #bbb;
          text-transform: uppercase;
          padding: 0 12px 8px;
        }
      `}</style>

      {/* Brand bar */}
      <div className="flex h-[68px] items-center border-b border-[#e5e2dd] px-6">
        <span className="text-[17px] font-bold text-[#111]">
          BalasBro<span style={{ color: "#25D366" }}>.ai</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="app-sidebar-section-label">Menu Utama</div>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "app-nav-item",
              pathname === href ? "active" : ""
            )}
          >
            <Icon className="h-[19px] w-[19px] shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#e5e2dd] p-3">
        <Link
          href="#"
          className="app-nav-item"
          onClick={(e) => {
            e.preventDefault()
          }}
        >
          <HelpCircle className="h-[19px] w-[19px] shrink-0" />
          Pusat Bantuan
        </Link>
        <Link
          href="/login"
          className="app-nav-item"
        >
          <LogOut className="h-[19px] w-[19px] shrink-0" />
          Keluar
        </Link>
      </div>
    </aside>
  )
}