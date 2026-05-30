"use client"

import * as React from "react"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export function LogoBar() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-12 border-y border-border bg-card/50">
      <div className="max-w-6xl mx-auto px-6">
        <p
          className={cn(
            "text-center text-sm text-muted-foreground mb-8 transition-all duration-700",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          Dipercaya oleh <span className="font-semibold text-on-surface">2.500+</span> bisnis Indonesia
        </p>

        <div
          className={cn(
            "flex flex-wrap items-center justify-center gap-8 md:gap-16 transition-all duration-700 delay-200",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          {/* Placeholder logos - in production, replace with actual client logos */}
          {["Tokopedia", "Shopee", "Gojek", "Traveloka", "Blibli"].map((name, i) => (
            <div
              key={name}
              className="text-muted-foreground/40 font-semibold text-sm tracking-wider uppercase"
              style={{ opacity: 1 - i * 0.1 }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}