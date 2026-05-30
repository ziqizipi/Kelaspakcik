// ============================================================
// ORDERS PAGE (Editorial Redesign)
// ============================================================
window.Pages = window.Pages || {};

Pages.orders = function () {
  const main = `
<div style="margin-bottom:32px;">
  <div style="font-size:11px;font-weight:700;color:#9a6800;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;display:flex;align-items:center;gap:8px;">
    <span style="width:20px;height:1px;background:#9a6800;"></span>
    Logistik & Penjualan
  </div>
  <div style="display:flex;align-items:center;justify-content:space-between;">
    <div>
      <h1 class="bb-page-title" style="margin-bottom:4px;">Manajemen <em>Pesanan</em></h1>
      <p style="font-size:14px;color:#888;font-style:italic;">Kelola siklus hidup pesanan pelanggan Anda.</p>
    </div>
    <div style="display:flex;gap:10px;">
      <button class="bb-btn bb-btn-outline bb-btn-sm">
        <span class="material-symbols-outlined" style="font-size:16px;">download</span>Ekspor CSV
      </button>
      <button class="bb-btn bb-btn-dark bb-btn-sm">
        <span class="material-symbols-outlined" style="font-size:16px;">add</span>Tambah Pesanan
      </button>
    </div>
  </div>
</div>

<div class="bb-card" style="padding:20px 24px;margin-bottom:20px;">
  <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:16px;">
    <div>
      <div class="bb-section-label">Cari Pesanan</div>
      <div style="position:relative;">
        <span class="material-symbols-outlined" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:17px;color:#aaa;">search</span>
        <input type="text" placeholder="ID pesanan, nama pelanggan..." style="width:100%;padding:10px 10px 10px 38px;border:1.5px solid #e0ddd8;border-radius:8px;font-size:14px;color:#111;background:#f7f5f2;outline:none;font-family:'Inter',sans-serif;box-sizing:border-box;" />
      </div>
    </div>
    <div>
      <div class="bb-section-label">Status Pesanan</div>
      <select style="width:100%;padding:10px 12px;border:1.5px solid #e0ddd8;border-radius:8px;font-size:14px;color:#111;background:#f7f5f2;outline:none;cursor:pointer;font-family:'Inter',sans-serif;">
        <option>Semua</option><option>Menunggu</option><option>Diproses</option><option>Dikirim</option><option>Selesai</option>
      </select>
    </div>
    <div>
      <div class="bb-section-label">Status Pembayaran</div>
      <select style="width:100%;padding:10px 12px;border:1.5px solid #e0ddd8;border-radius:8px;font-size:14px;color:#111;background:#f7f5f2;outline:none;cursor:pointer;font-family:'Inter',sans-serif;">
        <option>Semua</option><option>Lunas</option><option>Belum Bayar</option><option>Refund</option>
      </select>
    </div>
    <div>
      <div class="bb-section-label">Rentang Tanggal</div>
      <input type="date" style="width:100%;padding:10px 12px;border:1.5px solid #e0ddd8;border-radius:8px;font-size:14px;color:#111;background:#f7f5f2;outline:none;font-family:'Inter',sans-serif;box-sizing:border-box;" />
    </div>
  </div>
</div>

<div class="bb-card" style="overflow:hidden;">
  <div class="bb-card-header">
    <div class="bb-card-title">Daftar Pesanan</div>
    <span class="bb-badge bb-badge-gray">0 pesanan</span>
  </div>
  <table style="width:100%;border-collapse:collapse;">
    <thead>
      <tr style="background:#f7f5f2;border-bottom:1.5px solid #e5e2dd;">
        <th style="padding:12px 20px;text-align:left;font-size:11px;font-weight:700;color:#999;letter-spacing:0.08em;text-transform:uppercase;">ID Pesanan</th>
        <th style="padding:12px 20px;text-align:left;font-size:11px;font-weight:700;color:#999;letter-spacing:0.08em;text-transform:uppercase;">Tanggal</th>
        <th style="padding:12px 20px;text-align:left;font-size:11px;font-weight:700;color:#999;letter-spacing:0.08em;text-transform:uppercase;">Pelanggan</th>
        <th style="padding:12px 20px;text-align:left;font-size:11px;font-weight:700;color:#999;letter-spacing:0.08em;text-transform:uppercase;">Items</th>
        <th style="padding:12px 20px;text-align:left;font-size:11px;font-weight:700;color:#999;letter-spacing:0.08em;text-transform:uppercase;">Total</th>
        <th style="padding:12px 20px;text-align:left;font-size:11px;font-weight:700;color:#999;letter-spacing:0.08em;text-transform:uppercase;">Status</th>
        <th style="padding:12px 20px;text-align:left;font-size:11px;font-weight:700;color:#999;letter-spacing:0.08em;text-transform:uppercase;">Aksi</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td colspan="7">
          <div class="bb-empty">
            <div class="bb-empty-icon">
              <span class="material-symbols-outlined">shopping_bag</span>
            </div>
            <h3>Belum Ada Pesanan</h3>
            <p>Pesanan yang masuk melalui WhatsApp akan ditampilkan otomatis di sini.</p>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
  <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-top:1px solid #f0ede8;">
    <p style="font-size:13px;color:#aaa;">Menampilkan 0 pesanan</p>
    <div style="display:flex;align-items:center;gap:4px;">
      <button style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:6px;border:1.5px solid #e0ddd8;font-size:13px;cursor:pointer;color:#aaa;background:none;">
        <span class="material-symbols-outlined" style="font-size:14px;">chevron_left</span>
      </button>
      <button style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:6px;border:1.5px solid #111;background:#111;font-size:13px;cursor:pointer;color:#fff;">1</button>
      <button style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:6px;border:1.5px solid #e0ddd8;font-size:13px;cursor:pointer;color:#aaa;background:none;">
        <span class="material-symbols-outlined" style="font-size:14px;">chevron_right</span>
      </button>
    </div>
  </div>
</div>`;

  return appLayout('orders', 'Pesanan', main);
};
