/* Full-stack integration test: data + data2 + designer + dyno + systems + engine */
const fs=require('fs'), vm=require('vm');
const ctx = { console, toast:()=>{}, modal:()=>{}, Math, Date, JSON,
  document:{ addEventListener(){}, getElementById(){return null;}, querySelector(){return null;}, querySelectorAll(){return [];} },
  localStorage:{ getItem(){return null;}, setItem(){} } };
ctx.globalThis = ctx;
vm.createContext(ctx);
for(const f of ['js/data.js','js/data2.js','js/engine_designer.js','js/dyno.js','js/systems.js','js/engine.js']){
  vm.runInContext(fs.readFileSync(f,'utf8')+"\n", ctx, {filename:f});
}
vm.runInContext("globalThis.Engine=Engine; globalThis.Systems=Systems; globalThis.Designer=Designer; globalThis.Dyno=Dyno; globalThis.companyValue=companyValue;", ctx);
const {Engine, Systems, Designer, companyValue} = ctx;

// ── founder flow: entrepreneur in Detroit, 1970 start ──
let s = Engine.newState("Rivet Motors", {role:"entrepreneur", hq:"detroit", logoSymbol:"bolt", logoShape:"hex", logoColor:"rosso", startYear:1970});
console.log("FOUNDER money:", s.money, "(expect 650k*1.2=780k) role:", s.ceoRole, "hq:", s.hqCity, "home:", s.homeRegion, "year:", s.year);
if(Math.abs(s.money-780000)>1) throw new Error("entrepreneur perk broken");

// innovator check
let s2 = Engine.newState("IdeaWorks", {role:"innovator"});
console.log("INNOVATOR boost:", s2.innovatorBoost);

// ── publish a car & get critic reviews ──
let spec = Engine.defaultSpec(s,"Pacer","economy","sedan");
spec.engine.layout="i4"; spec.engine.disp="cc1600";
let err = Engine.publishModel(s, spec, 3200*ctx.inflation? 3200 : 3200);
console.log("publish:", err||"OK");
const m = s.models[0];
console.log("model hp:", m.hp, "cost:", m.unitCost, "appeal:", m.appeal);
console.log("reviews:", JSON.stringify((s.reviews[m.id]||[]).map(r=>r.critic+":"+r.score)));
if(!s.reviews[m.id] || s.reviews[m.id].length!==4) throw new Error("critic review system not firing on launch");

// ── marketing campaign (Marketer discount sanity via entrepreneur = no discount) ──
const cost = Systems.campaignCost(s,"tv","regional",4);
console.log("TV regional 4mo cost:", cost);
err = Systems.launchCampaign(s,{channelId:"tv", sizeId:"regional", months:4, modelId:m.id});
console.log("campaign launch:", err||"OK", "active:", s.campaigns.length);

// ── open a region ──
err = Systems.openRegion(s,"eu");
console.log("open EU:", err||"OK", "regions:", JSON.stringify(Object.keys(s.regions)));

// ── production + sales loop 18 months ──
s.lines[0].modelId=m.id; s.lines[0].target=120;
for(let i=0;i<18;i++) Engine.tickMonth(s);
console.log("after 18mo: year",s.year,"money",Math.round(s.money),"sold/mo",s.monthUnits,"fans",Math.round(s.fans),"rp",Math.round(s.rp),"rank",s.leaderRank);
if(s.totalSold<=0) throw new Error("no sales happened");
if(s.fans<=0) throw new Error("fan loop dead");
if(s.rp<=0) throw new Error("RP economy dead (no staff though — expected 0 unless engineers)");

// hire engineer to feed RP
s.staff.push({name:"Ada", role:"engineer", skill:80, salary:3000});
const rpBefore=s.rp; Engine.tickMonth(s);
console.log("RP gain with engineer:", Math.round((s.rp-rpBefore)*10)/10);
if(s.rp<=rpBefore) throw new Error("engineer generates no RP");

// refine a part family with RP
s.rp += 100;
err = Systems.refine(s,"engine");
console.log("refine engine:", err||"OK", "level:", s.refineLevels.engine, "mul:", Systems.refineMul(s,"engine"));

// ── HQ upgrade ──
s.money += 200000;
err = Systems.upgradeHQ(s);
console.log("HQ upgrade:", err||"OK", "level:", s.hqLevel, "line slots:", Systems.hqLineSlots(s));

// ── dyno run on the designed engine ──
const dynoSpec = Engine.defaultSpec(s,"Dyno Mule","sports","coupe");
dynoSpec.engine.layout="v8"; dynoSpec.engine.disp="cc5000"; dynoSpec.engine.asp="turbo";
Designer.autoTune(s, dynoSpec);
const res = Dyno.runPull(s, dynoSpec, {});
console.log("DYNO:", res&&res.peak? res.peak.hp+"hp @"+res.peak.hpRpm+"rpm, tq "+res.peak.tq+"Nm, blowup:"+!!res.blowup : "null");
if(!res||!res.peak||!res.curve||!res.curve.length) throw new Error("dyno produced no curve");

// ── motorsport ──
s.money+=500000;
let spec2 = Engine.defaultSpec(s,"Racer GT","sports","coupe");
spec2.engine.layout="v8"; spec2.engine.disp="cc5000";
err = Engine.publishModel(s, spec2, 28000);
const m2 = s.models[s.models.length-1];
console.log("racer hp:", m2.hp, "handling:", m2.handling);
err = Systems.enterRacing(s,"touring",m2.id);
console.log("enter touring:", err||"OK");
if(err){ // maybe outside hp window; try gt
  err = Systems.enterRacing(s,"gt",m2.id);
  console.log("enter gt:", err||"OK");
}
if(s.raceTeam){ for(let i=0;i<12;i++) Engine.tickMonth(s); console.log("after season: races:", s.raceTeam? s.raceTeam.races:"team gone", "wins:", s.raceWins); }

// ── oil crisis fires at Sep 1973 ──
while(s.year<1973){ Engine.tickMonth(s); }
while(s.month<9){ Engine.tickMonth(s); }
console.log("1973 crisis news present:", s.news.some(n=>/OIL CRISIS/.test(n.txt)));
if(!s.news.some(n=>/OIL CRISIS/.test(n.txt))) throw new Error("oil crisis never fired");

// ── leaderboard has many rivals ──
console.log("competitors:", s.competitors.length, "rank:", s.leaderRank);
if(s.competitors.length<10) throw new Error("too few competitors");

console.log("\nALL INTEGRATION CHECKS PASSED ✔");
