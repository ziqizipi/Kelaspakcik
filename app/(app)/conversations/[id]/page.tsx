"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { Send, CheckCircle2, Clock, AlertTriangle, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
  customer: {
    id: string
    name: string | null
    phone: string
  }
}

interface MessagesResponse {
  messages: Message[]
}

interface ConversationResponse {
  conversation: Conversation
}

const intentColors: Record<string, string> = {
  ORDER: "bg-green-100 text-green-700",
  COMPLAINT: "bg-red-100 text-red-700",
  PRODUCT_INQUIRY: "bg-blue-100 text-blue-700",
  FOLLOW_UP: "bg-yellow-100 text-yellow-700",
  GENERAL: "bg-gray-100 text-gray-700",
}

const statusIcons: Record<string, React.ReactNode> = {
  delivered: <CheckCircle2 size={12} className="text-green-600" />,
  pending: <Clock size={12} className="text-yellow-600" />,
  failed: <AlertTriangle size={12} className="text-red-500" />,
}

function formatChatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

export default function ConversationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: messagesData, isLoading: msgLoading, mutate: mutateMessages } = useSWR<MessagesResponse>(
    `/api/conversations/${id}/messages`,
    fetcher,
    { refreshInterval: 5000 }
  )

  const { data: convData } = useSWR<ConversationResponse>(`/api/conversations/${id}`, fetcher)

  const conversation = convData?.conversation
  const messages = messagesData?.messages || []

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages.length])

  async function handleSendReply() {
    if (!replyText.trim() || sending) return
    setSending(true)
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: id, content: replyText, direction: "OUTBOUND" }),
      })
      setReplyText("")
      mutateMessages()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/conversations")}
            className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
          >
            <ArrowLeft size={18} />
          </button>
          {conversation ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                {(conversation.customer.name || conversation.customer.phone).charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  {conversation.customer.name || conversation.customer.phone}
                </p>
                <p className="text-xs text-muted-foreground">{conversation.customer.phone}</p>
              </div>
            </div>
          ) : (
            <div className="animate-pulse flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div>
                <div className="h-3 bg-muted rounded w-24 mb-1" />
                <div className="h-2 bg-muted rounded w-16" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
        {msgLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-on-surface-variant">Belum ada pesan dalam percakapan ini</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.direction === "OUTBOUND"
                    ? "bg-primary text-white rounded-br-md"
                    : "bg-card border border-border rounded-bl-md"
                }`}
              >
                {msg.intent && msg.direction === "INBOUND" && (
                  <span
                    className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${
                      intentColors[msg.intent] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {msg.intent.replace("_", " ")}
                  </span>
                )}
                <p className={`text-sm leading-relaxed ${msg.direction === "OUTBOUND" ? "text-white" : "text-on-surface"}`}>
                  {msg.content}
                </p>
                <div
                  className={`flex items-center gap-1.5 mt-2 ${
                    msg.direction === "OUTBOUND" ? "justify-end" : "justify-start"
                  }`}
                >
                  <span className={`text-xs ${msg.direction === "OUTBOUND" ? "text-white/70" : "text-muted-foreground"}`}>
                    {formatChatTime(msg.createdAt)}
                  </span>
                  {msg.direction === "OUTBOUND" && msg.status && (
                    <span className={msg.direction === "OUTBOUND" ? "text-white/70" : "text-muted-foreground"}>
                      {statusIcons[msg.status] || null}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Box */}
      <div className="px-6 py-4 border-t border-border bg-card">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendReply())}
            placeholder="Ketik pesan balasan..."
            disabled={sending}
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-on-surface text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          <button
            onClick={handleSendReply}
            disabled={!replyText.trim() || sending}
            className="w-11 h-11 rounded-xl bg-primary hover:bg-primary-600 disabled:bg-muted text-white flex items-center justify-center transition-colors"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}