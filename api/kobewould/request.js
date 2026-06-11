// Deconstruction request queue.
//  POST + cookie         -> operator adds a subject from the platform
//  GET + bearer token     -> keel (local) pulls pending requests
//  POST + bearer + {done} -> keel marks a subject fulfilled
// Stored as one JSON blob; the scheduled Claude task fulfills pending items.
import { list, put } from "@vercel/blob";
import { blobAvailable, blobPrefix, env, isAuthed, publishToken, readBody, timingSafeEqualStr } from "./_lib.js";

const NAME = "decon-requests.json";

async function readQueue() {
  if (!blobAvailable()) return { pending: [], done: [] };
  try {
    const { blobs } = await list({ prefix: blobPrefix(publishToken()) + "/" + NAME });
    if (!blobs.length) return { pending: [], done: [] };
    const r = await fetch(blobs[0].url, { cache: "no-store" });
    const q = await r.json();
    return { pending: q.pending || [], done: q.done || [] };
  } catch {
    return { pending: [], done: [] };
  }
}

async function writeQueue(q) {
  await put(`${blobPrefix(publishToken())}/${NAME}`, JSON.stringify(q), {
    access: "public", addRandomSuffix: false, allowOverwrite: true,
    contentType: "application/json", cacheControlMaxAge: 0,
  });
}

function bearerOk(req) {
  const a = req.headers.authorization || "";
  return a.startsWith("Bearer ") && publishToken() && timingSafeEqualStr(a.slice(7).trim(), publishToken());
}

export default async function handler(req, res) {
  if (!blobAvailable()) { res.status(503).json({ error: "storage not connected" }); return; }

  // keel pulls the queue with the publish token
  if (req.method === "GET") {
    if (!bearerOk(req)) { res.status(401).json({ error: "unauthorized" }); return; }
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(await readQueue());
    return;
  }

  if (req.method === "POST") {
    const body = await readBody(req);
    const q = await readQueue();

    // keel marks done
    if (bearerOk(req) && body.done) {
      const subj = String(body.done).trim().toLowerCase();
      q.done = Array.from(new Set([...(q.done || []), subj])).slice(-100);
      q.pending = (q.pending || []).filter((p) => p.subject !== subj);
      await writeQueue(q);
      res.status(200).json({ ok: true, pending: q.pending.length });
      return;
    }

    // operator adds a subject (cookie auth)
    if (isAuthed(req, env("KOBEWOULD_SECRET"))) {
      const subject = String(body.subject || "").trim().slice(0, 80);
      if (!subject) { res.status(400).json({ error: "empty subject" }); return; }
      if ((q.pending || []).length >= 10) {
        res.status(429).json({ error: "queue full (10 pending) — wait for the daily run to clear some" });
        return;
      }
      const key = subject.toLowerCase();
      if (!q.pending.some((p) => p.subject === key)) {
        q.pending.push({ subject: key, label: subject, ts: new Date().toISOString() });
        await writeQueue(q);
      }
      res.status(200).json({ ok: true, queued: subject, pending: q.pending.length });
      return;
    }
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  res.status(405).json({ error: "method not allowed" });
}
