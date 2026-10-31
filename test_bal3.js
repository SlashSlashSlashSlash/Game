const fs=require('fs'), vm=require('vm');
const ctx = { console, Math, Date, JSON, toast:()=>{}, modal:()=>{}, gameOver:(s)=>{throw new Error("BANKRUPT "+s.year);} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('js/data.js','utf8')+"\n"+fs.readFileSync('js/engine.js','utf8')+"\nglobalThis.Engine=Engine; globalThis.companyValue=companyValue; globalThis.TECHS=TECHS; globalThis.SEGMENTS=SEGMENTS;", ctx);
const {Engine, companyValue, TECHS, SEGMENTS} = ctx;

// --- Scenario A: cautious starter player (1 budget car) ---
let s = Engine.newState("Budget Co");
let spec = Engine.defaultSpec(s,"Peewee","budget","hatch");
console.log("A publish:",Engine.publishModel(s,spec,Math.round(SEGMENTS[0].priceIdeal*0.95))||"OK", "unitCost",s.models[0].unitCost);
s.lines[0].modelId=1; s.lines[0].target=60;
for(let mo=0; mo<12*10; mo++){
  Engine.tickMonth(s); s.totalSold += (s.monthUnits||0);
  if(mo%8===0){ const avail=TECHS.filter(t=>!s.techs[t.id]&&!s.researchQueue&&(!t.year||t.year<=s.year)&&t.req.every(r=>s.techs[r])&&t.cost<s.money*0.3);
    if(avail.length) Engine.startResearch(s,avail.sort((a,b)=>a.cost-b.cost)[0].id); }
  if(mo===60){ let f=JSON.parse(JSON.stringify(s.models[0].spec)); f._existingId=s.models[0].id; f._designMonth=Engine.absMonth(s);
    Engine.autoFitEngine(s,f); const e=Engine.publishModel(s,f,s.models[0].price+100); if(e) console.log("facelift:",e); }
  if(mo%36===35) console.log(`A ${s.year}: $${Math.round(s.money/1000)}k rep ${Math.round(s.rep)} sold/mo ${s.monthUnits} appeal ${s.models[0].appeal}`);
}
console.log("A FINAL:",s.year,"money",Math.round(s.money),"rep",Math.round(s.rep),"totalSold",s.totalSold,"value",companyValue(s));

// --- Scenario B: aggressive expansion to modern era ---
let b = Engine.newState("Empire Motors");
let sp = Engine.defaultSpec(b,"E1","economy","sedan");
Engine.publishModel(b,sp,6200);
b.lines[0].modelId=1; b.lines[0].target=100;
for(let mo=0; mo<12*75; mo++){
  Engine.tickMonth(b); b.totalSold += (b.monthUnits||0);
  if(mo%4===0){ const avail=TECHS.filter(t=>!b.techs[t.id]&&!b.researchQueue&&(!t.year||t.year<=b.year)&&t.req.every(r=>b.techs[r])&&t.cost<b.money*0.35);
    if(avail.length) Engine.startResearch(b,avail.sort((x,y)=>y.cost-x.cost)[0].id); }
  // add lines with newest model
  if(b.money>300000 && b.lines.length<6){ b.money-=50000; b.lines.push({id:"L"+(b.lines.length+1),modelId:b.models[b.models.length-1].id,target:120}); }
  if(b.money>500000 && b.buildings.assembly<8){ b.money-=Math.round(60000*Math.pow(1.35,b.buildings.assembly-1)); b.buildings.assembly++; }
  // every ~4 years launch a fresh model in a rotating segment
  if(mo>0 && mo%48===0){
    const segIdx = Math.min(SEGMENTS.filter(g=>g.unlock<=b.year).length-1, Math.floor(mo/96)+1);
    const seg = SEGMENTS.filter(g=>g.unlock<=b.year)[segIdx];
    const body = ctx.BODY_TYPES ? null : null;
    const bodies = ["sedan","hatch","coupe","wagon","suvbody","pickup","van","convert","roadster"];
    const bt = bodies.find(x=>true); // choose compatible
    const compat = {budget:["hatch","sedan","van"],economy:["sedan","hatch"],family:["wagon","sedan","van"],sports:["coupe","roadster","convert"],luxury:["sedan","coupe","suvbody"],suv:["suvbody","pickup"],supercar:["coupe","roadster"],ev:["sedan","coupe","suvbody"]}[seg.id][0];
    let ns = Engine.defaultSpec(b, seg.name+" "+b.year, seg.id, compat);
    ns.gearbox = b.techs.auto4?"a4":b.techs.manual4?"m4":"m3";
    const ideal = Math.round(seg.priceIdeal*(1+(Engine.absMonth(b)/12)*0.045));
    ns.price=ideal;
    const err = Engine.publishModel(b,ns,ideal);
    if(err) console.log("launch fail",err);
    else { const idle=b.lines.find(l=>!l.modelId); if(idle){idle.modelId=b.models[b.models.length-1].id; idle.target=120;} }
  }
  if(mo%120===119) console.log(`B ${b.year}: $${Math.round(b.money/1e6)}M rep ${Math.round(b.rep)} sold ${Math.round(b.totalSold/1000)}k val ${Math.round(companyValue(b)/1e6)}M techs ${Object.keys(b.techs).length} awards ${b.awards.length}`);
}
console.log("B FINAL:",b.year,"money",Math.round(b.money),"rep",Math.round(b.rep),"sold",b.totalSold,"value",companyValue(b),"models",b.models.length,"awards",b.awards.length,"objectives",Object.keys(b.objectivesDone).length);
