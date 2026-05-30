# BalasBro.ai Frontend MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build all frontend pages and UI features assigned to the frontend developer in the MVP task division.

**Architecture:**
- Frontend: Next.js App Router, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- State: React useState + SWR for data fetching (no Redux)
- Auth: NextAuth v5 via `@/auth` helper
- Design: Custom "Forest Intelligence" system (warm off-white, forest green primary, gold accent)
- Multi-tenancy: All API calls scoped via `session.user.businessId`

**Tech Stack:** Next.js 16, React 19, SWR, Tailwind 4, shadcn/ui (Base UI), Lucide icons, Google Fonts (Instrument Serif + Inter)

---

## File Map

### New Pages
| File | Route | Purpose |
|------|-------|---------|
| `app/(app)/customers/page.tsx` | `/customers` | Customer list with search |
| `app/(app)/customers/[id]/page.tsx` | `/customers/[id]` | Customer detail + history |
| `app/(app)/settings/ai/page.tsx` | `/settings/ai` | AI auto-reply config |
| `app/(app)/settings/escalation/page.tsx` | `/settings/escalation` | Escalation rules management |
| `app/(app)/settings/reports/page.tsx` | `/settings/reports` | Daily recap settings |

### New Components
| File | Purpose |
|------|---------|
| `components/customer/list-item.tsx` | Customer row in list |
| `components/customer/detail-panel.tsx` | Customer detail with order/history tabs |
| `components/conversation/real-time-chat-panel.tsx` | Chat panel with 5s polling + intent badges |
| `components/dashboard/bulk-message-modal.tsx` | Bulk WhatsApp broadcast modal |
| `components/order/detail-panel.tsx` | Enhanced order detail (needs polish) |
| `components/settings/ai-config-card.tsx` | AI tone/SOP/working hours form |
| `components/settings/escalation-rules-list.tsx` | List + add/edit escalation rules |
| `components/shared/dashboard-quick-actions.tsx` | Quick actions panel |

### Existing Files to Modify
| File | Change |
|------|--------|
| `app/(app)/dashboard/page.tsx` | Wire bulk message modal, fix quick actions nav |
| `app/(app)/conversations/[id]/page.tsx` | Replace mock ChatPanel with real-time version |
| `app/(app)/orders/[id]/page.tsx` | Add payment status update + notes |
| `app/(app)/settings/layout.tsx` | Add "AI" and "Escalation" nav items |
| `components/order/detail-panel.tsx` | Add "Update Payment Status" action |
| `components/layout/sidebar.tsx` | Add "Pelanggan" nav item (already there) |
| `lib/whatsapp.ts` | Ensure `sendWhatsAppMessage` is exported correctly |

### API Routes Needed (Backend — friend implements, but frontend depends on them)
| Route | Purpose |
|-------|---------|
| `GET /api/customers` | List customers with search/pagination |
| `GET /api/customers/[id]` | Customer detail with orders + conversations |
| `POST /api/messages` | Send outbound WA message (wire to WhatsApp API) |
| `GET /api/conversations/[id]/messages` | Already exists |
| `GET /api/ai/config` | Get AI auto-reply config |
| `PATCH /api/ai/config` | Update AI auto-reply config |
| `GET /api/escalation-rules` | List escalation rules |
| `POST /api/escalation-rules` | Create escalation rule |
| `PATCH /api/escalation-rules/[id]` | Update rule |
| `DELETE /api/escalation-rules/[id]` | Delete rule |
| `POST /api/bulk-message` | Send bulk WhatsApp message |

---

## Task Breakdown

### Task 1: Customers Page

**Files:**
- Create: `app/(app)/customers/page.tsx`
- Create: `app/(app)/customers/[id]/page.tsx`
- Create: `components/customer/list-item.tsx`
- Create: `components/customer/detail-panel.tsx`
- Modify: `components/layout/sidebar.tsx` — already has Pelanggan nav item
- Modify: `app/(app)/settings/layout.tsx` — add AI sub-nav item

**Prerequisites:** Friend must implement `GET /api/customers` and `GET /api/customers/[id]`

- [ ] **Step 1: Create customer list item component**

```tsx
// components/customer/list-item.tsx
"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Customer {
  id: string
  name: string | null
  phone: string
  lastMessageAt: string | null
  _count?: { conversations: number; orders: number }
}

export function CustomerListItem({ customer, isActive, onClick }: { customer: Customer; isActive?: boolean; onClick: () => void }) {
  const initials = (customer.name || customer.phone || "?").slice(0, 2).toUpperCase()

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all duration-150",
        isActive ? "bg-[#111]" : "hover:bg-[#f7f5f2]"
      )}
    >
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback
          className={cn(
            "text-xs font-semibold",
            isActive ? "bg-white/20 text-white" : "bg-[#f0ede8] text-[#888]"
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between mb-0.5">
          <p className={cn("truncate text-sm font-semibold", isActive ? "text-white" : "text-[#111]")}>
            {customer.name || customer.phone}
          </p>
          <span className={cn("text-xs", isActive ? "text-white/50" : "text-[#aaa]")}>
            {customer.lastMessageAt
              ? new Date(customer.lastMessageAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
              : ""}
          </span>
        </div>
        <p className={cn("truncate text-xs", isActive ? "text-white/60" : "text-[#888]")}>
          {customer._count?.conversations || 0} percakapan · {customer._count?.orders || 0} pesanan
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create customer detail panel component**

```tsx
// components/customer/detail-panel.tsx
"use client"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

type Tab = "conversations" | "orders"

interface CustomerDetail {
  id: string
  name: string | null
  phone: string
  waId: string | null
  createdAt: string
  conversations: Array<{
    id: string
    status: string
    lastMessageAt: string
    _count: { messages: number }
  }>
  orders: Array<{
    id: string
    amount: string
    paymentStatus: string
    createdAt: string
  }>
}

