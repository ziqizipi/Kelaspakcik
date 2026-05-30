// ============================================================
// LANDING PAGE — Editorial Minimal Design
// ============================================================
window.Pages = window.Pages || {};

Pages.landing = function() {
  // Move animation logic to global init hook called by router
  window._pageInit = function() {
    const options = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          
          // Stagger children if it's a container
          if (entry.target.classList.contains('lp-how-inner')) {
            entry.target.querySelectorAll('.lp-step').forEach((step, i) => {
              setTimeout(() => {
                step.style.opacity = '1';
                step.style.transform = 'translateY(0)';
                step.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
              }, i * 150);
            });
          }
          
          if (entry.target.id === 'lp-fitur') {
            entry.target.querySelectorAll('.lp-feat').forEach((feat, i) => {
              setTimeout(() => {
                feat.style.opacity = '1';
                feat.style.transform = 'translateY(0)';
                feat.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
              }, i * 100);
            });
          }
        }
      });
    }, options);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Parallax for Hero Window
    const heroWindow = document.querySelector('.lp-hero-window');
    if (heroWindow) {
      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (scrolled < 1000) {
          heroWindow.style.transform = `translateY(${scrolled * 0.1}px) scale(${1 - scrolled * 0.0001})`;
        }
      });
    }
  };

  return `
<style>
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');

/* ── Reset & Base ── */
.lp-root { background: #f7f5f2; color: #111; font-family: 'Inter', sans-serif; overflow-x: hidden; }

/* ── Nav ── */
.lp-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 56px; height: 68px;
  background: rgba(247,245,242,0.9); backdrop-filter: blur(10px);
  border-bottom: 1px solid #e5e2dd;
  position: sticky; top: 0; z-index: 100;
}
.lp-nav-logo { font-size: 17px; font-weight: 700; letter-spacing: -0.02em; color: #111; cursor: pointer; flex: 1; }
.lp-nav-logo span { color: #25D366; }
.lp-nav-links { display: flex; align-items: center; gap: 36px; flex: 2; justify-content: center; }
.lp-nav-link { font-size: 14px; color: #555; font-weight: 500; cursor: pointer; transition: color 0.2s; }
.lp-nav-link:hover { color: #111; }
.lp-nav-actions { display: flex; align-items: center; gap: 12px; flex: 1; justify-content: flex-end; }
.lp-btn-ghost { font-size: 14px; font-weight: 600; color: #111; cursor: pointer; padding: 8px 18px; border-radius: 8px; transition: background 0.15s; }
.lp-btn-ghost:hover { background: #ede9e3; }
.lp-btn-dark { font-size: 14px; font-weight: 600; color: #fff; background: #111; cursor: pointer; padding: 9px 22px; border-radius: 8px; transition: opacity 0.15s; }
.lp-btn-dark:hover { opacity: 0.85; }

/* ── Hero ── */
.lp-hero {
  max-width: 900px; margin: 0 auto;
  padding: 88px 48px 64px;
  text-align: center;
}
.lp-hero-tag {
  display: inline-flex; align-items: center; gap: 6px;
  background: #fff; border: 1px solid #e0ddd8; border-radius: 999px;
  padding: 5px 14px; font-size: 12px; font-weight: 600; color: #555;
  margin-bottom: 32px; letter-spacing: 0.04em;
}
.lp-hero-tag-dot { width: 6px; height: 6px; background: #25D366; border-radius: 50%; }
.lp-hero h1 {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(44px, 7vw, 80px);
  font-weight: 400; line-height: 1.05;
  letter-spacing: -0.02em; color: #111;
  margin-bottom: 24px;
}
.lp-hero h1 em { font-style: italic; color: #3a7a55; }
.lp-hero-sub {
  font-size: 17px; color: #666; line-height: 1.7;
  max-width: 520px; margin: 0 auto 40px;
}
.lp-hero-cta { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; margin-bottom: 64px; }
.lp-btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  background: #111; color: #fff; font-size: 15px; font-weight: 600;
  padding: 14px 30px; border-radius: 10px; cursor: pointer; transition: all 0.2s;
  border: none; outline: none;
}
.lp-btn-primary:hover { background: #222; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
.lp-btn-outline {
  display: inline-flex; align-items: center; gap: 8px;
  background: transparent; color: #111; font-size: 15px; font-weight: 600;
  padding: 14px 30px; border-radius: 10px; cursor: pointer; transition: all 0.2s;
  border: 1.5px solid #ccc; outline: none;
}
.lp-btn-outline:hover { border-color: #111; background: #ede9e3; }

/* ── Hero Mockup Window ── */
.lp-hero-window {
  background: #fff; border-radius: 16px;
  border: 1px solid #e0ddd8; box-shadow: 0 2px 40px rgba(0,0,0,0.07);
  overflow: hidden; max-width: 820px; margin: 0 auto;
}
.lp-window-bar {
  display: flex; align-items: center; gap: 7px;
  padding: 14px 18px; border-bottom: 1px solid #f0ede8;
  background: #fafaf8; position: relative;
}
.lp-dot-wrap { display: flex; gap: 7px; z-index: 2; }
.lp-dot { width: 10px; height: 10px; border-radius: 50%; }
.lp-dot-r { background: #ff5f57; }
.lp-dot-y { background: #febc2e; }
.lp-dot-g { background: #28c840; }
.lp-window-url {
  position: absolute; left: 50%; transform: translateX(-50%);
  background: #f0ede8; border-radius: 6px; padding: 4px 32px;
  font-size: 12px; color: #888; text-align: center;
}
.lp-hero-screen {
  height: 360px; background: linear-gradient(135deg, #f0ede8 0%, #e8e4dc 100%);
  display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px;
}
.lp-screen-dashboard {
  background: #fff; border-radius: 12px; border: 1px solid #e5e2dd;
  padding: 24px 32px; width: 480px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}
.lp-dash-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.lp-dash-title { font-size: 14px; font-weight: 700; color: #111; }
.lp-dash-badge { background: #dcf5e7; color: #1a7a42; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 999px; }
.lp-dash-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 16px; }
.lp-dash-stat { background: #f7f5f2; border-radius: 8px; padding: 12px 14px; }
.lp-dash-stat-val { font-size: 20px; font-weight: 700; color: #111; }
.lp-dash-stat-lbl { font-size: 10px; color: #888; margin-top: 2px; }
.lp-dash-msgs { display: flex; flex-direction: column; gap: 8px; }
.lp-dash-msg { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: #fafaf8; border-radius: 8px; border: 1px solid #f0ede8; }
.lp-dash-avatar { width: 28px; height: 28px; border-radius: 50%; background: #e0ddd8; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #555; }
.lp-dash-msg-text { flex: 1; font-size: 11px; color: #555; }
.lp-dash-msg-status { font-size: 10px; padding: 2px 8px; border-radius: 999px; background: #dcf5e7; color: #1a7a42; font-weight: 600; }

/* ── Section Commons ── */
.lp-section { padding: 96px 56px; max-width: 1160px; margin: 0 auto; }
.lp-section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: #888; text-transform: uppercase; margin-bottom: 16px; }
.lp-section-title {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(32px, 4vw, 52px); font-weight: 400;
  line-height: 1.1; letter-spacing: -0.02em; color: #111;
  margin-bottom: 18px;
}
.lp-section-title em { font-style: italic; color: #3a7a55; }
.lp-section-sub { font-size: 16px; color: #666; line-height: 1.7; max-width: 560px; }

/* ── Graphics & Icons ── */
.lp-graphic {
  width: 56px; height: 56px;
  background: #f0ede8; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
}
.lp-graphic .material-symbols-outlined { font-size: 24px; color: #111; z-index: 2; }
.lp-graphic-bg {
  position: absolute; width: 40px; height: 40px;
  background: #dcf5e7; border-radius: 50%;
  bottom: -10px; right: -10px; opacity: 0.8;
}

.lp-step-icon { margin-bottom: 24px; }
.lp-feat-icon { margin-bottom: 24px; }

/* ── How It Works ── */
.lp-how { background: #fff; border-top: 1px solid #e5e2dd; border-bottom: 1px solid #e5e2dd; }
.lp-how-inner { max-width: 1160px; margin: 0 auto; padding: 96px 56px; }
.lp-steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: #e5e2dd; border: 1px solid #e5e2dd; border-radius: 16px; overflow: hidden; margin-top: 56px; }
.lp-step { background: #fff; padding: 48px 40px; transition: background 0.2s; }
.lp-step:hover { background: #faf9f6; }
.lp-step-num { font-family: 'Instrument Serif', serif; font-size: 48px; color: #e0ddd8; line-height: 1; margin-bottom: 32px; }
.lp-step h3 { font-size: 18px; font-weight: 700; color: #111; margin-bottom: 12px; }
.lp-step p { font-size: 14px; color: #777; line-height: 1.65; }

/* ── Features ── */
.lp-features-wrap { background: #f7f5f2; }
.lp-features { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-top: 56px; }
.lp-feat { background: #fff; border: 1px solid #e5e2dd; border-radius: 14px; padding: 36px 32px; transition: all 0.2s; }
.lp-feat:hover { border-color: #bbb; box-shadow: 0 8px 32px rgba(0,0,0,0.06); transform: translateY(-3px); }
.lp-feat h3 { font-size: 16px; font-weight: 700; color: #111; margin-bottom: 12px; }
.lp-feat p { font-size: 14px; color: #777; line-height: 1.65; }

/* ── CTA Strip ── */
.lp-cta-strip {
  background: #111; margin: 0; padding: 96px 56px; text-align: center;
}
.lp-cta-strip h2 {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(28px, 4vw, 48px); color: #fff; font-weight: 400;
  letter-spacing: -0.02em; margin-bottom: 32px;
}
.lp-cta-strip h2 em { font-style: italic; color: #6ee7a0; }
.lp-btn-white {
  display: inline-flex; align-items: center; gap: 8px;
  background: #fff; color: #111; font-size: 15px; font-weight: 700;
  padding: 14px 32px; border-radius: 10px; cursor: pointer; transition: all 0.2s;
}
.lp-btn-white:hover { background: #f0ede8; transform: translateY(-1px); }

/* ── Footer ── */
.lp-footer { background: #fff; border-top: 1px solid #e5e2dd; padding: 64px 56px; text-align: center; }
.lp-footer-brand-name { font-size: 17px; font-weight: 800; color: #111; margin-bottom: 8px; }
.lp-footer-brand-name span { color: #25D366; }

/* ── Animations ── */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.98) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.reveal { opacity: 0; transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); transform: translateY(40px) scale(0.98); }
.reveal.active { opacity: 1; transform: translateY(0) scale(1) !important; }

.anim-hero-tag { animation: fadeInUp 0.8s ease-out both; }
.anim-hero-h1 { animation: fadeInUp 0.8s 0.1s ease-out both; }
.anim-hero-sub { animation: fadeInUp 0.8s 0.2s ease-out both; }
.anim-hero-cta { animation: fadeInUp 0.8s 0.3s ease-out both; }
.anim-hero-window { animation: fadeInScale 1s 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }

.lp-step { opacity: 0; transform: translateY(30px); }
.lp-feat { opacity: 0; transform: translateY(30px); }
</style>

<div class="lp-root">

<!-- NAV -->
<nav class="lp-nav">
  <div class="lp-nav-logo" data-href="/">BalasBro<span>.ai</span></div>
  <div class="lp-nav-links">
    <span class="lp-nav-link" onclick="document.getElementById('lp-fitur').scrollIntoView({behavior:'smooth'})">Fitur</span>
    <span class="lp-nav-link" data-href="/use-cases">Solusi Bisnis</span>
  </div>
  <div class="lp-nav-actions">
    <span class="lp-btn-ghost" data-href="/login">Masuk</span>
    <span class="lp-btn-dark" data-href="/register">Coba Sekarang</span>
  </div>
</nav>

<!-- HERO -->
<section class="lp-hero">
  <div class="lp-hero-tag anim-hero-tag">
    <div class="lp-hero-tag-dot"></div>
    Solusi #1 untuk UMKM Indonesia
  </div>
  <h1 class="anim-hero-h1">Tingkatkan Efisiensi<br><em>Operasional Anda</em><br>dengan AI WhatsApp.</h1>
  <p class="lp-hero-sub anim-hero-sub">Otomatisasi balasan chat WhatsApp 24/7. Hemat waktu admin, balas secepat kilat, dan kelola operasional lebih rapi.</p>
  <div class="lp-hero-cta anim-hero-cta">
    <span class="lp-btn-primary" data-href="/register">Coba BalasBro Sekarang</span>
    <span class="lp-btn-outline" data-href="/use-cases">Lihat Contoh Bisnis</span>
  </div>

  <!-- Browser Window Mockup -->
  <div class="lp-hero-window anim-hero-window">
    <div class="lp-window-bar">
      <div class="lp-dot-wrap">
        <div class="lp-dot lp-dot-r"></div>
        <div class="lp-dot lp-dot-y"></div>
        <div class="lp-dot lp-dot-g"></div>
      </div>
      <div class="lp-window-url">app.balasbro.ai/dashboard</div>
    </div>
    <div class="lp-hero-screen">
      <div class="lp-screen-dashboard">
        <div class="lp-dash-header">
          <span class="lp-dash-title">Dashboard BalasBro</span>
          <span class="lp-dash-badge">● AI Aktif</span>
        </div>
        <div class="lp-dash-stats">
          <div class="lp-dash-stat"><div class="lp-dash-stat-val">248</div><div class="lp-dash-stat-lbl">Chat Masuk</div></div>
          <div class="lp-dash-stat"><div class="lp-dash-stat-val">91%</div><div class="lp-dash-stat-lbl">Auto-Reply</div></div>
          <div class="lp-dash-stat"><div class="lp-dash-stat-val">32</div><div class="lp-dash-stat-lbl">Order Baru</div></div>
        </div>
        <div class="lp-dash-msgs">
          <div class="lp-dash-msg"><div class="lp-dash-avatar">A</div><div class="lp-dash-msg-text">Kak minta info stok baju size M...</div><span class="lp-dash-msg-status">Dibalas AI</span></div>
          <div class="lp-dash-msg"><div class="lp-dash-avatar">R</div><div class="lp-dash-msg-text">Berapa harga tas model terbaru?</div><span class="lp-dash-msg-status">Dibalas AI</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<div class="lp-how">
  <div class="lp-how-inner reveal">
    <div class="lp-section-label">Cara Kerja</div>
    <h2 class="lp-section-title">Kelola ratusan chat pelanggan<br><em>tanpa pusing.</em></h2>
    <p class="lp-section-sub">Tinggalkan cara manual. Biarkan AI kami bekerja untuk Anda sementara Anda fokus mengembangkan bisnis.</p>
    <div class="lp-steps">
      <div class="lp-step">
        <div class="lp-step-num">01</div>
        <div class="lp-step-icon">
          <div class="lp-graphic">
            <span class="material-symbols-outlined">qr_code_2</span>
            <div class="lp-graphic-bg"></div>
          </div>
        </div>
        <h3>Hubungkan WhatsApp</h3>
        <p>Cukup scan QR Code WhatsApp Business Anda. Integrasi aman dan resmi dalam hitungan detik.</p>
      </div>
      <div class="lp-step">
        <div class="lp-step-num">02</div>
        <div class="lp-step-icon">
          <div class="lp-graphic">
            <span class="material-symbols-outlined">edit_note</span>
            <div class="lp-graphic-bg" style="background:#fdecc8;"></div>
          </div>
        </div>
        <h3>Atur Gaya Balas</h3>
        <p>Beritahu AI cara membalas pesan, info harga, dan stok. AI akan belajar mengikuti gaya bahasa Anda.</p>
      </div>
      <div class="lp-step">
        <div class="lp-step-num">03</div>
        <div class="lp-step-icon">
          <div class="lp-graphic">
            <span class="material-symbols-outlined">rocket_launch</span>
            <div class="lp-graphic-bg" style="background:#e0e7ff;"></div>
          </div>
        </div>
        <h3>Auto-Reply Aktif!</h3>
        <p>AI otomatis membalas tanya-tanya pelanggan, info stok, hingga membantu proses orderan 24/7.</p>
      </div>
    </div>
  </div>
</div>

<!-- FEATURES -->
<div class="lp-features-wrap">
  <div class="lp-section reveal" id="lp-fitur">
    <div class="lp-section-label">Fitur Unggulan</div>
    <h2 class="lp-section-title">Semua yang Anda butuhkan<br><em>untuk efisiensi maksimal.</em></h2>
    <p class="lp-section-sub">Didesain khusus untuk pemilik toko online dan pengusaha jasa di Indonesia.</p>
    <div class="lp-features">
      <div class="lp-feat">
        <div class="lp-feat-icon">
          <div class="lp-graphic" style="border-radius:50%;">
            <span class="material-symbols-outlined">smart_toy</span>
            <div class="lp-graphic-bg"></div>
          </div>
        </div>
        <h3>Asisten AI 24/7</h3>
        <p>Pelanggan tanya jam 2 pagi? AI langsung balas. Tidak ada lagi calon pembeli yang kabur karena kelamaan nunggu.</p>
      </div>
      <div class="lp-feat">
        <div class="lp-feat-icon">
          <div class="lp-graphic" style="border-radius:50%;">
            <span class="material-symbols-outlined">shopping_bag</span>
            <div class="lp-graphic-bg" style="background:#fdecc8;"></div>
          </div>
        </div>
        <h3>Catat Order Otomatis</h3>
        <p>AI cerdas kami mengenali format orderan dan mencatatnya langsung ke sistem. Admin tinggal cek saja.</p>
      </div>
      <div class="lp-feat">
        <div class="lp-feat-icon">
          <div class="lp-graphic" style="border-radius:50%;">
            <span class="material-symbols-outlined">campaign</span>
            <div class="lp-graphic-bg" style="background:#e0e7ff;"></div>
          </div>
        </div>
        <h3>Broadcast Tanpa Blokir</h3>
        <p>Kirim promo ke ribuan pelanggan sekaligus with aman melalui API WhatsApp resmi.</p>
      </div>
      <div class="lp-feat">
        <div class="lp-feat-icon">
          <div class="lp-graphic" style="border-radius:50%;">
            <span class="material-symbols-outlined">bar_chart</span>
            <div class="lp-graphic-bg" style="background:#ffdad6;"></div>
          </div>
        </div>
        <h3>Laporan Efisiensi</h3>
        <p>Pantau berapa banyak chat yang masuk dan berapa penghematan waktu admin setiap harinya.</p>
      </div>
      <div class="lp-feat">
        <div class="lp-feat-icon">
          <div class="lp-graphic" style="border-radius:50%;">
            <span class="material-symbols-outlined">group</span>
            <div class="lp-graphic-bg" style="background:#d7effe;"></div>
          </div>
        </div>
        <h3>Multi-Admin Chat</h3>
        <p>Satu nomor WhatsApp bisa diakses oleh banyak admin sekaligus dari laptop atau HP masing-masing.</p>
      </div>
      <div class="lp-feat">
        <div class="lp-feat-icon">
          <div class="lp-graphic" style="border-radius:50%;">
            <span class="material-symbols-outlined">label</span>
            <div class="lp-graphic-bg" style="background:#f3e8ff;"></div>
          </div>
        </div>
        <h3>Label Pelanggan</h3>
        <p>Kategorikan pelanggan Anda secara otomatis: Langganan, Tanya-tanya, atau Order Baru.</p>
      </div>
    </div>
  </div>
</div>

<!-- CTA STRIP -->
<div class="lp-cta-strip reveal">
  <h2>Tingkatkan efisiensi<br><em>operasional bisnis Anda.</em></h2>
  <span class="lp-btn-white" data-href="/register">Coba Sekarang →</span>
</div>

<!-- FOOTER -->
<footer class="lp-footer" style="text-align: center; padding: 64px 56px;">
  <div class="lp-footer-brand-name" style="margin-bottom: 8px;">BalasBro<span>.ai</span></div>
  <p style="font-size: 14px; color: #888; margin: 0;">Intelligent Efficiency for Business. © 2026</p>
</footer>

</div>
`;
};
