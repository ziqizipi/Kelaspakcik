"use client"

import { useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import { Brain, MessageSquare, Clock, Tag, Loader2, CheckCircle2, Zap, X } from "lucide-react"
import { Card, Toggle } from "@/components/design-system"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface AIConfig {
  isEnabled: boolean
  tone: "friendly" | "formal" | "casual" | null
  sopContext: string | null
  fallbackReply: string | null
  workingHours: { start: string; end: string; timezone: string } | null
  dailyRecapEnabled: boolean
  dailyRecapTime: string | null
}

interface ConfigResponse {
  config: AIConfig | null
}

interface IntentCount {
  intent: string
  count: number
}

interface IntentStatsResponse {
  stats: IntentCount[]
}

const intentLabels: Record<string, string> = {
  ORDER: "Pesanan",
  COMPLAINT: "Keluhan",
  PRODUCT_INQUIRY: "Pertanyaan Produk",
  FOLLOW_UP: "Tindak Lanjut",
  GENERAL: "Umum",
}

const intentStyles: Record<string, string> = {
  ORDER: "bg-[#dcfce7] text-[#16a34a]",
  COMPLAINT: "bg-[#fee2e2] text-[#dc2626]",
  PRODUCT_INQUIRY: "bg-[#dbeafe] text-[#2563eb]",
  FOLLOW_UP: "bg-[#fef9c3] text-[#ca8a04]",
  GENERAL: "bg-[#f0ede8] text-[#6b6b6b]",
}

export default function AIPage() {
  const { mutate } = useSWRConfig()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const [autoReply, setAutoReply] = useState(true)
  const [workingHoursEnabled, setWorkingHoursEnabled] = useState(false)
  const [tone, setTone] = useState("friendly")
  const [workingStart, setWorkingStart] = useState("08:00")
  const [workingEnd, setWorkingEnd] = useState("18:00")
  const [offHoursMessage, setOffHoursMessage] = useState("")
  const [sopContext, setSopContext] = useState("")
  const [fallbackReply, setFallbackReply] = useState("")

  const { data: configData } = useSWR<ConfigResponse>("/api/ai/config", fetcher)
  const config = configData?.config

  const { data: intentData } = useSWR<IntentStatsResponse>("/api/ai/intent-stats", fetcher)
  const intentStats = intentData?.stats || []

  async function handleSave() {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch("/api/ai/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isEnabled: autoReply,
          tone,
          sopContext,
          fallbackReply,
          workingHours: workingHoursEnabled
            ? { start: workingStart, end: workingEnd, timezone: "Asia/Jakarta" }
            : undefined,
          dailyRecapEnabled: false,
          dailyRecapTime: null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Gagal menyimpan")
        return
      }

      setSuccess("Pengaturan berhasil disimpan")
      mutate("/api/ai/config")
    } catch {
      setError("Terjadi kesalahan. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] p-6">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#3a7a55]/10 flex items-center justify-center text-[#3a7a55]">
              <Zap size={20} />
            </div>
            <h1
              className="text-2xl font-semibold text-[#111111]"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              AI & Otomatisasi
            </h1>
          </div>
          <p className="text-sm text-[#8a8580]">
            Konfigurasi auto-reply dan perilaku AI BalasBro
          </p>
        </div>

        {success && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-[#dcfce7] border border-[#bbf7d0] rounded-xl text-sm text-[#16a34a]">
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 px-4 py-3 bg-[#fee2e2] border border-[#fecaca] rounded-xl text-sm text-[#dc2626]">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Auto-Reply */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-[#f0ede8] flex items-center justify-center text-[#8a8580]">
                <MessageSquare size={16} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#111111]">Auto-Balas</h2>
                <p className="text-xs text-[#8a8580]">Otomatis tanggapi pesan pelanggan</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#111111]">Aktifkan Auto-Balas</p>
                  <p className="text-xs text-[#8a8580] mt-0.5">
                    AI akan otomatis membalas pesan masuk
                  </p>
                </div>
                <button
                  onClick={() => setAutoReply(!autoReply)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    autoReply ? "bg-[#3a7a55]" : "bg-[#e5e2dd]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      autoReply ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                  Gaya Respons
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
                >
                  <option value="friendly">Ramah & Profesional</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Working Hours */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-[#f0ede8] flex items-center justify-center text-[#8a8580]">
                <Clock size={16} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#111111]">Jam Kerja</h2>
                <p className="text-xs text-[#8a8580]">Batasi auto-balas hanya selama jam kerja</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#111111]">Patuhi Jam Kerja</p>
                <button
                  onClick={() => setWorkingHoursEnabled(!workingHoursEnabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    workingHoursEnabled ? "bg-[#3a7a55]" : "bg-[#e5e2dd]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      workingHoursEnabled ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              {workingHoursEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                      Jam Mulai
                    </label>
                    <input
                      type="time"
                      value={workingStart}
                      onChange={(e) => setWorkingStart(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                      Jam Selesai
                    </label>
                    <input
                      type="time"
                      value={workingEnd}
                      onChange={(e) => setWorkingEnd(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                  Pesan Di Luar Jam Kerja
                </label>
                <textarea
                  value={offHoursMessage}
                  onChange={(e) => setOffHoursMessage(e.target.value)}
                  placeholder="Maaf, kami saat ini sedang offline. Pesan Anda akan dibalas saat jam kerja."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all resize-none"
                />
              </div>
            </div>
          </Card>

          {/* SOP Context */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-[#f0ede8] flex items-center justify-center text-[#8a8580]">
                <Tag size={16} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#111111]">Konteks SOP</h2>
                <p className="text-xs text-[#8a8580]">Panduan AI tentang bisnis Anda</p>
              </div>
            </div>
            <textarea
              value={sopContext}
              onChange={(e) => setSopContext(e.target.value)}
              placeholder="Contoh: Kami adalah toko elektronik yang menjual smartphone, laptop, dan aksesoris. Kami mengirim via JNE, J&T, dan SiCepat. Minimum order Rp 100.000 untuk free ongkir..."
              rows={5}
              maxLength={5000}
              className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all resize-none"
            />
            <p className="text-xs text-[#8a8580] mt-1">{sopContext.length}/5000 karakter</p>
          </Card>

          {/* Fallback Reply */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-[#f0ede8] flex items-center justify-center text-[#8a8580]">
                <MessageSquare size={16} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#111111]">Pesan Fallback</h2>
                <p className="text-xs text-[#8a8580]">Pesan saat AI tidak bisa memahami</p>
              </div>
            </div>
            <textarea
              value={fallbackReply}
              onChange={(e) => setFallbackReply(e.target.value)}
              placeholder="Terima kasih sudah menghubungi! Kami akan segera merespons secepat mungkin."
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all resize-none"
            />
            <p className="text-xs text-[#8a8580] mt-1">{fallbackReply.length}/1000 karakter</p>
          </Card>

          {/* Intent Stats */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-[#f0ede8] flex items-center justify-center text-[#8a8580]">
                <Brain size={16} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#111111]">Statistik Intent</h2>
                <p className="text-xs text-[#8a8580]">Distribusi intent pesan masuk</p>
              </div>
            </div>

            <div className="space-y-3">
              {intentStats.length === 0 ? (
                <p className="text-sm text-[#8a8580] text-center py-4">
                  Belum ada data intent. Data akan muncul setelah ada pesan masuk.
                </p>
              ) : (
                intentStats.map((intent) => (
                  <div
                    key={intent.intent}
                    className="flex items-center justify-between py-2 border-b border-[#f0ede8] last:border-0"
                  >
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${intentStyles[intent.intent] || "bg-[#f0ede8] text-[#6b6b6b]"}`}
                    >
                      {intentLabels[intent.intent] || intent.intent}
                    </span>
                    <span className="text-sm text-[#8a8580]">
                      {intent.count} minggu ini
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-[#3a7a55] hover:bg-[#1a5e3a] disabled:bg-[#f0ede8] text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}