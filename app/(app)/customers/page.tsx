"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Loader2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Customer {
  id: string
  name: string | null
  phone: string
  createdAt: string
  _count: {
    conversations: number
    orders: number
  }
}

interface DetailConversation {
  id: string
  status: string
  lastMessageAt: string
  createdAt: string
}

interface DetailOrder {
  id: string
  type: "INCOME" | "EXPENSE"
  amount: string
  paymentStatus: "pending" | "recorded" | "confirmed" | "cancelled"
  createdAt: string
}

interface CustomerDetail extends Customer {
  conversations: DetailConversation[]
  orders: DetailOrder[]
}

const avatarColors = ["#f0ede8", "#fdecc8", "#dcf5e7", "#d7effe", "#f3e8ff", "#ffe4e1"]

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function CustomersPage() {
  const [search, setSearch] = useState("")
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [activeDetailTab, setActiveDetailTab] = useState<"chat" | "order" | "notes">("chat")
  const [notesText, setNotesText] = useState("")
  const [customNotes, setCustomNotes] = useState<string>(
    "Pelanggan ini sering tanya stok tapi belum jadi beli. Perlu follow up promo khusus."
  )

  // Fetch all customers
  const { data: allCustomersData, isLoading: isListLoading } = useSWR<{
    customers: Customer[]
    total: number
  }>("/api/customers", fetcher)

  const customers = allCustomersData?.customers || []

  // Fetch individual customer detail if selected
  const { data: detailData, isLoading: isDetailLoading } = useSWR<{
    customer: CustomerDetail
  }>(selectedCustomerId ? `/api/customers/${selectedCustomerId}` : null, fetcher)

  const selectedCustomer = detailData?.customer

  // Filtering list of customers
  const filteredCustomers = customers.filter((c) => {
    const term = search.toLowerCase()
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      c.phone.includes(term) ||
      c.id.toLowerCase().includes(term)
    )
  })

  // Calculation for average order value
  let averageOrderValue = "Rp 0"
  if (selectedCustomer && selectedCustomer.orders.length > 0) {
    const totalAmount = selectedCustomer.orders.reduce(
      (sum, ord) => sum + (parseFloat(ord.amount) || 0),
      0
    )
    averageOrderValue = formatRupiah(Math.round(totalAmount / selectedCustomer.orders.length))
  } else if (selectedCustomer) {
    averageOrderValue = "Rp 0"
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2] p-8 md:p-12 animate-fade-in">
      {!selectedCustomerId ? (
        /* ==========================================
           LIST VIEW MODE
           ========================================== */
        <div>
          {/* Header */}
          <div className="mb-8">
            <div className="text-[11px] font-bold text-[#0b5ea8] uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
              <span className="w-5 h-[1px] bg-[#0b5ea8]"></span>
              Basis Data Pelanggan
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="bb-page-title mb-1">
                  Daftar <em>Pelanggan</em>
                </h1>
                <p className="text-sm text-[#888] italic">
                  Kelola dan pantau basis data pelanggan Anda di satu tempat.
                </p>
              </div>
              <button
                onClick={() => alert("Tambah pelanggan baru dapat direkam saat pesan masuk otomatis dari WhatsApp.")}
                className="bb-btn bb-btn-dark bb-btn-sm"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                Tambah Pelanggan
              </button>
            </div>
          </div>

          {/* Search Card */}
          <div className="bb-card !p-4 mb-6 flex items-center gap-4">
            <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau nomor telepon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm font-sans text-[#111]"
            />
            <div className="w-[1px] h-6 bg-[#e5e2dd] hidden md:block"></div>
            <button
              onClick={() => setSearch("")}
              className="bg-transparent border-none text-[#666] text-xs font-semibold cursor-pointer flex items-center gap-1 hover:text-[#111]"
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Clear
            </button>
          </div>

          {/* Customer Cards Grid */}
          {isListLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#0b5ea8]" size={24} />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="bb-card text-center py-20">
              <span className="material-symbols-outlined text-4xl text-gray-200 block mb-2">group</span>
              <p className="text-sm text-[#888]">Tidak ada data pelanggan ditemukan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCustomers.map((c, index) => {
                const color = avatarColors[index % avatarColors.length]
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomerId(c.id)
                      setActiveDetailTab("chat")
                    }}
                    className="bb-card !p-6 cursor-pointer flex items-center gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div
                      style={{ backgroundColor: color }}
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-lg text-black/45"
                    >
                      {c.name ? c.name.charAt(0).toUpperCase() : "WA"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-[#111] truncate">
                        {c.name || "Pelanggan Tanpa Nama"}
                      </div>
                      <div className="text-xs text-[#888] truncate">{c.phone}</div>
                    </div>
                    <span className="material-symbols-outlined text-gray-300 text-[18px]">
                      chevron_right
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        /* ==========================================
           DETAIL PROFILE VIEW MODE
           ========================================== */
        <div>
          {/* Back button */}
          <div
            onClick={() => setSelectedCustomerId(null)}
            className="flex items-center gap-1.5 mb-5 cursor-pointer text-[#888] hover:text-[#111] font-semibold text-[13px] transition-colors duration-150"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kembali ke Daftar
          </div>

          {/* Detail Editorial Header */}
          <div className="mb-8">
            <div className="text-[11px] font-bold text-[#0b5ea8] uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
              <span className="w-5 h-[1px] bg-[#0b5ea8]"></span>
              Profil Pelanggan
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="bb-page-title mb-1">
                  Profil <em>{selectedCustomer?.name ? selectedCustomer.name.split(" ")[0] : "Pelanggan"}</em>
                </h1>
                <p className="text-sm text-[#888] italic">
                  Data lengkap dan riwayat interaksi setiap pelanggan.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Link href="/conversations" className="bb-btn bb-btn-outline bb-btn-sm bg-white">
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  Kirim Pesan
                </Link>
                <Link href="/orders" className="bb-btn bb-btn-dark bb-btn-sm">
                  <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                  Buat Pesanan
                </Link>
              </div>
            </div>
          </div>

          {isDetailLoading || !selectedCustomer ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#0b5ea8]" size={24} />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Card Summary Banner */}
              <div className="bb-card !p-8">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-[#f0ede8] flex items-center justify-center text-[#ccc]">
                      <span className="material-symbols-outlined text-[36px]">person</span>
                    </div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#111] rounded-full flex items-center justify-center cursor-pointer text-white">
                      <span className="material-symbols-outlined text-[13px]">edit</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-2xl text-[#111] flex items-center gap-2 flex-wrap">
                      {selectedCustomer.name || "Pelanggan Tanpa Nama"}
                      <span className="bb-badge bb-badge-green text-[10px]">Pelanggan Setia</span>
                    </div>
                    <div className="flex items-center gap-5 flex-wrap mt-2">
                      <span className="flex items-center gap-1 text-[13px] text-[#666]">
                        <span className="material-symbols-outlined text-[14px] text-[#3a7a55]">
                          call
                        </span>
                        {selectedCustomer.phone}
                      </span>
                      <span className="flex items-center gap-1 text-[13px] text-[#666]">
                        <span className="material-symbols-outlined text-[14px] text-[#3a7a55]">
                          calendar_today
                        </span>
                        Terdaftar sejak{" "}
                        {new Date(selectedCustomer.createdAt).toLocaleDateString("id-ID", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="text-[13px] text-[#888] mt-2">Lokasi: Jakarta, Indonesia</div>
                  </div>
                </div>
              </div>

              {/* Statistics Row Card Panels */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bb-card flex items-center gap-4">
                  <div className="w-11 h-11 bg-[#f0ede8] rounded-lg flex items-center justify-center text-[#666] flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                  </div>
                  <div>
                    <div className="bb-stat-val text-[28px]">
                      {selectedCustomer.conversations.length}
                    </div>
                    <div className="bb-stat-label text-xs">Total Percakapan</div>
                  </div>
                </div>
                <div className="bb-card flex items-center gap-4">
                  <div className="w-11 h-11 bg-[#fdecc8] rounded-lg flex items-center justify-center text-[#9a6800] flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                  </div>
                  <div>
                    <div className="bb-stat-val text-[28px]">{selectedCustomer.orders.length}</div>
                    <div className="bb-stat-label text-xs">Total Pesanan</div>
                  </div>
                </div>
                <div className="bb-card flex items-center gap-4">
                  <div className="w-11 h-11 bg-[#dcf5e7] rounded-lg flex items-center justify-center text-[#3a7a55] flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">trending_up</span>
                  </div>
                  <div>
                    <div className="bb-stat-val text-[28px]">{averageOrderValue}</div>
                    <div className="bb-stat-label text-xs">Rata-rata Nilai Pesanan</div>
                  </div>
                </div>
              </div>

              {/* Toggle tabs for detail page sections */}
              <div className="bb-tabs w-fit">
                <button
                  onClick={() => setActiveDetailTab("chat")}
                  className={`bb-tab ${activeDetailTab === "chat" ? "active" : ""}`}
                >
                  Percakapan
                </button>
                <button
                  onClick={() => setActiveDetailTab("order")}
                  className={`bb-tab ${activeDetailTab === "order" ? "active" : ""}`}
                >
                  Pesanan
                </button>
                <button
                  onClick={() => setActiveDetailTab("notes")}
                  className={`bb-tab ${activeDetailTab === "notes" ? "active" : ""}`}
                >
                  Catatan
                </button>
              </div>

              {/* Main Panel Content splitting to 2 Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left Panel Category sheets */}
                <div className="bb-card">
                  {activeDetailTab === "chat" && (
                    <div>
                      <div className="bb-card-header !m-0 pb-3 border-b border-[#f0ede8] mb-4">
                        <div className="bb-card-title">Riwayat Percakapan</div>
                      </div>
                      {selectedCustomer.conversations.length === 0 ? (
                        <p className="text-sm text-[#888] text-center py-6">
                          Belum ada riwayat percakapan.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {selectedCustomer.conversations.map((conv) => (
                            <div key={conv.id} className="flex gap-4 items-start p-2">
                              <div className="w-8 h-8 rounded-full bg-[#f0ede8] flex items-center justify-center flex-shrink-0 text-gray-400">
                                <span className="material-symbols-outlined text-[16px]">
                                  smart_toy
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between mb-1.5">
                                  <span className="text-xs font-bold text-[#111]">
                                    AI Assistant
                                  </span>
                                  <span className="text-[10px] text-[#aaa]">
                                    {new Date(conv.lastMessageAt).toLocaleDateString("id-ID")}{" "}
                                    {new Date(conv.lastMessageAt).toLocaleTimeString("id-ID", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <div className="bg-[#f7f5f2] p-3 rounded-tr-xl rounded-b-xl text-sm text-[#444] leading-relaxed">
                                  Sesi chat dengan status:{" "}
                                  <strong className="text-[#3a7a55]">
                                    {conv.status.toUpperCase()}
                                  </strong>
                                  . WhatsApp Auto-Reply aktif dan membalas pertanyaan pelanggan
                                  sesuai SOP bisnis Anda.
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeDetailTab === "order" && (
                    <div>
                      <div className="bb-card-header !m-0 pb-3 border-b border-[#f0ede8] mb-4">
                        <div className="bb-card-title">Riwayat Pesanan</div>
                      </div>
                      {selectedCustomer.orders.length === 0 ? (
                        <p className="text-sm text-[#888] text-center py-6">
                          Belum ada riwayat pesanan.
                        </p>
                      ) : (
                        <div className="divide-y divide-[#f0ede8] -mx-6 -mb-6">
                          {selectedCustomer.orders.map((ord) => (
                            <div
                              key={ord.id}
                              className="p-5 flex items-center justify-between hover:bg-[#f7f5f2]/50 transition-colors"
                            >
                              <div>
                                <p className="text-sm font-semibold text-[#111]">
                                  #{ord.id.slice(0, 8).toUpperCase()}
                                </p>
                                <p className="text-xs text-[#888] mt-0.5">
                                  {new Date(ord.createdAt).toLocaleDateString("id-ID")}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-[#111]">
                                  {formatRupiah(parseFloat(ord.amount))}
                                </p>
                                <span
                                  className={`inline-block mt-1 bb-badge ${
                                    ord.paymentStatus === "recorded" ||
                                    ord.paymentStatus === "confirmed"
                                      ? "bb-badge-green"
                                      : ord.paymentStatus === "pending"
                                      ? "bb-badge-orange"
                                      : "bb-badge-red"
                                  }`}
                                >
                                  {ord.paymentStatus === "recorded" ||
                                  ord.paymentStatus === "confirmed"
                                    ? "Lunas"
                                    : ord.paymentStatus === "pending"
                                    ? "Belum Bayar"
                                    : "Cancel"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeDetailTab === "notes" && (
                    <div>
                      <div className="bb-card-header !m-0 pb-3 border-b border-[#f0ede8] mb-4">
                        <div className="bb-card-title">Catatan Tambahan</div>
                      </div>
                      <div className="space-y-4">
                        <textarea
                          placeholder="Tambahkan catatan khusus tentang pelanggan ini..."
                          value={notesText}
                          onChange={(e) => setNotesText(e.target.value)}
                          className="w-full min-h-[100px] p-3 bg-[#f7f5f2] border border-[#e0ddd8] rounded-xl text-sm font-sans focus:outline-none"
                        ></textarea>
                        <button
                          onClick={() => {
                            if (!notesText.trim()) return
                            setCustomNotes(notesText)
                            setNotesText("")
                            alert("Catatan admin berhasil ditambahkan!")
                          }}
                          className="bb-btn bb-btn-dark bb-btn-sm"
                        >
                          Simpan Catatan
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Admin Notes widget + AI insight */}
                <div className="flex flex-col gap-4">
                  {/* Admin Notes Widget */}
                  <div className="bb-card !p-5">
                    <div className="text-[10px] font-bold tracking-wider text-[#999] uppercase mb-3 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">description</span>
                      Catatan Admin
                    </div>
                    <div className="bg-[#f7f5f2] rounded-lg p-4 text-xs text-[#666] leading-relaxed italic">
                      "{customNotes}"
                    </div>
                    <button
                      onClick={() => {
                        setActiveDetailTab("notes")
                        alert("Gunakan tab 'Catatan' di sebelah kiri untuk mengubah catatan pelanggan ini.")
                      }}
                      className="w-full mt-3 flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-[#e0ddd8] hover:border-[#111] hover:text-[#111] rounded-lg text-xs font-semibold text-gray-400 bg-transparent transition-colors font-sans cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                      Tambah Catatan
                    </button>
                  </div>

                  {/* AI insights widget in premium Dark Style */}
                  <div className="bg-[#111111] text-white rounded-2xl p-6 shadow-md border-none">
                    <div className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#6ee7a0] text-[16px]">
                        smart_toy
                      </span>
                      Wawasan AI
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed mb-4">
                      {selectedCustomer.name || "Pelanggan"} cenderung bertanya di pagi hari antara
                      jam 09:00 - 11:00. Minat utama pada kategori Produk A.
                    </p>
                    <div className="flex justify-between text-[11px] text-white/40 mb-4 pb-2 border-b border-white/10">
                      <span>Tingkat Keterlibatan</span>
                      <span className="text-[#6ee7a0] font-bold">Tinggi</span>
                    </div>
                    <button
                      onClick={() => alert("Menjadwalkan follow-up otomatis...")}
                      className="w-full py-2.5 bg-[#222] hover:bg-[#333] border border-white/10 text-white rounded-lg text-xs font-bold font-sans cursor-pointer transition-colors"
                    >
                      Jadwalkan Hubungi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}