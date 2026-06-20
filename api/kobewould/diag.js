// TEMPORARY diagnostic — gated by ?k=KW_DIAG. Reports WHY the snapshot read
// path is degraded without leaking any secret or book data (booleans, lengths,
// ages, http status only). Remove this file + the KW_DIAG env after debugging.
import { list } from "@vercel/blob";
import { blobAvailable, blobPrefix, env } from "./_lib.js";

function latestGistUrl(raw) {
  return raw.replace(/\/raw\/[0-9a-f]{40}\//i, "/raw/");
}
function ageMin(snap) {
  const t = Date.parse(snap && snap.generated_at);
  return Number.isFinite(t) ? Math.round((Date.now() - t) / 60000) : null;
}

export default async function handler(req, res) {
  const tok = env("KW_DIAG");
  if (!tok || req.query.k !== tok) { res.status(404).json({ error: "not found" }); return; }
  res.setHeader("Cache-Control", "no-store");

  const out = { now: new Date().toISOString() };
  const rawUrl = env("KOBEWOULD_SNAP_URL").replace(/[\u{FEFF}\u{200B}\s]/gu, "");
  out.snap = {
    set: Boolean(rawUrl), len: rawUrl.length,
    https: rawUrl.startsWith("https://"),
    isGist: rawUrl.includes("gist.githubusercontent.com"),
    shaPinned: /\/raw\/[0-9a-f]{40}\//i.test(rawUrl),
    tail: rawUrl.slice(-18),   // last chars only (e.g. "/raw/snapshot.json") — no id/secret
  };
  out.blobAvailable = blobAvailable();

  try {
    const { blobs } = await list({ prefix: blobPrefix(env("KEEL_PUBLISH_TOKEN")) });
    if (!blobs.length) { out.blob = { ok: false, err: "no blobs" }; }
    else {
      blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      const r = await fetch(blobs[0].url, { cache: "no-store" });
      out.blob = { ok: r.ok, status: r.status, ageMin: r.ok ? ageMin(await r.json()) : null };
    }
  } catch (e) { out.blob = { ok: false, err: String((e && e.message) || e).slice(0, 140) }; }

  try {
    if (!rawUrl) throw new Error("KOBEWOULD_SNAP_URL is empty");
    const u = latestGistUrl(rawUrl);
    const r = await fetch(u + (u.includes("?") ? "&" : "?") + "t=" + Math.floor(Date.now() / 60000),
      { cache: "no-store" });
    out.gist = { status: r.status, ok: r.ok, ageMin: r.ok ? ageMin(await r.json()) : null };
  } catch (e) { out.gist = { ok: false, err: String((e && e.message) || e).slice(0, 140) }; }

  res.status(200).json(out);
}
