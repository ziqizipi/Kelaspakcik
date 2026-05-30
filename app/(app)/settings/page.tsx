"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  User,
  Shield,
  Plug,
  Brain,
  Users,
  CreditCard,
  AlertTriangle,
  BarChart3,
  ChevronRight,
  LogOut,
} from "lucide-react"

const settingsNav = [
  { name: "Profil", href: "/settings/profile", icon: User, description: "Update informasi profil Anda" },
  { name: "Keamanan", href: "/settings/security", icon: Shield, description: "Password dan pengaturan 2FA" },
  { name: "Saluran", href: "/settings/channels", icon: Plug, description: "WhatsApp dan saluran lainnya" },
  { name: "AI & Otomatisasi", href: "/settings/ai", icon: Brain, description: "Auto-reply dan klasifikasi AI" },
  { name: "Tim", href: "/settings/team", icon: Users, description: "Kelola anggota tim" },
  { name: "Tagihan", href: "/settings/billing", icon: CreditCard, description: "Paket dan metode pembayaran" },
  { name: "Aturan Eskalasi", href: "/settings/escalation", icon: AlertTriangle, description: "Aturan eskalasi otomatis" },
  { name: "Laporan", href: "/settings/reports", icon: BarChart3, description: "Analitik dan insight" },
]

export default function SettingsPage() {
  const pathname = usePathname()

  function handleLogout() {
    fetch("/api/auth/logout", { method: "POST" }).then(() => {
      window.location.href = "/"
    })
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] p-6">
      <div className="max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <h1
            className="text-2xl font-semibold text-[#111111]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Pengaturan
          </h1>
          <p className="text-sm text-[#8a8580] mt-0.5">
            Kelola akun dan preferensi workspace Anda
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {settingsNav.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  isActive
                    ? "bg-[#3a7a55]/5 border-[#3a7a55]/20"
                    : "bg-white border-[#e5e2dd] hover:bg-[#f5f4f0] hover:border-[#d1cdc7]"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive
                      ? "bg-[#3a7a55] text-white"
                      : "bg-[#f5f4f0] text-[#3a7a55]"
                  }`}
                >
                  <item.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold ${
                      isActive ? "text-[#3a7a55]" : "text-[#111111]"
                    }`}
                  >
                    {item.name}
                  </p>
                  <p className="text-xs text-[#8a8580] mt-0.5">{item.description}</p>
                </div>
                <ChevronRight size={16} className="text-[#8a8580] flex-shrink-0" />
              </Link>
            )
          })}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-5 py-3 rounded-xl border border-[#fecaca] bg-[#fee2e2] hover:bg-[#fecaca] text-[#dc2626] text-sm font-semibold transition-colors"
        >
          <LogOut size={16} />
          Keluar dari akun
        </button>
      </div>
    </div>
  )
}