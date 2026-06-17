// GET /api/kobewould/data — cookie-gated proxy to the latest snapshot.
// Primary: Vercel Blob (when the store is healthy). Fallback: the gist raw
// URL keel publishes to (KOBEWOULD_SNAP_URL) — free-tier safe. A short
// in-memory cache keeps storage operations far below free-tier quotas.
import { list } from "@vercel/blob";
import { blobAvailable, blobPrefix, configured, env, isAuthed } from "./_lib.js";

const CACHE_MS = 60 * 1000;
// keel publishes every 5 min; a snapshot older than this means that store has
// stopped receiving writes (e.g. a suspended Vercel Blob). A present-but-stale
// blob must NOT beat a fresh gist — that was the "snapshot 965 min old" bug.
const STALE_MS = 20 * 60 * 1000;
let _cache = { at: 0, body: null, source: "" };

function snapAgeMs(snap) {
  const ga = Date.parse(snap && snap.generated_at);
  return Number.isFinite(ga) ? Date.now() - ga : Infinity;
}

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
  // Serve the FRESHEST of {blob, gist}, never a stale store. Only fetch the
  // gist when the blob is missing or stale, so a healthy blob stays a single op.
  let blobSnap = null, gistSnap = null;
  if (blobAvailable()) {
    try { blobSnap = await fromBlob(); } catch { /* fall through to gist */ }
  }
  if (!blobSnap || snapAgeMs(blobSnap) > STALE_MS) {
    try { gistSnap = await fromGist(); } catch { /* gist unavailable */ }
  }

  let snapshot = null, source = "";
  const bAge = blobSnap ? snapAgeMs(blobSnap) : Infinity;
  const gAge = gistSnap ? snapAgeMs(gistSnap) : Infinity;
  if (gAge < bAge) { snapshot = gistSnap; source = "gist"; }
  else if (blobSnap) { snapshot = blobSnap; source = "blob"; }
  else if (gistSnap) { snapshot = gistSnap; source = "gist"; }

  if (!snapshot) {
    if (_cache.body) { res.status(200).json(_cache.body); return; }   // stale beats dead
    res.status(503).json({ error: "snapshot unavailable from blob or gist" });
    return;
  }
  // Flag controls as paused unless we're serving a FRESH blob (the write store).
  // Gist-served or stale data => degraded, so the page disables write actions.
  snapshot.storage = (source === "blob" && snapAgeMs(snapshot) <= STALE_MS) ? "ok" : "degraded";
  _cache = { at: now, body: snapshot, source };
  res.status(200).json(snapshot);
}
