"use client"

import { useState } from "react"
import useSWR from "swr"
import { Eye, EyeOff, Key, Smartphone, Shield, Loader2, CheckCircle2, Monitor, Trash2 } from "lucide-react"
import { Toggle, Card } from "@/components/design-system"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Session {
  id: string
  userAgent: string
  ip: string
  lastActive: string
  isCurrent: boolean
}

interface SessionsResponse {
  sessions: Session[]
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min}m lalu`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}j lalu`
  const d = Math.floor(h / 24)
  return `${d}d lalu`
}

export default function SecurityPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [mfaLoading, setMfaLoading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const { data: meData, mutate } = useSWR<{ user: { mfaEnabled: boolean } }>("/api/me", fetcher)
  const mfaEnabled = meData?.user?.mfaEnabled ?? false

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setPasswordError("")

    if (newPassword.length < 8) {
      setPasswordError("Password minimal 8 karakter")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Password baru tidak cocok")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/password/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Gagal mengubah password")
        return
      }

      setSuccess("Password berhasil diubah")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      setError("Terjadi kesalahan. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleMFA() {
    setMfaLoading(true)
    try {
      await fetch("/api/auth/mfa/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      mutate()
    } finally {
      setMfaLoading(false)
    }
  }

  const { data: sessionsData } = useSWR<SessionsResponse>("/api/me/sessions", fetcher)
  const sessions = sessionsData?.sessions || []

  return (
    <div className="min-h-screen bg-[#fafaf8] p-6">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1
            className="text-2xl font-semibold text-[#111111]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Keamanan
          </h1>
          <p className="text-sm text-[#8a8580] mt-0.5">
            Kelola password dan autentikasi dua faktor
          </p>
        </div>

        {success && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-[#dcfce7] border border-[#bbf7d0] rounded-xl text-sm text-[#16a34a]">
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}

        <div className="space-y-4">
          {/* Change Password */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-[#f0ede8] flex items-center justify-center text-[#8a8580]">
                <Key size={16} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#111111]">Ubah Password</h2>
                <p className="text-xs text-[#8a8580]">Update password secara berkala</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                  Password Saat Ini
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8580] hover:text-[#404942] transition-colors p-1"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 karakter"
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8580] hover:text-[#404942] transition-colors p-1"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Masukkan ulang password baru"
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8580] hover:text-[#404942] transition-colors p-1"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {(passwordError || error) && (
                <div className="bg-[#fee2e2] border border-[#fecaca] rounded-xl px-4 py-3 text-sm text-[#dc2626]">
                  {passwordError || error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#3a7a55] hover:bg-[#1a5e3a] disabled:bg-[#f0ede8] text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? "Mengubah..." : "Ubah Password"}
              </button>
            </form>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-[#f0ede8] flex items-center justify-center text-[#8a8580]">
                <Smartphone size={16} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#111111]">Autentikasi Dua Faktor</h2>
                <p className="text-xs text-[#8a8580]">Tambahkan lapisan keamanan ekstra</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[#f0ede8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#dbeafe] flex items-center justify-center text-[#2563eb]">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#111111]">
                    {mfaEnabled ? "2FA Aktif" : "2FA Nonaktif"}
                  </p>
                  <p className="text-xs text-[#8a8580]">
                    {mfaEnabled
                      ? "Akun dilindungi dengan autentikasi dua faktor"
                      : "Lindungi akun dengan 2FA"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleMFA}
                disabled={mfaLoading}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                  mfaEnabled
                    ? "bg-[#fee2e2] hover:bg-[#fecaca] text-[#dc2626] border border-[#fecaca]"
                    : "bg-[#3a7a55] hover:bg-[#1a5e3a] text-white shadow-sm"
                }`}
              >
                {mfaLoading && <Loader2 size={14} className="animate-spin" />}
                {mfaEnabled ? "Nonaktifkan" : "Aktifkan 2FA"}
              </button>
            </div>
          </Card>

          {/* Active Sessions */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-[#f0ede8] flex items-center justify-center text-[#8a8580]">
                <Monitor size={16} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#111111]">Sesi Aktif</h2>
                <p className="text-xs text-[#8a8580]">Kelola perangkat yang login</p>
              </div>
            </div>

            <div className="space-y-2">
              {sessions.length === 0 ? (
                <p className="text-sm text-[#8a8580] py-4 text-center">Belum ada sesi aktif</p>
              ) : (
                sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="flex items-center justify-between py-3 border-b border-[#f0ede8] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#f0ede8] flex items-center justify-center text-[#8a8580]">
                        <Monitor size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[#111111]">{sess.userAgent}</p>
                          {sess.isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#16a34a] text-xs font-medium">
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#8a8580] mt-0.5">
                          {sess.ip} • {formatRelativeTime(sess.lastActive)}
                        </p>
                      </div>
                    </div>
                    {!sess.isCurrent && (
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[#dc2626] hover:bg-[#fee2e2] transition-colors">
                        <Trash2 size={12} />
                        Cabut
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}