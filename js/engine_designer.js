/* ═══════════ DEEP ENGINE DESIGNER — volumetric physics, tuning sliders, hybrid blends ═══════════
   Replaces the coarse multiplier-based engine maths in Engine.evalSpec with a proper
   internal-combustion model: bore × stroke × cylinders ⇒ displacement, mean piston speed
   ⇒ RPM ceiling, volumetric efficiency & breathing losses ⇒ torque curve, forced induction
   boost ⇒ power. Hybrid/EV blending handled with battery-motor coupling.                */

const Designer = {

  // ── geometry helpers ──
  cylCount(layout){ const L = ENGINE_LAYOUTS.find(x=>x.id===layout); return L?L.cyls:4; },
  bankCount(layout){ const L = ENGINE_LAYOUTS.find(x=>x.id===layout)||ENGINE_LAYOUTS[2];
    switch(L.form){ case "inline": return 1; case "vee": return 2; case "flat": return 2; case "w": return 4; default: return 1; } },
  displacementCC(bore, stroke, cyls){ return Math.PI/4 * bore*bore * stroke * cyls / 1000; }, // mm → cc
  // derive stroke from target displacement + chosen bore (CCT-style coupled sliders)
  strokeForDisp(targetCC, bore, cyls){
    const area = Math.PI/4 * bore*bore;               // mm²
    let stroke = (targetCC*1000) / (area*cyls);       // mm
    return clamp(Math.round(stroke), ENGINE_TUNING.strokeMin, ENGINE_TUNING.strokeMax);
  },
  boreFromSquare(targetCC, cyls){ // bore == stroke "square" engine
    const perCyl = targetCC/cyls;                     // cm³... convert: cc in mm³ = perCyl*1000
    const v = perCyl*1000;                            // mm³ per cylinder
    // v = π/4 b² s with s=b ⇒ b = (4v/π)^(1/3)
    return clamp(Math.round(Math.cbrt(4*v/Math.PI)), ENGINE_TUNING.boreMin, ENGINE_TUNING.boreMax);
  },

  // ── deep-part resolution helpers (all backward-compatible with old saves) ──
  deepParts(s, spec){
    const E = spec.engine;
    const cyls = this.cylCount(E.layout);
    const tune = spec.tune || this.autoTune(s, spec);
    const pick = (arr, id, fallbackIdFn)=>{
      let p = id? arr.find(x=>x.id===id) : null;
      if(!p) p = arr.find(x=>x.id===fallbackIdFn()) || arr[0];
      return p;
    };
    // block: prefer new per-cyl library, fall back to legacy material ids
    let block = pick(ENGINE_BLOCKS, E.deepBlock, ()=> "bkI"+cyls);
    if(E.deepBlock==null && E.block){ const legacy = BLOCK_MATERIALS.find(b=>b.id===E.block);
      if(legacy){ const map={iron:"bkI",steel:"bkS",alublk:"bkA",compblk:"bkC"};
        block = ENGINE_BLOCKS.find(x=>x.id===(map[legacy.id]||"bkI")+cyls) || block; } }
    let head   = pick(CYL_HEADS,   E.deepHead,   ()=> "hdI"+cyls);
    let piston = pick(PISTON_SETS, E.deepPiston, ()=> "ptF"+cyls);
    let rodSet = pick(CONROD_SETS, E.deepRod,    ()=> "crC"+cyls);
    let crank  = pick(CRANKSHAFTS, E.deepCrank,  ()=> "cs"+cyls);
    let cam    = pick(CAM_PROFILES, E.deepCam,   ()=> "cmS"+cyls);
    const turbo  = partById(TURBO_SIZING, E.deepTurbo)  || TURBO_SIZING[0];
    const wg     = partById(WASTEGATES,   E.deepWg)     || WASTEGATES[0];
    const ic     = partById(INTERCOOLERS, E.deepIc)     || INTERCOOLERS[0];
    const mix    = partById(MIXTURE_TUNE, E.deepMix)    || MIXTURE_TUNE[3];
    const gov    = partById(REV_GOVERNORS,E.deepGov)    || null;
    const coolP  = partById(COOLING_PARTS,E.deepCool)   || COOLING_PARTS[0];
    const exhP   = partById(EXHAUST_ROUTING,E.deepExh)  || EXHAUST_ROUTING[1];
    const catP   = partById(CAT_PATHS, E.deepCat)       || null;
    return { cyls, tune, block, head, piston, rodSet, crank, cam, turbo, wg, ic, mix, gov, coolP, exhP, catP };
  },
  // is a deep part currently purchasable/legal for this company & year?
  partLegal(s, p){
    if(!p) return true;
    if(p.year && s.year < p.year) return false;
    if(p.tech && !s.techs[p.tech]) return false;
    return true;
  },
  // effective rev ceiling including every rotating-assembly part
  deepRevCeiling(s, spec, P){
    let cap = ENGINE_TUNING.revBase
      + (P.crank.revLimit||0)/2.2 + (P.rodSet.revLimit||0)/2.4
      + (P.piston.revLimit||0)/3 + (P.head.revLimit||0)/3 + (P.cam.revLimit||0)/2.6
      + (P.coolP.revLimit||0)/2 + (P.gov? (P.gov.rpm-6000)/2 : 0);
    return Math.round(clamp(cap, 3200, 12000));
  },

  // ── compression ratio ladder (unlocked by fuel & tech) ──
  maxCompression(s, spec){
    const P = this.deepParts(s, spec);
    let cr = 6.5;                                     // 1950s cast-iron baseline
    if(s.techs.fuelinj) cr += 1.5;
    if(s.techs.dohc)    cr += 1.5;
    if(s.techs.vvt)     cr += 1.0;
    const vt = VALVETRAINS.find(v=>v.id===(spec.engine.valvetrain||"ohv"))||VALVETRAINS[1];
    cr += ({ sv:0, ohv:.3, sohc:.7, dohc:1.1, vvtv:1.5 })[vt.id]||0;
    cr += P.block.compCap||0;                         // aluminium / ceramic blocks tolerate more
    cr += (P.head.compAdd||0) + (P.piston.compAdd||0);// dome pistons & flowy heads raise it
    if(P.catP && P.catP.powerM<1) cr += .2;           // tuned for higher efficiency ratios
    if(spec.engine.fuel==="diesel") cr = Math.max(cr, 16) + (s.techs.diesel?2:0); // diesels run 16-22:1
    if(spec.engine.asp==="turbo"||spec.engine.asp==="bturbo") cr -= 2.5 - (P.ic.tempRisk<0?0.5:0);
    return clamp(cr, 6, 23);
  },

  // ── RPM ceiling from reciprocating mass & mean piston speed ──
  rpmCeiling(s, spec){
    const P = this.deepParts(s, spec);
    const stroke = P.tune.stroke;
    const rod = ROD_MATERIALS.find(r=>r.id===(spec.engine.rod||"cast"))||ROD_MATERIALS[0];
    // mean piston speed budget: m/s ≈ 18 stock, better materials raise it
    let mpsBudget = 17 + rod.revLimit/400 + (P.crank.revLimit||0)/650 + (P.rodSet.revLimit||0)/700
                  + (P.piston.revLimit||0)/900;
    if(P.block.id.startsWith("bkC")) mpsBudget += 2;
    if(P.block.id.startsWith("bkA")) mpsBudget += 1;
    if(P.head.revLimit>=700) mpsBudget += 1.2;
    if(spec.engine.valvetrain==="dohc"||spec.engine.valvetrain==="vvtv") mpsBudget += 2.5;
    if(spec.engine.valvetrain==="sohc") mpsBudget += 1.2;
    if(P.cam.revLimit>=1500) mpsBudget += 1.5; else if(P.cam.revLimit>=400) mpsBudget += .8;
    if(P.coolP.tempRisk<0) mpsBudget += Math.min(3,-P.coolP.tempRisk/5);
    if(spec.engine.cooling==="oilcool") mpsBudget += 1;
    if(spec.engine.cooling==="duocool") mpsBudget += 2;
    const revAdd = ENGINE_TUNING.revMaxAdd.rod[rod.id] + ENGINE_TUNING.revMaxAdd.crank[crankFallbackId(spec)];
    // rpm where mean piston speed hits budget: rpm = mps*60000/(2*stroke)
    const rpmFromSpeed = mpsBudget*60000/(2*stroke);
    const deepCap = this.deepRevCeiling(s, spec, P);
    const cap = Math.min(deepCap + revAdd*0.5, rpmFromSpeed);
    return Math.round(clamp(cap, 3500, 11000));
  },

  // ── breathing / volumetric efficiency ──
  volEfficiency(s, spec, rpm){
    const vt = VALVETRAINS.find(v=>v.id===(spec.engine.valvetrain||"ohv"))||VALVETRAINS[1];
    const P = this.deepParts(s, spec);
    const cyls = P.cyls;
    const disp = P.tune.dispCC;
    const perCyl = disp/cyls;                          // cc per cylinder
    const bore = P.tune.bore;
    // base VE curve: peak near mid-range, falls off at extremes
    const rpmCeil = this.rpmCeiling(s, spec);
    let peakRpm = rpmCeil*0.62 * (1+(P.cam.rpmPeakShift||0));   // cam grind moves the power band
    peakRpm = Math.max(rpmCeil*0.35, peakRpm);
    const t = (rpm-peakRpm)/peakRpm;                   // -1..+
    let ve = 0.86 - 0.55*t*t;                          // parabola
    // valvetrain lifts the curve
    ve += ({ sv:-0.06, ohv:0, sohc:0.03, dohc:0.06, vvtv:0.09 })[vt.id] || 0;
    // deep parts: head flow, cam grind, exhaust back-pressure
    ve += (P.head.flowM-1)*0.55 + (P.cam.veAdd||0);
    ve -= P.exhP.backPressure*0.22;                    // restrictive pipes choke breathing
    if(P.catP) ve -= P.catP.ecoPen>1.05?0.02:0.008;    // cats add a little restriction
    // forced induction sizing actually fitted
    const boosted = spec.engine.asp==="turbo"||spec.engine.asp==="bturbo";
    if(boosted && s.techs.turbo){
      const fit = P.turbo.minDisp<=disp && P.turbo.maxDisp>=disp;
      ve += fit ? 0.14 + P.turbo.boostBar*0.1 : 0.05;  // badly-sized turbo barely helps
    } else if(spec.engine.asp==="sc"){ ve += 0.1; }
    if(spec.engine.fuelSys==="mpfi") ve += 0.03;
    if(spec.engine.fuelSys==="gdi") ve += 0.05;
    return clamp(ve, 0.35, 1.35);
  },

  // ── core thermodynamic power model ──
  computeEngine(s, spec){
    const tune = spec.tune || this.autoTune(s, spec);
    const P = this.deepParts(s, spec);
    const cyls = P.cyls;
    const disp = tune.dispCC;
    const A = ASPIRATION.find(x=>x.id===spec.engine.asp)||ASPIRATION[0];
    const FS= FUEL_SYS.find(x=>x.id===spec.engine.fuelSys)||FUEL_SYS[0];
    const F = ENGINE_FUELS.find(x=>x.id===spec.engine.fuel)||ENGINE_FUELS[0];
    const RICH = FUEL_RICHNESS.find(r=>r.id===(spec.engine.richness||"ideal"))||FUEL_RICHNESS[1];
    const cr = this.maxCompression(s, spec);
    let rpmRedline = Math.min(spec.engine.revLimit||9000, this.rpmCeiling(s,spec));
    if(P.gov) rpmRedline = Math.min(rpmRedline, P.gov.rpm);   // fitted governor clamps the ceiling
    let rpmPeak = rpmRedline*0.78 * (1+(P.cam.rpmPeakShift||0)+(P.crank.rpmPeakShift||0));
    rpmPeak = clamp(rpmPeak, rpmRedline*0.42, rpmRedline*0.95);

    // brake mean effective pressure (bar): naturally aspirated petrol ~9-11 modern
    let bmep = 6.2 + cr*0.22;                                   // 6.5→7.6 ... 13→9.1
    if(F.id==="diesel") bmep += 1.6;
    const boosted = A.id==="turbo"||A.id==="bturbo";
    const turboFit = P.turbo.minDisp<=disp && P.turbo.maxDisp>=disp;
    if(boosted && s.techs.turbo){
      // boost pressure from the ACTUAL turbo fitted (falls back to legacy aspiration table)
      let bar = turboFit? P.turbo.boostBar : (P.turbo.id==="tnone"? (A.id==="turbo"?.7:1.0) : .35);
      bar += P.wg.boostAdj||0;
      if(!s.techs.intercooler && P.ic.id!=="icnone") bar -= .1;   // no IC tech, mild charge cooling lost
      bmep += bar*4.6*Math.min(1.0, 0.55+disp/4000);
      if(A.id==="bturbo") bmep += bar*1.1;                        // twin setup adds a second snail's worth
    }
    if(A.id==="sc") bmep += 3.4;
    bmep *= RICH.powerM * P.mix.powerM;                           // legacy richness + fine mixture tune
    bmep *= FS.powerM>=1?Math.min(1.12,FS.powerM):FS.powerM;       // injection helps filling more than raw mult
    bmep *= (0.9 + 0.1*Math.min(1.4, this.volEfficiency(s,spec,rpmPeak)/0.86 ));
    bmep *= P.exhP.powerM * (P.catP?P.catP.powerM:1);              // exhaust routing & catalyst restriction
    bmep *= P.cam.powerM||1;
    if(boosted && turboFit) bmep *= 1 + (P.ic.powerM-1)*0.9;       // intercooling density gain
    if(P.crank.torqueM) { /* torque shape handled below via peak shift */ }

    // power (kW) = bmep(bar)*disp(L)*rpm/1200 ; classic 4-stroke formula
    const kw = bmep * (disp/1000) * rpmPeak / 1200;
    let hp = kw * 1.341;

    // reliability model — every stressor in the parts bin counts
    let relMod = 0;
    const ceil = this.rpmCeiling(s,spec);
    if(spec.engine.revLimit && spec.engine.revLimit < ceil-200) relMod += 2;   // under-revved = safe
    if(spec.engine.revLimit > ceil) relMod -= 6;                                 // beyond parts limits
    if(cr>11.5 && F.id!=="diesel" && A.id==="na") relMod -= 3;                   // high-CR NA knock risk
    if(boosted && !turboFit) relMod -= 5;                                        // mismatched turbo = over-boost risk
    if((A.id==="bturbo") && (spec.engine.cooling==="thermo") && P.coolP.tempRisk>=0) relMod -= 5; // twin turbo needs cooling
    relMod += (F.relM||0)+(A.relM||0)+(FS.relM||0);
    const vt = VALVETRAINS.find(v=>v.id===(spec.engine.valvetrain||"ohv"))||VALVETRAINS[1];
    relMod += vt.relM||0;
    relMod += P.block.relM||0; relMod += P.head.relM||0; relMod += P.piston.relM||0;
    relMod += P.rodSet.relM||0; relMod += P.crank.relM||0; relMod += P.cam.relM||0;
    relMod += P.coolP.relM||0; relMod += P.wg.relM||0; relMod += (P.ic.relM||0);
    relMod += P.mix.relM||0; relMod += (P.gov?P.gov.relM:0);
    if(P.catP && P.catP.legality>=3) relMod += 1;                 // emission-monitored engines are safer
    // lean mixtures + hot running + high specific load → detonation damage
    const heatStress = P.mix.tempRisk + P.coolP.tempRisk - (P.ic.tempRisk||0)*(boosted?1:0.2);
    if(heatStress>8) relMod -= Math.round(heatStress*0.7);
    if(bmep>19 && F.id!=="diesel") relMod -= Math.round((bmep-19)*1.4);          // detuning big boost hurts
    if(disp/cyls>950 && boosted) relMod -= 3;                     // huge boosted cylinders

    // fuel consumption: BSFC g/kWh map
    let bsfc = 285;                                 // carbureted petrol baseline
    if(FS.id==="mpfi") bsfc -= 25;
    if(FS.id==="gdi")  bsfc -= 40;
    if(F.id==="diesel") bsfc -= 55;
    if(boosted) bsfc += turboFit? (P.turbo.boostBar>1? 12:-8) : 20;
    if(A.id==="sc") bsfc += 25;
    bsfc *= RICH.ecoM * P.mix.ecoM;
    bsfc *= P.exhP.ecoM||1;
    bsfc *= (P.catP?P.catP.ecoPen:1);
    bsfc *= P.head.flowM>1.1?0.97:1;
    if(s.techs.catconv && spec.emissions!=="raw") bsfc += 8;

    // mass of the engine — built bottom-up from actual components
    let mass = 55 + disp*0.55 + cyls*4.5;          // kg-ish
    mass += (P.block.massP||0) + (P.head.massP||0) + (P.piston.massP||0) + (P.rodSet.massP||0) + (P.crank.massP||0);
    mass += ({ na:0, turbo:18, bturbo:34, sc:22 })[A.id]||0;
    if(boosted && turboFit) mass += 6 + P.turbo.boostBar*14;
    mass += P.ic.massP||0; mass += P.coolP.massP||0; mass += P.exhP.massP||0;
    mass += (FS.cost||0)/40;
    mass += tune.bore>tune.stroke*1.15 ? 4 : 0;
    if(spec.engine.cooling==="oilcool") mass += 5;
    if(spec.engine.cooling==="duocool") mass += 14;

    // cost — summed from every real part chosen
    let cost = 260 + disp*0.30 + cyls*55;
    cost += P.block.cost||0; cost += P.head.cost||0; cost += P.piston.cost||0;
    cost += P.rodSet.cost||0; cost += P.crank.cost||0; cost += P.cam.cost||0;
    cost += P.coolP.cost||0; cost += P.exhP.cost||0;
    if(boosted){ cost += turboFit? P.turbo.cost||0 : 500; cost += P.wg.cost||0; cost += P.ic.cost||0; }
    else if(A.id==="sc"){ cost += 1300; }
    cost += P.catP? P.catP.cost||0 : 0;
    cost += (P.gov?P.gov.cost||0:0);
    cost += FS.cost||0; cost += F.cost||0; cost += vt.cost||0;
    // legacy coarse adders removed — deep parts replace them

    // torque figure for display & performance feel
    let torqueK = 1.25;
    if(P.crank.torqueM) torqueK *= P.crank.torqueM;
    if(P.cam.torqueM) torqueK *= P.cam.torqueM;
    const torque = Math.round(bmep * (disp/1000) * 100 / torqueK);   // Nm ≈ bmep_bar*L*1000/(2π), tuned constant

    // noise level feeds comfort/safety ratings later
    let noise = 40 + disp*0.004 + cyls*1.5 + (P.exhP.noise||0) + ((A.id!=="na")?6:0)
              + (P.crank.noise||0) + (P.wg.noise||0) + (vt.id==="sv"?-3:0);

    // emissions legality tier of this engine (used by regulatory checks)
    const cleanTier = F.id==="hybridf"?3 : (P.catP? P.catP.legality : 0);

    // hybrid blend
    let hybridHp = 0, hybridCost = 0, hybridMass = 0, ecoBonus = 1;
    if(F.id==="hybridf" || s.techs.hybridfull && spec.engine.hybridAssist){
      const batt = EV_BATTERIES.find(b=>b.id===(spec.engine.batt)) || null;
      const assistKw = batt? Math.min(120, (batt.range||60)*0.9) : 40;
      hybridHp = assistKw*1.341*0.5;
      hybridCost = 1800 + (batt?batt.cost*0.45:1200);
      hybridMass = 45 + (batt?batt.mass*0.4:60);
      ecoBonus = 0.72;                              // regen + engine shut-off savings
      relMod -= 3;
      hp += hybridHp;
    }
    if(spec.engine.asp==="na" && s.techs.hydrogen && spec.engine.fuel==="hydrogen"){ /* reserved */ }

    return { hp:Math.round(hp), torque, rpmRedline, bmep:bmep.toFixed(1), cr:+cr.toFixed(1),
             bsfc:Math.round(bsfc), mass:Math.round(mass), cost:Math.round(cost), relMod:Math.round(relMod),
             noise:Math.round(noise), ve:this.volEfficiency(s,spec,rpmPeak).toFixed(2), cleanTier,
             rpmPeak:Math.round(rpmPeak), heatStress:Math.round(heatStress),
             eco:(bsfc/285)*ecoBonus*(F.id==="diesel"?0.82:1)*(boosted&&turboFit?0.94:A.id==="sc"?1.1:1),
             hybridHp:Math.round(hybridHp) };
  },

  // auto-tune defaults when a spec predates sliders (old saves!) — keeps backward compat
  autoTune(s, spec){
    const D = DISPLACEMENTS.find(x=>x.id===spec.engine.disp)||DISPLACEMENTS[10];
    const cyls = this.cylCount(spec.engine.layout);
    const bore = this.boreFromSquare(D.cc, cyls);
    const stroke = this.strokeForDisp(D.cc, bore, cyls);
    return { bore, stroke, dispCC:D.cc, cyls };
  },
  // recompute tune object when user moves sliders
  setDisplacement(s, spec, cc){
    spec.engine.disp = "cc"+cc;
    spec.tune = spec.tune || { bore:83, stroke:86, dispCC:cc, cyls:4 };
    spec.tune.cyls = this.cylCount(spec.engine.layout);
    spec.tune.stroke = this.strokeForDisp(cc, spec.tune.bore, spec.tune.cyls);
    spec.tune.dispCC = this.displacementCC(spec.tune.bore, spec.tune.stroke, spec.tune.cyls);
    return spec.tune;
  },
  setBore(s, spec, bore){
    spec.tune = spec.tune || this.autoTune(s,spec);
    spec.tune.bore = bore;
    spec.tune.dispCC = Math.round(this.displacementCC(bore, spec.tune.stroke, spec.tune.cyls));
    spec.engine.disp = "cc"+(Math.round(spec.tune.dispCC/100)*100);
    return spec.tune;
  },
  setStroke(s, spec, stroke){
    spec.tune = spec.tune || this.autoTune(s,spec);
    spec.tune.stroke = stroke;
    spec.tune.dispCC = Math.round(this.displacementCC(spec.tune.bore, stroke, spec.tune.cyls));
    spec.engine.disp = "cc"+(Math.round(spec.tune.dispCC/100)*100);
    return spec.tune;
  },
  setLayout(s, spec, layoutId){
    spec.engine.layout = layoutId;
    spec.tune = spec.tune || this.autoTune(s,spec);
    spec.tune.cyls = this.cylCount(layoutId);
    // keep displacement roughly, adjust stroke
    spec.tune.stroke = this.strokeForDisp(spec.tune.dispCC, spec.tune.bore, spec.tune.cyls);
    spec.tune.dispCC = Math.round(this.displacementCC(spec.tune.bore, spec.tune.stroke, spec.tune.cyls));
    return spec.tune;
  },

  // ── EV / hybrid powertrain computation ──
  computeEV(s, spec){
    const m = EV_MOTORS.find(x=>x.id===spec.engine.motor);
    const b = EV_BATTERIES.find(x=>x.id===spec.engine.batt)||EV_BATTERIES[0];
    if(!m) return null;
    let hp = m.hp, cost = m.cost + b.cost, mass = 120 + m.mass + b.mass, range = b.range, rel = 78 + (m.relM||0);
    if(b.id==="h2fuel"){ hp += 60; cost += 2500; mass += 40; range += 120; rel -= 6; } // fuel-cell range extender
    if(s.techs.solidbatt && b.id==="solid80"){ rel += 5; }
    if(s.techs.batt_li && ["li40","li75","li100","solid80"].includes(b.id)){ cost -= b.cost*0.15; } // learning curve
    const invertLoss = 0.9;
    const eff = 0.88; // motor+inverter efficiency vs ICE ~0.30
    return { hp:Math.round(hp), torque:Math.round(hp*9.5), rpmRedline:14000, mass:Math.round(mass), cost:Math.round(cost),
             relMod:Math.round(rel-45), range, eco:eff/invertLoss*0.25, noise:12, hybridHp:0, cr:"—", bmep:"—", bsfc:0, ve:"—" };
  },

  // ── chassis dynamics: weight distribution, handling index ──
  layoutWeightDist(spec, evRes){
    const dt = spec.drivetrain;
    const engFront = !spec.engine.motor ? true : false; // motors near axle; simplification: EV balanced
    let front = 0.58;
    if(dt==="fwd") front += 0.05;
    if(dt==="rwd") front -= 0.06;
    if(dt==="awd") front += 0.0;
    if(dt==="4wd") front -= 0.02;
    if(!engFront) front = 0.5;                    // dual-motor EV balanced
    if(evRes && evRes.mass>500) front -= 0.02;    // heavy pack low floor
    return clamp(front, 0.38, 0.72);
  },
  handlingIndex(s, spec, parts){
    // parts = resolved {chassis, susp, tyres, brakes, drivetrain} objects
    let h = 40;
    h += parts.chassis.handling*1.6;
    h += (parts.susp.handling||0)*1.8;
    h += (parts.tyres.grip||0)*1.5;
    h += (parts.brakes.perf||0)*0.8;
    h += (parts.drivetrain.handling||0)*1.2;
    const wd = Math.abs(this.layoutWeightDist(spec) - 0.5);
    h -= wd*90;                                    // balance penalty
    if(s.techs.windtunnel) h += 5;
    if(spec.options.includes("spoiler")) h += 4;
    if(spec.options.includes("semi")) h += 6;
    return clamp(Math.round(h), 1, 100);
  },

  // ── aero drag by body & options ──
  dragCd(body, options){
    const base = { sedan:.34, hatch:.35, coupe:.30, convert:.42, wagon:.38, pickup:.52, suvbody:.44, van:.55, roadster:.33 }[body]||.38;
    let cd = base;
    if(options.includes("roofrack")) cd += .05;
    if(options.includes("spoiler")) cd -= .01;
    if(options.includes("ledl")) cd -= .005;
    return +cd.toFixed(3);
  },
};
