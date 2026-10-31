/* ═══════════ MAIN LOOP & BOOT — Car Company Tycoon ═══════════ */
const SAVE_KEY = "cct_save_v1";
let tickTimer = null;

// ─────────── Game loop ───────────
function setSpeed(){
  if(tickTimer) clearInterval(tickTimer);
  const interval = G.paused ? 0 : (G.speed===1? 2600 : G.speed===2? 1400 : 700);
  if(!G.paused){
    tickTimer = setInterval(()=>{
      Engine.tickMonth(G);
      // track total sold
      G.totalSold += (G.monthUnits||0);
      refreshUI();
      autosave();
    }, interval);
  }
}
function refreshUI(){
  updateHUD();
  const active = $$(".tab").find(t=>t.classList.contains("active"));
  if(active) renderTab(active.dataset.tab);
}

// ─────────── Save / load ───────────
function saveGame(manual){
  try{
    localStorage.setItem(SAVE_KEY, JSON.stringify(G));
    if(manual) toast("💾 Game saved.","good");
  }catch(e){ if(manual) toast("Save failed: "+e.message,"bad"); }
}
let lastAutosave = 0;
function autosave(){
  const now = Date.now();
  if(now-lastAutosave > 15000){ lastAutosave=now; saveGame(false); }
}
function loadGame(){
  const raw = localStorage.getItem(SAVE_KEY);
  if(!raw) return null;
  try{ return JSON.parse(raw); }catch(e){ return null; }
}
function gameOver(s){
  if(tickTimer) clearInterval(tickTimer);
  modal("💥 BANKRUPTCY", `<p><b>${s.company}</b> has gone bankrupt in ${s.year}.</p>
    <p>Cars sold all-time: ${fmt(s.totalSold)} · Final reputation: ${Math.round(s.rep)}</p>
    <p>Reload the page to start a new company!</p>`);
  localStorage.removeItem(SAVE_KEY);
}

// ─────────── Boot ───────────
function startGame(state){
  G = state;
  $("#start-screen").classList.add("hidden");
  $("#game-screen").classList.remove("hidden");
  updateHUD();
  switchTab("overview");
  setSpeed();
}

document.addEventListener("DOMContentLoaded", ()=>{
  // continue button availability
  const existing = loadGame();
  if(!existing) $("#btn-continue").disabled = true;

  $("#btn-start").onclick = ()=>{
    const name = $("#company-name-input").value.trim() || "Rivet Motors";
    if(existing && !confirm("A saved game exists. Starting new will OVERWRITE it. Continue?")) return;
    startGame(Engine.newState(name));
    saveGame(false);
    setTimeout(()=>modal("🏁 Welcome to "+name+"!",
      "<p style='text-align:left'>You run a car company from <b>1950</b> to the modern era.<br>"+
      "① Go to <b>✏️ Design Studio</b> and publish your first car.<br>"+
      "② Open <b>🏭 Factory</b>, assign it to Line L1 and set a production target.<br>"+
      "③ Cars sell each month from stock. Reinvest, research tech, hire staff!<br>"+
      "Watch the 🎯 Objectives panel on Overview for guidance.</p>"),350);
  };
  $("#btn-continue").onclick = ()=>{
    const s = loadGame();
    if(s) startGame(s); else toast("No save found.","bad");
  };

  // HUD controls
  $("#btn-pause").onclick = ()=>{ G.paused=!G.paused; setSpeed(); updateHUD(); };
  $("#btn-speed").onclick = ()=>{ G.speed = G.speed>=3?1:G.speed+1; setSpeed(); updateHUD(); };
  $("#btn-save").onclick = ()=>saveGame(true);

  // tabs
  $$(".tab").forEach(t=>t.onclick=()=>switchTab(t.dataset.tab));

  // design studio choose-step buttons
  $("#new-model-segment").addEventListener("change", refreshBodyOptions);
  $("#btn-new-model").onclick = ()=>{
    openEditor(null);
  };
  $("#btn-edit-model").onclick = ()=>{
    const id = +$("#design-model-select").value;
    const m = G.models.find(x=>x.id===id);
    if(!m){ toast("Create a model first.","bad"); return; }
    openEditor(m);
  };
  $("#btn-cancel-design").onclick = ()=>{ draft=null; renderDesignChoose(); };
  $("#btn-publish-model").onclick = ()=>{
    const pi = $("#price-input");
    if(pi) draftPrice = +pi.value||draftPrice;
    const err = Engine.publishModel(G, draft, draftPrice);
    if(err){ $("#design-msg").textContent=err; toast("⚠️ "+err,"bad"); }
    else { draft=null; renderDesignChoose(); updateHUD(); }
  };

  // keyboard shortcuts
  document.addEventListener("keydown", e=>{
    if(!G || $("#game-screen").classList.contains("hidden")) return;
    if(e.code==="Space" && e.target.tagName!=="INPUT"){ e.preventDefault(); G.paused=!G.paused; setSpeed(); updateHUD(); }
    if(e.key==="s" && (e.ctrlKey||e.metaKey)){ e.preventDefault(); saveGame(true); }
  });

  // beforeunload autosave
  window.addEventListener("beforeunload", ()=>{ if(G) saveGame(false); });

  // footer credit
  const f=document.createElement("footer");
  f.className="credit";
  f.innerHTML="🏁 Car Company Tycoon — a fan-made web tribute to the mobile classic. Progress saves automatically.";
  $("#content").appendChild(f);
});
