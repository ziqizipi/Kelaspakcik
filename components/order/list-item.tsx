import { Badge } from "@/components/ui/badge"
import { ShoppingBag } from "lucide-react"

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

export function OrderListItem({ order, isActive, onClick }: { order: any; isActive?: boolean; onClick: () => void }) {
  const badge = statusColors[order.paymentStatus] || defaultBadge

  return (
    <tr
      onClick={onClick}
      className={`cursor-pointer transition-colors border-b border-[#f0ede8] ${isActive ? "bg-[#faf8f5]" : "hover:bg-[#faf8f5]"}`}
    >
      <td className="px-5 py-3.5">
        <span className="text-sm font-semibold text-[#111]">#{order.id.slice(-6)}</span>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-sm text-[#555]">{new Date(order.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#f0ede8] flex items-center justify-center shrink-0">
            <ShoppingBag className="h-4 w-4 text-[#bbb]" />
          </div>
          <div>
            <div className="text-sm font-medium text-[#111]">{order.customer?.name || "—"}</div>
            <div className="text-xs text-[#aaa]">{order.customer?.phone || "—"}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-sm text-[#555]">{order.items?.length || 1} item</span>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-sm font-semibold text-[#111]">Rp{Number(order.amount).toLocaleString("id-ID")}</span>
      </td>
      <td className="px-5 py-3.5">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold"
          style={{ background: badge.bg, color: badge.color }}
        >
          {order.paymentStatus}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <button
          onClick={e => { e.stopPropagation(); onClick() }}
          className="text-sm font-medium text-[#9a6800] hover:underline"
        >
          Lihat
        </button>
      </td>
    </tr>
  )
}