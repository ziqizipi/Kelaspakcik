"use client"

import { useState } from "react"
import { CreditCard, Check, Zap } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for small businesses just getting started",
    features: ["Up to 100 conversations/month", "1 WhatsApp channel", "Basic AI auto-reply", "Email support"],
    current: false,
  },
  {
    name: "Pro",
    price: "Rp 299.000",
    period: "/month",
    description: "For growing businesses that need more power",
    features: ["Unlimited conversations", "3 WhatsApp channels", "Advanced AI classification", "Priority support", "Team access (up to 5)"],
    current: true,
  },
  {
    name: "Enterprise",
    price: "Rp 799.000",
    period: "/month",
    description: "For larger teams with advanced needs",
    features: ["Everything in Pro", "Unlimited channels", "Custom AI training", "Dedicated support", "Unlimited team members", "Custom integrations"],
    current: false,
  },
]

const paymentMethods = [
  { type: "Visa", last4: "4242", exp: "12/26" },
  { type: "Mastercard", last4: "8888", exp: "03/27" },
]

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState("Pro")

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-semibold text-on-surface mb-6" style={{ fontFamily: "Instrument Serif, serif" }}>
        Billing & Plans
      </h1>

      {/* Current Plan */}
      <div className="bg-card rounded-xl border border-primary/30 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <p className="text-2xl font-semibold text-on-surface" style={{ fontFamily: "Instrument Serif, serif" }}>Pro</p>
            <p className="text-xs text-on-surface-variant mt-1">Rp 299.000/month • Next billing 26 Jun 2026</p>
          </div>
          <button className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Plans */}
      <h2 className="text-sm font-semibold text-on-surface mb-3">Available Plans</h2>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl border p-5 cursor-pointer transition-colors ${
              plan.current
                ? "border-primary/30 bg-primary/5"
                : "border-border hover:border-primary/30"
            }`}
            onClick={() => setSelectedPlan(plan.name)}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-on-surface">{plan.name}</span>
              {plan.current && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary text-white">
                  Current
                </span>
              )}
            </div>
            <p className="text-xl font-semibold text-on-surface">
              {plan.price}
              {plan.period && <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>}
            </p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">{plan.description}</p>
            <ul className="space-y-1.5">
              {plan.features.map((f) => (
                <li key={f} className="text-xs text-on-surface-variant flex items-start gap-1.5">
                  <Check size={12} className="text-primary mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Payment Method */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-on-surface">Payment Method</h2>
          <button className="text-xs text-primary hover:text-primary-600 font-medium flex items-center gap-1">
            + Add new card
          </button>
        </div>

        <div className="space-y-3">
          {paymentMethods.map((card, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 rounded bg-muted flex items-center justify-center">
                  <CreditCard size={16} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-on-surface">{card.type} ending in {card.last4}</p>
                  <p className="text-xs text-muted-foreground">Expires {card.exp}</p>
                </div>
              </div>
              <button className="text-xs text-red-500 hover:text-red-600 font-medium">Remove</button>
            </div>
          ))}
        </div>
      </div>

      {/* Usage */}
      <div className="bg-card rounded-xl border border-border p-6 mt-4">
        <h2 className="text-sm font-semibold text-on-surface mb-4">This Month Usage</h2>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-on-surface-variant">Conversations</span>
              <span className="text-on-surface">847 / Unlimited</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "28%" }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-on-surface-variant">Team Members</span>
              <span className="text-on-surface">3 / 5</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "60%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}