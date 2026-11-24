// Runs before first paint: standalone class + pinned theme, so nothing flashes.
(function () {
  var d = document.documentElement;
  var standalone = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  if (standalone) d.classList.add('app-full');
  try {
    var t = JSON.parse(localStorage.getItem('hh.v1') || '{}').settings;
    if (t && t.theme && t.theme !== 'auto') d.setAttribute('data-theme', t.theme);
  } catch (e) {}
  // Size the app to the tallest viewport the window has reported in this orientation (never taller than the screen).
  // Keeping the tallest means the keyboard or a short first report can't shrink the shell; capping at the
  // real viewport (not screen.height) keeps the tab bar on screen when iOS starts the page below the status bar.
  var tall = { p: 0, l: 0 };
  function size() {
    if (!standalone) return;
    var portrait = matchMedia('(orientation: portrait)').matches, k = portrait ? 'p' : 'l';
    var cap = portrait ? Math.max(screen.height, screen.width) : Math.min(screen.height, screen.width);
    var h = Math.min(cap, Math.max(window.innerHeight || 0, d.clientHeight || 0));
    if (h > tall[k]) tall[k] = h;
    d.style.setProperty('--app-h', tall[k] + 'px');
  }
  // After layout: if the tab bar still ends below the visible window, pull the shell up by the overflow.
  function fit() {
    size();
    var bar = document.getElementById('tabbar'); if (!standalone || !bar) return;
    var over = bar.getBoundingClientRect().bottom - window.innerHeight;
    var focused = document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (over > 1 && !focused) {
      var k = matchMedia('(orientation: portrait)').matches ? 'p' : 'l';
      tall[k] = Math.round(tall[k] - over); d.style.setProperty('--app-h', tall[k] + 'px');
    }
  }
  size();
  window.__hhFit = fit;
  addEventListener('DOMContentLoaded', function () { fit(); setTimeout(fit, 300); });
  addEventListener('load', fit);
  addEventListener('pageshow', fit);
  addEventListener('resize', function () { setTimeout(fit, 50); });
  addEventListener('orientationchange', function () { setTimeout(fit, 300); });
})();
