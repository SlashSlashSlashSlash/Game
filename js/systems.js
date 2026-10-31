/* ═══════════ DEEP SYSTEMS MODULE — Marketing, Critics, Regions, Fans, Recalls, Motorsport, HQ, RP ═══════════
   Every function here mutates real game state; effects flow through Engine's monthly simulation. */

const Systems = {

  // ─────────── Research Points (RP) economy ───────────
  rpPerMonth(s){
    let base = 0;
    for(const st of s.staff){
      if(st.role==="engineer") base += RP_CONFIG.perEngineerBase * (0.5 + st.skill/100);
      else if(st.role==="designer") base += RP_CONFIG.perEngineerBase * RP_CONFIG.designerShare * (0.5 + st.skill/100);
      else if(st.role==="researcher") base += RP_CONFIG.perEngineerBase * RP_CONFIG.researcherShare * (0.5 + st.skill/100);
    }
    const labMul = 1 + s.buildings.lab*RP_CONFIG.labBonus;
    const hqMul = hqState(s).resMul||1;
    return base * labMul * hqMul;
  },
  tickRP(s){
    s.rp += this.rpPerMonth(s) + (hqState(s).rp||0)*0.1;
  },

  // ─────────── Part-family refinement (spend RP to genuinely improve parts) ───────────
  refineCost(s, fam){
    const lvl = s.refineLevels[fam]||0;
    return Math.round(RP_CONFIG.costs[fam] * (1 + lvl*0.85));
  },
  refine(s, fam){
    const cost = this.refineCost(s,fam);
    if(s.rp < cost) return "Not enough research points ("+cost+" RP needed).";
    const lvl = s.refineLevels[fam]||0;
    if(lvl>=5) return "Family fully refined.";
    s.rp -= cost;
    s.refineLevels[fam] = lvl+1;
    this.pushNewsLite(s,"🔬 "+fam.charAt(0).toUpperCase()+fam.slice(1)+" programme refined to tier "+(lvl+1)+".");
    return null;
  },
  refineMul(s, fam){ return 1 + (s.refineLevels[fam]||0)*0.04; },

  // ─────────── Headquarters upgrades ───────────
  upgradeHQ(s){
    const next = (s.hqLevel||0)+1;
    if(next >= HQ_LEVELS.length) return "Headquarters already at maximum tier.";
    const cost = HQ_LEVELS[next].cost;
    if(s.money < cost) return "Need $"+fmt(cost)+" for "+HQ_LEVELS[next].name+".";
    s.money -= cost; s.hqLevel = next;
    this.pushNewsLite(s,"🏗️ Headquarters upgraded to <b>"+HQ_LEVELS[next].name+"</b>!");
    toast("HQ upgraded: "+HQ_LEVELS[next].name,"good");
    return null;
  },
  hqLineSlots(s){ return 1 + (s.hqLevel>=1?1:0) + (s.hqLevel>=4?1:0); },
  hqStaffCap(s){ return hqState(s).staffCap || 8; },

  // ─────────── Fan club ───────────
  fanTier(s){
    const th = FANS_CFG.tierThresholds;
    let t=0; for(let i=0;i<th.length;i++) if((s.fans||0)>=th[i]) t=i;
    return t;
  },
  fanDemandBonus(s){ return 1 + FANS_CFG.tierBonuses[this.fanTier(s)]; },
  tickFans(s, soldCount, avgAppeal){
    const role = CEO_ROLES.find(r=>r.id===s.ceoRole)||{};
    const perCar = FANS_CFG.perSale * ((role.perks&&role.perks.fanPerCarMul)||1);
    s.fans = (s.fans||0) + soldCount*perCar + soldCount*((avgAppeal||50)/100)*FANS_CFG.perAppealMonth*12;
    const ages = s.models.filter(m=>m.published).map(m=>this.absMonthSafe(s)-(m.designMonth!=null?m.designMonth:this.absMonthSafe(s)));
    const oldest = ages.length?Math.max.apply(null,ages):0;
    if(oldest>60) s.fans *= 0.9995;
    if(s.fans<0) s.fans=0;
  },

  // ─────────── Global market regions ───────────
  openRegion(s, rid){
    const r = REGIONS.find(x=>x.id===rid); if(!r) return "Unknown region.";
    if(s.regions[rid] && s.regions[rid].opened) return "Already selling there.";
    if(s.money < r.entryCost) return "Market entry costs $"+fmt(r.entryCost)+".";
    s.money -= r.entryCost;
    s.regions[rid] = { opened:true, share:0 };
    this.pushNewsLite(s,"🌍 "+s.company+" opens dealer networks in <b>"+r.name+"</b>!");
    return null;
  },
  regionSalesMul(s, rid){
    const r = REGIONS.find(x=>x.id===rid); if(!r) return 0;
    if(!s.regions[rid] || !s.regions[rid].opened) return 0;
    const hq = HQ_CITIES.find(c=>c.id===s.hqCity)||HQ_CITIES[4];
    const home = (s.homeRegion===rid);
    const ship = home?1:(2 - r.shipCost);
    const prestige = home?hq.prestige:1;
    return r.size * ship * prestige * (home?hq.homeBonus:1);
  },

  // ─────────── Marketing campaigns ───────────
  campaignCost(s, channelId, sizeId, months){
    const ch = MKT_CHANNELS.find(c=>c.id===channelId); const sz = MKT_SIZES.find(z=>z.id===sizeId);
    if(!ch||!sz) return 0;
    const role = CEO_ROLES.find(r=>r.id===s.ceoRole)||{};
    const perk = (role.perks&&role.perks.marketingCostMul)||1;
    return Math.round(ch.baseCost * sz.mul * months * perk * this.inflationNow(s));
  },
  launchCampaign(s, cfg){
    const ch = MKT_CHANNELS.find(c=>c.id===cfg.channelId);
    const sz = MKT_SIZES.find(z=>z.id===cfg.sizeId);
    if(!ch||!sz) return "Invalid campaign configuration.";
    if(s.year < ch.minYear) return ch.name+" isn't viable until "+ch.minYear+".";
    if(cfg.months<ch.durMin||cfg.months>ch.durMax) return "Duration must be "+ch.durMin+"-"+ch.durMax+" months for this channel.";
    const cost = this.campaignCost(s,cfg.channelId,cfg.sizeId,cfg.months);
    if(s.money<cost) return "Campaign costs $"+fmt(cost)+".";
    s.money -= cost;
    const model = cfg.modelId ? s.models.find(m=>m.id===cfg.modelId) : null;
    s.nextCampaignId=(s.nextCampaignId||0)+1;
    s.campaigns.push({ id:s.nextCampaignId, channel:cfg.channelId, size:cfg.sizeId, monthsLeft:cfg.months,
      totalMonths:cfg.months, modelId: model?model.id:null, spent:cost });
    s.marketingHistory++;
    this.pushNewsLite(s,"📣 Marketing campaign launched: <b>"+ch.name+"</b> ("+sz.name+", "+cfg.months+" mo"+(model?", featuring "+model.name:"")+")");
    toast("Campaign live: "+ch.name,"good");
    return null;
  },
  tickCampaigns(s){
    let boostRep = 0, boostFans = 0;
    const keep=[];
    for(const c of s.campaigns){
      const ch = MKT_CHANNELS.find(x=>x.id===c.channel);
      const sz = MKT_SIZES.find(x=>x.id===c.size);
      if(!ch||!sz) continue;
      let segFit = 1;
      if(c.modelId){
        const m = s.models.find(x=>x.id===c.modelId);
        if(m && ch.best.includes(m.segment)) segFit = 1.35;
        if(m) boostFans += (c.spent/c.totalMonths)*ch.fanPer*sz.reachMul*(m.appeal||50)/60;
      }
      boostRep += 0.05*sz.reachMul*ch.reach*segFit;
      c.monthsLeft--;
      if(c.monthsLeft>0) keep.push(c);
      else this.pushNewsLite(s,"📉 Campaign \""+ch.name+"\" has wrapped up.");
    }
    s.campaigns = keep;
    if(boostRep>0) s.rep = clamp(s.rep + boostRep, -100, 100);
    if(boostFans>0) s.fans = (s.fans||0) + boostFans;
    let mul = 1;
    for(const c of s.campaigns){
      const ch = MKT_CHANNELS.find(x=>x.id===c.channel); const sz = MKT_SIZES.find(x=>x.id===c.size);
      const heat = c.monthsLeft/c.totalMonths;
      mul += 0.06*sz.reachMul*ch.reach*(0.5+heat/2);
    }
    return mul;
  },

  // ─────────── Critic reviews ───────────
  reviewModel(s, m){
    const out=[];
    for(const cr of CRITICS){
      const b = cr.bias;
      let num = 0, den = 0;
      for(const rk of ["performance","reliability","comfort","looks","safety","fuelEco"]){
        const w = b[rk]!=null?b[rk]:1;
        num += m.R[rk]*w; den += w;
      }
      let score = num/den/10;
      const seg = SEGMENTS.find(g=>g.id===m.segment);
      const ideal = seg.priceIdeal*this.inflationNow(s);
      const ratio = m.price/ideal;
      score += (b.value!=null?b.value:1)*(ratio<=1?0.4:-Math.min(2.5,(ratio-1)*2.2));
      if(m.spec._eng){ score += (b.engineering!=null?b.engineering:1)*(Math.min(0.6,(m.spec._eng.hp||0)/900)); }
      if(m.isEV && s.year>2008) score += 0.3;
      score += Math.min(0.5,(m.spec.options||[]).length*0.06);
      score = clamp(score + (Math.random()*0.7-0.35), 0.5, 10);
      const words = score>=9?"Masterpiece":score>=8?"Brilliant":score>=7?"Impressive":score>=6?"Competent":
                    score>=5?"Mediocre":score>=4?"Underwhelming":score>=3?"Poor":"Awful";
      out.push({ critic:cr.id, name:cr.name, icon:cr.icon, score:+score.toFixed(1), word:words, month:this.absMonthSafe(s) });
    }
    s.reviews[m.id]=out;
    const avg = out.reduce((a,r)=>a+r.score,0)/out.length;
    s.rep = clamp(s.rep + (avg-5.5)*0.8, -100, 100);
    this.pushNewsLite(s,"📰 Press day for <b>"+m.name+"</b>: critics average <b>"+avg.toFixed(1)+"/10</b> - \""+out[0].word+"\" says "+out[0].name+".");
    return avg;
  },

  // ─────────── Recalls & defects ───────────
  defectRate(s, m){
    const ppm = Math.max(RECALL_CFG.minPpm,
      RECALL_CFG.baseDefectPpm - (m.R.reliability-50)*Math.abs(RECALL_CFG.perRel) - s.buildings.qc*Math.abs(RECALL_CFG.qcPer));
    return ppm/1e6;
  },
  tickDefects(s){
    for(const m of s.models){
      if(!m.published) continue;
      s.defectPool += (m.salesMonth||0)*this.defectRate(s,m);
    }
    if(s.defectPool>40 && Math.random()<0.05){
      const worst = s.models.filter(m=>m.published).sort((a,b)=>this.defectRate(s,b)-this.defectRate(s,a))[0];
      if(worst){
        const affected = Math.min(Math.floor(s.defectPool), Math.floor(worst.salesTotal*0.12)+1);
        const cost = affected*(worst.unitCost*0.9+260);
        s.money -= cost;
        s.rep = clamp(s.rep - Math.min(9,affected/40+1), -100,100);
        s.defectPool -= affected;
        s.recallsDone++;
        this.pushNewsLite(s,"⚠️ RECALL: <b>"+worst.name+"</b> - "+fmt(affected)+" units fixed at $"+fmt(cost)+" cost. Reputation damaged.");
        toast("Recall issued! -$"+fmt(cost),"bad");
      }
    }
    if(s.defectPool>200) s.rep = clamp(s.rep-0.15,-100,100);
  },
  voluntaryRecall(s, modelId){
    const m = s.models.find(x=>x.id===modelId); if(!m) return "No such model.";
    const affected = Math.floor(s.defectPool*0.6)+Math.floor(m.salesTotal*this.defectRate(s,m));
    if(affected<=0) return "Nothing to recall yet.";
    const cost = affected*(m.unitCost*0.75+200);
    if(s.money<cost) return "Voluntary recall costs $"+fmt(cost)+".";
    s.money-=cost; s.defectPool=Math.max(0,s.defectPool-affected);
    s.rep = clamp(s.rep + Math.min(4, affected/80), -100,100);
    s.recallsDone++;
    this.pushNewsLite(s,"🛠️ Voluntary recall of "+fmt(affected)+" "+m.name+" units - the public appreciates honesty.");
    return null;
  },

  // ─────────── Motorsport ───────────
  enterRacing(s, seriesId, modelId){
    const sr = RACE_SERIES.find(x=>x.id===seriesId); if(!sr) return "Unknown series.";
    if(s.year<sr.unlockYear) return sr.name+" starts in "+sr.unlockYear+".";
    const m = s.models.find(x=>x.id===modelId); if(!m||!m.published) return "Pick a production model.";
    if(m.hp<sr.minHp||m.hp>sr.maxHp) return m.name+"'s power ("+m.hp+" hp) is outside series limits ("+sr.minHp+"-"+sr.maxHp+" hp).";
    const evOk = m.isEV && sr.segs.includes("ev");
    if(!sr.segs.includes(m.segment)&&!evOk) return sr.name+" doesn't admit "+SEGMENTS.find(g=>g.id===m.segment).name+" cars.";
    if(s.raceTeam && s.raceTeam.seriesId===seriesId) return "You already race in that series.";
    if(s.money<sr.cost) return "Entry fee is $"+fmt(sr.cost)+".";
    s.money -= sr.cost;
    s.raceTeam = { seriesId, modelId:m.id, points:0, wins:0, podiums:0, budgetPts:0, races:0 };
    this.pushNewsLite(s,"🏁 Racing team founded! <b>"+m.name+"</b> enters the "+sr.name+".");
    return null;
  },
  fundRaceTeam(s, amount){
    if(!s.raceTeam) return "No racing team.";
    if(s.money<amount) return "Not enough cash.";
    s.money-=amount; s.raceTeam.budgetPts += Math.floor(amount/2000);
    return null;
  },
  simRace(s){
    const rt=s.raceTeam; if(!rt) return null;
    const sr = RACE_SERIES.find(x=>x.id===rt.seriesId);
    const m = s.models.find(x=>x.id===rt.modelId);
    if(!m||!m.published){ this.pushNewsLite(s,"🏁 Racing team withdrawn - "+(m?m.name:"your racer")+" left production."); s.raceTeam=null; return null; }
    const perfScore = m.R.performance*sr.weight.perf/100 + m.R.reliability*sr.weight.rel/100 + (m.handling||45)*sr.weight.handling/100;
    const our = perfScore*(1+(s.techs.telemetry?0.1:0)) + rt.budgetPts*0.35 + Math.random()*22;
    const yr=this.absMonthSafe(s)/12;
    const fieldStrength = 55 + yr*0.35;
    const rivals = [];
    for(let i=0;i<9;i++){
      rivals.push({ name:s.competitors[i%s.competitors.length].name, score: fieldStrength + (i-4)*3.2 + Math.random()*24 });
    }
    rivals.push({ name:s.company+" Works", score:our, us:true });
    rivals.sort((a,b)=>b.score-a.score);
    const finish = rivals.findIndex(r=>r.us)+1;
    const pts = [25,18,15,12,10,8,6,4,2,1][finish-1]||0;
    rt.points+=pts; rt.races++;
    const trackName = RACES_PER_SEASON[(rt.races-1)%RACES_PER_SEASON.length];
    if(finish===1){ rt.wins++; s.raceWins++; s.rep=clamp(s.rep+sr.repWin,-100,100); s.fans=(s.fans||0)+sr.fanWin; s.money+=sr.prize;
      this.pushNewsLite(s,"🏆 VICTORY! <b>"+m.name+"</b> wins the "+trackName+"! Prize $"+fmt(sr.prize)+".");
      toast("Race win!","good");
    } else if(finish<=3){ rt.podiums++; s.racePodiums++; s.fans=(s.fans||0)+sr.fanWin*0.35; s.rep=clamp(s.rep+sr.repWin*0.4,-100,100);
      this.pushNewsLite(s,"🥉 P"+finish+" for "+m.name+" at "+trackName+".");
    } else if(finish>=8 && Math.random()<0.4){
      s.rep=clamp(s.rep-1,-100,100);
      this.pushNewsLite(s,"💨 Troubled run (P"+finish+") in "+trackName+".");
    }
    rt.budgetPts = Math.max(0, rt.budgetPts - 1);
    if(rt.races%RACES_PER_SEASON.length===0){
      const champ = rt.points>=120;
      this.pushNewsLite(s,"🏅 Season over in "+sr.name+": "+rt.points+" points"+(champ?" - CHAMPIONSHIP TITLE!":"."));
      if(champ){ s.rep=clamp(s.rep+sr.repWin*2,-100,100); s.fans=(s.fans||0)+sr.fanWin*3; s.money+=sr.prize*0.6;
        s.awards.push({year:s.year,name:sr.name+" Champion",model:m.name}); }
      rt.points=0; rt.wins=0; rt.podiums=0;
    }
    return finish;
  },

  // ─────────── Macro events (historical dynamics) ───────────
  tickMacro(s){
    if(!s.macroDone.oil1973 && this.absMonthSafe(s)===(1973-1950)*12+9){
      s.macroDone.oil1973=true; s.oilCrisis=this.absMonthSafe(s)+18;
      this.pushNewsLite(s,"🛢️ OIL CRISIS erupts! Fuel prices quadruple - big engines fall out of favour worldwide.");
    }
    if(!s.macroDone.oil1979 && this.absMonthSafe(s)===(1979-1950)*12+6){
      s.macroDone.oil1979=true; s.oilCrisis=this.absMonthSafe(s)+14;
      this.pushNewsLite(s,"🛢️ Second oil shock as revolutions rock oil fields. Frugality is fashionable again.");
    }
    if(s.month===0){
      for(const e of MACRO_EVENTS){
        if(!s.macroDone[e.id] && s.year>=e.minYear){ e.apply(s); s.macroDone[e.id]=true; this.pushNewsLite(s,e.txt); }
      }
    }
    if(!s.oilSurvived && s.oilCrisis>0 && this.absMonthSafe(s)>s.oilCrisis && s.money>0 && !s.usedLoanDuringCrisis){
      s.oilSurvived=true;
      this.pushNewsLite(s,"🎖️ "+s.company+" rode out the fuel crisis without touching bank credit. Admirable.");
    }
    if(s.loan>0 && s.oilCrisis>this.absMonthSafe(s)) s.usedLoanDuringCrisis=true;
  },

  // ─────────── Racing calendar: races every other month during season ───────────
  tickRacing(s){
    if(!s.raceTeam) return;
    // race months: Apr(3), Jun(5), Aug(7), Oct(9) — 4-race season rhythm
    if([3,5,7,9].includes(s.month)) this.simRace(s);
  },

  // ─────────── Monthly profit statement ───────────
  statement(s, rev, costs){
    s.lastStatement = { month:this.absMonthSafe(s), revenue:rev, costs, net:rev-costs };
    s.monthlyProfitLog.push(s.lastStatement);
    if(s.monthlyProfitLog.length>120) s.monthlyProfitLog.shift();
  },

  // ─────────── Leaderboard rank refresh ───────────
  updateLeaderRank(s){
    const val = companyValue(s);
    let rank=1;
    for(const c of s.competitors) if(c.value>val) rank++;
    s.leaderRank = rank;
  },

  // helpers bridging Engine conveniences
  absMonthSafe(s){ return (s.year-1950)*12+s.month; },
  inflationNow(s){ return 1+(this.absMonthSafe(s)/12)*0.045; },
  pushNewsLite(s,txt){ s.news.unshift({date:MONTHS[s.month]+" "+s.year, txt}); if(s.news.length>60)s.news.pop(); },
};
