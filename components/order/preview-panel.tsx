import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const statusColors: Record<string, { bg: string; color: string }> = {
  recorded: { bg: "#d7effe", color: "#0b5ea8" },
  confirmed: { bg: "#dcf5e7", color: "#1a7a42" },
  delivered: { bg: "#dcf5e7", color: "#1a7a42" },
  pending: { bg: "#fdecc8", color: "#9a6800" },
  processing: { bg: "#d7effe", color: "#0b5ea8" },
  cancelled: { bg: "#ffdad6", color: "#ba1a1a" },
  "cancelled/refund": { bg: "#ffdad6", color: "#ba1a1a" },
}
const defaultBadge = { bg: "#f0ede8", color: "#666" }

export function OrderPreviewPanel({ order, onViewDetail }: { order: any; onViewDetail: () => void }) {
  if (!order) return null
  const badge = statusColors[order.paymentStatus] || defaultBadge

  return (
    <div className="h-full flex flex-col">
      {/* Panel header */}
      <div className="px-6 pt-6 pb-4 border-b border-[#f0ede8]">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-[#111]">Order #{order.id.slice(-6)}</h2>
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{ background: badge.bg, color: badge.color }}
          >
            {order.paymentStatus}
          </span>
        </div>
        <p className="text-sm text-[#888]">
          {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
        {/* Customer info */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#999] mb-3">Informasi Pelanggan</div>
          <div className="bg-[#f7f5f2] rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#888]">Nama</span>
              <span className="font-medium text-[#111]">{order.customer?.name || "—"}</span>
            </div>
            {order.customer?.phone && (
              <div className="flex justify-between text-sm">
                <span className="text-[#888]">Telepon</span>
                <span className="font-medium text-[#111]">{order.customer.phone}</span>
              </div>
            )}
            {order.customer?.email && (
              <div className="flex justify-between text-sm">
                <span className="text-[#888]">Email</span>
                <span className="font-medium text-[#111]">{order.customer.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order items */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#999] mb-3">Item Pesanan</div>
          <div className="space-y-2">
            {order.items?.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#f0ede8] last:border-0">
                <div>
                  <div className="text-sm font-medium text-[#111]">{item.name || `Item ${i + 1}`}</div>
                  <div className="text-xs text-[#aaa]">x{item.qty || 1}</div>
                </div>
                <div className="text-sm font-semibold text-[#111]">Rp{Number(item.price * (item.qty || 1)).toLocaleString("id-ID")}</div>
              </div>
            ))}
            {!order.items?.length && (
              <div className="text-sm text-[#aaa] italic">Tidak ada item.</div>
            )}
          </div>
        </div>

        {/* Order details */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#999] mb-3">Detail Pesanan</div>
          <div className="bg-[#f7f5f2] rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#888]">Total</span>
              <span className="font-bold text-[#111]">Rp{Number(order.amount).toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#888]">Tipe</span>
              <span className="text-[#111]">{order.type || "—"}</span>
            </div>
            {order.category && (
              <div className="flex justify-between text-sm">
                <span className="text-[#888]">Kategori</span>
                <span className="text-[#111]">{order.category}</span>
              </div>
            )}
            {order.paymentMethod && (
              <div className="flex justify-between text-sm">
                <span className="text-[#888]">Metode Pembayaran</span>
                <span className="text-[#111]">{order.paymentMethod}</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Insights */}
        {order.aiTags?.length > 0 && (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#999] mb-3">AI Insights</div>
            <div className="flex flex-wrap gap-2">
              {order.aiTags.map((tag: string) => (
                <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: "#f0ede8", color: "#666" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {order.recommendedActions?.length > 0 && (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#999] mb-3">Aksi Rekomendasi</div>
            <div className="space-y-2">
              {order.recommendedActions.map((action: string, i: number) => (
                <button key={i} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#e0ddd8] text-sm text-[#111] text-left hover:bg-[#f7f5f2] transition-colors">
                  <span className="material-symbols-outlined text-base text-[#9a6800]">bolt</span>
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 pt-4 border-t border-[#f0ede8]">
        <Button onClick={onViewDetail} className="w-full bg-[#111] hover:bg-[#333] text-white rounded-lg py-2.5 text-sm font-semibold">
          Lihat Detail Lengkap
        </Button>
      </div>
    </div>
  )
}