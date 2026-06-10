// POST /api/kobewould/ingest — Keel pushes read-only snapshots here.
// Auth: Authorization: Bearer <KEEL_PUBLISH_TOKEN>. Storage: Vercel Blob.
import { put } from "@vercel/blob";
import { blobPrefix, env, timingSafeEqualStr } from "./_lib.js";

const MAX_BYTES = 400_000;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }
  const token = env("KEEL_PUBLISH_TOKEN");
  if (!token) {
    res.status(503).json({ error: "publish token not configured" });
    return;
  }
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ") || !timingSafeEqualStr(auth.slice(7), token)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const snapshot = req.body;
  if (!snapshot || typeof snapshot !== "object" || !snapshot.generated_at) {
    res.status(400).json({ error: "snapshot must be JSON with generated_at" });
    return;
  }
  const body = JSON.stringify(snapshot);
  if (body.length > MAX_BYTES) {
    res.status(413).json({ error: `snapshot too large (${body.length} bytes)` });
    return;
  }
  try {
    const blob = await put(`${blobPrefix(token)}/snapshot.json`, body, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    res.status(200).json({ ok: true, bytes: body.length, uploadedAt: blob.uploadedAt ?? null });
  } catch (e) {
    res.status(502).json({ error: `blob write failed: ${e.message}` });
  }
}
