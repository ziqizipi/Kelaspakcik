"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Inbox, ShoppingBag, Users, Settings } from "lucide-react"

const tabs = [
  { href: "/dashboard", label: "Inbox", icon: Inbox },
  { href: "/orders", label: "Pesanan", icon: ShoppingBag },
  { href: "/customers", label: "Pelanggan", icon: Users },
  { href: "/settings", label: "Pengaturan", icon: Settings },
]

export function BottomTabBar() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[48px] border-t border-[#e5e2dd] bg-white md:hidden">
      {tabs.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex flex-1 flex-col items-center justify-center py-1 text-[10px] font-medium transition-colors ${
            pathname === href ? "text-[#1a5e3a]" : "text-[#999]"
          }`}
        >
          <Icon className="mb-0.5 h-[20px] w-[20px]" />
          {label}
        </Link>
      ))}
    </nav>
  )
}