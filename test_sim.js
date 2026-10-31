global.toast = ()=>{}; global.modal = ()=>{};
const fs=require('fs'), vm=require('vm');
const ctx = { console, toast:()=>{}, modal:()=>{}, Math, Date, JSON };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('js/data.js','utf8')+"\n"+fs.readFileSync('js/engine.js','utf8')+"\nglobalThis.Engine=Engine; globalThis.companyValue=companyValue; globalThis.fmt=fmt;", ctx);
const {Engine, companyValue} = ctx;

let s = Engine.newState("Test Motors");
console.log("year",s.year,"money",s.money);

let spec = Engine.defaultSpec(s,"Model T1","economy","sedan");
let err = Engine.publishModel(s, spec, 6200);
console.log("publish:",err||"OK");
const m = s.models[0];
console.log("model:",m.name,m.hp+"hp","cost",m.unitCost,"R",JSON.stringify(m.R),"appeal",m.appeal);

s.lines[0].modelId=m.id; s.lines[0].target=100;
for(let i=0;i<24;i++){ Engine.tickMonth(s); }
console.log("after 24mo: year",s.year,"money",Math.round(s.money),"sold/mo",s.monthUnits,"stock",JSON.stringify(s.stock),"rep",s.rep,"lifetime",m.salesTotal);

console.log("research vengine:",Engine.startResearch(s,"vengine")||"started");
for(let i=0;i<8;i++) Engine.tickMonth(s);
console.log("vengine researched?",!!s.techs.vengine,"money",Math.round(s.money));

spec = Engine.defaultSpec(s,"Viper GT","sports","coupe");
spec.engine.layout="v8"; spec.engine.disp="d40"; spec.gearbox="m4"; spec.chassis="uni"; spec.brakes="discF"; spec.susp="mcph"; spec.tyres="rad";
err = Engine.publishModel(s,spec,30000);
console.log("sports publish:",err||"OK");
if(!err){ const sm=s.models[1]; console.log("sports:",sm.hp+"hp appeal",sm.appeal,"cost",sm.unitCost);
  s.lines.push({id:"L2",modelId:sm.id,target:50}); }
for(let i=0;i<12;i++) Engine.tickMonth(s);
console.log("yr",s.year,"money",Math.round(s.money),"rep",s.rep,"value",companyValue(s),"awards",s.awards.length,"objectives",Object.keys(s.objectivesDone).length);

for(let i=0;i<(2000-s.year)*12+2;i++) Engine.tickMonth(s);
console.log("reached",s.year,"money",Math.round(s.money),"loan",s.loan,"models",s.models.length,"techs",Object.keys(s.techs).length,"totalSold",s.totalSold);
console.log("SIM OK");
