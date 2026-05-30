"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/input"
import { Send, Sparkles } from "lucide-react"

export function AIReplyPanel({ conversationId, onSend }: { conversationId: string; onSend: (content: string, extra?: { aiReplyUsed?: boolean }) => void }) {
  const [reply, setReply] = useState("")
  const [loading, setLoading] = useState(false)

  async function requestAIReply() {
    setLoading(true)
    setReply("")
    try {
      // Fetch latest inbound message to get a messageId for context
      const msgRes = await fetch(`/api/conversations/${conversationId}/messages`)
      const msgData = await msgRes.json()
      const messages = msgData.messages || []
      const lastInbound = messages.filter((m: any) => m.direction === "INBOUND").pop()

      const body: { conversationId?: string; messageId?: string } = {}
      if (lastInbound?.id) {
        body.messageId = lastInbound.id
      } else {
        body.conversationId = conversationId
      }

      const res = await fetch("/api/ai/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      setReply(data.reply || data.error || "Tidak ada balasan yang dihasilkan.")
    } catch {
      setReply("Gagal menghasilkan balasan. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  function handleSend() {
    if (!reply.trim()) return
    onSend(reply, { aiReplyUsed: true })
    setReply("")
  }

  return (
    <div className="flex flex-col border-l h-full">
      <div className="border-b px-4 py-2 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">AI Reply</span>
      </div>
      <div className="flex-1 p-4 space-y-4">
        <Button onClick={requestAIReply} variant="outline" className="w-full" disabled={loading}>
          {loading ? "Generating..." : "Generate Reply"}
        </Button>
        <Textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="AI-generated reply will appear here..." className="min-h-[120px]" />
        <Button onClick={handleSend} className="w-full" disabled={!reply.trim()}>
          <Send className="mr-2 h-4 w-4" />
          Kirim
        </Button>
      </div>
    </div>
  )
}