/* Healthy Hannah — vanilla JS PWA. Data lives on the device (localStorage + IndexedDB for images). */
(function () {
'use strict';

const VERSION = '1.1.2';
const KEY = 'hh.v1';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday-first week

// ---------- Faith + encouragement content ----------
const VERSES = [
  ['I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works.', 'Psalm 139:14'],
  ['I can do all things through Christ which strengtheneth me.', 'Philippians 4:13'],
  ['Strength and honour are her clothing; and she shall rejoice in time to come.', 'Proverbs 31:25'],
  ['She girdeth her loins with strength, and strengtheneth her arms.', 'Proverbs 31:17'],
  ['God is in the midst of her; she shall not be moved: God shall help her, and that right early.', 'Psalm 46:5'],
  ['His compassions fail not. They are new every morning: great is thy faithfulness.', 'Lamentations 3:22-23'],
  ['But they that wait upon the LORD shall renew their strength; they shall run, and not be weary; and they shall walk, and not faint.', 'Isaiah 40:31'],
  ['The LORD thy God in the midst of thee is mighty; he will rejoice over thee with joy.', 'Zephaniah 3:17'],
  ['My grace is sufficient for thee: for my strength is made perfect in weakness.', '2 Corinthians 12:9'],
  ['Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee.', 'Isaiah 41:10'],
  ['This is the day which the LORD hath made; we will rejoice and be glad in it.', 'Psalm 118:24'],
  ['The joy of the LORD is your strength.', 'Nehemiah 8:10'],
  ['Come unto me, all ye that labour and are heavy laden, and I will give you rest.', 'Matthew 11:28'],
  ['Let us not be weary in well doing: for in due season we shall reap, if we faint not.', 'Galatians 6:9'],
  ['God is the strength of my heart, and my portion for ever.', 'Psalm 73:26'],
  ['Man looketh on the outward appearance, but the LORD looketh on the heart.', '1 Samuel 16:7'],
  ['For we are his workmanship, created in Christ Jesus unto good works.', 'Ephesians 2:10'],
  ['He restoreth my soul.', 'Psalm 23:3'],
  ['Beloved, I wish above all things that thou mayest prosper and be in health, even as thy soul prospereth.', '3 John 1:2'],
  ['He which hath begun a good work in you will perform it.', 'Philippians 1:6'],
  ['The LORD is my strength and my shield; my heart trusted in him, and I am helped.', 'Psalm 28:7'],
  ['Fear not: I have called thee by thy name; thou art mine.', 'Isaiah 43:1'],
  ['Whatsoever ye do, do it heartily, as to the Lord.', 'Colossians 3:23'],
  ['They looked unto him, and were lightened: and their faces were not ashamed.', 'Psalm 34:5'],
  ['Casting all your care upon him; for he careth for you.', '1 Peter 5:7'],
  ['Let us run with patience the race that is set before us.', 'Hebrews 12:1'],
  ['Be strong and of a good courage; for the LORD thy God is with thee whithersoever thou goest.', 'Joshua 1:9'],
  ['Thou art all fair, my love; there is no spot in thee.', 'Song of Solomon 4:7'],
];
const AFFIRM = [
  'My body is a gift, and I care for it with love.',
  'I move to celebrate my body, not to punish it.',
  'Small steps count. Today counts.',
  'Grace over perfection.',
  'My worth is not measured in reps.',
  'I am getting stronger in body and in spirit.',
  'Rest is part of the plan, not a failure of it.',
  'I am proud of myself for showing up.',
  'I am allowed to go gently.',
  'I am fearfully and wonderfully made.',
  'Progress, not perfection.',
  'I honor what my body has carried and done.',
  'Every check is a thank-you to the body God gave me.',
  'I am strong, capable and deeply loved.',
];
const CHEERS = [
  'Strong work, Hannah.', 'You showed up. That matters.', 'Look at you go.', 'That was a gift to your body.',
  'Proud of you.', 'Faithful in the small things.', 'Done with grace.', 'One more step forward.',
];
const DAY_DONE = [
  'Every box checked. Well done, good and faithful.', 'You finished today. Rest well tonight.',
  'All done. Your body thanks you.', 'Complete. Small faithful steps add up.',
];
const MISSED = 'His mercies are new every morning. Today is a fresh start.';

// ---------- Seed: her Apple Note ----------
let _id = Date.now();
const uid = () => (++_id).toString(36);
const ex = (name, reps, note) => ({ id: uid(), name, reps, note: note || '' });

function seed() {
  return {
    v: 1,
    routines: {
      mobility: {
        name: 'Mobility Movements', emoji: '🌊',
        note: 'Video version: 1 minute of each move, finish with fascia slaps and a deep inhale, hold, long exhale.',
        items: [
          ex('Lymph jumps', '30'), ex('Body waves', '30'), ex('Arm waves', '30'), ex('Marches', '30'),
          ex('Trunk twists', '30'), ex('Golf swing', '30'), ex('Side to side toe touches', '30'),
          ex('Chi squats', '30'), ex('Wide stance twist opening', '30'), ex('Twisting hops', '30'),
        ],
        refs: [
          { id: uid(), kind: 'link', title: 'Lymph flow: 1 minute of each (12 moves)', url: 'https://www.tiktok.com/search?q=lymph%20jumps%20body%20waves%201%20minute%20of%20each' },
        ],
      },
      resistance: {
        name: 'Resistance', emoji: '🍑',
        note: 'Starter glute set. Swap in moves from the glutes video as you go.',
        items: [
          ex('Glute bridges (band or weight)', '3×15'), ex('Clamshells', '3×12 each'), ex('Goblet squats', '3×10'),
          ex('Romanian deadlifts', '3×10'), ex('Step-ups', '3×10 each'), ex('Banded lateral walks', '3×10 each'),
          ex('Donkey kicks', '3×12 each'),
        ],
        refs: [
          { id: uid(), kind: 'link', title: "I Transformed My Wife's Body In 90 Days (YouTube)", url: 'https://www.youtube.com/results?search_query=I+Transformed+My+Wife%27s+Body+In+90+Days' },
        ],
      },
      hipscore: {
        name: 'Hips + Core', emoji: '🌸',
        note: 'Breathe out on the effort. Ease off if you feel pressure or see doming along your middle.',
        items: [
          ex('Toe taps', '26'), ex('Glute bridges', '26'), ex('Bird dog', '26'), ex('Dead bugs', '26'),
          ex('Weighted marches', '25'), ex('Quad hold', '30s'),
          ex('Hip flexor thrusts', '20', 'Kneel sitting on heels, then kneel up'),
          ex('Hip hurdles', '10'), ex('90/90', '10'), ex('Seated straight leg raises', '10'),
          ex('90/90 hip extensions', '10'), ex('Hip flexor lunges', '10'), ex('Deep squats', '10'),
          ex('Deep lateral lunges', '10'),
        ],
        refs: [
          { id: uid(), kind: 'link', title: 'Hip flexors (movementbydavid)', url: 'https://www.tiktok.com/@movementbydavid' },
          { id: uid(), kind: 'link', title: 'Hip + mobility leg day warmup (juliiaannne)', url: 'https://www.tiktok.com/@juliiaannne' },
          { id: uid(), kind: 'link', title: '6 deep core exercises for postpartum', url: 'https://www.tiktok.com/search?q=6%20deep%20core%20exercises%20for%20postpartum' },
        ],
      },
      yoga: {
        name: 'Yoga', emoji: '🧘‍♀️', note: '',
        items: [ex('Somatic flow', '12 min')],
        refs: [
          { id: uid(), kind: 'link', title: '12 minutes of somatic flow (The InspiroGrow)', url: 'https://www.pinterest.com/search/pins/?q=12%20minutes%20of%20somatic%20flow%20inspirogrow' },
        ],
      },
      ringfit: {
        name: 'Ring Fit', emoji: '💍', note: 'Add to any day on the Plan tab.',
        items: [ex('Ring Fit session', '20 min')], refs: [],
      },
    },
    week: { 0: [], 1: ['mobility', 'resistance'], 2: ['hipscore', 'yoga'], 3: ['mobility', 'resistance'], 4: ['hipscore', 'yoga'], 5: ['mobility', 'resistance'], 6: [] },
    habits: [
      { id: 'water', name: 'Water', emoji: '💧', target: 8, unit: 'glasses' },
      { id: 'walk', name: 'Walk outside', emoji: '🚶‍♀️', target: 1 },
      { id: 'vitamins', name: 'Vitamins', emoji: '💊', target: 1 },
      { id: 'prayer', name: 'Quiet time', emoji: '🙏', target: 1 },
    ],
    log: {},
    settings: { name: 'Hannah', theme: 'auto', verse: true, cycle: false, remindTime: '08:00', checkinTime: '20:00', badge: false },
  };
}

// ---------- Store ----------
let S;
function load() {
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
  if (!S || !S.routines) S = seed();
  S.settings = Object.assign(seed().settings, S.settings || {});
  S.log = S.log || {};
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Couldn’t save on this device. Storage may be full.'); }
  updateBadge();
}

// Images in IndexedDB
const idb = (() => {
  let dbp;
  const open = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open('hh-img', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('img');
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }));
  const tx = (mode, fn) => open().then(db => new Promise((res, rej) => {
    const t = db.transaction('img', mode); const st = t.objectStore('img'); const out = fn(st);
    t.oncomplete = () => res(out && out.result); t.onerror = () => rej(t.error);
  }));
  return {
    get: k => tx('readonly', st => st.get(k)),
    set: (k, v) => tx('readwrite', st => st.put(v, k)),
    del: k => tx('readwrite', st => st.delete(k)),
    all: () => open().then(db => new Promise(res => {
      const out = {}; const c = db.transaction('img').objectStore('img').openCursor();
      c.onsuccess = () => { const cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } else res(out); };
    })),
  };
})();

