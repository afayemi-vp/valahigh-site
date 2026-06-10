// GET /api/kobewould/data — cookie-gated proxy to the latest snapshot blob.
// The raw blob URL (which embeds a token-derived secret path) never reaches
// the browser.
import { list } from "@vercel/blob";
import { blobPrefix, configured, env, isAuthed } from "./_lib.js";

export default async function handler(req, res) {
  if (!configured()) {
    res.status(503).json({ error: "not configured" });
    return;
  }
  if (!isAuthed(req, env("KOBEWOULD_SECRET"))) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  try {
    const { blobs } = await list({ prefix: blobPrefix(env("KEEL_PUBLISH_TOKEN")) });
    if (!blobs.length) {
      res.status(404).json({ error: "no snapshot published yet" });
      return;
    }
    blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    const r = await fetch(blobs[0].url, { cache: "no-store" });
    const snapshot = await r.json();
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.status(200).json(snapshot);
  } catch (e) {
    res.status(502).json({ error: `blob read failed: ${e.message}` });
  }
}
