const fs=require('fs'), vm=require('vm');
const ctx = { console, Math, Date, JSON, toast:()=>{}, modal:()=>{} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('js/data.js','utf8')+"\n"+fs.readFileSync('js/engine.js','utf8')+"\nglobalThis.Engine=Engine;", ctx);
const {Engine} = ctx;
let s = Engine.newState("T");
// raw budget hatch cost breakdown attempt
const sp = Engine.defaultSpec(s,"X","budget","hatch");
console.log("spec",JSON.stringify(sp.engine),sp.susp,sp.tyres,sp.chassis,sp.gearbox);
const ev=Engine.evalSpec(s,sp);
console.log("cost",ev.unitCost,"mass",ev.mass);
// manual: engine i2 1.0L? layout disp
