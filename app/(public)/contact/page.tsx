"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    await new Promise((r) => setTimeout(r, 1500))
    setSending(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="px-6 py-4 border-b border-border bg-card">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-base font-semibold text-on-surface" style={{ fontFamily: "Instrument Serif, serif" }}>BalasBro.ai</span>
          </Link>
          <Link href="/login" className="text-sm text-primary hover:text-primary-600 font-medium">Sign in</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-semibold text-on-surface mb-8" style={{ fontFamily: "Instrument Serif, serif" }}>Contact Us</h1>

        <div className="grid grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface">Email</p>
                <p className="text-sm text-on-surface-variant">hello@balasbro.ai</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface">Phone</p>
                <p className="text-sm text-on-surface-variant">+62 812 3456 7890</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface">Office</p>
                <p className="text-sm text-on-surface-variant">Jakarta, Indonesia</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-card rounded-xl border border-border p-6">
            {sent ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-600">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-on-surface mb-2" style={{ fontFamily: "Instrument Serif, serif" }}>Message sent!</h3>
                <p className="text-sm text-on-surface-variant">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-on-surface text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-on-surface text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help?"
                    rows={4}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-on-surface text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-2.5 bg-primary hover:bg-primary-600 disabled:bg-muted text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {sending ? "Sending..." : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}