// POST /api/kobewould/change-password — change password while logged in
// (no setup code needed; the valid auth cookie proves ownership). Writes the
// new scrypt credential to Blob and refreshes the cookie.
import { blobAvailable, env, isAuthed, makeCookie, makeCred, readBody, sendHtml, sleep, writeCred } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "method not allowed" }); return; }
  if (!isAuthed(req, env("KOBEWOULD_SECRET"))) { res.status(401).json({ error: "not logged in" }); return; }
  if (!blobAvailable()) { res.status(503).json({ error: "storage not connected" }); return; }

  const body = await readBody(req);
  const password = String(body.password ?? "").trim();
  const confirm = String(body.confirm ?? "").trim();
  await sleep(500);

  const fail = (msg) => sendHtml(res, 400,
    `<!doctype html><meta name="robots" content="noindex"><body style="background:#f4ecdd;color:#9c3a2b;font:14px ui-monospace,monospace;display:flex;align-items:center;justify-content:center;min-height:90vh"><div>${msg} <a href="/kobewould?change=1" style="color:#8a2742">back</a></div></body>`);

  if (password.length < 8) return fail("Password must be at least 8 characters.");
  if (password !== confirm) return fail("Passwords do not match.");

  try {
    await writeCred(makeCred(password));
  } catch (e) {
    res.status(502).json({ error: `could not save: ${e.message}` });
    return;
  }
  res.setHeader("Set-Cookie", makeCookie(env("KOBEWOULD_SECRET"))); // refresh session
  res.status(303);
  res.setHeader("Location", "/kobewould");
  res.send("");
}
