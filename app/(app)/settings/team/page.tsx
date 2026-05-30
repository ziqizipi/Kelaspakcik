"use client"

import { useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import { Plus, Mail, MoreVertical, Shield, Loader2, X, CheckCircle2, Users, ArrowRight } from "lucide-react"
import { Avatar, Card, StatusBadge } from "@/components/design-system"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface TeamMember {
  id: string
  name: string | null
  email: string
  role: "owner" | "admin" | "agent"
  createdAt: string
}

interface TeamResponse {
  users: TeamMember[]
}

const roleLabels: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  agent: "Agent",
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function TeamPage() {
  const { mutate } = useSWRConfig()
  const [showInvite, setShowInvite] = useState(false)
  const [inviteName, setInviteName] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("agent")
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState("")
  const [inviteSuccess, setInviteSuccess] = useState("")

  const { data, isLoading } = useSWR<TeamResponse>("/api/tenant/team", fetcher)
  const members = data?.users || []

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail) return

    setInviteLoading(true)
    setInviteError("")
    setInviteSuccess("")

    try {
      const res = await fetch("/api/tenant/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inviteName, email: inviteEmail, role: inviteRole }),
      })

      const resData = await res.json()

      if (!res.ok) {
        setInviteError(resData.error || "Gagal mengundang anggota")
        return
      }

      setInviteSuccess(`Undangan terkirim ke ${inviteEmail}. Password sementara: ${resData.tempPassword}`)
      setInviteName("")
      setInviteEmail("")
      setInviteRole("agent")
      mutate("/api/tenant/team")

      setTimeout(() => {
        setShowInvite(false)
        setInviteSuccess("")
      }, 4000)
    } catch {
      setInviteError("Terjadi kesalahan. Coba lagi.")
    } finally {
      setInviteLoading(false)
    }
  }

  async function handleRemove(memberId: string) {
    if (!confirm("Yakin ingin menghapus anggota ini?")) return

    try {
      await fetch(`/api/tenant/team/${memberId}`, { method: "DELETE" })
      mutate("/api/tenant/team")
    } catch {
      // silently fail
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] p-6">
      <div className="max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-2xl font-semibold text-[#111111]"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Tim
            </h1>
            <p className="text-sm text-[#8a8580] mt-0.5">
              {members.length} anggota • Kelola akses tim Anda
            </p>
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#3a7a55] hover:bg-[#1a5e3a] text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
          >
            <Plus size={16} />
            Undang Anggota
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#dcfce7] flex items-center justify-center text-[#16a34a]">
                <Users size={18} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#111111]">{members.length}</p>
                <p className="text-xs text-[#8a8580]">Total Anggota</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#dbeafe] flex items-center justify-center text-[#2563eb]">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#111111]">
                  {members.filter((m) => m.role !== "owner").length}
                </p>
                <p className="text-xs text-[#8a8580]">Admin & Agent</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fef9c3] flex items-center justify-center text-[#ca8a04]">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#111111]">0</p>
                <p className="text-xs text-[#8a8580]">Pending Invite</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Member List */}
        <Card className="!p-0 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-[#8a8580]" />
            </div>
          ) : members.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#f0ede8] flex items-center justify-center mx-auto mb-3">
                <Users size={20} className="text-[#8a8580]" />
              </div>
              <p className="text-sm font-semibold text-[#111111]">Belum ada anggota</p>
              <p className="text-xs text-[#8a8580] mt-1">Undang anggota pertama Anda</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f0ede8]">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-[#f5f4f0]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={member.name || member.email} size="md" />
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">
                        {member.name || member.email}
                      </p>
                      <p className="text-xs text-[#8a8580]">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        member.role === "owner"
                          ? "bg-[#fef9c3] text-[#ca8a04]"
                          : member.role === "admin"
                          ? "bg-[#dbeafe] text-[#2563eb]"
                          : "bg-[#f0ede8] text-[#6b6b6b]"
                      }`}
                    >
                      {roleLabels[member.role]}
                    </span>
                    <span className="text-xs text-[#8a8580] hidden sm:block">
                      {formatDate(member.createdAt)}
                    </span>
                    {member.role !== "owner" ? (
                      <button
                        onClick={() => handleRemove(member.id)}
                        className="p-1.5 rounded-lg hover:bg-[#fee2e2] text-[#8a8580] hover:text-[#dc2626] transition-colors"
                      >
                        <MoreVertical size={14} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-[#8a8580] w-6">
                        <Shield size={12} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm !p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#3a7a55]/10 flex items-center justify-center text-[#3a7a55]">
                  <Mail size={16} />
                </div>
                <h2
                  className="text-lg font-semibold text-[#111111]"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  Undang Anggota
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowInvite(false)
                  setInviteError("")
                  setInviteSuccess("")
                }}
                className="p-1.5 rounded-lg hover:bg-[#f5f4f0] text-[#8a8580]"
              >
                <X size={18} />
              </button>
            </div>

            {inviteSuccess && (
              <div className="mb-4 flex items-start gap-3 px-4 py-3 bg-[#dcfce7] border border-[#bbf7d0] rounded-xl">
                <CheckCircle2 size={16} className="text-[#16a34a] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#16a34a]">Berhasil!</p>
                  <p className="text-xs text-[#404942] mt-0.5">{inviteSuccess}</p>
                </div>
              </div>
            )}

            {inviteError && (
              <div className="mb-4 px-4 py-3 bg-[#fee2e2] border border-[#fecaca] rounded-xl text-sm text-[#dc2626]">
                {inviteError}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                  Nama
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Nama lengkap"
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@company.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm placeholder:text-[#8a8580] focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#404942] mb-1.5 uppercase tracking-wide">
                  Peran
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e2dd] bg-[#fafaf8] text-[#111111] text-sm focus:outline-none focus:ring-2 focus:ring-[#3a7a55]/20 focus:border-[#3a7a55] transition-all"
                >
                  <option value="agent">Agent — bisa lihat & balas pesan</option>
                  <option value="admin">Admin — bisa kelola pelanggan & pesanan</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowInvite(false)
                    setInviteError("")
                    setInviteSuccess("")
                  }}
                  className="flex-1 py-3 rounded-xl border border-[#e5e2dd] text-[#404942] text-sm font-medium hover:bg-[#f5f4f0] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="flex-1 py-3 rounded-xl bg-[#3a7a55] hover:bg-[#1a5e3a] disabled:bg-[#f0ede8] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {inviteLoading && <Loader2 size={14} className="animate-spin" />}
                  {inviteLoading ? "Mengirim..." : "Kirim Undangan"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}