/* Healthy Hannah — vanilla JS PWA. Data lives on the device (localStorage + IndexedDB for images). */
(function () {
'use strict';

const VERSION = '2.0.6';
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


// ---------- Line icons (no emoji) ----------
const IC = {
  wave: 'M3 10c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0',
  dumbbell: 'M6.5 7v10M3.5 9.5v5M17.5 7v10M20.5 9.5v5M6.5 12h11',
  flower: 'M12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM12 9.5C10 7 10.5 3.5 12 3c1.5.5 2 4 0 6.5zM12 14.5c2 2.5 1.5 6-0 6.5-1.5-.5-2-4 0-6.5zM9.5 12C7 14 3.5 13.5 3 12c.5-1.5 4-2 6.5 0zM14.5 12c2.5-2 6-1.5 6.5 0-.5 1.5-4 2-6.5 0z',
  lotus: 'M12 19c-4 0-8-2-9-6 3 0 6 1.5 9 6zM12 19c4 0 8-2 9-6-3 0-6 1.5-9 6zM12 19c-2.2-3-2.2-8.5 0-12 2.2 3.5 2.2 9 0 12z',
  ring: 'M12 6a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM9.5 3.5h5M12 3.5V6',
  drop: 'M12 3.5c3 4 6 7 6 10.5a6 6 0 0 1-12 0c0-3.5 3-6.5 6-10.5z',
  steps: 'M8 3.5c1.6 0 2.5 2 2.5 4s-1 4-2.5 4-2.5-2-2.5-4 .9-4 2.5-4zM6.5 14.5h3M16 8c1.6 0 2.5 2 2.5 4s-1 4-2.5 4-2.5-2-2.5-4 .9-4 2.5-4zM14.5 19h3',
  pill: 'M4 12a4 4 0 0 1 4-4h8a4 4 0 0 1 0 8H8a4 4 0 0 1-4-4zM12 8v8',
  book: 'M3 6c3-1 6-1 9 1 3-2 6-2 9-1v12c-3-1-6-1-9 1-3-2-6-2-9-1zM12 7v12',
  heart: 'M12 20s-7-4.5-9-9.2C1.6 7.4 3.8 4 7.2 4c2 0 3.5 1.1 4.8 2.7C13.3 5.1 14.8 4 16.8 4c3.4 0 5.6 3.4 4.2 6.8C19 15.5 12 20 12 20z',
  leaf: 'M5 19C5 10 10 5 19 5c0 9-5 14-14 14zM5 19l8-8',
  moon: 'M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10z',
  sprout: 'M12 20v-8M12 12c0-4-3-6.5-7-6.5 0 4 3 6.5 7 6.5zM12 14.5c0-3 2-5.5 6-5.5 0 3-2 5.5-6 5.5z',
  sun: 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4',
  spark: 'M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8z',
  run: 'M14 4.5a1.5 1.5 0 1 1 0 .1M8 20l3-5 3 2v3M7 11l3-3 4 1 2 3 3 1M11 15l1-5',
  bike: 'M6 17.5a3.5 3.5 0 1 1 0-.1M18 17.5a3.5 3.5 0 1 1 0-.1M6 17.5l4-7h5l3 7M9 7h3M10 10.5l2 7',
};
const ICON_KEYS = ['wave', 'dumbbell', 'flower', 'lotus', 'ring', 'heart', 'leaf', 'sun', 'spark', 'run', 'bike', 'drop', 'steps', 'pill', 'book', 'moon', 'sprout'];
const EMOJI_MAP = { '🌊': 'wave', '🍑': 'dumbbell', '💪': 'dumbbell', '🌸': 'flower', '🧘‍♀️': 'lotus', '💍': 'ring', '💧': 'drop', '🚶‍♀️': 'steps', '💊': 'pill', '🙏': 'book', '✨': 'spark' };
const icKey = k => (IC[k] ? k : EMOJI_MAP[k] || 'spark');
const ic = (k, cls) => `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="${IC[icKey(k)]}"/></svg>`;
const FACES = ['M8 16.5c2-2 6-2 8 0', 'M8.5 15h7', 'M8.5 14.5c2 1.3 5 1.3 7 0', 'M8 14c2 3 6 3 8 0', 'M7.5 13.5c2 4.5 7 4.5 9 0z'];
const MOOD_LABELS = ['Low', 'Okay', 'Good', 'Happy', 'Wonderful'];
const face = i => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 9.5v.5M15 9.5v.5"/><path d="${FACES[i]}"/></svg>`;
const moodIdx = m => { const old = ['😔', '😐', '🙂', '😊', '🥰'].indexOf(m); return old >= 0 ? old : (m === '' || m == null ? -1 : Number(m)); };

// ---------- Seed: her Apple Note ----------
let _id = Date.now();
const uid = () => (++_id).toString(36);
const ex = (name, reps, note) => ({ id: uid(), name, reps, note: note || '' });

function seed() {
  return {
    v: 1,
    routines: {
      mobility: {
        name: 'Mobility Movements', emoji: 'wave',
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
        name: 'Resistance', emoji: 'dumbbell',
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
        name: 'Hips + Core', emoji: 'flower',
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
        name: 'Yoga', emoji: 'lotus', note: '',
        items: [ex('Somatic flow', '12 min')],
        refs: [
          { id: uid(), kind: 'link', title: '12 minutes of somatic flow (The InspiroGrow)', url: 'https://www.pinterest.com/search/pins/?q=12%20minutes%20of%20somatic%20flow%20inspirogrow' },
        ],
      },
      ringfit: {
        name: 'Ring Fit', emoji: 'ring', note: 'Add to any day on the Plan tab.',
        items: [ex('Ring Fit session', '20 min')], refs: [],
      },
    },
    week: { 0: [], 1: ['mobility', 'resistance'], 2: ['hipscore', 'yoga'], 3: ['mobility', 'resistance'], 4: ['hipscore', 'yoga'], 5: ['mobility', 'resistance'], 6: [] },
    habits: [
      { id: 'water', name: 'Water', emoji: 'drop', target: 8, unit: 'glasses' },
      { id: 'walk', name: 'Walk outside', emoji: 'steps', target: 1 },
      { id: 'vitamins', name: 'Vitamins', emoji: 'pill', target: 1 },
      { id: 'prayer', name: 'Quiet time', emoji: 'book', target: 1 },
    ],
    log: {},
    settings: { name: 'Hannah', theme: 'auto', verse: true, cycle: false, assists: true, pushWorkout: true, pushCheckin: true, remindTime: '08:00', checkinTime: '20:00', badge: false },
  };
}

// ---------- Store ----------
let S;
function load() {
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
  if (!S || !S.routines) S = seed();
  S.settings = Object.assign(seed().settings, S.settings || {});
  S.log = S.log || {};
  normalize();
  lastCfg = cfgString();
}
function normalize() {
  S.settings = Object.assign(seed().settings, S.settings || {});
  S.log = S.log || {}; S.week = S.week || {}; S.habits = S.habits || [];
  Object.values(S.routines).forEach(r => { r.emoji = icKey(r.emoji); r.items = r.items || []; r.refs = r.refs || []; });
  S.habits.forEach(h => { h.emoji = icKey(h.emoji); });
}
let lastCfg = '';
const cfgString = () => JSON.stringify([S.routines, S.week, S.habits, S.settings, S.cycle || null]);
function localSave() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Couldn’t save on this device. Storage may be full.'); }
}
function save() {
  const cfg = cfgString(); if (cfg !== lastCfg) { S.cfgAt = Date.now(); lastCfg = cfg; }
  localSave(); updateBadge();
  if (typeof cloudOn === 'function' && cloudOn()) { cloud.dirty = true; saveCloud(); scheduleSync(); }
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
    const col = ['#E7BFB5', '#F4E6BF', '#B06F64', '#D9A79C'][i % 4]; const sz = 10 + Math.random() * 10;
    s.innerHTML = i % 2 ? `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24"><path d="${IC.heart}" fill="${col}"/></svg>` : `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="${col}"/></svg>`;
    s.style.cssText = `position:absolute;left:${x}%;bottom:18%;opacity:0`;
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
  const dn = Math.floor(parse(d).getTime() / 864e5); const [vt, vr] = VERSES[dn % VERSES.length]; const aff = AFFIRM[(dn * 5) % AFFIRM.length];
  const firstDay = Object.keys(S.log).sort()[0];
  const missedYesterday = isToday && firstDay && firstDay <= addDays(d, -1) && !dayProgress(addDays(d, -1)).rest && !showedUp(addDays(d, -1));

  let html = `<div class="today-top">
    <div class="ring" role="img" aria-label="${pct}% done"><svg viewBox="0 0 84 84"><circle class="bg" cx="42" cy="42" r="37"/><circle class="fg" cx="42" cy="42" r="37" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - p.pct)}"/></svg><div class="pct">${p.rest && !p.extraFull ? ic('leaf', 'lg') : pct + '%'}</div></div>
    <div><div class="hero" style="padding:0"><div class="eyebrow">${esc(greet)}${isToday ? ', ' + esc(S.settings.name) : ''}</div>
    <div class="big" style="font-size:24px">${p.rest && !p.extraFull ? 'Rest day' : p.pct >= 1 ? 'All done' : p.k ? `${p.n - p.k} to go` : planFor(d).map(id => S.routines[id].name).join(' + ')}</div>
    <div class="sub" style="font-size:14px" id="affLine">${esc(isToday && assistsOn() && cloud.enc && cloud.enc.date === d ? cloud.enc.line : aff)}</div></div></div></div>`;
  html += weekStrip(d);
  setTimeout(() => loadEncouragement(d), 0);
  if (S.settings.verse) html += `<div class="verse"><q>${esc(vt)}</q><cite>${esc(vr)}</cite></div>`;
  html += cycleCard(d);
  if (missedYesterday) html +=`<div class="note">${esc(MISSED)}</div>`;
  if (p.pct >= 1 && !p.rest) html += `<div class="card rest-card" style="margin-top:12px"><b>${esc(pick(DAY_DONE, d))}</b><span class="muted">Tap ＋ to note a win.</span></div>`;

  const ids = routinesFor(d);
  html += '<div class="h2">Workouts</div>';
  if (!ids.length) {
    html += `<div class="card rest-card"><b>Rest and recover</b><span class="muted">Rest is part of the plan. Feel like moving?</span>
      <div class="row-gap" style="justify-content:center;margin-top:12px">${Object.keys(S.routines).map(id => `<button class="btn soft" data-act="addsess" data-id="${id}" data-d="${d}">${ic(S.routines[id].emoji)} ${esc(S.routines[id].name)}</button>`).join('')}</div></div>`;
  }
  ids.forEach(id => html += sessionCard(d, id));
  if (ids.length) html += `<div style="text-align:center;margin-top:6px"><button class="btn quiet" data-act="extra" data-d="${d}">＋ Add a workout</button></div>`;

  html += '<div class="h2">Daily habits</div><div class="habit-grid">';
  const L = dayLog(d);
  S.habits.forEach(hb => {
    const c = (L.habits || {})[hb.id] || 0; const done = c >= hb.target;
    html += `<button class="habit ${done ? 'done' : ''}" data-act="habit" data-id="${hb.id}" data-d="${d}" aria-label="${esc(hb.name)} ${c} of ${hb.target}">
      <span class="e">${ic(hb.emoji)}</span><span class="l">${esc(hb.name)}</span><span class="c">${hb.target > 1 ? c + '/' + hb.target : done ? '✓' : ''}</span></button>`;
  });
  html += '</div>';

  const m = L.m || {};
  html += `<div class="h2">Heart</div><div class="card rows">
    <button class="r" data-act="log" data-d="${d}"><span class="l">${m.win ? esc(m.win) : 'How was today?'}<small>${m.grateful ? 'Grateful for ' + esc(m.grateful) : 'Mood, one win, one thing you’re grateful for'}</small></span>${moodIdx(m.mood) >= 0 ? '<span class="e">' + face(moodIdx(m.mood)) + '</span>' : ''}${CHEV}</button>
  </div>`;
  v.innerHTML = html;
}
// ---------- Cycle-aware tips (optional) ----------
// Cycle insights: one short line a day, rotated in order so nothing repeats within a phase.
const PHASES = {
  menstrual: { name: 'Menstrual', icon: 'moon', tips: [
    ['Your body', 'Estrogen and progesterone are at their lowest. Lower energy now is biology, not laziness.'],
    ['Movement', 'You aren’t weaker this week. Studies find strength changes across the cycle are small for most women. Go by feel.'],
    ['Comfort', 'Gentle movement and warmth often ease cramps by improving blood flow.'],
    ['Food', 'Iron lost through bleeding can add fatigue. Leafy greens, beans or red meat help, with vitamin C to absorb it.'],
    ['Sleep', 'Sleep can be lighter around your period. An earlier night is a smart training choice.'],
    ['Movement', 'Mobility and yoga days fit beautifully here. Lift if you feel good.'],
    ['Mind', 'Many women feel more inward right now. Quiet time can feel especially restoring.'],
  ], grace: [
    'Rest is not falling behind. It is part of how God made you.',
    'Showing up gently still counts as showing up.',
    'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
    'He restoreth my soul.',
    'You don’t have to earn rest.',
  ] },
  follicular: { name: 'Follicular', icon: 'sprout', tips: [
    ['Your body', 'Estrogen is rising. Many women notice energy and mood lifting this week.'],
    ['Movement', 'A great week to add a rep or a little weight on Resistance days.'],
    ['Recovery', 'Recovery often feels quicker now, so soreness may fade sooner.'],
    ['Mind', 'Motivation tends to climb. A good week to try a move from your saved inspiration.'],
    ['Food', 'Steady meals with protein help you make the most of the extra energy.'],
    ['Movement', 'Hips + Core days are a nice place to focus on slow, controlled form.'],
    ['Your body', 'Rising estrogen supports bone and muscle. Your training is building something lasting.'],
    ['Mind', 'Notice which workouts you actually enjoy. Joy keeps habits going.'],
  ], grace: [
    'His compassions are new every morning, and so is this season.',
    'Strength and honour are her clothing.',
    'Enjoy the energy as a gift, not a new standard.',
    'Whatsoever ye do, do it heartily, as to the Lord.',
    'Let today be a celebration, not a test.',
  ] },
  ovulation: { name: 'Ovulation', icon: 'flower', tips: [
    ['Your body', 'Estrogen peaks and a surge of LH releases an egg. Your body is working as designed.'],
    ['Movement', 'Some studies link this window to looser ligaments. Warm up hips and knees well.'],
    ['Movement', 'Many women feel strongest now. Enjoy your favorite strength moves with good form.'],
    ['You might notice', 'A brief twinge on one side is common around ovulation.'],
  ], grace: [
    'I will praise thee; for I am fearfully and wonderfully made.',
    'Your body is not a project. It is a gift you care for.',
    'Celebrate what your body can do today.',
  ] },
  luteal: { name: 'Luteal', icon: 'leaf', tips: [
    ['Your body', 'Progesterone warms your body slightly and nudges resting heart rate up. The same workout can honestly feel harder.'],
    ['Food', 'Your body burns a little more energy now, so hunger can rise. That’s real, not a lack of willpower.'],
    ['Movement', 'Steady, moderate effort is a great fit. Consistency beats intensity.'],
    ['Hydration', 'Higher body temperature means water matters more. Keep a glass close.'],
    ['Sleep', 'Sleep can get lighter. A cooler room and a wind-down routine help.'],
    ['You might notice', 'Water retention can push the scale up 1–2 lb or more late in this phase. It’s fluid, not fat, and it passes.'],
    ['Mind', 'As hormones drop before your period, mood can dip. It’s chemistry, not a verdict on you.'],
    ['You might notice', 'Bloating and cravings are common in the last few days. Gentle walks and fiber can help.'],
    ['Movement', 'If a lighter day is what you need, take it and still check it off.'],
    ['Food', 'Protein and complex carbs can steady energy and cravings.'],
    ['Movement', 'Mobility days feel especially good when you’re puffy or achy.'],
  ], grace: [
    'My grace is sufficient for thee: for my strength is made perfect in weakness.',
    'How you feel this week is not a measure of your worth.',
    'Be as kind to yourself as you would be to a friend.',
    'Casting all your care upon him; for he careth for you.',
    'Faithful in small things is still faithful.',
    'Let us not be weary in well doing.',
  ] },
};
function cycleInfo(d) {
  const starts = ((S.cycle || {}).starts || []).filter(s => s <= d).sort();
  if (!starts.length) return null;
  const last = starts[starts.length - 1];
  const day = Math.round((parse(d) - parse(last)) / 864e5) + 1;
  const len = cycleLen();
  if (day > len + 14) return { day, stale: true };
  const ovu = Math.max(10, len - 14); // ovulation is roughly 14 days before the next period
  const key = day <= 5 ? 'menstrual' : day < ovu - 1 ? 'follicular' : day <= ovu + 1 ? 'ovulation' : 'luteal';
  const phaseStart = key === 'menstrual' ? 1 : key === 'follicular' ? 6 : key === 'ovulation' ? ovu - 1 : ovu + 2;
  const k = day - phaseStart; const cyc = starts.length; const P = PHASES[key];
  const t = P.tips[(k + cyc * 3) % P.tips.length];
  const more = [1, 2].map(o => P.tips[(k + cyc * 3 + o) % P.tips.length]);
  return { day, key, phase: P.name, icon: P.icon, tip: t, more, grace: P.grace[(k + cyc * 2) % P.grace.length], next: len - day + 1 };
}
function cycleLen() {
  const st = ((S.cycle || {}).starts || []).slice().sort(); const gaps = [];
  for (let i = 1; i < st.length; i++) { const g = Math.round((parse(st[i]) - parse(st[i - 1])) / 864e5); if (g >= 20 && g <= 45) gaps.push(g); }
  return gaps.length ? Math.round(gaps.slice(-4).reduce((a, b) => a + b, 0) / Math.min(4, gaps.length)) : 28;
}
// Pick the first day of a period (defaults to today, any past date), and see or remove past starts.
function openPeriod(d) {
  const today = todayStr(); const starts = ((S.cycle || {}).starts || []).slice().sort().reverse();
  const body = `<div class="frow"><label for="pd">First day of your period<small>Pick the day it started, even if that was a while ago.</small></label>
    <input id="pd" type="date" class="field" style="width:160px" value="${d <= today ? d : today}" max="${today}"></div>
    <div style="padding:0 16px 16px">${starts.length ? `<div class="h2">Logged starts</div><div class="card rows">${starts.map(x => `<div class="r"><span class="l">${esc(short(x))}</span><button class="tb-btn" data-act="delperiod" data-d="${x}" aria-label="Remove ${esc(short(x))}">${ICON.x}</button></div>`).join('')}</div>` : ''}
    <p class="muted" style="font-size:13px">Two or more starts let the app learn your cycle length. Until then it assumes 28 days.</p></div>`;
  openSheet({ title: 'Period start', body, saveLabel: 'Save', save: b => {
    const v = b.querySelector('#pd').value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || v > today) { b.querySelector('#pd').classList.add('invalid'); return false; }
    S.cycle = S.cycle || { starts: [] }; const snap = snapshot();
    S.cycle.starts = S.cycle.starts.filter(x => Math.abs((parse(x) - parse(v)) / 864e5) > 10).concat(v).sort();
    save(); rerender(); toast('Period start saved · ' + short(v), () => restore(snap));
  } });
}
function cycleCard(d) {
  if (!S.settings.cycle) return '';
  const c = cycleInfo(d);
  if (!c || c.stale) return `<div class="card rows" style="margin-top:10px"><button class="r" data-act="period" data-d="${d}"><span class="e">${ic('moon')}</span><span class="l">${c ? 'Log your next period start' : 'Cycle insights'}<small>Set the first day of your last period</small></span>${CHEV}</button></div>`;
  return `<div class="card cycle" style="margin-top:10px">
    <div class="cy-h"><span class="e">${ic(c.icon)}</span><span class="l"><b>${c.phase} · day ${c.day}</b>${c.next > 0 && c.next < 8 ? `<small>Period expected in about ${c.next} day${c.next > 1 ? 's' : ''}</small>` : ''}</span>
    <button class="btn quiet" data-act="period" data-d="${d}" style="min-height:36px;font-size:14px">Period dates</button></div>
    <div class="cy-tip"><span>${esc(c.tip[0])}</span>${esc(c.tip[1])}</div>
    <div class="cy-grace">${esc(c.grace)}</div>
    <details class="cy-more"><summary>More for this phase</summary>${c.more.map(t => `<div class="cy-tip"><span>${esc(t[0])}</span>${esc(t[1])}</div>`).join('')}</details></div>`;
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
    <button class="sess-h" data-act="toggle" data-id="${id}" data-d="${d}" aria-expanded="${open}"><span class="emo">${ic(r.emoji)}</span>
    <span class="t"><b>${esc(r.name)}</b><small>${pr.full ? 'Done · ' + esc(pick(CHEERS, d + id)) : pr.k + ' of ' + pr.n}</small></span>${CHEV}</button>
    <div class="minibar"><i style="width:${pr.n ? pr.k / pr.n * 100 : 0}%"></i></div><div class="sess-body">`;
  if (r.note) h += `<div class="note" style="padding:8px 16px 4px">${esc(r.note)}</div>`;
  r.items.forEach(it => {
    h += `<button class="ex ${done[it.id] ? 'done' : ''}" data-act="check" data-id="${id}" data-item="${it.id}" data-d="${d}" role="checkbox" aria-checked="${!!done[it.id]}">
      <span class="name">${esc(it.name)}${it.note ? '<small>' + esc(it.note) + '</small>' : ''}</span><span class="reps">${esc(it.reps)}</span><span class="check"><i>${CHECK}</i></span></button>`;
  });
  h += `<div class="sess-foot"><span class="row-gap" style="gap:0"><button class="btn quiet" data-act="refs" data-id="${id}">Inspiration (${r.refs.length})</button>${assistsOn() && r.items.length ? `<button class="btn quiet" data-act="swap" data-id="${id}">Swap a move</button>` : ''}</span>
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
    h += `<button class="r" data-act="editday" data-dw="${dw}"><span class="l"><b style="font-weight:600">${DAYS_LONG[dw]}</b><small>${ids.length ? ids.map(id => esc(S.routines[id].name)).join(' · ') : 'Rest'}</small></span>${CHEV}</button>`;
  });
  h += '</div><div class="h2">Workouts</div><div class="card rows">';
  Object.keys(S.routines).forEach(id => {
    const r = S.routines[id]; const days = ORDER.filter(dw => (S.week[dw] || []).includes(id)).map(dw => DAYS[dw]);
    h += `<a class="r" href="#plan/r/${id}" data-push><span class="e">${ic(r.emoji)}</span><span class="l">${esc(r.name)}<small>${r.items.length} moves${days.length ? ' · ' + days.join(', ') : ''}${r.refs.length ? ' · ' + r.refs.length + ' saved' : ''}</small></span>${CHEV}</a>`;
  });
  h += '</div><div class="h2">Habits</div><div class="card rows">';
  S.habits.forEach(hb => { h += `<button class="r" data-act="edithabit" data-id="${hb.id}"><span class="e">${ic(hb.emoji)}</span><span class="l">${esc(hb.name)}</span><span class="v">${hb.target > 1 ? hb.target + ' ' + esc(hb.unit || '') : 'Daily'}</span>${CHEV}</button>`; });
  h += `<button class="r" data-act="edithabit"><span class="l" style="color:var(--rose);font-weight:600">＋ Add habit</span></button></div>`;
  v.innerHTML = h;
}
function renderRoutine(v, id) {
  const r = S.routines[id];
  header(r.name, backBtn('Plan', 'plan'), `<button class="tb-btn" data-act="editroutine" data-id="${id}" aria-label="Edit">${ICON.pencil}</button>`);
  let h = `<div class="hero"><div class="eyebrow">${ORDER.filter(dw => (S.week[dw] || []).includes(id)).map(dw => DAYS[dw]).join(' · ') || 'Not scheduled'}</div>
    <div class="big">${r.items.length} moves</div>${r.note ? `<div class="sub">${esc(r.note)}</div>` : ''}</div>`;
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
  h += `<div class="link-row" style="gap:4px"><label class="btn quiet" style="cursor:pointer">＋ Photo<input type="file" accept="image/*" multiple hidden data-addimg="${id}"></label><button class="btn quiet" data-act="addlink" data-id="${id}">＋ Link</button></div>${assistsOn() ? `<div class="link-row"><label class="btn quiet" style="cursor:pointer">＋ Moves from a screenshot<input type="file" accept="image/*" hidden data-aimoves="${id}"></label></div>` : ''}</div>`;
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
  setTimeout(loadReflection, 0);
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

  h += reflectionCard();
  // milestones
  const ms = [[1, 'First workout', '1'], [5, 'Workouts', '5'], [10, 'Workouts', '10'], [25, 'Workouts', '25'], [50, 'Workouts', '50'], [100, 'Workouts', '100']];
  const best = bestStreak();
  const ss = [[3, 'Day streak', '3'], [7, 'Day streak', '7'], [21, 'Day streak', '21'], [40, 'Faithful days', '40']];
  h += '<div class="h2">Milestones</div><div class="card" style="padding:12px;display:grid;grid-template-columns:repeat(5,1fr);gap:8px;text-align:center">';
  ms.map(([n, l, e]) => [total >= n, l, e]).concat(ss.map(([n, l, e]) => [best >= n, l, e])).forEach(([got, l, e]) => {
    h += `<div style="opacity:${got ? 1 : .45}"><div class="badge ${got ? 'got' : ''}">${e}</div><div style="font-size:11px;font-weight:600;color:var(--muted);line-height:1.2">${esc(l)}</div></div>`;
  });
  h += '</div>';

  // wins
  const wins = Object.keys(S.log).filter(d => S.log[d].m && (S.log[d].m.win || S.log[d].m.grateful)).sort().reverse().slice(0, 10);
  h += '<div class="h2">Wins &amp; gratitude</div><div class="card rows">';
  if (!wins.length) h += '<div class="empty"><b>No wins written yet.</b><span class="muted">Tap ＋ on Today to note one. Small ones count.</span></div>';
  wins.forEach(d => { const m = S.log[d].m; h += `<a class="r" href="#today?d=${d}" data-push><span class="l">${esc(m.win || m.grateful)}<small>${short(d)}${m.win && m.grateful ? ' · Grateful for ' + esc(m.grateful) : ''}</small></span>${moodIdx(m.mood) >= 0 ? '<span class="e">' + face(moodIdx(m.mood)) + '</span>' : ''}</a>`; });
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
  if (sub === 'sync') return renderSync(v);
  header('More');
  const perm = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
  v.innerHTML = `<div class="h2" style="margin-top:8px">Stay on track</div><div class="card rows">
    <a class="r" href="#more/reminders" data-push><span class="l">Reminders</span><span class="v">${esc(fmtTime(S.settings.remindTime))}${cloud.push ? ' · Push' : ''}</span>${CHEV}</a>
    <div class="frow"><label>Cycle insights<small>What each phase does, with grace. Postpartum and breastfeeding cycles can be irregular, so days are estimates.</small></label><button class="switch" role="switch" aria-checked="${!!S.settings.cycle}" data-act="togglecycle" aria-label="Cycle insights"></button></div>${S.settings.cycle ? `<button class="frow" data-act="period" style="width:100%;text-align:left"><label>Period dates<small>${(S.cycle && S.cycle.starts && S.cycle.starts.length) ? 'Last started ' + esc(short(S.cycle.starts.slice().sort().pop())) : 'Not set yet'}</small></label>${CHEV}</button>` : ''}</div>
  <div class="h2">You</div><div class="card">
    <div class="frow"><label for="nm">Name</label><input id="nm" class="field" value="${esc(S.settings.name)}" data-setting="name" enterkeyhint="done"></div>
    <div class="frow"><label>Daily verse<small>Scripture on Today</small></label><button class="switch" role="switch" aria-checked="${S.settings.verse}" data-act="toggleverse" aria-label="Daily verse"></button></div>
    <div class="frow" style="display:block"><label style="display:block;margin-bottom:8px">Appearance</label><div class="seg">${['auto', 'light', 'dark'].map(t => `<button aria-pressed="${S.settings.theme === t}" data-act="theme" data-t="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div></div>
  </div>
  <div class="h2">Data</div><div class="card rows">
    <a class="r" href="#more/sync" data-push><span class="l">Cloud sync<small>Backup, more devices, reminders, assists</small></span><span class="v">${cloudOn() ? 'On' : 'Off'}</span>${CHEV}</a>
    <a class="r" href="#more/backup" data-push><span class="l">Backup file<small>${cloudOn() ? 'Also backed up to the cloud' : 'Saved on this phone only'}</small></span>${CHEV}</a>
    <div class="r"><span class="l">Version</span><span class="v">${VERSION}</span></div>
    <div class="r"><span class="l">Screen</span><span class="v" style="font-size:12px">${screenInfo()}</span></div></div>
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
  ${cloud.push ? `<p class="note">Push reminders are on. They skip themselves once the day’s workouts or check-in are done. Manage them in Cloud sync.</p>` : cloudOn() ? `<p class="note">Turn on push reminders in <a href="#more/sync" style="color:var(--rose)">Cloud sync</a>. They skip themselves once you’re done.</p>` : ''}
  <div class="h2">Or use Calendar</div>
  <div class="pad" style="padding:0"><button class="btn soft block" data-act="ics">Add reminders to Calendar</button></div>
  <p class="note">Adds repeating Calendar events with alerts, named for each day’s plan, so they buzz on her iPhone and Apple Watch even when the app is closed. Tap “Add All” when Calendar opens. Re-add after changing the plan or times.</p>
  <div class="h2">Home screen badge</div><div class="card">
    <div class="frow"><label>Show workouts left<small>${canBadge ? 'Number on the app icon until today is done' : 'Available once installed on the Home Screen'}</small></label><button class="switch" role="switch" aria-checked="${!!S.settings.badge}" data-act="togglebadge" ${canBadge ? '' : 'disabled'} aria-label="Badge"></button></div></div>
  <div class="h2">Optional: open the app on a schedule</div>
  <div class="card" style="padding:4px 0 10px"><ol>
    <li>Open <b>Shortcuts</b> → <b>Automation</b> → <b>＋</b> → <b>Time of Day</b>.</li>
    <li>Pick ${esc(fmtTime(S.settings.remindTime))}, Weekly, Mon–Fri, <b>Run Immediately</b>.</li>
    <li>Action: <b>Show Notification</b> “Time to move. ${esc(pick(AFFIRM, 'n'))}”.</li></ol></div>`;
}

function renderSync(v) {
  header('Cloud sync', backBtn('More', 'more'));
  if (!cloudOn()) {
    v.innerHTML = `<p class="note" style="font-size:15px">Keep everything backed up in your own Cloudflare database, use the app on more than one device, and turn on push reminders and assists.</p>
    <div class="card"><div class="frow"><label for="syncCode">Sync code<small>The code set up on the server</small></label><input id="syncCode" class="field" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" style="width:160px" enterkeyhint="go"></div></div>
    <div class="pad" style="padding:14px 0 0"><button class="btn primary block" data-act="connect">Connect</button></div>`;
    return;
  }
  v.innerHTML = `<div class="card rows"><div class="r"><span class="l">Status<small id="syncStatus" class="${cloud.err ? 'warm' : ''}">${esc(syncStatusText())}</small></span><button class="btn quiet" data-act="syncnow">Sync now</button></div></div>
  <div class="h2">Push reminders</div><div class="card">
    <div class="frow"><label>Reminders on this phone<small>${esc(fmtTime(S.settings.remindTime))} workouts · ${esc(fmtTime(S.settings.checkinTime))} check-in. Skipped once done.</small></label><button class="switch" role="switch" aria-checked="${!!cloud.push}" data-act="togglepush" aria-label="Push reminders"></button></div>
    ${cloud.push ? `<div class="frow"><label>Workout reminder</label><button class="switch" role="switch" aria-checked="${S.settings.pushWorkout !== false}" data-act="pushkind" data-k="pushWorkout" aria-label="Workout reminder"></button></div>
    <div class="frow"><label>Evening check-in</label><button class="switch" role="switch" aria-checked="${S.settings.pushCheckin !== false}" data-act="pushkind" data-k="pushCheckin" aria-label="Evening check-in"></button></div>
    <div class="frow"><label>Send a test</label><button class="btn quiet" data-act="pushtest">Send</button></div>` : ''}
  </div><p class="note">Change the times in More → Reminders.</p>
  ${cloud.ai ? `<div class="h2">Assists</div><div class="card"><div class="frow"><label>Assists<small>A daily encouragement line, moves from screenshots, swap a move, and a weekly look back</small></label><button class="switch" role="switch" aria-checked="${S.settings.assists !== false}" data-act="toggleassists" aria-label="Assists"></button></div></div>` : ''}
  <div class="h2">Manage</div><div class="card rows"><button class="r" data-act="disconnect"><span class="l" style="color:#B5533C">Disconnect this phone<small>Stops syncing here. Your data stays on this phone and in the cloud.</small></span></button></div>`;
}
function renderBackup(v) {
  header('Backup', backBtn('More', 'more'));
  v.innerHTML = `<p class="note" style="font-size:15px">Everything lives on this phone. Save a backup now and then (Files or iCloud Drive) so nothing is lost if the app is removed.</p>
  <div class="card rows"><button class="r" data-act="export"><span class="l">Save backup file</span>${CHEV}</button>
  <label class="r" style="cursor:pointer"><span class="l">Restore from backup</span>${CHEV}<input type="file" accept="application/json,.json" hidden data-import></label></div>
  <div class="h2">Manage</div><div class="card rows"><button class="r" data-act="reset"><span class="l" style="color:#B5533C">Erase all data<small>Deletes every check-off, win and saved image on this phone</small></span></button></div>`;
}

// ---------- Log sheet ----------
function openLog(d) {
  const m = Object.assign({}, dayLog(d).m || {});
  const body = `<div class="h2" style="margin-top:4px">How are you feeling?</div><div class="mood">${FACES.map((f, i) => `<button aria-pressed="${moodIdx(m.mood) === i}" data-mood="${i}" aria-label="${MOOD_LABELS[i]}">${face(i)}</button>`).join('')}</div>
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
    const names = k.split('+').map(id => S.routines[id].name).join(' + ');
    ev(k.replace(/\+/g, '-'), names, 'Healthy Hannah. ' + pick(AFFIRM, k), groups[k], S.settings.remindTime, 45);
  });
  ev('checkin', 'Evening check-in', 'Habits, a win, and something you’re grateful for.', [0, 1, 2, 3, 4, 5, 6], S.settings.checkinTime, 10);
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
  const s = openSheet({ title: r.name, body: wrap, plain: true });
  hydrateImages(wrap);
  refsSheet = { id, s, wrap };
}
let refsSheet = null;
function refreshRefsSheet() {
  if (refsSheet && document.body.contains(refsSheet.wrap)) { refsSheet.wrap.innerHTML = '<div style="padding:0 16px">' + refsHtml(refsSheet.id) + '</div>'; hydrateImages(refsSheet.wrap); }
}


