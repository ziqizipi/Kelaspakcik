"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { X, ShoppingCart, Plus, Trash2, Loader2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Product {
  id: string
  name: string
  sku: string | null
  description: string | null
  price: number
  qty: number
  imageUrl: string | null
}

interface ProductsResponse {
  products: Product[]
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function AddOrderPage() {
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [items, setItems] = useState<{ id: string; name: string; price: number; quantity: number }[]>([])
  const [saving, setSaving] = useState(false)

  const { data, isLoading } = useSWR<ProductsResponse>("/api/products", fetcher)
  const products = data?.products || []

  function addProduct(product: Product) {
    const existing = items.find((i) => i.id === product.id)
    if (existing) {
      setItems(items.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)))
    } else {
      setItems([...items, { id: product.id, name: product.name, price: Number(product.price), quantity: 1 }])
    }
  }

  function updateQuantity(id: string, delta: number) {
    setItems(
      items
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0)
    )
  }

  function removeItem(id: string) {
    setItems(items.filter((i) => i.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 15000
  const total = subtotal + shipping

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!customerName || !customerPhone || items.length === 0) return

    setSaving(true)
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerAddress,
          items,
          amount: total,
        }),
      })
    } finally {
      setSaving(false)
      window.location.href = "/orders"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-on-surface" style={{ fontFamily: "Instrument Serif, serif" }}>
              Add Order
            </h1>
          </div>
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground">
            <X size={20} />
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Customer Info */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-on-surface mb-4">Customer Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Siti Rahayu"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-on-surface text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Phone Number</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+6281234567890"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-on-surface text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Shipping Address</label>
              <textarea
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Jl. Sudirman No. 45, Bandung"
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-on-surface text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-on-surface mb-4">Products</h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No products available. Add products first.</p>
            </div>
          ) : (
            <>
              {/* Available products */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addProduct(p)}
                    className="p-3 border border-border rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <p className="text-sm font-medium text-on-surface">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{formatRupiah(Number(p.price))}</p>
                  </button>
                ))}
              </div>

              {/* Selected items */}
              {items.length > 0 ? (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-on-surface">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{formatRupiah(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 rounded border border-border flex items-center justify-center text-muted-foreground hover:bg-accent"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium text-on-surface w-6 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded border border-border flex items-center justify-center text-muted-foreground hover:bg-accent"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <ShoppingCart size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No products selected</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-on-surface mb-3">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-on-surface">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-on-surface">{formatRupiah(shipping)}</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-border">
                <span className="text-on-surface">Total</span>
                <span className="text-primary">{formatRupiah(total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-center hover:bg-accent transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || !customerName || !customerPhone || items.length === 0}
            className="flex-1 py-2.5 bg-primary hover:bg-primary-600 disabled:bg-muted text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              "Create Order"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
