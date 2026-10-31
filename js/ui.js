/* ═══════════ UI — Car Company Tycoon ═══════════ */
let G = null;               // game state (global)
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// ─────────── Toasts & modal ───────────
function toast(msg, cls){
  const t = document.createElement("div");
  t.className = "toast "+(cls||"");
  t.innerHTML = msg;
  $("#toasts").appendChild(t);
  setTimeout(()=>{ t.style.opacity="0"; t.style.transition="opacity .4s"; setTimeout(()=>t.remove(),450); }, 3800);
}
function modal(title, html){
  $("#modal-title").innerHTML = title;
  $("#modal-body").innerHTML = html;
  $("#modal").classList.remove("hidden");
}
document.addEventListener("click", e=>{ if(e.target.id==="modal-close") $("#modal").classList.add("hidden"); });

// ─────────── Car SVG preview ───────────
const CAR_COLORS = ["#c0392b","#2980b9","#27ae60","#f39c12","#8e44ad","#ecf0f1","#2c3e50","#16a085"];
function carSVG(body, colorIdx, scale){
  const c = CAR_COLORS[(colorIdx||0)%CAR_COLORS.length];
  const s = scale||1;
  const W=170*s, H=80*s;
  let shape="";
  switch(body){
    case "coupe": shape=`<path d="M20 55 Q30 35 60 33 L95 33 Q120 34 140 55 Z" fill="${c}" stroke="#000" stroke-opacity=".25"/>
      <rect x="15" y="48" width="140" height="14" rx="6" fill="${c}" stroke="#000" stroke-opacity=".25"/>
      <path d="M62 36 L92 36 Q112 38 126 52 L60 52 Z" fill="#aee7ff" opacity=".85"/>`; break;
    case "roadster": shape=`<rect x="18" y="46" width="136" height="15" rx="7" fill="${c}" stroke="#000" stroke-opacity=".25"/>
      <path d="M60 46 Q70 34 95 34 L110 46 Z" fill="#333" opacity=".7"/>`; break;
    case "convert": shape=`<rect x="18" y="46" width="136" height="15" rx="7" fill="${c}" stroke="#000" stroke-opacity=".25"/>
      <path d="M55 46 Q68 32 100 32 L118 46 Z" fill="${c}" stroke="#000" stroke-opacity=".3"/>
      <path d="M62 44 Q72 36 96 36 L108 44 Z" fill="#dff3ff" opacity=".8"/>`; break;
    case "sedan": shape=`<rect x="15" y="46" width="142" height="15" rx="6" fill="${c}" stroke="#000" stroke-opacity=".25"/>
      <path d="M45 46 L58 30 L112 30 L130 46 Z" fill="${c}" stroke="#000" stroke-opacity=".3"/>
      <path d="M62 33 L74 33 L74 44 L56 44 Z" fill="#aee7ff" opacity=".85"/>
      <path d="M78 33 L108 33 L120 44 L78 44 Z" fill="#aee7ff" opacity=".85"/>`; break;
    case "hatch": shape=`<rect x="20" y="46" width="128" height="15" rx="6" fill="${c}" stroke="#000" stroke-opacity=".25"/>
      <path d="M45 46 L58 31 L108 31 L128 46 Z" fill="${c}" stroke="#000" stroke-opacity=".3"/>
      <path d="M62 34 L80 34 L80 44 L55 44 Z" fill="#aee7ff" opacity=".85"/>
      <path d="M84 34 L104 34 L118 44 L84 44 Z" fill="#aee7ff" opacity=".85"/>`; break;
    case "wagon": shape=`<rect x="15" y="46" width="145" height="15" rx="6" fill="${c}" stroke="#000" stroke-opacity=".25"/>
      <path d="M42 46 L54 30 L140 30 L148 46 Z" fill="${c}" stroke="#000" stroke-opacity=".3"/>
      <path d="M58 33 L76 33 L76 44 L52 44 Z" fill="#aee7ff" opacity=".85"/>
      <path d="M80 33 L100 33 L100 44 L80 44 Z" fill="#aee7ff" opacity=".85"/>
      <path d="M104 33 L136 33 L140 44 L104 44 Z" fill="#aee7ff" opacity=".85"/>`; break;
    case "pickup": shape=`<rect x="15" y="46" width="145" height="15" rx="5" fill="${c}" stroke="#000" stroke-opacity=".25"/>
      <path d="M40 46 L52 30 L92 30 L100 46 Z" fill="${c}" stroke="#000" stroke-opacity=".3"/>
      <path d="M56 33 L70 33 L70 44 L50 44 Z" fill="#aee7ff" opacity=".85"/>
      <path d="M74 33 L88 33 L92 44 L74 44 Z" fill="#aee7ff" opacity=".85"/>
      <rect x="104" y="36" width="52" height="10" fill="#222b3d" stroke="#000" stroke-opacity=".3"/>`; break;
    case "suvbody": shape=`<rect x="16" y="42" width="142" height="19" rx="6" fill="${c}" stroke="#000" stroke-opacity=".25"/>
      <path d="M40 42 L50 24 L122 24 L136 42 Z" fill="${c}" stroke="#000" stroke-opacity=".3"/>
      <path d="M55 27 L72 27 L72 40 L48 40 Z" fill="#aee7ff" opacity=".85"/>
      <path d="M76 27 L98 27 L98 40 L76 40 Z" fill="#aee7ff" opacity=".85"/>
      <path d="M102 27 L118 27 L128 40 L102 40 Z" fill="#aee7ff" opacity=".85"/>`; break;
    case "van": shape=`<rect x="16" y="40" width="142" height="21" rx="6" fill="${c}" stroke="#000" stroke-opacity=".25"/>
      <path d="M30 40 L38 22 L140 22 L146 40 Z" fill="${c}" stroke="#000" stroke-opacity=".3"/>
      <path d="M42 25 L60 25 L60 38 L36 38 Z" fill="#aee7ff" opacity=".85"/>
      <path d="M64 25 L136 25 L138 38 L64 38 Z" fill="#8fa8c8" opacity=".5"/>`; break;
    default: shape=`<rect x="15" y="46" width="142" height="15" rx="6" fill="${c}"/>`;
  }
  return `<svg class="car-svg" width="${W}" height="${H}" viewBox="0 0 170 80">
    ${shape}
    <circle cx="48" cy="62" r="12" fill="#111"/><circle cx="48" cy="62" r="6" fill="#777"/>
    <circle cx="124" cy="62" r="12" fill="#111"/><circle cx="124" cy="62" r="6" fill="#777"/>
    <rect x="148" y="50" width="8" height="5" rx="2" fill="#ffe9a8"/>
    <rect x="16" y="50" width="7" height="5" rx="2" fill="#ff6b6b"/>
  </svg>`;
}

