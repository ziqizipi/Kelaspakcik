// ============================================================
// CLIENT-SIDE ROUTER
// ============================================================
const routes = {
  '/':           () => Pages.landing(),
  '/use-cases':  () => Pages.useCases(),
  '/login':      () => Pages.login(),
  '/register':   () => Pages.register(),
  '/dashboard':  () => Pages.dashboard(),
  '/orders':     () => Pages.orders(),
  '/customers':  () => Pages.customers(),
  '/settings':   () => Pages.settings(),
};

function navigate(path) {
  history.pushState({}, '', path);
  render(path);
}

function render(path) {
  const app = document.getElementById('app');
  const handler = routes[path] || routes['/'];
  app.innerHTML = handler();
  app.style.animation = 'none';
  requestAnimationFrame(() => { app.style.animation = ''; });
  if (typeof window._pageInit === 'function') { window._pageInit(); window._pageInit = null; }
  window.scrollTo(0, 0);
}

// Global navigation helper
window.nav = navigate;

window.addEventListener('popstate', () => render(location.pathname));
document.addEventListener('click', e => {
  const a = e.target.closest('[data-href]');
  if (a) { e.preventDefault(); navigate(a.dataset.href); }
});

// Boot
render(location.pathname);
