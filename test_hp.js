const fs=require('fs'), vm=require('vm');
const ctx = { console, Math, Date, JSON, toast:()=>{}, modal:()=>{} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('js/data.js','utf8')+"\n"+fs.readFileSync('js/engine.js','utf8')+"\nglobalThis.Engine=Engine;", ctx);
const {Engine} = ctx;
let s = Engine.newState("T");
for(const seg of ["budget","economy","family","sports","luxury"]){
  const sp = Engine.defaultSpec(s,"X",seg, seg==="sports"?"coupe":"sedan");
  const ev = Engine.evalSpec(s,sp);
  console.log(seg, "hp",ev.hp, "cost",ev.unitCost, "R",JSON.stringify(ev.R));
}
// 1950 budget hatch should cost ~2000-2600
s.year = 1970;
const sp2 = Engine.defaultSpec(s,"X70","economy","hatch");
console.log("1970 economy:",Engine.evalSpec(s,sp2).unitCost, Engine.evalSpec(s,sp2).hp);