// ---------- Dates ----------
const pad = n => String(n).padStart(2, '0');
const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const todayStr = () => ymd(new Date());
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
const short = s => parse(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const weekStart = s => { const d = parse(s); const off = (d.getDay() + 6) % 7; d.setDate(d.getDate() - off); return ymd(d); };
const dayHash = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };

// ---------- Day math ----------
function dayLog(d, create) {
  let L = S.log[d];
  if (!L && create) L = S.log[d] = { done: {}, habits: {}, m: {} };
  return L || { done: {}, habits: {}, m: {} };
}
function planFor(d) { return (S.week[parse(d).getDay()] || []).filter(id => S.routines[id]); }
function routinesFor(d) {
  const L = dayLog(d);
  const extra = Object.keys(L.done || {}).filter(id => S.routines[id] && !planFor(d).includes(id) && Object.values(L.done[id]).some(Boolean));
  return planFor(d).concat(extra);
}
function routineProgress(d, id) {
  const r = S.routines[id]; const done = (dayLog(d).done || {})[id] || {};
  const n = r.items.length; const k = r.items.filter(i => done[i.id]).length;
  return { n, k, full: n > 0 && k === n };
}
function dayProgress(d) {
  const ids = planFor(d); let n = 0, k = 0;
  ids.forEach(id => { const p = routineProgress(d, id); n += p.n; k += p.k; });
  const extraFull = Object.keys(dayLog(d).done || {}).some(id => !ids.includes(id) && S.routines[id] && routineProgress(d, id).full);
  return { n, k, pct: n ? k / n : (extraFull ? 1 : 0), rest: ids.length === 0, extraFull };
}
function showedUp(d) { const p = dayProgress(d); return p.k > 0 || p.extraFull; }
function streak() {
  let d = todayStr(), s = 0, guard = 0;
  if (!(dayProgress(d).pct >= 0.8)) d = addDays(d, -1); // today still in progress doesn't break it
  while (guard++ < 800) {
    const p = dayProgress(d);
    if (p.rest) { if (p.extraFull) s++; d = addDays(d, -1); continue; }
    if (p.pct >= 0.8) { s++; d = addDays(d, -1); } else break;
  }
  return s;
}
function sessionsDone(from, to) {
  let c = 0;
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const L = dayLog(d); Object.keys(L.done || {}).forEach(id => { if (S.routines[id] && routineProgress(d, id).full) c++; });
  }
  return c;
}
function totalSessions() {
  let c = 0;
  Object.keys(S.log).forEach(d => Object.keys(S.log[d].done || {}).forEach(id => { if (S.routines[id] && routineProgress(d, id).full) c++; }));
  return c;
}

// ---------- Utils ----------
const $ = (s, el) => (el || document).querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pick = (arr, seedStr) => arr[dayHash(seedStr) % arr.length];
const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHEV = '<svg class="chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON = {
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg>',
  up: '<svg viewBox="0 0 24 24"><path d="M6 14l6-6 6 6"/></svg>',
  pencil: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4z"/></svg>',
  log: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
};
function haptic() { try { navigator.vibrate && navigator.vibrate(8); } catch (e) {} }

// ---------- Toast with undo (act → undo, 5 s) ----------
let toastTimer, pendingUndo = null;
function toast(text, undo) {
  const t = $('#toast');
  clearTimeout(toastTimer);
  pendingUndo = undo || null;
  t.innerHTML = '<span>' + esc(text) + '</span>' + (undo ? '<button type="button" data-act="undo">Undo</button>' : '');
  t.classList.add('show');
  toastTimer = setTimeout(() => { t.classList.remove('show'); pendingUndo = null; }, undo ? 5000 : 2600);
}
function snapshot() { return JSON.stringify(S); }
function restore(snap) { S = JSON.parse(snap); save(); render(); }

// ---------- Celebration ----------
function celebrate(big) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const n = big ? 28 : 12; const layer = document.createElement('div');
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:70;overflow:hidden';
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    const x = 50 + (Math.random() - .5) * 70, dx = (Math.random() - .5) * 160, dur = 900 + Math.random() * 700;
    s.textContent = ['💗', '🌸', '✨', '💕'][i % 4];
    s.style.cssText = `position:absolute;left:${x}%;bottom:18%;font-size:${16 + Math.random() * 14}px;opacity:0`;
    layer.appendChild(s);
    s.animate([{ transform: 'translate(0,0) scale(.6)', opacity: 0 }, { opacity: 1, offset: .15 },
      { transform: `translate(${dx}px,-${280 + Math.random() * 220}px) scale(1)`, opacity: 0 }],
      { duration: dur, delay: Math.random() * 200, easing: 'cubic-bezier(.2,.6,.3,1)', fill: 'forwards' });
  }
  document.body.appendChild(layer); setTimeout(() => layer.remove(), 2000);
}

// ---------- Sheets ----------
let sheetCount = 0;
function lockScroll(on) {
  sheetCount += on ? 1 : -1; if (sheetCount < 0) sheetCount = 0;
  const v = sheetCount ? 'hidden' : '';
  document.documentElement.style.overflow = v; $('#app-scroll').style.overflow = v;
}
function openSheet({ title, body, save: onSave, saveLabel, onClose, plain }) {
  const host = $('#sheets');
  const dim = document.createElement('div'); dim.className = 'dim';
  const sh = document.createElement('div'); sh.className = 'sheet'; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-label', title);
  sh.innerHTML = '<div class="sheet-h"><div class="tb-left">' +
    (plain || !onSave ? '<button class="tb-btn" data-x aria-label="Close">' + ICON.x + '</button>' : '<button class="tb-btn" data-x>Cancel</button>') +
    '</div><h2>' + esc(title) + '</h2><div class="tb-right">' + (onSave ? '<button class="tb-btn" data-save>' + esc(saveLabel || 'Save') + '</button>' : '') + '</div></div><div class="sheet-b"></div>';
  const b = sh.querySelector('.sheet-b');
  if (typeof body === 'string') b.innerHTML = body; else b.appendChild(body);
  host.append(dim, sh); lockScroll(true);
  requestAnimationFrame(() => requestAnimationFrame(() => { dim.classList.add('show'); sh.classList.add('show'); }));
  let closed = false;
  const close = () => {
    if (closed) return; closed = true;
    dim.classList.remove('show'); sh.classList.remove('show'); sh.style.transform = '';
    document.removeEventListener('keydown', onKey);
    setTimeout(() => { dim.remove(); sh.remove(); lockScroll(false); onClose && onClose(); }, 400);
  };
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  dim.addEventListener('click', close);
  sh.querySelector('[data-x]').addEventListener('click', close);
  const sv = sh.querySelector('[data-save]');
  if (sv) sv.addEventListener('click', () => { if (onSave(b) !== false) close(); });
  // drag header down to dismiss
  const hd = sh.querySelector('.sheet-h'); let y0 = null, t0 = 0, dy = 0;
  hd.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; y0 = e.clientY; t0 = performance.now(); dy = 0; sh.style.transition = 'none'; hd.setPointerCapture(e.pointerId); });
  hd.addEventListener('pointermove', e => { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); sh.style.transform = `translateY(${dy}px)`; });
  const end = () => {
    if (y0 == null) return; y0 = null; sh.style.transition = '';
    const v = dy / (performance.now() - t0);
    if (dy > sh.offsetHeight / 3 || (v > .6 && dy > 40)) close(); else sh.style.transform = '';
  };
  hd.addEventListener('pointerup', end); hd.addEventListener('pointercancel', end);
  return { el: b, close };
}
function confirmSheet(title, text, btn, onYes) {
  const s = openSheet({ title, plain: true, body: `<p>${esc(text)}</p><div class="pad"><button class="btn primary block" data-yes style="background:#B5533C">${esc(btn)}</button></div>` });
  s.el.querySelector('[data-yes]').addEventListener('click', () => { s.close(); onYes(); });
}

