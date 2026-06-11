// GET /kobewould (rewritten here) — login wall or the read-only "Kobe" terminal.
// Webster aesthetic: warm eggshell paper, navy text, wine accent, with navy
// "provenance bands" marking the surfaces an LLM touched (Posture, Decision
// Journal) while the deterministic money path stays warm paper.
// READ-ONLY by construction (ADR-018): kill/mode are indicators, not buttons.
import { blobAvailable, configured, env, isAuthed, readCred, sendHtml, setupEnabled } from "./_lib.js";
import { GLOSSARY } from "./_glossary.js";

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">`;

const SHELL = (inner) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>kobe</title>${FONTS}
<style>
  *{ box-sizing:border-box; }
  :root{
    --paper:#f4ecdd; --navy:#14263f; --wine:#8a2742; --sage:#5f7a4d;
    --honey:#b07d2a; --brick:#9c3a2b; --assist:#1f3a5f; --mute:#9a8f7a;
    --slate:#7a8694; --line:rgba(20,38,63,0.14); --hair:rgba(20,38,63,0.08);
  }
  html,body{ margin:0; padding:0; background:var(--paper); color:var(--navy);
    font-family:'Geist',system-ui,sans-serif; }
  ::-webkit-scrollbar{ width:10px; height:10px; }
  ::-webkit-scrollbar-thumb{ background:#d8cab0; border-radius:6px; }
  ::-webkit-scrollbar-track{ background:transparent; }
  @keyframes kobepulse{ 0%,100%{opacity:1;} 50%{opacity:.35;} }
  .wrap{ max-width:1180px; margin:0 auto; padding:22px 26px 48px; }
  .mono{ font-family:'Geist Mono',monospace; }
  .eyebrow{ font-size:9.5px; font-weight:600; letter-spacing:1.3px; color:var(--slate);
    text-transform:uppercase; }
  .sect-h{ font-size:11px; font-weight:600; letter-spacing:1.3px; color:var(--navy);
    text-transform:uppercase; }
  .sect-meta{ font-family:'Geist Mono',monospace; font-size:10px; color:var(--mute); }
  .dot{ width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .rule2{ height:2px; background:var(--navy); }
  .rule1{ height:1px; background:rgba(20,38,63,0.18); margin-top:2px; }
  table{ width:100%; border-collapse:collapse; }
  th{ text-align:left; font-size:9px; font-weight:600; letter-spacing:0.9px;
    color:var(--mute); text-transform:uppercase; padding:0 8px 9px; }
  td{ padding:10px 8px; border-top:1px solid var(--hair); vertical-align:top;
    font-family:'Geist Mono',monospace; font-size:12px; }
  .band{ background:var(--navy); border-radius:3px 3px 0 0; padding:9px 14px;
    display:flex; align-items:center; justify-content:space-between; }
  .band .t{ font-size:11px; font-weight:600; letter-spacing:1.3px; color:var(--paper);
    text-transform:uppercase; font-family:'Geist',sans-serif; }
  .band .m{ font-family:'Geist Mono',monospace; font-size:9px; letter-spacing:.5px; color:#9fb0c4; }
  .band-body{ background:rgba(20,38,63,0.04); border:1px solid rgba(20,38,63,0.1);
    border-top:none; border-radius:0 0 3px 3px; padding:14px; }
  .green{ color:var(--sage); } .red{ color:var(--brick); } .honey{ color:var(--honey); }
  .wine{ color:var(--wine); } .assist{ color:var(--assist); } .slate{ color:var(--slate); }
  .dim{ color:var(--mute); font-family:'Geist Mono',monospace; font-size:12px; }
  nav{ display:flex; flex-wrap:wrap; gap:7px; margin:18px 0 22px; }
  nav button{ background:transparent; color:var(--slate); border:none;
    border-bottom:2px solid transparent; padding:5px 3px; margin-right:10px;
    cursor:pointer; font-family:'Geist',sans-serif; font-size:12.5px; font-weight:600;
    letter-spacing:.3px; text-transform:uppercase; }
  nav button.on{ color:var(--navy); border-bottom-color:var(--wine); }
  .pill{ display:inline-flex; align-items:center; gap:5px; font-family:'Geist Mono',monospace;
    font-size:10.5px; }
  .md{ font-size:13px; line-height:1.6; color:var(--navy); }
  .md h1{ font-family:'Big Shoulders Display',sans-serif; font-size:22px; margin:4px 0 8px; }
  .md h2{ font-size:14px; margin:16px 0 6px; color:var(--navy); }
  .md h3{ font-size:12.5px; margin:12px 0 4px; color:var(--wine); text-transform:uppercase; letter-spacing:.8px; }
  .md ul{ margin:6px 0; padding-left:18px; } .md li{ margin:3px 0; }
  .md a{ color:var(--wine); } .md p{ margin:6px 0; }
  .md table{ margin:10px 0; } .md td{ border-top:1px solid var(--hair); }
  .md code{ background:rgba(20,38,63,0.06); padding:1px 5px; border-radius:3px; }
  .md hr{ border:none; border-top:1px solid var(--line); margin:14px 0; }
  pre{ background:rgba(20,38,63,0.04); border:1px solid rgba(20,38,63,0.1);
    border-radius:3px; padding:14px; white-space:pre-wrap; font-family:'Geist Mono',monospace;
    font-size:12px; overflow:auto; }
  details summary{ cursor:pointer; color:var(--slate); font-family:'Geist Mono',monospace; font-size:10.5px; }
  input[type=password]{ background:#fff; border:1px solid var(--line); color:var(--navy);
    border-radius:3px; padding:11px 13px; font:inherit; width:240px; }
  button.go{ background:var(--wine); color:var(--paper); border:0; border-radius:3px;
    padding:11px 18px; font-family:'Geist Mono',monospace; font-weight:600; letter-spacing:1px;
    cursor:pointer; margin-left:8px; }
  .center{ display:flex; min-height:78vh; align-items:center; justify-content:center; }
  .banner{ border-radius:3px; padding:11px 18px; display:flex; align-items:center; gap:13px;
    margin-bottom:16px; font-family:'Geist Mono',monospace; }
  .grid3{ display:grid; grid-template-columns:1.05fr 1.1fr 0.95fr; gap:0; }
  .grid3 > .col{ padding:4px 26px 0; border-left:1px solid var(--line); }
  .grid3 > .col:first-child{ padding-left:0; border-left:none; }
  .setup-field{ display:block; margin:12px 0; }
  .setup-field label{ display:block; font-size:11px; color:var(--slate); margin-bottom:5px;
    text-transform:uppercase; letter-spacing:.8px; }
  /* ── mobile ── */
  @media (max-width:760px){
    .wrap{ padding:14px 14px 40px; }
    h1{ font-size:36px; }
    #statline{ grid-template-columns:1fr 1fr !important; }
    #statline > div{ padding:12px 10px !important; border-left:none !important;
      border-top:1px solid var(--hair); }
    #statline > div:first-child{ border-top:none; }
    .grid3{ grid-template-columns:1fr !important; }
    .grid3 > .col{ padding:18px 0 0 !important; border-left:none !important;
      border-top:1px solid var(--line); margin-top:4px; }
    .grid3 > .col:first-child{ border-top:none; margin-top:0; }
    nav{ gap:2px; overflow-x:auto; -webkit-overflow-scrolling:touch; }
    nav button{ font-size:11px; margin-right:8px; white-space:nowrap; }
    table{ font-size:11.5px; } td,th{ padding:6px 5px; }
    input[type=password]{ width:100%; }
  }
</style></head><body>${inner}</body></html>`;

const LOGIN = SHELL(`<div class="wrap"><div class="center"><form method="POST" action="/api/kobewould/login">
  <div style="font-family:'Big Shoulders Display',sans-serif;font-weight:800;font-size:46px;letter-spacing:.5px;color:var(--navy);margin-bottom:4px;">KOBE</div>
  <div class="mono" style="font-size:10.5px;color:var(--slate);margin-bottom:18px;border-left:2px solid var(--wine);padding-left:11px;">local-first trading OS · operator terminal</div>
  <input type="password" name="password" autofocus autocomplete="current-password" aria-label="password">
  <button class="go" type="submit">ENTER</button>
  <div class="mono" style="font-size:10.5px;color:var(--slate);margin-top:16px;"><a href="/kobewould?setup=1" style="color:var(--wine);">First time, or forgot your password? Set / reset it →</a></div>
</form></div></div>`);

const CHANGE = SHELL(`<div class="wrap"><div class="center"><form method="POST" action="/api/kobewould/change-password" style="width:300px;max-width:100%;">
  <div style="font-family:'Big Shoulders Display',sans-serif;font-weight:800;font-size:46px;letter-spacing:.5px;color:var(--navy);">KOBE</div>
  <div class="mono" style="font-size:10.5px;color:var(--slate);margin-bottom:16px;border-left:2px solid var(--wine);padding-left:11px;">change password</div>
  <div class="setup-field"><label>new password (min 8)</label><input type="password" name="password" minlength="8" required autofocus autocomplete="new-password"></div>
  <div class="setup-field"><label>confirm</label><input type="password" name="confirm" minlength="8" required autocomplete="new-password"></div>
  <button class="go" type="submit" style="margin:6px 0 0;width:100%;">CHANGE PASSWORD</button>
  <div class="mono" style="font-size:10px;color:var(--slate);margin-top:14px;"><a href="/kobewould" style="color:var(--slate);">← back to terminal</a></div>
</form></div></div>`);

const SETUP_INFRA = SHELL(`<div class="wrap"><div class="center"><div>
  <div style="font-family:'Big Shoulders Display',sans-serif;font-weight:800;font-size:46px;">KOBE</div>
  <p class="dim">Setup pending — set KOBEWOULD_SECRET and KEEL_PUBLISH_TOKEN on the Vercel project, redeploy.</p>
</div></div></div>`);

const SETUP = SHELL(`<div class="wrap"><div class="center"><form method="POST" action="/api/kobewould/setup" style="width:300px;max-width:100%;">
  <div style="font-family:'Big Shoulders Display',sans-serif;font-weight:800;font-size:46px;letter-spacing:.5px;color:var(--navy);">KOBE</div>
  <div class="mono" style="font-size:10.5px;color:var(--slate);margin-bottom:16px;border-left:2px solid var(--wine);padding-left:11px;">first-run setup · choose your password</div>
  <div class="setup-field"><label>setup code</label><input type="password" name="code" required autocomplete="off" placeholder="from kobewould-secrets.local.txt"></div>
  <div class="setup-field"><label>new password (min 8)</label><input type="password" name="password" minlength="8" required autocomplete="new-password"></div>
  <div class="setup-field"><label>confirm password</label><input type="password" name="confirm" minlength="8" required autocomplete="new-password"></div>
  <button class="go" type="submit" style="margin:6px 0 0;width:100%;">SET PASSWORD</button>
  <div class="mono" style="font-size:10px;color:var(--slate);margin-top:14px;line-height:1.6;">The setup code is one-time. After this you log in with just your password. Forgot it later? Visit /kobewould?setup=1 and re-enter the code.</div>
</form></div></div>`);

const GLOSS_JSON = JSON.stringify(GLOSSARY).replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

const APP = SHELL(`<div class="wrap">
  <div id="banners"></div>
  <div id="controls" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px;"></div>
  <!-- MASTHEAD -->
  <div style="display:flex;align-items:flex-end;justify-content:space-between;padding-bottom:14px;gap:20px;flex-wrap:wrap;">
    <div style="display:flex;align-items:flex-end;gap:22px;">
      <div style="font-family:'Big Shoulders Display',sans-serif;font-weight:800;font-size:50px;line-height:.8;letter-spacing:.5px;color:var(--navy);">KOBE</div>
      <div style="padding-bottom:5px;border-left:2px solid var(--wine);padding-left:13px;">
        <div style="font-size:12px;font-weight:600;">Local-first trading OS</div>
        <div class="mono" style="font-size:10px;color:var(--slate);margin-top:2px;">deterministic money path · default-deny live · read-only mirror</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:22px;flex-wrap:wrap;">
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="eyebrow">3-gate arm</span>
        <span id="gates" style="display:flex;gap:9px;"></span>
      </div>
      <div class="pill"><span id="modeDot" class="dot"></span><span id="modeLabel" class="mono" style="font-weight:600;letter-spacing:.8px;"></span></div>
      <div style="text-align:right;"><div id="clock" class="mono" style="font-size:15px;font-weight:500;"></div><div id="day" class="mono" style="font-size:10px;color:var(--slate);"></div></div>
    </div>
  </div>
  <div class="rule2"></div><div class="rule1"></div>

  <!-- STAT LINE -->
  <div id="statline" style="display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr 1.5fr;padding:18px 0 20px;border-bottom:1px solid var(--line);gap:0;"></div>

  <nav id="nav"></nav>
  <div id="view">loading…</div>
  <div id="tkmodal" style="display:none;position:fixed;inset:0;background:rgba(20,38,63,0.4);z-index:50;align-items:flex-start;justify-content:center;padding:40px 14px;overflow:auto;"></div>

  <!-- FOOTER -->
  <div style="display:flex;align-items:center;justify-content:space-between;margin-top:30px;padding-top:14px;border-top:2px solid var(--navy);flex-wrap:wrap;gap:12px;">
    <div class="mono" style="font-size:10.5px;color:var(--slate);">read-only mirror · push-only · <a href="/kobewould?change=1" style="color:var(--slate);">change password</a> · <span id="age"></span></div>
    <div class="mono" style="font-size:10.5px;color:var(--slate);display:flex;gap:14px;">
      <span><span class="wine">●</span> Kraken</span><span><span class="assist">●</span> Alpaca paper</span><span><span class="slate">○</span> ccxt gated</span>
    </div>
  </div>
<script>
const $ = id => document.getElementById(id);
const fmt = (x, d=2) => (x==null||x===""||isNaN(x)) ? "—" : Number(x).toFixed(d);
const esc = s => String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const C = { navy:"#14263f", wine:"#8a2742", sage:"#5f7a4d", honey:"#b07d2a",
            brick:"#9c3a2b", assist:"#1f3a5f", mute:"#9a8f7a", slate:"#7a8694" };
const GLOSSARY = ${GLOSS_JSON};
let glossQ = "";
const FORMULAS = [
  ["adx", "DX = 100·|+DI − −DI| / (+DI + −DI); ADX = Wilder-smoothed DX over 14 bars. ≥22 = real trend, <20 = chop."],
  ["atr", "TR = max(H−L, |H−Cprev|, |L−Cprev|); ATR = Wilder average of TR over 14. ATR% = ATR / price."],
  ["ema", "EMAn = price·k + EMAn-1·(1−k), where k = 2/(n+1). EMA20 reacts ~2.5× faster than EMA50."],
  ["extension", "ext = (close − EMA20) / ATR. +2 means price is 2 average-days above its mean."],
  ["relative strength", "RS = (asset 3-month return) − (benchmark 3-month return), in %. Positive = beating the market."],
  ["rsi", "RSI = 100 − 100/(1 + avg_gain/avg_loss). RSI(2) uses a 2-period lookback, so it whipsaws to extremes fast."],
  ["donchian", "Upper = highest high of prior N bars (excl. current); Lower = lowest low. Breakout = close > Upper."],
  ["bollinger", "mid = SMA20, bands = mid ± 2·stdev; bandwidth = (upper − lower)/mid. Squeeze = bandwidth in low percentile of last 240 bars."],
  ["risk per trade", "risk budget = equity × risk% (0.75% default); hard ceiling = equity × 1%."],
  ["position sizing", "qty = (equity × risk%) / |entry − stop|, rounded down to lot size."],
  ["hard stop", "long stop = entry − k·ATR; max loss = (entry − stop) × qty, capped at 1% of equity."],
  ["trailing", "chandelier stop = max(previous stop, highest_close_since_entry − 3·ATR). Ratchets up only."],
  ["chandelier", "stop = highest_close_since_entry − 3·ATR, raised never lowered."],
  ["notional", "position value (qty × price) ≤ 40% of equity (30% for crypto)."],
  ["correlation", "Σ same-direction risk within a bucket ≤ the bucket cap; SPY+QQQ+BTC share the risk-on bucket."],
  ["drawdown", "drawdown% = (high-water mark − equity) / high-water mark × 100."],
  ["loss cap", "halt new entries when day P&L ≤ −3% of equity (week ≤ −6%)."],
  ["cooldown", "after 2 losses on an instrument, block it for N bars of its timeframe."],
  ["quality score", "quality = 0.40·signal_conf + 0.25·regime_conf + 0.20·perf + 0.15·cost; enter only if ≥ 0.55."],
  ["r-multiple", "R = realized P&L / planned risk. +2R = made twice what you risked; losses pin near −1R."],
  ["expectancy", "expectancy (R) = win% × avg_win − loss% × avg_loss. Positive = edge."],
  ["profit factor", "PF = gross profit / gross loss. >1 profitable; >1.5 good."],
  ["win rate", "win rate = winning trades / total trades. High win rate ≠ profitable without R."],
  ["cost guard", "edge multiple = expected move / (2 × round-trip cost); trade refused if < 2."],
  ["posture", "risk_factor ∈ [0.25, 1.0] (reduce-only); effective risk = budget × risk_factor."],
];
function formulaFor(term){ const t=(term||"").toLowerCase(); for(const [k,f] of FORMULAS){ if(t.includes(k)) return f; } return null; }

function tickerIndex(){
  const idx={};
  const add=(r)=>{ if(r && r.ticker && !r.error && !idx[r.ticker]) idx[r.ticker]=r; };
  const ts=SNAP.trend_scan||{}; (ts.m7a||[]).forEach(add); (ts.smb||[]).forEach(add);
  const m=SNAP.markets||{}; Object.values(m.groups||{}).forEach(g=>g.forEach(add)); (m.strongest||[]).forEach(add);
  return idx;
}
function tk(ticker){ return '<span class="tk" data-t="'+esc(ticker)+'" style="cursor:pointer;border-bottom:1px dotted var(--wine);">'+esc(ticker)+'</span>'; }
function closeTk(){ $("tkmodal").style.display="none"; }
function showTk(ticker){
  const r=tickerIndex()[ticker];
  const m=$("tkmodal");
  if(!r){ m.innerHTML='<div style="background:var(--paper);border:1px solid var(--line);border-radius:4px;padding:18px;max-width:340px;width:100%;"><b>'+esc(ticker)+'</b><div class="dim" style="margin:8px 0;">No tape data in this snapshot. Queue a deconstruction to research it.</div><button class="go" id="tkreq2">Request deconstruction</button> <button id="tkx2" style="margin-left:6px;background:transparent;border:1px solid var(--line);border-radius:3px;padding:8px 12px;cursor:pointer;">close</button></div>'; }
  else {
    const row=(lbl,val,cls)=>'<div style="display:flex;justify-content:space-between;padding:5px 0;border-top:1px solid var(--hair);"><span class="dim">'+lbl+'</span><span class="mono '+(cls||"")+'">'+val+'</span></div>';
    m.innerHTML='<div style="background:var(--paper);border:1px solid var(--navy);border-radius:4px;padding:18px;max-width:380px;width:100%;box-shadow:0 8px 30px rgba(20,38,63,0.25);">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-family:Big Shoulders Display,sans-serif;font-weight:800;font-size:26px;">'+esc(ticker)+'</div><button id="tkx" style="background:transparent;border:1px solid var(--line);border-radius:3px;padding:5px 10px;cursor:pointer;">✕</button></div>'+
      '<div class="dim" style="margin-bottom:8px;">'+esc(r.name||"")+'</div>'+
      '<div style="margin:8px 0;">'+spark(r.spark,340,54)+'</div>'+
      row("regime", esc(r.regime))+row("regime conf", fmt(r.regime_conf,2))+
      row("ADX (trend strength)", fmt(r.adx,1)+(r.adx>=22?" — real trend":" — chop"))+
      row("extension (ATR from EMA20)", fmt(r.ext_atr,2))+
      row("above EMA50", r.above_ema50?"Y — above water":"N — below water", r.above_ema50?"green":"red")+
      row("3-month return", fmt(r.ret_3m_pct,1)+"%", cls(r.ret_3m_pct))+
      row("relative strength vs SPY", fmt(r.rs_3m_pct,1)+"%", cls(r.rs_3m_pct))+
      '<div style="margin-top:12px;display:flex;gap:8px;"><button class="go" id="tkreq" data-t="'+esc(ticker)+'">Request deconstruction</button><button id="tkx3" style="background:transparent;border:1px solid var(--line);border-radius:3px;padding:8px 14px;cursor:pointer;">close</button></div></div>';
  }
  m.style.display="flex";
  m.onclick=(e)=>{ if(e.target===m) closeTk(); };
  ["tkx","tkx2","tkx3"].forEach(id=>{ const b=document.getElementById(id); if(b) b.onclick=closeTk; });
  ["tkreq","tkreq2"].forEach(id=>{ const b=document.getElementById(id); if(b) b.onclick=async()=>{ b.disabled=true; b.textContent="queuing…";
    try{ await fetch("/api/kobewould/request",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({subject:ticker})}); b.textContent="queued ✓ (fulfilled on next daily run)"; }
    catch(e){ b.textContent="error"; } }; });
}

function spark(values, w, h){
  if(!values || values.length < 2) return "";
  w = w || 84; h = h || 22;
  const min = Math.min(...values), max = Math.max(...values), span = (max-min)||1;
  const pts = values.map((v,i)=> (i/(values.length-1)*w).toFixed(1) + "," + (h-2-((v-min)/span*(h-4))).toFixed(1)).join(" ");
  const up = values[values.length-1] >= values[0];
  return '<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" style="vertical-align:middle;"><polyline points="'+pts+'" fill="none" stroke="'+(up?C.sage:C.brick)+'" stroke-width="1.4"/></svg>';
}
let SNAP=null, view=location.hash.slice(1)||"mission", reportTab="brief";
const VIEWS=[["mission","Mission"],["markets","Markets"],["rebalance","Rebalance"],["decon","Deconstruct"],["panels","Panels"],["theses","Theses"],["m7a","M7A"],["smb","SMB"],
             ["opps","Opportunities"],["reads","Reads"],["reports","Reports"],["glossary","Glossary"]];
let deconSlug=null, panelSlug=null, marketGroup="strongest", rebalAmount=null, layoutOpen=false;
function loadLayout(){ try{ return JSON.parse(localStorage.getItem("kobe_layout")||"{}"); }catch(e){ return {}; } }
function saveLayout(l){ try{ localStorage.setItem("kobe_layout", JSON.stringify(l)); }catch(e){} }
function orderedViews(){
  const l=loadLayout(); const hidden=new Set(l.hidden||[]);
  const order=(l.order&&l.order.length)?l.order:VIEWS.map(v=>v[0]);
  const known=new Set(VIEWS.map(v=>v[0]));
  const seq=order.filter(k=>known.has(k)).concat(VIEWS.map(v=>v[0]).filter(k=>!order.includes(k)));
  return seq.map(k=>VIEWS.find(v=>v[0]===k)).filter(v=>v && !hidden.has(v[0]));
}
const cls = v => v>=0 ? "green" : "red";

function md(src){
  if(!src) return '<div class="dim">nothing published here yet — the weekly research task (Sundays) and daily review fill these pages.</div>';
  const lines=esc(src).split(/\\r?\\n/); let out=[],inUl=false,inT=false;
  const inline=s=>s.replace(/\\*\\*([^*]+)\\*\\*/g,"<b>$1</b>").replace(/\\*([^*]+)\\*/g,"<i>$1</i>")
    .replace(/\`([^\`]+)\`/g,"<code>$1</code>")
    .replace(/\\[([^\\]]+)\\]\\((https?:[^)]+)\\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  const close=()=>{ if(inUl){out.push("</ul>");inUl=false;} if(inT){out.push("</table>");inT=false;} };
  for(const raw of lines){ const l=raw.trimEnd();
    if(/^\\s*$/.test(l)){close();continue;}
    if(/^---+$/.test(l)){close();out.push("<hr>");continue;}
    let m;
    if((m=l.match(/^(#{1,3})\\s+(.*)/))){close();out.push("<h"+m[1].length+">"+inline(m[2])+"</h"+m[1].length+">");continue;}
    if(/^\\|.*\\|$/.test(l)){ if(/^\\|[\\s:|-]+\\|$/.test(l))continue;
      if(!inT){out.push("<table>");inT=true;}
      const c=l.slice(1,-1).split("|").map(x=>inline(x.trim())); out.push("<tr><td>"+c.join("</td><td>")+"</td></tr>");continue;}
    if((m=l.match(/^\\s*[-*]\\s+(.*)/))){ if(inT){out.push("</table>");inT=false;}
      if(!inUl){out.push("<ul>");inUl=true;} out.push("<li>"+inline(m[1])+"</li>");continue;}
    close(); out.push("<p>"+inline(l)+"</p>");
  } close(); return '<div class="md">'+out.join("")+"</div>";
}

function stat(label, big, bigColor, sub){
  return '<div style="padding:0 22px;border-left:1px solid var(--line);">'+
    '<div class="eyebrow" style="margin-bottom:8px;">'+label+'</div>'+
    '<div class="mono" style="font-weight:600;font-size:22px;color:'+(bigColor||C.navy)+';">'+big+'</div>'+
    '<div class="mono" style="font-size:10.5px;color:var(--slate);margin-top:4px;">'+sub+'</div></div>';
}

function renderStatline(){
  const b=SNAP.book||{}, r=SNAP.risk||{};
  const eq=b.equity, hwm=r.high_water_mark;
  const inceptionPct = (eq&&hwm) ? null : null;
  const ven = SNAP.venues || {};
  const kr = ven.kraken || null;
  const krUsd = kr ? Object.entries(kr).map(([a,v])=>fmt(v)+" "+esc(a)).join(", ") : null;
  const first = '<div style="padding-right:22px;">'+
    '<div class="eyebrow" style="margin-bottom:8px;">Paper book</div>'+
    '<div class="mono" style="font-weight:600;font-size:30px;letter-spacing:-.5px;">$'+fmt(eq)+'</div>'+
    '<div class="mono" style="font-size:10.5px;color:var(--slate);margin-top:4px;">cash $'+fmt(b.cash)+
    (krUsd ? ' · <span style="color:var(--wine);">Kraken (real): '+krUsd+'</span>' : '')+'</div></div>';
  const posture = SNAP.posture;
  const postureBig = posture ? ('risk ×'+fmt(posture.risk_factor,2)) : 'neutral';
  const postureSub = posture ? ((posture.stand_down&&posture.stand_down.length?('down: '+posture.stand_down.join(", ")):'')+(posture.note?(' · '+esc(posture.note)):'')) : 'no LLM reduction today';
  $("statline").innerHTML = first +
    stat("Day P&amp;L", (r.day_pnl>=0?"+":"")+"$"+fmt(Math.abs(r.day_pnl)), r.day_pnl>=0?C.sage:C.brick, "realized today") +
    stat("Risk budget", "$"+fmt(r.risk_budget_usd), C.navy, fmt(r.per_trade_risk_pct,2)+"% eq · "+esc((SNAP.risk_profile||{}).active||"balanced")) +
    stat("High-water", "$"+fmt(hwm), C.navy, "max DD "+fmt(r.drawdown_pct,1)+"%") +
    stat("Posture · LLM edge", postureBig, posture?C.honey:C.slate, postureSub||"reduce-only");
}

function ladder(){
  const eq=(SNAP.book||{}).equity||0;
  const rungs=[
    {label:"$200", sub:"deposited · BTC live · rest paper", at:eq>=200&&eq<300},
    {label:"+$100 → $300", sub:"4 clean wks · at HWM gate", at:eq>=300&&eq<400},
    {label:"$400", sub:"requires clean rollout", at:eq>=400&&eq<500},
    {label:"$500", sub:"Alpaca live after paper pass", at:eq>=500},
  ];
  let html='<div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:14px;"><span class="sect-h">Capital ladder</span><span class="sect-meta">ADR-017 · add on strength</span></div>';
  rungs.forEach((s,i)=>{ const done=eq>=parseInt(s.label.replace(/[^0-9]/g,""))||s.at;
    const color=s.at?C.sage:(done?C.navy:C.mute); const dot=s.at?C.sage:(done?C.navy:"#c4b89e");
    html+='<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid var(--hair);">'+
      '<span class="dot" style="background:'+dot+';"></span>'+
      '<span class="mono" style="font-weight:600;font-size:13px;color:'+color+';min-width:120px;">'+s.label+'</span>'+
      '<span class="mono" style="font-size:11px;color:var(--slate);flex:1;">'+s.sub+'</span>'+
      (s.at?'<span class="mono" style="font-size:9px;font-weight:600;letter-spacing:.8px;color:'+C.sage+';">CURRENT</span>':'')+'</div>';
  });
  return '<div>'+html+'</div>';
}

function regimeBoard(){
  const rows=SNAP.regime_board||[];
  let html='<div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:12px;"><span class="sect-h">Strategy agents · regime board</span><span class="sect-meta">per-bar close</span></div>';
  if(!rows.length) return html+'<div class="dim">populates with the 07:00 brief.</div>';
  rows.forEach(r=>{
    const accent = r.strategy==="momentum_breakout"?C.wine:(r.strategy==="trend_following"?C.honey:C.assist);
    const stanceColor = r.stance==="flat"?C.slate:C.navy;
    html+='<div style="padding:13px 0;border-top:1px solid var(--hair);">'+
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;">'+
        '<div style="display:flex;align-items:center;gap:10px;"><span class="dot" style="background:'+accent+';"></span>'+
          '<span style="font-weight:600;font-size:13px;">'+esc(r.instrument)+'</span>'+
          '<span class="mono" style="font-size:10px;color:var(--slate);padding-left:9px;border-left:1px solid var(--line);">'+esc(r.strategy)+' · '+esc(r.timeframe)+'</span></div>'+
        '<span class="mono" style="font-size:10px;color:'+(r.venue==="ccxt"?C.wine:C.assist)+';">'+esc(r.venue)+'</span></div>'+
      '<div style="display:flex;align-items:center;gap:16px;">'+
        '<div style="flex:1;"><div class="mono" style="font-size:12.5px;color:'+accent+';">'+esc(r.regime)+'</div></div>'+
        '<div style="width:120px;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span class="eyebrow">regime conf</span><span class="mono" style="font-size:10.5px;">'+fmt(r.conf,2)+'</span></div>'+
          '<div style="height:5px;background:rgba(20,38,63,0.08);border-radius:3px;overflow:hidden;"><div style="height:100%;width:'+Math.round((r.conf||0)*100)+'%;background:'+accent+';"></div></div></div></div>'+
      '<div style="margin-top:9px;" class="mono"><span style="color:var(--mute);">stance</span> <span style="color:'+stanceColor+';">'+esc(r.stance)+'</span>'+(r.hunting?' <span class="wine">· hunting</span>':'')+'</div></div>';
  });
  return html;
}

function positionsPanel(){
  const pos=Object.entries((SNAP.book||{}).positions||{});
  let html='<div style="display:flex;align-items:baseline;justify-content:space-between;margin:26px 0 12px;"><span class="sect-h">Open positions</span><span class="sect-meta">one fill model · bt = paper = live</span></div>';
  html+='<table><tr><th>instrument</th><th>side</th><th style="text-align:right;">entry</th><th style="text-align:right;">stop</th><th style="text-align:right;">qty</th></tr>';
  html+= pos.length ? pos.map(([k,p])=>'<tr><td style="font-weight:600;">'+esc(k)+'</td><td>'+esc(p.side)+
    '</td><td style="text-align:right;">'+fmt(p.entry)+'</td><td style="text-align:right;" class="honey">'+fmt(p.stop)+
    '</td><td style="text-align:right;">'+esc(p.qty)+'</td></tr>').join("")
    : '<tr><td colspan="5" class="dim">flat — standing by is a position too</td></tr>';
  html+='</table>';
  return html;
}

function provenancePosture(){
  const p=SNAP.posture;
  let body;
  if(!p){ body='<div class="mono" style="font-size:11.5px;color:var(--slate);">No posture file today — full risk, nothing stood down. The daily review writes one only for high-conviction caution.</div>'; }
  else {
    const pct=Math.round((p.risk_factor||1)*100);
    body='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;" class="mono"><span style="font-size:10px;color:var(--slate);">risk_factor</span><span style="font-size:10px;color:var(--slate);">clamp [0.25–1.00] · reduce-only</span></div>'+
      '<div style="display:flex;align-items:center;gap:13px;margin-bottom:12px;"><div style="flex:1;position:relative;height:7px;background:rgba(20,38,63,0.1);border-radius:4px;">'+
      '<div style="position:absolute;left:0;top:0;height:100%;width:'+pct+'%;background:'+C.honey+';border-radius:4px;"></div>'+
      '<div style="position:absolute;left:25%;top:-3px;width:1px;height:13px;background:rgba(20,38,63,0.4);"></div></div>'+
      '<div class="mono" style="font-weight:600;font-size:22px;color:'+C.honey+';">'+fmt(p.risk_factor,2)+'</div></div>'+
      '<div class="mono" style="font-size:11px;display:flex;flex-direction:column;gap:6px;">'+
      (p.stand_down&&p.stand_down.length?'<div style="display:flex;justify-content:space-between;"><span style="color:var(--slate);">stand-down</span><span>'+esc(p.stand_down.join(", "))+'</span></div>':'')+
      (p.note?'<div style="display:flex;justify-content:space-between;"><span style="color:var(--slate);">note</span><span>'+esc(p.note)+'</span></div>':'')+'</div>';
  }
  return '<div class="band"><div style="display:flex;align-items:center;gap:9px;"><span class="dot" style="background:#cf8b6a;"></span><span class="t">Posture · var/posture.yaml</span></div><span class="m">LLM EDGE · ADR-015</span></div>'+
    '<div class="band-body">'+body+'<div style="margin-top:11px;padding-top:10px;border-top:1px solid var(--hair);" class="mono" style="font-size:10px;color:var(--slate);">No LLM write can raise risk, widen a stop, or trigger an entry.</div></div>';
}

function decisionJournal(){
  const th=SNAP.theses||[];
  let rows='';
  th.slice(0,7).forEach(t=>{
    const refused = t.risk_approved===false;
    const kind = refused?"REFUSED":(t.outcome?(t.outcome.pnl>=0?"WIN":"LOSS"):(t.risk_approved?"APPROVED":"THESIS"));
    const color = refused?C.brick:(t.outcome?(t.outcome.pnl>=0?C.sage:C.brick):(t.risk_approved?C.sage:C.assist));
    const detail = refused?("quality "+fmt(t.quality,2)+" · "+(t.risk_reasons||[]).slice(0,2).join(", ")):
      (t.outcome?("exit "+esc(t.outcome.exit_reason)+" · "+fmt(t.outcome.r,2)+"R"):("q "+fmt(t.quality,2)+" · "+esc(t.regime||"")));
    rows+='<div style="display:flex;gap:11px;padding:9px 0;border-top:1px solid var(--hair);">'+
      '<div class="mono" style="font-size:10.5px;color:var(--slate);width:84px;flex-shrink:0;">'+esc((t.ts||"").slice(5,16))+'</div>'+
      '<div style="width:3px;border-radius:2px;background:'+color+';flex-shrink:0;"></div>'+
      '<div style="flex:1;min-width:0;"><div class="mono" style="font-size:11px;"><span style="font-weight:600;letter-spacing:.4px;color:'+color+';">'+kind+'</span> <span>'+esc(t.instrument)+'</span> <span class="slate">'+esc(t.side||"")+'</span></div>'+
      '<div class="mono" style="font-size:10.5px;color:var(--slate);margin-top:3px;">'+detail+'</div></div></div>';
  });
  if(!rows) rows='<div class="dim" style="padding:10px 0;">no theses journaled yet.</div>';
  return '<div style="margin-top:26px;"><div class="band"><div style="display:flex;align-items:center;gap:9px;"><span class="dot" style="background:#cf8b6a;animation:kobepulse 2s infinite;"></span><span class="t">Decision journal</span></div><span class="m">SQLITE WAL + .MD</span></div>'+
    '<div class="band-body" style="padding:2px 14px 8px;">'+rows+'</div></div>';
}

function renderMission(){
  return '<div class="grid3">'+
    '<div class="col">'+ladder()+'</div>'+
    '<div class="col">'+regimeBoard()+positionsPanel()+'</div>'+
    '<div class="col">'+provenancePosture()+decisionJournal()+'</div>'+
    '</div>';
}

function renderTheses(){
  const th=SNAP.theses||[];
  if(!th.length) return '<div class="dim">no theses journaled yet — every setup the research engine emits appears here with its risk verdict and outcome.</div>';
  let html='<div class="sect-h" style="margin-bottom:12px;">Thesis review · the learn loop</div><table>'+
    '<tr><th>when</th><th>inst</th><th>side</th><th>q</th><th>regime</th><th>risk</th><th>outcome</th><th></th></tr>';
  th.forEach(t=>{
    const verdict=t.risk_approved===null?'<span class="dim">—</span>':(t.risk_approved?'<span class="green">approved</span>':'<span class="red">vetoed</span>');
    const oc=t.outcome?'<span class="'+cls(t.outcome.pnl)+'">'+fmt(t.outcome.r,2)+'R ('+esc(t.outcome.exit_reason)+')</span>':'<span class="dim">open/none</span>';
    const detail="rationale:\\n- "+(t.rationale||[]).join("\\n- ")+"\\n\\ninvalidation: "+(t.invalidation||"—")+"\\n\\nscore: "+JSON.stringify(t.score_breakdown||{})+((t.risk_reasons&&t.risk_reasons.length)?("\\nveto: "+t.risk_reasons.join(", ")):"");
    html+='<tr><td>'+esc((t.ts||"").slice(5,16))+'</td><td style="font-weight:600;">'+esc(t.instrument)+'</td><td>'+esc(t.side||"")+'</td><td>'+fmt(t.quality,2)+'</td><td>'+esc(t.regime||"—")+'</td><td>'+verdict+'</td><td>'+oc+'</td><td><details><summary>detail</summary><pre>'+esc(detail)+'</pre></details></td></tr>';
  });
  return html+'</table>';
}

function scanTable(rows){
  if(!rows||!rows.length) return '<div class="dim">no scan yet — runs with the 07:00 brief or keel scan.</div>';
  return '<table><tr><th>ticker</th><th>chart (60d)</th><th>regime</th><th>ADX</th><th>ext</th><th>&gt;EMA50</th><th style="text-align:right;">3m %</th><th style="text-align:right;">RS vs bench</th></tr>'+
    rows.map(r=>r.error?'<tr><td style="font-weight:600;">'+esc(r.ticker)+'</td><td colspan="7" class="dim">'+esc(r.error)+'</td></tr>'
      :'<tr><td style="font-weight:600;">'+tk(r.ticker)+'</td><td>'+spark(r.spark)+'</td><td>'+esc(r.regime)+'</td><td>'+fmt(r.adx,1)+'</td><td>'+fmt(r.ext_atr,2)+'</td><td>'+(r.above_ema50?"Y":"N")+
      '</td><td style="text-align:right;" class="'+cls(r.ret_3m_pct)+'">'+fmt(r.ret_3m_pct,1)+'</td><td style="text-align:right;" class="'+cls(r.rs_3m_pct)+'">'+fmt(r.rs_3m_pct,1)+'</td></tr>'
    ).join("")+'</table>';
}

function renderScanPage(key,title,blurb){
  const scan=SNAP.trend_scan||{}, pages=SNAP.pages||{};
  const gen=scan.generated_at?' · scan '+scan.generated_at.slice(0,16)+' · bench '+esc(scan.benchmark):'';
  return '<div class="sect-h" style="margin-bottom:6px;">'+title+'</div><div class="sect-meta" style="margin-bottom:14px;">'+blurb+gen+'</div>'+
    scanTable(scan[key])+'<div style="margin-top:24px;"><div class="sect-h" style="margin-bottom:10px;">Narrative · weekly research</div>'+md(pages[key+"_md"])+'</div>';
}

function deconRequestBox(){
  return '<div style="background:rgba(20,38,63,0.04);border:1px solid var(--line);border-radius:3px;padding:12px 14px;margin-bottom:16px;">'+
    '<div class="eyebrow" style="margin-bottom:7px;">Request a deconstruction</div>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap;"><input id="deconreq" type="text" placeholder="company or theme — e.g. Stripe, nuclear SMRs, OpenAI" style="flex:1;min-width:200px;background:#fff;border:1px solid var(--line);color:var(--navy);border-radius:3px;padding:8px 11px;font-family:Geist Mono,monospace;font-size:12px;">'+
    '<button id="deconsub" class="go" style="padding:8px 16px;">Queue</button></div>'+
    '<div id="deconmsg" class="mono" style="font-size:10.5px;color:var(--slate);margin-top:8px;">Queued requests are fulfilled on the next daily run (or when you run /keel-thesis). Drill into any deconstruction\\'s "drill-down candidates" by requesting that part here.</div></div>';
}

// ---- markdown memo -> structured deconstruction (Terminal v2 design) ----
let deconRaw=false;
function _splitSections(text){
  const secs={_intro:[]}; let cur="_intro";
  text.split("\\n").forEach(l=>{ const h=l.match(/^##\\s+(.*)/); if(h){cur=h[1].trim();secs[cur]=[];} else secs[cur].push(l); });
  return secs;
}
function _parseTable(lines){
  const rows=lines.filter(l=>l.trim().startsWith("|")&&l.includes("|"));
  if(rows.length<2) return [];
  const cells=l=>l.split("|").slice(1,-1).map(c=>c.trim());
  return rows.slice(2).map(cells).filter(r=>r.length>1);  // skip header+separator
}
function _firstTicker(s){ const m=(s||"").match(/\\b([A-Z]{2,5})\\b/); return m?m[1]:null; }
function _figs(text){
  const out=[]; const re=/([+\\-]?\\$?\\d[\\d,]*(?:\\.\\d+)?\\s*(?:%|x|B|M|bps)?)/g; let m;
  while((m=re.exec(text))&&out.length<2){ const v=m[1].trim(); if(v.length>1&&!out.includes(v)) out.push(v); }
  return out;
}
function _strip(s){ return (s||"").replace(/\\*\\*/g,"").replace(/[#\`]/g,"").trim(); }

// regex-free helpers (template literal strips single backslashes)
function _isTickerCell(s){ s=(s||"").trim(); if(s.length<2||s.length>14) return false; let a=false;
  for(const ch of s){ if(ch>="a"&&ch<="z") return false; if(ch>="A"&&ch<="Z") a=true;
    else if(ch!==" "&&ch!=="/"&&!(ch>="0"&&ch<="9")&&ch!==".") return false; } return a; }
function _cleanName(s){ return (s||"").split(" vs ")[0].split(" / ")[0].split("/")[0].trim().slice(0,42); }
function _num(s){ const v=parseFloat(String(s||"").replace(/[+%,]/g,"")); return isNaN(v)?null:v; }
function _tableRows(lines){ return (lines||[]).filter(l=>l.trim().startsWith("|"))
  .map(l=>l.split("|").slice(1,-1).map(x=>x.trim()))
  .filter(c=>c.length>=2 && !c.every(x=>/^-*$/.test(x))); }

function parseDecon(text){
  const idx=tickerIndex(), secs=_splitSections(text);
  const thesis=_strip((secs["Frame"]||secs["_intro"]||[]).join(" ")).slice(0,520);
  // build name/role (what the company does) + memo-local tape from the memo's own tables
  const meta={}, mtape={};
  Object.keys(secs).forEach(k=>{ const isTape=/tape read/i.test(k);
    _tableRows(secs[k]).forEach(c=>{
      let ti=-1; for(let i=0;i<c.length;i++){ if(_isTickerCell(c[i])){ ti=i; break; } }
      if(ti<0) return; const t=_firstTicker(c[ti]); if(!t) return;
      if(isTape && c.length>=6){ if(!mtape[t]) mtape[t]={rs:_num(c[c.length-1]),
        regime:c[1], adx:c[3], ret:c[c.length-2]}; }
      else if(!meta[t]){ meta[t]={name:_cleanName(ti>=1?c[0]:c[ti]), role:(c[ti+1]||"").slice(0,80)}; }
    }); });
  const node=(ticker,why,kind)=>{ const r=idx[ticker], mt=mtape[ticker], m=meta[ticker];
    const rsv=(r&&r.rs_3m_pct!=null)?r.rs_3m_pct:(mt&&mt.rs!=null?mt.rs:null);
    return {
      ticker, name:(m&&m.name)||(r&&r.name)||"", role:(m&&m.role)||"",
      why:_strip(why).slice(0,150), kind, mapped:!!(r||mt),
      rs:rsv!=null?fmt(rsv,1):null, rsv,
      spark:r?r.spark:null, regime:r?r.regime:(mt?mt.regime:null) }; };
  // exposure framing table -> confirms / opposes
  const confirms=[], opposes=[];
  const exp=Object.keys(secs).find(k=>/exposure framing/i.test(k));
  if(exp) _parseTable(secs[exp]).forEach(row=>{
    const t=_firstTicker(row[0]), dir=(row[1]||"").toLowerCase(), why=row[2]||row[0];
    if(!t) return;
    if(/short|avoid|hedge|fade/.test(dir)) opposes.push(node(t,why,"oppose"));
    else if(/long|buy|own|momentum|trend|revert/.test(dir)) confirms.push(node(t,why,"confirm"));
  });
  // fall back to value-chain competitors/customers if no exposure table
  if(!confirms.length && !opposes.length){
    Object.keys(secs).forEach(k=>{ if(/value chain|tickers/i.test(k)) _parseTable(secs[k]).forEach(row=>{
      const t=_firstTicker(row[1]||row[0]); if(!t) return;
      const n=node(t,row[2]||"",  n=>n); if(n.rsv!=null&&n.rsv>=0) confirms.push(n); else opposes.push(n); }); });
  }
  // tape-read bullets -> market dynamics
  const dyn=[]; const tape=Object.keys(secs).find(k=>/tape read/i.test(k));
  if(tape) secs[tape].filter(l=>l.trim().startsWith("- ")).forEach(l=>{
    const t=_strip(l.replace(/^- /,"")); const low=t.toLowerCase();
    const up=/lead|strong|outperform|leader|\\+\\d|above/.test(low)&&!/lag|weak|below|down/.test(low);
    const dn=/lag|weak|down|underperform|laggard|below|dead/.test(low);
    const head=(l.match(/\\*\\*(.+?)\\*\\*/)||[])[1]||t.split(".")[0];
    dyn.push({label:_strip(head).slice(0,90), tail:t.slice(0,150),
      arrow:up?"▲":dn?"▼":"◆", color:up?C.sage:dn?C.brick:C.honey,
      tag:up?"tailwind":dn?"headwind":"watch"}); });
  // remaining narrative sections -> breakdown cards
  const skip=/frame|tape read|value chain|exposure framing|learn to read|aligned etfs/i;
  const cards=[]; Object.keys(secs).forEach(k=>{ if(k==="_intro"||skip.test(k)) return;
    const body=_strip(secs[k].join("\\n")); if(body.length<40) return;
    cards.push({label:k, figs:_figs(body), summary:body.slice(0,200), full:body.slice(200,900)}); });
  return {thesis, confirms, opposes, dyn, cards,
    leaders:confirms.filter(n=>n.rsv!=null).length, laggards:opposes.length};
}

function nodeCard(n){
  const nameLine=n.name?'<span style="font-size:12.5px;font-weight:600;">'+esc(n.name)+'</span>':'';
  const roleLine=n.role?'<div style="font-size:11px;line-height:1.4;color:var(--navy);opacity:.78;margin-top:5px;"><b>What it does:</b> '+esc(n.role)+'</div>':'';
  if(!n.mapped) return '<div style="border:1px dashed var(--line);background:rgba(20,38,63,0.02);padding:11px 12px;border-radius:2px;">'+
    '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;"><span style="font-family:Geist Mono,monospace;font-weight:700;font-size:13px;">'+esc(n.ticker)+'</span><span class="eyebrow" style="border:1px solid var(--line);padding:1px 5px;">No tape</span></div>'+
    (nameLine?'<div style="margin-top:6px;">'+nameLine+'</div>':'')+roleLine+
    '<div style="font-size:11.5px;line-height:1.45;color:var(--slate);margin-top:7px;"><b>Why it matters:</b> '+esc(n.why)+'</div>'+
    '<button class="dnode" data-t="'+esc(n.ticker)+'" style="margin-top:10px;background:none;border:1px solid var(--line);color:var(--slate);cursor:pointer;font-size:11px;font-weight:600;padding:4px 11px;border-radius:2px;">Request map ▸</button></div>';
  const accent=n.kind==="oppose"?C.brick:C.sage, rsc=n.rsv>0?C.sage:n.rsv<0?C.brick:C.honey;
  const sp=n.spark?spark(n.spark,66,19)+'&nbsp;':'';
  return '<div class="tk" data-t="'+esc(n.ticker)+'" style="border:1px solid var(--line);border-left:3px solid '+accent+';background:var(--paper);padding:11px 12px;border-radius:2px;cursor:pointer;">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;"><span style="font-family:Geist Mono,monospace;font-weight:700;font-size:13px;border:1px solid var(--line);padding:1px 7px;border-radius:2px;">'+esc(n.ticker)+'</span><span class="mono" style="font-size:12px;font-weight:600;color:'+rsc+';">'+(n.rs!=null?"RS "+n.rs:"")+'</span></div>'+
    '<div style="display:flex;align-items:center;gap:9px;margin-top:9px;">'+sp+nameLine+'</div>'+roleLine+
    '<div style="font-size:11.5px;line-height:1.45;color:var(--slate);margin-top:8px;"><b>Why it matters:</b> '+esc(n.why)+'</div>'+
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:11px;"><span class="mono" style="font-size:11px;font-weight:600;">'+esc(n.regime||"")+'</span><span style="color:var(--wine);font-size:11px;font-weight:600;">tap to read ▸</span></div></div>';
}

function lane(title,color,nodes){
  let h='<div style="display:flex;align-items:center;gap:9px;margin-bottom:14px;"><span style="width:9px;height:9px;background:'+color+';"></span>'+
    '<span style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:'+color+';">'+title+'</span>'+
    '<span style="flex:1;height:1px;background:'+color+';opacity:.3;"></span><span class="mono" style="font-size:12px;font-weight:600;color:var(--slate);">'+nodes.length+'</span></div>';
  h+='<div style="display:flex;flex-direction:column;gap:10px;">'+(nodes.length?nodes.map(nodeCard).join(""):'<div class="dim" style="font-size:12px;">—</div>')+'</div>';
  return h;
}

function renderDecon(){
  const list=SNAP.deconstructions||[];
  if(!list.length) return '<div class="sect-h" style="margin-bottom:6px;">Thesis deconstruction</div>'+deconRequestBox()+
    '<div class="dim">No deconstructions yet — queue one above (or run /keel-thesis locally). Each maps a business into confirming &amp; opposing public names with live tape, plus a business breakdown.</div>';
  if(!deconSlug || !list.find(d=>d.slug===deconSlug)) deconSlug=list[0].slug;
  const sel=list.find(d=>d.slug===deconSlug);
  let picker='<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:16px;">';
  list.forEach(d=>{ picker+='<button data-slug="'+esc(d.slug)+'" class="deconpick" style="background:'+(d.slug===deconSlug?'var(--navy)':'transparent')+';color:'+(d.slug===deconSlug?'var(--paper)':'var(--slate)')+';border:1px solid var(--line);border-radius:3px;padding:5px 12px;cursor:pointer;font-family:Geist Mono,monospace;font-size:11.5px;">'+esc(d.title)+'</button>'; });
  picker+='</div>';
  const head='<div class="sect-h" style="margin-bottom:12px;">Thesis deconstruction · learning tool, not advice</div>'+deconRequestBox()+picker;
  if(deconRaw) return head+'<button id="dxmode" style="margin-bottom:12px;background:none;border:1px solid var(--line);border-radius:3px;padding:5px 12px;cursor:pointer;font-size:11px;color:var(--wine);">◳ Field view</button>'+md(sel.md);
  let p; try{ p=parseDecon(sel.md); }catch(e){ return head+md(sel.md); }
  if(!p.thesis || (!p.confirms.length && !p.opposes.length)) return head+md(sel.md);
  // subject hero (model-written)
  let html=head+'<div style="border-left:5px solid var(--navy);padding:2px 0 2px 16px;margin-bottom:20px;">'+
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap;">'+
    '<div><span class="eyebrow" style="background:var(--navy);color:var(--paper);padding:2px 7px;">Model-written thesis</span>'+
    '<div style="font-family:Big Shoulders Display,sans-serif;font-weight:800;font-size:26px;margin-top:10px;">'+esc(sel.title)+'</div></div>'+
    '<button id="dxmode" style="background:none;border:1px solid var(--line);border-radius:3px;padding:5px 12px;cursor:pointer;font-size:11px;color:var(--wine);">≡ Full memo</button></div>'+
    '<div style="font-size:15px;line-height:1.5;margin-top:10px;max-width:640px;">'+esc(p.thesis)+'</div>'+
    '<div style="display:flex;gap:22px;margin-top:14px;flex-wrap:wrap;">'+
    '<div><div class="eyebrow">Mapped names</div><div class="mono" style="font-weight:600;font-size:16px;">'+(p.confirms.length+p.opposes.length)+'</div></div>'+
    '<div><div class="eyebrow">Confirming</div><div class="mono" style="font-weight:600;font-size:16px;color:'+C.sage+';">'+p.confirms.length+'</div></div>'+
    '<div><div class="eyebrow">Opposing</div><div class="mono" style="font-weight:600;font-size:16px;color:'+C.brick+';">'+p.opposes.length+'</div></div></div></div>';
  // the field: confirms | dynamics | opposes
  html+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:22px;margin-bottom:30px;">'+
    '<div>'+lane("Confirms the thesis",C.sage,p.confirms)+'</div>'+
    '<div><div style="display:flex;align-items:center;gap:9px;margin-bottom:14px;"><span style="width:9px;height:9px;background:'+C.honey+';"></span><span style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:'+C.honey+';">Market dynamics</span><span style="flex:1;height:1px;background:'+C.honey+';opacity:.3;"></span></div>'+
    (p.dyn.length?p.dyn.map(d=>'<div style="display:flex;gap:11px;padding:12px 0;border-bottom:1px solid var(--hair);"><span class="mono" style="font-size:19px;font-weight:700;color:'+d.color+';width:16px;text-align:center;">'+d.arrow+'</span><div style="flex:1;"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;"><span style="font-size:12.5px;font-weight:600;">'+esc(d.label)+'</span><span class="eyebrow" style="color:'+d.color+';border:1px solid '+d.color+';padding:1px 5px;">'+d.tag+'</span></div><div style="font-size:11px;color:var(--slate);margin-top:4px;">'+esc(d.tail)+'</div></div></div>').join(""):'<div class="dim" style="font-size:12px;">—</div>')+'</div>'+
    '<div>'+lane("Opposes / counter-forces",C.brick,p.opposes)+'</div></div>';
  // business breakdown cards
  if(p.cards.length){
    html+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;"><span style="font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;">Business Breakdown</span><span style="flex:1;height:1px;background:var(--line);"></span></div>';
    html+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1px;background:var(--line);border:1px solid var(--line);">';
    p.cards.forEach((c,i)=>{
      html+='<div style="background:var(--paper);padding:14px 15px;">'+
        '<div class="eyebrow" style="color:var(--wine);margin-bottom:10px;">'+esc(c.label)+'</div>'+
        (c.figs.length?'<div style="display:flex;gap:16px;margin-bottom:10px;">'+c.figs.map(f=>'<div class="mono" style="font-weight:700;font-size:21px;color:'+(String(f).indexOf("-")===0?C.brick:C.navy)+';">'+esc(f)+'</div>').join("")+'</div>':'')+
        '<div style="font-size:12px;line-height:1.5;color:var(--slate);">'+esc(c.summary)+(c.full?'…':'')+'</div>'+
        (c.full?'<div class="dxfull" data-i="'+i+'" style="display:none;font-size:12px;line-height:1.55;color:var(--slate);margin-top:9px;padding-top:9px;border-top:1px solid var(--hair);">'+esc(c.full)+'</div><button class="dxmore" data-i="'+i+'" style="margin-top:10px;background:none;border:none;cursor:pointer;font-size:11px;font-weight:600;color:var(--wine);padding:0;">Read full ▸</button>':'')+'</div>';
    });
    html+='</div>';
  }
  return html;
}

function renderGlossary(){
  const groups=[];
  GLOSSARY.forEach(e=>{ if(!groups.includes(e.group)) groups.push(e.group); });
  const q=glossQ.toLowerCase();
  let html='<div class="sect-h" style="margin-bottom:6px;">Glossary · every term on this site, in plain English</div>'+
    '<input id="glossq" type="text" placeholder="search terms… (e.g. ADX, stop, R-multiple)" value="'+esc(glossQ)+'" style="width:100%;max-width:380px;background:#fff;border:1px solid var(--line);color:var(--navy);border-radius:3px;padding:9px 12px;font-family:Geist Mono,monospace;font-size:12px;margin-bottom:16px;">';
  groups.forEach(g=>{
    const items=GLOSSARY.filter(e=>e.group===g && (!q || (e.term+" "+e.what+" "+e.why).toLowerCase().includes(q)));
    if(!items.length) return;
    html+='<div class="sect-h" style="margin:18px 0 4px;color:var(--wine);">'+esc(g)+'</div>';
    items.forEach(e=>{
      const fm=formulaFor(e.term);
      html+='<div style="padding:11px 0;border-top:1px solid var(--hair);">'+
        '<div style="font-weight:600;font-size:13.5px;margin-bottom:4px;">'+esc(e.term)+'</div>'+
        '<div style="font-size:13px;line-height:1.55;">'+esc(e.what)+'</div>'+
        '<div style="font-size:12.5px;line-height:1.55;color:var(--slate);margin-top:3px;"><b style="color:var(--honey);">Why it matters:</b> '+esc(e.why)+'</div>'+
        (fm?'<div class="mono" style="font-size:11.5px;line-height:1.6;margin-top:4px;background:rgba(20,38,63,0.05);border-left:2px solid var(--wine);padding:5px 9px;"><b style="color:var(--wine);">Formula:</b> '+esc(fm)+'</div>':'')+
        '<div class="mono" style="font-size:11.5px;line-height:1.55;color:var(--slate);margin-top:3px;"><b style="color:var(--assist);">Example:</b> '+esc(e.example)+'</div></div>';
    });
  });
  return html;
}

function renderPanels(){
  const list=SNAP.panels||[];
  if(!list.length) return '<div class="sect-h" style="margin-bottom:6px;">Research panels</div>'+
    '<div class="dim">Benchmarking panels (M&amp;A, private equity, SMB entrepreneurship-through-acquisition) populate here. Ask Claude to refresh them, or run the weekly research task.</div>';
  if(!panelSlug || !list.find(d=>d.slug===panelSlug)) panelSlug=list[0].slug;
  const sel=list.find(d=>d.slug===panelSlug);
  let picker='<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:16px;">';
  list.forEach(d=>{ picker+='<button data-slug="'+esc(d.slug)+'" class="panelpick" style="background:'+(d.slug===panelSlug?'var(--navy)':'transparent')+';color:'+(d.slug===panelSlug?'var(--paper)':'var(--slate)')+';border:1px solid var(--line);border-radius:3px;padding:5px 12px;cursor:pointer;font-family:Geist Mono,monospace;font-size:11.5px;">'+esc(d.title)+'</button>'; });
  picker+='</div>';
  return '<div class="sect-h" style="margin-bottom:12px;">Research panels · benchmarking &amp; context</div>'+picker+md(sel.md);
}

function rsBar(rs){
  const v=Number(rs)||0; const w=Math.min(50,Math.abs(v))/50*100; const pos=v>=0;
  return '<div style="display:inline-block;width:90px;height:9px;background:rgba(20,38,63,0.07);border-radius:3px;position:relative;vertical-align:middle;">'+
    '<div style="position:absolute;'+(pos?'left:50%':'right:50%')+';top:0;height:100%;width:'+(w/2)+'%;background:'+(pos?C.sage:C.brick)+';border-radius:3px;"></div>'+
    '<div style="position:absolute;left:50%;top:-2px;width:1px;height:13px;background:rgba(20,38,63,0.25);"></div></div>';
}

function marketRows(rows){
  if(!rows||!rows.length) return '<tr><td colspan="7" class="dim">no data</td></tr>';
  return rows.filter(r=>!r.error).map(r=>
    '<tr><td style="font-weight:600;">'+tk(r.ticker)+'</td><td class="dim" style="color:var(--slate);">'+esc(r.name||"")+
    '</td><td>'+spark(r.spark)+'</td><td>'+esc(r.regime)+
    '</td><td class="'+cls(r.ret_3m_pct)+'">'+fmt(r.ret_3m_pct,1)+'</td>'+
    '<td>'+rsBar(r.rs_3m_pct)+' <span class="'+cls(r.rs_3m_pct)+'" style="font-size:11px;">'+fmt(r.rs_3m_pct,1)+'</span></td></tr>'
  ).join("");
}

function renderMarkets(){
  const m=SNAP.markets;
  if(!m) return '<div class="sect-h" style="margin-bottom:6px;">Global markets</div><div class="dim">Markets board populates with the 07:00 brief (or keel markets). Regions, economies and asset classes ranked by relative strength.</div>';
  const labels=m.group_labels||{};
  const tabs=[["strongest","Strongest"]].concat(Object.keys(m.groups||{}).map(k=>[k,labels[k]||k]));
  let pick='<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px;">';
  tabs.forEach(([k,l])=>{ pick+='<button data-mg="'+k+'" class="mgpick" style="background:'+(marketGroup===k?'var(--navy)':'transparent')+';color:'+(marketGroup===k?'var(--paper)':'var(--slate)')+';border:1px solid var(--line);border-radius:3px;padding:5px 12px;cursor:pointer;font-family:Geist Mono,monospace;font-size:11.5px;">'+esc(l)+'</button>'; });
  pick+='</div>';
  const rows = marketGroup==="strongest" ? m.strongest : (m.groups[marketGroup]||[]);
  const gen=m.generated_at?' · '+m.generated_at.slice(0,10)+' · vs '+esc(m.benchmark):'';
  // dynamic "how to read" insight from the live leaders/laggards
  const all=(m.strongest||[]).filter(r=>r.rs_3m_pct!=null);
  const lead=all[0], lag=all[all.length-1];
  let insight='';
  if(lead&&lag){ insight='<div class="band"><div class="t" style="padding:0;">How to read strength</div></div><div class="band-body" style="font-size:12.5px;line-height:1.6;">'+
    '<p><b>Relative strength (RS)</b> is the one number that matters here — it\\'s how much a market has out- or under-performed the world over 3 months. <b style="color:var(--sage);">Positive = money is flowing IN</b>; negative = flowing out. You ride leaders, you don\\'t bottom-fish laggards.</p>'+
    '<p>Right now <b>'+esc(lead.ticker)+' ('+esc(lead.name||"")+')</b> leads at <b class="green">'+fmt(lead.rs_3m_pct,1)+'</b> and <b>'+esc(lag.ticker)+' ('+esc(lag.name||"")+')</b> lags at <b class="red">'+fmt(lag.rs_3m_pct,1)+'</b>. A leader worth acting on also shows <b>&gt;EMA50 = Y</b> (above water) and <b>ADX ≥ 22</b> (a real trend, not noise). A high RS with N below EMA50 is a fading move; tap any ticker for its full read.</p>'+
    '<p class="dim">Playbook: leaders in a confirmed trend = momentum/trend longs on pullbacks; laggards reclaiming EMA50 with RS turning up = early rotation. Stretched (big +ext) = wait for a pullback, don\\'t chase.</p></div>'; }
  return '<div class="sect-h" style="margin-bottom:6px;">Global markets · trend &amp; relative strength'+gen+'</div>'+
    '<div class="sect-meta" style="margin-bottom:12px;">Where capital is flowing across economies and asset classes. RS = 3-month performance vs the world benchmark. Tap any ticker for its read.</div>'+insight+'<div style="height:14px;"></div>'+pick+
    '<table><tr><th>ticker</th><th>market</th><th>chart (60d)</th><th>regime</th><th style="text-align:left;">3m %</th><th>relative strength</th></tr>'+marketRows(rows)+'</table>';
}

function renderRebalance(){
  const rb=SNAP.rebalance;
  if(!rb||!rb.rows) return '<div class="sect-h" style="margin-bottom:6px;">Rebalance</div><div class="dim">Rebalance planner populates once the book + regime board are live.</div>';
  const amt = (rebalAmount==null) ? rb.add_amount : rebalAmount;
  const totalScore = rb.rows.reduce((s,r)=>s+(r.score||0),0)||1;
  let remaining=amt;
  const computed = rb.rows.slice().sort((a,b)=>(b.score||0)-(a.score||0)).map(r=>{
    const target=amt*((r.score||0)/totalScore);
    const alloc=Math.max(0,Math.min(target, r.cap_usd, remaining));
    remaining=Math.round((remaining-alloc)*100)/100;
    return Object.assign({}, r, {alloc:alloc, wt: amt?alloc/amt*100:0});
  });
  const cash=Math.max(0,remaining);
  let rowsHtml=computed.map(r=>{
    const barw=Math.min(100,r.wt);
    return '<tr><td style="font-weight:600;">'+esc(r.instrument)+'</td><td>'+esc(r.regime)+
      '</td><td>'+(r.favorable?'<span class="green">favorable</span>':'<span class="dim">off-regime</span>')+
      '</td><td style="text-align:right;">$'+fmt(r.alloc)+'</td>'+
      '<td style="width:160px;"><div style="display:flex;align-items:center;gap:6px;"><div style="flex:1;height:9px;background:rgba(20,38,63,0.07);border-radius:3px;"><div style="height:100%;width:'+barw+'%;background:var(--navy);border-radius:3px;"></div></div><span style="font-size:11px;">'+fmt(r.wt,0)+'%</span></div></td></tr>';
  }).join("");
  rowsHtml+='<tr><td style="font-weight:600;">cash</td><td colspan="2" class="dim">hold</td><td style="text-align:right;">$'+fmt(cash)+'</td><td></td></tr>';
  return '<div class="sect-h" style="margin-bottom:6px;">Rebalance · risk-aware allocation</div>'+
    '<div class="sect-meta" style="margin-bottom:14px;">Enter an amount to deploy; the planner weights favorable-regime instruments by confidence, respecting notional &amp; correlation caps. Suggestion only — entries still clear the risk engine.</div>'+
    '<div style="margin-bottom:14px;"><span class="eyebrow">Amount to deploy</span><br><input id="rebamt" type="number" value="'+amt+'" min="0" step="50" style="background:#fff;border:1px solid var(--line);color:var(--navy);border-radius:3px;padding:8px 11px;font-family:Geist Mono,monospace;width:140px;margin-top:5px;"> <span class="dim">equity $'+fmt(rb.equity)+'</span></div>'+
    '<table><tr><th>instrument</th><th>regime</th><th>fit</th><th style="text-align:right;">suggested</th><th>weight</th></tr>'+rowsHtml+'</table>'+
    '<div class="sect-meta" style="margin-top:12px;">'+(rb.notes||[]).map(esc).join(' · ')+'</div>';
}

function renderLayout(){
  const l=loadLayout(); const hidden=new Set(l.hidden||[]);
  const ordered=orderedViews().map(v=>v[0]);
  const all=ordered.concat(VIEWS.map(v=>v[0]).filter(k=>!ordered.includes(k)));
  let html='<div class="band"><div class="t" style="padding:0;">Customize layout</div></div><div class="band-body"><div class="dim" style="margin-bottom:10px;">Show/hide tabs and reorder. Saved on this device.</div>';
  all.forEach((k,i)=>{ const lbl=(VIEWS.find(v=>v[0]===k)||[k,k])[1]; const vis=!hidden.has(k);
    html+='<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-top:1px solid var(--hair);">'+
      '<label style="flex:1;cursor:pointer;"><input type="checkbox" class="lvis" data-k="'+k+'" '+(vis?'checked':'')+'> '+esc(lbl)+'</label>'+
      '<button class="lup" data-k="'+k+'" style="background:transparent;border:1px solid var(--line);border-radius:3px;cursor:pointer;color:var(--slate);">↑</button>'+
      '<button class="ldn" data-k="'+k+'" style="background:transparent;border:1px solid var(--line);border-radius:3px;cursor:pointer;color:var(--slate);">↓</button></div>';
  });
  html+='<button id="lreset" style="margin-top:12px;background:transparent;border:1px solid var(--line);border-radius:3px;padding:5px 12px;cursor:pointer;color:var(--slate);font-family:Geist Mono,monospace;">reset to default</button></div>';
  return html;
}

function renderReports(){
  const r=SNAP.reports||{}, map={brief:r.brief_md,recap:r.recap_md,review:r.review_md};
  const tab=(id,k,lbl)=>'<button id="'+id+'" class="'+(reportTab===k?"on":"")+'" style="background:transparent;border:none;border-bottom:2px solid '+(reportTab===k?"var(--wine)":"transparent")+';color:'+(reportTab===k?"var(--navy)":"var(--slate)")+';font:inherit;font-weight:600;cursor:pointer;margin-right:14px;padding:4px 2px;">'+lbl+'</button>';
  return '<div style="margin-bottom:12px;">'+tab("tb","brief","Morning brief")+tab("trc","recap","Evening recap")+tab("tv","review","Operator review")+'</div><pre>'+esc(map[reportTab]||"not available yet")+'</pre>';
}

function render(){
  if(!SNAP) return;
  $("nav").innerHTML=orderedViews().map(([k,l])=>'<button data-v="'+k+'" class="'+(view===k?"on":"")+'">'+l+'</button>').join("")
    +'<button data-v="layout" class="'+(view==="layout"?"on":"")+'" title="customize layout" style="margin-left:auto;">⚙</button>';
  document.querySelectorAll("#nav button").forEach(b=>b.onclick=()=>{view=b.dataset.v;location.hash=view;render();});
  let html="";
  if(view==="mission") html=renderMission();
  else if(view==="markets") html=renderMarkets();
  else if(view==="rebalance") html=renderRebalance();
  else if(view==="layout") html=renderLayout();
  else if(view==="decon") html=renderDecon();
  else if(view==="panels") html=renderPanels();
  else if(view==="theses") html=renderTheses();
  else if(view==="m7a") html=renderScanPage("m7a","M7A · megacap / AI complex","Daily-bar read from Keel's own regime engine: who trends, who's extended, who leads.");
  else if(view==="smb") html=renderScanPage("smb","SMB · small &amp; mid-cap complex","IWM / MDY / equal-weight breadth — is risk appetite broadening beyond megacaps?");
  else if(view==="opps") html='<div class="sect-h" style="margin-bottom:6px;">Opportunities · decision queue</div><div class="sect-meta" style="margin-bottom:14px;">Each entry is a decision-in-waiting: the setup, what QUALIFIES it (observable), and what INVALIDATES it. Overlaps with Kobe\\'s five instruments can be taken by the engine through the risk gates; the rest are exposure decisions you make at your broker with the same discipline.</div>'+md((SNAP.pages||{}).opportunities_md);
  else if(view==="reads") html='<div class="sect-h" style="margin-bottom:14px;">Reads</div>'+md((SNAP.pages||{}).reads_md);
  else if(view==="glossary") html=renderGlossary();
  else if(view==="reports") html=renderReports();
  $("view").innerHTML=html;
  if(view==="reports"){ $("tb").onclick=()=>{reportTab="brief";render();}; $("trc").onclick=()=>{reportTab="recap";render();}; $("tv").onclick=()=>{reportTab="review";render();}; }
  if(view==="decon"){
    document.querySelectorAll(".deconpick").forEach(b=>b.onclick=()=>{deconSlug=b.dataset.slug;render();});
    const sub=$("deconsub"), inp=$("deconreq"), msg=$("deconmsg");
    if(sub&&inp){ const go=async()=>{ const v=inp.value.trim(); if(!v) return; sub.disabled=true; if(msg)msg.textContent="queuing…";
      try{ const r=await fetch("/api/kobewould/request",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({subject:v})}); const j=await r.json(); if(msg)msg.textContent=j.ok?("Queued “"+j.queued+"”. "+j.pending+" pending — fulfilled on the next daily run."):("error: "+(j.error||r.status)); inp.value=""; }
      catch(e){ if(msg)msg.textContent="error: "+e.message; } finally{ sub.disabled=false; } };
      sub.onclick=go; inp.onkeydown=(e)=>{ if(e.key==="Enter") go(); };
    }
    const dm=$("dxmode"); if(dm) dm.onclick=()=>{ deconRaw=!deconRaw; render(); };
    document.querySelectorAll(".dxmore").forEach(b=>b.onclick=()=>{ const f=document.querySelector('.dxfull[data-i="'+b.dataset.i+'"]'); if(f){ const open=f.style.display!=="none"; f.style.display=open?"none":"block"; b.textContent=open?"Read full ▸":"Read less ▴"; } });
    document.querySelectorAll(".dnode").forEach(b=>b.onclick=async(e)=>{ e.stopPropagation(); b.disabled=true; const t=b.dataset.t; b.textContent="queuing…";
      try{ await fetch("/api/kobewould/request",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({subject:t})}); b.textContent="map queued ✓"; }catch(err){ b.textContent="error"; } });
  }
  if(view==="panels"){ document.querySelectorAll(".panelpick").forEach(b=>b.onclick=()=>{panelSlug=b.dataset.slug;render();}); }
  if(view==="markets"){ document.querySelectorAll(".mgpick").forEach(b=>b.onclick=()=>{marketGroup=b.dataset.mg;render();}); }
  if(view==="glossary"){ const gq=$("glossq"); if(gq){ gq.oninput=()=>{ glossQ=gq.value; const pos=gq.selectionStart; render(); const n=$("glossq"); if(n){ n.focus(); try{n.setSelectionRange(pos,pos);}catch(e){} } }; } }
  if(view==="rebalance"){ const inp=$("rebamt"); if(inp) inp.oninput=()=>{ rebalAmount=Math.max(0,Number(inp.value)||0); const v=$("view"); const pos=inp.selectionStart; render(); const n=$("rebamt"); if(n){ n.focus(); try{n.setSelectionRange(pos,pos);}catch(e){} } }; }
  if(view==="layout"){
    const l=loadLayout(); l.hidden=l.hidden||[]; l.order=orderedViews().map(v=>v[0]).concat(VIEWS.map(v=>v[0]).filter(k=>!orderedViews().map(v=>v[0]).includes(k)));
    document.querySelectorAll(".lvis").forEach(c=>c.onchange=()=>{ const k=c.dataset.k; const h=new Set(loadLayout().hidden||[]); if(c.checked) h.delete(k); else h.add(k); const cur=loadLayout(); cur.hidden=Array.from(h); saveLayout(cur); render(); });
    const move=(k,dir)=>{ const cur=loadLayout(); let ord=(cur.order&&cur.order.length)?cur.order.slice():VIEWS.map(v=>v[0]); ord=ord.filter(x=>VIEWS.find(v=>v[0]===x)); VIEWS.forEach(v=>{ if(!ord.includes(v[0])) ord.push(v[0]); }); const i=ord.indexOf(k); const j=i+dir; if(i<0||j<0||j>=ord.length) return; const t=ord[i]; ord[i]=ord[j]; ord[j]=t; cur.order=ord; saveLayout(cur); render(); };
    document.querySelectorAll(".lup").forEach(b=>b.onclick=()=>move(b.dataset.k,-1));
    document.querySelectorAll(".ldn").forEach(b=>b.onclick=()=>move(b.dataset.k,1));
    const rb=$("lreset"); if(rb) rb.onclick=()=>{ saveLayout({}); render(); };
  }
}

function clock(){
  let t; try{ t=new Date().toLocaleTimeString("en-US",{timeZone:"America/New_York",hour12:false}); }
  catch(e){ t=new Date().toLocaleTimeString("en-US",{hour12:false}); }
  $("clock").textContent=t+" ET";
  $("day").textContent=new Date().toLocaleDateString("en-US",{weekday:"short",year:"numeric",month:"2-digit",day:"2-digit"});
}

async function refresh(){
  const res=await fetch("/api/kobewould/data",{cache:"no-store"});
  if(res.status===401){ location.reload(); return; }
  if(res.status===404){ $("view").innerHTML='<div class="dim">no snapshot published yet — run <code>keel report brief</code> on your machine (it pushes the first snapshot).</div>'; $("age").textContent="awaiting first snapshot"; return; }
  if(res.status===503){ let j={}; try{ j=await res.json(); }catch(e){}
    if(j.error==="storage_not_connected"){
      $("view").innerHTML='<div class="band"><div class="t" style="padding:0;">⚙ storage not connected</div></div><div class="band-body"><div class="md"><p>The terminal is live and you are logged in — but the data pipe (Vercel Blob) is not connected yet, so there is nothing to show.</p><h3>One-time activation</h3><ul><li>Open the Vercel dashboard → your project <b>valahigh-site</b> → <b>Storage</b></li><li>Connect the <b>kobewould-mirror</b> Blob store to the project</li><li>Redeploy</li></ul><p>Until then, use the <b>local dashboard</b> on your machine: <code>keel api</code> → <code>http://127.0.0.1:8400</code> — full data + control buttons, no Blob needed.</p></div></div>';
      $("age").textContent="storage not connected"; return; }
    $("view").innerHTML='<div class="dim">service unavailable (503)</div>'; return; }
  if(!res.ok){ $("view").innerHTML='<div class="dim">error '+res.status+' — try again shortly</div>'; return; }
  SNAP=await res.json();
  const killed=SNAP.kill_switch||SNAP.halted;
  const age=(Date.now()-Date.parse(SNAP.generated_at))/60000;
  $("age").textContent="snapshot "+(age<1?"just now":fmt(age,0)+" min ago");
  // mode indicator (READ-ONLY — no control on the public mirror)
  $("modeLabel").textContent=killed?"HALTED":(SNAP.mode==="live"?"LIVE · BTC ONLY":"PAPER");
  $("modeLabel").style.color=killed?C.brick:(SNAP.mode==="live"?C.wine:C.assist);
  $("modeDot").style.background=killed?C.brick:(SNAP.mode==="live"?C.wine:C.assist);
  $("modeDot").style.animation="kobepulse 2.6s ease-in-out infinite";
  // gates
  const g=SNAP.gates||{};
  const gate=(lbl,on)=>'<span class="pill"><span class="dot" style="width:7px;height:7px;background:'+(on?C.sage:"#c4b89e")+';"></span>'+lbl+'</span>';
  $("gates").innerHTML=gate("ENV",g.env_flag)+gate("CFG",g.config_flag)+gate("ARM",g.arm_file_fresh);
  // banners
  let banners="";
  if(killed) banners+='<div class="banner" style="background:#9c3a2b;color:#f4ecdd;"><span class="dot" style="background:#f4ecdd;animation:kobepulse 1s steps(1) infinite;"></span><b style="letter-spacing:1.5px;">'+(SNAP.kill_switch?"KILL ENGAGED":"HALTED")+'</b><span style="font-size:11.5px;color:#f0d9cf;">'+esc(SNAP.halt_reason||"all new entries blocked · exits managed · clear locally")+'</span></div>';
  if(age>30) banners+='<div class="banner" style="background:rgba(176,125,42,0.12);color:'+C.honey+';border:1px solid rgba(176,125,42,0.4);">⚠ snapshot '+fmt(age,0)+' min old — keel or its publisher may be down</div>';
  $("banners").innerHTML=banners;
  renderControls(killed);
  renderStatline();
  render();
}

function cmdBtn(action,label,bg){
  return '<button class="cmd" data-a="'+action+'" style="background:'+bg+';color:var(--paper);border:0;border-radius:3px;padding:7px 14px;font-family:Geist Mono,monospace;font-size:11.5px;letter-spacing:.5px;cursor:pointer;">'+label+'</button>';
}
function renderControls(killed){
  const passReason = SNAP && SNAP.pass_reason;
  let html='<span class="eyebrow" style="margin-right:4px;">Controls</span>';
  if(killed){ html+=cmdBtn("resume","▶ RESUME TRADING",C.sage); }
  else {
    html+=cmdBtn("halt","⛔ HALT (kill switch)",C.brick);
    html+= passReason ? cmdBtn("unpass","↺ CANCEL PASS DAY",C.honey) : cmdBtn("pass","⏸ PASS TODAY",C.honey);
  }
  html+='<span id="cmdmsg" class="mono" style="font-size:10.5px;color:var(--slate);margin-left:4px;"></span>';
  $("controls").innerHTML=html;
  document.querySelectorAll(".cmd").forEach(b=>b.onclick=async()=>{
    const a=b.dataset.a;
    if((a==="halt"||a==="resume") && !confirm(a==="halt"?"Halt all trading? Blocks new entries until you resume.":"Resume trading?")) return;
    document.querySelectorAll(".cmd").forEach(x=>x.disabled=true);
    $("cmdmsg").textContent="sending…";
    try{ const r=await fetch("/api/kobewould/command",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:a})}); const j=await r.json();
      $("cmdmsg").textContent=j.ok?("queued “"+j.queued+"” — applies within ~1 min on your machine"):("error: "+(j.error||r.status)); }
    catch(e){ $("cmdmsg").textContent="error: "+e.message; }
    finally{ document.querySelectorAll(".cmd").forEach(x=>x.disabled=false); }
  });
}
document.addEventListener("click",(e)=>{ const t=e.target.closest&&e.target.closest(".tk"); if(t&&SNAP){ e.preventDefault(); showTk(t.dataset.t); } });
document.addEventListener("keydown",(e)=>{ if(e.key==="Escape") closeTk(); });
clock(); setInterval(clock,1000);
refresh(); setInterval(refresh,60000);
</script>
</div>`);

export default async function handler(req, res) {
  if (!configured()) return sendHtml(res, 200, SETUP_INFRA);
  const url = req.url || "";
  if (isAuthed(req, env("KOBEWOULD_SECRET"))) {
    if (/[?&]change=1/.test(url) && blobAvailable()) return sendHtml(res, 200, CHANGE);
    return sendHtml(res, 200, APP);
  }
  const forceSetup = /[?&]setup=1/.test(url);
  if (setupEnabled()) {
    const cred = await readCred();
    if (!cred || forceSetup) return sendHtml(res, 200, SETUP);
  }
  return sendHtml(res, 200, LOGIN);
}
