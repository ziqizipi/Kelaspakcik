"use client"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      router.push("/forgot-password")
    }
  }, [token, router])

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
      const res = await fetch("/api/auth/password/reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Gagal reset password")
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
    } catch {
      setError("Terjadi kesalahan. Coba lagi.")
      setLoading(false)
    }
  }

  // Logo component
  const Logo = () => (
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
    </div>
  )

  if (success) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Logo />
          <div className="bg-white rounded-2xl border border-[#e5e2dd] p-6 shadow-[0_4px_24px_rgba(0,69,38,0.06)] text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#dcfce7] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-[#16a34a]" />
            </div>
            <h2
              className="text-lg font-semibold text-[#111111] mb-2"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Password berhasil diubah!
            </h2>
            <p className="text-sm text-[#8a8580] mb-6">
              Password Anda telah berhasil diperbarui. Silakan masuk dengan password baru.
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-3 px-4 bg-[#3a7a55] hover:bg-[#1a5e3a] text-white text-sm font-semibold rounded-xl transition-all text-center shadow-sm"
            >
              Masuk Sekarang
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Logo />
        <p className="text-center text-sm text-[#8a8580] -mt-4 mb-8">Buat password baru untuk akun Anda</p>

        <div className="bg-white rounded-2xl border border-[#e5e2dd] p-6 shadow-[0_4px_24px_rgba(0,69,38,0.06)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                Password Baru
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
                Konfirmasi Password Baru
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Masukkan ulang password baru"
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
                  Menyimpan...
                </>
              ) : (
                "Simpan Password Baru"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#8a8580] mt-6">
          <Link href="/login" className="text-[#3a7a55] hover:text-[#1a5e3a] font-semibold transition-colors">
            Kembali ke Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#3a7a55]" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}