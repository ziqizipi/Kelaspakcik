import Link from "next/link"

export default function ProductPage() {
  const features = [
    {
      title: "Smart Inbox",
      description: "Kelola semua percakapan WhatsApp dari satu inbox yang terorganisir.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: "AI Auto-Reply",
      description: "Balas pesan pelanggan secara otomatis dengan AI yang natural.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
          <path d="M12 2a10 10 0 1010 10H12V2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 2a10 10 0 01-10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: "Order Extraction",
      description: "AI otomatis mendeteksi detail pesanan dari chat dan buat pesanan.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: "Intent Classification",
      description: "Klasifikasi pesan otomatis: Order, Komplain, Pertanyaan, Follow-up.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
          <path d="M4 4h16v16H4zM9 9h6M9 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: "Multi-Channel",
      description: "Kelola beberapa nomor WhatsApp dari satu dashboard.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
          <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "Team Collaboration",
      description: "Kelola agent dan assign percakapan dengan mudah.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ]

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
        <div className="text-center mb-16">
          <h1 className="text-4xl font-semibold text-on-surface mb-4" style={{ fontFamily: "Instrument Serif, serif" }}>Product Features</h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Semua yang Anda butuhkan untuk mengelola customer service WhatsApp dengan efisien.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-6">
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-on-surface mb-2" style={{ fontFamily: "Instrument Serif, serif" }}>
                {f.title}
              </h3>
              <p className="text-sm text-on-surface-variant">{f.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/register" className="inline-block px-6 py-3 bg-primary hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors">
            Try It Free
          </Link>
        </div>
      </div>
    </div>
  )
}