"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import {
  Search,
  Plus,
  Phone,
  MessageSquare,
  Loader2,
  MoreHorizontal,
  Mail,
  Clock,
} from "lucide-react"
import { Avatar, StatusBadge, Card } from "@/components/design-system"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Customer {
  id: string
  name: string | null
  phone: string
  lastMessageAt: string | null
  createdAt: string
  _count: { conversations: number; orders: number }
}

interface CustomersResponse {
  customers: Customer[]
  total: number
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "—"
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}j`
  const d = Math.floor(h / 24)
  return `${d}d`
}

const tabs = [
  { label: "Semua", value: "all" },
  { label: "Aktif", value: "active" },
  { label: "Nonaktif", value: "inactive" },
]

export default function CustomersPage() {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const { data, isLoading } = useSWR<CustomersResponse>(
    `/api/customers?search=${encodeURIComponent(search)}`,
    fetcher
  )

  const customers = data?.customers || []

  const filtered = customers.filter((c) => {
    const searchMatch =
      (c.name || c.phone).toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    const hasActivity = c._count.conversations > 0 || c._count.orders > 0
    const tabMatch =
      activeTab === "all" ||
      (activeTab === "active" && hasActivity) ||
      (activeTab === "inactive" && !hasActivity)
    return searchMatch && tabMatch
  })

  const activeCount = customers.filter(
    (c) => c._count.conversations > 0 || c._count.orders > 0
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
              Pelanggan
            </h1>
            <p className="text-sm text-[#8a8580] mt-0.5">
              {data?.total || 0} pelanggan • {activeCount} aktif
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#3a7a55] hover:bg-[#1a5e3a] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
            <Plus size={16} />
            Tambah Pelanggan
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-[#e5e2dd] -mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.value
                  ? "border-[#3a7a55] text-[#3a7a55]"
                  : "border-transparent text-[#8a8580] hover:text-[#111111]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-3 bg-white border-b border-[#e5e2dd]">
        <div className="relative max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8580]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau nomor telepon..."
            className="w-full pl-8 pr-4 py-2 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
          />
        </div>
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
                <MessageSquare size={20} className="text-[#8a8580]" />
              </div>
              <p className="text-sm font-semibold text-[#111111]">Belum ada pelanggan</p>
              <p className="text-xs text-[#8a8580] mt-1">
                Pelanggan akan muncul setelah ada percakapan
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5e2dd]">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#8a8580] uppercase tracking-wide">
                      Pelanggan
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#8a8580] uppercase tracking-wide">
                      Kontak
                    </th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-[#8a8580] uppercase tracking-wide">
                      Pesanan
                    </th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-[#8a8580] uppercase tracking-wide">
                      Percakapan
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#8a8580] uppercase tracking-wide">
                      Terakhir Aktif
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#8a8580] uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ede8]">
                  {filtered.map((customer) => {
                    const hasActivity =
                      customer._count.conversations > 0 || customer._count.orders > 0
                    return (
                      <tr
                        key={customer.id}
                        className="hover:bg-[#f5f4f0]/50 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <Link href={`/customers/${customer.id}`} className="flex items-center gap-3">
                            <Avatar
                              name={customer.name || customer.phone}
                              size="md"
                            />
                            <div>
                              <p className="text-sm font-semibold text-[#111111]">
                                {customer.name || customer.phone}
                              </p>
                              <p className="text-xs text-[#8a8580] mt-0.5">
                                Sejak {formatDate(customer.createdAt)}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <Phone size={12} className="text-[#8a8580]" />
                            <span className="text-sm text-[#404942]">{customer.phone}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-sm font-semibold text-[#111111]">
                            {customer._count.orders}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-sm font-semibold text-[#111111]">
                            {customer._count.conversations}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-[#8a8580]" />
                            <span className="text-sm text-[#8a8580]">
                              {formatRelativeTime(customer.lastMessageAt)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              hasActivity
                                ? "bg-[#dcfce7] text-[#16a34a]"
                                : "bg-[#f0ede8] text-[#6b6b6b]"
                            }`}
                          >
                            {hasActivity ? "Aktif" : "Nonaktif"}
                          </span>
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
    </div>
  )
}