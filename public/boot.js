// Runs before first paint: standalone class + pinned theme, so nothing flashes.
(function () {
  var d = document.documentElement;
  var standalone = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  if (standalone) d.classList.add('app-full');
  try {
    var t = JSON.parse(localStorage.getItem('hh.v1') || '{}').settings;
    if (t && t.theme && t.theme !== 'auto') d.setAttribute('data-theme', t.theme);
  } catch (e) {}
  // Size the document from the screen (installed iOS reports one status bar short otherwise).
  // Only valid when the page draws under the status bar (black-translucent). With the default style,
  // iOS already starts the page below the status bar, so screen height would push the tab bar off screen.
  var sb = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  var underBar = sb && sb.content === 'black-translucent';
  function size() {
    if (!standalone || !underBar) return;
    var portrait = matchMedia('(orientation: portrait)').matches;
    var h = portrait ? Math.max(screen.height, screen.width) : Math.min(screen.height, screen.width);
    var prev = parseFloat(d.style.getPropertyValue('--app-h')) || 0;
    if (h > prev || !portrait) d.style.setProperty('--app-h', h + 'px');
  }
  size();
  addEventListener('orientationchange', function () { d.style.removeProperty('--app-h'); setTimeout(size, 300); });
})();
