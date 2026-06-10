// POST /api/kobewould/setup — first-run (or reset) password setting.
// Gated by the one-time KOBEWOULD_SETUP_CODE so a stranger can't claim the
// unlisted URL's password before you do. Writes a scrypt cred to Blob.
// Doubles as "forgot password": re-enter the code, choose a new password.
import { env, envPassword, makeCookie, makeCred, readBody, sendHtml, setupEnabled, sleep, timingSafeEqualStr, writeCred } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "method not allowed" }); return; }
  if (!setupEnabled()) {
    res.status(503).json({ error: "setup disabled — connect a Blob store and set KOBEWOULD_SETUP_CODE" });
    return;
  }
  const body = await readBody(req);
  const code = String(body.code ?? "").trim();
  const password = String(body.password ?? "").trim();
  const confirm = String(body.confirm ?? "").trim();
  await sleep(700);

  const fail = (msg) => sendHtml(res, 400,
    `<!doctype html><meta name="robots" content="noindex"><body style="background:#f4ecdd;color:#9c3a2b;font:14px ui-monospace,monospace;display:flex;align-items:center;justify-content:center;min-height:90vh"><div>${msg} <a href="/kobewould" style="color:#8a2742">back</a></div></body>`);

  if (!timingSafeEqualStr(code, env("KOBEWOULD_SETUP_CODE").trim())) return fail("Wrong setup code.");
  if (password.length < 8) return fail("Password must be at least 8 characters.");
  if (password !== confirm) return fail("Passwords do not match.");

  try {
    await writeCred(makeCred(password));
  } catch (e) {
    res.status(502).json({ error: `could not save credential: ${e.message}` });
    return;
  }
  res.setHeader("Set-Cookie", makeCookie(env("KOBEWOULD_SECRET")));
  res.status(303);
  res.setHeader("Location", "/kobewould");
  res.send("");
}

// referenced to keep envPassword import meaningful for future bootstrap reset
void envPassword;
