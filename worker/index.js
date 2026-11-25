// Healthy Hannah API: sync + backup (D1), Web Push reminders (cron), Haiku assists.
// Static files in /public are served by Cloudflare assets; only /api/* reaches this code.
import { sendPush, vapidKeys } from './push.js';
import { encourage, movesFromImage, swapMove, planWorkout, reflect, AiError } from './ai.js';

const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY CHECK (id = 1), rev INTEGER NOT NULL, data TEXT NOT NULL, updated INTEGER NOT NULL)',
  'CREATE TABLE IF NOT EXISTS images (id TEXT PRIMARY KEY, data TEXT NOT NULL, created INTEGER NOT NULL)',
  'CREATE TABLE IF NOT EXISTS push_subs (endpoint TEXT PRIMARY KEY, p256dh TEXT NOT NULL, auth TEXT NOT NULL, tz TEXT NOT NULL, created INTEGER NOT NULL)',
  'CREATE TABLE IF NOT EXISTS sent (key TEXT PRIMARY KEY, at INTEGER NOT NULL)',
  'CREATE TABLE IF NOT EXISTS config (k TEXT PRIMARY KEY, v TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS ai_cache (key TEXT PRIMARY KEY, v TEXT NOT NULL, at INTEGER NOT NULL)',
  'CREATE TABLE IF NOT EXISTS devices (hash TEXT PRIMARY KEY, created INTEGER NOT NULL, last INTEGER NOT NULL)',
];
let schemaReady = false;
async function ensureSchema(db) {
  if (schemaReady) return;
  await db.batch(SCHEMA.map(s => db.prepare(s)));
  schemaReady = true;
}

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});
const fail = (message, status) => json({ error: message }, status);

async function sha(s) { return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))); }
const hex = u8 => [...u8].map(x => x.toString(16).padStart(2, '0')).join('');
async function sameAs(given, secret) {
  if (!given || !secret) return false;
  const [a, b] = await Promise.all([sha(given), sha(secret)]);
  let diff = 0; for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
const bearer = req => { const h = req.headers.get('Authorization') || ''; return h.startsWith('Bearer ') ? h.slice(7) : ''; };
// A device is allowed if it holds a token this server issued (auto-paired), or the optional SYNC_CODE secret.
async function authorized(req, env) {
  const given = bearer(req); if (!given) return false;
  if (await sameAs(given, env.SYNC_CODE)) return true;
  const h = hex(await sha(given));
  const row = await env.DB.prepare('SELECT hash, last FROM devices WHERE hash = ?').bind(h).first();
  if (!row) return false;
  if (Date.now() - row.last > 864e5) await env.DB.prepare('UPDATE devices SET last = ? WHERE hash = ?').bind(Date.now(), h).run();
  return true;
}
async function issueToken(env) {
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  await env.DB.prepare('INSERT INTO devices (hash, created, last) VALUES (?, ?, ?)').bind(hex(await sha(token)), Date.now(), Date.now()).run();
  return token;
}
// Only the app itself may call the API from a browser: other sites are refused.
function fromApp(req, url) {
  const o = req.headers.get('Origin'); if (o && o !== url.origin) return false;
  const site = req.headers.get('Sec-Fetch-Site'); if (site && site !== 'same-origin' && site !== 'none') return false;
  return true;
}
// Daily cap on model calls so a leaked token can't run up the bill.
const AI_PER_DAY = 60;
async function aiBudget(env) {
  const k = 'ai:' + new Date().toISOString().slice(0, 10);
  await env.DB.prepare("INSERT INTO config (k, v) VALUES (?, '1') ON CONFLICT(k) DO UPDATE SET v = CAST(v AS INTEGER) + 1").bind(k).run();
  const n = Number((await env.DB.prepare('SELECT v FROM config WHERE k = ?').bind(k).first()).v);
  if (n > AI_PER_DAY) throw new AiError('That’s plenty of assists for today. Try again tomorrow.', 429);
  await env.DB.prepare("DELETE FROM config WHERE k LIKE 'ai:%' AND k < ?").bind('ai:' + new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10)).run();
}

