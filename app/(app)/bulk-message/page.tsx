"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import {
  X,
  Send,
  Users,
  Search,
  Check,
  Loader2,
  MessageSquare,
  ChevronRight,
} from "lucide-react"
import { Avatar, Card } from "@/components/design-system"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Customer {
  id: string
  name: string | null
  phone: string
}

interface CustomersResponse {
  customers: Customer[]
  total: number
}

export default function BulkMessagePage() {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [sendError, setSendError] = useState("")

  const { data, isLoading } = useSWR<CustomersResponse>(
    `/api/customers?limit=100`,
    fetcher
  )

  const allCustomers = data?.customers || []
  const filtered = allCustomers.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  )

  function toggleContact(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  function selectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((c) => c.id)))
    }
  }

  function selectNone() {
    setSelected(new Set())
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() || selected.size === 0) return

    setSending(true)
    setSendError("")
    try {
      const res = await fetch("/api/bulk-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerIds: Array.from(selected),
          message,
        }),
      })
      if (res.ok) {
        setSent(true)
        setTimeout(() => setSent(false), 3000)
        setMessage("")
        setSelected(new Set())
      } else {
        const d = await res.json()
        setSendError(d.error || "Gagal mengirim pesan")
      }
    } catch {
      setSendError("Gagal mengirim pesan. Coba lagi.")
    } finally {
      setSending(false)
    }
  }

  const selectedCount = selected.size

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e2dd] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl hover:bg-[#f5f4f0] transition-colors text-[#8a8580]"
            >
              <X size={20} />
            </Link>
            <div>
              <h1
                className="text-xl font-semibold text-[#111111]"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Pesan Massal
              </h1>
              <p className="text-xs text-[#8a8580]">
                Kirim ke {selectedCount > 0 ? `${selectedCount} pelanggan` : "semua pelanggan"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-4">
        {/* Recipients */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#3a7a55]/10 flex items-center justify-center text-[#3a7a55]">
                <Users size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111111]">Penerima Pesan</p>
                <p className="text-xs text-[#8a8580]">
                  {selectedCount > 0
                    ? `${selectedCount} dari ${filtered.length} dipilih`
                    : `${filtered.length} pelanggan`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="text-xs text-[#3a7a55] hover:text-[#1a5e3a] font-medium transition-colors"
              >
                Pilih semua
              </button>
              {selectedCount > 0 && (
                <button
                  onClick={selectNone}
                  className="text-xs text-[#8a8580] hover:text-[#404942] font-medium transition-colors"
                >
                  Hapus semua
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8580]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pelanggan..."
              className="w-full pl-8 pr-4 py-2 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
            />
          </div>

          {/* Contact list */}
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-[#f0ede8] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-2xl bg-[#f0ede8] flex items-center justify-center mx-auto mb-2">
                <MessageSquare size={18} className="text-[#8a8580]" />
              </div>
              <p className="text-sm font-medium text-[#111111]">Tidak ada pelanggan</p>
              <p className="text-xs text-[#8a8580] mt-1">
                {search ? "Coba kata kunci lain" : "Pelanggan akan muncul setelah ada percakapan"}
              </p>
            </div>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {filtered.map((contact) => {
                const isSelected = selected.has(contact.id)
                return (
                  <button
                    key={contact.id}
                    onClick={() => toggleContact(contact.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isSelected
                        ? "bg-[#3a7a55]/5 border border-[#3a7a55]/20"
                        : "hover:bg-[#f5f4f0] border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-[#3a7a55] border-[#3a7a55]"
                          : "border-[#d1cdc7]"
                      }`}
                    >
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>
                    <Avatar name={contact.name || contact.phone} size="sm" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-[#111111]">
                        {contact.name || contact.phone}
                      </p>
                      {contact.name && (
                        <p className="text-xs text-[#8a8580]">{contact.phone}</p>
                      )}
                    </div>
                    <ChevronRight size={14} className="text-[#8a8580]" />
                  </button>
                )
              })}
            </div>
          )}
        </Card>

        {/* Message Form */}
        <Card>
          <label className="block text-sm font-semibold text-[#111111] mb-2">
            Isi Pesan
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ketik pesan Anda di sini..."
            rows={5}
            maxLength={1000}
            className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all resize-none"
          />

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-[#8a8580]">
              {message.length}/1000 karakter
            </span>
          </div>

          {sendError && (
            <div className="mt-3 px-4 py-3 bg-[#fee2e2] border border-[#fecaca] rounded-xl text-sm text-[#dc2626]">
              {sendError}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl border border-[#e5e2dd] text-[#404942] text-sm font-medium hover:bg-[#f5f4f0] transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              onClick={handleSend}
              disabled={sending || !message.trim() || selectedCount === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#3a7a55] hover:bg-[#1a5e3a] disabled:bg-[#f0ede8] text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
            >
              {sending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Mengirim...
                </>
              ) : sent ? (
                <>
                  <Check size={14} />
                  Terkirim!
                </>
              ) : (
                <>
                  <Send size={14} />
                  Kirim ke {selectedCount} orang
                </>
              )}
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}