// ─────────── Rating bars ───────────
function ratingRow(label,val,color){
  return `<div class="rating-row"><div class="rl"><span>${label}</span><span>${val}</span></div>
    <div class="bar"><i style="width:${val}%"></i></div></div>`;
}

// ─────────── HUD & tabs ───────────
function updateHUD(){
  $("#hud-company").textContent = G.company;
  $("#hud-date").textContent = MONTHS[G.month]+" "+G.year;
  $("#hud-money").textContent = fmt(G.money);
  $("#hud-rep").textContent = Math.round(G.rep);
  $("#hud-value").textContent = fmt(companyValue(G));
  $("#btn-pause").textContent = G.paused ? "▶" : "⏸";
  $("#btn-speed").textContent = "⏩ Speed: "+G.speed+"x";
}

function switchTab(id){
  $$(".tab").forEach(t=>t.classList.toggle("active", t.dataset.tab===id));
  $$(".panel").forEach(p=>p.classList.add("hidden"));
  $("#tab-"+id).classList.remove("hidden");
  renderTab(id);
}
function renderTab(id){
  if(id==="overview") renderOverview();
  if(id==="models") renderModels();
  if(id==="factory") renderFactory();
  if(id==="market") renderMarket();
  if(id==="research") renderResearch();
  if(id==="staff") renderStaff();
  if(id==="finances") renderFinances();
  if(id==="design") renderDesignChoose();
}

// ─────────── Overview ───────────
function renderOverview(){
  const pubs = G.models.filter(m=>m.published);
  const st = [
    ["Founded","1950"],["Age",(G.year-1950)+" years"],
    ["Active models",pubs.length],["Total cars sold",fmt(G.totalSold)],
    ["Production capacity",Engine.capacityPerLine(G)+" /line/mo"],
    ["Stock on hand", G.stock.reduce((a,c)=>a+c.qty,0)],
    ["Employees",G.staff.length],["Loan", "$"+fmt(G.loan)],
    ["Economy", G.econMod>1?"Boom 🔥":G.econMod<1?"Recession ❄":"Normal"],
    ["Trend", G.trendSeg? SEGMENTS.find(s=>s.id===G.trendSeg).name+" 📈":"—"],
  ];
  $("#ov-stats").innerHTML = st.map(x=>`<div><span>${x[0]}</span><span>${x[1]}</span></div>`).join("");
  $("#ov-news").innerHTML = G.news.slice(0,25).map(n=>`<div class="news-item"><span class="news-date">${n.date}</span>${n.txt}</div>`).join("") || "<i>No news yet.</i>";
  $("#ov-awards").innerHTML = G.awards.length? G.awards.slice().reverse().map(a=>`<span class="award-chip">🏅 ${a.year} ${a.name} — ${a.model}</span>`).join("") : "<i>No awards yet. Build great cars!</i>";
  const objs = OBJECTIVES.map(o=>({o,done:!!G.objectivesDone[o.id]})).filter(x=>!x.done).slice(0,4);
  const doneCnt = Object.keys(G.objectivesDone).length;
  $("#ov-objectives").innerHTML = `<div style='margin-bottom:6px;color:var(--dim)'>Completed: ${doneCnt}/${OBJECTIVES.length}</div>`+
    objs.map(x=>`<div class="obj"><span>▢ ${x.o.txt}</span><span class="rew">$${fmt(x.o.rew)}</span></div>`).join("") +
    (objs.length?"":"<div class='obj done'>✔ All objectives complete — you are a true tycoon!</div>");
  const sum = G.lastStatement;
  $("#ov-sales-summary").innerHTML = sum? `<div style="font-size:13px;margin-top:6px">Last month: <b class="${sum.net>=0?'pos':'neg'}">${sum.net>=0?'+':''}$${fmt(sum.net)}</b> · ${fmt(G.monthUnits||0)} cars sold</div>`:"";
  drawChart($("#chart-sales"), G.history.slice(-24).map(h=>h.cash), "#4caf7d");
}
function drawChart(canvas, data, color){
  const ctx = canvas.getContext("2d");
  const W=canvas.width, H=canvas.height;
  ctx.clearRect(0,0,W,H);
  if(data.length<2){ ctx.fillStyle="#556"; ctx.font="12px sans-serif"; ctx.fillText("Not enough history yet…",12,20); return; }
  const min=Math.min(...data), max=Math.max(...data), pad=14;
  ctx.strokeStyle="#2f3b52"; ctx.beginPath(); ctx.moveTo(pad,H-pad); ctx.lineTo(W-4,H-pad); ctx.stroke();
  ctx.beginPath(); ctx.strokeStyle=color; ctx.lineWidth=2;
  data.forEach((v,i)=>{
    const x = pad+(W-pad-4)*i/(data.length-1);
    const y = max===min? H/2 : (H-pad) - (H-pad*2)*(v-min)/(max-min);
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  });
  ctx.stroke();
  ctx.fillStyle="#8b98b3"; ctx.font="10px sans-serif";
  ctx.fillText("$"+fmt(max),4,12); ctx.fillText("$"+fmt(min),4,H-4);
}

