"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"
import {
  Search,
  MessageSquare,
  Phone,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  X,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import {
  Avatar,
  StatusBadge,
  IntentBadge,
  EmptyState,
} from "@/components/design-system"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Message {
  id: string
  direction: "INBOUND" | "OUTBOUND"
  content: string
  intent: string | null
  aiReplyUsed: boolean
  status: string | null
  createdAt: string
}

interface Conversation {
  id: string
  status: string
  lastMessageAt: string
  lastMessage: string
  customer: {
    id: string
    name: string | null
    phone: string
  }
  _count: { messages: number }
  hasUnread?: boolean
}

interface MessagesResponse {
  messages: Message[]
}

interface ConversationsResponse {
  conversations: Conversation[]
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "Baru saja"
  if (diffMin < 60) return `${diffMin}m`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}j`
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
}

function formatChatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

const statusIcons: Record<string, React.ReactNode> = {
  delivered: <CheckCircle2 size={12} className="text-[#16a34a]" />,
  pending: <Clock size={12} className="text-[#ca8a04]" />,
  failed: <AlertTriangle size={12} className="text-[#dc2626]" />,
}

const tabs = [
  { label: "Semua", value: "all" },
  { label: "Aktif", value: "open" },
  { label: "Tunda", value: "pending" },
  { label: "Selesai", value: "closed" },
]

export default function ConversationsPage() {
  const params = useParams()
  const conversationId = params?.id as string | undefined

  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(conversationId || null)
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: conversationsData, isLoading: convLoading } = useSWR<ConversationsResponse>(
    "/api/conversations",
    fetcher
  )

  const { data: messagesData, isLoading: msgLoading, mutate: mutateMessages } = useSWR<MessagesResponse>(
    selectedId ? `/api/conversations/${selectedId}/messages` : null,
    fetcher,
    { refreshInterval: selectedId ? 5000 : 0 }
  )

  const conversations = conversationsData?.conversations || []

  const filtered = conversations.filter((c) => {
    const searchMatch =
      (c.customer.name || c.customer.phone).toLowerCase().includes(search.toLowerCase()) ||
      c.customer.phone.includes(search)
    const tabMatch = activeTab === "all" || c.status === activeTab
    return searchMatch && tabMatch
  })

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesData?.messages?.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messagesData?.messages?.length])

  async function handleSendReply() {
    if (!replyText.trim() || !selectedId || sending) return
    setSending(true)
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedId,
          content: replyText,
          direction: "OUTBOUND",
        }),
      })
      setReplyText("")
      mutateMessages()
    } finally {
      setSending(false)
    }
  }

  const selectedConversation = conversations.find((c) => c.id === selectedId)
  const messages = messagesData?.messages || []

  // Split conversations by status for counts
  const openCount = conversations.filter((c) => c.status === "open").length
  const pendingCount = conversations.filter((c) => c.status === "pending").length

  return (
    <div className="flex h-full bg-[#fafaf8]">
      {/* Left Sidebar - Conversation List */}
      <div
        className={`w-80 flex-shrink-0 flex flex-col bg-white border-r border-[#e5e2dd] ${
          !showMobileSidebar ? "hidden lg:flex" : "flex"
        }`}
      >
        {/* Sidebar Header */}
        <div className="px-4 pt-4 pb-0">
          <div className="flex items-center justify-between mb-4">
            <h1
              className="text-xl font-semibold text-[#111111]"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Percakapan
            </h1>
            <div className="flex items-center gap-1">
              {openCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#16a34a] text-xs font-semibold">
                  {openCount} aktif
                </span>
              )}
              <Link
                href="/bulk-message"
                className="p-1.5 rounded-lg hover:bg-[#f5f4f0] text-[#8a8580] transition-colors"
                title="Pesan Massal"
              >
                <MessageSquare size={16} />
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="mb-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8580]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari percakapan..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-xs placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-[#e5e2dd] -mb-px overflow-x-auto">
            {tabs.map((tab) => {
              const count =
                tab.value === "open"
                  ? openCount
                  : tab.value === "pending"
                  ? pendingCount
                  : null
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.value
                      ? "border-[#3a7a55] text-[#3a7a55]"
                      : "border-transparent text-[#8a8580] hover:text-[#111111]"
                  }`}
                >
                  {tab.label}
                  {count !== null && count > 0 && (
                    <span
                      className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
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

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {convLoading ? (
            <div className="p-3 space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-[#f0ede8]" />
                  <div className="flex-1">
                    <div className="h-3 w-24 bg-[#f0ede8] rounded mb-2" />
                    <div className="h-2.5 w-40 bg-[#f0ede8] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<MessageSquare size={20} />}
              title="Belum ada percakapan"
              description="Percakapan dengan pelanggan akan muncul di sini"
            />
          ) : (
            <div className="p-2">
              {filtered.map((conv) => {
                const isSelected = selectedId === conv.id
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedId(conv.id)
                      setShowMobileSidebar(false)
                    }}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left mb-1 ${
                      isSelected
                        ? "bg-[#3a7a55]/5 border border-[#3a7a55]/20"
                        : "hover:bg-[#f5f4f0] border border-transparent"
                    }`}
                  >
                    {/* Avatar + status dot */}
                    <div className="relative flex-shrink-0">
                      <Avatar name={conv.customer.name || conv.customer.phone} size="md" />
                      {conv.status === "open" && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#16a34a] rounded-full border-2 border-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className={`text-sm truncate ${
                            isSelected ? "font-semibold text-[#111111]" : "font-medium text-[#111111]"
                          }`}
                        >
                          {conv.customer.name || conv.customer.phone}
                        </span>
                        <span className="text-xs text-[#8a8580] ml-2 flex-shrink-0">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        <Phone size={10} className="text-[#8a8580]" />
                        <span className="text-xs text-[#8a8580]">
                          {conv.customer.phone}
                        </span>
                      </div>
                      {conv.lastMessage && (
                        <p className="text-xs text-[#8a8580] truncate">
                          {conv.lastMessage}
                        </p>
                      )}
                    </div>

                    {/* Unread indicator */}
                    {conv.hasUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#3a7a55] flex-shrink-0 mt-2" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Chat View */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedId && selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-5 py-4 border-b border-[#e5e2dd] flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                {/* Back button for mobile */}
                <button
                  onClick={() => setShowMobileSidebar(true)}
                  className="lg:hidden p-1.5 rounded-lg hover:bg-[#f5f4f0] text-[#8a8580]"
                >
                  <ArrowLeft size={18} />
                </button>

                <Avatar
                  name={selectedConversation.customer.name || selectedConversation.customer.phone}
                  size="md"
                />
                <div>
                  <p className="text-sm font-semibold text-[#111111]">
                    {selectedConversation.customer.name ||
                      selectedConversation.customer.phone}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#8a8580]">
                      {selectedConversation.customer.phone}
                    </span>
                    <StatusBadge
                      status={selectedConversation.status}
                      label={
                        selectedConversation.status === "open"
                          ? "Aktif"
                          : selectedConversation.status === "pending"
                          ? "Tunda"
                          : "Selesai"
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg hover:bg-[#f5f4f0] text-[#8a8580] transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {msgLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={20} className="animate-spin text-[#8a8580]" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <EmptyState
                    icon={<MessageSquare size={20} />}
                    title="Belum ada pesan"
                    description="Mulai percakapan dengan mengirim pesan"
                  />
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          msg.direction === "OUTBOUND"
                            ? "bg-[#3a7a55] text-white rounded-br-md"
                            : "bg-[#f5f4f0] border border-[#e5e2dd] rounded-bl-md"
                        }`}
                      >
                        {msg.intent && msg.direction === "INBOUND" && (
                          <div className="mb-2">
                            <IntentBadge intent={msg.intent} />
                          </div>
                        )}
                        <p
                          className={`text-sm leading-relaxed ${
                            msg.direction === "OUTBOUND" ? "text-white" : "text-[#111111]"
                          }`}
                        >
                          {msg.content}
                        </p>
                        <div
                          className={`flex items-center gap-1.5 mt-2 ${
                            msg.direction === "OUTBOUND" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span
                            className={`text-xs ${
                              msg.direction === "OUTBOUND" ? "text-white/70" : "text-[#8a8580]"
                            }`}
                          >
                            {formatChatTime(msg.createdAt)}
                          </span>
                          {msg.direction === "OUTBOUND" && msg.status && (
                            <span
                              className={
                                msg.direction === "OUTBOUND" ? "text-white/70" : "text-[#8a8580]"
                              }
                            >
                              {statusIcons[msg.status]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Reply Box */}
            <div className="px-5 py-4 border-t border-[#e5e2dd] bg-white">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendReply())
                  }
                  placeholder="Ketik pesan..."
                  disabled={sending}
                  className="flex-1 px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || sending}
                  className="w-11 h-11 rounded-xl bg-[#3a7a55] hover:bg-[#1a5e3a] disabled:bg-[#f0ede8] text-white flex items-center justify-center transition-all shadow-sm"
                >
                  {sending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
              <p className="text-xs text-[#8a8580] mt-2 px-1">
                Tekan Enter untuk mengirim • Shift+Enter untuk baris baru
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="w-14 h-14 rounded-2xl bg-[#f0ede8] flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-[#8a8580]" />
            </div>
            <p className="text-base font-semibold text-[#111111] mb-1">Pilih percakapan</p>
            <p className="text-sm text-[#8a8580] max-w-[280px]">
              Klik percakapan di sebelah kiri untuk melihat dan membalas pesan
            </p>
          </div>
        )}
      </div>
    </div>
  )
}