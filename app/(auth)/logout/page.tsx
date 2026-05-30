"use client"

import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function LogoutPage() {
  useEffect(() => {
    fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      window.location.href = "/"
    })
  }, [])

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#3a7a55]/10 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-[#3a7a55]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#111111]">Keluar dari akun...</p>
          <p className="text-xs text-[#8a8580] mt-1">Harap tunggu sebentar</p>
        </div>
      </div>
    </div>
  )
}