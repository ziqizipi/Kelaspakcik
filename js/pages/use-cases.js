// ============================================================
// USE CASES PAGE (Editorial Redesign)
// ============================================================
window.Pages = window.Pages || {};

Pages.useCases = function() {
  const industries = [
    { icon: 'storefront', color: '#dcf5e7', title: 'Warung/Minimarket', desc: 'Kelola stok barang dan terima pesanan pelanggan secara otomatis melalui WhatsApp tanpa repot mencatat manual.' },
    { icon: 'checkroom', color: '#fdecc8', title: 'Fashion & Apparel', desc: 'Berikan rekomendasi ukuran dan gaya yang personal kepada pelanggan secara real-time untuk meningkatkan konversi.' },
    { icon: 'restaurant', color: '#e0e7ff', title: 'Food & Beverage', desc: 'Automasi reservasi meja dan pemesanan menu digital. Tingkatkan kepuasan pelanggan dengan respon instan saat jam sibuk.' },
    { icon: 'handyman', color: '#ffdad6', title: 'Jasa Layanan', desc: 'Penjadwalan teknisi atau janji temu menjadi lebih mudah. Kirim pengingat otomatis untuk mengurangi tingkat no-show.' },
    { icon: 'local_hospital', color: '#d7effe', title: 'Healthcare', desc: 'Kelola pendaftaran pasien dan antrian secara efisien. Memberikan informasi layanan kesehatan dasar melalui asisten AI.' },
    { icon: 'shopping_cart', color: '#f3e8ff', title: 'E-Commerce', desc: 'Integrasi mulus dengan toko online Anda untuk update pengiriman dan penanganan komplain pelanggan secara otomatis 24/7.' },
  ];

  window._pageInit = function() {
    const options = { threshold: 0.1, rootMargin: '0px 0px -60px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          entry.target.querySelectorAll('.uc-card').forEach((card, i) => {
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
              card.style.transition = 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
            }, i * 80);
          });
        }
      });
    }, options);
    document.querySelectorAll('.uc-reveal').forEach(el => observer.observe(el));
  };

  return `
<style>
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');
.uc-root { background: #f7f5f2; color: #111; font-family: 'Inter', sans-serif; overflow-x: hidden; }
.uc-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 56px; height: 68px;
  background: rgba(247,245,242,0.9); backdrop-filter: blur(10px);
  border-bottom: 1px solid #e5e2dd; position: sticky; top: 0; z-index: 100;
}
.uc-nav-logo { font-size: 17px; font-weight: 700; color: #111; cursor: pointer; flex: 1; }
.uc-nav-logo span { color: #25D366; }
.uc-nav-links { display: flex; align-items: center; gap: 36px; flex: 2; justify-content: center; }
.uc-nav-link { font-size: 14px; color: #555; font-weight: 500; cursor: pointer; transition: color 0.2s; }
.uc-nav-link:hover, .uc-nav-link.active { color: #111; }
.uc-nav-actions { display: flex; align-items: center; gap: 12px; flex: 1; justify-content: flex-end; }
.uc-btn-ghost { font-size: 14px; font-weight: 600; color: #111; cursor: pointer; padding: 8px 18px; border-radius: 8px; transition: background 0.15s; }
.uc-btn-ghost:hover { background: #ede9e3; }
.uc-btn-dark { font-size: 14px; font-weight: 600; color: #fff; background: #111; cursor: pointer; padding: 9px 22px; border-radius: 8px; transition: opacity 0.15s; }
.uc-btn-dark:hover { opacity: 0.85; }

.uc-hero { max-width: 760px; margin: 0 auto; padding: 96px 48px 64px; text-align: center; }
.uc-hero-tag {
  display: inline-flex; align-items: center; gap: 6px;
  background: #fff; border: 1px solid #e0ddd8; border-radius: 999px;
  padding: 5px 14px; font-size: 12px; font-weight: 600; color: #555;
  margin-bottom: 32px; letter-spacing: 0.04em;
  animation: fadeInUp 0.8s ease-out both;
}
.uc-hero-tag-dot { width: 6px; height: 6px; background: #25D366; border-radius: 50%; }
.uc-hero h1 {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(40px, 6vw, 64px); font-weight: 400; line-height: 1.1;
  letter-spacing: -0.02em; color: #111; margin-bottom: 24px;
  animation: fadeInUp 0.8s 0.1s ease-out both;
}
.uc-hero h1 em { font-style: italic; color: #3a7a55; }
.uc-hero p {
  font-size: 17px; color: #666; line-height: 1.7; max-width: 520px; margin: 0 auto;
  animation: fadeInUp 0.8s 0.2s ease-out both;
}

.uc-grid-wrap { padding: 0 56px 96px; max-width: 1160px; margin: 0 auto; }
.uc-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
.uc-card {
  background: #fff; border: 1px solid #e5e2dd; border-radius: 14px;
  padding: 36px 32px; transition: all 0.25s; cursor: pointer;
  opacity: 0; transform: translateY(30px);
}
.uc-card:hover { border-color: #bbb; box-shadow: 0 8px 40px rgba(0,0,0,0.08); transform: translateY(-4px) !important; }
.uc-card-icon {
  width: 56px; height: 56px; border-radius: 14px;
  background: #f0ede8; display: flex; align-items: center; justify-content: center;
  margin-bottom: 24px; position: relative; overflow: hidden;
}
.uc-card-icon .material-symbols-outlined { font-size: 26px; color: #111; z-index: 2; }
.uc-card-icon-bg {
  position: absolute; width: 36px; height: 36px; border-radius: 50%;
  bottom: -8px; right: -8px; opacity: 0.9;
}
.uc-card h3 { font-size: 17px; font-weight: 700; color: #111; margin-bottom: 12px; }
.uc-card p { font-size: 14px; color: #777; line-height: 1.65; margin-bottom: 20px; }
.uc-card-link { font-size: 13px; font-weight: 600; color: #3a7a55; display: flex; align-items: center; gap: 4px; }
.uc-card-link .material-symbols-outlined { font-size: 16px; transition: transform 0.2s; }
.uc-card:hover .uc-card-link .material-symbols-outlined { transform: translateX(4px); }

.uc-cta-strip { background: #111; padding: 96px 56px; text-align: center; }
.uc-cta-strip h2 {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(28px, 4vw, 52px); color: #fff; font-weight: 400;
  letter-spacing: -0.02em; margin-bottom: 16px;
}
.uc-cta-strip h2 em { font-style: italic; color: #6ee7a0; }
.uc-cta-strip p { font-size: 16px; color: rgba(255,255,255,0.6); margin-bottom: 40px; }
.uc-cta-actions { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
.uc-btn-white {
  display: inline-flex; align-items: center; gap: 8px;
  background: #fff; color: #111; font-size: 15px; font-weight: 700;
  padding: 14px 32px; border-radius: 10px; cursor: pointer; transition: all 0.2s;
}
.uc-btn-white:hover { background: #f0ede8; transform: translateY(-1px); }
.uc-btn-outline-white {
  display: inline-flex; align-items: center; gap: 8px;
  background: transparent; color: #fff; font-size: 15px; font-weight: 600;
  padding: 14px 32px; border-radius: 10px; cursor: pointer; transition: all 0.2s;
  border: 1.5px solid rgba(255,255,255,0.35);
}
.uc-btn-outline-white:hover { border-color: #fff; background: rgba(255,255,255,0.05); }

.uc-footer { background: #fff; border-top: 1px solid #e5e2dd; padding: 48px 56px; text-align: center; }
.uc-footer-brand { font-size: 17px; font-weight: 800; color: #111; margin-bottom: 6px; }
.uc-footer-brand span { color: #25D366; }

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.uc-reveal { opacity: 0; transform: translateY(30px); transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); }
.uc-reveal.active { opacity: 1; transform: translateY(0); }
</style>

<div class="uc-root">
<nav class="uc-nav">
  <div class="uc-nav-logo" data-href="/">BalasBro<span>.ai</span></div>
  <div class="uc-nav-links">
    <span class="uc-nav-link" data-href="/">Fitur</span>
    <span class="uc-nav-link active" data-href="/use-cases">Solusi Bisnis</span>
  </div>
  <div class="uc-nav-actions">
    <span class="uc-btn-ghost" data-href="/login">Masuk</span>
    <span class="uc-btn-dark" data-href="/register">Coba Sekarang</span>
  </div>
</nav>

<div class="uc-hero">
  <div class="uc-hero-tag">
    <div class="uc-hero-tag-dot"></div>
    Industri Terpercaya
  </div>
  <h1>Solusi untuk Setiap<br><em>Jenis Bisnis.</em></h1>
  <p>Otomasi komunikasi pelanggan dengan kecerdasan buatan yang disesuaikan khusus untuk kebutuhan industri unik Anda.</p>
</div>

<div class="uc-grid-wrap">
  <div class="uc-grid uc-reveal">
    ${industries.map(ind => `
    <div class="uc-card">
      <div class="uc-card-icon">
        <span class="material-symbols-outlined">${ind.icon}</span>
        <div class="uc-card-icon-bg" style="background:${ind.color};"></div>
      </div>
      <h3>${ind.title}</h3>
      <p>${ind.desc}</p>
      <div class="uc-card-link">Pelajari Lebih Lanjut <span class="material-symbols-outlined">arrow_forward</span></div>
    </div>
    `).join('')}
  </div>
</div>

<div class="uc-cta-strip">
  <h2>Siap mentransformasi<br><em>bisnis Anda?</em></h2>
  <p>Dapatkan demo mengenai bagaimana AI BalasBro dapat dioptimalkan untuk industri Anda.</p>
  <div class="uc-cta-actions">
    <span class="uc-btn-white" data-href="/register">Coba BalasBro Sekarang</span>
    <span class="uc-btn-outline-white" data-href="/login">Masuk ke Akun</span>
  </div>
</div>

<footer class="uc-footer">
  <div class="uc-footer-brand">BalasBro<span>.ai</span></div>
  <p style="font-size:13px;color:#aaa;">Intelligent Efficiency for Business. © 2026</p>
</footer>
</div>
`;
};
