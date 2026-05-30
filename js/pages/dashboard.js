// ============================================================
// SHARED APP LAYOUT — Editorial Redesign
// ============================================================
window.Pages = window.Pages || {};

function appLayout(activeNav, topbarTitle, mainContent) {
  const navItems = [
    { id: 'dashboard', icon: 'inbox', label: 'Kotak Masuk', href: '/dashboard' },
    { id: 'orders', icon: 'shopping_bag', label: 'Pesanan', href: '/orders' },
    { id: 'customers', icon: 'group', label: 'Pelanggan', href: '/customers' },
    { id: 'settings', icon: 'settings', label: 'Pengaturan', href: '/settings' },
  ];

  return `
<style>
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');

/* ── App Shell ── */
.app-shell { display: flex; min-height: 100vh; background: #f7f5f2; font-family: 'Inter', sans-serif; }

/* ── Sidebar ── */
.app-sidebar {
  width: 240px; flex-shrink: 0;
  background: #fff; border-right: 1px solid #e5e2dd;
  display: flex; flex-direction: column;
  position: sticky; top: 0; height: 100vh;
  animation: sidebarIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes sidebarIn {
  from { opacity: 0; transform: translateX(-16px); }
  to { opacity: 1; transform: translateX(0); }
}
.app-sidebar-brand {
  padding: 0 24px; height: 68px;
  display: flex; align-items: center;
  border-bottom: 1px solid #e5e2dd;
}
.app-sidebar-brand-name { font-size: 17px; font-weight: 700; color: #111; }
.app-sidebar-brand-name span { color: #25D366; }
.app-sidebar-nav { flex: 1; padding: 16px 12px; overflow-y: auto; }
.app-sidebar-section-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
  color: #bbb; text-transform: uppercase; padding: 0 12px 8px;
}
.app-nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border-radius: 8px;
  font-size: 14px; font-weight: 500; color: #666;
  cursor: pointer; transition: all 0.15s; margin-bottom: 2px;
}
.app-nav-item .material-symbols-outlined { font-size: 19px; }
.app-nav-item:hover { background: #f7f5f2; color: #111; }
.app-nav-item.active { background: #111; color: #fff; font-weight: 600; }
.app-sidebar-footer { padding: 12px; border-top: 1px solid #e5e2dd; }

/* ── Main area ── */
.app-main { flex: 1; display: flex; flex-direction: column; min-width: 0; margin-left: 0 !important; }
.app-topbar {
  height: 68px;
  background: rgba(247,245,242,0.9);
  backdrop-filter: blur(10px); border-bottom: 1px solid #e5e2dd;
  position: sticky; top: 0; z-index: 50;
  animation: topbarIn 0.5s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both;
  display: flex;
  align-items: center;
}
.app-topbar-inner {
  width: 100%;
  max-width: 1200px;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 64px;
  box-sizing: border-box;
}
@keyframes topbarIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
.app-topbar-title {
  font-size: 16px; font-weight: 700; color: #111; margin-right: auto;
}
.app-topbar-search {
  display: flex; align-items: center; gap: 8px;
  background: #f0ede8; border-radius: 8px; padding: 8px 14px;
  border: 1.5px solid transparent; transition: all 0.15s;
}
.app-topbar-search:focus-within { background: #fff; border-color: #e0ddd8; }
.app-topbar-search .material-symbols-outlined { font-size: 17px; color: #aaa; }
.app-topbar-search input { background: none; border: none; outline: none; font-size: 14px; color: #111; width: 180px; font-family: 'Inter', sans-serif; }
.app-topbar-search input::placeholder { color: #aaa; }
.app-topbar-icon-btn {
  width: 38px; height: 38px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #777; transition: all 0.15s;
}
.app-topbar-icon-btn:hover { background: #ede9e3; color: #111; }
.app-topbar-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: #111; display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.app-topbar-avatar .material-symbols-outlined { font-size: 18px; color: #fff; }

.app-content {
  flex: 1; padding: 32px 64px;
  animation: contentIn 0.6s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both;
  overflow-y: auto;
}
.app-content-inner {
  width: 100%;
  max-width: 1200px;
}
@keyframes contentIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.app-footer { border-top: 1px solid #e5e2dd; padding: 20px 32px; text-align: center; }

/* ── Common Card ── */
.bb-card {
  background: #fff; border: 1px solid #e5e2dd; border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}
.bb-card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #f0ede8;
}
.bb-card-title { font-size: 14px; font-weight: 700; color: #111; }
.bb-page-title {
  font-family: 'Instrument Serif', serif;
  font-size: 32px; font-weight: 400; color: #111;
  letter-spacing: -0.02em; margin-bottom: 24px;
}
.bb-page-title em { font-style: italic; color: #3a7a55; }
.bb-section-label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: #999; text-transform: uppercase; margin-bottom: 12px; }

/* ── Stat Cards ── */
.bb-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
.bb-stat {
  background: #fff; border: 1px solid #e5e2dd; border-radius: 14px;
  padding: 24px; transition: all 0.2s;
}
.bb-stat:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.06); transform: translateY(-2px); }
.bb-stat-val { font-family: 'Instrument Serif', serif; font-size: 36px; font-weight: 400; color: #111; line-height: 1; margin-bottom: 6px; }
.bb-stat-label { font-size: 12px; color: #888; font-weight: 500; }
.bb-stat-trend { font-size: 11px; color: #3a7a55; font-weight: 600; margin-top: 8px; }

/* ── Btn ── */
.bb-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 20px; border-radius: 8px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.15s; border: none; font-family: 'Inter', sans-serif;
}
.bb-btn-dark { background: #111; color: #fff; }
.bb-btn-dark:hover { background: #222; }
.bb-btn-outline { background: transparent; color: #111; border: 1.5px solid #e0ddd8; }
.bb-btn-outline:hover { border-color: #111; background: #f0ede8; }
.bb-btn-sm { padding: 7px 14px; font-size: 13px; }

/* ── Empty State ── */
.bb-empty { padding: 80px 32px; text-align: center; }
.bb-empty-icon {
  width: 72px; height: 72px; background: #f0ede8; border-radius: 16px;
  display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
}
.bb-empty-icon .material-symbols-outlined { font-size: 32px; color: #bbb; }
.bb-empty h3 { font-size: 16px; font-weight: 700; color: #333; margin-bottom: 8px; }
.bb-empty p { font-size: 14px; color: #999; max-width: 320px; margin: 0 auto; line-height: 1.6; }

/* ── Badge ── */
.bb-badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.bb-badge-green { background: #dcf5e7; color: #1a7a42; }
.bb-badge-orange { background: #fdecc8; color: #9a6800; }
.bb-badge-red { background: #ffdad6; color: #ba1a1a; }
.bb-badge-blue { background: #d7effe; color: #0b5ea8; }
.bb-badge-gray { background: #f0ede8; color: #666; }

/* Filter tabs */
.bb-tabs { display: flex; gap: 4px; padding: 4px; background: #f0ede8; border-radius: 10px; }
.bb-tab { padding: 7px 16px; border-radius: 7px; font-size: 13px; font-weight: 500; color: #777; cursor: pointer; transition: all 0.15s; }
.bb-tab:hover { color: #111; }
.bb-tab.active { background: #fff; color: #111; font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
</style>

<div class="app-shell">
  <aside class="app-sidebar">
    <div class="app-sidebar-brand">
      <div class="app-sidebar-brand-name">BalasBro<span>.ai</span></div>
    </div>
    <nav class="app-sidebar-nav">
      <div class="app-sidebar-section-label">Menu Utama</div>
      ${navItems.map(item => `
        <div class="app-nav-item ${activeNav === item.id ? 'active' : ''}" data-href="${item.href}">
          <span class="material-symbols-outlined">${item.icon}</span>
          ${item.label}
        </div>
      `).join('')}
    </nav>
    <div class="app-sidebar-footer">
      <div class="app-nav-item" onclick="alert('Pusat Bantuan')">
        <span class="material-symbols-outlined">help_outline</span>
        Pusat Bantuan
      </div>
      <div class="app-nav-item" data-href="/login">
        <span class="material-symbols-outlined">logout</span>
        Keluar
      </div>
    </div>
  </aside>

  <div class="app-main">
    <header class="app-topbar">
      <div class="app-topbar-inner">
        <div class="app-topbar-title">${topbarTitle}</div>
        <div class="app-topbar-search">
          <span class="material-symbols-outlined">search</span>
          <input type="text" placeholder="Cari..." />
        </div>
        <div class="app-topbar-icon-btn">
          <span class="material-symbols-outlined">notifications</span>
        </div>
        <div class="app-topbar-avatar">
          <span class="material-symbols-outlined">person</span>
        </div>
      </div>
    </header>
    <div class="app-content">
      <div class="app-content-inner">
        ${mainContent}
      </div>
    </div>
    <footer class="app-footer">
      <div class="app-content-inner">
        <p style="font-size:12px;color:#bbb;">© 2026 BalasBro.ai — Intelligent Efficiency for Business.</p>
      </div>
    </footer>
  </div>
</div>`;
}

