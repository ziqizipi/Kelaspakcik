"use client"
import { Search, Bell, User } from "lucide-react"

export function TopBar({ title }: { title?: string }) {
  return (
    <header
      className="sticky top-0 z-50 flex h-[68px] items-center border-b border-[#e5e2dd] bg-[rgba(247,245,242,0.9)] backdrop-blur-[10px]"
      style={{ animation: "topbarIn 0.5s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both" }}
    >
      <style jsx>{`
        @keyframes topbarIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="flex w-full max-w-[1200px] items-center gap-4 px-16">
        <span className="mr-auto text-[16px] font-bold text-[#111]">
          {title || "Dashboard"}
        </span>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-[8px] border border-transparent bg-[#f0ede8] px-3 py-2 transition-all focus-within:border-[#e0ddd8] focus-within:bg-white">
          <Search className="h-[17px] w-[17px] text-[#aaa]" />
          <input
            type="text"
            placeholder="Cari..."
            className="h-[20px] w-[180px] border-none bg-transparent text-[14px] text-[#111] outline-none placeholder:text-[#aaa]"
          />
        </div>

        {/* Notification */}
        <button className="flex h-[38px] w-[38px] items-center justify-center rounded-[8px] text-[#777] transition-all hover:bg-[#ede9e3] hover:text-[#111]">
          <Bell className="h-[18px] w-[18px]" />
        </button>

        {/* Avatar */}
        <button className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#111] cursor-pointer">
          <User className="h-[18px] w-[18px] text-white" />
        </button>
      </div>
    </header>
  )
}