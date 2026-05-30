"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function NavBar() {
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L2 22l5.71-.97A9.96 9.96 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"
                fill="#25D366"
              />
              <path
                d="M8 10.5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v5c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2v-5z"
                fill="white"
              />
              <path
                d="M17 10h.5c.28 0 .5.22.5.5v2c0 .28-.22.5-.5.5H17"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span
            className="text-lg font-semibold text-on-surface"
            style={{ fontFamily: "Instrument Serif, serif" }}
          >
            BalasBro.ai
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/product"
            className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Fitur
          </Link>
          <Link
            href="/how-it-works"
            className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Cara Kerja
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Harga
          </Link>
          <Link
            href="/solutions"
            className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Solusi
          </Link>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:block px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface font-medium transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center h-8 px-4 rounded-lg bg-[#111] text-white hover:bg-[#333] text-sm font-medium transition-colors"
          >
            Mulai Gratis
          </Link>
        </div>
      </div>
    </nav>
  )
}