// ---------- Router ----------
const TABS = ['today', 'plan', 'progress', 'more'];
let route = { tab: 'today', path: [], q: {} };
function parseHash() {
  const h = location.hash.replace(/^#/, '') || 'today';
  const [p, qs] = h.split('?'); const parts = p.split('/').filter(Boolean);
  const q = {}; new URLSearchParams(qs || '').forEach((v, k) => { q[k] = v; });
  return { tab: TABS.includes(parts[0]) ? parts[0] : 'today', path: parts.slice(1), q };
}
let pushed = 0;
function go(hash, opts) {
  opts = opts || {};
  if (opts.replace) { history.replaceState(null, '', '#' + hash); }
  else { history.pushState(null, '', '#' + hash); pushed++; }
  onRoute(opts.dir || (opts.replace ? '' : 'push'));
}
function back(to) {
  if (pushed > 0) { pushed--; history.back(); }
  else go(to, { replace: true, dir: 'back' });
}
window.addEventListener('popstate', () => onRoute('back'));
let lastDir = '';
function onRoute(dir) { lastDir = dir || ''; route = parseHash(); render(); }

// ---------- Header ----------
function header(title, left, right) {
  $('#tbTitle').textContent = title;
  $('#tbLeft').innerHTML = left || '';
  $('#tbRight').innerHTML = right || '';
}
const backBtn = (label, to) => `<button class="tb-btn" data-act="back" data-to="${esc(to)}" style="padding-left:0">${ICON.back}<span>${esc(label)}</span></button>`;

// ---------- Render ----------
function render() {
  document.querySelectorAll('#tabbar a').forEach(a => a.classList.toggle('on', a.dataset.tab === route.tab));
  const v = $('#view');
  const map = { today: renderToday, plan: renderPlan, progress: renderProgress, more: renderMore };
  v.innerHTML = '';
  map[route.tab](v);
  if (lastDir === 'push' || lastDir === 'back') {
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v.animate([{ transform: `translateX(${lastDir === 'push' ? 30 : -25}%)`, opacity: .3 }, { transform: 'none', opacity: 1 }],
        { duration: 300, easing: 'cubic-bezier(.3,.2,.5,1)' });
    }
  }
  if (lastDir !== 'keep') $('#app-scroll').scrollTop = 0;
  lastDir = '';
  hydrateImages(v);
}
function rerender() { const sc = $('#app-scroll').scrollTop; lastDir = 'keep'; render(); $('#app-scroll').scrollTop = sc; }

// ===== TODAY =====
function renderToday(v) {
  const today = todayStr();
  const d = route.q.d && /^\d{4}-\d{2}-\d{2}$/.test(route.q.d) && route.q.d <= today ? route.q.d : today;
  const isToday = d === today;
  header(isToday ? 'Today' : short(d), isToday ? '' : backBtn('Today', 'today'),
    `<button class="tb-btn" data-act="log" data-d="${d}" aria-label="Reflect on today">${ICON.plus}</button>`);
  const p = dayProgress(d); const pct = Math.round(p.pct * 100);
  const hour = new Date().getHours();
  const greet = !isToday ? DAYS_LONG[parse(d).getDay()] : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const C = 2 * Math.PI * 37;
  const [vt, vr] = pick(VERSES, d); const aff = pick(AFFIRM, d + 'a');
  const firstDay = Object.keys(S.log).sort()[0];
  const missedYesterday = isToday && firstDay && firstDay <= addDays(d, -1) && !dayProgress(addDays(d, -1)).rest && !showedUp(addDays(d, -1));

  let html = `<div class="today-top">
    <div class="ring" role="img" aria-label="${pct}% done"><svg viewBox="0 0 84 84"><circle class="bg" cx="42" cy="42" r="37"/><circle class="fg" cx="42" cy="42" r="37" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - p.pct)}"/></svg><div class="pct">${p.rest && !p.extraFull ? '🌿' : pct + '%'}</div></div>
    <div><div class="hero" style="padding:0"><div class="eyebrow">${esc(greet)}${isToday ? ', ' + esc(S.settings.name) : ''}</div>
    <div class="big" style="font-size:24px">${p.rest && !p.extraFull ? 'Rest day' : p.pct >= 1 ? 'All done' : p.k ? `${p.n - p.k} to go` : planFor(d).map(id => S.routines[id].name).join(' + ')}</div>
    <div class="sub" style="font-size:14px">${esc(aff)}</div></div></div></div>`;
  html += weekStrip(d);
  if (S.settings.verse) html += `<div class="verse"><q>${esc(vt)}</q><cite>${esc(vr)}</cite></div>`;
  html += cycleCard(d);
  if (missedYesterday) html +=`<div class="note">${esc(MISSED)}</div>`;
  if (p.pct >= 1 && !p.rest) html += `<div class="card rest-card" style="margin-top:12px"><b>${esc(pick(DAY_DONE, d))}</b><span class="muted">Tap ＋ to note a win.</span></div>`;

  const ids = routinesFor(d);
  html += '<div class="h2">Workouts</div>';
  if (!ids.length) {
    html += `<div class="card rest-card"><b>Rest and recover</b><span class="muted">Rest is part of the plan. Feel like moving?</span>
      <div class="row-gap" style="justify-content:center;margin-top:12px">${Object.keys(S.routines).map(id => `<button class="btn soft" data-act="addsess" data-id="${id}" data-d="${d}">${S.routines[id].emoji} ${esc(S.routines[id].name)}</button>`).join('')}</div></div>`;
  }
  ids.forEach(id => html += sessionCard(d, id));
  if (ids.length) html += `<div style="text-align:center;margin-top:6px"><button class="btn quiet" data-act="extra" data-d="${d}">＋ Add a workout</button></div>`;

  html += '<div class="h2">Daily habits</div><div class="habit-grid">';
  const L = dayLog(d);
  S.habits.forEach(hb => {
    const c = (L.habits || {})[hb.id] || 0; const done = c >= hb.target;
    html += `<button class="habit ${done ? 'done' : ''}" data-act="habit" data-id="${hb.id}" data-d="${d}" aria-label="${esc(hb.name)} ${c} of ${hb.target}">
      <span class="e">${hb.emoji}</span><span class="l">${esc(hb.name)}</span><span class="c">${hb.target > 1 ? c + '/' + hb.target : done ? '✓' : ''}</span></button>`;
  });
  html += '</div>';

  const m = L.m || {};
  html += `<div class="h2">Heart</div><div class="card rows">
    <button class="r" data-act="log" data-d="${d}"><span class="l">${m.win ? esc(m.win) : 'How was today?'}<small>${m.grateful ? 'Grateful for ' + esc(m.grateful) : 'Mood, one win, one thing you’re grateful for'}</small></span>${m.mood ? '<span style="font-size:22px">' + m.mood + '</span>' : ''}${CHEV}</button>
  </div>`;
  v.innerHTML = html;
}
// ---------- Cycle-aware tips (optional) ----------
function cycleInfo(d) {
  const starts = ((S.cycle || {}).starts || []).filter(s => s <= d).sort();
  if (!starts.length) return null;
  const last = starts[starts.length - 1];
  const day = Math.round((parse(d) - parse(last)) / 864e5) + 1;
  const len = cycleLen();
  if (day > len + 14) return { day, phase: 'Unknown', tip: 'Log your next period start for fresh tips.', emoji: '🌙' };
  if (day <= 5) return { day, phase: 'Menstrual', emoji: '🌙', tip: 'Go gently. Walks, yoga and mobility are perfect. Rest is part of the plan.' };
  if (day <= 13) return { day, phase: 'Follicular', emoji: '🌱', tip: 'Energy is rising. A lovely week to lean into resistance work.' };
  if (day <= 16) return { day, phase: 'Ovulation', emoji: '🌸', tip: 'Often your strongest days. Warm up your hips well and enjoy it.' };
  return { day, phase: 'Luteal', emoji: '🍂', tip: 'Steady and kind. Moderate effort, extra water and sleep, and grace for cravings.' };
}
function cycleLen() {
  const st = ((S.cycle || {}).starts || []).slice().sort(); const gaps = [];
  for (let i = 1; i < st.length; i++) { const g = Math.round((parse(st[i]) - parse(st[i - 1])) / 864e5); if (g >= 20 && g <= 45) gaps.push(g); }
  return gaps.length ? Math.round(gaps.slice(-4).reduce((a, b) => a + b, 0) / Math.min(4, gaps.length)) : 28;
}
function cycleCard(d) {
  if (!S.settings.cycle) return '';
  const c = cycleInfo(d);
  if (!c) return `<div class="card rows" style="margin-top:10px"><button class="r" data-act="period" data-d="${d}"><span style="font-size:22px">🌙</span><span class="l">Cycle-aware tips<small>Tap the day your period starts</small></span>${CHEV}</button></div>`;
  return `<div class="card rows" style="margin-top:10px"><div class="r" style="align-items:flex-start;padding-top:12px;padding-bottom:12px"><span style="font-size:22px">${c.emoji}</span><span class="l"><b style="font-weight:600">${c.phase} · day ${c.day}</b><small>${esc(c.tip)}</small></span>
    <button class="btn quiet" data-act="period" data-d="${d}" style="min-height:36px;font-size:14px">Period started</button></div></div>`;
}
function weekStrip(sel) {
  const ws = weekStart(sel); const today = todayStr(); let h = '<div class="weekstrip" role="group" aria-label="This week">';
  for (let i = 0; i < 7; i++) {
    const d = addDays(ws, i); const p = dayProgress(d); const future = d > today;
    const cls = future ? (p.rest ? 'rest' : '') : p.pct >= 1 ? 'full' : (p.k || p.extraFull) ? 'part' : p.rest ? 'rest' : '';
    h += `<button class="d ${d === today ? 'today' : ''} ${d === sel ? 'sel' : ''}" ${future ? 'disabled' : ''} data-act="day" data-d="${d}" aria-label="${DAYS_LONG[parse(d).getDay()]}"><span>${DAYS[parse(d).getDay()][0]}</span><i class="dot ${cls}">${cls === 'full' ? '✓' : parse(d).getDate()}</i></button>`;
  }
  return h + '</div>';
}
function sessionCard(d, id) {
  const r = S.routines[id]; const pr = routineProgress(d, id); const done = (dayLog(d).done || {})[id] || {};
  const open = openCards.has(d + id) || (!pr.full && !openCards.has('closed' + d + id) && firstOpen(d) === id);
  let h = `<div class="card ${open ? 'open' : ''}" data-card="${id}" style="margin-top:12px">
    <button class="sess-h" data-act="toggle" data-id="${id}" data-d="${d}" aria-expanded="${open}"><span class="emo">${r.emoji}</span>
    <span class="t"><b>${esc(r.name)}</b><small>${pr.full ? 'Done · ' + esc(pick(CHEERS, d + id)) : pr.k + ' of ' + pr.n}</small></span>${CHEV}</button>
    <div class="minibar"><i style="width:${pr.n ? pr.k / pr.n * 100 : 0}%"></i></div><div class="sess-body">`;
  if (r.note) h += `<div class="note" style="padding:8px 16px 4px">${esc(r.note)}</div>`;
  r.items.forEach(it => {
    h += `<button class="ex ${done[it.id] ? 'done' : ''}" data-act="check" data-id="${id}" data-item="${it.id}" data-d="${d}" role="checkbox" aria-checked="${!!done[it.id]}">
      <span class="name">${esc(it.name)}${it.note ? '<small>' + esc(it.note) + '</small>' : ''}</span><span class="reps">${esc(it.reps)}</span><span class="check"><i>${CHECK}</i></span></button>`;
  });
  h += `<div class="sess-foot"><button class="btn quiet" data-act="refs" data-id="${id}">Inspiration (${r.refs.length})</button>
    ${pr.full ? `<button class="btn quiet" data-act="clearsess" data-id="${id}" data-d="${d}">Reset</button>` : `<button class="btn soft" data-act="allsess" data-id="${id}" data-d="${d}">Mark all done</button>`}</div></div></div>`;
  return h;
}
const openCards = new Set();
function firstOpen(d) { return routinesFor(d).find(id => !routineProgress(d, id).full); }