// ---------- Cloud: sync + backup, push reminders, assists ----------
const CK = 'hh.cloud';
let cloud = (() => { try { return JSON.parse(localStorage.getItem(CK)) || {}; } catch (e) { return {}; } })();
function saveCloud() { try { localStorage.setItem(CK, JSON.stringify(cloud)); } catch (e) {} }
function cloudOn() { return !!cloud.code; }
const assistsOn = () => cloudOn() && cloud.ai && S.settings.assists !== false;
class ApiError extends Error { constructor(m, s) { super(m); this.status = s; } }
async function apiCall(path, opts) {
  opts = opts || {};
  let res;
  try {
    res = await fetch('/api/' + path, {
      method: opts.method || 'GET', cache: 'no-store',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (opts.code || cloud.code || '') },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  } catch (e) { throw new ApiError(navigator.onLine === false ? 'You’re offline. Changes are saved on this phone.' : 'Couldn’t reach the server.', 0); }
  let data = null; try { data = await res.json(); } catch (e) {}
  if (!res.ok && res.status !== 409) throw new ApiError((data && data.error) || 'Couldn’t reach the server.', res.status);
  return { status: res.status, data };
}
function hasLocalData() { return Object.keys(S.log).length > 0 || (S.cfgAt || 0) > 0; }
function mergeState(a, b) {
  const out = JSON.parse(JSON.stringify((a.cfgAt || 0) >= (b.cfgAt || 0) ? a : b));
  out.log = {};
  const days = new Set(Object.keys(a.log || {}).concat(Object.keys(b.log || {})));
  days.forEach(d => {
    const x = (a.log || {})[d] || {}, y = (b.log || {})[d] || {};
    const L = { done: {}, habits: {}, m: Object.assign({}, y.m || {}, x.m || {}) };
    new Set(Object.keys(x.done || {}).concat(Object.keys(y.done || {}))).forEach(id => { L.done[id] = Object.assign({}, (y.done || {})[id], (x.done || {})[id]); });
    new Set(Object.keys(x.habits || {}).concat(Object.keys(y.habits || {}))).forEach(id => { L.habits[id] = Math.max((x.habits || {})[id] || 0, (y.habits || {})[id] || 0); });
    out.log[d] = L;
  });
  return out;
}
const userEditing = () => { const a = document.activeElement; return a && /INPUT|TEXTAREA/.test(a.tagName); };
function adopt(next) { S = next; normalize(); lastCfg = cfgString(); localSave(); updateBadge(); if (!userEditing() && !document.querySelector('.sheet')) rerender(); }
let syncing = null, syncTimer;
function scheduleSync(ms) { clearTimeout(syncTimer); syncTimer = setTimeout(() => { sync(); }, ms == null ? 1500 : ms); }
function sync() {
  if (!cloudOn()) return Promise.resolve();
  if (syncing) return syncing;
  syncing = (async () => {
    try {
      const got = (await apiCall('state')).data;
      if (got.rev > (cloud.rev || 0) && got.data) {
        adopt(cloud.dirty ? mergeState(S, got.data) : got.data);
        cloud.rev = got.rev;
      }
      if (cloud.dirty || !got.data) {
        let put = await apiCall('state', { method: 'PUT', body: { base: cloud.rev || 0, data: S } });
        if (put.status === 409) {
          const fresh = (await apiCall('state')).data;
          adopt(mergeState(S, fresh.data || S)); cloud.rev = fresh.rev;
          put = await apiCall('state', { method: 'PUT', body: { base: cloud.rev, data: S } });
          if (put.status === 409) throw new ApiError('Two devices saved at once. Tap Sync now.', 409);
        }
        cloud.rev = put.data.rev; cloud.dirty = false;
      }
      await syncImages();
      cloud.last = Date.now(); cloud.err = '';
    } catch (e) {
      cloud.err = e.message || 'Couldn’t sync.';
      if (e.status === 401) cloud.err = 'The sync code no longer matches. Enter it again.';
    }
    saveCloud(); syncing = null; refreshSyncStatus();
  })();
  return syncing;
}
async function syncImages() {
  const local = await idb.all().catch(() => ({}));
  const remote = new Set((await apiCall('images')).data.ids);
  const referenced = new Set();
  Object.values(S.routines).forEach(r => r.refs.forEach(x => { if (x.kind === 'img') referenced.add(x.id); }));
  for (const id of referenced) {
    if (local[id] && !remote.has(id)) await apiCall('images/' + id, { method: 'PUT', body: { data: local[id] } });
  }
  let pulled = 0;
  for (const id of referenced) {
    if (!local[id] && remote.has(id)) { const g = await apiCall('images/' + id); await idb.set(id, g.data.data); pulled++; }
  }
  if (pulled && !userEditing()) rerender();
}
function syncStatusText() {
  if (!cloudOn()) return 'Off';
  if (syncing) return 'Syncing…';
  if (cloud.err) return cloud.err;
  if (cloud.dirty) return 'Changes waiting to send';
  if (!cloud.last) return 'Not synced yet';
  const mins = Math.round((Date.now() - cloud.last) / 60000);
  return 'Synced ' + (mins < 1 ? 'just now' : mins < 60 ? mins + ' min ago' : short(ymd(new Date(cloud.last))));
}
function refreshSyncStatus() { const el = $('#syncStatus'); if (el) { el.textContent = syncStatusText(); el.classList.toggle('warm', !!cloud.err); } }

// Push reminders
const b64uBytes = s => { const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)); return Uint8Array.from(b, c => c.charCodeAt(0)); };
const isStandalone = () => navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
async function enablePush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || typeof Notification === 'undefined') {
    throw new Error(/iPhone|iPad/.test(navigator.userAgent) && !isStandalone() ? 'Add the app to your Home Screen first, then turn this on there.' : 'This browser can’t receive reminders.');
  }
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('Notifications are off for this app. Turn them on in iPhone Settings → Notifications.');
  const reg = await navigator.serviceWorker.ready;
  const key = (await apiCall('push/key')).data.key;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64uBytes(key) });
  const j = sub.toJSON();
  await apiCall('push/subscribe', { method: 'POST', body: { endpoint: j.endpoint, keys: j.keys, tz: Intl.DateTimeFormat().resolvedOptions().timeZone } });
  cloud.push = j.endpoint; saveCloud();
}
async function disablePush() {
  try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); if (sub) await sub.unsubscribe(); } catch (e) {}
  if (cloud.push) await apiCall('push/unsubscribe', { method: 'POST', body: { endpoint: cloud.push } }).catch(() => {});
  cloud.push = ''; saveCloud();
}

