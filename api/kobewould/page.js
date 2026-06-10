// GET /kobewould (rewritten here) — login wall or the read-only "Kobe" terminal.
// Webster aesthetic: warm eggshell paper, navy text, wine accent, with navy
// "provenance bands" marking the surfaces an LLM touched (Posture, Decision
// Journal) while the deterministic money path stays warm paper.
// READ-ONLY by construction (ADR-018): kill/mode are indicators, not buttons.
import { blobAvailable, configured, env, isAuthed, readCred, sendHtml, setupEnabled } from "./_lib.js";

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

const APP = SHELL(`<div class="wrap">
  <div id="banners"></div>
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
let SNAP=null, view=location.hash.slice(1)||"mission", reportTab="brief";
const VIEWS=[["mission","Mission"],["decon","Deconstruct"],["panels","Panels"],["theses","Theses"],["m7a","M7A"],["smb","SMB"],
             ["opps","Opportunities"],["reads","Reads"],["reports","Reports"]];
let deconSlug=null, panelSlug=null;
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
  const first = '<div style="padding-right:22px;">'+
    '<div class="eyebrow" style="margin-bottom:8px;">Equity</div>'+
    '<div class="mono" style="font-weight:600;font-size:30px;letter-spacing:-.5px;">$'+fmt(eq)+'</div>'+
    '<div class="mono" style="font-size:10.5px;color:var(--slate);margin-top:4px;">cash $'+fmt(b.cash)+'</div></div>';
  const posture = SNAP.posture;
  const postureBig = posture ? ('risk ×'+fmt(posture.risk_factor,2)) : 'neutral';
  const postureSub = posture ? ((posture.stand_down&&posture.stand_down.length?('down: '+posture.stand_down.join(", ")):'')+(posture.note?(' · '+esc(posture.note)):'')) : 'no LLM reduction today';
  $("statline").innerHTML = first +
    stat("Day P&amp;L", (r.day_pnl>=0?"+":"")+"$"+fmt(Math.abs(r.day_pnl)), r.day_pnl>=0?C.sage:C.brick, "realized today") +
    stat("Risk budget", "$"+fmt(r.risk_budget_usd), C.navy, fmt(r.per_trade_risk_pct,2)+"% eq · $"+fmt(r.open_risk_usd)+" open") +
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
  return '<table><tr><th>ticker</th><th>regime</th><th>conf</th><th>ADX</th><th>ext</th><th>&gt;EMA50</th><th style="text-align:right;">3m %</th><th style="text-align:right;">RS vs bench</th></tr>'+
    rows.map(r=>r.error?'<tr><td style="font-weight:600;">'+esc(r.ticker)+'</td><td colspan="7" class="dim">'+esc(r.error)+'</td></tr>'
      :'<tr><td style="font-weight:600;">'+esc(r.ticker)+'</td><td>'+esc(r.regime)+'</td><td>'+fmt(r.regime_conf,2)+'</td><td>'+fmt(r.adx,1)+'</td><td>'+fmt(r.ext_atr,2)+'</td><td>'+(r.above_ema50?"Y":"N")+
      '</td><td style="text-align:right;" class="'+cls(r.ret_3m_pct)+'">'+fmt(r.ret_3m_pct,1)+'</td><td style="text-align:right;" class="'+cls(r.rs_3m_pct)+'">'+fmt(r.rs_3m_pct,1)+'</td></tr>'
    ).join("")+'</table>';
}

function renderScanPage(key,title,blurb){
  const scan=SNAP.trend_scan||{}, pages=SNAP.pages||{};
  const gen=scan.generated_at?' · scan '+scan.generated_at.slice(0,16)+' · bench '+esc(scan.benchmark):'';
  return '<div class="sect-h" style="margin-bottom:6px;">'+title+'</div><div class="sect-meta" style="margin-bottom:14px;">'+blurb+gen+'</div>'+
    scanTable(scan[key])+'<div style="margin-top:24px;"><div class="sect-h" style="margin-bottom:10px;">Narrative · weekly research</div>'+md(pages[key+"_md"])+'</div>';
}

function renderDecon(){
  const list=SNAP.deconstructions||[];
  if(!list.length) return '<div class="sect-h" style="margin-bottom:6px;">Thesis deconstruction</div>'+
    '<div class="dim">No deconstructions yet. Ask Claude: "deconstruct &lt;company or theme&gt;" '+
    '(e.g. SpaceX, the AI-power buildout, GLP-1 drugs). It breaks the business into segments, '+
    'maps public suppliers/customers/competitors, pulls each ticker\\'s regime &amp; relative-strength read, '+
    'and frames long/short/ETF exposure — as a learning tool, not advice.</div>';
  if(!deconSlug || !list.find(d=>d.slug===deconSlug)) deconSlug=list[0].slug;
  const sel=list.find(d=>d.slug===deconSlug);
  let picker='<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:16px;">';
  list.forEach(d=>{ picker+='<button data-slug="'+esc(d.slug)+'" class="deconpick" style="background:'+(d.slug===deconSlug?'var(--navy)':'transparent')+';color:'+(d.slug===deconSlug?'var(--paper)':'var(--slate)')+';border:1px solid var(--line);border-radius:3px;padding:5px 12px;cursor:pointer;font-family:Geist Mono,monospace;font-size:11.5px;">'+esc(d.title)+'</button>'; });
  picker+='</div>';
  return '<div class="sect-h" style="margin-bottom:12px;">Thesis deconstruction · learning tool, not advice</div>'+picker+md(sel.md);
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

function renderReports(){
  const r=SNAP.reports||{}, map={brief:r.brief_md,recap:r.recap_md,review:r.review_md};
  const tab=(id,k,lbl)=>'<button id="'+id+'" class="'+(reportTab===k?"on":"")+'" style="background:transparent;border:none;border-bottom:2px solid '+(reportTab===k?"var(--wine)":"transparent")+';color:'+(reportTab===k?"var(--navy)":"var(--slate)")+';font:inherit;font-weight:600;cursor:pointer;margin-right:14px;padding:4px 2px;">'+lbl+'</button>';
  return '<div style="margin-bottom:12px;">'+tab("tb","brief","Morning brief")+tab("trc","recap","Evening recap")+tab("tv","review","Operator review")+'</div><pre>'+esc(map[reportTab]||"not available yet")+'</pre>';
}

function render(){
  if(!SNAP) return;
  $("nav").innerHTML=VIEWS.map(([k,l])=>'<button data-v="'+k+'" class="'+(view===k?"on":"")+'">'+l+'</button>').join("");
  document.querySelectorAll("#nav button").forEach(b=>b.onclick=()=>{view=b.dataset.v;location.hash=view;render();});
  let html="";
  if(view==="mission") html=renderMission();
  else if(view==="decon") html=renderDecon();
  else if(view==="panels") html=renderPanels();
  else if(view==="theses") html=renderTheses();
  else if(view==="m7a") html=renderScanPage("m7a","M7A · megacap / AI complex","Daily-bar read from Keel's own regime engine: who trends, who's extended, who leads.");
  else if(view==="smb") html=renderScanPage("smb","SMB · small &amp; mid-cap complex","IWM / MDY / equal-weight breadth — is risk appetite broadening beyond megacaps?");
  else if(view==="opps") html='<div class="sect-h" style="margin-bottom:6px;">Opportunities · learning watchlist</div><div class="sect-meta" style="margin-bottom:14px;">Study material, not signals — Keel trades only its five configured instruments through the risk engine.</div>'+md((SNAP.pages||{}).opportunities_md);
  else if(view==="reads") html='<div class="sect-h" style="margin-bottom:14px;">Reads</div>'+md((SNAP.pages||{}).reads_md);
  else if(view==="reports") html=renderReports();
  $("view").innerHTML=html;
  if(view==="reports"){ $("tb").onclick=()=>{reportTab="brief";render();}; $("trc").onclick=()=>{reportTab="recap";render();}; $("tv").onclick=()=>{reportTab="review";render();}; }
  if(view==="decon"){ document.querySelectorAll(".deconpick").forEach(b=>b.onclick=()=>{deconSlug=b.dataset.slug;render();}); }
  if(view==="panels"){ document.querySelectorAll(".panelpick").forEach(b=>b.onclick=()=>{panelSlug=b.dataset.slug;render();}); }
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
  renderStatline();
  render();
}
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
