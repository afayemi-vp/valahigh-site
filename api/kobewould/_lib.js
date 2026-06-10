// Shared helpers for the hidden Keel mirror (/kobewould).
// Underscore-prefixed files are not exposed as endpoints by Vercel.
import crypto from "node:crypto";

export const COOKIE = "__kw";
const MAX_AGE_S = 30 * 24 * 3600; // 30 days

export function timingSafeEqualStr(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) {
    // still do a comparison to keep timing flat-ish
    crypto.timingSafeEqual(ab, ab);
    return false;
  }
  return crypto.timingSafeEqual(ab, bb);
}

function hmac(value, secret) {
  return crypto.createHmac("sha256", secret).update(String(value)).digest("hex");
}

export function makeCookie(secret) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_S;
  const val = `${exp}.${hmac(exp, secret)}`;
  return `${COOKIE}=${val}; Max-Age=${MAX_AGE_S}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

export function clearCookie() {
  return `${COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

export function isAuthed(req, secret) {
  if (!secret) return false;
  const raw = req.headers.cookie || "";
  const m = raw.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!m) return false;
  const [exp, sig] = m[1].split(".");
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now() / 1000) return false;
  return timingSafeEqualStr(sig, hmac(exp, secret));
}

// Snapshot blob path carries a 128-bit secret derived from the publish
// token, so the raw blob URL is unguessable even though Blob objects are
// public-by-URL. Browsers never see it — /data proxies server-side.
export function blobPrefix(publishToken) {
  const h = crypto.createHash("sha256").update(publishToken).digest("hex");
  return `kobewould-${h.slice(0, 32)}`;
}

export function env(name) {
  return process.env[name] || "";
}

export function configured() {
  return Boolean(env("KOBEWOULD_PASSWORD") && env("KOBEWOULD_SECRET") && env("KEEL_PUBLISH_TOKEN"));
}

export function sendHtml(res, status, body) {
  res.status(status);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.send(body);
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
