// ============================================================
// CUSTOMERS PAGE (Editorial Redesign with List/Detail View)
// ============================================================
window.Pages = window.Pages || {};

Pages.customers = function () {

  const renderList = () => `
    <div style="margin-bottom:32px;">
      <div style="font-size:11px;font-weight:700;color:#0b5ea8;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;display:flex;align-items:center;gap:8px;">
        <span style="width:20px;height:1px;background:#0b5ea8;"></span>
        Basis Data Pelanggan
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div>
          <h1 class="bb-page-title" style="margin-bottom:4px;">Daftar <em>Pelanggan</em></h1>
          <p style="font-size:14px;color:#888;font-style:italic;">Kelola dan pantau basis data pelanggan Anda di satu tempat.</p>
        </div>
        <button class="bb-btn bb-btn-dark bb-btn-sm" id="btn-add-customer">
          <span class="material-symbols-outlined" style="font-size:16px;">person_add</span>Tambah Pelanggan
        </button>
      </div>
    </div>

    <div class="bb-card" style="padding:16px 24px;margin-bottom:24px;display:flex;align-items:center;gap:16px;">
      <span class="material-symbols-outlined" style="color:#aaa;font-size:20px;">search</span>
      <input type="text" placeholder="Cari berdasarkan nama atau nomor telepon..." style="flex:1;border:none;outline:none;font-size:14px;font-family:'Inter',sans-serif;color:#111;background:transparent;" />
      <div style="width:1px;height:24px;background:#e5e2dd;"></div>
      <button style="background:none;border:none;color:#666;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;">
        <span class="material-symbols-outlined" style="font-size:18px;">filter_list</span>Filter
      </button>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:20px;">
      ${[
      { name: 'Budi Santoso', phone: '+62 812-3456-7890', color: '#f0ede8' },
      { name: 'Siti Aminah', phone: '+62 856-9876-5432', color: '#fdecc8' },
      { name: 'Andi Wijaya', phone: '+62 811-2233-4455', color: '#dcf5e7' },
      { name: 'Lestari Putri', phone: '+62 813-1122-3344', color: '#d7effe' },
      { name: 'Rizky Pratama', phone: '+62 819-0099-8877', color: '#f3e8ff' },
      { name: 'Dewi Sartika', phone: '+62 857-7766-5544', color: '#ffe4e1' }
    ].map((c, i) => `
        <div class="bb-card customer-item" data-id="${i}" style="padding:24px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:16px;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.06)'" onmouseout="this.style.transform='none';this.style.boxShadow='0 2px 12px rgba(0,0,0,0.04)'">
          <div style="width:52px;height:52px;border-radius:50%;background:${c.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <span class="material-symbols-outlined" style="font-size:24px;color:rgba(0,0,0,0.25);">person</span>
          </div>
          <div style="flex:1;">
            <div class="customer-name" style="font-size:15px;font-weight:700;color:#111;margin-bottom:2px;">${c.name}</div>
            <div class="customer-phone" style="font-size:13px;color:#888;">${c.phone}</div>
          </div>
          <span class="material-symbols-outlined" style="color:#ddd;font-size:18px;">chevron_right</span>
        </div>
      `).join('')}
    </div>
  `;

  const renderDetail = (name = 'Budi Santoso', phone = '+62 812-3456-7890') => `
    <div style="margin-bottom:32px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;cursor:pointer;color:#888;transition:color 0.15s;" id="back-to-list" onmouseover="this.style.color='#111'" onmouseout="this.style.color='#888'">
        <span class="material-symbols-outlined" style="font-size:18px;">arrow_back</span>
        <span style="font-size:13px;font-weight:600;">Kembali ke Daftar</span>
      </div>
      <div style="font-size:11px;font-weight:700;color:#0b5ea8;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;display:flex;align-items:center;gap:8px;">
        <span style="width:20px;height:1px;background:#0b5ea8;"></span>
        Profil Pelanggan
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div>
          <h1 class="bb-page-title" style="margin-bottom:4px;">Profil <em>${name.split(' ')[0]}</em></h1>
          <p style="font-size:14px;color:#888;font-style:italic;">Data lengkap dan riwayat interaksi setiap pelanggan.</p>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="bb-btn bb-btn-outline bb-btn-sm">
            <span class="material-symbols-outlined" style="font-size:16px;">send</span>Kirim Pesan
          </button>
          <button class="bb-btn bb-btn-dark bb-btn-sm">
            <span class="material-symbols-outlined" style="font-size:16px;">add_shopping_cart</span>Buat Pesanan
          </button>
        </div>
      </div>
    </div>

    <!-- Profile Header Card -->
    <div class="bb-card" style="padding:32px;margin-bottom:20px;">
      <div style="display:flex;align-items:flex-start;gap:24px;">
        <div style="position:relative;flex-shrink:0;">
          <div style="width:80px;height:80px;border-radius:50%;background:#f0ede8;display:flex;align-items:center;justify-content:center;">
            <span class="material-symbols-outlined" style="font-size:36px;color:#ccc;">person</span>
          </div>
          <div style="position:absolute;bottom:0;right:0;width:26px;height:26px;background:#111;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;">
            <span class="material-symbols-outlined" style="font-size:13px;color:#fff;">edit</span>
          </div>
        </div>
        <div style="flex:1;">
          <div style="font-family:'Instrument Serif',serif;font-size:24px;color:#111;margin-bottom:8px;">
            ${name}
            <span class="bb-badge bb-badge-green" style="font-size:10px;margin-left:8px;">Pelanggan Setia</span>
          </div>
          <div style="display:flex;align-items:center;gap:20px;margin-bottom:8px;">
            <span style="display:flex;align-items:center;gap:5px;font-size:13px;color:#666;">
              <span class="material-symbols-outlined" style="font-size:14px;color:#3a7a55;">call</span>${phone}
            </span>
            <span style="display:flex;align-items:center;gap:5px;font-size:13px;color:#666;">
              <span class="material-symbols-outlined" style="font-size:14px;color:#3a7a55;">calendar_today</span>Terdaftar sejak Mei 2026
            </span>
          </div>
          <div style="font-size:13px;color:#888;">Lokasi: Jakarta, Indonesia</div>
        </div>
      </div>
    </div>

    <!-- Stat Cards -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;">
      <div class="bb-card" style="padding:24px;display:flex;align-items:center;gap:16px;">
        <div style="width:44px;height:44px;background:#f0ede8;border-radius:10px;display:flex;align-items:center;justify-content:center;">
          <span class="material-symbols-outlined" style="font-size:20px;color:#666;">chat</span>
        </div>
        <div>
          <div class="bb-stat-val" style="font-size:28px;">12</div>
          <div class="bb-stat-label">Total Percakapan</div>
        </div>
      </div>
      <div class="bb-card" style="padding:24px;display:flex;align-items:center;gap:16px;">
        <div style="width:44px;height:44px;background:#fdecc8;border-radius:10px;display:flex;align-items:center;justify-content:center;">
          <span class="material-symbols-outlined" style="font-size:20px;color:#9a6800;">receipt_long</span>
        </div>
        <div>
          <div class="bb-stat-val" style="font-size:28px;">4</div>
          <div class="bb-stat-label">Total Pesanan</div>
        </div>
      </div>
      <div class="bb-card" style="padding:24px;display:flex;align-items:center;gap:16px;">
        <div style="width:44px;height:44px;background:#dcf5e7;border-radius:10px;display:flex;align-items:center;justify-content:center;">
          <span class="material-symbols-outlined" style="font-size:20px;color:#3a7a55;">trending_up</span>
        </div>
        <div>
          <div class="bb-stat-val" style="font-size:28px;">Rp 250k</div>
          <div class="bb-stat-label">Rata-rata Nilai Pesanan</div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bb-tabs" style="margin-bottom:24px;display:inline-flex;">
      <div class="bb-tab active" id="tab-percakapan">Percakapan</div>
      <div class="bb-tab" id="tab-pesanan">Pesanan</div>
      <div class="bb-tab" id="tab-catatan">Catatan</div>
    </div>

    <!-- Body -->
    <div style="display:grid;grid-template-columns:1fr 300px;gap:20px;align-items:start;">
      <div class="bb-card">
        <div class="bb-card-header">
          <div class="bb-card-title">Riwayat Aktivitas</div>
        </div>
        <div style="padding:24px;">
          <div style="display:flex;gap:16px;margin-bottom:20px;">
            <div style="width:32px;height:32px;background:#f0ede8;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <span class="material-symbols-outlined" style="font-size:16px;color:#aaa;">smart_toy</span>
            </div>
            <div style="flex:1;">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                <span style="font-size:13px;font-weight:700;color:#111;">AI Assistant</span>
                <span style="font-size:11px;color:#aaa;">10:24 AM</span>
              </div>
              <div style="background:#f7f5f2;padding:12px 16px;border-radius:0 12px 12px 12px;font-size:14px;color:#444;line-height:1.5;">
                Halo Kak Budi! Terima kasih sudah menghubungi kami. Ada yang bisa kami bantu hari ini?
              </div>
            </div>
          </div>
          <div style="display:flex;gap:16px;">
            <div style="width:32px;height:32px;background:#dcf5e7;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <span class="material-symbols-outlined" style="font-size:16px;color:#3a7a55;">person</span>
            </div>
            <div style="flex:1;">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                <span style="font-size:13px;font-weight:700;color:#111;">Budi Santoso</span>
                <span style="font-size:11px;color:#aaa;">10:25 AM</span>
              </div>
              <div style="background:#fff;border:1px solid #e5e2dd;padding:12px 16px;border-radius:0 12px 12px 12px;font-size:14px;color:#444;line-height:1.5;">
                Halo, saya mau tanya stok Produk A apakah masih ada ya?
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:16px;">
        <!-- Admin Notes -->
        <div class="bb-card" style="padding:20px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;color:#999;text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;gap:6px;">
            <span class="material-symbols-outlined" style="font-size:14px;">description</span>Catatan Admin
          </div>
          <div style="background:#f7f5f2;border-radius:8px;padding:16px;font-size:13px;color:#666;line-height:1.5;">
            "Pelanggan ini sering tanya stok tapi belum jadi beli. Perlu follow up promo khusus."
          </div>
          <button style="width:100%;margin-top:12px;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;border:1.5px dashed #e0ddd8;border-radius:8px;font-size:13px;font-weight:600;color:#aaa;cursor:pointer;transition:all 0.15s;background:none;font-family:'Inter',sans-serif;" 
            onmouseover="this.style.borderColor='#111';this.style.color='#111'" 
            onmouseout="this.style.borderColor='#e0ddd8';this.style.color='#aaa'">
            <span class="material-symbols-outlined" style="font-size:15px;">add</span>Tambah Catatan
          </button>
        </div>

        <!-- AI Insights -->
        <div style="background:#111;border-radius:14px;padding:24px;">
          <div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:10px;display:flex;align-items:center;gap:8px;">
            <span class="material-symbols-outlined" style="font-size:16px;color:#6ee7a0;">smart_toy</span>Wawasan AI
          </div>
          <p style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6;margin-bottom:16px;">
            Budi cenderung bertanya di pagi hari antara jam 09:00 - 11:00. Minat utama pada kategori Produk A.
          </p>
          <div style="display:flex;justify-content:space-between;font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:16px;">
            <span>Tingkat Keterlibatan</span><span style="color:#6ee7a0;">Tinggi</span>
          </div>
          <div style="background:#222;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;text-align:center;font-size:13px;font-weight:600;color:#fff;cursor:pointer;" onmouseover="this.style.background='#333'" onmouseout="this.style.background='#222'">
            Jadwalkan Hubungi
          </div>
        </div>
      </div>
    </div>
  `;

  // Initial container
  const main = `<div id="customer-view-container">${renderList()}</div>`;

  window._pageInit = function () {
    const container = document.getElementById('customer-view-container');

    const initListEvents = () => {
      document.querySelectorAll('.customer-item').forEach(item => {
        item.addEventListener('click', () => {
          const name = item.querySelector('.customer-name').textContent;
          const phone = item.querySelector('.customer-phone').textContent;
          container.innerHTML = renderDetail(name, phone);
          initDetailEvents();
        });
      });
    };

    const initDetailEvents = () => {
      const backBtn = document.getElementById('back-to-list');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          container.innerHTML = renderList();
          initListEvents();
        });
      }

      document.querySelectorAll('.bb-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.bb-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
        });
      });
    };

    initListEvents();
  };

  return appLayout('customers', 'Pelanggan', main);
};
