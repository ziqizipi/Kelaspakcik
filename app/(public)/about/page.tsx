import Link from "next/link"

export default function AboutPage() {
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
        <h1 className="text-4xl font-semibold text-on-surface mb-6" style={{ fontFamily: "Instrument Serif, serif" }}>About BalasBro.ai</h1>
        <div className="prose prose-lg text-on-surface-variant space-y-6">
          <p>
            BalasBro.ai adalah platform AI-powered customer service yang dirancang khusus untuk UMKM Indonesia. Kami memahami bahwa mengelola chat WhatsApp dari banyak pelanggan bisa sangat melelahkan.
          </p>
          <p>
            Dengan BalasBro.ai, Anda bisa автоматизи responses, extract orders from conversations, dan mengelola semua chat pelanggan dari satu dashboard yang mudah digunakan.
          </p>
          <h2 className="text-2xl font-semibold text-on-surface" style={{ fontFamily: "Instrument Serif, serif" }}>Our Mission</h2>
          <p>
            Memberdayakan UMKM Indonesia dengan teknologi AI yang membuat customer service jadi lebih efisien, sehingga bisnis bisa fokus pada hal yang lebih penting.
          </p>
          <h2 className="text-2xl font-semibold text-on-surface" style={{ fontFamily: "Instrument Serif, serif" }}>Built with love in Indonesia</h2>
          <p>
            BalasBro.ai dibuat oleh tim yang paham banget kebutuhan bisnis Indonesia. Kami percaya teknologi AI seharusnya accessible untuk semua jenis bisnis, bukan cuma perusahaan besar.
          </p>
        </div>
        <div className="mt-12 text-center">
          <Link href="/register" className="px-6 py-3 bg-primary hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}