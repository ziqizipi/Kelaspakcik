"use client"

import { useState, useEffect } from "react"
import { Save, Upload, Loader2, CheckCircle2, Camera } from "lucide-react"
import useSWR from "swr"
import { Card } from "@/components/design-system"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  business: {
    id: string
    name: string
    industry: string | null
    address: string | null
    phone: string | null
  }
}

export default function ProfilePage() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState("")
  const [saveType, setSaveType] = useState<"success" | "error" | "">("")

  const { data, isLoading } = useSWR<{ user: UserProfile }>("/api/me", fetcher)

  useEffect(() => {
    if (data?.user) {
      setName(data.user.name)
      setPhone(data.user.phone || "")
      setBusinessName(data.user.business.name)
    }
  }, [data])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg("")
    setSaveType("")

    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, businessName }),
      })
      if (res.ok) {
        setSaveMsg("Perubahan berhasil disimpan")
        setSaveType("success")
      } else {
        setSaveMsg("Gagal menyimpan perubahan")
        setSaveType("error")
      }
    } catch {
      setSaveMsg("Terjadi kesalahan jaringan")
      setSaveType("error")
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-[#8a8580]" />
      </div>
    )
  }

  const user = data?.user

  return (
    <div className="min-h-screen bg-[#fafaf8] p-6">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1
            className="text-2xl font-semibold text-[#111111]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Profil
          </h1>
          <p className="text-sm text-[#8a8580] mt-0.5">
            Kelola informasi akun dan bisnis Anda
          </p>
        </div>

        {saveMsg && (
          <div
            className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
              saveType === "success"
                ? "bg-[#dcfce7] border border-[#bbf7d0] text-[#16a34a]"
                : "bg-[#fee2e2] border border-[#fecaca] text-[#dc2626]"
            }`}
          >
            {saveType === "success" && <CheckCircle2 size={16} />}
            {saveMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar */}
          <Card>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-[#3a7a55]/10 flex items-center justify-center text-[#3a7a55] text-2xl font-semibold">
                  {(user?.name || "?")[0].toUpperCase()}
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#3a7a55] text-white flex items-center justify-center shadow-sm hover:bg-[#1a5e3a] transition-colors"
                >
                  <Camera size={12} />
                </button>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111111]">{user?.name}</p>
                <p className="text-xs text-[#8a8580] capitalize">{user?.role}</p>
                <button
                  type="button"
                  className="text-xs text-[#3a7a55] hover:text-[#1a5e3a] font-medium mt-1 transition-colors"
                >
                  Ganti foto
                </button>
              </div>
            </div>
          </Card>

          {/* Personal Info */}
          <Card>
            <h2 className="text-sm font-semibold text-[#111111] mb-4">Informasi Personal</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email ?? ""}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#f0ede8] text-[#8a8580] text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                    No. Telepon
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 xxx"
                    className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user?.role ?? ""}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#f0ede8] text-[#8a8580] text-sm capitalize cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Business Info */}
          <Card>
            <h2 className="text-sm font-semibold text-[#111111] mb-4">Informasi Bisnis</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                  Nama Bisnis
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                  Industri
                </label>
                <input
                  type="text"
                  value={user?.business.industry ?? ""}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#f0ede8] text-[#8a8580] text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                  Alamat
                </label>
                <input
                  type="text"
                  value={user?.business.address ?? ""}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#f0ede8] text-[#8a8580] text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                  Telepon Bisnis
                </label>
                <input
                  type="text"
                  value={user?.business.phone ?? ""}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#f0ede8] text-[#8a8580] text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </Card>

          {/* Save */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-[#3a7a55] hover:bg-[#1a5e3a] disabled:bg-[#f0ede8] text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}