// ===== PLAN =====
function renderPlan(v) {
  if (route.path[0] === 'r' && S.routines[route.path[1]]) return renderRoutine(v, route.path[1]);
  header('Plan', '', `<button class="tb-btn" data-act="newroutine" aria-label="New workout">${ICON.plus}</button>`);
  let h = '<div class="h2" style="margin-top:8px">Week</div><div class="card rows">';
  ORDER.forEach(dw => {
    const ids = (S.week[dw] || []).filter(id => S.routines[id]);
    h += `<button class="r" data-act="editday" data-dw="${dw}"><span class="l"><b style="font-weight:600">${DAYS_LONG[dw]}</b><small>${ids.length ? ids.map(id => S.routines[id].emoji + ' ' + esc(S.routines[id].name)).join('  ·  ') : 'Rest'}</small></span>${CHEV}</button>`;
  });
  h += '</div><div class="h2">Workouts</div><div class="card rows">';
  Object.keys(S.routines).forEach(id => {
    const r = S.routines[id]; const days = ORDER.filter(dw => (S.week[dw] || []).includes(id)).map(dw => DAYS[dw]);
    h += `<a class="r" href="#plan/r/${id}" data-push><span style="font-size:24px">${r.emoji}</span><span class="l">${esc(r.name)}<small>${r.items.length} moves${days.length ? ' · ' + days.join(', ') : ''}${r.refs.length ? ' · ' + r.refs.length + ' saved' : ''}</small></span>${CHEV}</a>`;
  });
  h += '</div><div class="h2">Habits</div><div class="card rows">';
  S.habits.forEach(hb => { h += `<button class="r" data-act="edithabit" data-id="${hb.id}"><span style="font-size:22px">${hb.emoji}</span><span class="l">${esc(hb.name)}</span><span class="v">${hb.target > 1 ? hb.target + ' ' + esc(hb.unit || '') : 'Daily'}</span>${CHEV}</button>`; });
  h += `<button class="r" data-act="edithabit"><span class="l" style="color:var(--rose);font-weight:600">＋ Add habit</span></button></div>`;
  v.innerHTML = h;
}
function renderRoutine(v, id) {
  const r = S.routines[id];
  header(r.name, backBtn('Plan', 'plan'), `<button class="tb-btn" data-act="editroutine" data-id="${id}" aria-label="Edit">${ICON.pencil}</button>`);
  let h = `<div class="hero"><div class="eyebrow">${ORDER.filter(dw => (S.week[dw] || []).includes(id)).map(dw => DAYS[dw]).join(' · ') || 'Not scheduled'}</div>
    <div class="big">${r.emoji} ${r.items.length} moves</div>${r.note ? `<div class="sub">${esc(r.note)}</div>` : ''}</div>`;
  h += '<div class="card">';
  r.items.forEach((it, i) => {
    h += `<div class="edit-ex" style="${i === 0 ? 'border-top:0' : ''}"><input class="field f-name" value="${esc(it.name)}" data-edit="name" data-id="${id}" data-item="${it.id}" aria-label="Move name" enterkeyhint="done">
      <input class="field f-reps" value="${esc(it.reps)}" data-edit="reps" data-id="${id}" data-item="${it.id}" aria-label="Reps" enterkeyhint="done">
      <button class="icon-btn" data-act="moveup" data-id="${id}" data-item="${it.id}" aria-label="Move up" ${i === 0 ? 'disabled style="opacity:.3"' : ''}>${ICON.up}</button>
      <button class="icon-btn" data-act="delitem" data-id="${id}" data-item="${it.id}" aria-label="Delete ${esc(it.name)}">${ICON.trash}</button></div>`;
  });
  h += `<div class="edit-ex"><button class="btn quiet" data-act="additem" data-id="${id}">＋ Add move</button></div></div>`;
  h += `<div class="h2">Saved inspiration</div>` + refsHtml(id);
  h += `<div class="h2">Manage</div><div class="card rows"><button class="r" data-act="delroutine" data-id="${id}"><span class="l" style="color:#B5533C">Delete workout<small>Removes it from the plan. Past check-offs stay in history totals.</small></span></button></div>`;
  v.innerHTML = h;
}
function refsHtml(id) {
  const r = S.routines[id];
  let h = '<div class="card">';
  const imgs = r.refs.filter(x => x.kind === 'img');
  if (imgs.length) {
    h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:10px">';
    imgs.forEach(x => { h += `<button data-act="viewimg" data-id="${id}" data-ref="${x.id}" style="aspect-ratio:3/4;border-radius:12px;overflow:hidden;background:var(--rose-soft)"><img data-img="${x.id}" alt="${esc(x.title || 'Saved image')}" style="width:100%;height:100%;object-fit:cover;display:block"></button>`; });
    h += '</div>';
  }
  r.refs.filter(x => x.kind === 'link').forEach(x => {
    h += `<div class="link-row"><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title || x.url)}</a><button class="icon-btn" data-act="delref" data-id="${id}" data-ref="${x.id}" aria-label="Remove link">${ICON.trash}</button></div>`;
  });
  if (!r.refs.length) h += '<p class="note" style="padding:12px 16px">Save screenshots or links of workouts you love.</p>';
  h += `<div class="link-row" style="gap:4px"><label class="btn quiet" style="cursor:pointer">＋ Photo<input type="file" accept="image/*" multiple hidden data-addimg="${id}"></label><button class="btn quiet" data-act="addlink" data-id="${id}">＋ Link</button></div></div>`;
  return h;
}
function hydrateImages(root) {
  root.querySelectorAll('img[data-img]').forEach(img => idb.get(img.dataset.img).then(src => { if (src) img.src = src; }).catch(() => {}));
}

