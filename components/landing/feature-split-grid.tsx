"use client"

import * as React from "react"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

const supportFeatures = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" />
        <path d="M19 10v2a7 7 0 01-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="22" />
      </svg>
    ),
    title: "Auto-Reply 24/7",
    description: "Balas chat otomatiseven saat Anda tidur. AI menangani pertanyaan umum instantly.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    title: "Klasifikasi Intent",
    description: "Otomatis kategorikan pesan: Order, Komplain, Pertanyaan, atau Follow-up.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Escalation Rules",
    description: "Komplain kritis otomatis diteruskan ke tim Anda via Telegram atau email.",
  },
]

const salesFeatures = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: "Ekstrak Pesanan",
    description: "AI mendeteksi kata kunci order dan buat pesanan baru secara otomatis.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
    title: "Follow-up Otomatis",
    description: "Reminder pengiriman,konfirmasi pembayaran, dan review — semuanya otomatis.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: "Growth Analytics",
    description: "Lacak conversion rate, response time, dan revenue yang dihasilkan AI.",
  },
]

function FeatureCard({
  icon,
  title,
  description,
  delay,
  visible,
}: {
  icon: React.ReactNode
  title: string
  description: string
  delay: number
  visible: boolean
}) {
  return (
    <div
      className={cn(
        "flex gap-4 p-4 rounded-xl transition-all duration-500",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/80">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-white/70">{description}</p>
      </div>
    </div>
  )
}

export function FeatureSplitGrid() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <p
            className={cn(
              "text-sm font-medium text-primary mb-3 uppercase tracking-wider transition-all duration-500",
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Fitur Lengkap
          </p>
          <h2
            className={cn(
              "text-3xl font-semibold text-on-surface mb-4 transition-all duration-500 delay-100",
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ fontFamily: "Instrument Serif, serif" }}
          >
            Semua yang Anda butuhkan dalam satu platform
          </h2>
          <p
            className={cn(
              "text-on-surface-variant max-w-2xl mx-auto transition-all duration-500 delay-200",
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Dari support hingga sales, BalasBro.ai menangani seluruh customer journey
            Anda secara otomatis.
          </p>
        </div>

        {/* Split grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Support panel */}
          <div
            className={cn(
              "rounded-2xl p-6 transition-all duration-700",
              visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            )}
            style={{ background: "linear-gradient(135deg, #2b3d4f 0%, #1a2733 100%)" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" />
                  <path d="M19 10v2a7 7 0 01-14 0v-2" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wider">Dukungan Pelanggan</p>
                <h3 className="text-lg font-semibold text-white">Automated 24/7 Support</h3>
              </div>
            </div>

            <div className="space-y-1">
              {supportFeatures.map((f, i) => (
                <FeatureCard key={f.title} {...f} delay={300 + i * 100} visible={visible} />
              ))}
            </div>
          </div>

          {/* Sales panel */}
          <div
            className={cn(
              "rounded-2xl p-6 transition-all duration-700",
              visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            )}
            style={{ background: "linear-gradient(135deg, #144a2d 0%, #0a2f1f 100%)" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wider">Penjualan & Growth</p>
                <h3 className="text-lg font-semibold text-white">Sales & Conversions</h3>
              </div>
            </div>

            <div className="space-y-1">
              {salesFeatures.map((f, i) => (
                <FeatureCard key={f.title} {...f} delay={400 + i * 100} visible={visible} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}