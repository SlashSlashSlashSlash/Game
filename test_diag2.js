const fs=require('fs'), vm=require('vm');
const ctx = { console, Math, Date, JSON, toast:()=>{}, modal:()=>{} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('js/data.js','utf8')+"\n"+fs.readFileSync('js/engine.js','utf8')+"\nglobalThis.Engine=Engine;", ctx);
const {Engine} = ctx;
let s = Engine.newState("Budget Co");
let spec = Engine.defaultSpec(s,"Peewee","budget","hatch");
console.log("publish:",Engine.publishModel(s,spec,3300)||"OK");
s.lines[0].modelId=1; s.lines[0].target=60;
for(let i=0;i<5;i++){ Engine.tickMonth(s); console.log(JSON.stringify(s.lastStatement), "money",Math.round(s.money),"stock",JSON.stringify(s.stock)); }
