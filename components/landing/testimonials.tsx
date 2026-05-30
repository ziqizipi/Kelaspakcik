"use client"

import * as React from "react"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

const testimonials = [
  {
    name: "Rina Wijaya",
    role: "Owner",
    company: "RajaKue Shop",
    avatar: "RW",
    quote:
      "Dulu saya butuh 3 orang buat handle chat WhatsApp. Sekarang cukup 1 orang + BalasBro. Hemat 70% biaya operasional!",
    metric: "70% hemat biaya",
    metricLabel: "penghematan operasional",
  },
  {
    name: "Budi Santoso",
    role: "Marketing Head",
    company: "Fashionku.id",
    avatar: "BS",
    quote:
      "Response time kami turun drastis dari 15 menit jadi 2 detik. Conversion order naik 40% sejak pakai BalasBro.",
    metric: "+40% conversion",
    metricLabel: "order meningkat",
  },
  {
    name: "Sarah Chen",
    role: "Founder",
    company: "SkincareDoc",
    avatar: "SC",
    quote:
      "Fitur auto-reply + ekstrak pesanan sangat powerful. Semua order dari WhatsApp langsung masuk sistem tanpa harus input manual.",
    metric: "3x lebih cepat",
    metricLabel: "proses order",
  },
]

export function Testimonials() {
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
    <section ref={ref} className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p
            className={cn(
              "text-sm font-medium text-primary mb-3 uppercase tracking-wider transition-all duration-500",
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Testimoni
          </p>
          <h2
            className={cn(
              "text-3xl font-semibold text-on-surface mb-4 transition-all duration-500 delay-100",
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ fontFamily: "Instrument Serif, serif" }}
          >
            Dipercaya oleh bisnis di seluruh Indonesia
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Card
              key={t.name}
              className={cn(
                "p-6 transition-all duration-500",
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${300 + i * 100}ms` }}
            >
              {/* Quote */}
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Metric highlight */}
              <div className="bg-primary/5 rounded-lg p-3 mb-4">
                <p className="text-lg font-bold text-primary">{t.metric}</p>
                <p className="text-xs text-muted-foreground">{t.metricLabel}</p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">{t.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-on-surface">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.role}, {t.company}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}