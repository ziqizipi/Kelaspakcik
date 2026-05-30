"use client"

import { useState } from "react"
import Link from "next/link"
import { X, User, Phone, Mail, Loader2 } from "lucide-react"

export default function AddCustomerPage() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !phone) return

    setSaving(true)
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      })
      if (res.ok) {
        window.location.href = "/customers"
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-on-surface" style={{ fontFamily: "Instrument Serif, serif" }}>
              Add Customer
            </h1>
          </div>
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground">
            <X size={20} />
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 space-y-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-on-surface mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Siti Rahayu"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-on-surface text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Phone Number *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+6281234567890"
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
                placeholder="siti@email.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-on-surface text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-on-surface mb-4">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Sudirman No. 45, Bandung"
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-on-surface text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any important notes about this customer..."
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-on-surface text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-center hover:bg-accent transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || !name || !phone}
            className="flex-1 py-2.5 bg-primary hover:bg-primary-600 disabled:bg-muted text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <User size={16} />
                Add Customer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}