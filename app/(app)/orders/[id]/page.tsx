"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft, Phone, Mail, MapPin, Clock, ShoppingCart, MoreVertical, Truck, CheckCircle, Loader2 } from "lucide-react"

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
  conversation?: { id: string } | null
}

interface OrderResponse {
  order: Order
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  recorded: "bg-green-100 text-green-700",
  confirmed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
}

const statusLabels: Record<string, string> = {
  pending: "Menunggu",
  recorded: "Lunas",
  confirmed: "Dikonfirmasi",
  cancelled: "Dibatalkan",
}

export default function OrderDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { data, isLoading, mutate } = useSWR<OrderResponse>(`/api/orders/${id}`, fetcher)
  const order = data?.order

  const [updating, setUpdating] = useState(false)

  async function updatePaymentStatus(newStatus: string) {
    setUpdating(true)
    try {
      await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newStatus }),
      })
      mutate()
    } finally {
      setUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Pesanan tidak ditemukan</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/orders" className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1
              className="text-lg font-semibold text-on-surface"
              style={{ fontFamily: "Instrument Serif, serif" }}
            >
              Pesanan {order.id}
            </h1>
            <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${
              statusColors[order.paymentStatus] || "bg-gray-100 text-gray-700"
            }`}
          >
            {statusLabels[order.paymentStatus] || order.paymentStatus}
          </span>
          <button className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Customer Info */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-on-surface mb-3">Pelanggan</h3>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
              {(order.customer.name || order.customer.phone).charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface">
                {order.customer.name || order.customer.phone}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Phone size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{order.customer.phone}</span>
              </div>
            </div>
            {order.customer.id && (
              <Link
                href={`/customers/${order.customer.id}`}
                className="ml-auto text-xs text-primary hover:text-primary-600 font-medium"
              >
                Lihat Profil
              </Link>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-on-surface mb-3">Ringkasan Pesanan</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">ID Pesanan</span>
              <span className="text-sm font-medium text-on-surface">{order.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Kategori</span>
              <span className="text-sm text-on-surface">{order.category || "—"}</span>
            </div>
            {order.description && (
              <div className="flex items-start justify-between">
                <span className="text-xs text-muted-foreground">Deskripsi</span>
                <span className="text-sm text-on-surface text-right max-w-[200px]">{order.description}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-lg font-semibold text-primary">
                {formatRupiah(Number(order.amount))}
              </span>
            </div>
          </div>
        </div>

        {/* Actions — Payment Status */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Update Status Pembayaran
          </p>
          <div className="flex gap-3">
            {order.paymentStatus !== "recorded" && (
              <button
                onClick={() => updatePaymentStatus("recorded")}
                disabled={updating}
                className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 disabled:bg-muted text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {updating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={16} />}
                Tandai Lunas
              </button>
            )}
            {order.paymentStatus !== "confirmed" && (
              <button
                onClick={() => updatePaymentStatus("confirmed")}
                disabled={updating}
                className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-600 disabled:bg-muted text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {updating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={16} />}
                Konfirmasi
              </button>
            )}
            {order.paymentStatus !== "cancelled" && order.paymentStatus !== "recorded" && (
              <button
                onClick={() => updatePaymentStatus("cancelled")}
                disabled={updating}
                className="py-2.5 px-4 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors"
              >
                Batalkan
              </button>
            )}
          </div>
        </div>

        {/* Back Link */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-on-surface transition-colors"
        >
          ← Kembali ke daftar pesanan
        </Link>
      </div>
    </div>
  )
}