async function body(req, max = 4_000_000) {
  const len = Number(req.headers.get('Content-Length') || 0);
  if (len > max) throw new AiError('That’s too large.', 413);
  const text = await req.text();
  if (text.length > max) throw new AiError('That’s too large.', 413);
  try { return JSON.parse(text || '{}'); } catch { throw new AiError('That request couldn’t be read.', 400); }
}

// ---- Plan math (mirrors the app) for "skip the reminder when it's done" ----
function planFor(S, date) {
  const dow = new Date(date + 'T12:00:00Z').getUTCDay();
  const wk = (S.week || {})[dow] || []; const add = ((((S.log || {})[date]) || {}).add || []).filter(id => !wk.includes(id));
  return wk.concat(add).filter(id => S.routines && S.routines[id]);
}
function routineDone(S, date, id) {
  const r = S.routines[id]; const done = (((S.log || {})[date] || {}).done || {})[id] || {};
  return r.items.length > 0 && r.items.every(i => done[i.id]);
}
function localNow(tz) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date()).map(p => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}
const toMin = t => { const [h, m] = String(t || '').split(':').map(Number); return Number.isFinite(h) ? h * 60 + (m || 0) : null; };

async function runReminders(env, origin) {
  await ensureSchema(env.DB);
  const row = await env.DB.prepare('SELECT data FROM state WHERE id = 1').first();
  if (!row) return;
  const S = JSON.parse(row.data); const st = S.settings || {};
  const { results: subs } = await env.DB.prepare('SELECT * FROM push_subs').all();
  for (const sub of subs) {
    let now; try { now = localNow(sub.tz); } catch { now = localNow('UTC'); }
    const jobs = [];
    const wt = toMin(st.remindTime);
    if (st.pushWorkout !== false && wt != null && now.minutes >= wt && now.minutes < wt + 15) {
      const left = planFor(S, now.date).filter(id => !routineDone(S, now.date, id));
      if (left.length) jobs.push({ kind: 'workout', title: left.map(id => S.routines[id].name).join(' + '), body: 'Your plan for today is ready when you are.', url: './#today' });
    }
    const ct = toMin(st.checkinTime);
    if (st.pushCheckin !== false && ct != null && now.minutes >= ct && now.minutes < ct + 15) {
      const m = (((S.log || {})[now.date] || {}).m) || {};
      if (!m.win && !m.mood && !m.grateful) jobs.push({ kind: 'checkin', title: 'Evening check-in', body: 'One win and one thing you’re grateful for.', url: './#today' });
    }
    for (const j of jobs) {
      const key = `${sub.endpoint}|${now.date}|${j.kind}`;
      const ins = await env.DB.prepare('INSERT OR IGNORE INTO sent (key, at) VALUES (?, ?)').bind(key, Date.now()).run();
      if (!ins.meta.changes) continue; // already sent today
      const r = await sendPush(env.DB, sub, { title: j.title, body: j.body, url: j.url, tag: j.kind }, origin);
      if (r === 'gone') await env.DB.prepare('DELETE FROM push_subs WHERE endpoint = ?').bind(sub.endpoint).run();
    }
  }
  await env.DB.prepare('DELETE FROM sent WHERE at < ?').bind(Date.now() - 3 * 864e5).run();
}

async function cachedAi(env, key, fn) {
  const hit = await env.DB.prepare('SELECT v FROM ai_cache WHERE key = ?').bind(key).first();
  if (hit) return JSON.parse(hit.v);
  const v = await fn();
  await env.DB.prepare('INSERT OR REPLACE INTO ai_cache (key, v, at) VALUES (?, ?, ?)').bind(key, JSON.stringify(v), Date.now()).run();
  await env.DB.prepare('DELETE FROM ai_cache WHERE at < ?').bind(Date.now() - 30 * 864e5).run();
  return v;
}

