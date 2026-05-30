"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { AlertTriangle, Plus, Loader2, X, Trash2, Zap, ArrowRight } from "lucide-react"
import { Card, Toggle } from "@/components/design-system"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface EscalationRule {
  id: string
  name: string
  type: string
  keywords: string[]
  minOrderValue?: string | null
  notifyVia: string
  isActive: boolean
  createdAt: string
}

function getTriggerLabel(rule: EscalationRule): string {
  if (rule.type === "INTENT") return rule.keywords?.join(", ") || "Intent"
  if (rule.type === "KEYWORD") return rule.keywords?.join(", ") || "Keyword"
  if (rule.type === "ORDER_VALUE")
    return `Order ≥ Rp${Number(rule.minOrderValue || 0).toLocaleString("id-ID")}`
  return rule.type
}

function getTriggerStyle(type: string): string {
  const map: Record<string, string> = {
    COMPLAINT: "bg-[#fee2e2] text-[#dc2626]",
    KEYWORD: "bg-[#dbeafe] text-[#2563eb]",
    ORDER_VALUE: "bg-[#fef9c3] text-[#ca8a04]",
    INTENT: "bg-[#f0ede8] text-[#6b6b6b]",
  }
  return map[type] || "bg-[#f0ede8] text-[#6b6b6b]"
}

export default function EscalationPage() {
  const { data, error, isLoading } = useSWR<{ rules: EscalationRule[] }>(
    "/api/escalation-rules",
    fetcher
  )
  const [showAdd, setShowAdd] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const rules = data?.rules || []

  async function toggleRule(id: string, currentActive: boolean) {
    await fetch(`/api/escalation-rules/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !currentActive }),
    })
    mutate("/api/escalation-rules")
  }

  async function deleteRule(id: string) {
    if (!confirm("Hapus aturan ini?")) return
    setDeletingId(id)
    try {
      await fetch(`/api/escalation-rules/${id}`, { method: "DELETE" })
      mutate("/api/escalation-rules")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] p-6">
      <div className="max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-2xl font-semibold text-[#111111]"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Aturan Eskalasi
            </h1>
            <p className="text-sm text-[#8a8580] mt-0.5">
              Otomatis eskalasi berdasarkan pemicu tertentu
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#3a7a55] hover:bg-[#1a5e3a] text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
          >
            <Plus size={16} />
            Tambah Aturan
          </button>
        </div>

        {/* Rules List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-[#8a8580]" />
          </div>
        ) : error ? (
          <Card>
            <div className="flex items-center gap-3 px-4 py-3 bg-[#fee2e2] border border-[#fecaca] rounded-xl text-sm text-[#dc2626]">
              <AlertTriangle size={16} />
              Gagal memuat aturan eskalasi.
            </div>
          </Card>
        ) : rules.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-[#f0ede8] flex items-center justify-center mx-auto mb-3">
                <Zap size={20} className="text-[#8a8580]" />
              </div>
              <p className="text-sm font-semibold text-[#111111]">Belum ada aturan eskalasi</p>
              <p className="text-xs text-[#8a8580] mt-1 max-w-[280px] mx-auto">
                Tambah aturan untuk secara otomatis eskalasi percakapan berdasarkan intent atau nilai pesanan
              </p>
              <button
                onClick={() => setShowAdd(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 border border-[#e5e2dd] rounded-xl text-sm font-medium hover:bg-[#f5f4f0] transition-colors mx-auto"
              >
                <Plus size={14} />
                Tambah Aturan Pertama
              </button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        rule.isActive ? "bg-[#fee2e2] text-[#dc2626]" : "bg-[#f0ede8] text-[#8a8580]"
                      }`}
                    >
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">{rule.name}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getTriggerStyle(
                            rule.type
                          )}`}
                        >
                          {getTriggerLabel(rule)}
                        </span>
                        <span className="text-[#8a8580]">→</span>
                        <span className="text-xs text-[#8a8580]">{rule.notifyVia}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteRule(rule.id)}
                      disabled={deletingId === rule.id}
                      className="p-2 rounded-xl hover:bg-[#fee2e2] text-[#8a8580] hover:text-[#dc2626] transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={() => toggleRule(rule.id, rule.isActive)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        rule.isActive ? "bg-[#3a7a55]" : "bg-[#e5e2dd]"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          rule.isActive ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tip */}
        <div className="mt-6 px-4 py-3 bg-[#fef9c3] border border-[#fde68a] rounded-xl flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-[#ca8a04] flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-[10px] font-bold">!</span>
          </div>
          <p className="text-xs text-[#92400e]">
            <strong>Tips:</strong> Jaga agar aturan eskalasi tetap sederhana. Aturan kompleks
            dengan beberapa kondisi dapat menyebabkan perilaku yang tidak terduga.
          </p>
        </div>
      </div>

      {showAdd && <AddRuleModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}

function AddRuleModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("")
  const [type, setType] = useState("KEYWORD")
  const [keywords, setKeywords] = useState("")
  const [minOrderValue, setMinOrderValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/escalation-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
          minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
          isActive: true,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || "Gagal membuat aturan")
        return
      }
      mutate("/api/escalation-rules")
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md !p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#fee2e2] flex items-center justify-center text-[#dc2626]">
              <Zap size={16} />
            </div>
            <h2
              className="text-lg font-semibold text-[#111111]"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Tambah Aturan
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#f5f4f0] text-[#8a8580]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
              Nama Aturan
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Mis: Komplain Produk Rusak"
              className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
              Tipe Pemicu
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
            >
              <option value="KEYWORD">Kata Kunci</option>
              <option value="INTENT">Intent AI</option>
              <option value="ORDER_VALUE">Nilai Pesanan</option>
            </select>
          </div>

          {type === "KEYWORD" && (
            <div>
              <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                Kata Kunci <span className="text-[#8a8580] normal-case">(pisahkan dengan koma)</span>
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="refund, rusak, tidak sesuai"
                className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
              />
            </div>
          )}

          {type === "ORDER_VALUE" && (
            <div>
              <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                Nilai Minimum (Rp)
              </label>
              <input
                type="number"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
                min="0"
                placeholder="500000"
                className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
              />
            </div>
          )}

          {error && (
            <div className="px-4 py-3 bg-[#fee2e2] border border-[#fecaca] rounded-xl text-sm text-[#dc2626]">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#e5e2dd] text-[#404942] text-sm font-medium hover:bg-[#f5f4f0] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-[#3a7a55] hover:bg-[#1a5e3a] disabled:bg-[#f0ede8] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}