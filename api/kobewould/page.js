// GET /kobewould (rewritten here) — login wall or the read-only Keel mirror.
import { configured, isAuthed, sendHtml, env } from "./_lib.js";

const SHELL = (inner) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>kw</title>
<style>
  :root { color-scheme: dark; }
  body { margin:0; font:14px/1.45 ui-monospace, Consolas, monospace;
         background:#0d1117; color:#d4dae3; padding:18px; max-width:980px; margin:auto; }
  h1 { font-size:18px; margin:12px 0 2px; letter-spacing:.5px; }
  .sub { color:#7d8590; font-size:12px; margin-bottom:14px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:10px; margin-bottom:16px; }
  .card { background:#161b22; border:1px solid #232a33; border-radius:8px; padding:10px 12px; }
  .card .k { color:#7d8590; font-size:11px; text-transform:uppercase; letter-spacing:.8px; }
  .card .v { font-size:19px; margin-top:2px; }
  .pos .v, .green { color:#3fb950; } .neg .v, .red { color:#f85149; }
  .badge { display:inline-block; padding:2px 8px; border-radius:10px; font-size:11px; }
  .paper { background:#1f3a5f; color:#79b8ff; } .live { background:#5a1e1e; color:#ff7b72; }
  .warn { background:#3d2e12; color:#d9a948; padding:8px 12px; border-radius:8px; margin-bottom:12px; }
  .halted { background:#5a1e1e; color:#ff7b72; padding:8px 12px; border-radius:8px; margin-bottom:12px; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th { text-align:left; color:#7d8590; font-weight:normal; border-bottom:1px solid #232a33;
       padding:4px 8px; font-size:11px; text-transform:uppercase; }
  td { padding:5px 8px; border-bottom:1px solid #1b2129; }
  section { margin-bottom:20px; }
  h2 { font-size:13px; color:#7d8590; text-transform:uppercase; letter-spacing:.8px; margin:0 0 8px; }
  canvas { width:100%; height:170px; background:#161b22; border:1px solid #232a33; border-radius:8px; }
  pre { background:#161b22; border:1px solid #232a33; border-radius:8px; padding:12px;
        white-space:pre-wrap; font-size:12.5px; max-height:380px; overflow:auto; }
  .tabs button { background:#161b22; color:#d4dae3; border:1px solid #232a33;
                 border-radius:6px; padding:4px 12px; cursor:pointer; margin-right:6px; font:inherit; }
  .tabs button.on { border-color:#2f81f7; color:#79b8ff; }
  input[type=password] { background:#161b22; border:1px solid #232a33; color:#d4dae3;
        border-radius:6px; padding:10px 12px; font:inherit; width:240px; }
  button.go { background:#1f6feb; color:#fff; border:0; border-radius:6px;
        padding:10px 16px; font:inherit; cursor:pointer; margin-left:8px; }
  .center { display:flex; min-height:70vh; align-items:center; justify-content:center; }
</style></head><body>${inner}</body></html>`;

const LOGIN = SHELL(`
<div class="center"><form method="POST" action="/api/kobewould/login">
  <h1 style="margin-bottom:14px">&gt;_</h1>
  <input type="password" name="password" autofocus autocomplete="current-password" aria-label="password">
  <button class="go" type="submit">enter</button>
</form></div>`);

const SETUP = SHELL(`<div class="center"><div>
<h1>kw — setup pending</h1>
<p class="sub">Set KOBEWOULD_PASSWORD, KOBEWOULD_SECRET and KEEL_PUBLISH_TOKEN on the
Vercel project, connect a Blob store, redeploy.</p></div></div>`);

const DASH = SHELL(`
<h1>KEEL <span id="mode" class="badge paper">…</span></h1>
<div class="sub">read-only mirror · refreshes 60s · <span id="ts">loading…</span></div>
<div id="banners"></div>
<div class="grid" id="cards"></div>
<section><h2>Equity</h2><canvas id="chart" width="940" height="170"></canvas></section>
<section><h2>Open positions</h2><table id="positions"></table></section>
<section><h2>Recent trades</h2><table id="trades"></table></section>
<section><h2>Reports</h2>
  <div class="tabs" style="margin-bottom:8px">
    <button id="tb" class="on">morning brief</button>
    <button id="tr">evening recap</button>
    <button id="tv">operator review</button>
  </div>
  <pre id="report">loading…</pre>
</section>
<script>
const $ = id => document.getElementById(id);
const fmt = (x, d=2) => x == null ? "—" : Number(x).toFixed(d);
let SNAP = null, tab = "brief";

function card(k, v, cls="") {
  return '<div class="card ' + cls + '"><div class="k">' + k + '</div><div class="v">' + v + '</div></div>';
}
function drawChart(points) {
  const c = $("chart"), ctx = c.getContext("2d");
  ctx.clearRect(0,0,c.width,c.height);
  if (!points || points.length < 2) {
    ctx.fillStyle="#7d8590"; ctx.font="13px monospace";
    ctx.fillText("equity curve appears after the first daily recaps", 20, 90);
    return;
  }
  const vals = points.map(p => p.equity);
  const min = Math.min(...vals)*0.998, max = Math.max(...vals)*1.002;
  const X = i => 40 + (c.width-60)*i/(points.length-1);
  const Y = v => 12 + (c.height-34)*(1-(v-min)/(max-min||1));
  ctx.strokeStyle="#2f81f7"; ctx.lineWidth=2; ctx.beginPath();
  points.forEach((p,i)=> i?ctx.lineTo(X(i),Y(p.equity)):ctx.moveTo(X(i),Y(p.equity)));
  ctx.stroke();
  ctx.fillStyle="#7d8590"; ctx.font="11px monospace";
  ctx.fillText(fmt(max),4,16); ctx.fillText(fmt(min),4,c.height-22);
}
function renderReport() {
  if (!SNAP) return;
  const r = SNAP.reports || {};
  const map = { brief: r.brief_md, recap: r.recap_md, review: r.review_md };
  $("report").textContent = map[tab] || "not available yet";
  $("tb").className = tab==="brief" ? "on":""; $("tr").className = tab==="recap"?"on":"";
  $("tv").className = tab==="review" ? "on":"";
}
$("tb").onclick = () => { tab="brief"; renderReport(); };
$("tr").onclick = () => { tab="recap"; renderReport(); };
$("tv").onclick = () => { tab="review"; renderReport(); };

async function refresh() {
  const res = await fetch("/api/kobewould/data", { cache: "no-store" });
  if (res.status === 401) { location.reload(); return; }
  if (res.status === 404) { $("ts").textContent = "no snapshot published yet — start keel with publish env vars set"; return; }
  if (!res.ok) { $("ts").textContent = "error " + res.status; return; }
  SNAP = await res.json();
  const b = SNAP.book || {}, r = SNAP.risk || {};
  $("mode").textContent = (SNAP.mode || "paper").toUpperCase();
  $("mode").className = "badge " + (SNAP.mode === "live" ? "live" : "paper");
  const age = (Date.now() - Date.parse(SNAP.generated_at)) / 60000;
  $("ts").textContent = "snapshot " + (age < 1 ? "just now" : fmt(age,0) + " min ago");
  let banners = "";
  if (age > 30) banners += '<div class="warn">⚠ snapshot is ' + fmt(age,0) + ' min old — keel or its publisher may be down</div>';
  if (SNAP.halted || SNAP.kill_switch) banners += '<div class="halted">⛔ HALTED — ' + (SNAP.halt_reason || "kill switch") + '</div>';
  if (SNAP.posture && SNAP.posture.note) banners += '<div class="warn">🧭 posture: ' + SNAP.posture.note + '</div>';
  $("banners").innerHTML = banners;
  $("cards").innerHTML =
    card("Equity", "$" + fmt(b.equity)) + card("Cash", "$" + fmt(b.cash)) +
    card("Day P&L", "$" + fmt(r.day_pnl), r.day_pnl >= 0 ? "pos":"neg") +
    card("Week P&L", "$" + fmt(r.week_pnl), r.week_pnl >= 0 ? "pos":"neg") +
    card("Drawdown", fmt(r.drawdown_pct,1) + "%", r.drawdown_pct > 5 ? "neg":"") +
    card("HWM", "$" + fmt(r.high_water_mark));
  const pos = Object.entries(b.positions || {});
  $("positions").innerHTML =
    "<tr><th>instrument</th><th>side</th><th>qty</th><th>entry</th><th>stop</th></tr>" +
    (pos.length ? pos.map(([k,p]) =>
      "<tr><td>"+k+"</td><td>"+p.side+"</td><td>"+p.qty+"</td><td>"+fmt(p.entry)+"</td><td>"+fmt(p.stop)+"</td></tr>").join("")
    : "<tr><td colspan=5 style='color:#7d8590'>flat — standing by is a position too</td></tr>");
  const tr = SNAP.trades || [];
  $("trades").innerHTML =
    "<tr><th>closed</th><th>inst</th><th>side</th><th>entry→exit</th><th>reason</th><th>P&L</th><th>R</th></tr>" +
    (tr.length ? tr.map(t =>
      "<tr><td>"+(t.exit_ts||"").slice(0,16)+"</td><td>"+t.instrument+"</td><td>"+t.side+
      "</td><td>"+fmt(t.entry)+"→"+fmt(t.exit)+"</td><td>"+t.reason+
      '</td><td class="'+(t.pnl>=0?"green":"red")+'">$'+fmt(t.pnl)+
      '</td><td class="'+(t.r>=0?"green":"red")+'">'+fmt(t.r)+"R</td></tr>").join("")
    : "<tr><td colspan=7 style='color:#7d8590'>no closed trades yet</td></tr>");
  drawChart(SNAP.equity_curve);
  renderReport();
}
refresh(); setInterval(refresh, 60000);
</script>`);

export default async function handler(req, res) {
  if (!configured()) return sendHtml(res, 200, SETUP);
  if (isAuthed(req, env("KOBEWOULD_SECRET"))) return sendHtml(res, 200, DASH);
  return sendHtml(res, 200, LOGIN);
}
