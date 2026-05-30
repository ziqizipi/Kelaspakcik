"use client"

import useSWR from "swr"
import Link from "next/link"
import {
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Send,
  BarChart3,
  MessageSquare,
  Users,
  Zap,
  ArrowRight,
  Clock,
} from "lucide-react"
import { KPICard, PageHeader, StatusBadge, IntentBadge, Card } from "@/components/design-system"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

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

interface ActivityItem {
  id: string
  type: "order" | "conversation" | "customer"
  description: string
  time: string
  status?: string
  intent?: string
}

interface ActivityResponse {
  activities: ActivityItem[]
}

function formatRupiah(num: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export default function DashboardPage() {
  const { data: metrics, error, isLoading, mutate } = useSWR<Metrics>("/api/metrics", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  })

  const { data: activityData } = useSWR<ActivityResponse>("/api/activity", fetcher, {
    refreshInterval: 30000,
  })

  const activities = activityData?.activities || []

  const kpiCards = metrics
    ? [
        {
          label: "Total Pesanan",
          value: metrics.totalOrders.toLocaleString("id-ID"),
          trend: metrics.totalOrdersTrend,
          trendPositive: metrics.totalOrdersTrend.startsWith("↑"),
          icon: <ShoppingCart size={18} />,
        },
        {
          label: "Revenue",
          value: formatRupiah(metrics.totalRevenue),
          trend: metrics.revenueTrend,
          trendPositive: metrics.revenueTrend.startsWith("↑"),
          icon: <TrendingUp size={18} />,
        },
        {
          label: "Percakapan Aktif",
          value: metrics.openConversations.toLocaleString("id-ID"),
          trend: metrics.conversationsTrend,
          trendPositive: !metrics.conversationsTrend.startsWith("↓"),
          icon: <MessageSquare size={18} />,
        },
        {
          label: "Menunggu Respons",
          value: metrics.waitingCount.toLocaleString("id-ID"),
          icon: <Users size={18} />,
        },
        {
          label: "AI Deflection",
          value: `${metrics.aiDeflectionRate}%`,
          trend: metrics.deflectionTrend,
          trendPositive: metrics.deflectionTrend.startsWith("↑"),
          icon: <Zap size={18} />,
        },
      ]
    : []

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Top Bar */}
      <div className="bg-white border-b border-[#e5e2dd] px-6 py-4 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold text-[#111111]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Dashboard
          </h1>
          <p className="text-sm text-[#8a8580] mt-0.5">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => mutate()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#e5e2dd] bg-white hover:bg-[#f5f4f0] text-[#404942] text-sm transition-all"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <KPICard
                  key={i}
                  label=""
                  value=""
                  icon={<ShoppingCart size={18} />}
                  loading
                />
              ))
            : kpiCards.map((card) => (
                <KPICard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  trend={card.trend}
                  trendPositive={card.trendPositive}
                  icon={card.icon}
                />
              ))}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/bulk-message"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#3a7a55] hover:bg-[#1a5e3a] text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            <Send size={14} />
            Kirim Pesan Massal
          </Link>
          <Link
            href="/ai-insights"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e5e2dd] hover:bg-[#f5f4f0] text-[#111111] text-sm font-medium rounded-xl transition-colors"
          >
            <BarChart3 size={14} />
            Lihat AI Insights
          </Link>
          <Link
            href="/settings/ai"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e5e2dd] hover:bg-[#f5f4f0] text-[#111111] text-sm font-medium rounded-xl transition-colors"
          >
            <Zap size={14} />
            Pengaturan AI
          </Link>
        </div>

        {/* AI Insight Card */}
        {metrics?.aiInsight && (
          <Card className="!p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#3a7a55]/10 flex items-center justify-center flex-shrink-0">
                <BarChart3 size={18} className="text-[#3a7a55]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#3a7a55] uppercase tracking-wide">
                    AI Insight
                  </span>
                </div>
                <p className="text-sm text-[#404942] leading-relaxed">
                  {metrics.aiInsight}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Activity Feed + Recent Conversations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Feed */}
          <Card className="!p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e5e2dd] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#111111]">Aktivitas Terbaru</h2>
              <Link
                href="/conversations"
                className="text-xs text-[#3a7a55] hover:text-[#1a5e3a] font-medium flex items-center gap-1 transition-colors"
              >
                Lihat semua <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-[#f0ede8]">
              {activities.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-[#f0ede8] flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={18} className="text-[#8a8580]" />
                  </div>
                  <p className="text-sm font-medium text-[#111111]">Belum ada aktivitas</p>
                  <p className="text-xs text-[#8a8580] mt-1">
                    Aktivitas akan muncul setelah ada percakapan masuk
                  </p>
                </div>
              ) : (
                activities.slice(0, 6).map((item) => (
                  <div key={item.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-[#f5f4f0] transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-[#f0ede8] flex items-center justify-center flex-shrink-0">
                      {item.type === "order" ? (
                        <ShoppingCart size={14} className="text-[#8a8580]" />
                      ) : (
                        <MessageSquare size={14} className="text-[#8a8580]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#111111] truncate">{item.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#8a8580] flex items-center gap-1">
                          <Clock size={10} />
                          {item.time}
                        </span>
                        {item.intent && <IntentBadge intent={item.intent} />}
                        {item.status && <StatusBadge status={item.status} label={item.status} />}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Top Customers */}
          <Card className="!p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e5e2dd] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#111111]">Pelanggan Aktif</h2>
              <Link
                href="/customers"
                className="text-xs text-[#3a7a55] hover:text-[#1a5e3a] font-medium flex items-center gap-1 transition-colors"
              >
                Lihat semua <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-[#f0ede8]">
              <div className="py-8 text-center">
                <div className="w-10 h-10 rounded-2xl bg-[#f0ede8] flex items-center justify-center mx-auto mb-3">
                  <Users size={18} className="text-[#8a8580]" />
                </div>
                <p className="text-sm font-medium text-[#111111]">Pelanggan terbaru</p>
                <p className="text-xs text-[#8a8580] mt-1">
                  Lihat daftar pelanggan lengkap di halaman Pelanggan
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}