async function api(req, env, url) {
  const p = url.pathname.replace(/\/+$/, '');
  const m = req.method;
  if (!env.DB) return p === '/api/health' ? json({ ok: true, setup: false, ai: !!env.ANTHROPIC_API_KEY }) : fail('The database isn’t connected yet.', 503);
  await ensureSchema(env.DB);
  const DB = env.DB;
  const anyDevice = async () => !!(await DB.prepare('SELECT 1 FROM devices LIMIT 1').first());
  if (p === '/api/health') return json({ ok: true, setup: true, ai: !!env.ANTHROPIC_API_KEY, open: !(await anyDevice()) });
  if (!fromApp(req, url)) return fail('Not allowed.', 403);

  // Pairing: the first device pairs itself. Later devices use a short code shown on a paired device (or the SYNC_CODE secret).
  if (p === '/api/pair' && m === 'POST') {
    const b = await body(req, 2_000); const code = String(b.code || '').trim();
    let ok = !(await anyDevice());
    if (!ok && code) ok = await sameAs(code, env.SYNC_CODE);
    if (!ok && /^\d{6}$/.test(code)) {
      const row = await DB.prepare("SELECT v FROM config WHERE k = 'paircode'").first();
      const pc = row ? JSON.parse(row.v) : null;
      if (pc && pc.exp > Date.now() && pc.tries < 5) {
        ok = await sameAs(code, pc.code);
        if (ok) await DB.prepare("DELETE FROM config WHERE k = 'paircode'").run();
        else { pc.tries++; await DB.prepare("UPDATE config SET v = ? WHERE k = 'paircode'").bind(JSON.stringify(pc)).run(); }
      }
    }
    if (!ok) return fail(code ? 'That code didn’t work. Get a fresh one from your other device.' : 'This app is already paired with another device.', 403);
    return json({ token: await issueToken(env) });
  }

  if (!(await authorized(req, env))) return fail('This device needs to be paired again.', 401);

  if (p === '/api/pair/code' && m === 'POST') {
    const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000; const code = String(n).padStart(6, '0');
    await DB.prepare("INSERT OR REPLACE INTO config (k, v) VALUES ('paircode', ?)").bind(JSON.stringify({ code, exp: Date.now() + 10 * 60_000, tries: 0 })).run();
    return json({ code, minutes: 10 });
  }

  if (p === '/api/state' && m === 'GET') {
    const row = await DB.prepare('SELECT rev, data, updated FROM state WHERE id = 1').first();
    return json(row ? { rev: row.rev, data: JSON.parse(row.data), updated: row.updated } : { rev: 0, data: null });
  }
  if (p === '/api/state' && m === 'PUT') {
    const b = await body(req, 3_000_000);
    if (!b.data || typeof b.data !== 'object' || !b.data.routines) return fail('That isn’t Healthy Hannah data.', 400);
    const row = await DB.prepare('SELECT rev, data FROM state WHERE id = 1').first();
    const rev = row ? row.rev : 0;
    if (Number(b.base) !== rev) return json({ conflict: true, rev, data: row ? JSON.parse(row.data) : null }, 409);
    const res = await DB.prepare('INSERT INTO state (id, rev, data, updated) VALUES (1, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET rev = excluded.rev, data = excluded.data, updated = excluded.updated WHERE state.rev = ?')
      .bind(rev + 1, JSON.stringify(b.data), Date.now(), rev).run();
    if (!res.meta.changes) return json({ conflict: true }, 409);
    return json({ rev: rev + 1 });
  }

  if (p === '/api/images' && m === 'GET') {
    const { results } = await DB.prepare('SELECT id FROM images').all();
    return json({ ids: results.map(r => r.id) });
  }
  const im = /^\/api\/images\/([A-Za-z0-9_-]{1,64})$/.exec(p);
  if (im) {
    const id = im[1];
    if (m === 'GET') { const r = await DB.prepare('SELECT data FROM images WHERE id = ?').bind(id).first(); return r ? json({ data: r.data }) : fail('Not found.', 404); }
    if (m === 'PUT') {
      const b = await body(req, 1_900_000);
      if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(b.data || '')) return fail('That isn’t an image.', 400);
      await DB.prepare('INSERT OR REPLACE INTO images (id, data, created) VALUES (?, ?, ?)').bind(id, b.data, Date.now()).run();
      return json({ ok: true });
    }
    if (m === 'DELETE') { await DB.prepare('DELETE FROM images WHERE id = ?').bind(id).run(); return json({ ok: true }); }
  }

  if (p === '/api/push/key' && m === 'GET') return json({ key: (await vapidKeys(DB)).pub });
  if (p === '/api/push/subscribe' && m === 'POST') {
    const b = await body(req, 10_000);
    if (!/^https:\/\//.test(b.endpoint || '') || !b.keys || !b.keys.p256dh || !b.keys.auth) return fail('That subscription isn’t valid.', 400);
    let tz = String(b.tz || 'UTC'); try { new Intl.DateTimeFormat('en', { timeZone: tz }); } catch { tz = 'UTC'; }
    await DB.batch([
      DB.prepare('INSERT OR REPLACE INTO push_subs (endpoint, p256dh, auth, tz, created) VALUES (?, ?, ?, ?, ?)').bind(b.endpoint, b.keys.p256dh, b.keys.auth, tz, Date.now()),
      DB.prepare("INSERT OR REPLACE INTO config (k, v) VALUES ('origin', ?)").bind(url.origin),
    ]);
    return json({ ok: true });
  }
  if (p === '/api/push/unsubscribe' && m === 'POST') {
    const b = await body(req, 10_000);
    await DB.prepare('DELETE FROM push_subs WHERE endpoint = ?').bind(String(b.endpoint || '')).run();
    return json({ ok: true });
  }
  if (p === '/api/push/test' && m === 'POST') {
    const b = await body(req, 10_000);
    const sub = await DB.prepare('SELECT * FROM push_subs WHERE endpoint = ?').bind(String(b.endpoint || '')).first();
    if (!sub) return fail('This device isn’t signed up for reminders.', 404);
    const r = await sendPush(DB, sub, { title: 'Healthy Hannah', body: 'Reminders are on. You’ve got this.', url: './#today', tag: 'test' }, url.origin);
    return r === 'ok' ? json({ ok: true }) : fail('The test reminder didn’t go through.', 502);
  }

  if (p === '/api/ai/encourage' && m === 'POST') {
    const b = await body(req, 60_000);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(b.date) ? b.date : 'x';
    return json(await cachedAi(env, 'enc|' + date, () => aiBudget(env).then(() => encourage(env, b.summary || {}))));
  }
  if (p === '/api/ai/reflect' && m === 'POST') {
    const b = await body(req, 60_000);
    const wk = /^\d{4}-\d{2}-\d{2}$/.test(b.week) ? b.week : 'x';
    return json(await cachedAi(env, 'ref|' + wk, () => aiBudget(env).then(() => reflect(env, b.data || {}))));
  }
  if (p === '/api/ai/moves' && m === 'POST') { const b = await body(req, 4_000_000); await aiBudget(env); return json(await movesFromImage(env, b)); }
  if (p === '/api/ai/swap' && m === 'POST') {
    const b = await body(req, 10_000);
    await aiBudget(env);
    return json(await swapMove(env, { move: String(b.move || '').slice(0, 80), reps: String(b.reps || '').slice(0, 30), routine: String(b.routine || '').slice(0, 60), reason: String(b.reason || '').slice(0, 60) }));
  }
  if (p === '/api/ai/plan' && m === 'POST') {
    const b = await body(req, 20_000);
    const request = String(b.request || '').trim().slice(0, 300);
    if (!request) return fail('Tell me what you’d like to work on.', 400);
    await aiBudget(env);
    const r = await planWorkout(env, { request, phase: b.phase ? String(b.phase).slice(0, 20) : null,
      existing: (Array.isArray(b.existing) ? b.existing : []).slice(0, 12).map(x => String(x).slice(0, 40)),
      week: b.week && typeof b.week === 'object' ? b.week : {} });
    r.days = [...new Set((r.days || []).filter(n => Number.isInteger(n) && n >= 0 && n <= 6))];
    r.moves = (r.moves || []).slice(0, 12);
    return json(r);
  }
  return fail('Not found.', 404);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(req);
    try { return await api(req, env, url); }
    catch (e) {
      if (e instanceof AiError) return fail(e.message, e.status);
      console.error(e);
      return fail('Something went wrong on our side.', 500);
    }
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil((async () => {
      if (!env.DB) return;
      await ensureSchema(env.DB);
      const o = await env.DB.prepare("SELECT v FROM config WHERE k = 'origin'").first();
      if (o) await runReminders(env, o.v);
    })());
  },
};
