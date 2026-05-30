"use client"

import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Customer {
  id: string
  name: string
  phone: string
}

interface Conversation {
  id: string
  status: string
  lastMessageAt: string
  customer: Customer
  _count: {
    messages: number
  }
}

interface Metrics {
  totalOrders: number
  totalOrdersTrend: string
  totalRevenue: number
  revenueTrend: string
  openConversations: number
  conversationsTrend: string
  aiDeflectionRate: string
  deflectionTrend: string
  waitingCount: number
  aiInsight: string
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "WAITING" | "ESCALATED" | "CLOSED">("ALL")
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  // Fetch metrics data
  const { data: metrics } = useSWR<Metrics>("/api/metrics", fetcher, {
    refreshInterval: 15000,
  })

  // Fetch conversations data
  const { data: conversationsData } = useSWR<{ conversations: Conversation[] }>(
    "/api/conversations",
    fetcher,
    {
      refreshInterval: 15000,
    }
  )

  const conversations = conversationsData?.conversations || []

  // Filter conversations based on selected tab
  const filteredConversations = conversations.filter((c) => {
    if (activeTab === "ALL") return true
    if (activeTab === "CLOSED") return c.status === "closed"
    if (activeTab === "ESCALATED") return c.status === "escalated"
    if (activeTab === "WAITING") return c.status === "waiting" || c.status === "open"
    return true
  })

  // Safe formatting helpers
  const totalRevenue = metrics?.totalRevenue || 0
  const totalOrders = metrics?.totalOrders || 0
  const deflectionRate = metrics?.aiDeflectionRate || "91"
  const deflectionTrend = metrics?.deflectionTrend || "↑ Sangat baik"
  const waitingCount = metrics?.waitingCount || 0
  const openCount = metrics?.openConversations || 0

  return (
    <div className="min-h-screen bg-[#f7f5f2] p-8 md:p-12">
      {/* Editorial Header */}
      <div className="mb-8">
        <div className="text-[11px] font-bold text-[#3a7a55] uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
          <span className="w-5 h-[1px] bg-[#3a7a55]"></span>
          Pusat Komando
        </div>
        <h1 className="bb-page-title mb-1">
          Kotak <em>Masuk</em>
        </h1>
        <p className="text-sm text-[#888] italic">
          Pantau dan respon percakapan WhatsApp secara real-time.
        </p>
      </div>

      {/* Editorial KPI Stat Rows */}
      <div className="bb-stats">
        <div className="bb-stat">
          <div className="bb-stat-val">{openCount}</div>
          <div className="bb-stat-label">Chat Aktif Hari Ini</div>
          <div className="bb-stat-trend">{metrics?.conversationsTrend || "↑ 12% dari kemarin"}</div>
        </div>
        <div className="bb-stat">
          <div className="bb-stat-val">{deflectionRate}%</div>
          <div className="bb-stat-label">Tingkat Auto-Reply</div>
          <div className="bb-stat-trend">{deflectionTrend}</div>
        </div>
        <div className="bb-stat">
          <div className="bb-stat-val">{totalOrders}</div>
          <div className="bb-stat-label">Total Pesanan</div>
          <div className="bb-stat-trend">{metrics?.totalOrdersTrend || "↑ 8 dari kemarin"}</div>
        </div>
        <div className="bb-stat">
          <div className="bb-stat-val">3m</div>
          <div className="bb-stat-label">Rata-rata Respons AI</div>
          <div className="bb-stat-trend">↓ Lebih cepat</div>
        </div>
      </div>

      {/* Main Split Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Left Card: Active Conversations Inbox List */}
        <div className="bb-card">
          <div className="bb-card-header flex-col md:flex-row gap-4">
            <div className="bb-card-title text-base">Percakapan Aktif</div>
            <div className="bb-tabs">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`bb-tab ${activeTab === "ALL" ? "active" : ""}`}
              >
                Semua
              </button>
              <button
                onClick={() => setActiveTab("WAITING")}
                className={`bb-tab ${activeTab === "WAITING" ? "active" : ""}`}
              >
                Belum Dibalas
              </button>
              <button
                onClick={() => setActiveTab("ESCALATED")}
                className={`bb-tab ${activeTab === "ESCALATED" ? "active" : ""}`}
              >
                Eskalasi
              </button>
              <button
                onClick={() => setActiveTab("CLOSED")}
                className={`bb-tab ${activeTab === "CLOSED" ? "active" : ""}`}
              >
                Selesai
              </button>
            </div>
          </div>

