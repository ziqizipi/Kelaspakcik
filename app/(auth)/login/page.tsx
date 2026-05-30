"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Email atau kata sandi salah.")
        setLoading(false)
        return
      }

      if (data.mfaRequired) {
        router.push(`/auth/verify-mfa?email=${encodeURIComponent(email)}`)
        return
      }

      // Successful login
      router.push("/dashboard")
    } catch {
      setError("Terjadi kesalahan sistem saat masuk.")
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
        <Link href="/register" className="auth-nav-link no-underline text-[#111111] font-semibold text-sm border border-[#ccc] px-5 py-2 rounded-lg hover:border-[#111] hover:bg-[#ede9e3] transition-all">
          Daftar
        </Link>
      </nav>

      {/* Main Form Sheet */}
      <main className="auth-main flex-1 flex items-center justify-center py-16 px-6">
        <div className="auth-card bg-white border border-[#e5e2dd] shadow-lg rounded-[20px] p-10 md:p-12 w-full max-w-[460px] animate-scale-up">
          <div className="auth-card-label text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-4 font-sans">
            BalasBro.ai
          </div>
          <h2 className="font-serif text-3xl font-light text-[#111111] mb-2 leading-snug">
            Selamat Datang<br />
            <em className="not-italic italic text-[#3a7a55]">Kembali.</em>
          </h2>
          <p className="auth-sub text-sm text-gray-500 mb-8 font-sans">
            Masuk ke akun Anda untuk melanjutkan otomatisasi bisnis Anda.
          </p>

          <form onSubmit={handleSubmit} className="auth-form space-y-5">
            {/* Email Group */}
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

            {/* Password Group */}
            <div className="form-group flex flex-col gap-1.5">
              <div className="form-label-row flex justify-between items-center">
                <label className="form-label text-xs font-semibold text-[#333]" htmlFor="password">
                  Kata Sandi
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="form-link text-xs font-semibold text-[#3a7a55] hover:underline"
                >
                  Lupa Kata Sandi?
                </Link>
              </div>
              <div className="input-wrap relative">
                <span className="material-symbols-outlined input-icon absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
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

            {/* Remember Me Option */}
            <div className="remember-row flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 accent-[#3a7a55] cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-gray-600 cursor-pointer font-sans select-none">
                Ingat saya di perangkat ini
              </label>
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
                  <span>Masuk...</span>
                </div>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="auth-divider flex items-center gap-3 my-5">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              atau lanjut dengan
            </span>
          </div>

          {/* Google Sign In Card */}
          <button
            onClick={() => alert("Google Auth placeholder...")}
            className="auth-google w-full flex items-center justify-center gap-2.5 py-3 border border-[#e0ddd8] hover:border-[#aaa] hover:bg-[#f7f5f2] rounded-lg text-xs font-bold text-gray-600 bg-white font-sans transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
              />
            </svg>
            Lanjutkan dengan Google
          </button>

          {/* Card footer redirect */}
          <div className="auth-footer-note text-center mt-6 text-sm text-gray-500 font-sans">
            Belum punya akun?{" "}
            <Link href="/register" className="text-[#3a7a55] font-bold hover:underline">
              Daftar Sekarang
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