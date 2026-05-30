"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const messages = [
  { from: "customer", text: "Halo, saya mau tanya harga paket Pro", time: "10:30" },
  { from: "ai", text: "Halo! 👋 Paket Pro kami Rp 199.000/bulan dengan fitur: \n\n✅ 5.000 pesan/bulan\n✅ Auto-reply AI\n✅ Multiple accounts\n✅ Analytics dashboard\n\nBisa saya bantu yang lain?", time: "10:30" },
  { from: "customer", text: "Jadi otomatis balas juga ya? Tanpa harus reply manual?", time: "10:31" },
  { from: "ai", text: "Betul! Auto-reply 24/7 langsung aktif setelah Anda atur kata kunci dan response template. Bahkan malam weekend juga respond! 😊", time: "10:31" },
  { from: "customer", text: "Wah keren! Saya mau coba dulu deh", time: "10:32" },
  { from: "ai", text: "Silakan! Gunakan kode PROMO20 untuk diskon 20% bulan pertama. Siap started? 💪", time: "10:32" },
]

export function FloatingWhatsAppWidget() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [visibleMessages, setVisibleMessages] = React.useState(0)
  const [hasInitialized, setHasInitialized] = React.useState(false)

  React.useEffect(() => {
    if (isOpen && !hasInitialized) {
      setHasInitialized(true)
      let count = 0
      const interval = setInterval(() => {
        count++
        setVisibleMessages(count)
        if (count >= messages.length) clearInterval(interval)
      }, 400)
      return () => clearInterval(interval)
    }
    if (!isOpen) {
      setVisibleMessages(0)
      setHasInitialized(false)
    }
  }, [isOpen, hasInitialized])

  return (
    <>
      {/* Expanded chat panel */}
      <div
        className={cn(
          "fixed bottom-24 right-6 w-80 sm:w-96 rounded-2xl shadow-2xl z-50 overflow-hidden transition-all duration-300 origin-bottom-right",
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-[#111c25] px-4 py-4 flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-primary/30 flex items-center justify-center">
              <span className="text-sm font-bold text-white">AI</span>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#111c25]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">BalasBro AI</p>
            <p className="text-xs text-green-400">Online • Siap membantu</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="bg-[#0b1417] h-80 overflow-y-auto p-4 space-y-3">
          {messages.slice(0, visibleMessages).map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex",
                msg.from === "customer" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5",
                  msg.from === "customer"
                    ? "bg-[#005c4b] text-white rounded-tr-sm"
                    : "bg-[#1f2c34] text-white rounded-tl-sm"
                )}
              >
                <p className="text-sm whitespace-pre-line">{msg.text}</p>
                <p className="text-xs text-white/50 mt-1">{msg.time}</p>
              </div>
            </div>
          ))}
          {visibleMessages < messages.length && (
            <div className="flex justify-start">
              <div className="bg-[#1f2c34] rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 150, 300].map((d) => (
                    <div
                      key={d}
                      className="w-2 h-2 rounded-full bg-[#8696a0] animate-bounce"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-[#111c25] px-4 py-3 flex items-center gap-2 border-t border-[#2b3d4f]/30">
          <div className="flex-1 bg-[#1f2c34] rounded-full px-4 py-2">
            <p className="text-xs text-[#8696a0]">Coba ketik &quot;Harga&quot;...</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-whatsapp shadow-lg flex items-center justify-center hover:bg-whatsapp/90 transition-all hover:scale-105 group"
        aria-label="Open WhatsApp chat demo"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.211l4.287-1.398A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.487 0-4.807-.784-6.72-2.112l-.482-.288-3.035.99.995-3.631-.295-.478A9.924 9.924 0 012.016 12c0-5.522 4.478-10 10-10s10 4.478 10 10-4.478 10-10 10z" />
            </svg>
            {/* Notification dot */}
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </span>
          </>
        )}
      </button>
    </>
  )
}