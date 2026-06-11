// GET /api/kobewould/data — cookie-gated proxy to the latest snapshot.
// Primary: Vercel Blob (when the store is healthy). Fallback: the gist raw
// URL keel publishes to (KOBEWOULD_SNAP_URL) — free-tier safe. A short
// in-memory cache keeps storage operations far below free-tier quotas.
import { list } from "@vercel/blob";
import { blobAvailable, blobPrefix, configured, env, isAuthed } from "./_lib.js";

const CACHE_MS = 60 * 1000;
let _cache = { at: 0, body: null, source: "" };

async function fromBlob() {
  const { blobs } = await list({ prefix: blobPrefix(env("KEEL_PUBLISH_TOKEN")) });
  if (!blobs.length) throw new Error("no snapshot in blob");
  blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  const r = await fetch(blobs[0].url, { cache: "no-store" });
  if (!r.ok) throw new Error(`blob fetch ${r.status}`);
  return r.json();
}

async function fromGist() {
  // strip BOM/zero-width/whitespace — env values pasted via CLI can carry them
  const url = env("KOBEWOULD_SNAP_URL").replace(/[\u{FEFF}\u{200B}\s]/gu, "");
  if (!url) throw new Error("no fallback snapshot url configured");
  const r = await fetch(url + (url.includes("?") ? "&" : "?") + "t=" + Math.floor(Date.now() / 60000),
    { cache: "no-store" });
  if (!r.ok) throw new Error(`gist fetch ${r.status}`);
  return r.json();
}

export default async function handler(req, res) {
  if (!configured()) { res.status(503).json({ error: "not configured" }); return; }
  if (!isAuthed(req, env("KOBEWOULD_SECRET"))) { res.status(401).json({ error: "unauthorized" }); return; }

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");

  const now = Date.now();
  if (_cache.body && now - _cache.at < CACHE_MS) {
    res.status(200).json(_cache.body);
    return;
  }
  let snapshot = null, source = "";
  if (blobAvailable()) {
    try { snapshot = await fromBlob(); source = "blob"; } catch { /* fall through */ }
  }
  if (!snapshot) {
    try { snapshot = await fromGist(); source = "gist"; } catch (e) {
      if (_cache.body) { res.status(200).json(_cache.body); return; }   // stale beats dead
      res.status(503).json({ error: `snapshot unavailable: ${e.message}` });
      return;
    }
  }
  // tell the page when the write-store is down so it can flag paused controls
  snapshot.storage = source === "blob" ? "ok" : "degraded";
  _cache = { at: now, body: snapshot, source };
  res.status(200).json(snapshot);
}