// Assists (Haiku): small, single-purpose helpers inside existing screens
function weekSummary(from, days) {
  const out = [];
  for (let i = 0; i < days; i++) {
    const d = addDays(from, i); if (d > todayStr()) break;
    const L = dayLog(d); const m = L.m || {};
    out.push({
      date: d, day: DAYS_LONG[parse(d).getDay()],
      planned: planFor(d).map(id => S.routines[id].name),
      finished: Object.keys(L.done || {}).filter(id => S.routines[id] && routineProgress(d, id).full).map(id => S.routines[id].name),
      moves_checked: dayProgress(d).k,
      habits_done: S.habits.filter(h => ((L.habits || {})[h.id] || 0) >= h.target).map(h => h.name),
      mood: moodIdx(m.mood) >= 0 ? MOOD_LABELS[moodIdx(m.mood)] : null,
      win: m.win || null, grateful: m.grateful || null,
    });
  }
  return out;
}
function screenInfo() {
  const p = document.createElement('div'); p.style.cssText = 'position:fixed;visibility:hidden;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)'; document.body.appendChild(p);
  const cs = getComputedStyle(p); const t = parseInt(cs.paddingTop), b = parseInt(cs.paddingBottom); p.remove();
  const bar = $('#tabbar').getBoundingClientRect();
  return `${screen.width}x${screen.height} · win ${innerHeight} · app ${Math.round($('#root').getBoundingClientRect().height)} · bar ${Math.round(bar.bottom)} · safe ${t}/${b}`;
}
function loadEncouragement(d) {
  if (!assistsOn() || d !== todayStr()) return;
  if (cloud.enc && cloud.enc.date === d) return;
  if (loadEncouragement.busy === d) return; loadEncouragement.busy = d;
  const c = S.settings.cycle ? cycleInfo(d) : null;
  apiCall('ai/encourage', { method: 'POST', body: { date: d, summary: { name: S.settings.name, today: { date: d, plan: planFor(d).map(id => S.routines[id].name) }, last_7_days: weekSummary(addDays(d, -7), 7), streak_days: streak(), cycle_phase: c && !c.stale ? c.phase : null } } })
    .then(r => { cloud.enc = { date: d, line: String(r.data.line || '').slice(0, 220) }; saveCloud(); const el = $('#affLine'); if (el && cloud.enc.line) el.textContent = cloud.enc.line; })
    .catch(() => {}).finally(() => { loadEncouragement.busy = null; });
}
function reflectWeek() {
  const t = todayStr(); const ws = weekStart(t);
  return parse(t).getDay() === 0 ? ws : addDays(ws, -7); // Sunday shows this week, otherwise last week
}
function loadReflection() {
  if (!assistsOn()) return;
  const wk = reflectWeek(); cloud.ref = cloud.ref || {};
  if (cloud.ref[wk] || loadReflection.busy === wk) return;
  const data = weekSummary(wk, 7);
  if (!data.some(x => x.moves_checked || x.win || x.habits_done.length)) return;
  loadReflection.busy = wk;
  apiCall('ai/reflect', { method: 'POST', body: { week: wk, data: { name: S.settings.name, week_of: wk, days: data } } })
    .then(r => { cloud.ref = { [wk]: { summary: String(r.data.summary || ''), focus: String(r.data.focus || '') } }; saveCloud(); if (route.tab === 'progress' && !document.querySelector('.sheet')) rerender(); })
    .catch(() => {}).finally(() => { loadReflection.busy = null; });
}
function reflectionCard() {
  if (!assistsOn()) return '';
  const wk = reflectWeek(); const r = (cloud.ref || {})[wk];
  if (!r) return '';
  return `<div class="h2">Your week of ${short(wk)}</div><div class="card reflect"><p>${esc(r.summary)}</p><div class="cy-tip"><span>For next week</span>${esc(r.focus)}</div></div>`;
}
function busySheet(title, text) { return openSheet({ title, plain: true, body: `<div class="empty"><div class="spinner" aria-hidden="true"></div><span class="muted">${esc(text)}</span></div>` }); }
async function movesFromScreenshot(id, file) {
  const r = S.routines[id]; let img;
  try { img = await resizeImage(file); } catch (e) { toast('Couldn’t open that image.'); return; }
  const wait = busySheet('Reading screenshot', 'Finding the moves…');
  let moves = [];
  try { moves = (await apiCall('ai/moves', { method: 'POST', body: { image: img, routine: r.name } })).data.moves || []; }
  catch (e) { wait.close(); toast(e.message); return; }
  wait.close();
  // keep the screenshot as inspiration either way
  const rid = 'img' + uid(); await idb.set(rid, img).catch(() => {}); r.refs.unshift({ id: rid, kind: 'img', title: file.name || 'Screenshot' }); save();
  if (!moves.length) { rerender(); refreshRefsSheet(); toast('No moves found. Saved it to inspiration.'); return; }
  const picked = new Set(moves.map((_, i) => i));
  const row = (mv, i) => `<button class="r" data-pickm="${i}" role="checkbox" aria-checked="true"><span class="l">${esc(mv.name)}${mv.note ? '<small>' + esc(mv.note) + '</small>' : ''}</span><span class="v">${esc(mv.reps)}</span><span class="check"><i style="background:var(--rose);border-color:var(--rose)">${CHECK.replace('<svg', '<svg style="opacity:1"')}</i></span></button>`;
  const s = openSheet({
    title: 'Add to ' + r.name, saveLabel: 'Add',
    body: `<p>Found ${moves.length} move${moves.length > 1 ? 's' : ''}. Untick any you don’t want.</p><div class="rows" style="margin:0 16px;border:1px solid var(--line);border-radius:16px;overflow:hidden">${moves.map(row).join('')}</div>`,
    save: () => {
      const add = moves.filter((_, i) => picked.has(i)).map(mv => ex(String(mv.name).slice(0, 60), String(mv.reps || '').slice(0, 30), String(mv.note || '').slice(0, 80)));
      if (!add.length) return;
      const snap = snapshot(); r.items.push(...add); save(); rerender(); refreshRefsSheet();
      toast(add.length + ' added to ' + r.name, () => restore(snap));
    },
  });
  s.el.addEventListener('click', e => {
    const b = e.target.closest('[data-pickm]'); if (!b) return; const i = Number(b.dataset.pickm);
    picked.has(i) ? picked.delete(i) : picked.add(i); const on = picked.has(i);
    b.setAttribute('aria-checked', on); const ic2 = b.querySelector('i');
    ic2.style.cssText = on ? 'background:var(--rose);border-color:var(--rose)' : ''; ic2.innerHTML = on ? CHECK.replace('<svg', '<svg style="opacity:1"') : '';
  });
}
const SWAP_REASONS = ['Sore knee', 'Low back', 'Wrists', 'No equipment', 'Low energy', 'Too hard', 'Too easy'];
function openSwap(id) {
  const r = S.routines[id]; let item = null, reason = null;
  const body = `<div class="h2" style="margin-top:4px">Which move?</div><div class="rows swap-list" style="margin:0 16px;border:1px solid var(--line);border-radius:16px;overflow:hidden">${r.items.map(it => `<button class="r" data-swapi="${it.id}" role="radio" aria-checked="false"><span class="l">${esc(it.name)}</span><span class="v">${esc(it.reps)}</span></button>`).join('')}</div>
    <div class="h2">Why swap it?</div><div class="chips-pick">${SWAP_REASONS.map(x => `<button data-swapr="${esc(x)}" aria-pressed="false">${esc(x)}</button>`).join('')}</div>
    <div class="pad"><button class="btn primary block" data-swapgo disabled>Suggest swaps</button></div><div data-swapout></div>`;
  const s = openSheet({ title: 'Swap a move', plain: true, body });
  const go = s.el.querySelector('[data-swapgo]'); const out = s.el.querySelector('[data-swapout]');
  const ready = () => { go.disabled = !(item && reason); };
  s.el.addEventListener('click', async e => {
    const bi = e.target.closest('[data-swapi]'), br = e.target.closest('[data-swapr]'), use = e.target.closest('[data-use]');
    if (bi) { item = bi.dataset.swapi; s.el.querySelectorAll('[data-swapi]').forEach(x => x.setAttribute('aria-checked', String(x === bi))); ready(); }
    if (br) { reason = br.dataset.swapr; s.el.querySelectorAll('[data-swapr]').forEach(x => x.setAttribute('aria-pressed', String(x === br))); ready(); }
    if (e.target.closest('[data-swapgo]') && item && reason) {
      const it = r.items.find(x => x.id === item); go.disabled = true; go.textContent = 'Thinking…';
      try {
        const opts = (await apiCall('ai/swap', { method: 'POST', body: { move: it.name, reps: it.reps, routine: r.name, reason } })).data.options || [];
        out.innerHTML = `<div class="h2">Try one of these</div><div class="rows" style="margin:0 16px;border:1px solid var(--line);border-radius:16px;overflow:hidden">${opts.map((o, i) => `<div class="r" style="align-items:flex-start;padding-top:10px;padding-bottom:10px"><span class="l">${esc(o.name)} <span class="muted">· ${esc(o.reps)}</span><small>${esc(o.why)}</small></span><button class="btn soft" data-use="${i}" style="min-height:40px">Use</button></div>`).join('')}</div>`;
        out._opts = opts;
      } catch (err) { toast(err.message); }
      go.disabled = false; go.textContent = 'Suggest again';
    }
    if (use) {
      const o = out._opts[Number(use.dataset.use)]; const it = r.items.find(x => x.id === item); const snap = snapshot();
      const old = it.name; it.name = String(o.name).slice(0, 60); it.reps = String(o.reps || it.reps).slice(0, 30); it.note = '';
      save(); s.close(); rerender(); toast(old + ' → ' + it.name, () => restore(snap));
    }
  });
}

