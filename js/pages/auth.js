// ============================================================
// AUTH PAGES — Login & Register (Editorial Redesign)
// ============================================================
window.Pages = window.Pages || {};

function authShell(title, subtitle, formContent, footerContent, navHref, navLabel) {
  return `
<style>
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');
.auth-root { min-height: 100vh; background: #f7f5f2; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; }
.auth-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 56px; height: 68px;
  background: rgba(247,245,242,0.9); backdrop-filter: blur(10px);
  border-bottom: 1px solid #e5e2dd; position: sticky; top: 0; z-index: 100;
}
.auth-nav-logo { font-size: 17px; font-weight: 700; letter-spacing: -0.02em; color: #111; cursor: pointer; }
.auth-nav-logo span { color: #25D366; }
.auth-nav-link { font-size: 14px; font-weight: 600; color: #111; cursor: pointer; padding: 8px 20px; border-radius: 8px; border: 1.5px solid #ccc; transition: all 0.15s; }
.auth-nav-link:hover { border-color: #111; background: #ede9e3; }
.auth-main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 64px 24px; }
.auth-card {
  background: #fff; width: 100%; max-width: 460px;
  border-radius: 20px; border: 1px solid #e5e2dd;
  box-shadow: 0 4px 40px rgba(0,0,0,0.07);
  padding: 48px 44px;
  animation: authCardIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes authCardIn {
  from { opacity: 0; transform: translateY(24px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.auth-card-label { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: #888; text-transform: uppercase; margin-bottom: 16px; }
.auth-card h2 {
  font-family: 'Instrument Serif', serif;
  font-size: 32px; font-weight: 400; color: #111;
  line-height: 1.15; letter-spacing: -0.02em; margin-bottom: 10px;
}
.auth-card h2 em { font-style: italic; color: #3a7a55; }
.auth-card .auth-sub { font-size: 15px; color: #777; line-height: 1.6; margin-bottom: 36px; }
.auth-form { display: flex; flex-direction: column; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 600; color: #333; }
.form-label-row { display: flex; justify-content: space-between; align-items: center; }
.form-link { font-size: 12px; color: #3a7a55; font-weight: 600; cursor: pointer; }
.form-link:hover { text-decoration: underline; }
.input-wrap { position: relative; }
.input-wrap .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #aaa; font-size: 18px; pointer-events: none; }
.input-wrap input {
  width: 100%; padding: 13px 16px 13px 44px;
  background: #f7f5f2; border: 1.5px solid #e0ddd8;
  border-radius: 10px; font-size: 15px; color: #111;
  transition: all 0.15s; outline: none; font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}
.input-wrap input:focus { border-color: #3a7a55; box-shadow: 0 0 0 3px rgba(58,122,85,0.1); background: #fff; }
.input-wrap input::placeholder { color: #aaa; }
.toggle-pw { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #aaa; display: flex; }
.toggle-pw:hover { color: #111; }
.remember-row { display: flex; align-items: center; gap: 8px; }
.remember-row input[type=checkbox] { width: 16px; height: 16px; accent-color: #3a7a55; cursor: pointer; }
.remember-row label { font-size: 14px; color: #666; cursor: pointer; }
.auth-submit {
  width: 100%; padding: 14px; background: #111; color: #fff;
  border: none; border-radius: 10px; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif;
}
.auth-submit:hover { background: #222; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
.auth-divider { display: flex; align-items: center; gap: 12px; }
.auth-divider span { font-size: 12px; color: #aaa; white-space: nowrap; }
.auth-divider::before, .auth-divider::after { content:''; flex: 1; height: 1px; background: #e5e2dd; }
.auth-google {
  width: 100%; padding: 13px; background: #fff; color: #333;
  border: 1.5px solid #e0ddd8; border-radius: 10px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: all 0.15s; font-family: 'Inter', sans-serif;
}
.auth-google:hover { border-color: #aaa; background: #f7f5f2; }
.auth-footer-note { font-size: 14px; color: #888; text-align: center; margin-top: 24px; }
.auth-footer-note a { color: #3a7a55; font-weight: 700; cursor: pointer; }
.auth-footer-note a:hover { text-decoration: underline; }
.auth-tos { font-size: 12px; color: #aaa; text-align: center; line-height: 1.6; }
.auth-tos a { color: #3a7a55; font-weight: 600; cursor: pointer; }
.auth-footer { text-align: center; padding: 40px; border-top: 1px solid #e5e2dd; }
.auth-footer-brand { font-size: 15px; font-weight: 800; color: #111; margin-bottom: 6px; }
.auth-footer-brand span { color: #25D366; }
</style>

<div class="auth-root">
  <nav class="auth-nav">
    <div class="auth-nav-logo" data-href="/">BalasBro<span>.ai</span></div>
    <span class="auth-nav-link" data-href="${navHref}">${navLabel}</span>
  </nav>
  <main class="auth-main">
    <div class="auth-card">
      <div class="auth-card-label">BalasBro.ai</div>
      <h2>${title}</h2>
      <p class="auth-sub">${subtitle}</p>
      ${formContent}
      <div class="auth-footer-note">${footerContent}</div>
    </div>
  </main>
  <footer class="auth-footer">
    <div class="auth-footer-brand">BalasBro<span>.ai</span></div>
    <p style="font-size:13px;color:#aaa;">Intelligent Efficiency for Business. © 2026</p>
  </footer>
</div>`;
}