          {filteredConversations.length === 0 ? (
            <div className="bb-empty">
              <div className="bb-empty-icon">
                <span className="material-symbols-outlined text-gray-400">chat_bubble_outline</span>
              </div>
              <h3>Tidak ada percakapan</h3>
              <p>
                Belum ada pesan masuk di folder ini. Percakapan baru akan muncul secara otomatis di sini.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#f0ede8] -mx-6 -mb-6">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-5 flex items-center justify-between cursor-pointer transition-colors hover:bg-[#f7f5f2] ${
                    selectedConversation?.id === conv.id ? "bg-[#f0ede8]/50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#3a7a55]/10 flex items-center justify-center text-[#3a7a55] font-semibold text-sm">
                      {conv.customer?.name ? conv.customer.name.substring(0, 2).toUpperCase() : "WA"}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[#111111]">{conv.customer?.name || "Pelanggan WhatsApp"}</div>
                      <div className="text-xs text-[#888]">{conv.customer?.phone || "+62 8xx"}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#aaa] block mb-1">
                      {new Date(conv.lastMessageAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span
                      className={`bb-badge ${
                        conv.status === "closed"
                          ? "bb-badge-gray"
                          : conv.status === "escalated"
                          ? "bb-badge-red"
                          : conv.status === "waiting"
                          ? "bb-badge-orange"
                          : "bb-badge-green"
                      }`}
                    >
                      {conv.status === "closed"
                        ? "Selesai"
                        : conv.status === "escalated"
                        ? "Eskalasi"
                        : conv.status === "waiting"
                        ? "Menunggu"
                        : "Aktif"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Stack Cards: Today Summary + Conversation Details */}
        <div className="flex flex-col gap-4">
          {/* Box 1: Ringkasan Hari Ini in Sleek Dark aesthetic */}
          <div className="bb-card text-white bg-[#111111] border-none shadow-md">
            <div className="bb-section-label text-white/40 mb-3">Ringkasan Hari Ini</div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <div className="font-serif text-3xl font-light text-white">{waitingCount}</div>
                <div className="text-xs text-white/50 mt-1">Menunggu Balasan</div>
              </div>
              <div>
                <div className="font-serif text-3xl font-light text-[#6ee7a0]">{deflectionRate}%</div>
                <div className="text-xs text-white/50 mt-1">Resolusi AI</div>
              </div>
            </div>
          </div>

          {/* Box 2: Detail Percakapan Panel */}
          <div className="bb-card">
            <div className="bb-card-title mb-4">Detail Percakapan</div>
            {selectedConversation ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-[#f0ede8]">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nama Pelanggan</p>
                  <p className="text-sm font-semibold text-[#111111] mt-1">{selectedConversation.customer?.name || "Pelanggan WhatsApp"}</p>
                </div>
                <div className="pb-3 border-b border-[#f0ede8]">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nomor WhatsApp</p>
                  <p className="text-sm font-semibold text-[#111111] mt-1">{selectedConversation.customer?.phone || "+62 8xx"}</p>
                </div>
                <div className="pb-3 border-b border-[#f0ede8]">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Percakapan</p>
                  <span className={`inline-block mt-1 bb-badge ${
                    selectedConversation.status === "closed" ? "bb-badge-gray" : selectedConversation.status === "escalated" ? "bb-badge-red" : "bb-badge-green"
                  }`}>
                    {selectedConversation.status.toUpperCase()}
                  </span>
                </div>
                <Link
                  href="/conversations"
                  className="bb-btn bb-btn-dark bb-btn-sm w-full justify-center text-center mt-2"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  Buka Chat Selengkapnya
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-gray-200 text-4xl block mb-2">inbox</span>
                <p className="text-[13px] text-[#aaa]">Pilih pesan untuk melihat detail atau mulai membalas.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}