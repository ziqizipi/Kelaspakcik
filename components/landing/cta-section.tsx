"use client"

import * as React from "react"
import { useEffect, useRef } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function CtaSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      className="py-24 relative overflow-hidden bg-primary"
      style={{
        background: "linear-gradient(135deg, #004526 0%, #0a2f1f 50%, #144a2d 100%)",
      }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-whatsapp/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <h2
          className={cn(
            "text-3xl md:text-4xl font-semibold text-white mb-6 transition-all duration-700",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ fontFamily: "Instrument Serif, serif" }}
        >
          Siap tingkatkan customer service{" "}
          <span className="text-secondary">Tanpa ribet?</span>
        </h2>

        <p
          className={cn(
            "text-lg text-white/70 mb-10 max-w-2xl mx-auto transition-all duration-700 delay-100",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          Bergabung dengan 2.500+ bisnis Indonesia yang sudah menggunakan BalasBro.ai
          untuk automate customer service dan boost conversion.
        </p>

        <div
          className={cn(
            "flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-200",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <Link
            href="/register"
            className="inline-flex items-center justify-center h-10 px-8 rounded-lg bg-white text-primary hover:bg-white/90 font-semibold transition-colors"
          >
            Mulai Gratis Sekarang
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center h-10 px-8 rounded-lg border border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-medium transition-colors"
          >
            Book Demo 15 Menit
          </Link>
        </div>

        <p
          className={cn(
            "mt-6 text-sm text-white/50 transition-all duration-700 delay-300",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          Gratis 14 hari • Tidak perlu kartu kredit • Setup dalam 15 menit
        </p>
      </div>
    </section>
  )
}