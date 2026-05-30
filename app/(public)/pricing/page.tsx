import Link from "next/link"

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for small businesses just getting started",
    features: ["Up to 100 conversations/month", "1 WhatsApp channel", "Basic AI auto-reply", "Email support"],
    cta: "Get started",
  },
  {
    name: "Pro",
    price: "Rp 299.000",
    period: "/month",
    description: "For growing businesses that need more power",
    features: ["Unlimited conversations", "3 WhatsApp channels", "Advanced AI classification", "Priority support", "Team access (up to 5)"],
    cta: "Start free trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Rp 799.000",
    period: "/month",
    description: "For larger teams with advanced needs",
    features: ["Everything in Pro", "Unlimited channels", "Custom AI training", "Dedicated support", "Unlimited team members", "Custom integrations"],
    cta: "Contact sales",
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="px-6 py-4 border-b border-border bg-card">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-base font-semibold text-on-surface" style={{ fontFamily: "Instrument Serif, serif" }}>BalasBro.ai</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-on-surface-variant hover:text-on-surface">Sign in</Link>
            <Link href="/register" className="px-4 py-2 bg-primary hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors">Get started</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold text-on-surface mb-4" style={{ fontFamily: "Instrument Serif, serif" }}>Simple, transparent pricing</h1>
          <p className="text-lg text-on-surface-variant">Choose the plan that fits your business. Upgrade or downgrade anytime.</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 ${
                plan.popular ? "border-primary/30 bg-primary/5" : "border-border"
              }`}
            >
              {plan.popular && (
                <span className="inline-block px-2 py-0.5 bg-primary text-white text-xs font-medium rounded-full mb-3">Most Popular</span>
              )}
              <h2 className="text-xl font-semibold text-on-surface" style={{ fontFamily: "Instrument Serif, serif" }}>{plan.name}</h2>
              <p className="text-3xl font-semibold text-on-surface mt-2">
                {plan.price}
                {plan.period && <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>}
              </p>
              <p className="text-sm text-on-surface-variant mt-1 mb-4">{plan.description}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-on-surface flex items-start gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary flex-shrink-0 mt-0.5">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  plan.popular
                    ? "bg-primary hover:bg-primary-600 text-white"
                    : "border border-border hover:bg-accent text-on-surface"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </div>
  )
}