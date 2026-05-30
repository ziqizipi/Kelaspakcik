import Link from "next/link"

export default function HowItWorksPage() {
  const steps = [
    {
      number: "01",
      title: "Connect WhatsApp",
      description: "Hubungkan nomor WhatsApp Business Anda ke BalasBro.ai dalam hitungan menit.",
    },
    {
      number: "02",
      title: "AI Menerima Pesan",
      description: "Ketika pelanggan mengirim pesan, AI langsung menganalisis dan mengklasifikasikan intent.",
    },
    {
      number: "03",
      title: "Auto-Reply atau Eskalasi",
      description: "AI membalas secara otomatis untuk pertanyaan umum, atau mengeskalasi ke tim Anda untuk kasus yang kompleks.",
    },
    {
      number: "04",
      title: "Order Terbuat Otomatis",
      description: "Untuk pesan order, AI mengekstrak detail dan membuat pesanan secara otomatis.",
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
          <Link href="/login" className="text-sm text-primary hover:text-primary-600 font-medium">Sign in</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-semibold text-on-surface mb-4" style={{ fontFamily: "Instrument Serif, serif" }}>How It Works</h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Mulai dari connect WhatsApp sampai automation penuh dalam 4 langkah sederhana.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-5">
              <div className="text-4xl font-semibold text-primary/20" style={{ fontFamily: "Instrument Serif, serif" }}>
                {step.number}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-on-surface mb-2" style={{ fontFamily: "Instrument Serif, serif" }}>
                  {step.title}
                </h3>
                <p className="text-on-surface-variant">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center bg-card rounded-xl border border-border p-8">
          <h2 className="text-2xl font-semibold text-on-surface mb-4" style={{ fontFamily: "Instrument Serif, serif" }}>
            Siap automate customer service Anda?
          </h2>
          <p className="text-on-surface-variant mb-6">Mulai gratis dalam 5 menit. Tidak perlu kartu kredit.</p>
          <Link href="/register" className="inline-block px-6 py-3 bg-primary hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors">
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  )
}