// ─────────── Design Studio ───────────
let draft = null;         // current spec being edited
let draftPrice = 0;
let etab = "engine";
let esubsys = "layout";

function renderDesignChoose(){
  const sel = $("#design-model-select");
  sel.innerHTML = G.models.filter(m=>!m.discontinued).map(m=>`<option value="${m.id}">${m.name} (${SEGMENTS.find(g=>g.id===m.segment).name})</option>`).join("") || '<option value="">— no models yet —</option>';
  const segSel = $("#new-model-segment");
  segSel.innerHTML = SEGMENTS.filter(s=>s.unlock<=G.year).map(s=>`<option value="${s.id}">${s.icon} ${s.name}</option>`).join("");
  refreshBodyOptions();
  $("#ds-choose").classList.remove("hidden");
  $("#ds-editor").classList.add("hidden");
  $("#design-help").innerHTML = `<p>Pick a segment first — each buyer group cares about different things:</p>
    <ul style="margin:8px 0 8px 18px;line-height:1.7">${SEGMENTS.filter(s=>s.unlock<=G.year).map(s=>`<li><b>${s.icon} ${s.name}</b>: ideal price ~$${fmt(s.priceIdeal*Engine.inflation(G))}</li>`).join("")}</ul>
    <p>💡 Research new technologies to unlock better parts. Hire designers & engineers to boost quality.</p>`;
  renderBuildSide();
}
function refreshBodyOptions(){
  const segId = $("#new-model-segment").value || "budget";
  const bodySel = $("#new-model-body");
  const compat = BODY_TYPES.filter(b=>b.segs.includes(segId));
  bodySel.innerHTML = compat.map(b=>`<option value="${b.id}">${b.name}</option>`).join("");
}

function openEditor(existingModel){
  if(existingModel){
    draft = JSON.parse(JSON.stringify(existingModel.spec));
    draft._existingId = existingModel.id;
    draftPrice = existingModel.price;
  } else {
    const name = $("#new-model-name").value.trim() || "Model "+(G.models.length+1);
    const seg = $("#new-model-segment").value;
    const body = $("#new-model-body").value;
    draft = Engine.defaultSpec(G, name, seg, body);
    const ideal = SEGMENTS.find(s=>s.id===seg).priceIdeal*Engine.inflation(G);
    draftPrice = Math.round(ideal*0.95/10)*10;
  }
  $("#ds-choose").classList.add("hidden");
  $("#ds-editor").classList.remove("hidden");
  $("#editor-title").textContent = draft.name+" — "+SEGMENTS.find(s=>s.id===draft.segment).name+" ("+BODY_TYPES.find(b=>b.id===draft.body).name+")";
  etab="engine"; esubsys="layout";
  renderEditor();
}

const PART_TABS = {
  engine:{ subsys:[["layout","Engine Block"],["disp","Displacement"],["fuel","Fuel Type"],["asp","Aspiration"],["fuelSys","Fuel System"],["motor","Electric Motor"],["batt","Battery Pack"]] },
  transmission:{ subsys:[["gearbox","Gearbox"],["drivetrain","Drivetrain"]] },
  bodywork:{ subsys:[["chassis","Chassis"]] },
  suspension:{ subsys:[["susp","Suspension"],["tyres","Tyres"],["brakes","Brakes"]] },
  interior:{ subsys:[["interior","Interior Trim"]] },
  electronics:{ subsys:[["electronics","Electronics"],["safety","Safety Systems"],["emissions","Emissions Control"]] },
  options:{ subsys:[["options","Options & Styling"]] },
};
function partListFor(sub){
  switch(sub){
    case "layout": return ENGINE_LAYOUTS; case "disp": return DISPLACEMENTS; case "fuel": return ENGINE_FUELS;
    case "asp": return ASPIRATION; case "fuelSys": return FUEL_SYS; case "motor": return EV_MOTORS; case "batt": return EV_BATTERIES;
    case "gearbox": return GEARBOXES; case "drivetrain": return DRIVETRAINS; case "chassis": return CHASSIS;
    case "susp": return SUSPENSIONS; case "tyres": return TYRES; case "brakes": return BRAKES;
    case "interior": return INTERIORS; case "electronics": return ELECTRONICS; case "safety": return SAFETY_EQUIP;
    case "emissions": return EMISSIONS; case "options": return OPTIONS;
  }
  return [];
}
function partAvailable(s,p){
  if(p.tech && !s.techs[p.tech]) return false;
  if(p.year && p.year > s.year) return false;
  return true;
}
function isEVDraft(){ return !!draft.engine.motor; }

