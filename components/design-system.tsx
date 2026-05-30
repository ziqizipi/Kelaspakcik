"use client"

import React from "react"

// ===== DESIGN TOKENS =====
export const colors = {
  // Surfaces
  background: "#fafaf8",
  surface: "#ffffff",
  surfaceSubtle: "#f5f4f0",
  surfaceHover: "#f0ede8",

  // Text
  textPrimary: "#111111",
  textSecondary: "#404942",
  textTertiary: "#8a8580",
  textInverse: "#fafaf8",

  // Brand (Forest Green)
  brand: "#3a7a55",
  brandDark: "#1a5e3a",
  brandLight: "#d4ede3",
  brandAccent: "#92d5a8",

  // Gold accent
  gold: "#795900",
  goldLight: "#fece65",

  // Semantic
  success: "#16a34a",
  successLight: "#dcfce7",
  warning: "#ca8a04",
  warningLight: "#fef9c3",
  error: "#dc2626",
  errorLight: "#fee2e2",
  info: "#2563eb",
  infoLight: "#dbeafe",

  // Borders
  border: "#e5e2dd",
  borderStrong: "#d1cdc7",

  // Status
  statusOpen: "#16a34a",
  statusPending: "#ca8a04",
  statusClosed: "#6b6b6b",
  statusEscalated: "#dc2626",
}

// ===== TYPOGRAPHY =====
export const typography = {
  fontSerif: "'Instrument Serif', Georgia, serif",
  fontSans: "'Inter', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
}

// ===== COMPONENT BUILDERS =====

// --- KPI Card ---
export function KPICard({
  label,
  value,
  trend,
  trendPositive,
  icon,
  loading = false,
}: {
  label: string
  value: string | number
  trend?: string
  trendPositive?: boolean
  icon: React.ReactNode
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#e5e2dd] p-5 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-3 w-24 bg-[#f0ede8] rounded" />
          <div className="w-9 h-9 bg-[#f0ede8] rounded-xl" />
        </div>
        <div className="h-8 w-20 bg-[#f0ede8] rounded mb-2" />
        <div className="h-3 w-16 bg-[#f0ede8] rounded" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e5e2dd] p-5 hover:shadow-[0_4px_20px_rgba(58,122,85,0.06)] transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-[#8a8580] uppercase tracking-wide">
          {label}
        </span>
        <div className="w-9 h-9 rounded-xl bg-[#3a7a55]/10 flex items-center justify-center text-[#3a7a55]">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-semibold text-[#111111] mb-2">{value}</div>
      {trend && (
        <div className="flex items-center gap-1">
          <span
            className={`text-xs font-medium ${
              trendPositive ? "text-[#16a34a]" : "text-[#dc2626]"
            }`}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  )
}

// --- Status Badge ---
export function StatusBadge({
  status,
  label,
}: {
  status: string
  label: string
}) {
  const statusStyles: Record<string, string> = {
    open: "bg-[#dcfce7] text-[#16a34a]",
    pending: "bg-[#fef9c3] text-[#ca8a04]",
    closed: "bg-[#f0ede8] text-[#6b6b6b]",
    escalated: "bg-[#fee2e2] text-[#dc2626]",
    recorded: "bg-[#dcfce7] text-[#16a34a]",
    confirmed: "bg-[#dbeafe] text-[#2563eb]",
    cancelled: "bg-[#fee2e2] text-[#dc2626]",
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        statusStyles[status] || "bg-[#f0ede8] text-[#6b6b6b]"
      }`}
    >
      {label}
    </span>
  )
}

// --- Intent Badge ---
export function IntentBadge({ intent }: { intent: string }) {
  const styles: Record<string, string> = {
    ORDER: "bg-[#dcfce7] text-[#16a34a]",
    COMPLAINT: "bg-[#fee2e2] text-[#dc2626]",
    PRODUCT_INQUIRY: "bg-[#dbeafe] text-[#2563eb]",
    FOLLOW_UP: "bg-[#fef9c3] text-[#ca8a04]",
    GENERAL: "bg-[#f0ede8] text-[#6b6b6b]",
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
        styles[intent] || "bg-[#f0ede8] text-[#6b6b6b]"
      }`}
    >
      {intent.replace("_", " ")}
    </span>
  )
}

// --- Avatar ---
export function Avatar({
  name,
  size = "md",
}: {
  name: string
  size?: "sm" | "md" | "lg"
}) {
  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-[#3a7a55]/10 text-[#3a7a55] font-semibold flex items-center justify-center`}
    >
      {(name || "?")[0].toUpperCase()}
    </div>
  )
}

// --- Empty State ---
export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="w-12 h-12 rounded-2xl bg-[#f0ede8] flex items-center justify-center text-[#8a8580] mb-3">
        {icon}
      </div>
      <p className="text-sm font-semibold text-[#111111]">{title}</p>
      <p className="text-xs text-[#8a8580] mt-1 max-w-[240px]">{description}</p>
    </div>
  )
}

// --- Section Header ---
export function SectionHeader({
  title,
  action,
}: {
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2
        className="text-lg font-semibold text-[#111111]"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        {title}
      </h2>
      {action}
    </div>
  )
}

// --- Page Header ---
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1
          className="text-2xl font-semibold text-[#111111]"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[#8a8580] mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}

// --- Search Bar ---
export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8580]"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#e5e2dd] bg-white text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
      />
    </div>
  )
}

// --- Tab Bar ---
export function TabBar({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: { label: string; value: string }[]
  activeTab: string
  onTabChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-1 border-b border-[#e5e2dd] -mb-px">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === tab.value
              ? "border-[#3a7a55] text-[#3a7a55]"
              : "border-transparent text-[#8a8580] hover:text-[#111111]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// --- Toggle Switch ---
export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-[#111111]">{label}</p>
        {description && (
          <p className="text-xs text-[#8a8580] mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-[#3a7a55]" : "bg-[#e5e2dd]"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  )
}

// --- Card Container ---
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#e5e2dd] p-5 ${className}`}
    >
      {children}
    </div>
  )
}

// --- Metric Pill ---
export function MetricPill({
  icon,
  label,
  value,
  color = "green",
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color?: "green" | "blue" | "yellow" | "red" | "gray"
}) {
  const colorMap = {
    green: "bg-[#dcfce7] text-[#16a34a]",
    blue: "bg-[#dbeafe] text-[#2563eb]",
    yellow: "bg-[#fef9c3] text-[#ca8a04]",
    red: "bg-[#fee2e2] text-[#dc2626]",
    gray: "bg-[#f0ede8] text-[#6b6b6b]",
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f5f4f0]">
      <span className="text-[#8a8580]">{icon}</span>
      <span className="text-xs text-[#8a8580]">{label}:</span>
      <span
        className={`text-xs font-semibold ${colorMap[color].split(" ")[1]}`}
      >
        {value}
      </span>
    </div>
  )
}