// ===== PROGRESS =====
let range = 8, picked = -1;
function renderProgress(v) {
  header('Progress');
  const today = todayStr(); const ws = weekStart(today);
  const monthStart = today.slice(0, 8) + '01';
  let showed = 0; for (let d = monthStart; d <= today; d = addDays(d, 1)) if (showedUp(d)) showed++;
  let wPlanned = 0, wDone = 0;
  for (let i = 0; i < 7; i++) { const d = addDays(ws, i); planFor(d).forEach(id => { wPlanned++; if (routineProgress(d, id).full) wDone++; }); }
  const st = streak(); const total = totalSessions();
  let h = `<div class="hero"><div class="eyebrow">This week</div><div class="big">${wDone} of ${wPlanned} workouts</div><div class="sub">${esc(wDone >= wPlanned && wPlanned ? 'A faithful week. Well done.' : wDone ? 'Every one counts. Keep going gently.' : 'A fresh week. One step at a time.')}</div></div>
  <div class="stats"><div class="stat"><b>${st}</b><span>Day streak</span></div><div class="stat"><b>${showed}</b><span>Days showed up this month</span></div><div class="stat"><b>${total}</b><span>Workouts all time</span></div></div>`;

  // weekly completion bars
  const weeks = []; for (let i = range - 1; i >= 0; i--) weeks.push(addDays(ws, -7 * i));
  const first = Object.keys(S.log).sort()[0] || today;
  const vals = weeks.map(w => { let n = 0, k = 0; for (let i = 0; i < 7; i++) { const d = addDays(w, i); if (d > today) break; if (d < first) continue; const p = dayProgress(d); n += p.n; k += p.k; } return { w, pct: n ? k / n : 0, n }; });
  if (picked >= vals.length) picked = -1;
  const ro = picked >= 0 ? `Week of ${short(vals[picked].w)} · ${Math.round(vals[picked].pct * 100)}% of moves` : `Average ${Math.round(vals.filter(x => x.n).reduce((a, x) => a + x.pct, 0) / Math.max(1, vals.filter(x => x.n).length) * 100)}% of planned moves`;
  h += `<div class="h2">Consistency</div><div class="card chart"><div class="readout" aria-live="polite">${ro}</div><div class="bars ${picked >= 0 ? 'picked' : ''}">`;
  vals.forEach((x, i) => { h += `<button class="b ${i === vals.length - 1 ? 'cur' : ''} ${i === picked ? 'sel' : ''}" data-act="bar" data-i="${i}" aria-label="Week of ${short(x.w)} ${Math.round(x.pct * 100)}%"><i style="height:${x.n ? Math.max(2, x.pct * 100) : 0}%"></i></button>`; });
  h += '</div><div class="bars-x">' + vals.map((x, i) => `<span>${((vals.length - 1 - i) % Math.ceil(range / 4) === 0) ? short(x.w) : ''}</span>`).join('') + '</div>';
  h += `<div class="chips-range" role="radiogroup" aria-label="Range">${[[8, '8W'], [12, '12W'], [26, '6M'], [52, '1Y']].map(([n, l]) => `<button role="radio" aria-checked="${range === n}" data-act="range" data-n="${n}">${l}</button>`).join('')}</div></div>`;

  // milestones
  const ms = [[1, 'First workout', '🌱'], [5, '5 workouts', '🌷'], [10, '10 workouts', '🌸'], [25, '25 workouts', '💐'], [50, '50 workouts', '🏵️'], [100, '100 workouts', '👑']];
  const best = bestStreak();
  const ss = [[3, '3-day streak', '✨'], [7, '7-day streak', '💗'], [21, '21-day streak', '🔥'], [40, '40 faithful days', '🕊️']];
  h += '<div class="h2">Milestones</div><div class="card" style="padding:12px;display:grid;grid-template-columns:repeat(5,1fr);gap:8px;text-align:center">';
  ms.map(([n, l, e]) => [total >= n, l, e]).concat(ss.map(([n, l, e]) => [best >= n, l, e])).forEach(([got, l, e]) => {
    h += `<div style="opacity:${got ? 1 : .35}"><div style="font-size:28px;filter:${got ? 'none' : 'grayscale(1)'}">${e}</div><div style="font-size:11px;font-weight:600;color:var(--muted);line-height:1.2">${esc(l)}</div></div>`;
  });
  h += '</div>';

  // wins
  const wins = Object.keys(S.log).filter(d => S.log[d].m && (S.log[d].m.win || S.log[d].m.grateful)).sort().reverse().slice(0, 10);
  h += '<div class="h2">Wins &amp; gratitude</div><div class="card rows">';
  if (!wins.length) h += '<div class="empty"><b>No wins written yet.</b><span class="muted">Tap ＋ on Today to note one. Small ones count.</span></div>';
  wins.forEach(d => { const m = S.log[d].m; h += `<a class="r" href="#today?d=${d}" data-push><span class="l">${esc(m.win || m.grateful)}<small>${short(d)}${m.win && m.grateful ? ' · Grateful for ' + esc(m.grateful) : ''}</small></span>${m.mood ? '<span style="font-size:20px">' + m.mood + '</span>' : ''}</a>`; });
  h += '</div>';
  v.innerHTML = h;
}
function bestStreak() {
  const ds = Object.keys(S.log).sort(); if (!ds.length) return 0;
  let best = 0, cur = 0;
  for (let d = ds[0]; d <= todayStr(); d = addDays(d, 1)) {
    const p = dayProgress(d);
    if (p.rest) { if (p.extraFull) cur++; continue; }
    if (p.pct >= .8) { cur++; best = Math.max(best, cur); } else if (d !== todayStr()) cur = 0;
  }
  return Math.max(best, cur);
}