function renderEditor(){
  // tab bar active state
  $$(".etab").forEach(b=>b.classList.toggle("active", b.dataset.etab===etab));
  const area = $("#editor-part-area");
  const cfg = PART_TABS[etab];
  // filter subsys relevant to ev/petrol
  let subs = cfg.subsys.filter(([k])=>{
    if(etab==="engine"){
      if(isEVDraft()) return ["motor","batt"].includes(k);
      return !["motor","batt"].includes(k);
    }
    return true;
  });
  if(!subs.some(x=>x[0]===esubsys)) esubsys = subs[0][0];

  let left = `<div class="subsys-list">`+subs.map(([k,label])=>
    `<button class="subsys-btn ${k===esubsys?'active':''}" data-sub="${k}">${label}<small>${currentPartName(k)}</small></button>`).join("")+`</div>`;
  if(etab==="engine"){
    left += `<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
      <button class="btn small ${!isEVDraft()?'primary':''}" id="toggleICE">⛽ Petrol</button>
      <button class="btn small ${isEVDraft()?'primary':''}" id="toggleEV" ${G.techs.evdrive?"":"disabled title='Research EV Powertrain first'"}>🔋 Electric</button></div>`;
  }

  let right = `<div class="parts-grid">`;
  if(esubsys==="options"){
    for(const O of OPTIONS){
      const on = (draft.options||[]).includes(O.id);
      const avail = O.year<=G.year;
      right += `<div class="part-card ${on?'selected':''} ${avail?'':'locked'}" data-opt="${O.id}">
        <div class="pname">${on?'☑':'☐'} ${O.name}</div>
        <div class="pmeta">${statDesc(O)}${avail?'':' · since '+O.year}</div>
        <div class="pcost">+$${fmt(O.cost)}</div></div>`;
    }
  } else {
    const list = partListFor(esubsys);
    for(const p of list){
      const avail = partAvailable(G,p);
      const selected = getPartVal(esubsys)===p.id;
      const lockedReason = p.tech && !G.techs[p.tech] ? "Requires "+TECHS.find(t=>t.id===p.tech).name : (p.year>G.year? "From year "+p.year : "");
      right += `<div class="part-card ${selected?'selected':''} ${avail?'':'locked'}" data-part="${p.id}" data-sub="${esubsys}">
        <div class="pname">${p.name}</div>
        <div class="pmeta">${statDesc(p)}</div>
        ${p.cost!=null?`<div class="pcost">$${fmt(p.cost)}</div>`:''}
        ${!avail?`<div class="ptech">🔒 ${lockedReason}</div>`:''}</div>`;
    }
  }
  right += `</div>`;
  area.innerHTML = left+right;

  // live ratings
  const ev = Engine.evalSpec(G, draft);
  const R = ev.R;
  $("#editor-car-preview").innerHTML = carSVG(draft.body, draft.id||G.nextModelId, 1);
  $("#editor-ratings").innerHTML =
    `<div style="grid-column:1/-1;font-size:13px">⚙️ ${ev.hp} hp · ⚖️ ${ev.mass} kg · 🏷️ Est. unit cost <b>$${fmt(ev.unitCost)}</b></div>`+
    ratingRow("Performance",R.performance)+ratingRow("Reliability",R.reliability)+ratingRow("Comfort",R.comfort)+
    ratingRow("Looks",R.looks)+ratingRow("Safety",R.safety)+ratingRow("Fuel Economy",R.fuelEco);

  const seg = SEGMENTS.find(g=>g.id===draft.segment);
  const fee = Engine.designCost(G, !draft._existingId);
  $("#editor-summary").innerHTML = `Publish fee: <b>$${fmt(fee)}</b> · Segment ideal price: <b>~$${fmt(seg.priceIdeal*Engine.inflation(G))}</b>
    &nbsp; <input id="price-input" class="price-input" type="number" step="50" value="${draftPrice}"> <span style="color:var(--dim)">$/car sale price</span>`;
  $("#btn-publish-model").textContent = draft._existingId ? "🔧 Apply Facelift" : "🚀 Publish Model";
  bindEditorEvents();
  renderBuildSide();
}
function currentPartName(sub){
  const id = getPartVal(sub);
  const p = partListFor(sub).find(x=>x.id===id);
  return p?p.name:"—";
}
function getPartVal(sub){
  if(["layout","disp","fuel","asp","fuelSys","motor","batt"].includes(sub)) return draft.engine[sub];
  if(sub==="options") return null;
  return draft[sub];
}
function setPartVal(sub,id){
  if(["layout","disp","fuel","asp","fuelSys","motor","batt"].includes(sub)) draft.engine[sub]=id;
  else draft[sub]=id;
}
function statDesc(p){
  const bits=[];
  if(p.cc) bits.push(p.cc+"cc");
  if(p.hp) bits.push(p.hp+"hp");
  if(p.mult) bits.push("×"+p.mult.toFixed(2)+" power");
  if(p.powerM&&p.powerM!==1) bits.push((p.powerM>1?"+":"")+Math.round((p.powerM-1)*100)+"% pwr");
  if(p.rel) bits.push("rel "+(p.rel>0?"+":"")+p.rel);
  if(p.relM) bits.push("rel "+(p.relM>0?"+":"")+p.relM);
  if(p.perf) bits.push("perf +"+p.perf);
  if(p.comfort) bits.push("comfort "+(p.comfort>0?"+":"")+p.comfort);
  if(p.looks) bits.push("looks "+(p.looks>0?"+":"")+p.looks);
  if(p.safety) bits.push("safety +"+p.safety);
  if(p.handling) bits.push("handling "+(p.handling>0?"+":"")+p.handling);
  if(p.grip) bits.push("grip "+(p.grip>0?"+":"")+p.grip);
  if(p.eco&&p.eco!==1) bits.push("eco ×"+p.eco);
  if(p.range) bits.push(p.range+"km range");
  if(p.mass) bits.push((p.mass>0?"+":"")+p.mass+"kg");
  if(p.massP) bits.push((p.massP>0?"+":"")+p.massP+"kg");
  if(p.desc) bits.push(p.desc);
  return bits.join(" · ")||"Standard";
}
function renderBuildSide(){
  if(!draft){ $("#build-summary-side").innerHTML="<i>No model in progress.</i>"; return; }
  const ev = Engine.evalSpec(G,draft);
  $("#build-summary-side").innerHTML = `<div class="kv-list">
    <div><span>Name</span><span>${draft.name}</span></div>
    <div><span>Segment</span><span>${SEGMENTS.find(s=>s.id===draft.segment).name}</span></div>
    <div><span>Body</span><span>${BODY_TYPES.find(b=>b.id===draft.body).name}</span></div>
    <div><span>Engine</span><span>${isEVDraft()? (EV_MOTORS.find(m=>m.id===draft.engine.motor)||{name:"—"}).name : (ENGINE_LAYOUTS.find(l=>l.id===draft.engine.layout)||{name:"—"}).name+" "+(DISPLACEMENTS.find(d=>d.id===draft.engine.disp)||{name:""}).name}</span></div>
    <div><span>Power</span><span>${ev.hp} hp</span></div>
    <div><span>Unit cost</span><span>$${fmt(ev.unitCost)}</span></div>
    <div><span>Appeal*</span><span>${appealOfDraft(ev)}</span></div></div>
    <p style="font-size:11px;color:var(--dim);margin-top:6px">*rough market appeal at current price</p>`;
}
function appealOfDraft(ev){
  const fake = { segment:draft.segment, price:draftPrice, R:ev.R, spec:draft, isEV:isEVDraft() };
  return Engine.modelAppeal(G, fake);
}

