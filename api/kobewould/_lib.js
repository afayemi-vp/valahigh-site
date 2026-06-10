// Shared helpers for the hidden Keel mirror (/kobewould).
// Underscore-prefixed files are not exposed as endpoints by Vercel.
import crypto from "node:crypto";

export const COOKIE = "__kw";
const MAX_AGE_S = 30 * 24 * 3600; // 30 days

export function env(name) {
  return process.env[name] || "";
}

export function timingSafeEqualStr(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) {
    crypto.timingSafeEqual(ab, ab); // keep timing flat-ish
    return false;
  }
  return crypto.timingSafeEqual(ab, bb);
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
  return Boolean(env("BLOB_READ_WRITE_TOKEN"));
}
export function blobPrefix(publishToken) {
  const h = crypto.createHash("sha256").update(publishToken).digest("hex");
  return `kobewould-${h.slice(0, 32)}`;
}
const CRED_NAME = "auth-cred.json";

export async function readCred() {
  if (!blobAvailable()) return null;
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: blobPrefix(env("KEEL_PUBLISH_TOKEN")) + "/" + CRED_NAME });
    if (!blobs.length) return null;
    const r = await fetch(blobs[0].url, { cache: "no-store" });
    return await r.json();
  } catch {
    return null;
  }
}
export async function writeCred(cred) {
  const { put } = await import("@vercel/blob");
  await put(`${blobPrefix(env("KEEL_PUBLISH_TOKEN"))}/${CRED_NAME}`, JSON.stringify(cred), {
    access: "public", addRandomSuffix: false, allowOverwrite: true,
    contentType: "application/json", cacheControlMaxAge: 0,
  });
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
