/* ═══════════ GAME ENGINE — Car Company Tycoon ═══════════ */
const Engine = {

  // ─────────── State creation ───────────
  newState(companyName, opts){
    opts = opts || {};
    const role = CEO_ROLES.find(r=>r.id===opts.role) || CEO_ROLES[3];
    const hq = HQ_CITIES.find(c=>c.id===opts.hq) || HQ_CITIES[4];
    const logo = LOGO_SYMBOLS.find(x=>x.id===(opts.logoSymbol||"bolt"))||LOGO_SYMBOLS[0];
    const shape = LOGO_SHAPES.find(x=>x.id===(opts.logoShape||"circle"))||LOGO_SHAPES[0];
    const color = BRAND_COLORS.find(x=>x.id===(opts.logoColor||"rosso"))||BRAND_COLORS[0];
    const startCash = Math.round((opts.startYear===1970?650000:250000) * (role.perks.startCashMul||1));
    const s = {
      company: companyName || "My Motors",
      ceoRole: role.id,
      brand: { symbol:logo.id, shape:shape.id, color:color.id },
      hqCity: hq.id, homeRegion: ({rome:"eu",detroit:"nafta",stuttgart:"eu",tokyo:"apac",crane:"nafta"})[hq.id]||"nafta",
      startYear: opts.startYear||1950,
      year: opts.startYear||1950, month: 0,               // month 0 = Jan
      money: startCash,
      rep: 0,
      loan: 0,
      models: [],                          // published/draft car models
      lines: [{ id:"L1", modelId:null, target:0 }],
      buildings: { assembly:1, toolshop:0, lab:0, showroom:0, qc:0, warehouse:0 },
      stock: [],                           // [{modelId, qty}]
      techs: {},                           // researched tech ids -> true
      researchQueue: null,                 // {techId, monthsLeft}
      staff: [],
      applicants: [],
      competitors: [],
      awards: [],                          // [{year,name,model}]
      news: [],
      objectivesDone: {},
      econMod: 1, econTimer: 0,
      oilCrisis: 0,                        // absMonth until which crisis active
      trendSeg: null, trendTimer: 0,
      strikeTimer: 0,
      totalSold: 0,
      monthRevenue: 0, monthProfitUnits: 0,
      history: [],                         // [{label,value,cash}]
      segSales: {},                        // last-month sales per segment for market share
      nextModelId: 1,
      speed: 1, paused: false,
      designCostBase: 8000,
      // ── deep-systems state ──
      rp: 0,                              // research points currency
      hqLevel: 0,
      fans: 0,
      regions: {},                        // regionId -> {opened, share}
      campaigns: [],                      // active marketing campaigns
      campaignHistory: 0,
      reviews: {},                        // modelId -> [{critic,score,txt}]
      raceTeam: null,                     // {seriesId, modelId, budgetPts, points, wins}
      raceWins: 0, racePodiums: 0, racePoints: 0, raceSeason: null,
      recallsDone: 0, defectPool: 0,
      lastStatement: null,
      oilSurvived: false, usedLoanDuringCrisis: false,
      envMandate:false, evSubsidy:false, suvBoom:false, gpsEra:false, macroDone:{},
      refineLevels: {},                   // part family refinement tiers bought with RP
      marketingHistory: 0,
      leaderRank: 39,
      monthlyProfitLog: [],
    };
    s.regions[s.homeRegion] = { opened:true, share:0.02 };
    // starter techs (free)
    ["ice","manual3","rwd","ladder","drumbrake","liveaxle","biasply","basicint"].forEach(t=>s.techs[t]=true);
    if(role.perks.researchSpeedAdd) s.innovatorBoost = role.perks.researchSpeedAdd;
    if(opts.startYear && opts.startYear>1950){
      // backdate starter techs for later-era starts (like CCT's 1970 start)
      const yOff = opts.startYear-1950;
      TECHS.forEach(t=>{ if(t.year<=opts.startYear-3 && !t.req.length) s.techs[t.id]=true; });
      ["fuelinj","auto2","fwd","m4","discF","coil","rad","betterint","seatbelt","leanburn","unibody","at3","hatchback"].forEach(t=>{ if(TECHS.find(x=>x.id===t)) s.techs[t]=true; });
    }
    s.applicants = this.genApplicants(s, 4);
    s.competitors = this.genCompetitors(s);
    this.pushNews(s,"🏢 "+s.company+" founded in 1950 with $250,000 in capital. Good luck!");
    return s;
  },

  absMonth(s){ return (s.year-1950)*12 + s.month; },

  pushNews(s, txt){
    s.news.unshift({ date: MONTHS[s.month]+" "+s.year, txt });
    if(s.news.length>60) s.news.pop();
  },

  // ─────────── Staff ───────────
  genApplicants(s, n){
    const out=[];
    for(let i=0;i<n;i++){
      const role = STAFF_ROLES[Math.floor(Math.random()*STAFF_ROLES.length)];
      const skill = Math.min(99, Math.max(20, Math.round(30 + Math.random()*45 + Math.sqrt(this.absMonth(s)/12)*1.2)));
      const sal = Math.round((700 + skill*95) * role.salaryMul * (1+Math.random()*.2));
      out.push({
        name: FIRST_NAMES[Math.floor(Math.random()*FIRST_NAMES.length)]+" "+LAST_NAMES[Math.floor(Math.random()*LAST_NAMES.length)],
        role: role.id, skill, salary: sal,
      });
    }
    return out;
  },
  staffBonus(s, roleId){
    let best = 0;
    for(const p of s.staff) if(p.role===roleId) best = Math.max(best, p.skill);
    return best/100; // 0..~0.99
  },
  avgStaff(s){
    if(!s.staff.length) return 0;
    return s.staff.reduce((a,p)=>a+p.skill,0)/s.staff.length/100;
  },

  // ─────────── Competitors ───────────
  genCompetitors(s){
    const comps=[];
    // the world is full of rivals — up to 38 AI automakers on the leaderboard (like CCT)
    const names=[...COMP_NAMES].sort(()=>Math.random()-.5);
    const count = 10 + Math.floor(Math.random()*6);
    for(const nm of names.slice(0,count)){
      const seg = SEGMENTS[Math.floor(Math.random()*5)].id; // early-era segments
      comps.push({ name:nm, seg, quality: 35+Math.random()*30, priceMul:.9+Math.random()*.3, share:0,
                   value: 400000 + Math.random()*9e6 });
    }
    return comps;
  },
  tickCompetitors(s){
    // occasionally add a new competitor or refresh their offerings
    if(Math.random()<.02 && s.competitors.length<38){
      const pool = COMP_NAMES.filter(n=>!s.competitors.some(c=>c.name===n));
      if(pool.length){
        const unlockedSegs = SEGMENTS.filter(g=>g.unlock<=s.year);
        const seg = unlockedSegs[Math.floor(Math.random()*unlockedSegs.length)].id;
        s.competitors.push({ name:pool[Math.floor(Math.random()*pool.length)], seg, quality: 40+Math.random()*35, priceMul:.9+Math.random()*.3, share:0, value: 400000 + Math.random()*9e6 });
        this.pushNews(s,"🆕 "+s.competitors[s.competitors.length-1].name+" entered the "+SEGMENTS.find(g=>g.id===seg).name+" market.");
      }
    }
    for(const c of s.competitors){
      c.quality = Math.min(96, c.quality + Math.random()*.55);   // AI slowly improves
      if(Math.random()<.01) c.priceMul = .85+Math.random()*.4;
      c.value = (c.value||500000) * (1 + (Math.random()*0.02 - 0.007)); // rival valuations drift monthly
    }
  },

  // ─────────── Car spec evaluation ───────────
  evalSpec(s, spec){
    const isEV = !!spec.engine.motor;
    let cost = 0, mass = 900;
    let rel=45, perf=0, comfort=0, looks=0, safety=0, eco=1; // eco multiplier: lower=better
    if(!spec.tune) spec.tune = Designer.autoTune(s, spec);

    // engine — full volumetric physics via Designer module
    let engRes;
    if(isEV){
      engRes = Designer.computeEV(s, spec);
      spec._eng = engRes;
      cost += engRes.cost; mass += engRes.mass - 120;
      perf += engRes.hp*0.55; rel += engRes.relMod;
      eco *= engRes.eco; comfort += 4 + (engRes.noise<20?6:0);
      spec._hp = engRes.hp;
      spec._range = engRes.range;
    } else {
      engRes = Designer.computeEngine(s, spec);
      spec._eng = engRes;
      cost += engRes.cost; mass += engRes.mass;
      perf += engRes.hp*0.5;
      rel += engRes.relMod;
      eco *= engRes.eco * (0.72 + spec.tune.dispCC/9000);
      spec._hp = engRes.hp;
      // noise hurts comfort slightly on loud engines
      if(engRes.noise>70) comfort -= Math.round((engRes.noise-70)/6);
    }
    // gearbox
    const G = GEARBOXES.find(x=>x.id===spec.gearbox)||GEARBOXES[0];
    cost += G.cost; rel += G.rel||0; perf += G.perf||0; comfort += G.comfort||0;
    if(G.eco) eco *= G.eco;
    // drivetrain
    const DT = DRIVETRAINS.find(x=>x.id===spec.drivetrain)||DRIVETRAINS[0];
    cost += DT.cost; rel+=DT.rel||0; perf+=DT.perf||0; safety+=DT.safety||0;
    mass += DT.massP||0; if(DT.eco) eco*=DT.eco;
    // chassis
    const C = CHASSIS.find(x=>x.id===spec.chassis)||CHASSIS[0];
    cost += C.cost; mass += C.massP; rel+=C.rel||0; safety+=C.safety; comfort+=C.comfort; perf += C.handling*0.6;
    // brakes
    const B = BRAKES.find(x=>x.id===spec.brakes)||BRAKES[0];
    cost += B.cost; safety += B.safety; perf += B.perf;
    // suspension
    const SU = SUSPENSIONS.find(x=>x.id===spec.susp)||SUSPENSIONS[0];
    cost += SU.cost; comfort += SU.comfort; perf += SU.handling*0.5; if(SU.rel) rel+=SU.rel;
    // tyres
    const T = TYRES.find(x=>x.id===spec.tyres)||TYRES[0];
    cost += T.cost; comfort += T.comfort; perf += T.grip*0.4;
    // interior
    const I = INTERIORS.find(x=>x.id===spec.interior)||INTERIORS[1];
    cost += I.cost; comfort += I.comfort; looks += I.looks||0; if(I.rel) rel+=I.rel;
    // electronics
    const E = ELECTRONICS.find(x=>x.id===spec.electronics)||ELECTRONICS[0];
    cost += E.cost; comfort += E.comfort||0; looks += E.looks||0; safety += E.safety||0;
    if(E.rel) rel+=E.rel; if(E.ecoPen) eco*=E.ecoPen;
    // safety equip
    const SF = SAFETY_EQUIP.find(x=>x.id===spec.safety)||SAFETY_EQUIP[0];
    cost += SF.cost; safety += SF.safety;
    // emissions legality penalty applied at appeal stage
    const EM = EMISSIONS.find(x=>x.id===spec.emissions)||EMISSIONS[0];
    cost += EM.cost; if(EM.ecoPen) eco*=EM.ecoPen;
    // options
    for(const oid of (spec.options||[])){
      const O = OPTIONS.find(x=>x.id===oid); if(!O) continue;
      cost += O.unit; comfort += O.comfort||0; looks += O.looks||0; safety += O.safety||0;
      perf += O.perf||0; if(O.rel) rel+=O.rel;
    }
    // body mods
    const body = BODY_TYPES.find(b=>b.id===spec.body);
    if(body){ rel+=body.mods.reliability||0; comfort+=body.mods.comfort||0; looks+=body.mods.looks||0;
              perf+=body.mods.performance||0; safety+=body.mods.safety||0; eco*=1+(body.mods.fuelEco?-body.mods.fuelEco/100:0); }

    // aero & handling derived values feed performance rating
    spec._cd = Designer.dragCd(spec.body, spec.options||[]);
    spec._handling = Designer.handlingIndex(s, spec, { chassis:C, susp:SU, tyres:T, brakes:B, drivetrain:DT });
    spec._wd = Math.round(Designer.layoutWeightDist(spec)*100);
    perf += (spec._handling-45)*0.35;
    // heavy car with small engine hurts performance
    const powerWeight = (spec._hp||40)/(mass/1000*100);
    if(powerWeight < 55) perf -= (55-powerWeight)*0.5;
    if(powerWeight > 180) perf += Math.min(18,(powerWeight-180)*0.12);

    // staff/design quality bonus
    const designerB = this.staffBonus(s,"designer"), engB = this.staffBonus(s,"engineer");
    looks = Math.round(looks*(1+designerB*.35) + designerB*8);
    comfort = Math.round(comfort*(1+designerB*.2));
    rel = Math.round(rel*(1+engB*.25) + engB*6);
    perf = Math.round(perf*(1+engB*.12));

    // age factor: designs from past years degrade vs modern expectations
    const age = (this.absMonth(s) - (spec._designMonth!=null?spec._designMonth:this.absMonth(s)))/12;
    const agePenalty = age*4.5;

    // era benchmark power (grows through decades) — used to normalise performance rating
    const yrNow = s.year;
    const bench = 55 + Math.max(0,(yrNow-1950))*2.6;   // "average" car power points for the era

    // ── real physics performance package: dyno curve integration across the gearbox ──
    let perfPkg = null;
    try { perfPkg = Designer.computePerformance(s, spec, engRes); } catch(e){ perfPkg = null; }
    if(perfPkg){
      spec._perf = perfPkg;
      mass = perfPkg.curbMass;                       // use physically-summed curb weight
      // blend measured results into the performance rating (measured data dominates)
      const measPerf = clamp(Math.round(
          (12.5 - Math.min(12.5, perfPkg.t0_60))*7 +           // 0-60: 0s→87pts, 12.5s→0
          clamp((perfPkg.topSpeed-90)/240*30,0,30) +            // top speed up to 330
          clamp((perfPkg.powerWt-20)*0.55,0,28)), 0, 145);      // power-to-weight
      perf = Math.round(perf*0.35 + measPerf*bench/100*0.65);
      eco = eco*0.55 + clamp(perfPkg.cruise.l100!=null? (perfPkg.cruise.l100/16): (perfPkg.cruise.kwh100?0.55:1),0.3,1.6)*0.45*eco;
    }

    // normalise to 0-100 ratings
    const R = {
      performance: clamp(Math.round(18 + perf/bench*55), 1, 100),
      reliability: clamp(Math.round(rel - agePenalty), 1, 100),
      comfort:     clamp(Math.round(50 + comfort - agePenalty*.8), 1, 100),
      looks:       clamp(Math.round(50 + looks - agePenalty*1.2), 1, 100),
      safety:      clamp(Math.round(30 + safety*0.9 - agePenalty*.6), 1, 100),
      fuelEco:     clamp(Math.round(100 - eco*46), 1, 100),
    };
    // scale part costs to the game era (data values are modern dollars)
    const eraF = 0.28 + 0.72*Math.max(0,s.year-1950)/75;
    const unitCost = Math.max(120, Math.round((cost*0.9 + 350)*eraF));
    return { R, unitCost, hp: spec._hp||0, mass: Math.round(mass), perf: spec._perf||null };
  },

  // appeal score 0-100 of a model against its segment
  modelAppeal(s, m){
    const seg = SEGMENTS.find(g=>g.id===m.segment);
    const {R} = m;
    let score = 0, totalW = 0;
    for(const k of ["reliability","performance","comfort","looks","safety","fuelEco"]){
      const w = seg.w[k]||0;
      score += (R[k]||0)*w; totalW += w;
    }
    // price factor
    const ideal = seg.priceIdeal * this.inflation(s);
    const ratio = m.price / ideal;
    let priceScore;
    if(ratio<=1) priceScore = 100 - (1-ratio)*40;         // cheap helps a bit but implies low quality
    else priceScore = Math.max(0, 100 - (ratio-1)*100/seg.priceTol);
    score += priceScore*(seg.w.price||10); totalW += (seg.w.price||10);
    let appeal = score/totalW;
    // emissions legality check
    const em = EMISSIONS.find(e=>e.id===m.spec.emissions);
    if(em && s.year > em.legalUntil && !m.isEV) appeal *= .35;
    // reputation halo
    appeal *= (0.85 + s.rep/200);
    return clamp(Math.round(appeal),1,100);
  },

  inflation(s){ return 1 + (this.absMonth(s)/12)*0.045; },

  // scale a spec's engine displacement to fit its segment's era-appropriate power band
  autoFitEngine(s, spec){
    if(spec.engine.motor) return; // EVs have fixed motors
    const idealHp = { budget:38, economy:55, family:85, suv:110, sports:160, luxury:130, supercar:320, ev:150 }[spec.segment] || 60;
    let best=null, bestDiff=1e9;
    for(const L of ENGINE_LAYOUTS){
      if(L.tech && !s.techs[L.tech]) continue;
      if(L.year>s.year) continue;
      for(const D of DISPLACEMENTS){
        const hp = D.cc*0.075*L.mult;
        const diff = Math.abs(hp-idealHp);
        if(diff<bestDiff){ bestDiff=diff; best={layout:L.id,disp:D.id}; }
      }
    }
    if(best){ spec.engine.layout=best.layout; spec.engine.disp=best.disp; }
  },

  // ─────────── Monthly simulation ───────────
  tickMonth(s){
    s.month++;
    if(s.month>=12){ s.month=0; s.year++; this.newYear(s); }

    // timers
    if(s.econTimer>0){ s.econTimer--; if(s.econTimer===0) s.econMod=1; }
    if(s.trendTimer>0){ s.trendTimer--; if(s.trendTimer===0) s.trendSeg=null; }
    if(s.strikeTimer>0) s.strikeTimer--;

    this.tickCompetitors(s);
    this.processResearch(s);
    // ── deep systems: RP economy, macro history events, marketing lifecycle ──
    if(typeof Systems !== "undefined"){ Systems.tickRP(s); Systems.tickMacro(s); }
    const campaignMul = (typeof Systems !== "undefined") ? Systems.tickCampaigns(s) : 1;
    const produced = this.processProduction(s);
    const soldInfo = this.processSales(s, campaignMul);
    s.totalSold += soldInfo.units;   // lifetime counter (drives objectives & stats)
    this.processCosts(s, soldInfo);
    // ── fans & loyalty loop, defect/recall pool, racing calendar, leaderboard rank ──
    if(typeof Systems !== "undefined"){
      const pubs = s.models.filter(m=>m.published);
      const avgAppeal = pubs.length? pubs.reduce((a,m)=>a+this.modelAppeal(s,m),0)/pubs.length : 50;
      Systems.tickFans(s, soldInfo.units, avgAppeal);
      Systems.tickDefects(s);
      Systems.tickRacing(s);
      Systems.updateLeaderRank(s);
    }
    this.refreshApplicants(s);
    this.checkObjectives(s);
    this.randomEvent(s);

    s.history.push({ label:MONTHS[(s.month+11)%12]+" "+(s.month===0?s.year-1:s.year), value:companyValue(s), cash:s.money });
    if(s.history.length>240) s.history.shift();
    return produced;
  },

  processResearch(s){
    if(!s.researchQueue) return;
    const lab = s.buildings.lab||0;
    // Innovator CEO perk (+50% research speed), R&D labs, researchers and HQ campus all stack
    const hqRes = (typeof Systems!=="undefined" && hqState(s).resMul) ? hqState(s).resMul : 1;
    const spd = (1 + lab*.25 + this.staffBonus(s,"researcher")*.8) * (1+(s.innovatorBoost||0)) * hqRes;
    s.researchQueue.monthsLeft -= spd;
    if(s.researchQueue.monthsLeft<=0){
      const t = TECHS.find(x=>x.id===s.researchQueue.techId);
      s.techs[t.id]=true;
      this.pushNews(s,"🔬 Research complete: <b>"+t.name+"</b>!");
      toast("🔬 Research done: "+t.name,"good");
      s.researchQueue=null;
    }
  },
  startResearch(s, techId){
    const t = TECHS.find(x=>x.id===techId);
    if(!t || s.techs[techId] || s.researchQueue) return "Already researching or done.";
    if(t.year && s.year < t.year) return "Too early for this technology.";
    for(const r of t.req) if(!s.techs[r]) return "Requires: "+TECHS.find(x=>x.id===r).name;
    if(s.money < t.cost) return "Not enough money.";
    s.money -= t.cost;
    s.researchQueue = { techId, monthsLeft: t.time, total:t.time };
    this.pushNews(s,"🔬 Started research: "+t.name);
    return null;
  },

  capacityPerLine(s){
    const mgr = this.staffBonus(s,"manager");
    const assy = 1 + (s.buildings.assembly-1)*0.15;
    return Math.round(120 * assy * (1+mgr*.4) * (1+s.rep/300));
  },
  processProduction(s){
    const cap = this.capacityPerLine(s);
    const toolDisc = 1-(s.buildings.toolshop||0)*.04;
    let totalBuilt=0, spend=0;
    const whCap = 300 + (s.buildings.warehouse||0)*500;
    const stockTotal = s.stock.reduce((a,c)=>a+c.qty,0);
    for(const line of s.lines){
      if(!line.modelId) continue;
      const m = s.models.find(x=>x.id===line.modelId);
      if(!m || !m.published) continue;
      const want = Math.min(line.target, cap);
      let canStock = Math.max(0, whCap - stockTotal - totalBuilt);
      const built = Math.min(want, canStock);
      if(built>0){
        const unit = Math.round(m.unitCost*toolDisc);
        spend += built*unit;
        let st = s.stock.find(c=>c.modelId===m.id);
        if(!st){ st={modelId:m.id,qty:0}; s.stock.push(st); }
        st.qty += built; totalBuilt+=built;
      }
      line.lastBuilt = built;
    }
    s.productionSpend = spend;
    s.monthProduced = totalBuilt;
    return totalBuilt;
  },

  processSales(s, campaignMul){
    campaignMul = campaignMul || 1;
    const infl = this.inflation(s);
    const mkt = this.econMod(s);
    let revenue=0, units=0;
    s.segSales = {};
    // demand per segment incl competitors
    for(const seg of SEGMENTS){
      if(seg.unlock>s.year) continue;
      let base = seg.demandBase * mkt * (1+(s.year-1950)*0.012); // market growth over decades
      if(s.trendSeg===seg.id) base*=1.5;
      if(s.oilCrisis>this.absMonth(s) && (seg.id==="suv"||seg.id==="sports"||seg.id==="supercar")) base*=.6;
      if(s.oilCrisis>this.absMonth(s) && (seg.id==="budget"||seg.id==="economy"||seg.id==="ev")) base*=1.25;
      if(s.suvBoom && (seg.id==="suv"||seg.id==="pickup")) base*=1.2;
      if(s.evSubsidy && seg.id==="ev") base*=1.4;
      s.segSales[seg.id]={your:0,total:base};
    }
    // global region footprint multiplier (home + opened export markets, normalised so home-only ≈ 1.0)
    let regionMul = 1;
    if(typeof Systems !== "undefined"){
      const homeM = Systems.regionSalesMul(s, s.homeRegion) || 1;
      let total = 0;
      for(const r of REGIONS){ const rm = Systems.regionSalesMul(s, r.id); if(rm>0) total += rm; }
      regionMul = clamp(total / homeM, 1, 4.5); // exports scale demand up to ~4.5x with all 5 regions open
    }
    const fanMul = (typeof Systems!=="undefined") ? Systems.fanDemandBonus(s) : 1;
    const hqSale = (typeof Systems!=="undefined" && hqState(s).salesMul) ? hqState(s).salesMul : 1;
    for(const m of s.models){
      if(!m.published) continue;
      const seg = s.segSales[m.segment]; if(!seg) continue;
      const appeal = this.modelAppeal(s,m);
      const marketing = 1 + (s.buildings.showroom||0)*.08 + this.staffBonus(s,"marketer")*.25;
      // share of segment demand based on appeal vs competitors
      const compQ = s.competitors.filter(c=>c.seg===m.segment).map(c=>c.quality);
      const bestComp = compQ.length? Math.max(...compQ):40;
      let strength = appeal/(appeal+bestComp*0.9+8);
      // regional segment taste for this model's main market weighting
      let taste = 1;
      if(typeof Systems !== "undefined"){
        let wsum=0, tsum=0;
        for(const r of REGIONS){ const rm=Systems.regionSalesMul(s,r.id); if(rm<=0)continue;
          wsum+=rm; tsum += rm*(r.traits[m.segment]||1); }
        if(wsum>0) taste = tsum/wsum;
      }
      let desire = Math.round(seg.total * strength * marketing * .55 * campaignMul * regionMul * fanMul * hqSale * taste);
      // production capacity cap: a young company can't supply the whole world
      const activeLines = s.lines.filter(l=>l.modelId).length || 1;
      const capLimit = this.capacityPerLine(s)*activeLines*(1+(s.buildings.assembly-1)*0.35);
      desire = Math.min(desire, Math.round(capLimit*1.6));
      // age decay: older models lose appeal
      const ageYrs = (this.absMonth(s)-m.designMonth)/12;
      desire = Math.round(desire * Math.max(.25, 1 - ageYrs*0.07));
      // limited by stock
      const st = s.stock.find(c=>c.modelId===m.id);
      const avail = st?st.qty:0;
      const sold = Math.min(desire, avail);
      if(st) st.qty -= sold;
      revenue += sold*m.price;
      units += sold;
      m.salesMonth = sold; m.salesTotal += sold;
      m.unmetDemand = Math.max(0, desire-sold);
      seg.your += desire; seg.total += desire;
      if(seg) s.segSales[m.segment].yourSold = (s.segSales[m.segment].yourSold||0)+sold;
    }
    // competitor shares for market tab
    for(const c of s.competitors){
      const seg=s.segSales[c.seg];
      if(seg){ c.share = clamp(Math.round((c.quality/(seg.your||seg.total))*100),2,80); }
    }
    s.monthRevenue = revenue; s.monthUnits = units;
    // reputation drift toward average appeal
    const pubs = s.models.filter(m=>m.published);
    if(pubs.length){
      const avgAppeal = pubs.reduce((a,m)=>a+this.modelAppeal(s,m),0)/pubs.length;
      const target = clamp(Math.round(avgAppeal*0.9),0,100);
      const mkBoost = 1+this.staffBonus(s,"marketer");
      if(target>s.rep) s.rep = Math.min(target, s.rep + Math.max(1,Math.round((target-s.rep)*0.05*mkBoost)));
      else if(s.month%3===0) s.rep = Math.max(target, s.rep-1);
    }
    return { revenue, units };
  },

  econMod(s){
    let m = s.econMod;
    if(s.oilCrisis>this.absMonth(s)) m*=.88;
    return m;
  },

  processCosts(s, soldInfo){
    const salaries = s.staff.reduce((a,p)=>a+p.salary,0);
    const hqCity = (typeof HQ_CITIES!=="undefined") ? (HQ_CITIES.find(c=>c.id===s.hqCity)||{tax:1}) : {tax:1};
    const overhead = Math.round((1500 + s.lines.length*800 + Object.keys(s.buildings).reduce((a,k)=>a+(s.buildings[k]||0)*400,0)) * (hqCity.tax||1));
    const interest = Math.round(s.loan*0.009);
    const designUpd = 0;
    const exp = salaries + overhead + interest + (s.productionSpend||0) + designUpd;
    s.money += soldInfo.revenue - exp;
    s.lastStatement = { revenue:soldInfo.revenue, salaries, overhead, interest, production:s.productionSpend||0, net: soldInfo.revenue-exp };
    if(typeof Systems !== "undefined") Systems.statement(s, soldInfo.revenue, exp);
    if(s.money<0){
      // auto-loan attempt
      const maxLoan = 500000 + companyValue(s)*0.4;
      if(s.loan < maxLoan){
        const need = Math.ceil((-s.money+1000)/1000)*1000;
        const take = Math.min(need, maxLoan-s.loan);
        s.loan += take; s.money += take;
        this.pushNews(s,"🏦 Emergency bank loan of $"+fmt(take)+" taken (interest 0.9%/mo).");
        toast("🏦 Bank covered your shortfall with a loan.","bad");
      } else {
        this.pushNews(s,"💥 BANKRUPT! Your company has collapsed.");
        gameOver(s);
      }
    }
  },

  refreshApplicants(s){
    if(Math.random()<.25 && s.applicants.length<8) s.applicants.push(...this.genApplicants(s,1));
    if(Math.random()<.15 && s.applicants.length>0) s.applicants.splice(Math.floor(Math.random()*s.applicants.length),1);
  },

  newYear(s){
    this.awardsCeremony(s);
    // yearly difficulty: more competitors improve
    this.pushNews(s,"🎆 Welcome to "+s.year+". Happy New Year!");
  },

  awardsCeremony(s){
    const won=[];
    for(const aw of AWARD_TYPES){
      const seg = SEGMENTS.find(g=>g.id===aw.seg);
      if(seg.unlock>s.year-1) continue;
      const mine = s.models.filter(m=>m.published && m.segment===aw.seg);
      if(!mine.length) continue;
      const best = mine.map(m=>({m,a:this.modelAppeal(s,m)})).sort((x,y)=>y.a-x.a)[0];
      const compQ = Math.max(45,...s.competitors.filter(c=>c.seg===aw.seg).map(c=>c.quality));
      if(best.a >= compQ && best.a>=55){
        s.awards.push({year:s.year, name:aw.name, model:best.m.name});
        s.rep = Math.min(100, s.rep+4);
        won.push(aw.name+" — "+best.m.name);
      }
    }
    if(won.length){
      this.pushNews(s,"🏆 Award season! You won: "+won.join(", "));
      modal("🏆 Industry Awards "+s.year, "<p>You received:</p><ul style='text-align:left;margin:10px 25px'>"+won.map(w=>"<li>🏅 "+w+"</li>").join("")+"<li>+4 Reputation each</li></ul>");
    }
  },

  randomEvent(s){
    if(Math.random()>0.10) return;
    if(Math.random()<0.35){
      const unlockedTrends = TREND_EVENTS.filter(t=>SEGMENTS.find(g=>g.id===t.seg).unlock<=s.year);
      const t = unlockedTrends[Math.floor(Math.random()*unlockedTrends.length)];
      s.trendSeg=t.seg; s.trendTimer=6+Math.floor(Math.random()*4);
      this.pushNews(s,t.txt); toast(t.txt,"gold");
      return;
    }
    const ev = EVENTS[Math.floor(Math.random()*EVENTS.length)];
    if(ev.apply) ev.apply(s);
    this.pushNews(s,ev.txt);
    toast(ev.txt, ev.type==="good"?"good":"bad");
  },

  checkObjectives(s){
    const lists = (typeof OBJECTIVES2 !== "undefined") ? [OBJECTIVES, OBJECTIVES2] : [OBJECTIVES];
    for(const list of lists){
      for(const o of list){
        if(!s.objectivesDone[o.id] && o.check(s)){
          s.objectivesDone[o.id]=true;
          s.money += o.rew;
          this.pushNews(s,"🎯 Objective complete: "+o.txt+" (+$"+fmt(o.rew)+")");
          toast("🎯 Objective complete! +$"+fmt(o.rew),"gold");
        }
      }
    }
  },

  // ─────────── Actions ───────────
  defaultSpec(s, name, segment, body){
    const lux = ["luxury","supercar","sports"].includes(segment);
    const spec = {
      name, segment, body,
      engine:{ layout:"i4", disp:"cc1600", fuel:"petrol", asp:"na", fuelSys:"carb1", motor:null, batt:null,
               valvetrain:"ohv", block:"iron", rod:"cast", crank:"steelcrank", cooling:"thermo", exhaust:"restricted", richness:"ideal", revLimit:6000 },
      gearbox: lux?"a3":"m3", drivetrain:"rwd", chassis:"lad", brakes:"drum", susp:"leaf", tyres:"bias",
      interior:"basic", electronics:"norad", safety:"none", emissions:"raw", options:[],
      _designMonth: this.absMonth(s),
    };
    // era-appropriate suspension/tyres if researched (starter cars shouldn't be on leaf springs forever)
    if(s.techs.macpherson) spec.susp="mcph";
    if(s.techs.radial) spec.tyres="rad";
    if(s.techs.unibody && !["pickup","suvbody","van"].includes(body)) spec.chassis="uni";
    if(s.techs.discbrake) spec.brakes="discF";
    if(s.techs.manual4 && lux) spec.gearbox="m4";
    if(s.techs.auto4 && lux) spec.gearbox="a4";
    if(s.techs.crumple) spec.safety="crump"; else if(s.year>=1959) spec.safety="belts";
    if(s.techs.smog && s.year>1970) spec.emissions="smogc";
    if(s.techs.catconv && s.year>1975) spec.emissions="catc";
    if(s.techs.ac) spec.electronics="acunit"; else if(s.techs.radiomanual) spec.electronics="radio";
    this.autoFitEngine(s, spec);
    return spec;
  },

  designCost(s, isNew){
    const designers = this.staffBonus(s,"designer");
    const speedFactor = 1/(1+designers*1.5);
    return Math.round((isNew? s.designCostBase : s.designCostBase*0.45) * (1+(s.buildings.lab||0)*0.1));
  },
  designMonths(s, isNew){
    const designers = this.staffBonus(s,"designer");
    return Math.max(1, Math.round((isNew?3:1)/(1+designers*2)));
  },

  publishModel(s, spec, price){
    // validation
    const body = BODY_TYPES.find(b=>b.id===spec.body);
    if(!body.segs.includes(spec.segment)) return "Body type doesn't fit that segment.";
    for(const [k,arr,msg] of [["gearbox",GEARBOXES,"gearbox"],["chassis",CHASSIS,"chassis"],["brakes",BRAKES,"brakes"],["susp",SUSPENSIONS,"suspension"],["tyres",TYRES,"tyres"],["interior",INTERIORS,"interior"],["electronics",ELECTRONICS,"electronics"],["safety",SAFETY_EQUIP,"safety"],["emissions",EMISSIONS,"emissions"]]){
      const item = arr.find(x=>x.id===spec[k]);
      if(!item) return "Invalid "+msg+" selected.";
      if(item.tech && !s.techs[item.tech]) return "Missing tech for "+item.name+".";
    }
    const isEV = !!spec.engine.motor;
    if(isEV){
      if(!s.techs.evdrive) return "You haven't researched EV powertrains.";
      const mb = EV_BATTERIES.find(x=>x.id===spec.engine.batt);
      if(!mb || (mb.tech && !s.techs[mb.tech])) return "Battery tech missing.";
      const gb = GEARBOXES.find(x=>x.id===spec.gearbox);
      if(!gb.evOnly) return "EVs need the single-speed gearbox.";
    } else {
      const L=ENGINE_LAYOUTS.find(x=>x.id===spec.engine.layout);
      if(L.tech && !s.techs[L.tech]) return "Missing engine tech: "+TECHS.find(t=>t.id===L.tech).name;
      for(const it of [ENGINE_FUELS,ASPIRATION,FUEL_SYS]){
        const sel = it.find(x=>x.id===spec.engine[it===ENGINE_FUELS?"fuel":it===ASPIRATION?"asp":"fuelSys"]);
        if(sel && sel.tech && !s.techs[sel.tech]) return "Missing tech: "+TECHS.find(t=>t.id===sel.tech).name;
      }
      const DT = DRIVETRAINS.find(x=>x.id===spec.drivetrain);
      if(DT.tech && !s.techs[DT.tech]) return "Missing drivetrain tech.";
    }
    for(const oid of spec.options||[]){
      const O=OPTIONS.find(x=>x.id===oid);
      if(O && O.year>s.year) return O.name+" isn't available yet.";
    }
    const fee = this.designCost(s, !spec._existingId);
    if(s.money<fee) return "Design fee $"+fmt(fee)+" — not enough cash.";
    s.money -= fee;

    // ── deep part-family refinement tiers genuinely improve the engineered car ──
    if(typeof Systems !== "undefined"){
      const rf = (fam)=>Systems.refineMul(s, fam);
      spec._refine = { engine:rf("engine"), gearbox:rf("gearbox"), chassis:rf("chassis"), brakes:rf("brakes"),
                       susp:rf("susp"), tyres:rf("tyres"), interior:rf("interior"), electronics:rf("electronics"),
                       safety:rf("safety"), emissions:rf("emissions") };
    } else spec._refine = null;

    const ev = this.evalSpec(s, spec);
    if(spec._refine){
      // refinement tiers lift measured ratings a notch each (max tier 5 → +4 pts per family)
      const r = spec._refine;
      ev.R.reliability  = clamp(ev.R.reliability + Math.round((r.engine-1)*30 + (r.gearbox-1)*22 + (r.chassis-1)*26), 1, 100);
      ev.R.performance  = clamp(ev.R.performance + Math.round((r.engine-1)*34 + (r.tyres-1)*20 + (r.susp-1)*16), 1, 100);
      ev.R.safety       = clamp(ev.R.safety + Math.round((r.safety-1)*44 + (r.brakes-1)*28), 1, 100);
      ev.R.comfort      = clamp(ev.R.comfort + Math.round((r.interior-1)*36 + (r.electronics-1)*20), 1, 100);
      ev.R.fuelEco      = clamp(ev.R.fuelEco + Math.round((r.emissions-1)*30 + (r.engine-1)*14), 1, 100);
      ev.unitCost       = Math.max(120, Math.round(ev.unitCost * (1 + (r.engine-1)*0.05))); // refined parts cost more to build
    }
    if(spec._existingId){
      // update existing model (facelift)
      const m = s.models.find(x=>x.id===spec._existingId);
      Object.assign(m,{ name:spec.name, spec:{...spec}, R:ev.R, unitCost:ev.unitCost, hp:ev.hp, mass:ev.mass, price:Math.round(price), facelifts:(m.facelifts||0)+1, cd:spec._cd, handling:spec._handling, wd:spec._wd, torque:spec._eng?spec._eng.torque:0, redline:spec._eng?spec._eng.rpmRedline:0, range:spec._range||0, perf:ev.perf, stress:ev.perf?ev.perf.stressIndex:0 }); m.version=(m.version||1)+1;
      m.appeal = this.modelAppeal(s,m);
      this.pushNews(s,"🔧 Facelift released: <b>"+m.name+"</b> (v"+m.version+")");
      toast("Facelift applied to "+m.name,"good");
    } else {
      const m = {
        id: s.nextModelId++, name: spec.name, segment: spec.segment, body: spec.body,
        spec:{...spec}, R:ev.R, unitCost:ev.unitCost, hp:ev.hp, mass:ev.mass,
        price: Math.round(price), published:true, version:1,
        launchYear:s.year, launchMonth:s.month, designMonth:this.absMonth(s),
        salesTotal:0, salesMonth:0, facelifts:0,
        isEV: !!spec.engine.motor,
        cd: spec._cd, handling: spec._handling, wd: spec._wd,
        torque: spec._eng ? spec._eng.torque : 0,
        redline: spec._eng ? spec._eng.rpmRedline : 0,
        range: spec._range || 0,
        perf: ev.perf,                      // measured physics: 0-60, quarter mile, top speed...
        stress: ev.perf ? ev.perf.stressIndex : 0,
      };
      m.appeal = this.modelAppeal(s,m);
      s.models.push(m);
      this.pushNews(s,"🚀 Model launch: <b>"+m.name+"</b> ("+SEGMENTS.find(g=>g.id===m.segment).name+", "+m.hp+" hp, $"+fmt(m.price)+")");
      toast("🚀 "+m.name+" launched!","good");
      // press day: critics review the new model immediately (like CCT's review popups)
      if(typeof Systems !== "undefined"){
        try{ Systems.reviewModel(s, m); }catch(e){ /* reviews never block a launch */ }
      }
    }
    return null;
  },

  discontinueModel(s, id){
    const m = s.models.find(x=>x.id===id);
    if(!m) return;
    m.published=false; m.discontinued=true;
    for(const l of s.lines) if(l.modelId===id){ l.modelId=null; l.target=0; }
    const st = s.stock.find(c=>c.modelId===id);
    if(st){ s.money += st.qty*m.unitCost*0.4; this.pushNews(s,"♻️ Discontinued "+m.name+". Remaining stock liquidated at 40%."); s.stock.splice(s.stock.indexOf(st),1); }
    else this.pushNews(s,"🗑️ "+m.name+" discontinued.");
  },
};

// utils
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function fmt(n){
  n = Math.round(n);
  if(Math.abs(n)>=1e9) return (n/1e9).toFixed(2)+"B";
  if(Math.abs(n)>=1e6) return (n/1e6).toFixed(2)+"M";
  if(Math.abs(n)>=1e4) return (n/1e3).toFixed(1)+"k";
  return n.toLocaleString();
}