function bindEditorEvents(){
  $$(".etab").forEach(b=>b.onclick=()=>{ etab=b.dataset.etab; renderEditor(); });
  $$(".subsys-btn").forEach(b=>b.onclick=()=>{ esubsys=b.dataset.sub; renderEditor(); });
  $$(".part-card").forEach(c=>c.onclick=()=>{
    if(c.classList.contains("locked")) return;
    if(c.dataset.opt){
      draft.options = draft.options||[];
      const i = draft.options.indexOf(c.dataset.opt);
      if(i>=0) draft.options.splice(i,1); else draft.options.push(c.dataset.opt);
    } else {
      setPartVal(c.dataset.sub, c.dataset.part);
      if(c.dataset.sub==="motor" && !draft.engine.batt) draft.engine.batt="pb";
      if(c.dataset.sub==="gearbox" && isEVDraft()){ /* keep as-is, validated on publish */ }
    }
    renderEditor();
  });
  const te=$("#toggleEV"), ti=$("#toggleICE");
  if(te) te.onclick=()=>{ if(!G.techs.evdrive) return;
    draft.engine.motor="em1"; draft.engine.batt="pb"; draft.gearbox="sg"; draft.drivetrain="fwd";
    esubsys="motor"; renderEditor(); };
  if(ti) ti.onclick=()=>{ draft.engine.motor=null; draft.engine.batt=null; draft.gearbox="m3"; esubsys="layout"; renderEditor(); };
  const pi = $("#price-input");
  if(pi) pi.onchange = ()=>{ draftPrice = +pi.value||0; renderBuildSide(); };
}

