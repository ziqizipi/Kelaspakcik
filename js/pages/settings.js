// ============================================================
// SETTINGS PAGE (Editorial Redesign)
// ============================================================
window.Pages = window.Pages || {};

Pages.settings = function () {

  const renderAI = () => `
    <div style="margin-bottom:4px;">
      <div class="bb-section-label">Konfigurasi</div>
      <h2 style="font-family:'Instrument Serif',serif;font-size:26px;font-weight:400;color:#111;letter-spacing:-0.02em;margin-bottom:6px;">AI <em style="font-style:italic;color:#3a7a55;">Auto-Reply</em></h2>
      <p style="font-size:14px;color:#888;margin-bottom:24px;">Konfigurasi bagaimana asisten AI berinteraksi dengan pelanggan di WhatsApp.</p>
    </div>

    <!-- AI Toggle -->
    <div class="bb-card" style="padding:0;margin-bottom:16px;overflow:hidden;">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px;background:#f7f5f2;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:40px;height:40px;background:#111;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <span class="material-symbols-outlined" style="color:#fff;font-size:20px;">smart_toy</span>
          </div>
          <div>
            <div style="font-size:15px;font-weight:700;color:#111;">Aktifkan AI Auto-Reply</div>
            <div style="font-size:13px;color:#888;">AI akan membalas pesan masuk secara otomatis sesuai SOP.</div>
          </div>
        </div>
        <label class="bb-toggle">
          <input type="checkbox" checked id="ai-toggle" />
          <div class="bb-toggle-track"><div class="bb-toggle-thumb"></div></div>
        </label>
      </div>
    </div>

    <!-- Brand Voice & Hours -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
      <div class="bb-card" style="padding:24px;">
        <div class="bb-section-label">Gaya Bicara & Nada Brand</div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">
          <div class="bb-voice-option" id="voice-formal">
            <div style="font-size:14px;font-weight:600;color:#111;">Formal</div>
            <div style="font-size:12px;color:#888;">Bahasa profesional, sopan, dan penuh hormat.</div>
          </div>
          <div class="bb-voice-option selected" id="voice-friendly">
            <div style="font-size:14px;font-weight:600;color:#111;">Ramah (Friendly)</div>
            <div style="font-size:12px;color:#888;">Suasana ramah, hangat, dan membantu.</div>
          </div>
          <div class="bb-voice-option" id="voice-casual">
            <div style="font-size:14px;font-weight:600;color:#111;">Santai (Casual)</div>
            <div style="font-size:12px;color:#888;">Santai, menggunakan Bahasa Indonesia sederhana.</div>
          </div>
        </div>
      </div>

      <div class="bb-card" style="padding:24px;">
        <div class="bb-section-label">Jam Kerja Aktif</div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:16px;margin-top:4px;">
          <div class="bb-day-chip active">S</div><div class="bb-day-chip active">S</div>
          <div class="bb-day-chip active">R</div><div class="bb-day-chip active">K</div>
          <div class="bb-day-chip active">J</div><div class="bb-day-chip">S</div>
          <div class="bb-day-chip">M</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <label style="font-size:13px;color:#888;width:80px;">Mulai</label>
          <input type="time" value="09:00" style="padding:8px 12px;border:1.5px solid #e0ddd8;border-radius:8px;font-size:14px;outline:none;background:#f7f5f2;font-family:'Inter',sans-serif;" />
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <label style="font-size:13px;color:#888;width:80px;">Selesai</label>
          <input type="time" value="18:00" style="padding:8px 12px;border:1.5px solid #e0ddd8;border-radius:8px;font-size:14px;outline:none;background:#f7f5f2;font-family:'Inter',sans-serif;" />
        </div>
      </div>
    </div>

    <!-- SOP Textarea -->
    <div class="bb-card" style="padding:24px;margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div class="bb-section-label" style="margin-bottom:0;">Konteks Pengetahuan SOP</div>
        <span style="font-size:12px;color:#aaa;font-style:italic;">AI menggunakan ini untuk menjawab dengan akurat.</span>
      </div>
      <textarea placeholder="Masukkan detail produk, kebijakan pengiriman, dan cara handle komplain di sini..." style="width:100%;min-height:100px;padding:14px 16px;border:1.5px solid #e0ddd8;border-radius:10px;font-size:14px;color:#111;background:#f7f5f2;resize:vertical;outline:none;font-family:'Inter',sans-serif;line-height:1.6;transition:border-color 0.15s;box-sizing:border-box;" onfocus="this.style.borderColor='#3a7a55'" onblur="this.style.borderColor='#e0ddd8'"></textarea>
      <div style="display:flex;align-items:center;gap:6px;margin-top:8px;font-size:12px;color:#3a7a55;">
        <span class="material-symbols-outlined" style="font-size:14px;">info</span>
        Semakin detail data yang Anda berikan, semakin cerdas AI membalas.
      </div>
    </div>

    <!-- Intent Templates -->
    <div class="bb-card" style="padding:24px;margin-bottom:16px;">
      <div class="bb-section-label">Template Respon Niat (Intent)</div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:4px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;padding:14px 16px;background:#f7f5f2;border-radius:10px;border:1px solid #e5e2dd;">
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <span class="bb-badge bb-badge-orange">UTAMA</span>
              <span style="font-size:14px;font-weight:600;color:#111;">Niat Pembelian</span>
            </div>
            <div style="font-size:13px;color:#999;font-style:italic;line-height:1.5;">"Halo Kak! Terima kasih minatnya. Untuk order silakan kirimkan format Nama - Alamat - Produk..."</div>
          </div>
          <span style="font-size:13px;font-weight:600;color:#3a7a55;cursor:pointer;margin-left:16px;">Edit</span>
        </div>
        <div style="display:flex;align-items:flex-start;justify-content:space-between;padding:14px 16px;background:#f7f5f2;border-radius:10px;border:1px solid #e5e2dd;">
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <span class="bb-badge bb-badge-gray">UMUM</span>
              <span style="font-size:14px;font-weight:600;color:#111;">Salam & Info Umum</span>
            </div>
            <div style="font-size:13px;color:#999;font-style:italic;line-height:1.5;">"Selamat datang di BalasBro.ai! Ada yang bisa kami bantu hari ini?"</div>
          </div>
          <span style="font-size:13px;font-weight:600;color:#3a7a55;cursor:pointer;margin-left:16px;">Edit</span>
        </div>
        <button class="bb-btn bb-btn-outline bb-btn-sm" style="align-self:flex-start;">
          <span class="material-symbols-outlined" style="font-size:15px;">add</span>Tambah Template
        </button>
      </div>
    </div>

    <div style="display:flex;justify-content:flex-end;gap:12px;">
      <button class="bb-btn bb-btn-outline">Batalkan Perubahan</button>
      <button class="bb-btn bb-btn-dark">Simpan Pengaturan AI</button>
    </div>
  `;

  const renderEskalasi = () => `
    <div style="margin-bottom:4px;">
      <div class="bb-section-label">Konfigurasi</div>
      <h2 style="font-family:'Instrument Serif',serif;font-size:26px;font-weight:400;color:#111;letter-spacing:-0.02em;margin-bottom:6px;">Aturan <em style="font-style:italic;color:#3a7a55;">Eskalasi</em></h2>
      <p style="font-size:14px;color:#888;margin-bottom:24px;">Tentukan kapan percakapan harus dialihkan ke tim manusia.</p>
    </div>

    <div class="bb-card" style="padding:0;margin-bottom:16px;overflow:hidden;">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px;background:#f7f5f2;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:40px;height:40px;background:#ba1a1a;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <span class="material-symbols-outlined" style="color:#fff;font-size:20px;">warning</span>
          </div>
          <div>
            <div style="font-size:15px;font-weight:700;color:#111;">Aktifkan Eskalasi Otomatis</div>
            <div style="font-size:13px;color:#888;">Sistem akan memberi notifikasi jika aturan terpenuhi.</div>
          </div>
        </div>
        <label class="bb-toggle">
          <input type="checkbox" checked id="eskalasi-toggle" />
          <div class="bb-toggle-track"><div class="bb-toggle-thumb"></div></div>
        </label>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:16px;">
      <div class="bb-card" style="padding:20px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
              <span class="bb-badge bb-badge-red">COMPLAINT</span>
              <h3 style="font-size:15px;font-weight:700;">Handle Komplain Berat</h3>
            </div>
            <p style="font-size:13px;color:#888;margin-bottom:8px;"><strong>Keywords:</strong> marah, kecewa, lapor, penipuan, rusak</p>
            <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#aaa;">
              <span class="material-symbols-outlined" style="font-size:14px;">notifications</span>WhatsApp Admin
            </div>
          </div>
          <div style="display:flex;gap:12px;">
            <span style="font-size:13px;font-weight:600;color:#3a7a55;cursor:pointer;">Edit</span>
            <span style="font-size:13px;font-weight:600;color:#ba1a1a;cursor:pointer;">Hapus</span>
          </div>
        </div>
      </div>
      <div class="bb-card" style="padding:20px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
              <span class="bb-badge bb-badge-green">HIGH_VALUE</span>
              <h3 style="font-size:15px;font-weight:700;">Calon Pembeli Besar</h3>
            </div>
            <p style="font-size:13px;color:#888;margin-bottom:8px;"><strong>Min Order Value:</strong> Rp 1.000.000</p>
            <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#aaa;">
              <span class="material-symbols-outlined" style="font-size:14px;">notifications</span>WhatsApp Admin
            </div>
          </div>
          <div style="display:flex;gap:12px;">
            <span style="font-size:13px;font-weight:600;color:#3a7a55;cursor:pointer;">Edit</span>
            <span style="font-size:13px;font-weight:600;color:#ba1a1a;cursor:pointer;">Hapus</span>
          </div>
        </div>
      </div>
    </div>
    <button class="bb-btn bb-btn-outline" id="add-rule-btn">
      <span class="material-symbols-outlined">add</span>Tambah Aturan
    </button>
  `;

  const renderWA = () => `
    <div style="margin-bottom:4px;">
      <div class="bb-section-label">Konfigurasi</div>
      <h2 style="font-family:'Instrument Serif',serif;font-size:26px;font-weight:400;color:#111;letter-spacing:-0.02em;margin-bottom:6px;">Akun <em style="font-style:italic;color:#3a7a55;">WhatsApp</em></h2>
      <p style="font-size:14px;color:#888;margin-bottom:24px;">Kelola akun WhatsApp yang terhubung dengan BalasBro.ai.</p>
    </div>
    <div class="bb-card" style="padding:64px 24px;text-align:center;">
      <div style="width:72px;height:72px;background:#f0ede8;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
        <span class="material-symbols-outlined" style="font-size:32px;color:#bbb;">smartphone</span>
      </div>
      <h3 style="font-size:17px;font-weight:700;color:#111;margin-bottom:8px;">Belum ada akun terhubung</h3>
      <p style="font-size:14px;color:#888;max-width:320px;margin:0 auto 28px;line-height:1.6;">Hubungkan akun WhatsApp Business Anda untuk mulai menggunakan fitur otomatisasi BalasBro.ai.</p>
      <button class="bb-btn bb-btn-dark" style="margin:0 auto;">
        <span class="material-symbols-outlined">qr_code_scanner</span>Hubungkan Sekarang
      </button>
    </div>
  `;

  const main = `
<style>
.bb-toggle { position:relative;width:48px;height:26px;cursor:pointer;display:block; }
.bb-toggle input { display:none; }
.bb-toggle-track { position:absolute;inset:0;background:#e0ddd8;border-radius:999px;transition:background 0.2s; }
.bb-toggle input:checked + .bb-toggle-track { background:#111; }
.bb-toggle-thumb { position:absolute;top:3px;left:3px;width:20px;height:20px;background:white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.2);transition:transform 0.2s; }
.bb-toggle input:checked + .bb-toggle-track .bb-toggle-thumb { transform:translateX(22px); }
.bb-voice-option { border:1.5px solid #e0ddd8;border-radius:10px;padding:12px 16px;cursor:pointer;transition:all 0.15s; }
.bb-voice-option:hover { border-color:#111; }
.bb-voice-option.selected { border-color:#111;background:#f7f5f2; }
.bb-day-chip { height:34px;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;border:1.5px solid #e0ddd8;color:#aaa; }
.bb-day-chip.active { background:#111;border-color:#111;color:#fff; }
.bb-day-chip:hover:not(.active) { border-color:#111;color:#111; }
.settings-panel { display:flex;flex-direction:column;gap:4px; }
</style>

<div style="margin-bottom:32px;">
  <div style="font-size:11px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;display:flex;align-items:center;gap:8px;">
    <span style="width:20px;height:1px;background:#666;"></span>
    Konfigurasi Sistem
  </div>
  <h1 class="bb-page-title" style="margin-bottom:4px;">Pengaturan <em>Platform</em></h1>
  <p style="font-size:14px;color:#888;font-style:italic;">Sesuaikan perilaku AI dan integrasi WhatsApp Anda.</p>
</div>

<div style="display:grid;grid-template-columns:200px 1fr;gap:20px;align-items:start;">
  <!-- Sidebar Nav -->
  <div class="bb-card" style="padding:8px;position:sticky;top:84px;">
    <div class="bb-section-label" style="padding:8px 12px 4px;">Kategori</div>
    <div class="bb-settings-nav active" id="snav-ai" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;font-size:14px;font-weight:500;color:#666;cursor:pointer;transition:all 0.15s;">
      <span class="material-symbols-outlined" style="font-size:18px;">smart_toy</span>AI Auto-Reply
    </div>
    <div class="bb-settings-nav" id="snav-eskalasi" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;font-size:14px;font-weight:500;color:#666;cursor:pointer;transition:all 0.15s;">
      <span class="material-symbols-outlined" style="font-size:18px;">warning</span>Aturan Eskalasi
    </div>
    <div class="bb-settings-nav" id="snav-wa" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;font-size:14px;font-weight:500;color:#666;cursor:pointer;transition:all 0.15s;">
      <span class="material-symbols-outlined" style="font-size:18px;">smartphone</span>Akun WhatsApp
    </div>
  </div>

  <!-- Content Panel -->
  <div class="settings-panel" id="settings-content">
    ${renderAI()}
  </div>
</div>

<!-- Modal Aturan Eskalasi -->
<div id="rule-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.5);display:none;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(4px);">
  <div style="background:#fff;border-radius:20px;width:100%;max-width:500px;padding:40px;border:1px solid #e5e2dd;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;">
      <h2 style="font-family:'Instrument Serif',serif;font-size:24px;font-weight:400;color:#111;">Tambah Aturan <em style="font-style:italic;color:#3a7a55;">Eskalasi</em></h2>
      <span class="material-symbols-outlined" id="close-modal" style="cursor:pointer;color:#aaa;font-size:22px;">close</span>
    </div>
    <form id="rule-form" style="display:flex;flex-direction:column;gap:16px;">
      <div>
        <label style="font-size:13px;font-weight:600;color:#333;display:block;margin-bottom:6px;">Nama Aturan</label>
        <input type="text" placeholder="Contoh: Handle Komplain" required style="width:100%;padding:12px 16px;border:1.5px solid #e0ddd8;border-radius:8px;font-size:14px;outline:none;background:#f7f5f2;font-family:'Inter',sans-serif;box-sizing:border-box;" />
      </div>
      <div>
        <label style="font-size:13px;font-weight:600;color:#333;display:block;margin-bottom:6px;">Tipe Trigger</label>
        <select style="width:100%;padding:12px 16px;border:1.5px solid #e0ddd8;border-radius:8px;font-size:14px;outline:none;background:#f7f5f2;font-family:'Inter',sans-serif;appearance:auto;">
          <option value="COMPLAINT">KOMPLAIN</option>
          <option value="KEYWORD">KATA KUNCI</option>
          <option value="HIGH_VALUE">NILAI TINGGI</option>
        </select>
      </div>
      <div>
        <label style="font-size:13px;font-weight:600;color:#333;display:block;margin-bottom:6px;">Kata Kunci (pisahkan dengan koma)</label>
        <input type="text" placeholder="marah, kecewa, rugi..." style="width:100%;padding:12px 16px;border:1.5px solid #e0ddd8;border-radius:8px;font-size:14px;outline:none;background:#f7f5f2;font-family:'Inter',sans-serif;box-sizing:border-box;" />
      </div>
      <div>
        <label style="font-size:13px;font-weight:600;color:#333;display:block;margin-bottom:6px;">Nilai Pesanan Minimal (Rp)</label>
        <input type="number" placeholder="0" style="width:100%;padding:12px 16px;border:1.5px solid #e0ddd8;border-radius:8px;font-size:14px;outline:none;background:#f7f5f2;font-family:'Inter',sans-serif;box-sizing:border-box;" />
      </div>
      <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:8px;">
        <button type="button" id="cancel-modal" class="bb-btn bb-btn-outline">Batal</button>
        <button type="submit" class="bb-btn bb-btn-dark">Simpan Aturan</button>
      </div>
    </form>
  </div>
</div>
`;

  window._pageInit = function () {
    const content = document.getElementById('settings-content');
    const modal = document.getElementById('rule-modal');
    const navs = document.querySelectorAll('.bb-settings-nav');

    function setActiveNav(el) {
      navs.forEach(n => {
        n.style.background = 'none';
        n.style.color = '#666';
        n.style.fontWeight = '500';
      });
      el.style.background = '#111';
      el.style.color = '#fff';
      el.style.fontWeight = '600';
    }

    // Set initial active
    const initialNav = document.getElementById('snav-ai');
    if (initialNav) setActiveNav(initialNav);

    const initAIEvents = () => {
      ['formal', 'friendly', 'casual'].forEach(v => {
        const el = document.getElementById('voice-' + v);
        if (el) el.addEventListener('click', () => {
          document.querySelectorAll('.bb-voice-option').forEach(o => o.classList.remove('selected'));
          el.classList.add('selected');
        });
      });
      document.querySelectorAll('.bb-day-chip').forEach(chip => {
        chip.addEventListener('click', () => chip.classList.toggle('active'));
      });
    };

    const initEskalasiEvents = () => {
      const addBtn = document.getElementById('add-rule-btn');
      if (addBtn) addBtn.addEventListener('click', () => { modal.style.display = 'flex'; });
    };

    initAIEvents();

    ['ai', 'eskalasi', 'wa'].forEach(id => {
      const el = document.getElementById('snav-' + id);
      if (!el) return;
      el.addEventListener('click', () => {
        setActiveNav(el);
        if (id === 'ai') { content.innerHTML = renderAI(); initAIEvents(); }
        else if (id === 'eskalasi') { content.innerHTML = renderEskalasi(); initEskalasiEvents(); }
        else if (id === 'wa') { content.innerHTML = renderWA(); }
      });
    });

    document.getElementById('close-modal').onclick = () => modal.style.display = 'none';
    document.getElementById('cancel-modal').onclick = () => modal.style.display = 'none';
    document.getElementById('rule-form').onsubmit = (e) => {
      e.preventDefault();
      alert('Aturan berhasil disimpan!');
      modal.style.display = 'none';
    };
  };

  return appLayout('settings', 'Pengaturan', main);
};
