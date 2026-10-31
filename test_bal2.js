const fs=require('fs'), vm=require('vm');
const ctx = { console, Math, Date, JSON, toast:()=>{}, modal:()=>{}, gameOver:(s)=>{console.log("GAMEOVER bankrupt",s.year); throw "bankrupt";} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('js/data.js','utf8')+"\n"+fs.readFileSync('js/engine.js','utf8')+"\nglobalThis.Engine=Engine; globalThis.companyValue=companyValue; globalThis.TECHS=TECHS;", ctx);
const {Engine, companyValue, TECHS} = ctx;

// --- Scenario A: cautious starter player (1 budget car, low price) ---
let s = Engine.newState("Budget Co");
let spec = Engine.defaultSpec(s,"Peewee","budget","hatch");
console.log("A publish:",Engine.publishModel(s,spec,3400)||"OK");
s.lines[0].modelId=1; s.lines[0].target=60;
for(let mo=0; mo<12*10; mo++){ // 10 years
  Engine.tickMonth(s); s.totalSold += (s.monthUnits||0);
  if(mo%8===0){ const avail=TECHS.filter(t=>!s.techs[t.id]&&!s.researchQueue&&(!t.year||t.year<=s.year)&&t.req.every(r=>s.techs[r])&&t.cost<s.money*0.3);
    if(avail.length) Engine.startResearch(s,avail.sort((a,b)=>a.cost-b.cost)[0].id); }
  if(mo===60){ // facelift with researched parts
    let f=JSON.parse(JSON.stringify(s.models[0].spec)); f._existingId=s.models[0].id;
    if(s.techs.macpherson) f.susp="mcph"; if(s.techs.radial) f.tyres="rad"; if(s.techs.unibody) f.chassis="uni";
    f._designMonth=Engine.absMonth(s);
    const e=Engine.publishModel(s,f,3600); if(e) console.log("facelift:",e);
  }
  if(mo%24===23) console.log(`A ${s.year}: $${Math.round(s.money/1000)}k rep ${Math.round(s.rep)} sold/mo ${s.monthUnits} stock ${JSON.stringify(s.stock.map(c=>c.qty))} appeal ${s.models[0].appeal}`);
}
console.log("A FINAL:",s.year,"money",Math.round(s.money),"rep",Math.round(s.rep),"totalSold",s.totalSold,"value",companyValue(s));
