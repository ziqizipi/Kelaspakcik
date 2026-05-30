"use client"

import * as React from "react"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const tiers = [
  {
    name: "Starter",
    price: { monthly: 0, annual: 0 },
    description: "Untuk bisnis kecil yang baru memulai",
    features: [
      "1.000 pesan/bulan",
      "1 WhatsApp account",
      "Auto-reply basic",
      "Klasifikasi pesan",
      "Dashboard sederhana",
    ],
    cta: "Mulai Gratis",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    price: { monthly: 199000, annual: 159200 },
    description: "Untuk bisnis yang growing cepat",
    features: [
      "5.000 pesan/bulan",
      "3 WhatsApp accounts",
      "AI auto-reply advanced",
      "Ekstrak pesanan otomatis",
      "Growth analytics",
      "Priority support",
    ],
    cta: "Mulai Free Trial",
    href: "/register?plan=pro",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Business",
    price: { monthly: 499000, annual: 399200 },
    description: "Untuk tim yang butuh full solution",
    features: [
      "20.000 pesan/bulan",
      "Unlimited accounts",
      "AI custom training",
      "Escalation rules",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
    ],
    cta: "Hubungi Sales",
    href: "/contact",
    highlighted: false,
  },
]

function formatPrice(price: number) {
  if (price === 0) return "Gratis"
  return `Rp ${price.toLocaleString("id-ID")}`
}

export function PricingMatrix() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "annual">("monthly")

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-20 bg-card/50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p
            className={cn(
              "text-sm font-medium text-primary mb-3 uppercase tracking-wider transition-all duration-500",
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Harga
          </p>
          <h2
            className={cn(
              "text-3xl font-semibold text-on-surface mb-4 transition-all duration-500 delay-100",
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ fontFamily: "Instrument Serif, serif" }}
          >
            Pilih paket yang cocok untuk bisnis Anda
          </h2>
          <p
            className={cn(
              "text-on-surface-variant max-w-xl mx-auto transition-all duration-500 delay-200",
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Mulai gratis, upgrade kapan saja. Tidak ada hidden costs.
          </p>

          {/* Billing toggle */}
          <div
            className={cn(
              "mt-8 transition-all duration-500 delay-300",
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <Tabs
              value={billingCycle}
              onValueChange={(v) => setBillingCycle(v as "monthly" | "annual")}
              className="inline-flex"
            >
              <TabsList className="bg-muted">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="annual">
                  Annual
                  <Badge variant="success" className="ml-2 text-xs">
                    hemat 20%
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier, i) => (
            <div
              key={tier.name}
              className={cn(
                "relative rounded-2xl p-6 transition-all duration-500",
                tier.highlighted
                  ? "bg-primary text-white shadow-xl scale-105 z-10"
                  : "bg-card border border-border hover:border-primary/30 hover:shadow-lg",
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${400 + i * 100}ms` }}
            >
              {tier.badge && (
                <Badge
                  className={cn(
                    "absolute -top-3 left-1/2 -translate-x-1/2 text-xs",
                    tier.highlighted ? "bg-white text-primary" : "bg-primary text-white"
                  )}
                >
                  {tier.badge}
                </Badge>
              )}

              <div className="mb-6">
                <h3 className={cn("text-lg font-semibold mb-1", tier.highlighted ? "text-white" : "text-on-surface")}>
                  {tier.name}
                </h3>
                <p className={cn("text-sm", tier.highlighted ? "text-white/70" : "text-on-surface-variant")}>
                  {tier.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className={cn("text-3xl font-bold", tier.highlighted ? "text-white" : "text-on-surface")}>
                    {formatPrice(tier.price[billingCycle])}
                  </span>
                  {tier.price[billingCycle] > 0 && (
                    <span className={cn("text-sm", tier.highlighted ? "text-white/60" : "text-muted-foreground")}>
                      /bulan
                    </span>
                  )}
                </div>
                {billingCycle === "annual" && tier.price.annual > 0 && (
                  <p className={cn("text-xs mt-1", tier.highlighted ? "text-white/60" : "text-muted-foreground")}>
                    Ditagih Rp {(tier.price.annual * 12).toLocaleString("id-ID")}/tahun
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={tier.highlighted ? "white" : "currentColor"}
                      strokeWidth="2.5"
                      className={cn("shrink-0 mt-0.5", tier.highlighted ? "text-white" : "text-primary")}
                    >
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                    <span className={cn("text-sm", tier.highlighted ? "text-white/80" : "text-on-surface-variant")}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={tier.href}
                className={cn(
                  "inline-flex items-center justify-center h-10 px-6 rounded-lg font-medium transition-colors w-full",
                  tier.highlighted
                    ? "bg-white text-primary hover:bg-white/90"
                    : "border border-primary text-primary hover:bg-primary hover:text-white"
                )}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}