// ─────────── Models ───────────
function renderModels(){
  const wrap = $("#models-list");
  if(!G.models.length){ wrap.innerHTML = "<div class='card'>No models yet. Head to the ✏️ Design Studio!</div>"; return; }
  wrap.innerHTML = G.models.map(m=>{
    const seg = SEGMENTS.find(s=>s.id===m.segment);
    const st = G.stock.find(c=>c.modelId===m.id);
    const qty = st?st.qty:0;
    const whCap = 300+(G.buildings.warehouse||0)*500;
    const ageYrs = (Engine.absMonth(G)-m.designMonth)/12;
    const appeal = m.published? Engine.modelAppeal(G,m):0;
    const pillCls = appeal>=70?"ok":appeal>=45?"warn":"bad";
    return `<div class="model-card ${m.published?'':'discontinued'}">
      <div class="model-head"><div><div class="model-title">${m.name}</div>
        <div class="model-sub">${seg.icon} ${seg.name} · ${BODY_TYPES.find(b=>b.id===m.body).name} · launched ${MONTHS[m.launchMonth]} ${m.launchYear}${ageYrs>1.5&&!m.discontinued?' · <span class="pill warn">aging ('+ageYrs.toFixed(1)+'y)</span>':''}</div></div>
        ${m.published?`<span class="pill ${pillCls}" title="Market appeal">Appeal ${appeal}</span>`:`<span class="pill bad">Discontinued</span>`}</div>
      <div class="model-body">${carSVG(m.body,m.id)}
        <div class="model-stats">
          <div>⚙️ ${m.hp} hp · ${m.mass} kg · 💵 margin $${fmt(m.price-m.unitCost)}/car</div>
          <div>📊 Perf ${m.R.performance} · Rel ${m.R.reliability} · Comf ${m.R.comfort} · Looks ${m.R.looks} · Safe ${m.R.safety} · Eco ${m.R.fuelEco}</div>
          <div>📦 Sold total: <b>${fmt(m.salesTotal)}</b> · last mo: <b>${fmt(m.salesMonth||0)}</b>${m.unmetDemand?` · <span class="neg">missed ${fmt(m.unmetDemand)} buyers!</span>`:''}</div>
        </div></div>
      ${m.published?`
      <div class="model-controls">
        <div class="rowctl">🏷️ Price: <input class="price-input" type="number" step="50" value="${m.price}" data-price-for="${m.id}"> <button class="btn small" data-applyprice="${m.id}">Apply</button></div>
        <div class="rowctl">🏭 Stock: ${qty} / ${whCap} <div class="stockbar" style="flex:1;min-width:80px"><i style="width:${clamp(qty/whCap*100,0,100)}%"></i></div></div>
        <div class="rowctl"><button class="btn small" data-editmodel="${m.id}">✏️ Facelift</button>
        <button class="btn small danger" data-discontinue="${m.id}">🗑️ Discontinue</button></div>
      </div>`:`<div style="color:var(--dim);font-size:12px">Discontinued model.</div>`}
    </div>`;
  }).join("");
  $$("[data-price-for]").forEach(i=>i.onchange=()=>{});
  $$("[data-applyprice]").forEach(b=>b.onclick=()=>{
    const id=+b.dataset.applyprice; const inp=$(`[data-price-for="${id}"]`);
    const m=G.models.find(x=>x.id===id); m.price=Math.max(m.unitCost, +inp.value||m.price);
    toast("💲 New price for "+m.name+": $"+fmt(m.price),"good"); renderModels();
  });
  $$("[data-editmodel]").forEach(b=>b.onclick=()=>{
    const m=G.models.find(x=>x.id===+b.dataset.editmodel);
    switchTab("design"); openEditor(m);
  });
  $$("[data-discontinue]").forEach(b=>b.onclick=()=>{
    const id=+b.dataset.discontinue; const m=G.models.find(x=>x.id===id);
    if(confirm("Discontinue "+m.name+"? Remaining stock will be liquidated at 40%.")){ Engine.discontinueModel(G,id); renderModels(); updateHUD(); }
  });
}

// ─────────── Factory ───────────
function renderFactory(){
  const cap = Engine.capacityPerLine(G);
  const pubs = G.models.filter(m=>m.published);
  $("#factory-lines").innerHTML = G.lines.map((l,i)=>{
    const m = G.models.find(x=>x.id===l.modelId);
    return `<div class="line-card">
      <div class="lc-head"><b>🚛 Line ${l.id}</b>
        <select data-line="${i}" class="mini-select"><option value="">— idle —</option>${pubs.map(p=>`<option value="${p.id}" ${l.modelId===p.id?'selected':''}>${p.name}</option>`).join("")}</select>
        ${i>0?`<button class="btn small danger" data-rmline="${i}">✖</button>`:''}</div>
      <div>Target: <input class="price-input" type="number" step="10" min="0" max="${cap}" value="${l.target}" data-target="${i}"> /mo (max ${cap}${G.strikeTimer>0?' · <span class="neg">STRIKE!</span>':''})
        ${m?`· built last mo: <b>${l.lastBuilt||0}</b>`:''}</div></div>`;
  }).join("");
  $$("[data-line]").forEach(sel=>sel.onchange=()=>{
    const l=G.lines[+sel.dataset.line];
    l.modelId = sel.value? +sel.value : null; if(!l.modelId) l.target=0;
    renderFactory();
  });
  $$("[data-target]").forEach(inp=>inp.onchange=()=>{
    G.lines[+inp.dataset.target].target = clamp(+inp.value||0,0,cap); renderFactory();
  });
  $$("[data-rmline]").forEach(b=>b.onclick=()=>{ G.lines.splice(+b.dataset.rmline,1); renderFactory(); });

  $("#factory-buildings").innerHTML = BUILDINGS.map(b=>{
    const lvl = G.buildings[b.id]||0;
    const cost = Math.round((lvl===0? b.baseCost : b.baseCost + b.perLevel*lvl) * Math.pow(1.35,lvl));
    return `<div class="bld-card"><div class="lc-head"><b>${b.icon} ${b.name}</b><span>Lv ${lvl}/${b.max}</span></div>
      <div style="color:var(--dim);margin-bottom:6px">${b.desc} → <i>${b.effect(Math.max(1,lvl))}</i></div>
      ${lvl<b.max?`<button class="btn small" data-buybld="${b.id}">⬆️ Upgrade ($${fmt(cost)})</button>`:'<span class="pill ok">MAX LEVEL</span>'}</div>`;
  }).join("") + `<div class="bld-card"><div class="lc-head"><b>🏗️ Production Line</b><span>${G.lines.length} owned</span></div>
    <div style="color:var(--dim)">Each line builds one model at a time.</div>
    <button id="btn-buy-line2" class="btn small">➕ Buy Line ($50,000)</button></div>`;
  $$("[data-buybld]").forEach(btn=>btn.onclick=()=>{
    const b=BUILDINGS.find(x=>x.id===btn.dataset.buybld); const lvl=G.buildings[b.id]||0;
    const cost=Math.round((lvl===0?b.baseCost:b.baseCost+b.perLevel*lvl)*Math.pow(1.35,lvl));
    if(G.money<cost){ toast("Not enough cash.","bad"); return; }
    G.money-=cost; G.buildings[b.id]=lvl+1; toast(b.icon+" "+b.name+" upgraded to Lv "+(lvl+1),"good"); renderFactory(); updateHUD();
  });
  $("#btn-buy-line").onclick = $("#btn-buy-line2").onclick = ()=>{
    if(G.money<50000){ toast("Not enough cash for a new line.","bad"); return; }
    G.money-=50000; G.lines.push({id:"L"+(G.lines.length+1),modelId:null,target:0});
    toast("🏗️ New production line built.","good"); renderFactory(); updateHUD();
  };
}

