// POST /api/kobewould/login — password -> signed HttpOnly cookie.
// Verifies against the user-set credential in Blob if present, else the
// bootstrap env password (KOBEWOULD_PASSWORD). Reads the raw body itself so
// it never depends on the runtime auto-parsing the form.
import { configured, envPassword, env, makeCookie, readBody, readCred, sendHtml, sleep, verifyCred } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "method not allowed" }); return; }
  if (!configured()) { res.status(503).json({ error: "not configured" }); return; }

  const body = await readBody(req);
  const supplied = String(body.password ?? body.p ?? "").trim();
  await sleep(700); // flat cost per attempt

  let ok = false;
  const cred = await readCred();
  if (cred) {
    ok = verifyCred(supplied, cred);
  } else {
    const envpw = envPassword();
    ok = Boolean(envpw) && supplied.length === envpw.length && verifyConst(supplied, envpw);
  }

  if (!ok) {
    sendHtml(res, 401,
      `<!doctype html><meta name="robots" content="noindex"><body style="background:#f4ecdd;color:#9c3a2b;font:14px ui-monospace,monospace;display:flex;align-items:center;justify-content:center;min-height:90vh"><div>nope. <a href="/kobewould" style="color:#8a2742">try again</a></div></body>`);
    return;
  }
  res.setHeader("Set-Cookie", makeCookie(env("KOBEWOULD_SECRET")));
  res.status(303);
  res.setHeader("Location", "/kobewould");
  res.send("");
}

function verifyConst(a, b) {
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
