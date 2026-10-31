const fs=require('fs'), vm=require('vm');
const ctx = { console, Math, Date, JSON, toast:()=>{}, modal:()=>{} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('js/data.js','utf8')+"\n"+fs.readFileSync('js/engine.js','utf8')+"\nglobalThis.Engine=Engine; globalThis.companyValue=companyValue; globalThis.TECHS=TECHS; globalThis.BODY_TYPES=BODY_TYPES;", ctx);
const {Engine, companyValue, TECHS} = ctx;

let s = Engine.newState("Rivet Motors");
let spec = Engine.defaultSpec(s,"Rivet 1","economy","sedan");
spec.gearbox="m3"; spec.brakes="drum"; spec.tyres="bias"; spec.interior="basic"; spec.electronics="norad"; spec.safety="belts";
console.log("publish:",Engine.publishModel(s,spec,6000)||"OK");
s.lines[0].modelId=1; s.lines[0].target=90;
let milestones=[];
for(let mo=0; mo<12*75; mo++){
  Engine.tickMonth(s); s.totalSold += (s.monthUnits||0);
  if(mo%6===0){
    const avail = TECHS.filter(t=>!s.techs[t.id]&&!s.researchQueue&&(!t.year||t.year<=s.year)&&t.req.every(r=>s.techs[r])&&t.cost<=s.money*0.4);
    if(avail.length) Engine.startResearch(s, avail.sort((a,b)=>a.cost-b.cost)[0].id);
  }
  // build lines & targets as money grows
  if(s.money>250000 && s.lines.length<4){ s.money-=50000; s.lines.push({id:"L"+(s.lines.length+1),modelId:1,target:110}); }
  if(s.money>400000 && s.buildings.assembly<6){ s.money-=Math.round(60000*Math.pow(1.35,s.buildings.assembly-1)); s.buildings.assembly++; }
  if(mo===120){
    let f = Engine.defaultSpec(s,"Rivet Family","family","wagon");
    f.engine.disp="d16"; f.gearbox="m4"; f.chassis="uni"; f.brakes="discF"; f.susp="mcph"; f.tyres="rad"; f.electronics="norad"; f.safety="crump"; f.emissions="raw";
    const err=Engine.publishModel(s,f,11500); if(err) console.log("fam publish fail:",err);
    else { const idle=s.lines.find(l=>!l.modelId); if(idle){idle.modelId=s.models[s.models.length-1].id;idle.target=80;} else s.lines.push({id:"Lx",modelId:s.models[s.models.length-1].id,target:80}); }
  }
  if(mo%12===0) milestones.push(`${s.year}: $${Math.round(s.money/1000)}k rep ${Math.round(s.rep)} sold ${Math.round(s.totalSold/1000)}k val ${Math.round(companyValue(s)/1e6)}M`);
  if(s.money<-1000000){ console.log("BANKRUPT at",s.year); break; }
}
console.log(milestones.filter((_,i)=>i%8===0).join("\n"));
console.log("FINAL yr",s.year,"money",Math.round(s.money),"rep",Math.round(s.rep),"sold",s.totalSold,"techs",Object.keys(s.techs).length,"awards",s.awards.length,"models",s.models.length);