// ─────────── Market ───────────
function renderMarket(){
  const comps = [...G.competitors].sort((a,b)=>b.quality-a.quality);
  $("#market-competitors").innerHTML = `<table class="tbl"><tr><th>Company</th><th>Focus</th><th>Quality</th><th>Est. Share</th></tr>`+
    comps.map(c=>`<tr><td>🏭 ${c.name}</td><td>${SEGMENTS.find(s=>s.id===c.seg).icon} ${SEGMENTS.find(s=>s.id===c.seg).name}</td>
      <td><div class="bar" style="width:90px"><i style="width:${Math.round(c.quality)}%"></i></div></td><td>${c.share||"—"}%</td></tr>`).join("")+`</table>
      <p style="font-size:12px;color:var(--dim);margin-top:8px">Competitors improve over time. Beat them with better appeal!</p>`;
  $("#market-segments").innerHTML = SEGMENTS.map(sg=>{
    const unlocked = sg.unlock<=G.year;
    const ss = G.segSales[sg.id];
    const myModels = G.models.filter(m=>m.published&&m.segment===sg.id);
    return `<div class="comp-card"><div class="lc-head"><b>${sg.icon} ${sg.name}</b>
      <span>${unlocked? (myModels.length? myModels.length+" of your models":"no models yet") : "🔒 unlocks "+sg.unlock}</span></div>
      ${unlocked?`<div style="color:var(--dim)">Ideal price ~$${fmt(sg.priceIdeal*Engine.inflation(G))} · monthly demand ≈ ${fmt(ss?ss.total:sg.demandBase)} · You supplied ${fmt(ss&&ss.yourSold||0)} last mo</div>
      <div style="font-size:11px;color:var(--dim)">Buyers weight: ${Object.entries(sg.w).sort((a,b)=>b[1]-a[1]).slice(0,4).map(x=>x[0]+" "+x[1]+"%").join(", ")}</div>`:''}</div>`;
  }).join("");
}

// ─────────── Research ───────────
function renderResearch(){
  const avail = TECHS.filter(t=>!G.techs[t.id] && !(G.researchQueue&&G.researchQueue.techId===t.id));
  const cats = {};
  for(const t of avail){ (cats[t.cat]=cats[t.cat]||[]).push(t); }
  let html="";
  for(const cat in cats){
    html += `<h4 style="margin:10px 0 6px;color:var(--accent)">${cat}</h4>`;
    for(const t of cats[cat]){
      const ready = (!t.req.length || t.req.every(r=>G.techs[r])) && (!t.year || t.year<=G.year);
      const blockedBy = t.year&&t.year>G.year ? "Year "+t.year : (t.req.find(r=>!G.techs[r])? TECHS.find(x=>x.id===t.req.find(r=>!G.techs[r])).name : null);
      html += `<div class="res-card"><div class="lc-head"><b>${t.name}</b><span>$${fmt(t.cost)} · ${t.time} mo</span></div>
        ${t.desc?`<div style="color:var(--dim);margin-bottom:5px">${t.desc}</div>`:''}
        ${ready?`<button class="btn small primary" data-res="${t.id}">🔬 Research</button>`:`<span style="color:var(--red);font-size:12px">🔒 Requires ${blockedBy}</span>`}</div>`;
    }
  }
  $("#research-available").innerHTML = html || "<i>All research complete. Incredible!</i>";
  $$("[data-res]").forEach(b=>b.onclick=()=>{
    const err = Engine.startResearch(G,b.dataset.res);
    if(err){ toast("⚠️ "+err,"bad"); } else { toast("🔬 Research started.","good"); renderResearch(); updateHUD(); }
  });
  let prog = "";
  if(G.researchQueue){
    const t=TECHS.find(x=>x.id===G.researchQueue.techId);
    const pct = clamp(100-Math.round(G.researchQueue.monthsLeft/G.researchQueue.total*100),0,100);
    prog = `<div class="res-card"><b>⏳ ${t.name}</b><div class="stockbar" style="margin:8px 0"><i style="width:${pct}%"></i></div>${pct}% — approx ${Math.ceil(G.researchQueue.monthsLeft)} mo left</div>`;
  } else prog = `<div class="res-card" style="color:var(--dim)">Idle lab. Pick a project on the left!</div>`;
  const done = TECHS.filter(t=>G.techs[t.id]);
  $("#research-progress").innerHTML = prog + `<h4 style="margin:12px 0 6px">Completed (${done.length}/${TECHS.length})</h4>
    <div style="display:flex;flex-wrap:wrap;gap:6px">${done.map(t=>`<span class="award-chip" style="border-color:var(--green);color:#7fd6a4">✔ ${t.name}</span>`).join("")}</div>`;
}

