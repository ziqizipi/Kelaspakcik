"use client"

import { useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import { Loader2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface AIConfig {
  isEnabled: boolean
  tone: "friendly" | "formal" | "casual" | null
  sopContext: string | null
  fallbackReply: string | null
  workingHours: { start: string; end: string; timezone: string } | null
}

interface EscalationRule {
  id: string
  name: string
  type: "INTENT" | "KEYWORD" | "ORDER_VALUE"
  keywords: string[]
  minOrderValue: string | null
  notifyVia: "whatsapp" | "email"
  isActive: boolean
}

export default function UnifiedSettingsPage() {
  const { mutate } = useSWRConfig()
  const [activeCategory, setActiveCategory] = useState<"ai" | "escalation" | "wa">("ai")

  // API states
  const { data: configData, isLoading: isConfigLoading } = useSWR<{ config: AIConfig | null }>(
    "/api/ai/config",
    fetcher
  )
  const { data: rulesData, isLoading: isRulesLoading } = useSWR<{ rules: EscalationRule[] }>(
    "/api/escalation-rules",
    fetcher
  )

  const config = configData?.config
  const rules = rulesData?.rules || []

  // Form states for AI Configuration
  const [aiEnabled, setAiEnabled] = useState(true)
  const [tone, setTone] = useState<"friendly" | "formal" | "casual">("friendly")
  const [sopContext, setSopContext] = useState("")
  const [workingStart, setWorkingStart] = useState("09:00")
  const [workingEnd, setWorkingEnd] = useState("18:00")
  const [isSavingAI, setIsSavingAI] = useState(false)

  // Modal / Escalation Rule states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [ruleName, setRuleName] = useState("")
  const [ruleType, setRuleType] = useState<"INTENT" | "KEYWORD" | "ORDER_VALUE">("KEYWORD")
  const [ruleKeywords, setRuleKeywords] = useState("")
  const [minVal, setMinVal] = useState("0")
  const [isSubmittingRule, setIsSubmittingRule] = useState(false)

  // Sync initial configuration states once loaded
  const [hasSynced, setHasSynced] = useState(false)
  if (config && !hasSynced) {
    setAiEnabled(config.isEnabled)
    setTone(config.tone || "friendly")
    setSopContext(config.sopContext || "")
    if (config.workingHours) {
      setWorkingStart(config.workingHours.start)
      setWorkingEnd(config.workingHours.end)
    }
    setHasSynced(true)
  }

  // Handle Save AI Configuration
  async function handleSaveAI() {
    setIsSavingAI(true)
    try {
      const res = await fetch("/api/ai/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isEnabled: aiEnabled,
          tone,
          sopContext,
          workingHours: {
            start: workingStart,
            end: workingEnd,
            timezone: "Asia/Jakarta",
          },
        }),
      })
      if (res.ok) {
        alert("Pengaturan AI berhasil disimpan!")
        mutate("/api/ai/config")
      } else {
        alert("Gagal menyimpan pengaturan AI.")
      }
    } catch (e) {
      console.error(e)
      alert("Terjadi kesalahan sistem.")
    } finally {
      setIsSavingAI(false)
    }
  }

  // Handle Create Escalation Rule
  async function handleAddRule(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmittingRule(true)
    try {
      const res = await fetch("/api/escalation-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ruleName,
          type: ruleType,
          keywords: ruleType === "KEYWORD" ? ruleKeywords.split(",").map((k) => k.trim()) : [],
          minOrderValue: ruleType === "ORDER_VALUE" ? parseFloat(minVal) || 0 : undefined,
          notifyVia: "whatsapp",
          isActive: true,
        }),
      })
      if (res.ok) {
        setIsModalOpen(false)
        setRuleName("")
        setRuleKeywords("")
        setMinVal("0")
        mutate("/api/escalation-rules")
        alert("Aturan eskalasi berhasil ditambahkan!")
      } else {
        alert("Gagal menambahkan aturan.")
      }
    } catch (err) {
      console.error(err)
      alert("Terjadi kesalahan.")
    } finally {
      setIsSubmittingRule(false)
    }
  }

  // Handle Delete Escalation Rule
  async function handleDeleteRule(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus aturan eskalasi ini?")) return
    try {
      const res = await fetch(`/api/escalation-rules/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        mutate("/api/escalation-rules")
        alert("Aturan berhasil dihapus.")
      } else {
        alert("Gagal menghapus aturan.")
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Helper formatting for rupiah
  function formatRupiah(valStr: string | null): string {
    if (!valStr) return "Rp 0"
    const num = parseFloat(valStr)
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num)
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2] p-8 md:p-12">
      {/* Page Title */}
      <div className="mb-8">
        <div className="text-[11px] font-bold text-[#666] uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
          <span className="w-5 h-[1px] bg-[#666]"></span>
          Konfigurasi Sistem
        </div>
        <h1 className="bb-page-title mb-1">
          Pengaturan <em>Platform</em>
        </h1>
        <p className="text-sm text-[#888] italic">
          Sesuaikan perilaku AI dan integrasi WhatsApp Anda.
        </p>
      </div>

      {/* Grid Layout: Left Nav Column, Right Panel Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 items-start">
        {/* Left Side Navigation Panel */}
        <div className="bb-card !p-2 sticky top-[84px] z-10">
          <div className="bb-section-label !px-3 !py-2 !mb-1 text-[10px] font-bold uppercase tracking-wider text-[#999]">
            Kategori
          </div>
          <button
            onClick={() => setActiveCategory("ai")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
              activeCategory === "ai"
                ? "bg-[#111111] text-white font-semibold"
                : "text-[#666] hover:bg-[#f7f5f2] hover:text-[#111]"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            AI Auto-Reply
          </button>
          <button
            onClick={() => setActiveCategory("escalation")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
              activeCategory === "escalation"
                ? "bg-[#111111] text-white font-semibold"
                : "text-[#666] hover:bg-[#f7f5f2] hover:text-[#111]"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">warning</span>
            Aturan Eskalasi
          </button>
          <button
            onClick={() => setActiveCategory("wa")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
              activeCategory === "wa"
                ? "bg-[#111111] text-white font-semibold"
                : "text-[#666] hover:bg-[#f7f5f2] hover:text-[#111]"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">smartphone</span>
            Akun WhatsApp
          </button>
        </div>

        {/* Right Tab Content Panel */}
        <div className="flex flex-col gap-1 w-full">
          {/* TAB 1: AI Auto-Reply */}
          {activeCategory === "ai" && (
            <div>
              <div className="mb-4">
                <div className="bb-section-label">Konfigurasi</div>
                <h2 className="font-serif text-2xl text-[#111] mb-1">
                  AI <em className="not-italic italic text-[#3a7a55]">Auto-Reply</em>
                </h2>
                <p className="text-sm text-[#888]">
                  Konfigurasi bagaimana asisten AI berinteraksi dengan pelanggan di WhatsApp.
                </p>
              </div>

              {/* Loader */}
              {isConfigLoading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="animate-spin text-[#3a7a55]" size={24} />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* AI Switch Card */}
                  <div className="bb-card !p-0 overflow-hidden">
                    <div className="flex items-center justify-between p-5 bg-[#f7f5f2]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#111] rounded-lg flex items-center justify-center text-white">
                          <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[#111]">Aktifkan AI Auto-Reply</div>
                          <div className="text-xs text-[#888]">
                            AI akan membalas pesan masuk secara otomatis sesuai SOP.
                          </div>
                        </div>
                      </div>
                      <label className="bb-toggle">
                        <input
                          type="checkbox"
                          checked={aiEnabled}
                          onChange={(e) => setAiEnabled(e.target.checked)}
                        />
                        <div className="bb-toggle-track">
                          <div className="bb-toggle-thumb"></div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Brand Voice Options + Business Hours Chips */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Voice Options Card */}
                    <div className="bb-card">
                      <div className="bb-section-label">Gaya Bicara & Nada Brand</div>
                      <div className="flex flex-col gap-2 mt-2">
                        <div
                          onClick={() => setTone("formal")}
                          className={`bb-voice-option ${tone === "formal" ? "selected" : ""}`}
                        >
                          <div className="font-bold text-sm text-[#111]">Formal</div>
                          <div className="text-xs text-[#888]">
                            Bahasa profesional, sopan, dan penuh hormat.
                          </div>
                        </div>
                        <div
                          onClick={() => setTone("friendly")}
                          className={`bb-voice-option ${tone === "friendly" ? "selected" : ""}`}
                        >
                          <div className="font-bold text-sm text-[#111]">Ramah (Friendly)</div>
                          <div className="text-xs text-[#888]">Suasana ramah, hangat, dan membantu.</div>
                        </div>
                        <div
                          onClick={() => setTone("casual")}
                          className={`bb-voice-option ${tone === "casual" ? "selected" : ""}`}
                        >
                          <div className="font-bold text-sm text-[#111]">Santai (Casual)</div>
                          <div className="text-xs text-[#888]">
                            Santai, menggunakan Bahasa Indonesia sederhana.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Business Hours Card */}
                    <div className="bb-card">
                      <div className="bb-section-label">Jam Kerja Aktif</div>
                      <div className="grid grid-cols-7 gap-2.5 mt-2 mb-4">
                        <div className="bb-day-chip active">S</div>
                        <div className="bb-day-chip active">S</div>
                        <div className="bb-day-chip active">R</div>
                        <div className="bb-day-chip active">K</div>
                        <div className="bb-day-chip active">J</div>
                        <div className="bb-day-chip">S</div>
                        <div className="bb-day-chip">M</div>
                      </div>
                      <div className="flex items-center gap-3.5 mb-3">
                        <label className="text-xs text-[#888] w-12 font-medium">Mulai</label>
                        <input
                          type="time"
                          value={workingStart}
                          onChange={(e) => setWorkingStart(e.target.value)}
                          className="flex-1 p-2 bg-[#f7f5f2] border border-[#e0ddd8] rounded-lg text-sm font-sans focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-3.5">
                        <label className="text-xs text-[#888] w-12 font-medium">Selesai</label>
                        <input
                          type="time"
                          value={workingEnd}
                          onChange={(e) => setWorkingEnd(e.target.value)}
                          className="flex-1 p-2 bg-[#f7f5f2] border border-[#e0ddd8] rounded-lg text-sm font-sans focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SOP Textarea Card */}
                  <div className="bb-card">
                    <div className="flex justify-between items-center mb-3">
                      <div className="bb-section-label !mb-0">Konteks Pengetahuan SOP</div>
                      <span className="text-[11px] text-[#aaa] italic">
                        AI menggunakan ini untuk menjawab dengan akurat.
                      </span>
                    </div>
                    <textarea
                      placeholder="Masukkan detail produk, kebijakan pengiriman, dan cara handle komplain di sini..."
                      value={sopContext}
                      onChange={(e) => setSopContext(e.target.value)}
                      className="w-full min-h-[140px] p-4 bg-[#f7f5f2] border border-[#e0ddd8] rounded-xl text-sm font-sans text-[#111] focus:border-[#3a7a55] focus:outline-none transition-colors duration-150 leading-relaxed"
                    ></textarea>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-[#3a7a55] font-medium">
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      Semakin detail data yang Anda berikan, semakin cerdas AI membalas.
                    </div>
                  </div>

                  {/* Submit / Action Buttons */}
                  <div className="flex justify-end gap-3.5 pt-2">
                    <button
                      onClick={() => setHasSynced(false)}
                      className="bb-btn bb-btn-outline"
                    >
                      Batalkan Perubahan
                    </button>
                    <button
                      onClick={handleSaveAI}
                      disabled={isSavingAI}
                      className="bb-btn bb-btn-dark"
                    >
                      {isSavingAI && <Loader2 className="animate-spin text-white" size={14} />}
                      {isSavingAI ? "Menyimpan..." : "Simpan Pengaturan AI"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Aturan Eskalasi */}
          {activeCategory === "escalation" && (
            <div>
              <div className="mb-4">
                <div className="bb-section-label">Konfigurasi</div>
                <h2 className="font-serif text-2xl text-[#111] mb-1">
                  Aturan <em className="not-italic italic text-[#3a7a55]">Eskalasi</em>
                </h2>
                <p className="text-sm text-[#888]">
                  Tentukan kapan percakapan harus dialihkan ke tim admin manusia.
                </p>
              </div>

              {/* Switch card placeholder */}
              <div className="bb-card !p-0 overflow-hidden mb-4">
                <div className="flex items-center justify-between p-5 bg-[#f7f5f2]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ba1a1a] rounded-lg flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-[20px]">warning</span>
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#111]">Aktifkan Eskalasi Otomatis</div>
                      <div className="text-xs text-[#888]">
                        Sistem akan memberi notifikasi jika aturan terpenuhi.
                      </div>
                    </div>
                  </div>
                  <label className="bb-toggle">
                    <input type="checkbox" defaultChecked />
                    <div className="bb-toggle-track">
                      <div className="bb-toggle-thumb"></div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Rules List Container */}
              {isRulesLoading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="animate-spin text-[#3a7a55]" size={24} />
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  {rules.length === 0 ? (
                    <div className="bb-card text-center p-12">
                      <span className="material-symbols-outlined text-4xl text-gray-200 block mb-2">
                        assignment_late
                      </span>
                      <p className="text-sm text-[#888]">Belum ada aturan eskalasi aktif.</p>
                    </div>
                  ) : (
                    rules.map((rule) => (
                      <div key={rule.id} className="bb-card !p-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`bb-badge ${
                                  rule.type === "KEYWORD"
                                    ? "bb-badge-red"
                                    : rule.type === "ORDER_VALUE"
                                    ? "bb-badge-green"
                                    : "bb-badge-blue"
                                }`}
                              >
                                {rule.type}
                              </span>
                              <h3 className="font-bold text-sm text-[#111]">{rule.name}</h3>
                            </div>
                            {rule.type === "KEYWORD" && (
                              <p className="text-xs text-[#888] mb-2 leading-relaxed">
                                <strong>Kata Kunci:</strong> {rule.keywords.join(", ")}
                              </p>
                            )}
                            {rule.type === "ORDER_VALUE" && (
                              <p className="text-xs text-[#888] mb-2 leading-relaxed">
                                <strong>Nilai Minimum:</strong> {formatRupiah(rule.minOrderValue)}
                              </p>
                            )}
                            <div className="flex items-center gap-1.5 text-xs text-[#aaa]">
                              <span className="material-symbols-outlined text-[13px]">
                                notifications
                              </span>
                              Notifikasi via {rule.notifyVia.toUpperCase()} ke Admin
                            </div>
                          </div>
                          <div className="flex gap-3.5">
                            <span
                              onClick={() => handleDeleteRule(rule.id)}
                              className="text-xs font-bold text-[#ba1a1a] cursor-pointer hover:underline"
                            >
                              Hapus
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Add Rule Button */}
              <button onClick={() => setIsModalOpen(true)} className="bb-btn bb-btn-outline w-fit">
                <span className="material-symbols-outlined text-[16px]">add</span>
                Tambah Aturan
              </button>
            </div>
          )}

          {/* TAB 3: Akun WhatsApp Connection */}
          {activeCategory === "wa" && (
            <div>
              <div className="mb-4">
                <div className="bb-section-label">Konfigurasi</div>
                <h2 className="font-serif text-2xl text-[#111] mb-1">
                  Akun <em className="not-italic italic text-[#3a7a55]">WhatsApp</em>
                </h2>
                <p className="text-sm text-[#888]">
                  Kelola akun WhatsApp yang terhubung dengan BalasBro.ai.
                </p>
              </div>

              <div className="bb-card text-center !py-16">
                <div className="w-16 h-16 bg-[#f0ede8] rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#bbb]">
                  <span className="material-symbols-outlined text-[32px]">smartphone</span>
                </div>
                <h3 className="font-bold text-[17px] text-[#111] mb-2">Belum ada akun terhubung</h3>
                <p className="text-sm text-[#888] max-w-[320px] mx-auto mb-6 leading-relaxed">
                  Hubungkan akun WhatsApp Business Anda untuk mulai menggunakan fitur otomatisasi
                  BalasBro.ai.
                </p>
                <button
                  onClick={() => alert("Menampilkan Scanner QR WhatsApp...")}
                  className="bb-btn bb-btn-dark mx-auto"
                >
                  <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                  Hubungkan Sekarang
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL WINDOW FOR ADDING NEW ESCALATION RULE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-[20px] border border-[#e5e2dd] p-8 w-full max-w-[500px] shadow-xl animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-xl text-[#111]">
                Tambah Aturan <em className="not-italic italic text-[#3a7a55]">Eskalasi</em>
              </h2>
              <span
                onClick={() => setIsModalOpen(false)}
                className="material-symbols-outlined cursor-pointer text-gray-400 hover:text-gray-700 text-[22px]"
              >
                close
              </span>
            </div>

            <form onSubmit={handleAddRule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#333] mb-1.5">Nama Aturan</label>
                <input
                  type="text"
                  placeholder="Contoh: Handle Komplain Berat"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full p-3 bg-[#f7f5f2] border border-[#e0ddd8] rounded-lg text-sm focus:outline-none focus:border-[#3a7a55] font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333] mb-1.5">Tipe Trigger</label>
                <select
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value as any)}
                  className="w-full p-3 bg-[#f7f5f2] border border-[#e0ddd8] rounded-lg text-sm focus:outline-none"
                >
                  <option value="KEYWORD">KATA KUNCI</option>
                  <option value="ORDER_VALUE">NILAI PESANAN MINIMAL</option>
                  <option value="INTENT">INTENT PESAN</option>
                </select>
              </div>

              {ruleType === "KEYWORD" && (
                <div>
                  <label className="block text-xs font-bold text-[#333] mb-1.5">
                    Kata Kunci (pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    placeholder="marah, kecewa, rugi, tipu, rusak..."
                    required
                    value={ruleKeywords}
                    onChange={(e) => setRuleKeywords(e.target.value)}
                    className="w-full p-3 bg-[#f7f5f2] border border-[#e0ddd8] rounded-lg text-sm focus:outline-none focus:border-[#3a7a55] font-sans"
                  />
                </div>
              )}

              {ruleType === "ORDER_VALUE" && (
                <div>
                  <label className="block text-xs font-bold text-[#333] mb-1.5">
                    Nilai Pesanan Minimal (Rupiah)
                  </label>
                  <input
                    type="number"
                    placeholder="1000000"
                    required
                    value={minVal}
                    onChange={(e) => setMinVal(e.target.value)}
                    className="w-full p-3 bg-[#f7f5f2] border border-[#e0ddd8] rounded-lg text-sm focus:outline-none focus:border-[#3a7a55] font-sans"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bb-btn bb-btn-outline"
                >
                  Batal
                </button>
                <button type="submit" disabled={isSubmittingRule} className="bb-btn bb-btn-dark">
                  {isSubmittingRule && <Loader2 className="animate-spin text-white" size={14} />}
                  {isSubmittingRule ? "Menyimpan..." : "Simpan Aturan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}