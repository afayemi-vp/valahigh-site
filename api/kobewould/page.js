// GET /kobewould (rewritten here) — login wall or the read-only Keel terminal:
// Dashboard | Theses (learn loop) | M7A | SMB | Opportunities | Reads | Reports
import { configured, isAuthed, sendHtml, env } from "./_lib.js";

const SHELL = (inner) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>kw</title>
<style>
  :root { color-scheme: dark; }
  body { margin:0; font:14px/1.5 ui-monospace, Consolas, monospace;
         background:#0d1117; color:#d4dae3; padding:18px; max-width:1020px; margin:auto; }
  h1 { font-size:18px; margin:10px 0 2px; letter-spacing:.5px; }
  .sub { color:#7d8590; font-size:12px; margin-bottom:12px; }
  nav { display:flex; flex-wrap:wrap; gap:6px; margin:0 0 16px; }
  nav button { background:#161b22; color:#d4dae3; border:1px solid #232a33;
               border-radius:6px; padding:5px 12px; cursor:pointer; font:inherit; font-size:12.5px; }
  nav button.on { border-color:#2f81f7; color:#79b8ff; }
  .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:10px; margin-bottom:16px; }
  .card { background:#161b22; border:1px solid #232a33; border-radius:8px; padding:10px 12px; }
  .card .k { color:#7d8590; font-size:11px; text-transform:uppercase; letter-spacing:.8px; }
  .card .v { font-size:19px; margin-top:2px; }
  .pos .v, .green { color:#3fb950; } .neg .v, .red { color:#f85149; }
  .dim { color:#7d8590; }
  .badge { display:inline-block; padding:2px 8px; border-radius:10px; font-size:11px; }
  .paper { background:#1f3a5f; color:#79b8ff; } .live { background:#5a1e1e; color:#ff7b72; }
  .warn { background:#3d2e12; color:#d9a948; padding:8px 12px; border-radius:8px; margin-bottom:12px; }
  .halted { background:#5a1e1e; color:#ff7b72; padding:8px 12px; border-radius:8px; margin-bottom:12px; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th { text-align:left; color:#7d8590; font-weight:normal; border-bottom:1px solid #232a33;
       padding:4px 8px; font-size:11px; text-transform:uppercase; }
  td { padding:5px 8px; border-bottom:1px solid #1b2129; vertical-align:top; }
  section { margin-bottom:20px; }
  h2 { font-size:13px; color:#7d8590; text-transform:uppercase; letter-spacing:.8px; margin:0 0 8px; }
  canvas { width:100%; height:170px; background:#161b22; border:1px solid #232a33; border-radius:8px; }
  pre, .md { background:#161b22; border:1px solid #232a33; border-radius:8px; padding:14px;
        white-space:pre-wrap; font-size:12.5px; overflow:auto; }
  .md { white-space:normal; }
  .md h1 { font-size:16px; } .md h2 { font-size:14px; color:#d4dae3; text-transform:none;
        letter-spacing:0; margin:14px 0 6px; } .md h3 { font-size:13px; margin:10px 0 4px; }
  .md ul { margin:6px 0; padding-left:20px; } .md li { margin:3px 0; }
  .md a { color:#79b8ff; } .md p { margin:6px 0; }
  .md table { margin:8px 0; } .md code { background:#0d1117; padding:1px 5px; border-radius:4px; }
  details { margin:2px 0; } summary { cursor:pointer; }
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
<div class="sub">read-only terminal · refreshes 60s · <span id="ts">loading…</span></div>
<div id="banners"></div>
<nav id="nav"></nav>
<div id="view">loading…</div>
<script>
const $ = id => document.getElementById(id);
const fmt = (x, d=2) => x == null ? "—" : Number(x).toFixed(d);
const esc = s => String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
let SNAP = null, view = location.hash.slice(1) || "dash", reportTab = "brief";

const VIEWS = [
  ["dash","Dashboard"], ["theses","Theses"], ["m7a","M7A"], ["smb","SMB"],
  ["opps","Opportunities"], ["reads","Reads"], ["reports","Reports"]
];

// minimal markdown renderer: headers, bold/italic, links, lists, tables, hr, code
function md(src) {
  if (!src) return '<div class="dim">nothing published here yet — the weekly research task (Sundays) and daily review fill these pages.</div>';
  const lines = esc(src).split(/\\r?\\n/);
  let out = [], inUl = false, inTable = false;
  const inline = s => s
    .replace(/\\*\\*([^*]+)\\*\\*/g, "<b>$1</b>")
    .replace(/\\*([^*]+)\\*/g, "<i>$1</i>")
    .replace(/\`([^\`]+)\`/g, "<code>$1</code>")
    .replace(/\\[([^\\]]+)\\]\\((https?:[^)]+)\\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  const closeAll = () => { if (inUl) { out.push("</ul>"); inUl = false; }
                           if (inTable) { out.push("</table>"); inTable = false; } };
  for (const raw of lines) {
    const l = raw.trimEnd();
    if (/^\\s*$/.test(l)) { closeAll(); continue; }
    if (/^---+$/.test(l)) { closeAll(); out.push("<hr>"); continue; }
    let m;
    if ((m = l.match(/^(#{1,3})\\s+(.*)/))) { closeAll();
      out.push("<h" + m[1].length + ">" + inline(m[2]) + "</h" + m[1].length + ">"); continue; }
    if (/^\\|.*\\|$/.test(l)) {
      if (/^\\|[\\s:|-]+\\|$/.test(l)) continue; // separator row
      if (!inTable) { out.push("<table>"); inTable = true; }
      const cells = l.slice(1, -1).split("|").map(c => inline(c.trim()));
      out.push("<tr><td>" + cells.join("</td><td>") + "</td></tr>"); continue;
    }
    if ((m = l.match(/^\\s*[-*]\\s+(.*)/))) {
      if (inTable) { out.push("</table>"); inTable = false; }
      if (!inUl) { out.push("<ul>"); inUl = true; }
      out.push("<li>" + inline(m[1]) + "</li>"); continue;
    }
    closeAll(); out.push("<p>" + inline(l) + "</p>");
  }
  closeAll();
  return '<div class="md">' + out.join("") + "</div>";
}

function card(k, v, cls="") {
  return '<div class="card ' + cls + '"><div class="k">' + k + '</div><div class="v">' + v + '</div></div>';
}

function scanTable(rows) {
  if (!rows || !rows.length) return '<div class="dim">no scan yet — runs with the 07:00 brief or \`keel scan\`.</div>';
  return "<table><tr><th>ticker</th><th>regime</th><th>conf</th><th>ADX</th><th>ext (ATR)</th><th>&gt;EMA50</th><th>3m %</th><th>RS vs bench</th></tr>" +
    rows.map(r => r.error
      ? "<tr><td>" + esc(r.ticker) + '</td><td colspan="7" class="dim">' + esc(r.error) + "</td></tr>"
      : "<tr><td>" + esc(r.ticker) + "</td><td>" + esc(r.regime) + "</td><td>" + fmt(r.regime_conf) +
        "</td><td>" + fmt(r.adx,1) + "</td><td>" + fmt(r.ext_atr) + "</td><td>" + (r.above_ema50 ? "Y" : "N") +
        '</td><td class="' + (r.ret_3m_pct >= 0 ? "green":"red") + '">' + fmt(r.ret_3m_pct,1) +
        '</td><td class="' + (r.rs_3m_pct >= 0 ? "green":"red") + '">' + fmt(r.rs_3m_pct,1) + "</td></tr>"
    ).join("") + "</table>";
}

function renderDash() {
  const b = SNAP.book || {}, r = SNAP.risk || {};
  const pos = Object.entries(b.positions || {});
  const tr = SNAP.trades || [];
  return '<div class="grid">' +
    card("Equity", "$" + fmt(b.equity)) + card("Cash", "$" + fmt(b.cash)) +
    card("Day P&L", "$" + fmt(r.day_pnl), r.day_pnl >= 0 ? "pos":"neg") +
    card("Week P&L", "$" + fmt(r.week_pnl), r.week_pnl >= 0 ? "pos":"neg") +
    card("Drawdown", fmt(r.drawdown_pct,1) + "%", r.drawdown_pct > 5 ? "neg":"") +
    card("HWM", "$" + fmt(r.high_water_mark)) + "</div>" +
    '<section><h2>Equity</h2><canvas id="chart" width="980" height="170"></canvas></section>' +
    "<section><h2>Open positions</h2><table>" +
    "<tr><th>instrument</th><th>side</th><th>qty</th><th>entry</th><th>stop</th></tr>" +
    (pos.length ? pos.map(([k,p]) =>
      "<tr><td>"+esc(k)+"</td><td>"+esc(p.side)+"</td><td>"+p.qty+"</td><td>"+fmt(p.entry)+"</td><td>"+fmt(p.stop)+"</td></tr>").join("")
    : '<tr><td colspan="5" class="dim">flat — standing by is a position too</td></tr>') + "</table></section>" +
    "<section><h2>Recent trades</h2><table>" +
    "<tr><th>closed</th><th>inst</th><th>side</th><th>entry→exit</th><th>reason</th><th>P&L</th><th>R</th></tr>" +
    (tr.length ? tr.map(t =>
      "<tr><td>"+esc((t.exit_ts||"").slice(0,16))+"</td><td>"+esc(t.instrument)+"</td><td>"+esc(t.side)+
      "</td><td>"+fmt(t.entry)+"→"+fmt(t.exit)+"</td><td>"+esc(t.reason)+
      '</td><td class="'+(t.pnl>=0?"green":"red")+'">$'+fmt(t.pnl)+
      '</td><td class="'+(t.r>=0?"green":"red")+'">'+fmt(t.r)+"R</td></tr>").join("")
    : '<tr><td colspan="7" class="dim">no closed trades yet</td></tr>') + "</table></section>";
}

function renderTheses() {
  const th = SNAP.theses || [];
  if (!th.length) return '<div class="dim">no theses journaled yet — every setup the research engine emits will appear here with its risk verdict and outcome.</div>';
  return "<section><h2>Thesis review — the learn loop</h2><table>" +
    "<tr><th>when</th><th>inst</th><th>side</th><th>q</th><th>regime</th><th>risk</th><th>outcome</th><th></th></tr>" +
    th.map(t => {
      const verdict = t.risk_approved === null ? '<span class="dim">—</span>'
        : t.risk_approved ? '<span class="green">approved</span>'
        : '<span class="red">vetoed</span>';
      const oc = t.outcome
        ? '<span class="' + (t.outcome.pnl >= 0 ? "green":"red") + '">' + fmt(t.outcome.r) + "R (" + esc(t.outcome.exit_reason) + ")</span>"
        : '<span class="dim">open/none</span>';
      const detail = "rationale:\\n- " + (t.rationale||[]).join("\\n- ") +
        "\\n\\ninvalidation: " + (t.invalidation||"—") +
        "\\n\\nscore: " + JSON.stringify(t.score_breakdown) +
        (t.risk_reasons && t.risk_reasons.length ? "\\nveto reasons: " + t.risk_reasons.join(", ") : "");
      return "<tr><td>"+esc((t.ts||"").slice(0,16))+"</td><td>"+esc(t.instrument)+"</td><td>"+esc(t.side)+
        "</td><td>"+fmt(t.quality)+"</td><td>"+esc(t.regime||"—")+"</td><td>"+verdict+"</td><td>"+oc+
        "</td><td><details><summary class='dim'>detail</summary><pre>"+esc(detail)+"</pre></details></td></tr>";
    }).join("") + "</table></section>";
}

function renderScanPage(key, title, blurb) {
  const scan = SNAP.trend_scan || {};
  const pages = SNAP.pages || {};
  const gen = scan.generated_at ? ' <span class="dim">(scan ' + scan.generated_at.slice(0,16) + ", bench " + esc(scan.benchmark) + ")</span>" : "";
  return "<section><h2>" + title + gen + "</h2><p class='dim'>" + blurb + "</p>" +
    scanTable(scan[key]) + "</section><section><h2>Narrative (weekly research)</h2>" +
    md(pages[key + "_md"]) + "</section>";
}

function renderReports() {
  const r = SNAP.reports || {};
  const map = { brief: r.brief_md, recap: r.recap_md, review: r.review_md };
  return '<div class="tabs" style="margin-bottom:8px">' +
    '<button id="tb" class="' + (reportTab==="brief"?"on":"") + '">morning brief</button>' +
    '<button id="trc" class="' + (reportTab==="recap"?"on":"") + '">evening recap</button>' +
    '<button id="tv" class="' + (reportTab==="review"?"on":"") + '">operator review</button></div>' +
    "<pre>" + esc(map[reportTab] || "not available yet") + "</pre>";
}

function drawChart(points) {
  const c = $("chart"); if (!c) return;
  const ctx = c.getContext("2d");
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

function render() {
  if (!SNAP) return;
  $("nav").innerHTML = VIEWS.map(([k, label]) =>
    '<button data-v="' + k + '" class="' + (view === k ? "on" : "") + '">' + label + "</button>").join("");
  document.querySelectorAll("#nav button").forEach(b =>
    b.onclick = () => { view = b.dataset.v; location.hash = view; render(); });
  let html = "";
  if (view === "dash") html = renderDash();
  else if (view === "theses") html = renderTheses();
  else if (view === "m7a") html = renderScanPage("m7a", "M7A — megacap / AI complex",
    "Deterministic daily-bar read from Keel's own regime engine: who is trending, who is extended, who leads vs the benchmark.");
  else if (view === "smb") html = renderScanPage("smb", "SMB — small &amp; mid-cap complex",
    "IWM / MDY / equal-weight breadth: is risk appetite broadening beyond the megacaps?");
  else if (view === "opps") html = "<section><h2>Opportunities — learning watchlist</h2>" +
    "<p class='dim'>Setups forming, written by the weekly research task. Study material, not signals — Keel only trades its five configured instruments through the risk engine.</p>" +
    md((SNAP.pages||{}).opportunities_md) + "</section>";
  else if (view === "reads") html = "<section><h2>Reads</h2>" + md((SNAP.pages||{}).reads_md) + "</section>";
  else if (view === "reports") html = renderReports();
  $("view").innerHTML = html;
  if (view === "dash") drawChart(SNAP.equity_curve);
  if (view === "reports") {
    $("tb").onclick = () => { reportTab = "brief"; render(); };
    $("trc").onclick = () => { reportTab = "recap"; render(); };
    $("tv").onclick = () => { reportTab = "review"; render(); };
  }
}

async function refresh() {
  const res = await fetch("/api/kobewould/data", { cache: "no-store" });
  if (res.status === 401) { location.reload(); return; }
  if (res.status === 404) { $("ts").textContent = "no snapshot published yet — start keel with publish env vars set"; return; }
  if (!res.ok) { $("ts").textContent = "error " + res.status; return; }
  SNAP = await res.json();
  const age = (Date.now() - Date.parse(SNAP.generated_at)) / 60000;
  $("ts").textContent = "snapshot " + (age < 1 ? "just now" : fmt(age,0) + " min ago");
  $("mode").textContent = (SNAP.mode || "paper").toUpperCase();
  $("mode").className = "badge " + (SNAP.mode === "live" ? "live" : "paper");
  let banners = "";
  if (age > 30) banners += '<div class="warn">⚠ snapshot is ' + fmt(age,0) + ' min old — keel or its publisher may be down</div>';
  if (SNAP.halted || SNAP.kill_switch) banners += '<div class="halted">⛔ HALTED — ' + esc(SNAP.halt_reason || "kill switch") + "</div>";
  if (SNAP.posture && SNAP.posture.note) banners += '<div class="warn">🧭 posture: ' + esc(SNAP.posture.note) + "</div>";
  $("banners").innerHTML = banners;
  render();
}
refresh(); setInterval(refresh, 60000);
</script>`);

export default async function handler(req, res) {
  if (!configured()) return sendHtml(res, 200, SETUP);
  if (isAuthed(req, env("KOBEWOULD_SECRET"))) return sendHtml(res, 200, DASH);
  return sendHtml(res, 200, LOGIN);
}
