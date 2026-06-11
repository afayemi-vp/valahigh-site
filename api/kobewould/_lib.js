// Shared helpers for the hidden Keel mirror (/kobewould).
// Underscore-prefixed files are not exposed as endpoints by Vercel.
import crypto from "node:crypto";

export const COOKIE = "__kw";
const MAX_AGE_S = 30 * 24 * 3600; // 30 days

export function env(name) {
  return process.env[name] || "";
}

export function timingSafeEqualStr(a, b) {
  // hash both sides to a fixed length first so neither content nor LENGTH
  // differences are observable through timing
  const ah = crypto.createHash("sha256").update(String(a)).digest();
  const bh = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ah, bh);
}

// ── per-IP login throttle (module scope: per warm serverless instance).
// Escalating delay, soft 429 after a burst; never a global/owner lockout. ──
const _fails = new Map(); // ip -> {n, ts}
export function loginThrottle(req) {
  const ip = String(req.headers["x-forwarded-for"] || "?").split(",")[0].trim();
  const now = Date.now();
  const rec = _fails.get(ip) || { n: 0, ts: now };
  if (now - rec.ts > 15 * 60 * 1000) { rec.n = 0; rec.ts = now; } // 15-min window
  return {
    blocked: rec.n >= 20,
    delayMs: Math.min(700 * Math.pow(2, Math.max(0, rec.n - 2)), 8000),
    fail() { rec.n += 1; rec.ts = now; _fails.set(ip, rec); },
    ok() { _fails.delete(ip); },
  };
}

// ── request body (don't rely on Vercel auto-parsing; read the raw stream) ──
export async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  const ct = (req.headers["content-type"] || "").toLowerCase();
  try {
    if (ct.includes("application/json")) return JSON.parse(raw);
  } catch { /* fall through to urlencoded */ }
  const out = {};
  for (const pair of raw.split("&")) {
    const i = pair.indexOf("=");
    if (i === -1) continue;
    out[decodeURIComponent(pair.slice(0, i))] = decodeURIComponent(pair.slice(i + 1).replace(/\+/g, " "));
  }
  return out;
}

// ── cookies (HMAC-signed, expiring) ──────────────────────────────────────
function hmac(value, secret) {
  return crypto.createHmac("sha256", secret).update(String(value)).digest("hex");
}
export function makeCookie(secret) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_S;
  return `${COOKIE}=${exp}.${hmac(exp, secret)}; Max-Age=${MAX_AGE_S}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}
export function clearCookie() {
  return `${COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`;
}
export function isAuthed(req, secret) {
  if (!secret) return false;
  const m = (req.headers.cookie || "").match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!m) return false;
  const [exp, sig] = m[1].split(".");
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  return timingSafeEqualStr(sig, hmac(exp, secret));
}

// ── password hashing (scrypt) ────────────────────────────────────────────
export function makeCred(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, 32).toString("hex");
  return { v: 1, algo: "scrypt", salt, hash, created: Math.floor(Date.now() / 1000) };
}
export function verifyCred(password, cred) {
  if (!cred || !cred.salt || !cred.hash) return false;
  const h = crypto.scryptSync(String(password), cred.salt, 32).toString("hex");
  return timingSafeEqualStr(h, cred.hash);
}

// ── blob storage (auth cred + snapshot) ──────────────────────────────────
export function blobAvailable() {
  // classic token model OR the newer connected-store binding (v2 SDK)
  return Boolean(env("BLOB_READ_WRITE_TOKEN") || env("BLOB_STORE_ID"));
}
export function publishToken() {
  return env("KEEL_PUBLISH_TOKEN").trim(); // tolerate CLI trailing newline
}
export function blobPrefix(token) {
  const h = crypto.createHash("sha256").update(String(token).trim()).digest("hex");
  return `kobewould-${h.slice(0, 32)}`;
}
const CRED_NAME = "auth-cred.json";

let _credCache = { at: 0, cred: undefined };  // 10-min cache: list() is a quota-heavy op
export async function readCred() {
  if (!blobAvailable()) return null;
  if (_credCache.cred !== undefined && Date.now() - _credCache.at < 10 * 60 * 1000) {
    return _credCache.cred;
  }
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: blobPrefix(env("KEEL_PUBLISH_TOKEN")) + "/" + CRED_NAME });
    const cred = blobs.length ? await (await fetch(blobs[0].url, { cache: "no-store" })).json() : null;
    _credCache = { at: Date.now(), cred };
    return cred;
  } catch {
    return null;   // not cached: a transient failure shouldn't stick for 10 min
  }
}
export function bustCredCache() { _credCache = { at: 0, cred: undefined }; }
export async function writeCred(cred) {
  const { put } = await import("@vercel/blob");
  await put(`${blobPrefix(env("KEEL_PUBLISH_TOKEN"))}/${CRED_NAME}`, JSON.stringify(cred), {
    access: "public", addRandomSuffix: false, allowOverwrite: true,
    contentType: "application/json", cacheControlMaxAge: 0,
  });
  bustCredCache();
}

// ── config / responses ───────────────────────────────────────────────────
export function configured() {
  // minimum to run the auth layer: a cookie-signing secret + the data token
  return Boolean(env("KOBEWOULD_SECRET") && env("KEEL_PUBLISH_TOKEN"));
}
export function setupEnabled() {
  // self-serve password setup needs writable storage + a one-time setup code
  return blobAvailable() && Boolean(env("KOBEWOULD_SETUP_CODE"));
}
export function envPassword() {
  return env("KOBEWOULD_PASSWORD").trim(); // tolerate CLI trailing newline
}

export function sendHtml(res, status, body) {
  res.status(status);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.send(body);
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
