"use client"

import * as React from "react"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "Bagaimana cara kerja auto-reply AI?",
    answer:
      "Anda atur kata kunci dan response template di dashboard. Ketika pelanggan kirim pesan yang mengandung kata kunci tersebut, AI akan otomatis membalas dengan response yang sesuai. AI juga belajar dari conversation Anda untuk response yang lebih natural.",
  },
  {
    question: "Apakah saya perlu punya banyak WhatsApp account?",
    answer:
      "Tidak wajib. Anda bisa mulai dengan 1 WhatsApp account. Tapi jika bisnis Anda punya多个 channel (misalnya untuk produk berbeda atau customer berbeda), paket Pro dan Business mendukung multiple accounts.",
  },
  {
    question: "Bagaimana dengan privasi dan keamanan data?",
    answer:
      "Semua data dienkripsi end-to-end. Kami tidak menyimpan isi chat WhatsApp Anda secara permanen — hanya metadata yang dibutuhkan untuk analytics. Kami juga GDPR-compliant dan siap untuk audit security jika diperlukan.",
  },
  {
    question: "Berapa lama waktu setup?",
    answer:
      "Dalam 15 menit, auto-reply sudah bisa aktif! Anda tinggal connect WhatsApp, atur kata kunci, dan AI siap membalas. Untuk fitur advanced seperti custom training atau integrations, biasanya butuh 1-2 hari.",
  },
  {
    question: "Apakah bisa integrasi dengan sistem yang sudah ada?",
    answer:
      "Ya! Paket Business menyediakan API access dan custom integrations. Kami sudah terintegrasi dengan Shopify, WooCommerce, dan platform e-commerce populer lainnya. Hubungi kami untuk request integration tertentu.",
  },
  {
    question: "Bagaimana jika AI salah merespons?",
    answer:
      "Semua response AI bisa Anda review dan edit. Anda juga bisa set escalation rules — misalnya pesan yang mengandung kata-kata negatif atau طلب refund akan langsung diteruskan ke tim Anda untuk handling manual.",
  },
]

export function FaqAccordion() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)

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
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <p
            className={cn(
              "text-sm font-medium text-primary mb-3 uppercase tracking-wider transition-all duration-500",
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            FAQ
          </p>
          <h2
            className={cn(
              "text-3xl font-semibold text-on-surface transition-all duration-500 delay-100",
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ fontFamily: "Instrument Serif, serif" }}
          >
            Pertanyaan yang Sering Diajukan
          </h2>
        </div>

        <Accordion
          type="single"
          collapsible
          className={cn(
            "transition-all duration-500 delay-200",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b border-border px-1">
              <AccordionTrigger className="text-left py-4 text-on-surface hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-on-surface-variant text-sm pb-4 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}