export function CustomerDetailPanel({ customer }: { customer: CustomerDetail | null }) {
  const [activeTab, setActiveTab] = useState<Tab>("conversations")

  if (!customer) return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-[#f0ede8] flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-2xl text-[#bbb]">person</span>
      </div>
      <p className="text-sm text-[#888]">Pilih pelanggan untuk melihat detail.</p>
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-[#f0ede8] overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-[#f0ede8]">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-full bg-[#f0ede8] flex items-center justify-center text-sm font-bold text-[#666]">
            {(customer.name || customer.phone || "?").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#111]">{customer.name || "—"}</h2>
            <p className="text-sm text-[#888]">{customer.phone}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {customer.waId && <Badge className="bg-[#dcf5e7] text-[#1a7a42] text-xs">WA ID: {customer.waId}</Badge>}
          <Badge className="bg-[#f0ede8] text-[#666] text-xs">
            sejak {new Date(customer.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#f0ede8]">
        <button
          onClick={() => setActiveTab("conversations")}
          className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "conversations"
              ? "border-[#111] text-[#111]"
              : "border-transparent text-[#888] hover:text-[#111]"
          }`}
        >
          Percakapan ({customer.conversations.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "orders"
              ? "border-[#111] text-[#111]"
              : "border-transparent text-[#888] hover:text-[#111]"
          }`}
        >
          Pesanan ({customer.orders.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-5">
        {activeTab === "conversations" && (
          <div className="space-y-3">
            {customer.conversations.length === 0 ? (
              <p className="text-sm text-[#aaa] italic text-center py-4">Belum ada percakapan.</p>
            ) : (
              customer.conversations.map(conv => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between py-3 border-b border-[#f0ede8] last:border-0 cursor-pointer hover:bg-[#f7f5f2] px-2 -mx-2 rounded-lg transition-colors"
                  onClick={() => window.location.href = `/conversations/${conv.id}`}
                >
                  <div>
                    <p className="text-sm font-medium text-[#111]">#{conv.id.slice(-6)}</p>
                    <p className="text-xs text-[#aaa]">
                      {conv._count.messages} pesan · {new Date(conv.lastMessageAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    conv.status === "open" ? "bg-[#dcf5e7] text-[#1a7a42]" :
                    conv.status === "escalated" ? "bg-[#ffdad6] text-[#ba1a1a]" :
                    "bg-[#f0ede8] text-[#666]"
                  }`}>
                    {conv.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-3">
            {customer.orders.length === 0 ? (
              <p className="text-sm text-[#aaa] italic text-center py-4">Belum ada pesanan.</p>
            ) : (
              customer.orders.map(order => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 border-b border-[#f0ede8] last:border-0 cursor-pointer hover:bg-[#f7f5f2] px-2 -mx-2 rounded-lg transition-colors"
                  onClick={() => window.location.href = `/orders/${order.id}`}
                >
                  <div>
                    <p className="text-sm font-medium text-[#111]">#{order.id.slice(-6)}</p>
                    <p className="text-xs text-[#aaa]">
                      {new Date(order.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#111]">Rp{Number(order.amount).toLocaleString("id-ID")}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      order.paymentStatus === "recorded" || order.paymentStatus === "confirmed" ? "bg-[#dcf5e7] text-[#1a7a42]" :
                      order.paymentStatus === "pending" ? "bg-[#fdecc8] text-[#9a6800]" :
                      "bg-[#ffdad6] text-[#ba1a1a]"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create customers list page**

```tsx
// app/(app)/customers/page.tsx
"use client"
import { useState } from "react"
import useSWR from "swr"
import { CustomerListItem } from "@/components/customer/list-item"
import { CustomerDetailPanel } from "@/components/customer/detail-panel"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Instrument_Serif, Inter } from "next/font/google"

const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: ["400"], style: ["normal", "italic"], variable: "--font-instrument-serif", display: "swap" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function CustomersPage() {
  const { data, isLoading } = useSWR("/api/customers", fetcher)
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  const customers = data?.customers || []
  const filtered = customers.filter((c: any) => {
    const searchLower = search.toLowerCase()
    return (c.name || c.phone || "").toLowerCase().includes(searchLower)
  })

  function handleSelectCustomer(customer: any) {
    setSelectedId(customer.id === selectedId ? null : customer.id)
    setSelectedCustomer(customer.id === selectedId ? null : customer)
  }

  return (
    <div className={`${instrumentSerif.variable} ${inter.variable} flex h-full`} style={{ fontFamily: "var(--font-inter, 'Inter', sans-serif)" }}>
      {/* Left: Customer List */}
      <div className="w-80 shrink-0 flex flex-col border-r overflow-hidden" style={{ borderColor: "#e5e2dd", background: "#fff" }}>
        <div className="px-6 pt-6 pb-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#3a7a55] mb-1" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 20, height: 1, background: "#3a7a55", display: "inline-block" }} />
            Pelanggan
          </div>
          <h2 className="text-[24px] font-normal tracking-[-0.02em] text-[#111] mb-4" style={{ fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif" }}>
            Semua <em style={{ fontStyle: "italic", color: "#3a7a55" }}>Pelanggan</em>
          </h2>
          {/* Search */}
          <div className="relative mb-3">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[17px] text-[#aaa]">search</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari pelanggan..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#e0ddd8] text-sm bg-[#f7f5f2] outline-none placeholder:text-[#aaa]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto px-3 pb-4 space-y-1">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2.5 w-32" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#f0ede8] flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-2xl text-[#bbb]">person_off</span>
              </div>
              <p className="text-sm text-[#888]">Pelanggan tidak ditemukan.</p>
            </div>
          ) : (
            filtered.map((c: any) => (
              <CustomerListItem
                key={c.id}
                customer={c}
                isActive={c.id === selectedId}
                onClick={() => handleSelectCustomer(c)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right: Customer Detail */}
      <div className="flex-1 overflow-auto p-6" style={{ background: "#fafaf8" }}>
        <CustomerDetailPanel customer={selectedCustomer} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create customer detail page**

```tsx
// app/(app)/customers/[id]/page.tsx
"use client"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { CustomerDetailPanel } from "@/components/customer/detail-panel"
import { Skeleton } from "@/components/ui/skeleton"
import { Instrument_Serif, Inter } from "next/font/google"

const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: ["400"], style: ["normal", "italic"], variable: "--font-instrument-serif", display: "swap" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function CustomerDetailPage() {
  const { id } = useParams()
  const { data, isLoading } = useSWR(id ? `/api/customers/${id}` : null, fetcher)
  const customer = data?.customer

  return (
    <div className={`${instrumentSerif.variable} ${inter.variable}`} style={{ fontFamily: "var(--font-inter, 'Inter', sans-serif)" }}>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="block w-5 h-px bg-[#3a7a55]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#3a7a55]">Pelanggan</span>
        </div>
        <h1 className="text-[26px] font-normal tracking-[-0.02em] text-[#111]" style={{ fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif" }}>
          Detail <em style={{ fontStyle: "italic", color: "#3a7a55" }}>Pelanggan</em>
        </h1>
      </div>
      {isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : customer ? (
        <CustomerDetailPanel customer={customer} />
      ) : (
        <div className="bg-white rounded-xl border border-[#f0ede8] p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#f0ede8] flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl text-[#bbb]">person_off</span>
          </div>
          <p className="text-sm text-[#888]">Pelanggan tidak ditemukan.</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/(app)/customers components/customer
git commit -m "feat: add customers page with list and detail view"
```

---

### Task 2: Real-Time Conversation Polling

**Files:**
- Modify: `components/conversation/chat-panel.tsx` — add 5s polling + intent badges
- Modify: `app/(app)/conversations/[id]/page.tsx` — ensure it uses real data

**Prerequisites:** `GET /api/conversations/[id]/messages` must work

- [ ] **Step 1: Upgrade ChatPanel with real-time polling and intent badges**

```tsx
// components/conversation/chat-panel.tsx
// REPLACE existing file with this version
"use client"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import useSWR from "swr"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then(r => r.json())

const intentConfig: Record<string, { bg: string; color: string; icon: string; label: string }> = {
  ORDER: { bg: "#dcf5e7", color: "#1a7a42", icon: "shopping_bag", label: "Order" },
  PRODUCT_INQUIRY: { bg: "#d7effe", color: "#0b5ea8", icon: "help", label: "Tanya Produk" },
  COMPLAINT: { bg: "#ffdad6", color: "#ba1a1a", icon: "sentiment_very_dissatisfied", label: "Komplain" },
  FOLLOW_UP: { bg: "#fdecc8", color: "#9a6800", icon: "schedule", label: "Follow Up" },
  GENERAL: { bg: "#f0ede8", color: "#666", icon: "chat", label: "Umum" },
}

const directionConfig = {
  INBOUND: { bg: "#fff", border: "#e5e2dd", textBg: "bg-[#f7f5f2]", prefix: "" },
  OUTBOUND: { bg: "#111", border: "#111", textBg: "bg-[#1a5e3a]", prefix: "" },
}

function TimeGroup({ messages }: { messages: any[] }) {
  return (
    <div className="space-y-3">
      {messages.map(msg => {
        const isOutbound = msg.direction === "OUTBOUND"
        const cfg = directionConfig[msg.direction as keyof typeof directionConfig] || directionConfig.OUTBOUND
        const intent = msg.intent ? (intentConfig[msg.intent] || intentConfig.GENERAL) : null

        return (
          <div
            key={msg.id}
            className={cn("flex", isOutbound ? "justify-end" : "justify-start")}
          >
            <div className={cn("max-w-[70%] flex flex-col", isOutbound ? "items-end" : "items-start")}>
              {/* Intent badge */}
              {intent && (
                <div
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mb-1"
                  style={{ background: intent.bg, color: intent.color }}
                >
                  <span className="material-symbols-outlined text-[10px]">{intent.icon}</span>
                  {intent.label}
                </div>
              )}
              {/* Message bubble */}
              <div
                className={cn("px-4 py-3 rounded-lg text-sm leading-relaxed", isOutbound ? "text-white" : "text-[#444]")}
                style={{ background: cfg.textBg, border: `1px solid ${cfg.border}` }}
              >
                {msg.content}
              </div>
              {/* Meta */}
              <div className={cn("flex items-center gap-1.5 mt-1", isOutbound ? "flex-row-reverse" : "flex-row")}>
                <span className="text-[11px] text-[#aaa]">
                  {new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </span>
                {isOutbound && (
                  msg.status === "delivered" || msg.status === "read" ? (
                    <CheckCircle2 className="h-3 w-3 text-[#3a7a55]" />
                  ) : msg.status === "pending" ? (
                    <Clock className="h-3 w-3 text-[#aaa]" />
                  ) : msg.status === "failed" ? (
                    <AlertTriangle className="h-3 w-3 text-[#ba1a1a]" />
                  ) : null
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ChatPanel({ conversationId }: { conversationId: string }) {
  const { data, isLoading } = useSWR(
    conversationId ? `/api/conversations/${conversationId}/messages` : null,
    fetcher,
    { refreshInterval: 5000 } // poll every 5 seconds
  )
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (data?.messages) {
      setMessages(data.messages)
    }
  }, [data])

  useEffect(() => {
    // Scroll to bottom on new messages
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content: newMessage, direction: "OUTBOUND" }),
      })
      const data = await res.json()
      if (data.message) {
        setMessages(prev => [...prev, data.message])
      }
      setNewMessage("")
    } finally {
      setSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-sm text-[#aaa]">Memuat percakapan...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#f0ede8] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl text-[#bbb]">chat_bubble_outline</span>
            </div>
            <p className="text-sm text-[#888]">Belum ada pesan dalam percakapan ini.</p>
          </div>
        ) : (
          <TimeGroup messages={messages} />
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply Box */}
      <form onSubmit={sendMessage} className="flex gap-2 border-t p-4" style={{ borderColor: "#e5e2dd", background: "#fafaf8" }}>
        <Input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 rounded-xl border-[#e0ddd8] bg-white"
          disabled={sending}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!newMessage.trim() || sending}
          className="rounded-xl bg-[#111] hover:bg-[#333] shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Verify conversation detail page uses ChatPanel correctly**

Read `app/(app)/conversations/[id]/page.tsx` — confirm it already uses `<ChatPanel>` (it does). Ensure the send handler also refreshes messages correctly.

```tsx
// The page already uses ChatPanel. The handleSend in the page should mutate:
// app/(app)/conversations/[id]/page.tsx - check the handleSend function
// It calls mutate(`/api/conversations/${id}/messages`) which is correct
```

- [ ] **Step 3: Commit**

```bash
git add components/conversation/chat-panel.tsx
git commit -m "feat: add real-time polling and intent badges to chat panel"
```

---

### Task 3: Bulk WhatsApp Messaging UI

**Files:**
- Create: `components/dashboard/bulk-message-modal.tsx`
- Modify: `app/(app)/dashboard/page.tsx` — wire the modal to "Kirim Pesan Massal" button
- Modify: `app/(app)/settings/layout.tsx` — add "AI" nav items

**Prerequisites:** `POST /api/bulk-message` (friend implements)

- [ ] **Step 1: Create bulk message modal component**

```tsx
// components/dashboard/bulk-message-modal.tsx
"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useSWR from "swr"
import { X, Send, CheckCircle } from "lucide-react"

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Customer {
  id: string
  name: string | null
  phone: string
}

interface BulkMessageModalProps {
  open: boolean
  onClose: () => void
}

export function BulkMessageModal({ open, onClose }: BulkMessageModalProps) {
  const { data: customerData } = useSWR("/api/customers", fetcher)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"promotion" | "info" | "reminder">("promotion")
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState<{ sent: number; total: number } | null>(null)
  const [done, setDone] = useState(false)

  const customers: Customer[] = customerData?.customers || []
  const displayCustomers = selectAll ? customers : (selectedCustomers.length > 0 ? customers.filter(c => selectedCustomers.includes(c.id)) : customers)

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setMessage("")
      setMessageType("promotion")
      setSelectedCustomers([])
      setSelectAll(false)
      setSending(false)
      setProgress(null)
      setDone(false)
    }
  }, [open])

  async function handleSend() {
    if (!message.trim()) return
    setSending(true)
    setProgress({ sent: 0, total: displayCustomers.length })

    const phoneNumbers = displayCustomers.map(c => c.phone)
    // Send in batches of 5 to avoid rate limits
    const batchSize = 5
    let sent = 0

    for (let i = 0; i < phoneNumbers.length; i += batchSize) {
      const batch = phoneNumbers.slice(i, i + batchSize)
      await Promise.all(
        batch.map(phone =>
          fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phoneNumber: phone, content: message, direction: "OUTBOUND", bulk: true }),
          }).then(() => {
            sent++
            setProgress({ sent, total: phoneNumbers.length })
          }).catch(() => {
            sent++
            setProgress({ sent, total: phoneNumbers.length })
          })
        )
      )
      // Small delay between batches
      if (i + batchSize < phoneNumbers.length) {
        await new Promise(r => setTimeout(r, 500))
      }
    }

    setSending(false)
    setDone(true)
    setProgress({ sent: displayCustomers.length, total: displayCustomers.length })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-xl"
        style={{ maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#f0ede8] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#111]">Kirim Pesan Massal</h2>
            <p className="text-sm text-[#888]">
              {!done && progress ? `${progress.sent}/${progress.total} terkirim` : `${displayCustomers.length} penerima`}
            </p>
          </div>
          <button onClick={onClose} className="text-[#aaa] hover:text-[#111] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-auto" style={{ maxHeight: "calc(90vh - 140px)" }}>
          {!done && (
            <>
              {/* Message Type */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#999] block mb-2">Tipe Pesan</label>
                <div className="flex gap-2">
                  {(["promotion", "info", "reminder"] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setMessageType(type)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        messageType === type
                          ? "bg-[#111] text-white"
                          : "bg-[#f7f5f2] text-[#666] hover:bg-[#f0ede8]"
                      }`}
                    >
                      {type === "promotion" ? "Promosi" : type === "info" ? "Info" : "Pengingat"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#999]">Pilih Penerima</label>
                  <label className="flex items-center gap-2 text-sm text-[#666] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={e => { setSelectAll(e.target.checked); setSelectedCustomers([]) }}
                      className="accent-[#3a7a55]"
                    />
                    Semua ({customers.length})
                  </label>
                </div>
                <div className="border border-[#e0ddd8] rounded-lg max-h-32 overflow-auto bg-[#f7f5f2]">
                  {customers.map(c => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 px-3 py-2 border-b border-[#f0ede8] last:border-0 cursor-pointer hover:bg-[#f0ede8] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectAll || selectedCustomers.includes(c.id)}
                        onChange={e => {
                          if (selectAll) return
                          setSelectedCustomers(prev =>
                            e.target.checked
                              ? [...prev, c.id]
                              : prev.filter(id => id !== c.id)
                          )
                        }}
                        className="accent-[#3a7a55]"
                      />
                      <span className="text-sm text-[#111]">{c.name || c.phone}</span>
                      <span className="text-xs text-[#aaa] ml-auto">{c.phone}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#999] block mb-2">Pesan</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Ketik pesan Anda di sini..."
                  rows={5}
                  maxLength={1000}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#e0ddd8] text-sm bg-[#f7f5f2] outline-none resize-none placeholder:text-[#aaa]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-[#aaa]">Maksimal 1000 karakter</span>
                  <span className="text-xs text-[#aaa]">{message.length}/1000</span>
                </div>
              </div>

              {/* Preview */}
              {message && (
                <div className="bg-[#f7f5f2] rounded-lg p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#999] mb-2">Preview</p>
                  <div className="bg-[#dcf5e7] rounded-xl px-4 py-3 text-sm text-[#111]">
                    {message.replace(/\[Nama\]/g, "Nama Pelanggan")}
                  </div>
                </div>
              )}
            </>
          )}

          {done && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[#dcf5e7] flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-[#1a7a42]" />
              </div>
              <h3 className="text-base font-bold text-[#111] mb-2">Pesan Massal Terkirim!</h3>
              <p className="text-sm text-[#888]">
                {displayCustomers.length} pesan berhasil dikirim ke {displayCustomers.length} pelanggan.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#f0ede8] flex gap-3">
          {!done ? (
            <>
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-lg border-[#e0ddd8]">
                Batal
              </Button>
              <Button
                onClick={handleSend}
                disabled={!message.trim() || displayCustomers.length === 0 || sending}
                className="flex-1 rounded-lg bg-[#111] hover:bg-[#333] text-white"
              >
                {sending ? "Mengirim..." : `Kirim ke ${displayCustomers.length} Pelanggan`}
              </Button>
            </>
          ) : (
            <Button onClick={onClose} className="w-full rounded-lg bg-[#111] hover:bg-[#333] text-white">
              Tutup
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire bulk message modal into dashboard**

Read the current dashboard page and add the modal. The dashboard already has a "Kirim Pesan Massal" button in the Quick Actions section — replace the placeholder with the real modal.

```tsx
// In app/(app)/dashboard/page.tsx, add:
// import { BulkMessageModal } from "@/components/dashboard/bulk-message-modal"
// Add state: const [showBulkModal, setShowBulkModal] = useState(false)
// Change "Kirim Pesan Massal" button to:
//   <button onClick={() => setShowBulkModal(true)} ...>
// Add <BulkMessageModal open={showBulkModal} onClose={() => setShowBulkModal(false)} />
```

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/bulk-message-modal.tsx app/(app)/dashboard/page.tsx
git commit -m "feat: add bulk WhatsApp messaging modal on dashboard"
```

---

### Task 4: AI Reply Configuration UI

**Files:**
- Create: `app/(app)/settings/ai/page.tsx`
- Create: `components/settings/ai-config-card.tsx`
- Modify: `app/(app)/settings/layout.tsx` — add "AI" nav item (after Channels, before Team)
- Modify: `app/(app)/settings/layout.tsx` — add "Escalation" and "Reports" nav items

**Prerequisites:** `GET /api/ai/config` and `PATCH /api/ai/config` (friend implements, fallback to working stub)

- [ ] **Step 1: Create AI config card component**

```tsx
// components/settings/ai-config-card.tsx
"use client"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import useSWR from "swr"
import { Sparkles, Clock, MessageSquare } from "lucide-react"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function AIConfigCard() {
  const { data, isLoading, mutate } = useSWR("/api/ai/config", fetcher)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const config = data?.config || {
    isEnabled: true,
    tone: "friendly",
    sopContext: "",
    fallbackReply: "",
    workingHours: { start: "09:00", end: "21:00" },
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement) {
    e.preventDefault()
    setLoading(true)
    setSaved(false)
    const form = e.currentTarget
    const body = {
      isEnabled: (form.elements.namedItem("isEnabled") as HTMLInputElement)?.checked ?? config.isEnabled,
      tone: (form.elements.namedItem("tone") as HTMLSelectElement)?.value,
      sopContext: (form.elements.namedItem("sopContext") as HTMLTextAreaElement)?.value,
      fallbackReply: (form.elements.namedItem("fallbackReply") as HTMLTextAreaElement)?.value,
      workingHoursStart: (form.elements.namedItem("workingHoursStart") as HTMLInputElement)?.value,
      workingHoursEnd: (form.elements.namedItem("workingHoursEnd") as HTMLInputElement)?.value,
    }
    try {
      const res = await fetch("/api/ai/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        mutate()
      }
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#f0ede8] p-6">
        <div className="h-6 w-32 bg-[#f0ede8] rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[100, 200, 100].map((w, i) => (
            <div key={i} className="h-4 bg-[#f0ede8] rounded animate-pulse" style={{ width: w }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {/* Toggle */}
      <div className="bg-white rounded-xl border border-[#f0ede8] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#dcf5e7] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-[#1a7a42]" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#111]">Auto-Reply AI</div>
              <div className="text-xs text-[#888]">Balas otomatis pesan masuk dengan AI</div>
            </div>
          </div>
          <input type="checkbox" name="isEnabled" defaultChecked={config.isEnabled} className="sr-only" />
          <Switch defaultChecked={config.isEnabled} onCheckedChange={() => {}} />
        </div>
      </div>

      {/* Tone */}
      <div className="bg-white rounded-xl border border-[#f0ede8] p-5">
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#999] mb-3">Nada Balasan</div>
        <div className="flex gap-2">
          {["friendly", "formal", "casual"].map(tone => (
            <label
              key={tone}
              className={`flex-1 flex items-center justify-center py-3 rounded-lg border text-sm font-medium cursor-pointer transition-all ${
                config.tone === tone
                  ? "border-[#111] bg-[#111] text-white"
                  : "border-[#e0ddd8] text-[#666] hover:bg-[#f7f5f2]"
              }`}
            >
              <input type="radio" name="tone" value={tone} defaultChecked={config.tone === tone} className="sr-only" />
              {tone === "friendly" ? "Ramah" : tone === "formal" ? "Formal" : "Casual"}
            </label>
          ))}
        </div>
      </div>

      {/* Working Hours */}
      <div className="bg-white rounded-xl border border-[#f0ede8] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-[#888]" />
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#999]">Jam Operasional</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-[#888] mb-1 block">Mulai</label>
            <input
              type="time"
              name="workingHoursStart"
              defaultValue={config.workingHours?.start || "09:00"}
              className="w-full px-3 py-2.5 rounded-lg border border-[#e0ddd8] text-sm bg-[#f7f5f2] outline-none"
            />
          </div>
          <span className="text-[#aaa] mt-5">—</span>
          <div className="flex-1">
            <label className="text-xs text-[#888] mb-1 block">Selesai</label>
            <input
              type="time"
              name="workingHoursEnd"
              defaultValue={config.workingHours?.end || "21:00"}
              className="w-full px-3 py-2.5 rounded-lg border border-[#e0ddd8] text-sm bg-[#f7f5f2] outline-none"
            />
          </div>
        </div>
      </div>

      {/* SOP Context */}
      <div className="bg-white rounded-xl border border-[#f0ede8] p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-4 w-4 text-[#888]" />
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#999]">Konteks SOP / Info Bisnis</div>
        </div>
        <textarea
          name="sopContext"
          defaultValue={config.sopContext || ""}
          placeholder="Contoh: Kami adalah toko配件 motor di Surabaya. Kami mengirim via JNE, J&T, SiCepat. Pembayaran lewat BCA 123456789 a.n. Toko配件. Produk dikemas dalam kotak kayu untuk Fragile items."
          rows={5}
          className="w-full px-3 py-2.5 rounded-lg border border-[#e0ddd8] text-sm bg-[#f7f5f2] outline-none resize-none placeholder:text-[#aaa] placeholder:text-xs"
        />
        <p className="text-xs text-[#aaa] mt-2">Informasi ini akan digunakan AI untuk menjawab pertanyaan pelanggan secara akurat.</p>
      </div>

      {/* Fallback Reply */}
      <div className="bg-white rounded-xl border border-[#f0ede8] p-5">
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#999] mb-3">Balasan Fallback</div>
        <textarea
          name="fallbackReply"
          defaultValue={config.fallbackReply || ""}
          placeholder="Balas default ketika AI tidak yakin. Contoh: Terima kasih sudah menghubungi! Kami akan segera merespons secepat mungkin. Mohon tunggu sebentar ya 😊"
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg border border-[#e0ddd8] text-sm bg-[#f7f5f2] outline-none resize-none placeholder:text-[#aaa] placeholder:text-xs"
        />
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#111] hover:bg-[#333] text-white rounded-lg text-sm font-semibold px-6"
        >
          {loading ? "Menyimpan..." : "Simpan Konfigurasi"}
        </Button>
        {saved && <span className="text-sm text-[#3a7a55] font-medium">Konfigurasi tersimpan!</span>}
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Create AI settings page**

```tsx
// app/(app)/settings/ai/page.tsx
import { AIConfigCard } from "@/components/settings/ai-config-card"

export default function AISettingsPage() {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-[#f0ede8] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f0ede8]">
          <div className="text-sm font-bold text-[#111]">AI Auto-Reply</div>
          <p className="text-xs text-[#888] mt-0.5">Konfigurasi bagaimana AI merespons pesan pelanggan.</p>
        </div>
        <div className="p-5">
          <AIConfigCard />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update settings layout to include AI, Escalation, Reports nav items**

The current `settings/layout.tsx` navItems are:
```
/settings — Profil
/settings/security — Keamanan
/settings/channels — Saluran
/settings/team — Tim
/settings/billing — Tagihan
```

Add after channels:
```
/settings/ai — AI Reply
/settings/escalation — Eskalasi
/settings/reports — Laporan
```

```tsx
// In app/(app)/settings/layout.tsx, update navItems:
const navItems = [
  { href: "/settings", label: "Profil", icon: "person" },
  { href: "/settings/security", label: "Keamanan", icon: "lock" },
  { href: "/settings/channels", label: "Saluran", icon: "chat" },
  { href: "/settings/ai", label: "AI Reply", icon: "smart_toy" },
  { href: "/settings/escalation", label: "Eskalasi", icon: "warning" },
  { href: "/settings/reports", label: "Laporan", icon: "analytics" },
  { href: "/settings/team", label: "Tim", icon: "group" },
  { href: "/settings/billing", label: "Tagihan", icon: "receipt_long" },
]
```

- [ ] **Step 4: Commit**

```bash
git add app/(app)/settings/ai/page.tsx components/settings/ai-config-card.tsx app/(app)/settings/layout.tsx
git commit -m "feat: add AI reply configuration settings page"
```

---

### Task 5: Escalation Rules UI

**Files:**
- Create: `app/(app)/settings/escalation/page.tsx`
- Create: `components/settings/escalation-rules-list.tsx`

**Prerequisites:** CRUD endpoints for escalation rules (friend implements)

- [ ] **Step 1: Create escalation rules list component**

```tsx
// components/settings/escalation-rules-list.tsx
"use client"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useSWR from "swr"
import { AlertTriangle, Plus, X, Zap } from "lucide-react"

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface EscalationRule {
  id: string
  name: string
  type: string
  keywords: string[]
  minOrderValue: number | null
  isActive: boolean
}

const typeLabels: Record<string, { color: string; bg: string }> = {
  COMPLAINT: { color: "#ba1a1a", bg: "#ffdad6" },
  HIGH_VALUE_ORDER: { color: "#9a6800", bg: "#fdecc8" },
  SPECIFIC_KEYWORD: { color: "#0b5ea8", bg: "#d7effe" },
  NO_REPLY_24H: { color: "#666", bg: "#f0ede8" },
}

export function EscalationRulesList() {
  const { data, isLoading, mutate } = useSWR("/api/escalation-rules", fetcher)
  const [showModal, setShowModal] = useState(false)
  const [editRule, setEditRule] = useState<EscalationRule | null>(null)

  const rules: EscalationRule[] = data?.rules || []

  async function toggleRule(rule: EscalationRule) {
    await fetch(`/api/escalation-rules/${rule.id}`, {
      method: "PATCH",
      body: JSON.stringify({ isActive: !rule.isActive }),
    })
    mutate()
  }

  async function deleteRule(ruleId: string) {
    if (!confirm("Hapus aturan eskalasi ini?")) return
    await fetch(`/api/escalation-rules/${ruleId}`, { method: "DELETE" })
    mutate()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-[#888]">Eskalasi otomatis untuk situasi yang memerlukan perhatian khusus.</p>
        </div>
        <Button
          onClick={() => { setEditRule(null); setShowModal(true) }}
          className="bg-[#111] hover:bg-[#333] text-white rounded-lg text-sm font-semibold px-4 py-2 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Tambah Aturan
        </Button>
      </div>

      {/* Rules List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-[#f0ede8] p-5">
              <div className="h-5 w-48 bg-[#f0ede8] rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#f0ede8] p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#f0ede8] flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-[#bbb]" />
          </div>
          <h3 className="text-sm font-bold text-[#111] mb-2">Belum Ada Aturan Eskalasi</h3>
          <p className="text-xs text-[#aaa] max-w-xs mx-auto leading-relaxed">
            Tambahkan aturan untuk secara otomatis meneruskan percakapan ke owner ketika kondisi tertentu terpenuhi.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map(rule => {
            const typeStyle = typeLabels[rule.type] || typeLabels.COMPLAINT
            return (
              <div key={rule.id} className="bg-white rounded-xl border border-[#f0ede8] p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: typeStyle.bg }}>
                      <Zap className="h-5 w-5" style={{ color: typeStyle.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-[#111]">{rule.name}</span>
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
                          style={{ background: typeStyle.bg, color: typeStyle.color }}
                        >
                          {rule.type.replace("_", " ")}
                        </span>
                      </div>
                      {rule.keywords?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {rule.keywords.map((kw, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-[#f7f5f2] text-[#888]">
                              "{kw}"
                            </span>
                          ))}
                        </div>
                      )}
                      {rule.minOrderValue && (
                        <p className="text-xs text-[#888]">Min. order: Rp{Number(rule.minOrderValue).toLocaleString("id-ID")}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={rule.isActive} onCheckedChange={() => toggleRule(rule)} />
                    <button
                      onClick={() => { setEditRule(rule); setShowModal(true) }}
                      className="text-xs text-[#888] hover:text-[#111] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="text-xs text-[#ba1a1a] hover:text-[#93000a] transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <EscalationRuleModal
          rule={editRule}
          onClose={() => { setShowModal(false); setEditRule(null) }}
          onSuccess={() => { setShowModal(false); setEditRule(null); mutate() }}
        />
      )}
    </div>
  )
}

// Sub-component: Add/Edit Modal
function EscalationRuleModal({ rule, onClose, onSuccess }: { rule?: EscalationRule | null; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState(rule?.name || "")
  const [type, setType] = useState(rule?.type || "SPECIFIC_KEYWORD")
  const [keywords, setKeywords] = useState(rule?.keywords?.join(", ") || "")
  const [minOrderValue, setMinOrderValue] = useState(rule?.minOrderValue?.toString() || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const body = {
      name,
      type,
      keywords: keywords.split(",").map(k => k.trim()).filter(Boolean),
      minOrderValue: minOrderValue ? Number(minOrderValue) : null,
      isActive: rule?.isActive ?? true,
    }
    const url = rule ? `/api/escalation-rules/${rule.id}` : "/api/escalation-rules"
    const method = rule ? "PATCH" : "POST"
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    setLoading(false)
    if (res.ok) onSuccess()
    else setError("Gagal menyimpan aturan. Coba lagi.")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-[#111]">{rule ? "Edit Aturan" : "Tambah Aturan Eskalasi"}</h3>
          <button onClick={onClose} className="text-[#aaa] hover:text-[#111]"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#999] block mb-1.5">Nama Aturan</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Komplain Produk" required className="rounded-lg border-[#e0ddd8] bg-[#f7f5f2] text-sm" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#999] block mb-1.5">Tipe</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full rounded-lg border border-[#e0ddd8] bg-[#f7f5f2] text-sm px-3 py-2.5">
              <option value="COMPLAINT">Komplain</option>
              <option value="HIGH_VALUE_ORDER">Order Nilai Tinggi</option>
              <option value="SPECIFIC_KEYWORD">Kata Kunci Khusus</option>
              <option value="NO_REPLY_24H">Tanpa Balasan 24 Jam</option>
            </select>
          </div>
          {type === "SPECIFIC_KEYWORD" && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#999] block mb-1.5">Kata Kunci</label>
              <Input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="refund, rusak, tidak cocok (pisahkan dengan koma)" className="rounded-lg border-[#e0ddd8] bg-[#f7f5f2] text-sm" />
            </div>
          )}
          {type === "HIGH_VALUE_ORDER" && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#999] block mb-1.5">Nilai Minimum (Rp)</label>
              <Input type="number" value={minOrderValue} onChange={e => setMinOrderValue(e.target.value)} placeholder="500000" className="rounded-lg border-[#e0ddd8] bg-[#f7f5f2] text-sm" />
            </div>
          )}
          {error && <p className="text-sm text-[#ba1a1a]">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-lg">Batal</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-[#111] hover:bg-[#333] text-white rounded-lg font-semibold">
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create escalation settings page**

```tsx
// app/(app)/settings/escalation/page.tsx
import { EscalationRulesList } from "@/components/settings/escalation-rules-list"

export default function EscalationSettingsPage() {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-[#f0ede8] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f0ede8]">
          <div className="text-sm font-bold text-[#111]">Aturan Eskalasi</div>
          <p className="text-xs text-[#888] mt-0.5">Konfigurasi kapan percakapan harus diteruskan ke owner.</p>
        </div>
        <div className="p-5">
          <EscalationRulesList />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/(app)/settings/escalation/page.tsx components/settings/escalation-rules-list.tsx
git commit -m "feat: add escalation rules management UI"
```

---

### Task 6: Daily Recap / Reports Settings

**Files:**
- Create: `app/(app)/settings/reports/page.tsx`
- Modify: `app/(app)/dashboard/page.tsx` — "Lihat Laporan AI" → link to `/settings/reports`

**Prerequisites:** `GET/PATCH /api/ai/config` for recap settings (friend implements, fallback to stub)

- [ ] **Step 1: Create reports settings page**

```tsx
// app/(app)/settings/reports/page.tsx
"use client"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import useSWR from "swr"
import { CalendarCheck, Clock, Eye } from "lucide-react"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ReportsSettingsPage() {
  const { data, isLoading } = useSWR("/api/ai/config", fetcher)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const config = data?.config || {}
  const recapEnabled = config.dailyRecapEnabled !== false
  const recapTime = config.dailyRecapTime || "20:00"

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const body = {
      dailyRecapEnabled: (form.elements.namedItem("dailyRecapEnabled") as HTMLInputElement)?.checked ?? recapEnabled,
      dailyRecapTime: (form.elements.namedItem("dailyRecapTime") as HTMLInputElement)?.value || recapTime,
    }
    try {
      const res = await fetch("/api/ai/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Recap Toggle */}
      <div className="bg-white rounded-xl border border-[#f0ede8] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#dcf5e7] flex items-center justify-center">
              <CalendarCheck className="h-5 w-5 text-[#1a7a42]" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#111]">Rekap Harian Otomatis</div>
              <div className="text-xs text-[#888]">Kirim ringkasan aktivitas setiap hari melalui WhatsApp</div>
            </div>
          </div>
          <input type="checkbox" name="dailyRecapEnabled" defaultChecked={recapEnabled} className="sr-only" />
          <Switch defaultChecked={recapEnabled} onCheckedChange={() => {}} />
        </div>

        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-[#888]" />
          <label className="text-xs text-[#888]">Waktu kirim</label>
          <input
            type="time"
            name="dailyRecapTime"
            defaultValue={recapTime}
            className="px-3 py-2 rounded-lg border border-[#e0ddd8] text-sm bg-[#f7f5f2] outline-none"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl border border-[#f0ede8] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-4 w-4 text-[#888]" />
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#999]">Preview Rekap</div>
        </div>
        <div className="bg-[#f7f5f2] rounded-xl p-4 font-mono text-sm text-[#444] whitespace-pre-wrap">
{`📊 Rekap Hari Ini — ${new Date().toLocaleDateString("id-ID")}

🏪 Nama Bisnis

📦 Orders: 5
💰 Revenue: Rp1.850.000
💸 Expense: Rp200.000

💬 Messages: 18
👥 New Customers: 3

🔓 Open: 4

💡 [AI insight here]`}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-[#111] hover:bg-[#333] text-white rounded-lg text-sm font-semibold px-6"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </Button>
        {saved && <span className="text-sm text-[#3a7a55] font-medium">Tersimpan!</span>}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire dashboard "Lihat Laporan AI" to reports page**

In dashboard, change the "Lihat Laporan AI" button from:
```tsx
<div style={{ background: "#f7f5f2", borderRadius: 8, padding: 16, textAlign: "center", fontSize: 13, fontWeight: 600, color: "#111", cursor: "pointer" }}>
  Lihat Laporan AI
</div>
```
To:
```tsx
<button
  onClick={() => window.location.href = "/settings/reports"}
  style={{ background: "#f7f5f2", borderRadius: 8, padding: 16, textAlign: "center", fontSize: 13, fontWeight: 600, color: "#111", cursor: "pointer", border: "none", width: "100%" }}
>
  Lihat Laporan AI
</button>
```

- [ ] **Step 3: Commit**

```bash
git add app/(app)/settings/reports/page.tsx app/(app)/dashboard/page.tsx
git commit -m "feat: add daily recap settings page and wire dashboard link"
```

---

### Task 7: Order Detail — Payment Status Update + Notes

**Files:**
- Modify: `components/order/detail-panel.tsx` — add "Update Payment Status" dropdown and "Add Note"
- Modify: `app/(app)/orders/[id]/page.tsx` — add note to order via PATCH

**Prerequisites:** `PATCH /api/orders/[id]` (already in spec from existing plan)

- [ ] **Step 1: Enhance OrderDetailPanel with actions**

Read the existing `components/order/detail-panel.tsx` (which we already examined) and add these sections before the Timeline section (or after Recommended Actions if present):

```tsx
// After the AI Insights section (before Timeline or at the end), add:
// In the existing OrderDetailPanel, find where recommendedActions ends
// and add the following section after it:

{/* Update Payment Status */}
<div className="px-6 py-5 border-b border-[#f0ede8]">
  <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#999] mb-3">Update Status Pembayaran</div>
  <div className="flex gap-2">
    {["recorded", "confirmed", "pending", "cancelled"].map(status => (
      <button
        key={status}
        onClick={() => onUpdateStatus?.(status)}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          order.paymentStatus === status
            ? status === "confirmed" || status === "recorded"
              ? "bg-[#dcf5e7] text-[#1a7a42] border border-[#1a7a42]"
              : status === "pending"
                ? "bg-[#fdecc8] text-[#9a6800] border border-[#9a6800]"
                : "bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]"
            : "bg-[#f7f5f2] text-[#666] border border-transparent hover:bg-[#f0ede8]"
        }`}
      >
        {status === "recorded" ? "Lunas" : status === "confirmed" ? "Dikonfirmasi" : status === "pending" ? "Menunggu" : "Dibatalkan"}
      </button>
    ))}
  </div>
</div>

{/* Add Note */}
<div className="px-6 py-5 border-b border-[#f0ede8]">
  <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#999] mb-3">Catatan</div>
  <div className="space-y-2">
    {order.notes?.map((note: string, i: number) => (
      <div key={i} className="bg-[#f7f5f2] rounded-lg px-3 py-2 text-sm text-[#444]">{note}</div>
    ))}
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Tambah catatan..."
        className="flex-1 px-3 py-2 rounded-lg border border-[#e0ddd8] text-sm bg-[#f7f5f2] outline-none"
        id={`note-input-${order.id}`}
      />
      <button
        onClick={() => {
          const input = document.getElementById(`note-input-${order.id}`) as HTMLInputElement
          if (input?.value.trim()) {
            onAddNote?.(input.value.trim())
            input.value = ""
          }
        }}
        className="px-4 py-2 rounded-lg bg-[#111] text-white text-sm font-medium hover:bg-[#333] transition-colors"
      >
        + Catatan
      </button>
    </div>
  </div>
</div>
```

Update the component signature to accept optional callbacks:
```tsx
export function OrderDetailPanel({ order, onUpdateStatus, onAddNote }: { order: any; onUpdateStatus?: (status: string) => void; onAddNote?: (note: string) => void })
```

- [ ] **Step 2: Update orders/[id]/page.tsx to wire the actions**

```tsx
// In app/(app)/orders/[id]/page.tsx
// Add handlers:
const { data, isLoading, mutate } = useSWR(id ? `/api/orders/${id}` : null, fetcher)

async function handleUpdateStatus(status: string) {
  await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentStatus: status }),
  })
  mutate()
}

async function handleAddNote(note: string) {
  const order = data?.order
  const notes = order?.notes || []
  await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes: [...notes, note] }),
  })
  mutate()
}

// Pass to OrderDetailPanel:
<OrderDetailPanel
  order={data?.order}
  onUpdateStatus={handleUpdateStatus}
  onAddNote={handleAddNote}
/>
```

- [ ] **Step 3: Commit**

```bash
git add components/order/detail-panel.tsx app/(app)/orders/[id]/page.tsx
git commit -m "feat: add payment status update and notes to order detail"
```

---

## Spec Coverage Check

| Requirement | Task |
|---|---|
| Customers page + list + detail | Task 1 |
| Real-time conversation polling (5s) | Task 2 |
| Intent badges on messages | Task 2 |
| Bulk WhatsApp messaging modal | Task 3 |
| AI reply config UI (tone, SOP, hours, fallback) | Task 4 |
| Settings nav items (AI, Escalation, Reports) | Task 4, 5, 6 |
| Escalation rules UI (add/edit/toggle/delete) | Task 5 |
| Daily recap settings (toggle, time, preview) | Task 6 |
| Dashboard quick actions wired (bulk message, reports link) | Task 3, 6 |
| Order detail payment status + notes | Task 7 |

No gaps found.