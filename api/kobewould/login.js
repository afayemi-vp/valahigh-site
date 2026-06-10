// POST /api/kobewould/login — password -> signed HttpOnly cookie.
import { configured, env, makeCookie, sendHtml, sleep, timingSafeEqualStr } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }
  if (!configured()) {
    res.status(503).json({ error: "not configured" });
    return;
  }
  await sleep(800); // flat cost per attempt, success or failure
  const supplied =
    (req.body && (req.body.password ?? req.body.p)) ||
    "";
  if (!timingSafeEqualStr(supplied, env("KOBEWOULD_PASSWORD"))) {
    sendHtml(
      res,
      401,
      `<!doctype html><meta name="robots" content="noindex"><body style="background:#0d1117;color:#f85149;font:14px monospace;display:flex;align-items:center;justify-content:center;min-height:90vh"><div>nope. <a href="/kobewould" style="color:#79b8ff">try again</a></div></body>`
    );
    return;
  }
  res.setHeader("Set-Cookie", makeCookie(env("KOBEWOULD_SECRET")));
  res.status(303);
  res.setHeader("Location", "/kobewould");
  res.send("");
}