// ---------- Actions ----------
const actions = {

  async connect() {
    const code = ($('#syncCode') || {}).value ? $('#syncCode').value.trim() : '';
    if (!code) { $('#syncCode').classList.add('invalid'); return; }
    const btn = $('[data-act="connect"]'); btn.disabled = true; btn.textContent = 'Connecting…';
    try {
      const health = await fetch('/api/health', { cache: 'no-store' }).then(r => r.json()).catch(() => null);
      if (!health) throw new Error('Couldn’t reach the server. Check your connection.');
      if (!health.setup) throw new Error('The server isn’t set up yet.');
      await apiCall('state', { code });
      cloud = { code, rev: 0, dirty: hasLocalData(), ai: !!health.ai }; saveCloud();
      await sync();
      if (cloud.err) throw new Error(cloud.err);
      toast('Connected. Everything is backed up.'); rerender();
    } catch (e) {
      if (!cloud.last) { cloud = {}; saveCloud(); }
      toast(e.message || 'Couldn’t connect.'); btn.disabled = false; btn.textContent = 'Connect';
    }
  },
  async syncnow() { const el = $('#syncStatus'); if (el) el.textContent = 'Syncing…'; await sync(); refreshSyncStatus(); },
  async togglepush(el) {
    el.disabled = true;
    try { if (cloud.push) { await disablePush(); toast('Push reminders off'); } else { await enablePush(); toast('Push reminders on'); } }
    catch (e) { toast(e.message); }
    rerender();
  },
  pushkind(el) { const k = el.dataset.k; S.settings[k] = S.settings[k] === false; save(); rerender(); },
  async pushtest() { try { await apiCall('push/test', { method: 'POST', body: { endpoint: cloud.push } }); toast('Test sent'); } catch (e) { toast(e.message); } },
  toggleassists() { S.settings.assists = S.settings.assists === false; save(); rerender(); },
  disconnect() {
    confirmSheet('Disconnect', 'This phone stops syncing. Your data stays here and in the cloud.', 'Disconnect this phone', async () => {
      await disablePush(); cloud = {}; saveCloud(); rerender(); toast('Disconnected');
    });
  },
  swap(el) { openSwap(el.dataset.id); },
  undo() { const u = pendingUndo; pendingUndo = null; $('#toast').classList.remove('show'); u && u(); },
  back(el) { back(el.dataset.to); },
  day(el) { const d = el.dataset.d; go(d === todayStr() ? 'today' : 'today?d=' + d, { replace: true, dir: 'keep' }); },
  log(el) { openLog(el.dataset.d || todayStr()); },
  period(el) { openPeriod(el.dataset.d || todayStr()); },
  delperiod(el) {
    const x = el.dataset.d; const snap = snapshot();
    S.cycle.starts = S.cycle.starts.filter(y => y !== x); save(); rerender();
    el.closest('.r').remove(); toast('Removed ' + short(x), () => restore(snap));
  },
  togglecycle() { S.settings.cycle = !S.settings.cycle; save(); rerender(); if (S.settings.cycle && !((S.cycle || {}).starts || []).length) openPeriod(todayStr()); },
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
    const s = openSheet({ title: 'Add a workout', plain: true, body: '<div class="rows">' + ids.map(id => `<button class="r" data-pickr="${id}"><span class="e">${ic(S.routines[id].emoji)}</span><span class="l">${esc(S.routines[id].name)}</span></button>`).join('') + '</div>' });
    s.el.addEventListener('click', e => { const b = e.target.closest('[data-pickr]'); if (!b) return; const L = dayLog(d, true); L.done[b.dataset.pickr] = L.done[b.dataset.pickr] || {}; openCards.add(d + b.dataset.pickr); save(); s.close(); rerender(); });
  },
  habit(el) {
    const { d, id } = el.dataset; const hb = S.habits.find(h => h.id === id); const L = dayLog(d, true); L.habits = L.habits || {};
    const c = L.habits[id] || 0;
    if (c >= hb.target) { const snap = snapshot(); L.habits[id] = 0; save(); rerender(); toast(hb.name + ' cleared', () => restore(snap)); return; }
    L.habits[id] = c + 1; haptic(); save(); rerender();
    if (L.habits[id] >= hb.target) toast(hb.name + ' done. ' + pick(CHEERS, d + id));
  },
  refs(el) { openRefs(el.dataset.id); },
  bar(el) { const i = Number(el.dataset.i); picked = picked === i ? -1 : i; rerender(); },
  range(el) { range = Number(el.dataset.n); picked = -1; rerender(); },
  editday(el) {
    const dw = Number(el.dataset.dw); const sel = new Set(S.week[dw] || []);
    const body = '<div class="rows">' + Object.keys(S.routines).map(id => `<button class="r" data-pickd="${id}" role="checkbox" aria-checked="${sel.has(id)}"><span class="e">${ic(S.routines[id].emoji)}</span><span class="l">${esc(S.routines[id].name)}</span><span class="check ${sel.has(id) ? '' : ''}"><i style="${sel.has(id) ? 'background:var(--rose);border-color:var(--rose)' : ''}">${sel.has(id) ? CHECK.replace('<svg', '<svg style="opacity:1"') : ''}</i></span></button>`).join('') + '</div><p>Leave all off for a rest day.</p>';
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
    const id = el.dataset.id; const hb = id ? S.habits.find(h => h.id === id) : { name: '', emoji: 'spark', target: 1, unit: '' };
    const body = `<div class="card" style="margin:0 16px">${iconPicker(hb.emoji)}
      <div class="frow"><label>Name</label><input class="field" data-f="name" value="${esc(hb.name)}" style="width:180px" placeholder="Stretch"></div>
      <div class="frow"><label>Times a day<small>1 = simple check</small></label><input class="field" data-f="target" inputmode="numeric" value="${hb.target}" style="width:70px;text-align:center"></div>
      <div class="frow"><label>Unit</label><input class="field" data-f="unit" value="${esc(hb.unit || '')}" style="width:120px" placeholder="glasses"></div></div>
      ${id ? '<div class="pad" style="text-align:center;margin-top:10px"><button class="btn danger" data-delh>Delete habit</button></div>' : ''}`;
    const s = openSheet({
      title: id ? 'Edit habit' : 'New habit', body,
      save: b => {
        const g = f => b.querySelector(`[data-f="${f}"]`).value.trim();
        if (!g('name')) { b.querySelector('[data-f="name"]').classList.add('invalid'); return false; }
        const next = { id: id || uid(), name: g('name').slice(0, 40), emoji: pickedIcon(b), target: Math.max(1, Math.min(50, parseInt(g('target'), 10) || 1)), unit: g('unit').slice(0, 20) };
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
      S = seed(); S.cfgAt = Date.now(); save(); go('today', { replace: true }); toast('Fresh start.');
    });
  },
};
function iconPicker(cur) {
  return `<div class="frow" style="display:block"><label style="display:block;margin-bottom:8px">Icon</label><div class="icon-pick" role="radiogroup" aria-label="Icon">${ICON_KEYS.map(k => `<button type="button" role="radio" aria-checked="${icKey(cur) === k}" data-icon="${k}" aria-label="${k}">${ic(k)}</button>`).join('')}</div></div>`;
}
function pickedIcon(b) { const x = b.querySelector('[data-icon][aria-checked="true"]'); return x ? x.dataset.icon : 'spark'; }
function routineForm(id) {
  const r = id ? S.routines[id] : { name: '', emoji: 'dumbbell', note: '' };
  const body = `<div class="card" style="margin:0 16px">${iconPicker(r.emoji)}
    <div class="frow"><label>Name</label><input class="field" data-f="name" value="${esc(r.name)}" style="width:190px" placeholder="Glutes"></div>
    <div class="frow" style="display:block"><label style="display:block;margin-bottom:6px">Note</label><textarea class="field" data-f="note" rows="2" placeholder="Form cues, how you like to do it">${esc(r.note)}</textarea></div></div>`;
  openSheet({
    title: id ? 'Edit workout' : 'New workout', body,
    save: b => {
      const g = f => b.querySelector(`[data-f="${f}"]`).value.trim();
      if (!g('name')) { b.querySelector('[data-f="name"]').classList.add('invalid'); return false; }
      if (id) Object.assign(r, { name: g('name').slice(0, 40), emoji: pickedIcon(b), note: g('note').slice(0, 300) });
      else { const nid = 'r' + uid(); S.routines[nid] = { name: g('name').slice(0, 40), emoji: pickedIcon(b), note: g('note').slice(0, 300), items: [ex('First move', '10')], refs: [] }; save(); go('plan/r/' + nid); return; }
      save(); rerender();
    },
  });
}

