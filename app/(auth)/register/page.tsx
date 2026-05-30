"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Kata sandi minimal harus 8 karakter.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, businessName }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Pendaftaran gagal.")
        setLoading(false)
        return
      }

      // Successful registration, redirect to login page
      router.push("/login?registered=true")
    } catch {
      setError("Terjadi kesalahan sistem saat mendaftar.")
      setLoading(false)
    }
  }

  return (
    <div className="auth-root min-h-screen flex flex-col bg-[#f7f5f2]">
      {/* Auth Navigation */}
      <nav className="auth-nav flex justify-between items-center px-8 md:px-14 border-b border-[#e5e2dd] bg-[#f7f5f2]/90 backdrop-blur-md sticky top-0 z-50 h-[68px]">
        <Link href="/" className="auth-nav-logo no-underline text-[#111111] font-bold text-lg">
          BalasBro<span className="text-[#25D366]">.ai</span>
        </Link>
        <Link href="/login" className="auth-nav-link no-underline text-[#111111] font-semibold text-sm border border-[#ccc] px-5 py-2 rounded-lg hover:border-[#111] hover:bg-[#ede9e3] transition-all">
          Masuk
        </Link>
      </nav>

      {/* Main Form Sheet */}
      <main className="auth-main flex-1 flex items-center justify-center py-16 px-6">
        <div className="auth-card bg-white border border-[#e5e2dd] shadow-lg rounded-[20px] p-10 md:p-12 w-full max-w-[460px] animate-scale-up">
          <div className="auth-card-label text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-4 font-sans">
            BalasBro.ai
          </div>
          <h2 className="font-serif text-3xl font-light text-[#111111] mb-2 leading-snug">
            Mulai <em className="not-italic italic text-[#3a7a55]">Otomatisasi</em><br />
            Bisnis Anda.
          </h2>
          <p className="auth-sub text-sm text-gray-500 mb-8 font-sans">
            Langkah pertama menuju efisiensi operasional yang cerdas.
          </p>

          <form onSubmit={handleSubmit} className="auth-form space-y-4">
            {/* Full Name */}
            <div className="form-group flex flex-col gap-1.5">
              <label className="form-label text-xs font-semibold text-[#333]" htmlFor="name">
                Nama Lengkap
              </label>
              <div className="input-wrap relative">
                <span className="material-symbols-outlined input-icon absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                  person
                </span>
                <input
                  type="text"
                  id="name"
                  placeholder="Nama Anda"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#f7f5f2] border border-[#e0ddd8] rounded-lg text-sm text-[#111] placeholder-gray-400 focus:outline-none focus:border-[#3a7a55] focus:bg-white font-sans transition-all"
                />
              </div>
            </div>

            {/* Business Name */}
            <div className="form-group flex flex-col gap-1.5">
              <label className="form-label text-xs font-semibold text-[#333]" htmlFor="businessName">
                Nama Bisnis
              </label>
              <div className="input-wrap relative">
                <span className="material-symbols-outlined input-icon absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                  store
                </span>
                <input
                  type="text"
                  id="businessName"
                  placeholder="Nama toko atau perusahaan"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#f7f5f2] border border-[#e0ddd8] rounded-lg text-sm text-[#111] placeholder-gray-400 focus:outline-none focus:border-[#3a7a55] focus:bg-white font-sans transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group flex flex-col gap-1.5">
              <label className="form-label text-xs font-semibold text-[#333]" htmlFor="email">
                Email
              </label>
              <div className="input-wrap relative">
                <span className="material-symbols-outlined input-icon absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                  mail
                </span>
                <input
                  type="email"
                  id="email"
                  placeholder="nama@bisnis.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#f7f5f2] border border-[#e0ddd8] rounded-lg text-sm text-[#111] placeholder-gray-400 focus:outline-none focus:border-[#3a7a55] focus:bg-white font-sans transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group flex flex-col gap-1.5">
              <label className="form-label text-xs font-semibold text-[#333]" htmlFor="password">
                Kata Sandi
              </label>
              <div className="input-wrap relative">
                <span className="material-symbols-outlined input-icon absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Min. 8 karakter"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-[#f7f5f2] border border-[#e0ddd8] rounded-lg text-sm text-[#111] placeholder-gray-400 focus:outline-none focus:border-[#3a7a55] focus:bg-white font-sans transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-pw absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 bg-transparent border-none outline-none p-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Error alerts */}
            {error && (
              <div className="bg-[#fee2e2] border border-[#fecaca] rounded-lg px-4 py-3 text-xs text-[#dc2626] font-sans">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="auth-submit w-full py-3.5 bg-[#111111] hover:bg-[#222] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg text-sm font-semibold cursor-pointer shadow-md transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin text-white" size={16} />
                  <span>Daftar...</span>
                </div>
              ) : (
                "Daftar Sekarang"
              )}
            </button>
          </form>

          {/* Card footer redirect */}
          <div className="auth-footer-note text-center mt-6 text-sm text-gray-500 font-sans">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-[#3a7a55] font-bold hover:underline">
              Masuk di sini
            </Link>
          </div>
        </div>
      </main>

      {/* Auth Footer */}
      <footer className="auth-footer text-center p-8 border-t border-[#e5e2dd] bg-[#f7f5f2]">
        <div className="auth-footer-brand font-bold text-sm text-[#111111] mb-1">
          BalasBro<span className="text-[#25D366]">.ai</span>
        </div>
        <p className="text-xs text-gray-400">Intelligent Efficiency for Business. © 2026</p>
      </footer>
    </div>
  )
}