const fs=require('fs'), vm=require('vm');
const ctx = { console, Math, Date, JSON, toast:()=>{}, modal:()=>{}, gameOver:(s)=>{throw "bankrupt";} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('js/data.js','utf8')+"\n"+fs.readFileSync('js/engine.js','utf8')+"\nglobalThis.Engine=Engine; globalThis.companyValue=companyValue;", ctx);
const {Engine} = ctx;
let s = Engine.newState("Budget Co");
let spec = Engine.defaultSpec(s,"Peewee","budget","hatch");
console.log("unitCost:",Engine.evalSpec(s,spec).unitCost);
Engine.publishModel(s,spec,3400);
s.lines[0].modelId=1; s.lines[0].target=60;
for(let i=0;i<3;i++){ Engine.tickMonth(s); console.log(JSON.stringify(s.lastStatement), "price",s.models[0].price,"cost",s.models[0].unitCost); }
