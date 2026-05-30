"use client"

import useSWR from "swr"
import Link from "next/link"
import {
  Brain,
  TrendingUp,
  MessageSquare,
  Zap,
  BarChart3,
  ArrowLeft,
  Loader2,
  ShoppingCart,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
} from "lucide-react"
import { Card, IntentBadge } from "@/components/design-system"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface IntentStat {
  intent: string
  count: number
}

interface AIConfig {
  isEnabled: boolean
  tone: string | null
  sopContext: string | null
  dailyRecapEnabled: boolean
}

interface Metrics {
  aiDeflectionRate: string
  openConversations: number
  totalOrders: number
  aiInsight: string
}

const intentLabels: Record<string, string> = {
  ORDER: "Pesanan",
  COMPLAINT: "Keluhan",
  PRODUCT_INQUIRY: "Pertanyaan Produk",
  FOLLOW_UP: "Tindak Lanjut",
  GENERAL: "Umum",
}

const intentColors: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  ORDER: {
    bg: "bg-[#dcfce7]",
    text: "text-[#16a34a]",
    icon: <ShoppingCart size={16} />,
  },
  COMPLAINT: {
    bg: "bg-[#fee2e2]",
    text: "text-[#dc2626]",
    icon: <AlertTriangle size={16} />,
  },
  PRODUCT_INQUIRY: {
    bg: "bg-[#dbeafe]",
    text: "text-[#2563eb]",
    icon: <HelpCircle size={16} />,
  },
  FOLLOW_UP: {
    bg: "bg-[#fef9c3]",
    text: "text-[#ca8a04]",
    icon: <ArrowRight size={16} />,
  },
  GENERAL: {
    bg: "bg-[#f0ede8]",
    text: "text-[#6b6b6b]",
    icon: <MessageSquare size={16} />,
  },
}

