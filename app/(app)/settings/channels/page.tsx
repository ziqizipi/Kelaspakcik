"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
  Plus,
  X,
  MessageSquare,
  Wifi,
  WifiOff,
} from "lucide-react"
import { Card } from "@/components/design-system"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface TwilioAccount {
  id: string
  accountSid: string
  whatsappNumber: string
  messagingServiceSid?: string
  businessName?: string
  isActive: boolean
  createdAt: string
}

interface ChannelsResponse {
  accounts: TwilioAccount[]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function ChannelsPage() {
  const [showAdd, setShowAdd] = useState(false)
  const [refreshingId, setRefreshingId] = useState<string | null>(null)
  const [refreshResult, setRefreshResult] = useState<Record<string, string>>({})

  const { data, isLoading } = useSWR<ChannelsResponse>("/api/twilio/accounts", fetcher)
  const accounts = data?.accounts || []

  async function handleRefresh(accountId: string) {
    setRefreshingId(accountId)
    setRefreshResult((prev) => ({ ...prev, [accountId]: "" }))
    try {
      const res = await fetch(`/api/twilio/accounts/${accountId}/refresh`, { method: "POST" })
      const d = await res.json()
      if (res.ok) {
        setRefreshResult((prev) => ({ ...prev, [accountId]: "success" }))
      } else {
        setRefreshResult((prev) => ({ ...prev, [accountId]: d.error || "Error" }))
      }
    } catch {
      setRefreshResult((prev) => ({ ...prev, [accountId]: "Gagal terhubung" }))
    } finally {
      setRefreshingId(null)
      setTimeout(() => setRefreshResult((prev) => ({ ...prev, [accountId]: "" })), 3000)
    }
  }

  async function handleDelete(accountId: string) {
    if (!confirm("Yakin ingin menghapus saluran Twilio ini?")) return
    await fetch(`/api/twilio/accounts/${accountId}`, { method: "DELETE" })
    mutate("/api/twilio/accounts")
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
              Saluran
            </h1>
            <p className="text-sm text-[#8a8580] mt-0.5">
              Kelola koneksi WhatsApp bisnis Anda
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#3a7a55] hover:bg-[#1a5e3a] text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
          >
            <Plus size={16} />
            Tambah Saluran
          </button>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-[#8a8580]" />
              </div>
            </Card>
          ) : accounts.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-[#f0ede8] flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={24} className="text-[#8a8580]" />
                </div>
                <p className="text-sm font-semibold text-[#111111]">
                  Belum ada saluran terhubung
                </p>
                <p className="text-xs text-[#8a8580] mt-1 max-w-[280px] mx-auto">
                  Hubungkan akun Twilio WhatsApp untuk mulai menerima dan membalas pesan
                </p>
                <button
                  onClick={() => setShowAdd(true)}
                  className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-[#3a7a55] hover:bg-[#1a5e3a] text-white text-sm font-semibold rounded-xl transition-all shadow-sm mx-auto"
                >
                  <Plus size={14} />
                  Hubungkan Twilio
                </button>
              </div>
            </Card>
          ) : (
            accounts.map((account) => (
              <Card key={account.id}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#dcfce7] flex items-center justify-center">
                      <MessageSquare size={20} className="text-[#16a34a]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">
                        {account.businessName || "Twilio WhatsApp"}
                      </p>
                      <p className="text-xs text-[#8a8580] font-mono">
                        {account.whatsappNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {account.isActive ? (
                      <>
                        <Wifi size={14} className="text-[#16a34a]" />
                        <span className="text-xs font-semibold text-[#16a34a]">Terhubung</span>
                      </>
                    ) : (
                      <>
                        <WifiOff size={14} className="text-[#8a8580]" />
                        <span className="text-xs font-semibold text-[#8a8580]">Nonaktif</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-[#f0ede8]">
                  <div>
                    <p className="text-xs text-[#8a8580]">Ditambahkan</p>
                    <p className="text-sm font-medium text-[#111111] mt-0.5">
                      {formatDate(account.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8a8580]">Account SID</p>
                    <p className="text-sm font-medium text-[#111111] font-mono mt-0.5">
                      {account.accountSid.slice(0, 10)}...
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleRefresh(account.id)}
                      disabled={refreshingId === account.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e2dd] bg-white hover:bg-[#f5f4f0] text-[#8a8580] text-xs transition-colors"
                      title="Test koneksi"
                    >
                      <RefreshCw
                        size={12}
                        className={refreshingId === account.id ? "animate-spin" : ""}
                      />
                      Test
                    </button>
                    {refreshResult[account.id] === "success" && (
                      <span className="text-xs text-[#16a34a] font-medium">Aktif ✓</span>
                    )}
                    {refreshResult[account.id] &&
                      refreshResult[account.id] !== "success" && (
                        <span className="text-xs text-[#dc2626]">Error</span>
                      )}
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-1.5 rounded-lg hover:bg-[#fee2e2] text-[#8a8580] hover:text-[#dc2626] transition-colors"
                      title="Hapus saluran"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Tips */}
        <div className="mt-6 px-4 py-4 bg-[#dbeafe] border border-[#bfdbfe] rounded-xl flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-[#2563eb] flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-[10px] font-bold">i</span>
          </div>
          <div>
            <p className="text-sm text-[#1e40af] font-semibold mb-0.5">
              Butuh bantuan menghubungkan Twilio?
            </p>
            <p className="text-xs text-[#2563eb]">
              Dapatkan Account SID dan Auth Token dari{" "}
              <span className="font-semibold">twilio.com/console</span>. WhatsApp
              Sandbox tersedia untuk testing gratis.
            </p>
          </div>
        </div>
      </div>

      {showAdd && <AddChannelModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}

function AddChannelModal({ onClose }: { onClose: () => void }) {
  const [accountSid, setAccountSid] = useState("")
  const [authToken, setAuthToken] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [messagingServiceSid, setMessagingServiceSid] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/twilio/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountSid,
          authToken,
          whatsappNumber,
          messagingServiceSid,
          businessName,
        }),
      })
      const d = await res.json()
      if (!res.ok) {
        setError(d.error || "Gagal menambahkan saluran")
        return
      }
      mutate("/api/twilio/accounts")
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
  const labelClass =
    "block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide"

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-[#e5e2dd] w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e2dd]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#dcfce7] flex items-center justify-center text-[#16a34a]">
              <MessageSquare size={16} />
            </div>
            <h2
              className="text-lg font-semibold text-[#111111]"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Hubungkan Twilio WhatsApp
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#f5f4f0] text-[#8a8580] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-[#8a8580] mb-5">
            Masukkan kredensial dari{" "}
            <span className="font-semibold text-[#111111]">twilio.com/console</span>. Auth
            token akan disimpan dengan aman dan dienkripsi.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Account SID</label>
              <input
                type="text"
                value={accountSid}
                onChange={(e) => setAccountSid(e.target.value)}
                required
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className={`${inputClass} font-mono`}
              />
            </div>

            <div>
              <label className={labelClass}>Auth Token</label>
              <textarea
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                required
                rows={2}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className={`${inputClass} resize-none font-mono`}
              />
            </div>

            <div>
              <label className={labelClass}>Nomor WhatsApp</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                required
                placeholder="+6281234567890"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Messaging Service SID{" "}
                <span className="text-[#8a8580] normal-case font-normal">(opsional)</span>
              </label>
              <input
                type="text"
                value={messagingServiceSid}
                onChange={(e) => setMessagingServiceSid(e.target.value)}
                placeholder="MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className={`${inputClass} font-mono`}
              />
            </div>

            <div>
              <label className={labelClass}>
                Nama Bisnis{" "}
                <span className="text-[#8a8580] normal-case font-normal">(opsional)</span>
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Toko Saya"
                className={inputClass}
              />
            </div>

            {error && (
              <div className="bg-[#fee2e2] border border-[#fecaca] rounded-xl px-4 py-3 text-sm text-[#dc2626]">
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
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Hubungkan"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
