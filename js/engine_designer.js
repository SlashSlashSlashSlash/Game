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

  // ── compression ratio ladder (unlocked by fuel & tech) ──
  maxCompression(s, spec){
    let cr = 6.5;                                     // 1950s cast-iron baseline
    if(s.techs.fuelinj) cr += 1.5;
    if(s.techs.dohc)    cr += 1.5;
    if(s.techs.vvt)     cr += 1.0;
    const blk = BLOCK_MATERIALS.find(b=>b.id===spec.engine.block);
    if(blk && blk.id==="alublk") cr += 0.8;
    if(blk && blk.id==="compblk") cr += 1.4;
    if(spec.engine.fuel==="diesel") cr = Math.max(cr, 16) + (s.techs.diesel?2:0); // diesels run 16-22:1
    if(spec.engine.asp==="turbo"||spec.engine.asp==="bturbo") cr -= 2.5;           // boosted engines lean on CR
    return clamp(cr, 6, 23);
  },

  // ── RPM ceiling from reciprocating mass & mean piston speed ──
  rpmCeiling(s, spec){
    const stroke = spec.tune ? spec.tune.stroke : 86;
    const rod = ROD_MATERIALS.find(r=>r.id===(spec.engine.rod||"cast"))||ROD_MATERIALS[0];
    const crank = CRANK_MATERIALS.find(c=>c.id===(spec.engine.crank||"steelcrank"))||CRANK_MATERIALS[0];
    const block = BLOCK_MATERIALS.find(b=>b.id===(spec.engine.block||"iron"))||BLOCK_MATERIALS[0];
    // mean piston speed budget: m/s ≈ 18 stock, better materials raise it
    let mpsBudget = 17 + rod.revLimit/400 + crank.revLimit/500;
    if(block.id==="compblk") mpsBudget += 2;
    if(spec.engine.valvetrain==="dohc"||spec.engine.valvetrain==="vvtv") mpsBudget += 2.5;
    if(spec.engine.valvetrain==="sohc") mpsBudget += 1.2;
    if(spec.engine.cooling==="oilcool") mpsBudget += 1;
    if(spec.engine.cooling==="duocool") mpsBudget += 2;
    const revAdd = ENGINE_TUNING.revMaxAdd.rod[rod.id] + ENGINE_TUNING.revMaxAdd.crank[crank.id];
    // rpm where mean piston speed hits budget: rpm = mps*60000/(2*stroke)
    const rpmFromSpeed = mpsBudget*60000/(2*stroke);
    const cap = Math.min(ENGINE_TUNING.revBase + revAdd + (spec.engine.valvetrain==="sv"? -900:0), rpmFromSpeed);
    return Math.round(clamp(cap, 3500, 11000));
  },

  // ── breathing / volumetric efficiency ──
  volEfficiency(s, spec, rpm){
    const vt = VALVETRAINS.find(v=>v.id===(spec.engine.valvetrain||"ohv"))||VALVETRAINS[1];
    const exh = EXHAUST_SYS.find(e=>e.id===(spec.engine.exhaust||"restricted"))||EXHAUST_SYS[0];
    const cyls = this.cylCount(spec.engine.layout);
    const disp = spec.tune ? spec.tune.dispCC : 1600;
    const perCyl = disp/cyls;                          // cc per cylinder
    const bore = spec.tune ? spec.tune.bore : 83;
    // base VE curve: peak near mid-range, falls off at extremes
    const rpmCeil = this.rpmCeiling(s, spec);
    const peakRpm = rpmCeil*0.62;
    const t = (rpm-peakRpm)/peakRpm;                   // -1..+
    let ve = 0.86 - 0.55*t*t;                          // parabola
    // valvetrain lifts the curve
    ve += ({ sv:-0.06, ohv:0, sohc:0.03, dohc:0.06, vvtv:0.09 })[vt.id] || 0;
    // exhaust restriction chokes top end
    if(exh.id==="restricted" && rpm>peakRpm) ve -= 0.05*((rpm-peakRpm)/peakRpm);
    if(exh.id==="free")   ve += 0.02;
    if(exh.id==="raceexh")ve += 0.045;
    // big single cylinders breathe worse per cc
    ve -= Math.max(0,(perCyl-700))/700*0.03;
    // small bores at high lift restrict
    ve -= Math.max(0, 74-bore)/74*0.04;
    if(s.techs.turbo && (spec.engine.asp==="turbo"||spec.engine.asp==="bturbo")) ve += 0.18; // forced induction fills cylinders
    if(spec.engine.fuelSys==="mpfi") ve += 0.03;
    if(spec.engine.fuelSys==="gdi") ve += 0.05;
    return clamp(ve, 0.35, 1.35);
  },

  // ── core thermodynamic power model ──
  computeEngine(s, spec){
    const tune = spec.tune || this.autoTune(s, spec);
    const cyls = this.cylCount(spec.engine.layout);
    const disp = tune.dispCC;
    const A = ASPIRATION.find(x=>x.id===spec.engine.asp)||ASPIRATION[0];
    const FS= FUEL_SYS.find(x=>x.id===spec.engine.fuelSys)||FUEL_SYS[0];
    const F = ENGINE_FUELS.find(x=>x.id===spec.engine.fuel)||ENGINE_FUELS[0];
    const RICH = FUEL_RICHNESS.find(r=>r.id===(spec.engine.richness||"ideal"))||FUEL_RICHNESS[1];
    const cr = this.maxCompression(s, spec);
    const rpmRedline = Math.min(spec.engine.revLimit||9000, this.rpmCeiling(s,spec));
    const rpmPeak = rpmRedline*0.78;

    // brake mean effective pressure (bar): naturally aspirated petrol ~9-11 modern
    let bmep = 6.2 + cr*0.22;                                   // 6.5→7.6 ... 13→9.1
    if(F.id==="diesel") bmep += 1.6;
    if(A.id==="turbo")  bmep += 4.2*Math.min(1.0, 0.55+disp/4000); // boost scaled to size
    if(A.id==="bturbo") bmep += 6.0*Math.min(1.0, 0.55+disp/4000);
    if(A.id==="sc")     bmep += 3.4;
    bmep *= RICH.powerM;
    bmep *= FS.powerM>=1?Math.min(1.12,FS.powerM):FS.powerM;      // injection helps filling more than raw mult
    bmep *= (0.9 + 0.1*Math.min(1.4, this.volEfficiency(s,spec,rpmPeak)/0.86 ));

    // power (kW) = bmep(bar)*disp(L)*rpm/1200 ; classic 4-stroke formula
    const kw = bmep * (disp/1000) * rpmPeak / 1200;
    let hp = kw * 1.341;

    // reliability penalties from over-stressing
    let relMod = 0;
    if(spec.engine.revLimit && spec.engine.revLimit < this.rpmCeiling(s,spec)-200) relMod += 2;   // under-revved = safe
    if(spec.engine.revLimit > this.rpmCeiling(s,spec)) relMod -= 6;                                // beyond parts limits
    if(cr>11.5 && F.id!=="diesel" && A.id==="na") relMod -= 3;                                    // high-CR NA knock risk
    if((A.id==="bturbo") && (spec.engine.cooling==="thermo")) relMod -= 5;                        // twin turbo needs cooling
    relMod += (F.relM||0)+(A.relM||0)+(FS.relM||0);
    const vt = VALVETRAINS.find(v=>v.id===(spec.engine.valvetrain||"ohv"))||VALVETRAINS[1];
    relMod += vt.relM||0;
    const blk = BLOCK_MATERIALS.find(b=>b.id===(spec.engine.block||"iron"))||BLOCK_MATERIALS[0];
    relMod += blk.relM||0;
    const rod = ROD_MATERIALS.find(r=>r.id===(spec.engine.rod||"cast"))||ROD_MATERIALS[0];
    relMod += rod.relM||0;

    // fuel consumption: BSFC g/kWh map
    let bsfc = 285;                                 // carbureted petrol baseline
    if(FS.id==="mpfi") bsfc -= 25;
    if(FS.id==="gdi")  bsfc -= 40;
    if(F.id==="diesel") bsfc -= 55;
    if(A.id==="turbo") bsfc -= 15; if(A.id==="bturbo") bsfc += 5; if(A.id==="sc") bsfc += 25;
    bsfc *= RICH.ecoM;
    const exh = EXHAUST_SYS.find(e=>e.id===(spec.engine.exhaust||"restricted"))||EXHAUST_SYS[0];
    bsfc *= exh.ecoM||1;
    if(s.techs.catconv && spec.emissions!=="raw") bsfc += 8;

    // mass of the engine
    let mass = 55 + disp*0.55 + cyls*4.5;          // kg-ish
    mass *= ({ iron:1.12, steel:1.0, alublk:0.82, compblk:0.68 })[blk.id]||1;
    mass += ({ na:0, turbo:18, bturbo:34, sc:22 })[A.id]||0;
    mass += (FS.cost||0)/40;
    mass += tune.bore>tune.stroke*1.15 ? 4 : 0;
    if(rod.id==="titan") mass -= 8;
    if(spec.engine.cooling==="oilcool") mass += 5;
    if(spec.engine.cooling==="duocool") mass += 14;
    if(exh.id==="raceexh") mass -= 9;

    // cost
    let cost = 260 + disp*0.30 + cyls*55;
    cost += ({ na:0, turbo:950, bturbo:2100, sc:1300 })[A.id]||0;
    cost += FS.cost||0; cost += F.cost||0; cost += vt.cost||0; cost += blk.cost||0;
    cost += rod.cost||0; cost += (CRANK_MATERIALS.find(c=>c.id===spec.engine.crank)||{cost:0}).cost||0;
    cost += (COOLING_SYS.find(c=>c.id===spec.engine.cooling)||{cost:0}).cost||0;
    cost += exh.cost||0;

    // torque figure for display & performance feel
    const torqueNm = bmep*1.25*(disp/1000)*100/ (4*Math.PI) * 1000/1000; // simplified BMEP→torque
    const torque = Math.round(bmep * (disp/1000) * 100 / 1.256);         // Nm ≈ bmep_bar*L*1000/(2π)*... tuned constant

    // noise level feeds comfort/safety ratings later
    let noise = 40 + disp*0.004 + cyls*1.5 + (exh.noise||0) + ((A.id!=="na")?6:0);

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
             noise:Math.round(noise), ve:this.volEfficiency(s,spec,rpmPeak).toFixed(2),
             eco:(bsfc/285)*(1/(hp>0?(hp/hp):1))*ecoBonus*(F.id==="diesel"?0.82:1)*(A.id==="turbo"?0.94:A.id==="sc"?1.1:1),
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
