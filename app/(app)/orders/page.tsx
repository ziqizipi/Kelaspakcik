"use client"

import { useState } from "react"
import useSWR from "swr"
import { Loader2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Order {
  id: string
  type: "INCOME" | "EXPENSE"
  amount: string
  paymentStatus: "pending" | "recorded" | "confirmed" | "cancelled"
  category: string | null
  description: string | null
  createdAt: string
  customer: {
    id: string
    name: string | null
    phone: string
  }
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function OrdersPage() {
  const [search, setSearch] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")

  // Fetch orders from API
  const { data, isLoading } = useSWR<{ orders: Order[] }>("/api/orders", fetcher)
  const orders = data?.orders || []

  // Filter orders based on user selections
  const filteredOrders = orders.filter((order) => {
    const nameMatch =
      order.customer.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.phone.includes(search) ||
      order.id.toLowerCase().includes(search.toLowerCase())

    const paymentMatch =
      paymentFilter === "all" ||
      (paymentFilter === "lunas" &&
        (order.paymentStatus === "recorded" || order.paymentStatus === "confirmed")) ||
      (paymentFilter === "belum_bayar" && order.paymentStatus === "pending") ||
      (paymentFilter === "refund" && order.paymentStatus === "cancelled")

    const dateMatch = !dateFilter || order.createdAt.startsWith(dateFilter)

    return nameMatch && paymentMatch && dateMatch
  })

  // Export to CSV helper
  function exportCSV() {
    if (filteredOrders.length === 0) return
    const headers = "ID Pesanan,Tanggal,Pelanggan,Items,Total,Status\n"
    const rows = filteredOrders
      .map(
        (o) =>
          `"${o.id}","${new Date(o.createdAt).toLocaleDateString("id-ID")}","${
            o.customer.name || o.customer.phone
          }","${o.description || "Produk"}","${o.amount}","${o.paymentStatus}"`
      )
      .join("\n")

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `laporan-pesanan-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2] p-8 md:p-12 animate-fade-in">
      {/* Editorial Header */}
      <div className="mb-8">
        <div className="text-[11px] font-bold text-[#9a6800] uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
          <span className="w-5 h-[1px] bg-[#9a6800]"></span>
          Logistik & Penjualan
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="bb-page-title mb-1">
              Manajemen <em>Pesanan</em>
            </h1>
            <p className="text-sm text-[#888] italic">
              Kelola siklus hidup pesanan pelanggan Anda.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={exportCSV} className="bb-btn bb-btn-outline bb-btn-sm bg-white">
              <span className="material-symbols-outlined text-[16px]">download</span>
              Ekspor CSV
            </button>
            <button
              onClick={() => alert("Gunakan tombol 'Buat Pesanan' di halaman Chat/Pelanggan untuk merekam pesanan baru.")}
              className="bb-btn bb-btn-dark bb-btn-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Tambah Pesanan
            </button>
          </div>
        </div>
      </div>

      {/* Filter Row Cards in 4 columns grid layout */}
      <div className="bb-card !p-5 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-4">
          {/* Input Search */}
          <div>
            <div className="bb-section-label !mb-1 text-[10px] font-bold uppercase tracking-wide">
              Cari Pesanan
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[17px]">
                search
              </span>
              <input
                type="text"
                placeholder="ID pesanan, nama pelanggan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 border border-[#e0ddd8] bg-[#f7f5f2] rounded-lg text-sm font-sans focus:outline-none focus:border-[#3a7a55] transition-colors"
              />
            </div>
          </div>

          {/* Payment Status Dropdown */}
          <div>
            <div className="bb-section-label !mb-1 text-[10px] font-bold uppercase tracking-wide">
              Status Pembayaran
            </div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3.5 py-2 border border-[#e0ddd8] bg-[#f7f5f2] rounded-lg text-sm font-sans focus:outline-none cursor-pointer appearance-auto"
            >
              <option value="all">Semua</option>
              <option value="lunas">Lunas</option>
              <option value="belum_bayar">Belum Bayar</option>
              <option value="refund">Refund / Cancel</option>
            </select>
          </div>

          {/* Date Selector */}
          <div>
            <div className="bb-section-label !mb-1 text-[10px] font-bold uppercase tracking-wide">
              Rentang Tanggal
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3.5 py-2 border border-[#e0ddd8] bg-[#f7f5f2] rounded-lg text-sm font-sans focus:outline-none"
            />
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch("")
                setPaymentFilter("all")
                setDateFilter("")
              }}
              className="w-full py-2 bg-[#f0ede8] border border-[#e0ddd8] hover:bg-[#ede9e3] text-[#111] rounded-lg text-xs font-semibold font-sans transition-colors cursor-pointer text-center"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Main Orders Table Sheets inside bb-card */}
      <div className="bb-card !p-0 overflow-hidden">
        <div className="bb-card-header flex items-center justify-between !m-0 p-5 border-b border-[#f0ede8]">
          <div className="bb-card-title text-base">Daftar Pesanan</div>
          <span className="bb-badge bb-badge-gray">{filteredOrders.length} pesanan</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#3a7a55]" size={24} />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bb-empty py-20">
            <div className="bb-empty-icon mx-auto mb-4">
              <span className="material-symbols-outlined text-[#bbb]">shopping_bag</span>
            </div>
            <h3>Belum Ada Pesanan</h3>
            <p>Pesanan yang masuk melalui WhatsApp akan ditampilkan otomatis di sini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f7f5f2] border-b border-[#e5e2dd]">
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-[#999] tracking-wider uppercase">
                    ID Pesanan
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-[#999] tracking-wider uppercase">
                    Tanggal
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-[#999] tracking-wider uppercase">
                    Pelanggan
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-[#999] tracking-wider uppercase">
                    Deskripsi
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-[#999] tracking-wider uppercase">
                    Total
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-[#999] tracking-wider uppercase">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-[#999] tracking-wider uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ede8]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#f7f5f2]/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-[#3a7a55] font-semibold">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#888]">
                      {new Date(order.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-semibold text-[#111111]">
                        {order.customer.name || "Pelanggan Tanpa Nama"}
                      </div>
                      <div className="text-xs text-[#888]">{order.customer.phone}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#666] truncate max-w-[200px]">
                      {order.description || "Pesanan Produk"}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-[#111111]">
                      {formatRupiah(parseFloat(order.amount))}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`bb-badge ${
                          order.paymentStatus === "recorded" || order.paymentStatus === "confirmed"
                            ? "bb-badge-green"
                            : order.paymentStatus === "pending"
                            ? "bb-badge-orange"
                            : "bb-badge-red"
                        }`}
                      >
                        {order.paymentStatus === "recorded" || order.paymentStatus === "confirmed"
                          ? "Lunas"
                          : order.paymentStatus === "pending"
                          ? "Belum Bayar"
                          : "Refund"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => alert(`Detail Pesanan: #${order.id}`)}
                        className="text-xs font-semibold text-[#3a7a55] hover:underline"
                      >
                        Lihat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer pagination info */}
        <div className="flex items-center justify-between p-5 border-t border-[#f0ede8]">
          <p className="text-xs text-[#aaa]">Menampilkan {filteredOrders.length} pesanan</p>
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e0ddd8] bg-transparent text-[#aaa] cursor-default">
              <span className="material-symbols-outlined text-[14px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#111] bg-[#111] text-white text-xs font-semibold">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e0ddd8] bg-transparent text-[#aaa] cursor-default">
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}