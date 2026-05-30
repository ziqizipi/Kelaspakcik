"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, ArrowRight, Check } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Password tidak cocok")
      return
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter")
      return
    }

    setLoading(true)

    try {
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, businessName }),
      })
      const registerData = await registerRes.json()

      if (!registerRes.ok) {
        setError(registerData.error || "Registrasi gagal")
        setLoading(false)
        return
      }

      router.push("/login?registered=true")
    } catch {
      setError("Terjadi kesalahan. Coba lagi.")
      setLoading(false)
    }
  }

  const benefits = [
    "AI auto-reply 24/7 untuk WhatsApp",
    "Klasifikasi intent pelanggan otomatis",
    "Dashboard analytics real-time",
    "Gratisselama 14 hari, tanpa kartu kredit",
  ]

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#3a7a55] flex items-center justify-center shadow-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
              className="text-2xl font-semibold text-[#111111]"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              BalasBro.ai
            </span>
          </div>
          <p className="text-sm text-[#8a8580]">Buat workspace baru untuk bisnis Anda</p>
        </div>

        {/* Benefits strip */}
        <div className="bg-white rounded-2xl border border-[#e5e2dd] p-4 mb-4 flex items-start gap-3">
          <div className="flex-1 space-y-2">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#dcfce7] flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-[#16a34a]" />
                </div>
                <span className="text-xs text-[#404942]">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#e5e2dd] p-6 shadow-[0_4px_24px_rgba(0,69,38,0.06)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ahmad Wijaya"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ahmad@wijaya.id"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                Nama Bisnis
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Wijaya Elektronik"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 karakter"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8580] hover:text-[#404942] transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                Konfirmasi Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Masukkan ulang password"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
              />
            </div>

            {error && (
              <div className="bg-[#fee2e2] border border-[#fecaca] rounded-xl px-4 py-3 text-sm text-[#dc2626]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#3a7a55] hover:bg-[#1a5e3a] disabled:bg-[#f0ede8] text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Membuat akun...
                </>
              ) : (
                <>
                  Buat Akun
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#8a8580] mt-6">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-[#3a7a55] hover:text-[#1a5e3a] font-semibold transition-colors"
          >
            Masuk di sini
          </Link>
        </p>

        <p className="text-center text-xs text-[#8a8580] mt-4">
          Dengan mendaftar, Anda menyetujui{" "}
          <span className="text-[#3a7a55]">Syarat Layanan</span> dan{" "}
          <span className="text-[#3a7a55]">Kebijakan Privasi</span>
        </p>
      </div>
    </div>
  )
}