// ---------- Global handlers ----------
document.addEventListener('click', e => {
  const pk = e.target.closest('[data-icon]');
  if (pk) { pk.parentNode.querySelectorAll('[data-icon]').forEach(x => x.setAttribute('aria-checked', 'false')); pk.setAttribute('aria-checked', 'true'); return; }
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
  if (t.dataset.aimoves) { const f = t.files && t.files[0]; const id = t.dataset.aimoves; t.value = ''; if (f) movesFromScreenshot(id, f); return; }
  if (t.matches('[data-import]')) {
    const f = t.files && t.files[0]; if (!f) return;
    f.text().then(txt => {
      const j = JSON.parse(txt); if (!j || j.app !== 'healthy-hannah' || !j.data || !j.data.routines) throw new Error('bad');
      confirmSheet('Restore backup', 'Replaces everything on this phone with the backup from the file.', 'Restore backup', async () => {
        S = j.data; normalize(); S.cfgAt = Date.now(); save(); await Promise.all(Object.entries(j.images || {}).map(([k, v]) => idb.set(k, v))).catch(() => {});
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
  $('meta[name="theme-color"]').setAttribute('content', dark ? '#1F1816' : '#FFFFFF');
}
// day rollover + foreground refresh
let lastDay = todayStr();
function onForeground() { if (todayStr() !== lastDay) { lastDay = todayStr(); rerender(); } updateBadge(); if (cloudOn()) scheduleSync(300); }
addEventListener('online', () => { if (cloudOn()) scheduleSync(300); });
document.addEventListener('visibilitychange', () => { if (document.hidden && cloudOn() && cloud.dirty) sync(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) onForeground(); });
addEventListener('pageshow', onForeground);

// ---------- Boot ----------
load(); applyTheme();
route = parseHash(); render(); updateBadge();
if (cloudOn()) scheduleSync(600);
if (cloudOn()) fetch('/api/health', { cache: 'no-store' }).then(r => r.json()).then(h => { if (!!h.ai !== !!cloud.ai) { cloud.ai = !!h.ai; saveCloud(); rerender(); } }).catch(() => {});
// Splash: today's verse + encouragement, then she taps in.
(function splashIn() {
  const splash = $('#splash'); if (!splash) return;
  const d = todayStr();
  const h = new Date().getHours(); const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  // Shuffle bag, like a playlist on shuffle: every verse and encouragement plays once, in random order, before any repeats.
  const pool = AFFIRM.map((_, i) => 'a' + i).concat(S.settings.verse ? VERSES.map((_, i) => 'v' + i) : []);
  let st = {}; try { st = JSON.parse(localStorage.getItem('hh.spbag')) || {}; } catch {}
  let bag = (st.bag || []).filter(k => pool.includes(k));
  if (!bag.length) {
    bag = pool.slice();
    for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
    if (bag.length > 1 && bag[0] === st.last) bag.push(bag.shift());
  }
  const pick = bag.shift();
  // Today's personal Haiku line, when there is one, takes the first encouragement slot of the day.
  const ai = assistsOn() && cloud.enc && cloud.enc.date === d && cloud.enc.line && st.aiDay !== d;
  if (ai && pick[0] === 'a') bag.unshift(pick);
  try { localStorage.setItem('hh.spbag', JSON.stringify({ bag, last: pick, aiDay: ai && pick[0] === 'a' ? d : st.aiDay })); } catch {}
  const w = $('#spWords');
  let words;
  if (pick[0] === 'v') { const [vt, vr] = VERSES[+pick.slice(1)]; words = `<p class="sp-verse">${esc(vt)}</p><cite class="sp-ref">${esc(vr)}</cite>`; }
  else words = `<p class="sp-verse sp-enc">${esc(ai ? cloud.enc.line : AFFIRM[+pick.slice(1)])}</p>`;
  w.innerHTML = `<div class="sp-greet">${esc(greet)}, ${esc(S.settings.name)}</div>` + words;
  const go = $('#spGo');
  requestAnimationFrame(() => requestAnimationFrame(() => { w.classList.add('in'); go.classList.add('in'); go.focus({ preventScroll: true }); }));
  go.addEventListener('click', () => { splash.classList.add('gone'); setTimeout(() => splash.remove(), 450); }, { once: true });
})();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
window.__hh = { get S() { return S; }, buildIcs };
})();