Pages.login = function() {
  const form = `
<form class="auth-form" id="login-form">
  <div class="form-group">
    <label class="form-label" for="email">Email</label>
    <div class="input-wrap">
      <span class="material-symbols-outlined input-icon">mail</span>
      <input type="email" id="email" placeholder="nama@bisnis.com" />
    </div>
  </div>
  <div class="form-group">
    <div class="form-label-row">
      <label class="form-label" for="password">Kata Sandi</label>
      <span class="form-link">Lupa Kata Sandi?</span>
    </div>
    <div class="input-wrap">
      <span class="material-symbols-outlined input-icon">lock</span>
      <input type="password" id="password" placeholder="••••••••" />
      <button type="button" class="toggle-pw" id="toggle-pw-btn">
        <span class="material-symbols-outlined" id="pw-eye">visibility</span>
      </button>
    </div>
  </div>
  <div class="remember-row">
    <input type="checkbox" id="remember" />
    <label for="remember">Ingat saya di perangkat ini</label>
  </div>
  <button type="submit" class="auth-submit">Masuk</button>
</form>
<div class="auth-divider" style="margin-top:8px;"><span>atau lanjut dengan</span></div>
<button class="auth-google">
  <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
  Lanjutkan dengan Google
</button>`;

  window._pageInit = function() {
    const btn = document.getElementById('toggle-pw-btn');
    const pw = document.getElementById('password');
    const eye = document.getElementById('pw-eye');
    if (btn) btn.addEventListener('click', () => {
      pw.type = pw.type === 'password' ? 'text' : 'password';
      eye.textContent = pw.type === 'password' ? 'visibility' : 'visibility_off';
    });
    const form = document.getElementById('login-form');
    if (form) form.addEventListener('submit', (e) => { e.preventDefault(); nav('/dashboard'); });
  };

  return authShell(
    'Selamat Datang<br><em>Kembali.</em>',
    'Masuk ke akun Anda untuk melanjutkan otomatisasi bisnis Anda.',
    form,
    'Belum punya akun? <a data-href="/register">Daftar Sekarang</a>',
    '/register',
    'Daftar'
  );
};

Pages.register = function() {
  const form = `
<form class="auth-form" id="register-form">
  <div class="form-group">
    <label class="form-label" for="nama_lengkap">Nama Lengkap</label>
    <div class="input-wrap">
      <span class="material-symbols-outlined input-icon">person</span>
      <input type="text" id="nama_lengkap" placeholder="Nama Anda" />
    </div>
  </div>
  <div class="form-group">
    <label class="form-label" for="nama_bisnis">Nama Bisnis</label>
    <div class="input-wrap">
      <span class="material-symbols-outlined input-icon">store</span>
      <input type="text" id="nama_bisnis" placeholder="Nama toko atau perusahaan" />
    </div>
  </div>
  <div class="form-group">
    <label class="form-label" for="reg-email">Email</label>
    <div class="input-wrap">
      <span class="material-symbols-outlined input-icon">mail</span>
      <input type="email" id="reg-email" placeholder="nama@bisnis.com" />
    </div>
  </div>
  <div class="form-group">
    <label class="form-label" for="reg-password">Kata Sandi</label>
    <div class="input-wrap">
      <span class="material-symbols-outlined input-icon">lock</span>
      <input type="password" id="reg-password" placeholder="Min. 8 karakter" />
      <button type="button" class="toggle-pw" id="toggle-pw-reg">
        <span class="material-symbols-outlined" id="pw-eye-reg">visibility</span>
      </button>
    </div>
  </div>
  <button type="submit" class="auth-submit">Daftar Sekarang</button>
</form>`;

  window._pageInit = function() {
    const btn = document.getElementById('toggle-pw-reg');
    const pw = document.getElementById('reg-password');
    const eye = document.getElementById('pw-eye-reg');
    if (btn) btn.addEventListener('click', () => {
      pw.type = pw.type === 'password' ? 'text' : 'password';
      eye.textContent = pw.type === 'password' ? 'visibility' : 'visibility_off';
    });
    const form = document.getElementById('register-form');
    if (form) form.addEventListener('submit', (e) => { e.preventDefault(); nav('/dashboard'); });
  };

  return authShell(
    'Mulai <em>Otomatisasi</em><br>Bisnis Anda.',
    'Langkah pertama menuju efisiensi operasional yang cerdas.',
    form,
    'Sudah punya akun? <a data-href="/login">Masuk di sini</a>',
    '/login',
    'Masuk'
  );
};
