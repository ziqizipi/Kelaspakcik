"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import {
  Search,
  Plus,
  ShoppingCart,
  Clock,
  Loader2,
  X,
  MoreHorizontal,
  Filter,
  ChevronDown,
} from "lucide-react"
import { StatusBadge, SearchBar, Card } from "@/components/design-system"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Order {
  id: string
  type: "INCOME" | "EXPENSE"
  amount: string
  paymentStatus: "pending" | "recorded" | "confirmed" | "cancelled"
  category: string | null
  description: string | null
  createdAt: string
  customer: { id: string; name: string | null; phone: string }
  _count?: { items: number }
}

interface OrdersResponse {
  orders: Order[]
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}j`
  const d = Math.floor(h / 24)
  return `${d}d`
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Menunggu", color: "pending" },
  recorded: { label: "Lunas", color: "recorded" },
  confirmed: { label: "Dikonfirmasi", color: "confirmed" },
  cancelled: { label: "Dibatalkan", color: "cancelled" },
}

const tabs = [
  { label: "Semua", value: "all" },
  { label: "Menunggu", value: "pending" },
  { label: "Lunas", value: "delivered" },
  { label: "Dibatalkan", value: "cancelled" },
]

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)

  const { data, isLoading } = useSWR<OrdersResponse>("/api/orders", fetcher)
  const orders = data?.orders || []

  const filtered = orders.filter((o) => {
    const searchMatch =
      (o.customer.name?.toLowerCase().includes(search.toLowerCase()) || false) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.phone.includes(search)
    const tabMatch =
      activeTab === "all" ||
      (activeTab === "delivered" &&
        (o.paymentStatus === "recorded" || o.paymentStatus === "confirmed")) ||
      o.paymentStatus === activeTab
    return searchMatch && tabMatch
  })

  const totalCount = orders.length
  const pendingCount = orders.filter((o) => o.paymentStatus === "pending").length
  const deliveredCount = orders.filter(
    (o) => o.paymentStatus === "recorded" || o.paymentStatus === "confirmed"
  ).length

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e2dd] px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1
              className="text-2xl font-semibold text-[#111111]"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Pesanan
            </h1>
            <p className="text-sm text-[#8a8580] mt-0.5">
              {totalCount} pesanan • {pendingCount} menunggu
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#3a7a55] hover:bg-[#1a5e3a] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Plus size={16} />
            Tambah Pesanan
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-[#e5e2dd] -mb-4 overflow-x-auto">
          {tabs.map((tab) => {
            const count =
              tab.value === "all"
                ? totalCount
                : tab.value === "pending"
                ? pendingCount
                : tab.value === "delivered"
                ? deliveredCount
                : null
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.value
                    ? "border-[#3a7a55] text-[#3a7a55]"
                    : "border-transparent text-[#8a8580] hover:text-[#111111]"
                }`}
              >
                {tab.label}
                {count !== null && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${
                      activeTab === tab.value
                        ? "bg-[#3a7a55]/10 text-[#3a7a55]"
                        : "bg-[#f0ede8] text-[#8a8580]"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="px-6 py-3 bg-white border-b border-[#e5e2dd] flex items-center gap-3">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8580]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID pesanan atau nama..."
              className="w-full pl-8 pr-4 py-2 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
            />
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#e5e2dd] bg-white text-[#404942] text-sm hover:bg-[#f5f4f0] transition-colors">
          <Filter size={14} />
          Filter
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Table */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-2xl border border-[#e5e2dd] overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 size={20} className="animate-spin text-[#8a8580]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#f0ede8] flex items-center justify-center mx-auto mb-3">
                <ShoppingCart size={20} className="text-[#8a8580]" />
              </div>
              <p className="text-sm font-semibold text-[#111111]">Belum ada pesanan</p>
              <p className="text-xs text-[#8a8580] mt-1">
                Pesanan akan muncul di sini setelah dibuat
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5e2dd]">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#8a8580] uppercase tracking-wide">
                      Pesanan
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#8a8580] uppercase tracking-wide">
                      Pelanggan
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#8a8580] uppercase tracking-wide">
                      Items
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-[#8a8580] uppercase tracking-wide">
                      Total
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#8a8580] uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#8a8580] uppercase tracking-wide">
                      Tanggal
                    </th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ede8]">
                  {filtered.map((order) => {
                    const status = statusConfig[order.paymentStatus] || {
                      label: order.paymentStatus,
                      color: "pending",
                    }
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-[#f5f4f0]/50 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/orders/${order.id}`}
                            className="text-sm font-semibold text-[#3a7a55] hover:text-[#1a5e3a] transition-colors"
                          >
                            #{order.id.slice(0, 8).toUpperCase()}
                          </Link>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-[#111111]">
                            {order.customer.name || order.customer.phone}
                          </p>
                          {order.customer.name && (
                            <p className="text-xs text-[#8a8580] mt-0.5">
                              {order.customer.phone}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <ShoppingCart size={12} className="text-[#8a8580]" />
                            <span className="text-sm text-[#404942]">
                              {order._count?.items || 0} items
                            </span>
                          </div>
                          {order.description && (
                            <p className="text-xs text-[#8a8580] truncate max-w-[180px] mt-0.5">
                              {order.description}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-semibold text-[#111111]">
                            {formatRupiah(Number(order.amount))}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={status.color} label={status.label} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-[#8a8580]" />
                            <span className="text-sm text-[#8a8580]">
                              {formatRelativeTime(order.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <button className="p-1.5 rounded-lg hover:bg-[#f0ede8] text-[#8a8580] transition-colors">
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#e5e2dd] w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e2dd]">
              <h2
                className="text-lg font-semibold text-[#111111]"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Tambah Pesanan
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg hover:bg-[#f5f4f0] text-[#8a8580]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#8a8580] text-center py-8">
                Form tambah pesanan dapat diakses dari percakapan pelanggan.
                <br />
                Gunakan fitur "Buat Pesanan" di dalam percakapan untuk membuat pesanan baru.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-[#e5e2dd] flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-[#e5e2dd] text-[#404942] text-sm font-medium hover:bg-[#f5f4f0] transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}