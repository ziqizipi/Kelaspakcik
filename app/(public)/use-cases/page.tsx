import Link from "next/link"

export default function UseCasesPage() {
  const useCases = [
    {
      title: "Otomatisasi客服",
      description: "Balas pertanyaan umum seperti jam operasional, lokasi, dan info produk secara otomatis.",
    },
    {
      title: "Ekstrak Order",
      description: "AI mendeteksi \"mau pesan 2 Product A\" dan langsung buat pesanan di sistem.",
    },
    {
      title: "Klasifikasi Intent",
      description: "Pesan dikategorikan: Order, Komplain, Pertanyaan, Follow-up untuk routing yang tepat.",
    },
    {
      title: "Escalation Otomatis",
      description: "Komplain dan masalah kompleks langsung di-escalate ke owner atau admin.",
    },
    {
      title: "Follow-up Order",
      description: "Kirim update pengiriman dan minta review setelah order selesai.",
    },
    {
      title: "Bulk Broadcast",
      description: "Kirim promo atau announcement ke semua customer sekaligus.",
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
          <h1 className="text-4xl font-semibold text-on-surface mb-4" style={{ fontFamily: "Instrument Serif, serif" }}>Use Cases</h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Berbagai cara BalasBro.ai bisa membantu bisnis Anda.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {useCases.map((uc, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-6">
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-semibold text-sm">{i + 1}</span>
              </div>
              <h3 className="text-base font-semibold text-on-surface mb-2" style={{ fontFamily: "Instrument Serif, serif" }}>
                {uc.title}
              </h3>
              <p className="text-sm text-on-surface-variant">{uc.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/register" className="inline-block px-6 py-3 bg-primary hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors">
            Mulai Sekarang
          </Link>
        </div>
      </div>
    </div>
  )
}