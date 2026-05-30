"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Mail, Loader2 } from "lucide-react"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [resending, setResending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleResend() {
    setResending(true)
    await new Promise((r) => setTimeout(r, 1500))
    setResending(false)
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-on-surface" style={{ fontFamily: "Instrument Serif, serif" }}>
              BalasBro.ai
            </span>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Mail size={28} className="text-primary" />
            </div>
            <h1 className="text-lg font-semibold text-on-surface mb-2" style={{ fontFamily: "Instrument Serif, serif" }}>
              Check your email
            </h1>
            <p className="text-sm text-on-surface-variant mb-4">
              We sent a verification link to<br />
              <span className="font-medium text-on-surface">{email || "your email"}</span>
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Click the link in the email to activate your account. The link expires in 24 hours.
            </p>

            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary-600 disabled:bg-muted text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {resending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : sent ? (
                <>
                  <CheckCircle size={16} />
                  Sent!
                </>
              ) : (
                "Resend verification email"
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          <Link href="/login" className="text-primary hover:text-primary-600 font-medium transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}