// ============================================================
// DASHBOARD / INBOX PAGE
// ============================================================
Pages.dashboard = function () {
  const main = `
<div style="margin-bottom:32px;">
    <div style="font-size:11px;font-weight:700;color:#3a7a55;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;display:flex;align-items:center;gap:8px;">
      <span style="width:20px;height:1px;background:#3a7a55;"></span>
      Pusat Komando
    </div>
    <h1 class="bb-page-title" style="margin-bottom:4px;">Kotak <em>Masuk</em></h1>
    <p style="font-size:14px;color:#888;font-style:italic;">Pantau dan respon percakapan WhatsApp secara real-time.</p>
  </div>

<div class="bb-stats">
  <div class="bb-stat">
    <div class="bb-stat-val">248</div>
    <div class="bb-stat-label">Chat Masuk Hari Ini</div>
    <div class="bb-stat-trend">↑ 12% dari kemarin</div>
  </div>
  <div class="bb-stat">
    <div class="bb-stat-val">91%</div>
    <div class="bb-stat-label">Tingkat Auto-Reply</div>
    <div class="bb-stat-trend">↑ Sangat baik</div>
  </div>
  <div class="bb-stat">
    <div class="bb-stat-val">32</div>
    <div class="bb-stat-label">Order Baru</div>
    <div class="bb-stat-trend">↑ 8 dari kemarin</div>
  </div>
  <div class="bb-stat">
    <div class="bb-stat-val">3m</div>
    <div class="bb-stat-label">Rata-rata Respons AI</div>
    <div class="bb-stat-trend">↓ Lebih cepat</div>
  </div>
</div>

<div style="display:grid;grid-template-columns:1fr 320px;gap:20px;align-items:start;">
  <div class="bb-card">
    <div class="bb-card-header">
      <div class="bb-card-title">Percakapan Aktif</div>
      <div class="bb-tabs">
        <div class="bb-tab active">Semua</div>
        <div class="bb-tab">Belum Dibalas</div>
        <div class="bb-tab">Eskalasi</div>
        <div class="bb-tab">Selesai</div>
      </div>
    </div>
    <div class="bb-empty">
      <div class="bb-empty-icon">
        <span class="material-symbols-outlined">chat_bubble_outline</span>
      </div>
      <h3>Tidak ada percakapan</h3>
      <p>Belum ada pesan masuk di folder ini. Percakapan baru akan muncul secara otomatis di sini.</p>
    </div>
  </div>

  <div style="display:flex;flex-direction:column;gap:16px;">
    <div class="bb-card" style="padding:24px;background:#111;">
      <div class="bb-section-label" style="color:rgba(255,255,255,0.4);">Ringkasan Hari Ini</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px;">
        <div>
          <div style="font-family:'Instrument Serif',serif;font-size:36px;color:#fff;">0</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.5);">Menunggu Balasan</div>
        </div>
        <div>
          <div style="font-family:'Instrument Serif',serif;font-size:36px;color:#6ee7a0;">0%</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.5);">Resolusi AI</div>
        </div>
      </div>
    </div>

    <div class="bb-card" style="padding:24px;">
      <div class="bb-card-title" style="margin-bottom:16px;">Detail Percakapan</div>
      <div style="text-align:center;padding:24px 16px;">
        <span class="material-symbols-outlined" style="font-size:32px;color:#ddd;display:block;margin-bottom:10px;">inbox</span>
        <p style="font-size:13px;color:#aaa;">Pilih pesan untuk melihat detail atau mulai membalas.</p>
      </div>
    </div>
  </div>
</div>`;

  window._pageInit = function () {
    document.querySelectorAll('.bb-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.bb-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });
  };

  return appLayout('dashboard', 'Dashboard', main);
};
