"use client"

import { Suspense, useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Shield } from "lucide-react"

function VerifyMfaForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!email) {
      router.push("/login")
    }
  }, [email, router])

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when 6 digits filled
    if (index === 5 && value) {
      const fullCode = [...newCode.slice(0, 5), value.slice(-1)].join("")
      if (fullCode.length === 6) {
        submitCode(fullCode)
      }
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  async function submitCode(fullCode: string) {
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/verify-mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Kode tidak valid. Coba lagi.")
        setCode(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
        setLoading(false)
        return
      }

      router.push("/dashboard")
    } catch {
      setError("Terjadi kesalahan. Coba lagi.")
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fullCode = code.join("")
    if (fullCode.length !== 6) {
      setError("Masukkan 6 digit kode OTP")
      return
    }
    await submitCode(fullCode)
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
          <p className="text-sm text-[#8a8580]">Verifikasi dua faktor</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#e5e2dd] p-6 shadow-[0_4px_24px_rgba(0,69,38,0.06)]">
          <div className="flex items-center justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-[#dbeafe] flex items-center justify-center">
              <Shield size={28} className="text-[#2563eb]" />
            </div>
          </div>

          <p className="text-sm text-[#8a8580] text-center mb-6">
            Masukkan kode 6 digit dari aplikasi autentikator Anda
            {email && (
              <span className="block mt-1 text-xs font-medium text-[#111111]">{email}</span>
            )}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Inputs */}
            <div className="flex gap-2 justify-center">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-semibold rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
                  autoComplete="off"
                />
              ))}
            </div>

            {error && (
              <div className="bg-[#fee2e2] border border-[#fecaca] rounded-xl px-4 py-3 text-sm text-[#dc2626] text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.some((d) => !d)}
              className="w-full py-3 px-4 bg-[#3a7a55] hover:bg-[#1a5e3a] disabled:bg-[#f0ede8] disabled:text-[#8a8580] text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                "Verifikasi"
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

export default function VerifyMfaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#3a7a55]" />
      </div>
    }>
      <VerifyMfaForm />
    </Suspense>
  )
}