export default function AIInsightsPage() {
  const { data: metricsData, isLoading: metricsLoading } = useSWR<Metrics>(
    "/api/metrics",
    fetcher,
    { refreshInterval: 30000 }
  )

  const { data: intentData, isLoading: intentLoading } = useSWR<{
    stats: IntentStat[]
  }>("/api/ai/intent-stats", fetcher, { refreshInterval: 30000 })

  const { data: configData } = useSWR<{ config: AIConfig | null }>(
    "/api/ai/config",
    fetcher
  )

  const intentStats = intentData?.stats || []
  const totalIntentCount = intentStats.reduce((sum, s) => sum + s.count, 0)
  const config = configData?.config

  const deflectionRate = metricsData?.aiDeflectionRate
    ? parseInt(metricsData.aiDeflectionRate)
    : 0

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e2dd] px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl hover:bg-[#f5f4f0] transition-colors text-[#8a8580]"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1
              className="text-2xl font-semibold text-[#111111]"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              AI <em className="text-[#3a7a55] not-italic">Insight</em>
            </h1>
            <p className="text-sm text-[#8a8580] mt-0.5">
              Analitik dan performa AI BalasBro
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-4xl space-y-6">
        {/* AI Status Card */}
        {config && (
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    config.isEnabled
                      ? "bg-[#3a7a55]/10 text-[#3a7a55]"
                      : "bg-[#f0ede8] text-[#8a8580]"
                  }`}
                >
                  <Brain size={22} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111111]">
                    Status AI Auto-Reply
                  </p>
                  <p className="text-xs text-[#8a8580] mt-0.5">
                    {config.isEnabled
                      ? `Aktif • Gaya: ${config.tone || "Ramah"}`
                      : "Nonaktif"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    config.isEnabled
                      ? "bg-[#dcfce7] text-[#16a34a]"
                      : "bg-[#f0ede8] text-[#6b6b6b]"
                  }`}
                >
                  {config.isEnabled ? "Aktif" : "Nonaktif"}
                </span>
                <Link
                  href="/settings/ai"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e5e2dd] text-[#404942] text-xs font-medium hover:bg-[#f5f4f0] transition-colors"
                >
                  <Zap size={12} />
                  Pengaturan AI
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            {metricsLoading ? (
              <div className="animate-pulse">
                <div className="h-3 w-20 bg-[#f0ede8] rounded mb-3" />
                <div className="h-8 w-12 bg-[#f0ede8] rounded mb-2" />
                <div className="h-2 w-16 bg-[#f0ede8] rounded" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#8a8580] uppercase tracking-wide">
                    AI Deflection
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#3a7a55]/10 flex items-center justify-center text-[#3a7a55]">
                    <Zap size={14} />
                  </div>
                </div>
                <p className="text-3xl font-semibold text-[#111111]">
                  {deflectionRate}%
                </p>
                <p className="text-xs text-[#8a8580] mt-1">
                  Pesan terselesaikan AI
                </p>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 rounded-full bg-[#f0ede8]">
                  <div
                    className="h-full bg-[#3a7a55] rounded-full transition-all"
                    style={{ width: `${deflectionRate}%` }}
                  />
                </div>
              </>
            )}
          </Card>

          <Card>
            {metricsLoading ? (
              <div className="animate-pulse">
                <div className="h-3 w-20 bg-[#f0ede8] rounded mb-3" />
                <div className="h-8 w-12 bg-[#f0ede8] rounded" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#8a8580] uppercase tracking-wide">
                    Percakapan Aktif
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#dbeafe] flex items-center justify-center text-[#2563eb]">
                    <MessageSquare size={14} />
                  </div>
                </div>
                <p className="text-3xl font-semibold text-[#111111]">
                  {metricsData?.openConversations?.toLocaleString("id-ID") || "0"}
                </p>
                <p className="text-xs text-[#8a8580] mt-1">Saat ini aktif</p>
              </>
            )}
          </Card>

          <Card>
            {metricsLoading ? (
              <div className="animate-pulse">
                <div className="h-3 w-20 bg-[#f0ede8] rounded mb-3" />
                <div className="h-8 w-12 bg-[#f0ede8] rounded" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#8a8580] uppercase tracking-wide">
                    Total Pesanan
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#fef9c3] flex items-center justify-center text-[#ca8a04]">
                    <ShoppingCart size={14} />
                  </div>
                </div>
                <p className="text-3xl font-semibold text-[#111111]">
                  {metricsData?.totalOrders?.toLocaleString("id-ID") || "0"}
                </p>
                <p className="text-xs text-[#8a8580] mt-1">Semua waktu</p>
              </>
            )}
          </Card>
        </div>

        {/* AI Insight Box */}
        {metricsData?.aiInsight && (
          <Card>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#3a7a55]/10 flex items-center justify-center flex-shrink-0 text-[#3a7a55]">
                <BarChart3 size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-[#3a7a55] uppercase tracking-wide">
                    AI Insight Terbaru
                  </span>
                </div>
                <p className="text-sm text-[#404942] leading-relaxed">
                  {metricsData.aiInsight}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Intent Distribution */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#f0ede8] flex items-center justify-center text-[#8a8580]">
              <TrendingUp size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#111111]">
                Distribusi Intent Pesan
              </h2>
              <p className="text-xs text-[#8a8580]">
                Klasifikasi pesan masuk oleh AI
              </p>
            </div>
          </div>

          {intentLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-8 w-24 bg-[#f0ede8] rounded-full" />
                  <div className="flex-1 h-2 bg-[#f0ede8] rounded-full" />
                  <div className="h-3 w-10 bg-[#f0ede8] rounded" />
                </div>
              ))}
            </div>
          ) : intentStats.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-[#f0ede8] flex items-center justify-center mx-auto mb-3">
                <Brain size={20} className="text-[#8a8580]" />
              </div>
              <p className="text-sm font-semibold text-[#111111]">
                Belum ada data intent
              </p>
              <p className="text-xs text-[#8a8580] mt-1 max-w-[240px] mx-auto">
                Data akan muncul setelah ada pesan masuk dan diproses oleh AI
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {intentStats.map((item) => {
                const pct =
                  totalIntentCount > 0
                    ? Math.round((item.count / totalIntentCount) * 100)
                    : 0
                const style =
                  intentColors[item.intent] || intentColors["GENERAL"]
                return (
                  <div key={item.intent} className="flex items-center gap-3">
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold w-40 flex-shrink-0 ${style.bg} ${style.text}`}
                    >
                      <span className="opacity-70">{style.icon}</span>
                      {intentLabels[item.intent] || item.intent}
                    </div>
                    <div className="flex-1 h-2 bg-[#f0ede8] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.intent === "COMPLAINT"
                            ? "bg-[#dc2626]"
                            : item.intent === "ORDER"
                            ? "bg-[#16a34a]"
                            : item.intent === "PRODUCT_INQUIRY"
                            ? "bg-[#2563eb]"
                            : item.intent === "FOLLOW_UP"
                            ? "bg-[#ca8a04]"
                            : "bg-[#8a8580]"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-right w-20 flex-shrink-0">
                      <span className="text-sm font-semibold text-[#111111]">
                        {item.count}
                      </span>
                      <span className="text-xs text-[#8a8580] ml-1">({pct}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/settings/ai"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#3a7a55] hover:bg-[#1a5e3a] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Zap size={14} />
            Konfigurasi AI
          </Link>
          <Link
            href="/conversations"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e5e2dd] hover:bg-[#f5f4f0] text-[#111111] text-sm font-semibold rounded-xl transition-colors"
          >
            <MessageSquare size={14} />
            Lihat Percakapan
          </Link>
          <Link
            href="/settings/reports"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e5e2dd] hover:bg-[#f5f4f0] text-[#111111] text-sm font-semibold rounded-xl transition-colors"
          >
            <BarChart3 size={14} />
            Laporan Lengkap
          </Link>
        </div>
      </div>
    </div>
  )
}
