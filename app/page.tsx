import { getSession } from "@/auth"
import { redirect } from "next/navigation"
import { NavBar } from "@/components/landing/nav-bar"
import { HeroSection } from "@/components/landing/hero-section"
import { LogoBar } from "@/components/landing/logo-bar"
import { FeatureSplitGrid } from "@/components/landing/feature-split-grid"
import { PricingMatrix } from "@/components/landing/pricing-matrix"
import { Testimonials } from "@/components/landing/testimonials"
import { FaqAccordion } from "@/components/landing/faq-accordion"
import { CtaSection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"
import { FloatingWhatsAppWidget } from "@/components/landing/floating-whatsapp-widget"

export default async function RootPage() {
  const session = await getSession()
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main>
        <HeroSection />
        <LogoBar />
        <FeatureSplitGrid />
        <PricingMatrix />
        <Testimonials />
        <FaqAccordion />
        <CtaSection />
      </main>
      <Footer />
      <FloatingWhatsAppWidget />
    </div>
  )
}