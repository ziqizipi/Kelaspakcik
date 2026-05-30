"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import useSWR from "swr"
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  ShoppingCart,
  Clock,
  MoreVertical,
  Loader2,
  BarChart3,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Order {
  id: string
  amount: string
  paymentStatus: string
  createdAt: string
  description: string | null
}

interface Conversation {
  id: string
  lastMessageAt: string
  status: string
  _count: { messages: number }
}

interface Customer {
  id: string
  name: string | null
  phone: string
  lastMessageAt: string | null
  createdAt: string
  _count: { conversations: number; orders: number }
}

interface CustomerResponse {
  customer: Customer
  orders: Order[]
  conversations: Conversation[]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never"
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  recorded: "bg-green-100 text-green-700",
  confirmed: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

const convStatusColors: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  closed: "bg-gray-100 text-gray-500",
}

export default function CustomerDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [activeTab, setActiveTab] = useState<"orders" | "conversations">("orders")

  const { data, isLoading } = useSWR<CustomerResponse>(`/api/customers/${id}`, fetcher)
  const customer = data?.customer

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Pelanggan tidak ditemukan</p>
      </div>
    )
  }

  const hasActivity = customer._count.conversations > 0 || customer._count.orders > 0

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1
              className="text-lg font-semibold text-on-surface"
              style={{ fontFamily: "Instrument Serif, serif" }}
            >
              Detail Pelanggan
            </h1>
          </div>
          <button className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Customer Info Card */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-medium">
              {(customer.name || customer.phone).charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2
                    className="text-xl font-semibold text-on-surface"
                    style={{ fontFamily: "Instrument Serif, serif" }}
                  >
                    {customer.name || customer.phone}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        hasActivity ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {hasActivity ? "Aktif" : "Nonaktif"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Sejak {formatDate(customer.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mb-2">
                <Phone size={14} className="text-muted-foreground" />
                <span className="text-sm text-on-surface">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-muted-foreground" />
                <span className="text-sm text-on-surface-variant">
                  Aktif {formatRelativeTime(customer.lastMessageAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-5 text-center">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <ShoppingCart size={18} className="text-primary" />
            </div>
            <p className="text-2xl font-semibold text-on-surface">{customer._count.orders}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Pesanan</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-5 text-center">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={18} className="text-primary" />
            </div>
            <p className="text-2xl font-semibold text-on-surface">{customer._count.conversations}</p>
            <p className="text-xs text-muted-foreground mt-1">Percakapan</p>
          </div>
        </div>

        {/* Tabs: Orders / Conversations */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center border-b border-border">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "orders"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-on-surface"
              }`}
            >
              Pesanan ({customer._count.orders})
            </button>
            <button
              onClick={() => setActiveTab("conversations")}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "conversations"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-on-surface"
              }`}
            >
              Percakapan ({customer._count.conversations})
            </button>
          </div>

          <div className="divide-y divide-border">
            {activeTab === "orders" ? (
              data?.orders && data.orders.length > 0 ? (
                data.orders.map((order) => (
                  <div key={order.id} className="px-5 py-4 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-on-surface">{order.id}</span>
                        <span className="text-xs text-muted-foreground">
                          • {formatRelativeTime(order.createdAt)}
                        </span>
                      </div>
                      {order.description && (
                        <p className="text-xs text-on-surface-variant truncate">{order.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-on-surface">
                        {formatRupiah(Number(order.amount))}
                      </p>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          statusColors[order.paymentStatus] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.paymentStatus === "recorded"
                          ? "Lunas"
                          : order.paymentStatus === "confirmed"
                          ? "Dikonfirmasi"
                          : order.paymentStatus === "pending"
                          ? "Menunggu"
                          : order.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-muted-foreground">Belum ada pesanan</p>
                </div>
              )
            ) : data?.conversations && data.conversations.length > 0 ? (
              data.conversations.map((conv) => (
                <div key={conv.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-on-surface">
                        Percakapan #{conv.id.slice(-6)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        • {formatRelativeTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {conv._count.messages} pesan
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      convStatusColors[conv.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {conv.status === "open" ? "Aktif" : conv.status === "pending" ? "Tunda" : "Selesai"}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-muted-foreground">Belum ada percakapan</p>
              </div>
            )}
          </div>
        </div>

        {/* Back Link */}
        <Link
          href="/customers"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-on-surface transition-colors"
        >
          ← Kembali ke daftar pelanggan
        </Link>
      </div>
    </div>
  )
}