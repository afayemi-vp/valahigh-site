// Operator command queue — SAFE controls only (halt/resume/pass/unpass).
// These can only STOP or skip trading, never force a trade, change keys, or
// arm live. The web writes a command; the local keel polls + executes it.
//   POST + cookie         -> operator queues a safe command from the site
//   GET  + bearer token    -> keel pulls pending commands
//   POST + bearer + {done} -> keel marks a command executed
import { list, put } from "@vercel/blob";
import { blobAvailable, blobPrefix, env, isAuthed, publishToken, readBody, timingSafeEqualStr } from "./_lib.js";

const NAME = "commands.json";
const ALLOWED = new Set(["halt", "resume", "pass", "unpass"]); // SAFE only — never arm/keys

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

  if (req.method === "GET") {
    if (!bearerOk(req)) { res.status(401).json({ error: "unauthorized" }); return; }
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(await readQueue());
    return;
  }
  if (req.method === "POST") {
    const body = await readBody(req);
    const q = await readQueue();

    if (bearerOk(req) && body.done) {
      q.done = Array.from(new Set([...(q.done || []), String(body.done)])).slice(-50);
      q.pending = (q.pending || []).filter((c) => c.id !== String(body.done));
      await writeQueue(q);
      res.status(200).json({ ok: true });
      return;
    }
    if (isAuthed(req, env("KOBEWOULD_SECRET"))) {
      const action = String(body.action || "").trim().toLowerCase();
      if (!ALLOWED.has(action)) { res.status(400).json({ error: "action not allowed" }); return; }
      const id = `${action}-${Date.now()}`;
      // collapse duplicate pending of same action
      q.pending = (q.pending || []).filter((c) => c.action !== action);
      q.pending.push({ id, action, reason: String(body.reason || "from web").slice(0, 120),
                       ts: new Date().toISOString(), status: "pending" });
      await writeQueue(q);
      res.status(200).json({ ok: true, queued: action });
      return;
    }
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  res.status(405).json({ error: "method not allowed" });
}
