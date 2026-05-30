import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default: "bg-[#111] text-white",
    secondary: "bg-[#f0ede8] text-[#5c5a52]",
    destructive: "bg-red-100 text-red-700",
    outline: "border border-[#e5e2d8] text-[#5c5a52]",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}