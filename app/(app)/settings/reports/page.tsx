"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  BarChart3,
  Download,
  TrendingUp,
  MessageSquare,
  Users,
  ShoppingCart,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { Card } from "@/components/design-system"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface OverviewMetric {
  value: number
  change: string | null
}

interface ReportData {
  period: string
  overview: {
    conversations: OverviewMetric
    customers: OverviewMetric
    orders: OverviewMetric
    revenue: OverviewMetric
    responseRate: OverviewMetric
  }
  dailyData: { day: string; conversations: number; orders: number }[]
  topProducts: { name: string; orders: number }[]
}

function formatRupiah(num: number): string {
  if (num >= 1_000_000) return `Rp${(num / 1_000_000).toFixed(1)}jt`
  if (num >= 1_000) return `Rp${(num / 1_000).toFixed(0)}rb`
  return `Rp${num.toLocaleString("id-ID")}`
}

const periodLabels: Record<string, string> = {
  "7d": "7 Hari",
  "30d": "30 Hari",
  "90d": "90 Hari",
}

export default function ReportsPage() {
  const [period, setPeriod] = useState("7d")

  const { data, isLoading, mutate } = useSWR<ReportData>(
    `/api/reports?period=${period}`,
    fetcher,
    { refreshInterval: 60000 }
  )

  const dailyData = data?.dailyData || []
  const maxConversations = Math.max(...dailyData.map((d) => d.conversations), 1)

  const metrics = data?.overview
    ? [
        {
          key: "conversations",
          label: "Percakapan",
          value: data.overview.conversations.value.toLocaleString("id-ID"),
          change: data.overview.conversations.change,
          icon: MessageSquare,
          color: "bg-[#dbeafe] text-[#2563eb]",
        },
        {
          key: "customers",
          label: "Pelanggan Baru",
          value: data.overview.customers.value.toLocaleString("id-ID"),
          change: data.overview.customers.change,
          icon: Users,
          color: "bg-[#dcfce7] text-[#16a34a]",
        },
        {
          key: "orders",
          label: "Pesanan",
          value: data.overview.orders.value.toLocaleString("id-ID"),
          change: data.overview.orders.change,
          icon: ShoppingCart,
          color: "bg-[#fef9c3] text-[#ca8a04]",
        },
        {
          key: "responseRate",
          label: "Response Rate",
          value: `${data.overview.responseRate.value}%`,
          change: data.overview.responseRate.change,
          icon: TrendingUp,
          color: "bg-[#3a7a55]/10 text-[#3a7a55]",
        },
      ]
    : []

  return (
    <div className="min-h-screen bg-[#fafaf8] p-6">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-2xl font-semibold text-[#111111]"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Laporan &amp; Analitik
            </h1>
            <p className="text-sm text-[#8a8580] mt-0.5">
              Data performa bisnis Anda
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Period Selector */}
            <div className="flex items-center gap-1 bg-[#f5f4f0] rounded-xl p-1">
              {Object.entries(periodLabels).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setPeriod(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    period === val
                      ? "bg-white shadow-sm text-[#111111]"
                      : "text-[#8a8580] hover:text-[#111111]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => mutate()}
              className="p-2 rounded-xl border border-[#e5e2dd] bg-white hover:bg-[#f5f4f0] text-[#8a8580] transition-colors"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
            <a
              href={`/api/orders/export?period=${period}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e5e2dd] bg-white text-[#404942] text-sm font-medium hover:bg-[#f5f4f0] transition-colors"
            >
              <Download size={14} />
              Export CSV
            </a>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={24} className="animate-spin text-[#3a7a55]" />
              <p className="text-sm text-[#8a8580]">Memuat laporan...</p>
            </div>
          </div>
        ) : !data ? (
          <Card>
            <div className="px-4 py-3 bg-[#fee2e2] border border-[#fecaca] rounded-xl text-sm text-[#dc2626]">
              Gagal memuat laporan. Coba refresh halaman.
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overview Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((m) => {
                const Icon = m.icon
                return (
                  <Card key={m.key}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-[#8a8580] uppercase tracking-wide">
                        {m.label}
                      </span>
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${m.color}`}
                      >
                        <Icon size={14} />
                      </div>
                    </div>
                    <p className="text-2xl font-semibold text-[#111111]">{m.value}</p>
                    {m.change && (
                      <p
                        className={`text-xs mt-1 font-medium ${
                          m.change.startsWith("↑") ? "text-[#16a34a]" : "text-[#dc2626]"
                        }`}
                      >
                        {m.change}
                      </p>
                    )}
                  </Card>
                )
              })}
            </div>

            {/* Revenue Card */}
            {data.overview.revenue && (
              <Card>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs font-semibold text-[#8a8580] uppercase tracking-wide mb-1">
                      Total Pendapatan
                    </p>
                    <p className="text-3xl font-semibold text-[#111111]">
                      {formatRupiah(data.overview.revenue.value)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#3a7a55]/10 flex items-center justify-center text-[#3a7a55]">
                    <BarChart3 size={22} />
                  </div>
                </div>
                {data.overview.revenue.change && (
                  <p
                    className={`text-xs mt-1 font-medium ${
                      data.overview.revenue.change.startsWith("↑")
                        ? "text-[#16a34a]"
                        : "text-[#dc2626]"
                    }`}
                  >
                    {data.overview.revenue.change}
                  </p>
                )}
              </Card>
            )}

            {/* Bar Chart - Daily Activity */}
            <Card>
              <h2 className="text-sm font-semibold text-[#111111] mb-5">
                Aktivitas Harian — Percakapan &amp; Pesanan
              </h2>
              {dailyData.length === 0 ? (
                <p className="text-sm text-[#8a8580] text-center py-8">
                  Belum ada data untuk periode ini
                </p>
              ) : (
                <>
                  <div className="flex items-end gap-3 h-40">
                    {dailyData.map((d) => (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="w-full flex gap-1 items-end flex-1">
                          <div
                            className="flex-1 bg-[#3a7a55]/15 rounded-t-md transition-all hover:bg-[#3a7a55]/25"
                            style={{
                              height: `${Math.max((d.conversations / maxConversations) * 100, 4)}%`,
                            }}
                            title={`${d.conversations} percakapan`}
                          />
                          <div
                            className="flex-1 bg-[#3a7a55] rounded-t-md transition-all hover:bg-[#1a5e3a]"
                            style={{
                              height: `${Math.max((d.orders / maxConversations) * 100, 4)}%`,
                            }}
                            title={`${d.orders} pesanan`}
                          />
                        </div>
                        <span className="text-[10px] text-[#8a8580]">{d.day}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-[#f0ede8]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-[#3a7a55]/15" />
                      <span className="text-xs text-[#8a8580]">Percakapan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-[#3a7a55]" />
                      <span className="text-xs text-[#8a8580]">Pesanan</span>
                    </div>
                  </div>
                </>
              )}
            </Card>

            {/* Top Products */}
            {data.topProducts && data.topProducts.length > 0 && (
              <Card>
                <h2 className="text-sm font-semibold text-[#111111] mb-4">
                  Produk Terlaris
                </h2>
                <div className="space-y-2">
                  {data.topProducts.map((product, index) => (
                    <div
                      key={product.name}
                      className="flex items-center gap-3 py-2.5 border-b border-[#f0ede8] last:border-0"
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          index === 0
                            ? "bg-[#fef9c3] text-[#ca8a04]"
                            : index === 1
                            ? "bg-[#f0ede8] text-[#8a8580]"
                            : index === 2
                            ? "bg-[#fee2e2] text-[#dc2626]"
                            : "bg-[#f0ede8] text-[#8a8580]"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="flex-1 text-sm text-[#111111] font-medium">
                        {product.name}
                      </span>
                      <span className="text-sm text-[#3a7a55] font-semibold">
                        {product.orders} terjual
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