// ─────────── Staff ───────────
function renderStaff(){
  $("#staff-hired").innerHTML = (G.staff.length? G.staff.map((p,i)=>{
    const role=STAFF_ROLES.find(r=>r.id===p.role);
    return `<div class="staff-card"><div class="lc-head"><b>${role.icon} ${p.name}</b><span>${role.name} · Skill ${p.skill}</span></div>
      <div>$${fmt(p.salary)}/mo salary &nbsp; <button class="btn small danger" data-fire="${i}">Fire</button></div></div>`;
  }).join("") : "<i>No employees. Hire from applications →</i>")
  + `<div class="staff-card" style="border-style:dashed"><b>Total payroll:</b> $${fmt(G.staff.reduce((a,p)=>a+p.salary,0))}/mo</div>`;
  $$("[data-fire]").forEach(b=>b.onclick=()=>{ const p=G.staff[+b.dataset.fire]; G.staff.splice(+b.dataset.fire,1); toast(p.name+" fired.","bad"); renderStaff(); });
  $("#staff-applicants").innerHTML = (G.applicants.length? G.applicants.map((p,i)=>{
    const role=STAFF_ROLES.find(r=>r.id===p.role);
    return `<div class="staff-card"><div class="lc-head"><b>${role.icon} ${p.name}</b><span>${role.name} · Skill ${p.skill}</span></div>
      <div>$${fmt(p.salary)}/mo &nbsp; <button class="btn small primary" data-hire="${i}">✔ Hire</button></div></div>`;
  }).join("") : "<i>No applicants right now.</i>");
  $$("[data-hire]").forEach(b=>b.onclick=()=>{
    const p=G.applicants[+b.dataset.hire]; G.staff.push(p); G.applicants.splice(+b.dataset.hire,1);
    toast("🤝 Hired "+p.name+" ("+STAFF_ROLES.find(r=>r.id===p.role).name+", skill "+p.skill+")","good"); renderStaff();
  });
  $("#btn-refresh-applicants").onclick=()=>{
    if(G.money<1000){toast("Need $1,000 for ads.","bad");return;}
    G.money-=1000; G.applicants.push(...Engine.genApplicants(G,3)); renderStaff(); updateHUD();
  };
}

// ─────────── Finances ───────────
function renderFinances(){
  const st = G.lastStatement || {revenue:0,salaries:0,overhead:0,interest:0,production:0,net:0};
  const rows=[["Car sales revenue","+$"+fmt(st.revenue),"pos"],["Production spend","-$"+fmt(st.production),"neg"],
    ["Salaries","-$"+fmt(st.salaries),"neg"],["Overhead","-$"+fmt(st.overhead),"neg"],["Loan interest","-$"+fmt(st.interest),"neg"],
    ["<b>Net profit</b>",`<b class="${st.net>=0?'pos':'neg'}">${st.net>=0?'+':''}$${fmt(st.net)}</b>`,""]];
  $("#fin-statement").innerHTML = `<table class="tbl">${rows.map(r=>`<tr><td>${r[0]}</td><td class="${r[2]}">${r[1]}</td></tr>`).join("")}</table>
    <div style="margin-top:8px;font-size:13px;color:var(--dim)">Cash: <b class="pos">$${fmt(G.money)}</b> · Total sold all-time: <b>${fmt(G.totalSold)}</b></div>`;
  const maxLoan = Math.round(500000+companyValue(G)*0.4);
  $("#fin-bank").innerHTML = `<div class="bld-card"><b>Loan balance:</b> $${fmt(G.loan)} <span style="color:var(--dim)">(max $${fmt(maxLoan)}, 0.9%/mo)</span>
    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
    <button class="btn small" data-loan="25000">Borrow $25k</button>
    <button class="btn small" data-loan="100000">Borrow $100k</button>
    <button class="btn small" data-repay="25000">Repay $25k</button>
    <button class="btn small" data-repay="${G.loan}">Repay all</button></div></div>`;
  $$("[data-loan]").forEach(b=>b.onclick=()=>{
    const amt=+b.dataset.loan;
    if(G.loan+amt>maxLoan){toast("Credit limit reached.","bad");return;}
    G.loan+=amt; G.money+=amt; toast("🏦 Borrowed $"+fmt(amt),"gold"); renderFinances(); updateHUD();
  });
  $$("[data-repay]").forEach(b=>b.onclick=()=>{
    const amt=Math.min(+b.dataset.repay,G.loan,G.money);
    if(amt<=0){toast("Nothing to repay.","bad");return;}
    G.loan-=amt; G.money-=amt; toast("🏦 Repaid $"+fmt(amt),"good"); renderFinances(); updateHUD();
  });
  drawChart($("#chart-value"), G.history.slice(-24).map(h=>h.value), "#3fa9f5");
}
