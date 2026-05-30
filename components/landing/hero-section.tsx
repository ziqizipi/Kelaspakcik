"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="flex flex-col items-start text-left">
            <Badge
              variant="secondary"
              className="mb-6 text-xs font-medium px-3 py-1.5 bg-primary/10 text-primary border-primary/20"
            >
              AI-Powered Customer Service untuk Bisnis Indonesia
            </Badge>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-on-surface leading-tight mb-6"
              style={{ fontFamily: "Instrument Serif, serif" }}
            >
              Balas Pesan WhatsApp{" "}
              <span className="text-primary">Dengan AI,</span>
              <br />
              Tidak Perlu Ribet
            </h1>

            <p className="text-lg text-on-surface-variant max-w-lg mb-8 leading-relaxed">
              Otomatis balas chat pelanggan, klasifikasi pesanan, dan kelola order
              — semua dari satu dashboard. Dirancang untuk bisnis Indonesia.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/register"
                className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-[#111] text-white hover:bg-[#333] font-medium transition-colors"
              >
                Mulai Gratis
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center h-10 px-6 rounded-lg border border-[#f0ede8] text-[#5c5a52] hover:bg-[#f5f4f0] font-medium transition-colors"
              >
                Book Demo
              </Link>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Gratis 14 hari • Tidak perlu kartu kredit
            </p>
          </div>

          {/* Right: WhatsApp Mockup */}
          <div className="relative">
            {/* Browser frame */}
            <div className="relative bg-[#111c25] rounded-2xl shadow-2xl overflow-hidden border border-[#2b3d4f]/30">
              {/* Browser chrome */}
              <div className="bg-[#1a2733] px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-[#2b3d4f] rounded-md px-3 py-1 text-xs text-muted-foreground text-center">
                    chat.balabsro.ai
                  </div>
                </div>
              </div>

              {/* WhatsApp interface */}
              <div className="flex h-[420px]">
                {/* Sidebar */}
                <div className="w-16 bg-[#111c25] border-r border-[#2b3d4f]/30 flex flex-col items-center py-4 gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-primary" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#2b3d4f]/50" />
                  <div className="w-8 h-8 rounded-full bg-[#2b3d4f]/50" />
                  <div className="w-8 h-8 rounded-full bg-[#2b3d4f]/50" />
                  <div className="flex-1" />
                  <div className="w-8 h-8 rounded-full bg-[#2b3d4f]/50" />
                </div>

                {/* Chat area */}
                <div className="flex-1 flex flex-col bg-[#0b1417]">
                  {/* Chat header */}
                  <div className="bg-[#111c25] px-4 py-3 flex items-center gap-3 border-b border-[#2b3d4f]/30">
                    <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">AI</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">BalasBro AI</p>
                      <p className="text-xs text-green-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Online
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 space-y-3 overflow-hidden">
                    {/* Customer message */}
                    <div className="flex justify-end">
                      <div className="bg-[#005c4b] rounded-2xl rounded-tr-sm px-4 py-2 max-w-[75%]">
                        <p className="text-sm text-white">Halo, saya mau tanya soal harga paket business</p>
                        <p className="text-xs text-white/60 mt-1">14:32</p>
                      </div>
                    </div>

                    {/* AI typing indicator */}
                    <div className="flex justify-start">
                      <div className="bg-[#1f2c34] rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>

                    {/* AI response */}
                    <div className="flex justify-start">
                      <div className="bg-[#1f2c34] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                        <p className="text-sm text-white">
                          Halo! 👋 Paket Business kami Rp 499.000/bulan dengan fitur:
                        </p>
                        <p className="text-xs text-[#8696a0] mt-1">14:32 ✓✓</p>
                      </div>
                    </div>

                    {/* AI response 2 */}
                    <div className="flex justify-start">
                      <div className="bg-[#1f2c34] rounded-2xl rounded-tl-sm px-4 py-2 max-w-[75%]">
                        <p className="text-sm text-white">✅ Auto-reply 24/7</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-[#1f2c34] rounded-2xl rounded-tl-sm px-4 py-2 max-w-[75%]">
                        <p className="text-sm text-white">✅ 10.000 pesan/bulan</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-[#1f2c34] rounded-2xl rounded-tl-sm px-4 py-2 max-w-[75%]">
                        <p className="text-sm text-white">✅ Multiple WhatsApp accounts</p>
                      </div>
                    </div>

                    {/* Customer message 2 */}
                    <div className="flex justify-end">
                      <div className="bg-[#005c4b] rounded-2xl rounded-tr-sm px-4 py-2 max-w-[60%]">
                        <p className="text-sm text-white">Oke bagus! Saya mau coba dulu ya</p>
                        <p className="text-xs text-white/60 mt-1">14:33</p>
                      </div>
                    </div>
                  </div>

                  {/* Input bar */}
                  <div className="bg-[#111c25] px-4 py-3 flex items-center gap-2 border-t border-[#2b3d4f]/30">
                    <div className="flex-1 bg-[#1f2c34] rounded-full px-4 py-2">
                      <p className="text-xs text-[#8696a0]">Ketik pesan...</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 bg-card rounded-xl shadow-lg px-4 py-3 border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-on-surface">Respon dalam</p>
                <p className="text-lg font-bold text-primary">&lt; 2 detik</p>
              </div>
            </div>

            {/* Pulse ring decoration */}
            <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-whatsapp animate-ping" />
            <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-whatsapp" />
          </div>
        </div>
      </div>
    </section>
  )
}