// ===== MORE =====
function renderMore(v) {
  const sub = route.path[0];
  if (sub === 'reminders') return renderReminders(v);
  if (sub === 'backup') return renderBackup(v);
  header('More');
  const perm = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
  v.innerHTML = `<div class="h2" style="margin-top:8px">Stay on track</div><div class="card rows">
    <a class="r" href="#more/reminders" data-push><span class="l">Reminders</span><span class="v">${esc(fmtTime(S.settings.remindTime))}</span>${CHEV}</a>
    <div class="frow"><label>Cycle-aware tips<small>Gentle suggestions by phase</small></label><button class="switch" role="switch" aria-checked="${!!S.settings.cycle}" data-act="togglecycle" aria-label="Cycle-aware tips"></button></div></div>
  <div class="h2">You</div><div class="card">
    <div class="frow"><label for="nm">Name</label><input id="nm" class="field" value="${esc(S.settings.name)}" data-setting="name" enterkeyhint="done"></div>
    <div class="frow"><label>Daily verse<small>Scripture on Today</small></label><button class="switch" role="switch" aria-checked="${S.settings.verse}" data-act="toggleverse" aria-label="Daily verse"></button></div>
    <div class="frow" style="display:block"><label style="display:block;margin-bottom:8px">Appearance</label><div class="seg">${['auto', 'light', 'dark'].map(t => `<button aria-pressed="${S.settings.theme === t}" data-act="theme" data-t="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div></div>
  </div>
  <div class="h2">Data</div><div class="card rows">
    <a class="r" href="#more/backup" data-push><span class="l">Backup &amp; restore<small>Everything is saved on this phone only</small></span>${CHEV}</a>
    <div class="r"><span class="l">Version</span><span class="v">${VERSION}</span></div></div>
  <p class="note" style="text-align:center;margin-top:18px">Made with love for Hannah.</p>`;
  void perm;
}
function fmtTime(t) { const [h, m] = (t || '08:00').split(':').map(Number); const d = new Date(); d.setHours(h, m); return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }

function renderReminders(v) {
  header('Reminders', backBtn('More', 'more'));
  const canBadge = 'setAppBadge' in navigator;
  v.innerHTML = `<div class="card">
    <div class="frow"><label for="rt">Workout reminder<small>On workout days</small></label><input id="rt" type="time" class="field" value="${S.settings.remindTime}" data-setting="remindTime"></div>
    <div class="frow"><label for="ct">Evening check-in<small>Every day: habits, a win, gratitude</small></label><input id="ct" type="time" class="field" value="${S.settings.checkinTime}" data-setting="checkinTime"></div>
  </div>
  <div class="pad" style="padding:14px 0 0"><button class="btn primary block" data-act="ics">Add reminders to Calendar</button></div>
  <p class="note">Adds repeating Calendar events with alerts, named for each day’s plan, so they buzz on her iPhone and Apple Watch even when the app is closed. Tap “Add All” when Calendar opens. Re-add after changing the plan or times.</p>
  <div class="h2">Home screen badge</div><div class="card">
    <div class="frow"><label>Show workouts left<small>${canBadge ? 'Number on the app icon until today is done' : 'Available once installed on the Home Screen'}</small></label><button class="switch" role="switch" aria-checked="${!!S.settings.badge}" data-act="togglebadge" ${canBadge ? '' : 'disabled'} aria-label="Badge"></button></div></div>
  <div class="h2">Optional: open the app on a schedule</div>
  <div class="card" style="padding:4px 0 10px"><ol>
    <li>Open <b>Shortcuts</b> → <b>Automation</b> → <b>＋</b> → <b>Time of Day</b>.</li>
    <li>Pick ${esc(fmtTime(S.settings.remindTime))}, Weekly, Mon–Fri, <b>Run Immediately</b>.</li>
    <li>Action: <b>Show Notification</b> “Time to move. ${esc(pick(AFFIRM, 'n'))}”.</li></ol></div>`;
}
function renderBackup(v) {
  header('Backup', backBtn('More', 'more'));
  v.innerHTML = `<p class="note" style="font-size:15px">Everything lives on this phone. Save a backup now and then (Files or iCloud Drive) so nothing is lost if the app is removed.</p>
  <div class="card rows"><button class="r" data-act="export"><span class="l">Save backup file</span>${CHEV}</button>
  <label class="r" style="cursor:pointer"><span class="l">Restore from backup</span>${CHEV}<input type="file" accept="application/json,.json" hidden data-import></label></div>
  <div class="h2">Manage</div><div class="card rows"><button class="r" data-act="reset"><span class="l" style="color:#B5533C">Erase all data<small>Deletes every check-off, win and saved image on this phone</small></span></button></div>`;
}

// ---------- Log sheet ----------
const MOODS = ['😔', '😐', '🙂', '😊', '🥰'];
function openLog(d) {
  const m = Object.assign({}, dayLog(d).m || {});
  const body = `<div class="h2" style="margin-top:4px">How are you feeling?</div><div class="mood">${MOODS.map(e => `<button aria-pressed="${m.mood === e}" data-mood="${e}">${e}</button>`).join('')}</div>
    <div class="h2">Wins</div>
    <div class="frow"><input class="field wide" data-k="win" value="${esc(m.win || '')}" placeholder="One win today, big or small" enterkeyhint="next"></div>
    <div class="frow"><input class="field wide" data-k="grateful" value="${esc(m.grateful || '')}" placeholder="I’m grateful for…" enterkeyhint="done"></div>
`;
  const s = openSheet({
    title: short(d) === short(todayStr()) ? 'Today' : short(d), body,
    save: b => {
      const L = dayLog(d, true); L.m = L.m || {};
      b.querySelectorAll('[data-k]').forEach(i => {
        const k = i.dataset.k; let val = i.value.trim();
        if (val) L.m[k] = val.slice(0, 200); else delete L.m[k];
      });
      const mood = b.querySelector('[data-mood][aria-pressed="true"]'); if (mood) L.m.mood = mood.dataset.mood; else delete L.m.mood;
      save(); rerender();
      toast(L.m.win ? 'Saved. That win matters.' : 'Saved.');
    },
  });
  s.el.addEventListener('click', e => {
    const b = e.target.closest('[data-mood]'); if (!b) return;
    const on = b.getAttribute('aria-pressed') === 'true';
    s.el.querySelectorAll('[data-mood]').forEach(x => x.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', String(!on));
  });
}

// ---------- Calendar reminders (.ics) ----------
function buildIcs() {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Healthy Hannah//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  const BY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const groups = {};
  ORDER.forEach(dw => { const ids = (S.week[dw] || []).filter(id => S.routines[id]); if (ids.length) { const k = ids.join('+'); (groups[k] = groups[k] || []).push(dw); } });
  const start = dws => { const d = new Date(); const off = Math.min(...dws.map(dw => (dw - d.getDay() + 7) % 7)); d.setDate(d.getDate() + off); return ymd(d).replace(/-/g, ''); };
  const t = s => s.replace(':', '') + '00';
  const icsEsc = s => s.replace(/[\\,;]/g, m => '\\' + m).replace(/\n/g, '\\n');
  const ev = (uidk, summary, desc, dws, time, mins) => {
    lines.push('BEGIN:VEVENT', 'UID:hh-' + uidk + '@healthy-hannah', 'DTSTAMP:' + stamp,
      'DTSTART:' + start(dws) + 'T' + t(time), 'DURATION:PT' + mins + 'M',
      'RRULE:FREQ=WEEKLY;BYDAY=' + dws.map(x => BY[x]).join(','), 'SUMMARY:' + icsEsc(summary), 'DESCRIPTION:' + icsEsc(desc),
      'URL:' + location.href.split('#')[0],
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc(summary), 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT');
  };
  Object.keys(groups).forEach(k => {
    const names = k.split('+').map(id => S.routines[id].emoji + ' ' + S.routines[id].name).join(' + ');
    ev(k.replace(/\+/g, '-'), names, 'Healthy Hannah. ' + pick(AFFIRM, k), groups[k], S.settings.remindTime, 45);
  });
  ev('checkin', '🌸 Evening check-in', 'Habits, a win, and something you’re grateful for.', [0, 1, 2, 3, 4, 5, 6], S.settings.checkinTime, 10);
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
function download(name, text, type) {
  const blob = new Blob([text], { type });
  const file = typeof File !== 'undefined' ? new File([blob], name, { type }) : null;
  if (file && navigator.canShare && navigator.canShare({ files: [file] }) && type !== 'text/calendar') {
    navigator.share({ files: [file], title: name }).catch(() => {}); return;
  }
  const a = document.createElement('a');
  a.href = type === 'text/calendar' ? 'data:text/calendar;charset=utf-8,' + encodeURIComponent(text) : URL.createObjectURL(blob);
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
}

// ---------- Badge ----------
function updateBadge() {
  if (!('setAppBadge' in navigator)) return;
  try {
    if (!S.settings.badge) { navigator.clearAppBadge(); return; }
    const d = todayStr(); const left = planFor(d).filter(id => !routineProgress(d, id).full).length;
    left ? navigator.setAppBadge(left) : navigator.clearAppBadge();
  } catch (e) {}
}

// ---------- Images ----------
function resizeImage(file) {
  return new Promise((res, rej) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 1100; let { width: w, height: h } = img; const k = Math.min(1, max / Math.max(w, h));
      const c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', .8));
    };
    img.onerror = rej; img.src = url;
  });
}
function openRefs(id) {
  const r = S.routines[id];
  const wrap = document.createElement('div'); wrap.innerHTML = '<div style="padding:0 16px">' + refsHtml(id) + '</div>';
  const s = openSheet({ title: r.emoji + ' Inspiration', body: wrap, plain: true });
  hydrateImages(wrap);
  refsSheet = { id, s, wrap };
}
let refsSheet = null;
function refreshRefsSheet() {
  if (refsSheet && document.body.contains(refsSheet.wrap)) { refsSheet.wrap.innerHTML = '<div style="padding:0 16px">' + refsHtml(refsSheet.id) + '</div>'; hydrateImages(refsSheet.wrap); }
}

// ---------- Actions ----------
const actions = {
  undo() { const u = pendingUndo; pendingUndo = null; $('#toast').classList.remove('show'); u && u(); },
  back(el) { back(el.dataset.to); },
  day(el) { const d = el.dataset.d; go(d === todayStr() ? 'today' : 'today?d=' + d, { replace: true, dir: 'keep' }); },
  log(el) { openLog(el.dataset.d || todayStr()); },
  period(el) {
    const d = el.dataset.d; S.cycle = S.cycle || { starts: [] }; const snap = snapshot();
    S.cycle.starts = S.cycle.starts.filter(x => Math.abs((parse(x) - parse(d)) / 864e5) > 10).concat(d).sort();
    save(); rerender(); toast('Period start saved · ' + short(d), () => restore(snap));
  },
  togglecycle() { S.settings.cycle = !S.settings.cycle; save(); rerender(); },
  toggle(el) {
    const k = el.dataset.d + el.dataset.id; const card = el.closest('.card'); const open = !card.classList.contains('open');
    card.classList.toggle('open', open); el.setAttribute('aria-expanded', open);
    if (open) { openCards.add(k); openCards.delete('closed' + k); } else { openCards.delete(k); openCards.add('closed' + k); }
  },
  check(el) {
    const { d, id, item } = el.dataset; const L = dayLog(d, true); L.done[id] = L.done[id] || {};
    const was = routineProgress(d, id).full; const dayWas = dayProgress(d).pct >= 1;
    L.done[id][item] = !L.done[id][item]; if (!L.done[id][item]) delete L.done[id][item];
    haptic(); save();
    const nowFull = routineProgress(d, id).full;
    if (nowFull && !was) {
      openCards.delete(d + id); openCards.add('closed' + d + id);
      const dayNow = dayProgress(d).pct >= 1 && !dayWas;
      celebrate(dayNow); toast(dayNow ? pick(DAY_DONE, d) : S.routines[id].name + ' done. ' + pick(CHEERS, d + id + Date.now()));
    }
    rerender();
  },
  allsess(el) {
    const { d, id } = el.dataset; const snap = snapshot(); const L = dayLog(d, true); const dayWas = dayProgress(d).pct >= 1;
    L.done[id] = {}; S.routines[id].items.forEach(it => L.done[id][it.id] = true);
    openCards.delete(d + id); openCards.add('closed' + d + id); save(); rerender();
    const dayNow = dayProgress(d).pct >= 1 && !dayWas; celebrate(dayNow);
    toast(S.routines[id].name + ' done. ' + pick(CHEERS, d + id), () => restore(snap));
  },
  clearsess(el) {
    const { d, id } = el.dataset; const snap = snapshot(); const L = dayLog(d, true); delete L.done[id];
    openCards.add(d + id); save(); rerender(); toast(S.routines[id].name + ' reset', () => restore(snap));
  },
  addsess(el) { const { d, id } = el.dataset; const L = dayLog(d, true); L.done[id] = L.done[id] || {}; openCards.add(d + id); save(); rerender(); },
  extra(el) {
    const d = el.dataset.d; const ids = Object.keys(S.routines).filter(id => !routinesFor(d).includes(id));
    if (!ids.length) { toast('Every workout is already on today.'); return; }
    const s = openSheet({ title: 'Add a workout', plain: true, body: '<div class="rows">' + ids.map(id => `<button class="r" data-pickr="${id}"><span style="font-size:24px">${S.routines[id].emoji}</span><span class="l">${esc(S.routines[id].name)}</span></button>`).join('') + '</div>' });
    s.el.addEventListener('click', e => { const b = e.target.closest('[data-pickr]'); if (!b) return; const L = dayLog(d, true); L.done[b.dataset.pickr] = L.done[b.dataset.pickr] || {}; openCards.add(d + b.dataset.pickr); save(); s.close(); rerender(); });
  },
  habit(el) {
    const { d, id } = el.dataset; const hb = S.habits.find(h => h.id === id); const L = dayLog(d, true); L.habits = L.habits || {};
    const c = L.habits[id] || 0;
    if (c >= hb.target) { const snap = snapshot(); L.habits[id] = 0; save(); rerender(); toast(hb.name + ' cleared', () => restore(snap)); return; }
    L.habits[id] = c + 1; haptic(); save(); rerender();
    if (L.habits[id] >= hb.target) toast(hb.emoji + ' ' + hb.name + ' done. ' + pick(CHEERS, d + id));
  },
  refs(el) { openRefs(el.dataset.id); },
  bar(el) { const i = Number(el.dataset.i); picked = picked === i ? -1 : i; rerender(); },
  range(el) { range = Number(el.dataset.n); picked = -1; rerender(); },
  editday(el) {
    const dw = Number(el.dataset.dw); const sel = new Set(S.week[dw] || []);
    const body = '<div class="rows">' + Object.keys(S.routines).map(id => `<button class="r" data-pickd="${id}" role="checkbox" aria-checked="${sel.has(id)}"><span style="font-size:24px">${S.routines[id].emoji}</span><span class="l">${esc(S.routines[id].name)}</span><span class="check ${sel.has(id) ? '' : ''}"><i style="${sel.has(id) ? 'background:var(--rose);border-color:var(--rose)' : ''}">${sel.has(id) ? CHECK.replace('<svg', '<svg style="opacity:1"') : ''}</i></span></button>`).join('') + '</div><p>Leave all off for a rest day.</p>';
    const s = openSheet({ title: DAYS_LONG[dw], body, save: () => { S.week[dw] = Object.keys(S.routines).filter(id => sel.has(id)); save(); rerender(); toast(DAYS_LONG[dw] + ' updated'); } });
    s.el.addEventListener('click', e => {
      const b = e.target.closest('[data-pickd]'); if (!b) return; const id = b.dataset.pickd;
      sel.has(id) ? sel.delete(id) : sel.add(id);
      const on = sel.has(id); b.setAttribute('aria-checked', on); const i = b.querySelector('i');
      i.style.cssText = on ? 'background:var(--rose);border-color:var(--rose)' : ''; i.innerHTML = on ? CHECK.replace('<svg', '<svg style="opacity:1"') : '';
    });
  },
  newroutine() { routineForm(); },
  editroutine(el) { routineForm(el.dataset.id); },
  additem(el) {
    const r = S.routines[el.dataset.id]; r.items.push(ex('New move', '10')); save(); rerender();
    const inputs = document.querySelectorAll('.f-name'); const last = inputs[inputs.length - 1]; if (last) { last.focus(); last.select(); }
  },
  delitem(el) {
    const r = S.routines[el.dataset.id]; const snap = snapshot(); const it = r.items.find(i => i.id === el.dataset.item);
    r.items = r.items.filter(i => i.id !== el.dataset.item); save(); rerender(); toast(it.name + ' removed', () => restore(snap));
  },
  moveup(el) { const r = S.routines[el.dataset.id]; const i = r.items.findIndex(x => x.id === el.dataset.item); if (i > 0) { [r.items[i - 1], r.items[i]] = [r.items[i], r.items[i - 1]]; save(); rerender(); } },
  delroutine(el) {
    const id = el.dataset.id; const r = S.routines[id];
    confirmSheet('Delete workout', `Removes ${r.name} and its saved inspiration from the plan.`, 'Delete ' + r.name, () => {
      const snap = snapshot(); delete S.routines[id]; Object.keys(S.week).forEach(k => S.week[k] = S.week[k].filter(x => x !== id)); save();
      go('plan', { replace: true, dir: 'back' }); toast(r.name + ' deleted', () => { restore(snap); });
    });
  },
  addlink(el) {
    const id = el.dataset.id;
    openSheet({
      title: 'Add link', body: `<div class="pad"><input class="field" data-u placeholder="Paste a TikTok, YouTube or Pinterest link" inputmode="url" style="margin-bottom:10px"><input class="field" data-t placeholder="Name (optional)"></div>`,
      save: b => {
        let u = b.querySelector('[data-u]').value.trim(); const t = b.querySelector('[data-t]').value.trim();
        const m = u.match(/https?:\/\/\S+/); if (!m) { b.querySelector('[data-u]').classList.add('invalid'); return false; } u = m[0];
        let host = ''; try { host = new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return false; }
        S.routines[id].refs.push({ id: uid(), kind: 'link', title: t || host, url: u }); save(); rerender(); refreshRefsSheet(); toast('Link saved');
      },
    });
  },
  delref(el) {
    const r = S.routines[el.dataset.id]; const snap = snapshot(); const ref = r.refs.find(x => x.id === el.dataset.ref);
    r.refs = r.refs.filter(x => x.id !== el.dataset.ref); save(); rerender(); refreshRefsSheet();
    toast('Removed', () => restore(snap));
    if (ref && ref.kind === 'img') setTimeout(() => { if (!JSON.stringify(S).includes(ref.id)) idb.del(ref.id).catch(() => {}); }, 6000);
  },
  viewimg(el) {
    const { id, ref } = el.dataset;
    const s = openSheet({ title: 'Inspiration', plain: true, body: `<div style="padding:0 12px"><img data-img="${esc(ref)}" style="width:100%;border-radius:14px;display:block" alt=""></div><div class="pad" style="text-align:center"><button class="btn danger" data-act="delref" data-id="${esc(id)}" data-ref="${esc(ref)}">Remove image</button></div>` });
    hydrateImages(s.el); s.el.addEventListener('click', e => { if (e.target.closest('[data-act="delref"]')) s.close(); });
  },
  edithabit(el) {
    const id = el.dataset.id; const hb = id ? S.habits.find(h => h.id === id) : { name: '', emoji: '✨', target: 1, unit: '' };
    const body = `<div class="card" style="margin:0 16px"><div class="frow"><label>Emoji</label><input class="field" data-f="emoji" value="${esc(hb.emoji)}" style="width:70px;text-align:center"></div>
      <div class="frow"><label>Name</label><input class="field" data-f="name" value="${esc(hb.name)}" style="width:180px" placeholder="Stretch"></div>
      <div class="frow"><label>Times a day<small>1 = simple check</small></label><input class="field" data-f="target" inputmode="numeric" value="${hb.target}" style="width:70px;text-align:center"></div>
      <div class="frow"><label>Unit</label><input class="field" data-f="unit" value="${esc(hb.unit || '')}" style="width:120px" placeholder="glasses"></div></div>
      ${id ? '<div class="pad" style="text-align:center;margin-top:10px"><button class="btn danger" data-delh>Delete habit</button></div>' : ''}`;
    const s = openSheet({
      title: id ? 'Edit habit' : 'New habit', body,
      save: b => {
        const g = f => b.querySelector(`[data-f="${f}"]`).value.trim();
        if (!g('name')) { b.querySelector('[data-f="name"]').classList.add('invalid'); return false; }
        const next = { id: id || uid(), name: g('name').slice(0, 40), emoji: (g('emoji') || '✨').slice(0, 4), target: Math.max(1, Math.min(50, parseInt(g('target'), 10) || 1)), unit: g('unit').slice(0, 20) };
        if (id) Object.assign(hb, next); else S.habits.push(next); save(); rerender();
      },
    });
    const del = s.el.querySelector('[data-delh]');
    if (del) del.addEventListener('click', () => { const snap = snapshot(); S.habits = S.habits.filter(h => h.id !== id); save(); s.close(); rerender(); toast(hb.name + ' deleted', () => restore(snap)); });
  },
  theme(el) { S.settings.theme = el.dataset.t; save(); applyTheme(); rerender(); },
  toggleverse() { S.settings.verse = !S.settings.verse; save(); rerender(); },
  async togglebadge() {
    if (!S.settings.badge && typeof Notification !== 'undefined' && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch (e) {} }
    S.settings.badge = !S.settings.badge; save(); rerender();
  },
  ics() { download('healthy-hannah-reminders.ics', buildIcs(), 'text/calendar'); toast('Opening Calendar…'); },
  async export() {
    const images = await idb.all().catch(() => ({}));
    download('healthy-hannah-backup-' + todayStr() + '.json', JSON.stringify({ app: 'healthy-hannah', version: VERSION, data: S, images }), 'application/json');
  },
  reset() {
    confirmSheet('Erase all data', 'This deletes every check-off, win and saved image on this phone. It can’t be undone.', 'Erase everything', async () => {
      const imgs = await idb.all().catch(() => ({})); await Promise.all(Object.keys(imgs).map(k => idb.del(k))).catch(() => {});
      S = seed(); save(); go('today', { replace: true }); toast('Fresh start.');
    });
  },
};
function routineForm(id) {
  const r = id ? S.routines[id] : { name: '', emoji: '💪', note: '' };
  const body = `<div class="card" style="margin:0 16px"><div class="frow"><label>Emoji</label><input class="field" data-f="emoji" value="${esc(r.emoji)}" style="width:70px;text-align:center"></div>
    <div class="frow"><label>Name</label><input class="field" data-f="name" value="${esc(r.name)}" style="width:190px" placeholder="Glutes"></div>
    <div class="frow" style="display:block"><label style="display:block;margin-bottom:6px">Note</label><textarea class="field" data-f="note" rows="2" placeholder="Form cues, how you like to do it">${esc(r.note)}</textarea></div></div>`;
  openSheet({
    title: id ? 'Edit workout' : 'New workout', body,
    save: b => {
      const g = f => b.querySelector(`[data-f="${f}"]`).value.trim();
      if (!g('name')) { b.querySelector('[data-f="name"]').classList.add('invalid'); return false; }
      if (id) Object.assign(r, { name: g('name').slice(0, 40), emoji: (g('emoji') || '💪').slice(0, 4), note: g('note').slice(0, 300) });
      else { const nid = 'r' + uid(); S.routines[nid] = { name: g('name').slice(0, 40), emoji: (g('emoji') || '💪').slice(0, 4), note: g('note').slice(0, 300), items: [ex('First move', '10')], refs: [] }; save(); go('plan/r/' + nid); return; }
      save(); rerender();
    },
  });
}

// ---------- Global handlers ----------
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]');
  if (a && !a.disabled) { e.preventDefault(); const fn = actions[a.dataset.act]; fn && fn(a, e); return; }
  const tab = e.target.closest('#tabbar a');
  if (tab) {
    e.preventDefault(); const t = tab.dataset.tab;
    if (route.tab === t && !route.path.length && !Object.keys(route.q).length) { $('#app-scroll').scrollTo({ top: 0, behavior: 'smooth' }); return; }
    pushed = 0; go(t, { replace: true }); return;
  }
  const link = e.target.closest('a[href^="#"]');
  if (link && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); go(link.getAttribute('href').slice(1)); }
});
// inline edits: commit on blur / Enter
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches('input.field')) { e.preventDefault(); e.target.blur(); }
  if ((e.key === 'z' && (e.ctrlKey || e.metaKey)) && pendingUndo) { e.preventDefault(); actions.undo(); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.edit) {
    const it = S.routines[t.dataset.id].items.find(i => i.id === t.dataset.item); const v = t.value.trim();
    if (!v && t.dataset.edit === 'name') { t.value = it.name; t.classList.add('invalid'); return; }
    it[t.dataset.edit] = v.slice(0, 60); t.classList.remove('invalid'); save();
  }
  if (t.dataset.setting) {
    const k = t.dataset.setting; const v = t.value.trim();
    if (k === 'name' && !v) { t.value = S.settings.name; return; }
    S.settings[k] = v.slice(0, 30); save(); if (k !== 'name') rerender();
  }
  if (t.dataset.addimg) {
    const id = t.dataset.addimg; const files = Array.from(t.files || []);
    Promise.all(files.map(f => resizeImage(f).then(src => { const rid = 'img' + uid(); return idb.set(rid, src).then(() => S.routines[id].refs.unshift({ id: rid, kind: 'img', title: f.name })); })))
      .then(() => { save(); rerender(); refreshRefsSheet(); toast(files.length > 1 ? files.length + ' images saved' : 'Image saved'); })
      .catch(() => toast('Couldn’t save that image.'));
  }
  if (t.matches('[data-import]')) {
    const f = t.files && t.files[0]; if (!f) return;
    f.text().then(txt => {
      const j = JSON.parse(txt); if (!j || j.app !== 'healthy-hannah' || !j.data || !j.data.routines) throw new Error('bad');
      confirmSheet('Restore backup', 'Replaces everything on this phone with the backup from the file.', 'Restore backup', async () => {
        S = j.data; save(); await Promise.all(Object.entries(j.images || {}).map(([k, v]) => idb.set(k, v))).catch(() => {});
        go('today', { replace: true }); toast('Backup restored');
      });
    }).catch(() => toast('That file isn’t a Healthy Hannah backup.'));
    t.value = '';
  }
});
// select-all on focus for short fields
document.addEventListener('focusin', e => {
  const t = e.target; if (t.matches('.f-reps, [inputmode="numeric"]')) setTimeout(() => { try { t.setSelectionRange(0, t.value.length); } catch (x) { t.select(); } }, 0);
  if (t.matches('input, textarea')) [0, 120, 350, 700].forEach(ms => setTimeout(() => revealField(t), ms));
});
function revealField(el) {
  if (document.activeElement !== el) return;
  const vv = window.visualViewport; const vh = vv ? vv.height + vv.offsetTop : innerHeight;
  const r = el.getBoundingClientRect(); const sc = el.closest('.sheet-b') || $('#app-scroll');
  if (r.bottom > vh - 16) sc.scrollTop += r.bottom - vh + 16 + 72;
}
if (window.visualViewport) {
  const kb = () => { const k = Math.max(0, innerHeight - visualViewport.height - visualViewport.offsetTop); document.documentElement.style.setProperty('--kb', k + 'px'); };
  visualViewport.addEventListener('resize', kb); setInterval(kb, 400);
}

// swipe right from left 40% on pushed screens = back
let sx = null, sy = 0;
document.addEventListener('touchstart', e => {
  if (e.touches.length !== 1 || e.target.closest('input, textarea, .sheet, [data-no-swipe]')) { sx = null; return; }
  const t = e.touches[0]; if (t.clientX > innerWidth * .4) { sx = null; return; } sx = t.clientX; sy = t.clientY;
}, { passive: true });
document.addEventListener('touchend', e => {
  if (sx == null) return; const t = e.changedTouches[0]; const dx = t.clientX - sx, dy = Math.abs(t.clientY - sy); sx = null;
  if (dx > 80 && dx > 2 * dy) { const b = $('#tbLeft [data-act="back"]'); if (b) b.click(); }
}, { passive: true });
// block pinch zoom
['gesturestart', 'gesturechange'].forEach(ev => document.addEventListener(ev, e => e.preventDefault()));

function applyTheme() {
  const t = S.settings.theme; const d = document.documentElement;
  if (t === 'auto') d.removeAttribute('data-theme'); else d.setAttribute('data-theme', t);
  const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  $('meta[name="theme-color"]').setAttribute('content', dark ? '#1F1816' : '#FAF0EC');
}
// day rollover + foreground refresh
let lastDay = todayStr();
function onForeground() { if (todayStr() !== lastDay) { lastDay = todayStr(); rerender(); } updateBadge(); }
document.addEventListener('visibilitychange', () => { if (!document.hidden) onForeground(); });
addEventListener('pageshow', onForeground);

// ---------- Boot ----------
load(); applyTheme();
route = parseHash(); render(); updateBadge();
const splash = $('#splash'); const t0 = performance.timing ? performance.timing.navigationStart : 0;
setTimeout(() => { splash.classList.add('gone'); setTimeout(() => splash.remove(), 450); }, Math.max(0, 700 - (Date.now() - t0)));

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
window.__hh = { get S() { return S; }, buildIcs };
})();
