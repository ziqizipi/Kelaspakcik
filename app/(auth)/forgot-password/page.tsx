"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"

function ForgotPasswordForm() {
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email") || ""
  const [email, setEmail] = useState(emailParam)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/password/reset/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Gagal mengirim email reset")
        setLoading(false)
        return
      }

      setSent(true)
      setLoading(false)
    } catch {
      setError("Terjadi kesalahan. Coba lagi.")
      setLoading(false)
    }
  }

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
          <p className="text-sm text-[#8a8580]">Reset password akun Anda</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#e5e2dd] p-6 shadow-[0_4px_24px_rgba(0,69,38,0.06)]">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#dcfce7] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-[#16a34a]" />
              </div>
              <h2
                className="text-lg font-semibold text-[#111111] mb-2"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Email terkirim!
              </h2>
              <p className="text-sm text-[#8a8580] mb-6">
                Kami mengirim link reset ke{" "}
                <span className="font-semibold text-[#111111]">{email}</span>.
                Periksa inbox Anda.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 w-full justify-center py-3 px-4 bg-[#3a7a55] hover:bg-[#1a5e3a] text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
              >
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-[#8a8580] mb-2">
                Masukkan email Anda dan kami akan mengirim link untuk reset password.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@bisnis.com"
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
                    Mengirim...
                  </>
                ) : (
                  "Kirim Link Reset"
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-[#8a8580] mt-6">
          Ingat password?{" "}
          <Link
            href="/login"
            className="text-[#3a7a55] hover:text-[#1a5e3a] font-semibold transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            Kembali login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#3a7a55]" />
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  )
}