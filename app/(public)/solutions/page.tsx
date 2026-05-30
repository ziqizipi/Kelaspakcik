import Link from "next/link"

export default function SolutionsPage() {
  const solutions = [
    {
      title: "Retail & E-Commerce",
      description: "Otomatisasi respons untuk pertanyaan produk, order, dan tracking pengiriman.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: "Food & Beverage",
      description: "Kelola reservasi, pesanan, dan inquiry menu dengan AI.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
          <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: "Healthcare",
      description: "Booking appointment, reminder, dan informasi layanan kesehatan.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: "Finance & Banking",
      description: "Informasi produk, status aplikasi, dan layanan pelanggan 24/7.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
          <h1 className="text-4xl font-semibold text-on-surface mb-4" style={{ fontFamily: "Instrument Serif, serif" }}>Industries & Solutions</h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            BalasBro.ai bisa disesuaikan untuk berbagai industri di Indonesia.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {solutions.map((sol, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-6 flex gap-5">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                {sol.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-on-surface mb-2" style={{ fontFamily: "Instrument Serif, serif" }}>
                  {sol.title}
                </h3>
                <p className="text-sm text-on-surface-variant">{sol.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-on-surface-variant mb-4">Industri Anda tidak ada di list?</p>
          <Link href="/contact" className="inline-block px-6 py-3 border border-border hover:bg-accent text-on-surface text-sm font-medium rounded-lg transition-colors">
            Hubungi kami
          </Link>
        </div>
      </div>
    </div>
  )
}