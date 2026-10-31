/* ═══════════ VIRTUAL DYNAMOMETER — real rpm-sweep stress testing of designed engines ═══════════
   The dyno does NOT fake anything: it re-runs the Designer's volumetric efficiency, friction and
   thermal models at 100 rpm increments across the rev range, integrating brake power, torque,
   BSFC and heat balance exactly as a rolling-road/engine test cell would measure them.
   Structural failure modes (detonation, rod load, mean-piston-speed over-rev, thermal runaway)
   are evaluated continuously during the pull; if any threshold is crossed the run terminates
   with a blown-engine result and the cost consequences are applied to the game state.        */

const Dyno = {

  // ─────────── physics helpers shared by sweep & charts ───────────

  // Volumetric efficiency at an arbitrary rpm (extends Designer.volEfficiency which only
  // computes the peak point). Uses cam grind, head flow, exhaust restriction, valvetrain,
  // injection & forced-induction fit — same part objects the designer resolves.
  veAtRpm(s, spec, P, rpm){
    const disp = P.tune.dispCC, cyls = P.cyls;
    const ceil = Designer.rpmCeiling(s, spec);
    const vt = VALVETRAINS.find(v=>v.id===(spec.engine.valvetrain||"ohv"))||VALVETRAINS[1];
    let peakRpm = ceil*0.62 * (1+(P.cam.rpmPeakShift||0));
    peakRpm = Math.max(ceil*0.35, peakRpm);
    const t = (rpm-peakRpm)/peakRpm;
    // asymmetric curve: below peak falls slower than above (classic torque-dip shape)
    let ve = 0.86 - (t<0 ? 0.42 : 0.55)*t*t;
    ve += ({ sv:-0.06, ohv:0, sohc:0.03, dohc:0.06, vvtv:0.09 })[vt.id] || 0;
    ve += (P.head.flowM-1)*0.55 + (P.cam.veAdd||0);
    ve -= P.exhP.backPressure*0.22;
    if(P.catP) ve -= P.catP.ecoPen>1.05?0.02:0.008;
    // turbo spool behaviour: boost ramps in over the lag band, small turbos spool early
    const boosted = spec.engine.asp==="turbo"||spec.engine.asp==="bturbo";
    if(boosted && s.techs.turbo){
      const fit = P.turbo.minDisp<=disp && P.turbo.maxDisp>=disp;
      const spoolRpm = 1200 + P.turbo.lagK*ceil*0.75;
      if(rpm < spoolRpm){
        const ramp = clamp((rpm-1100)/(spoolRpm-1100), 0, 1);
        ve += (fit ? 0.14 + P.turbo.boostBar*0.1 : 0.05) * ramp * ramp;   // quadratic spool-in
      } else {
        ve += fit ? 0.14 + P.turbo.boostBar*0.1 : 0.05;
      }
    } else if(spec.engine.asp==="sc"){
      // superchargers make boost proportional to rpm directly (belt-driven)
      ve += 0.10 * clamp(rpm/ (ceil*0.8), 0.25, 1.15);
    }
    if(spec.engine.fuelSys==="mpfi") ve += 0.03;
    if(spec.engine.fuelSys==="gdi")  ve += 0.05;
    // VVT broadens the plateau when available and fitted
    if(vt.id==="vvtv" && Math.abs(t)<0.45) ve += 0.02;
    return clamp(ve, 0.30, 1.35);
  },

  // Indicated mean effective pressure at a given rpm for this exact engine build
  imepAtRpm(s, spec, P, rpm, cr, F){
    const disp = P.tune.dispCC;
    const A = ASPIRATION.find(x=>x.id===spec.engine.asp)||ASPIRATION[0];
    const RICH = FUEL_RICHNESS.find(r=>r.id===(spec.engine.richness||"ideal"))||FUEL_RICHNESS[1];
    const FS = FUEL_SYS.find(x=>x.id===spec.engine.fuelSys)||FUEL_SYS[0];
    const boosted = A.id==="turbo"||A.id==="bturbo";
    const turboFit = P.turbo.minDisp<=disp && P.turbo.maxDisp>=disp;
    const ve = this.veAtRpm(s, spec, P, rpm);
    // charge density scales VE × ambient-ish factor; base BMEP ladder identical to designer
    let bmep = 6.2 + cr*0.22;
    if(F.id==="diesel") bmep += 1.6;
    if(boosted && s.techs.turbo){
      const spoolRpm = 1200 + P.turbo.lagK*Designer.rpmCeiling(s,spec)*0.75;
      const spoolFrac = clamp((rpm-1100)/Math.max(1,(spoolRpm-1100)), 0, 1);
      let bar = turboFit? P.turbo.boostBar : (P.turbo.id==="tnone"? (A.id==="turbo"?.7:1.0) : .35);
      bar += P.wg.boostAdj||0;
      if(!s.techs.intercooler && P.ic.id!=="icnone") bar -= .1;
      bar *= A.id==="bturbo" ? (0.55+0.45*spoolFrac)*(boosted?1:1) : spoolFrac;  // twin-turbos sequential
      if(A.id==="bturbo") bar = Math.min(bar + (turboFit?P.turbo.boostBar:0.7)*0.35*spoolFrac, bar*1.35);
      bmep += bar*4.6*Math.min(1.0, 0.55+disp/4000);
    }
    if(A.id==="sc") bmep += 3.4 * clamp(rpm/(Designer.rpmCeiling(s,spec)*0.8),0.3,1.15);
    bmep *= RICH.powerM * P.mix.powerM;
    bmep *= FS.powerM>=1?Math.min(1.12,FS.powerM):FS.powerM;
    bmep *= (0.9 + 0.1*Math.min(1.4, ve/0.86));
    bmep *= P.exhP.powerM * (P.catP?P.catP.powerM:1);
    bmep *= P.cam.powerM||1;
    if(boosted && turboFit) bmep *= 1 + (P.ic.powerM-1)*0.9;
    // scavenging dip right at valve-overlap region for big cams
    if((P.cam.revLimit||0)>=1200 && rpm < 1800) bmep *= 0.82;
    return Math.max(0.5, bmep);
  },

  // Friction mean effective pressure — Chen/Ferguson-style split into components
  fmepAtRpm(s, spec, P, rpm){
    const stroke = P.tune.stroke, bore = P.tune.bore, cyls = P.cyls;
    const mpi = rpm*2*stroke/60000;                    // mean piston speed m/s
    // piston-ring sliding friction ∝ speed, bearing shear ∝ speed^~1.4, accessories fixed
    let fm = 0.32 + 0.0042*mpi + 0.00055*Math.pow(mpi,2.1);
    fm += 0.028*cyls;                                  // each extra crank journal pair
    fm += (bore>95?0.25:0) + (stroke>92?0.18:0);       // oversized geometry losses
    if(spec.engine.valvetrain==="dohc"||spec.engine.valvetrain==="vvtv") fm += 0.12; // more cam bearings
    if(spec.engine.valvetrain==="sv") fm -= 0.08;
    if(P.crank.id.startsWith("csl")) fm -= 0.1;        // light crank spins up easier
    if(P.coolP.id==="clOil") fm += 0.05;               // oil pump extras
    if(spec.engine.asp==="sc") fm += 0.55;             // blower parasitic drive
    if(spec.engine.fuel==="diesel") fm += 0.35;        // higher ring loads
    const A = ASPIRATION.find(x=>x.id===spec.engine.asp)||ASPIRATION[0];
    if(A.id==="bturbo") fm += 0.15;
    return Math.max(0.25, fm);
  },

  // Peak cylinder gas pressure estimate — used for structural stress checks
  peakCylPressure(bmepInd, cr, rpm){
    // compression peak ≈ bmep_ind * k * CR-ish; detonation spikes add ~40%
    return bmepInd*(2.9+cr*0.28)*(0.9+rpm/22000);
  },

  // Connecting-rod inertial peak load (kN) from reciprocating mass × acceleration
  rodLoadKN(P, bore, rpm){
    const strokeM = P.tune.stroke/1000;                 // m
    const rad = rpm*2*Math.PI/60;
    const recipMass = (P.piston.massP + P.rodSet.massP*0.4)/P.cyls/1000; // kg per cyl (approx)
    const accel = strokeM/2*rad*rad*(1+strokeM/ (160/1000)); // long rods approx ratio
    return recipMass*accel/1000;
  },

  // ─────────── main dyno pull ───────────
  // Returns { ok:true, points:[{rpm,hp,kw,torque,bmep,ve,fmep,bsfc,l100,egt,heat}], peak:{...}, fail:null }
  // or { ok:false, fail:{type,label,txt,rpm,point} } when the build destroys itself mid-pull.
  runPull(s, spec, opts){
    opts = opts||{};
    const isEV = !!spec.engine.motor;
    if(isEV) return this.runEVPull(s, spec);
    const P = Designer.deepParts(s, spec);
    const cr = Designer.maxCompression(s, spec);
    const F = ENGINE_FUELS.find(x=>x.id===spec.engine.fuel)||ENGINE_FUELS[0];
    const ceil = Designer.rpmCeiling(s, spec);
    let redline = Math.min(spec.engine.revLimit||9000, ceil);
    if(P.gov) redline = Math.min(redline, P.gov.rpm);
    if(opts.overRev) redline = Math.round(redline*1.18);  // "hold the throttle open past the limiter"
    const disp = P.tune.dispCC;
    const pts=[];
    let maxHp=0,maxHpRpm=0,maxTq=0,maxTqRpm=0;
    let cumulativeHeat=0, heatCap=null;
    const coolPower = 1.6 + (P.coolP.tempRisk<0? -P.coolP.tempRisk*0.11:0)
                    + (spec.engine.cooling==="duocool"?0.8:spec.engine.cooling==="oilcool"?0.4:0)
                    + disp/4000*0.5;
    heatCap = coolPower*26;                        // total heat units the loop can absorb before boil-over

    const stepRpm = Math.max(60, Math.round((redline-900)/96));  // ~100 sample points
    for(let rpm=900; rpm<=redline+stepRpm; rpm+=stepRpm){
      const r = Math.min(rpm, redline+Math.round(stepRpm*0.4));
      const bmepI = this.imepAtRpm(s, spec, P, r, cr, F);
      const fmep  = this.fmepAtRpm(s, spec, P, r);
      const bmepB = Math.max(0, bmepI - fmep);                 // brake pressure after friction
      const kw = bmepB*(disp/1000)*(r/1200);
      const hp = kw*1.341;
      const torque = bmepB*(disp/1000)*1000/(2*Math.PI);        // Nm exact from BMEP
      const ve = this.veAtRpm(s, spec, P, r);
      // bsfc map: g/kWh — richer mixtures & knock retard worsen it at high load
      let bsfc = 250 + 90/Math.max(0.35, bmepB/9.5) + Math.pow((r-ceil*0.55)/(ceil*0.5),2)*38;
      bsfc *= P.mix.ecoM * (P.exhP.ecoM||1);
      if(F.id==="diesel") bsfc*=0.8;
      bsfc = clamp(bsfc, 205, 520);
      // EGT rises with load & richness, falls with intercooling & cat extraction
      let egt = 300 + bmepB*22 + P.mix.tempRisk*4.5 - (P.ic.tempRisk||0)*-1.4 + (r-redline*0.5)*0.06;
      egt = clamp(egt, 250, 1050);
      // instantaneous heat input vs cooling removal
      const heatIn = (bmepB/8)*(1+P.mix.tempRisk/40)*(egt/620);
      cumulativeHeat += Math.max(0, heatIn - coolPower*0.62);
      const point = { rpm:r, hp:Math.round(hp*10)/10, kw:+kw.toFixed(1), torque:Math.round(torque),
                      bmep:+bmepB.toFixed(2), imep:+bmepI.toFixed(2), ve:+ve.toFixed(3), fmep:+fmep.toFixed(2),
                      bsfc:Math.round(bsfc), egt:Math.round(egt), heat:Math.round(cumulativeHeat) };
      pts.push(point);
      if(hp>maxHp){ maxHp=hp; maxHpRpm=r; }
      if(torque>maxTq){ maxTq=torque; maxTqRpm=r; }

      // ── continuous failure-mode monitoring (this is what makes the dyno dangerous) ──
      const fail = this.checkFailure(s, spec, P, point, { rpm:r, cr, F, ceil, redline, cumulativeHeat, heatCap, maxHp });
      if(fail){
        return { ok:false, points:pts, peak:{ hp:maxHp, hpRpm:maxHpRpm, tq:maxTq, tqRpm:maxTqRpm },
                 ceiling:ceil, redline, cr, fail, disp, cyls:P.cyls };
      }
    }
    // survived the full pull
    const engRes = Designer.computeEngine(s, spec);
    return { ok:true, points:pts,
      peak:{ hp:Math.round(maxHp), hpRpm:maxHpRpm, tq:Math.round(maxTq), tqRpm:maxTqRpm },
      ceiling:ceil, redline, cr, disp, cyls:P.cyls,
      idleVacuum:+(0.62 - (P.cam.revLimit||0)/9000*0.25).toFixed(2),
      noiseDb:engRes.noise, bsfcPeak:engRes.bsfc, ecoIndex:+engRes.eco.toFixed(2),
      powerPerLitre:+(maxHp/(disp/1000)).toFixed(0), torquePerLitre:+(maxTq/(disp/1000)).toFixed(0),
      flatness:+( (maxTq/ (pts.find(p=>p.rpm>=2000)||pts[0]).torque ).toFixed(2) ),
      areaUnderCurve: Math.round(pts.reduce((a,p)=>a+p.kw,0)*stepRpm/9500),
    };
  },

  checkFailure(s, spec, P, pt, ctx){
    const { rpm, cr, F, ceil, redline, cumulativeHeat, heatCap } = ctx;
    const boosted = spec.engine.asp==="turbo"||spec.engine.asp==="bturbo";
    const disp = P.tune.dispCC, cyls=P.cyls;
    const mpi = rpm*2*P.tune.stroke/60000;

    // 1 · OVER-REV: beyond the parts' physical ceiling → valvetrain surge / rod failure
    if(rpm > ceil){
      return { type:"overrev", label:"Valvetrain Surge / Rod Failure", rpm,
        txt:`Past the ${ceil} rpm structural ceiling — springs can't close valves fast enough and the `+
            `${P.rodSet.name.toLowerCase()} stretch. Contact between pistons and valves shredded the top end.` };
    }
    // 2 · MEAN PISTON SPEED EXCEEDED (>26 m/s generally kills production assemblies)
    const mpsLimit = 21 + (P.crank.revLimit||0)/900 + (P.rodSet.revLimit||0)/800 + (P.piston.revLimit||0)/900;
    if(mpi > mpsLimit){
      return { type:"pistonspeed", label:"Piston Speed Catastrophe", rpm,
        txt:`Mean piston speed hit ${mpi.toFixed(1)} m/s — wrist pins walked out of the ${P.piston.name.toLowerCase()} `+
            `and the engine committed suicide at ${rpm} rpm.` };
    }
    // 3 · DETONATION under high CR + lean mixture + heat soak
    const heatStress = P.mix.tempRisk + P.coolP.tempRisk - (P.ic.tempRisk||0)*(boosted?1:0.2);
    if(F.id!=="diesel" && cr >= 11 && P.mix.lambda >= 1.04 && cumulativeHeat > (heatCap||30)*0.55 && pt.bmep > 12){
      return { type:"detonation", label:"Detonation Chain Reaction", rpm,
        txt:`Lean ${P.mix.name.toLowerCase()} mixture on a ${cr.toFixed(1)}:1 compression engine soaked in heat — `+
            `end-gas auto-ignition punched a hole through cylinder #${1+(rpm%P.cyls)}.` };
    }
    // 4 · THERMAL RUNAWAY — coolant capacity exceeded regardless of mixture
    if(cumulativeHeat > (heatCap||30)){
      return { type:"overheat", label:"Coolant Boil-Over", rpm,
        txt:`The ${P.coolP.name.toLowerCase()} could not shed the heat load. Gaskets blew between cylinders `+
            `at ${pt.egt}°C exhaust-gas temperature.` };
    }
    // 5 · ROD LOAD STRUCTURAL LIMIT
    const rodKN = this.rodLoadKN(P, P.tune.bore, rpm);
    const rodCap = 26 + (P.rodSet.revLimit||0)*0.012 + (P.crank.revLimit||0)*0.006; // kN budget
    if(rodKN > rodCap){
      return { type:"rodload", label:"Connecting Rod Failure", rpm,
        txt:`Inertial rod load spiked to ${rodKN.toFixed(1)} kN — the ${P.rodSet.name.toLowerCase()} snapped and `+
            `the engine went 'bang-for-buck' by exiting through its own block.` };
    }
    // 6 · MISMATCHED TURBO OVERBOOST at high rpm
    if(boosted && !(P.turbo.minDisp<=disp && P.turbo.maxDisp>=disp) && pt.imep > 24){
      return { type:"overboost", label:"Uncontrolled Overboost", rpm,
        txt:`A ${P.turbo.name.toLowerCase()} wildly missized for ${disp|0}cc ran away boost to ${pt.imep.toFixed(1)} bar `+
            `IMEP. The wastegate never caught up in time.` };
    }
    // 7 · HUGE BOOSTED CYLINDERS — classic diesel-like loads in a petrol unit
    if(disp/cyls > 1050 && boosted && pt.imep > 21){
      return { type:"bigcyl", label:"Cylinder Load Exceeded", rpm,
        txt:`${Math.round(disp/cyls)}cc per cylinder on boost produces loads no ${P.block.name.toLowerCase()} survives.` };
    }
    return null;
  },

  // ─────────── EV dyno (inverter-limited torque plateau then hyperbolic falloff) ───────────
  runEVPull(s, spec){
    const m = EV_MOTORS.find(x=>x.id===spec.engine.motor)||EV_MOTORS[0];
    const b = EV_BATTERIES.find(x=>x.id===spec.engine.batt)||EV_BATTERIES[0];
    const baseHp = m.hp * (b.id==="h2fuel"?1.08:1);
    const maxRpm = 14000, baseTq = baseHp*9.5, kneeRpm = maxRpm*0.28;
    const pts=[]; let maxHp=0,maxHpRpm=0,maxTq=0;
    for(let rpm=0; rpm<=maxRpm; rpm+=200){
      const r = Math.max(1,rpm);
      const tq = r<kneeRpm ? baseTq : baseTq*kneeRpm/r;         // constant-power hyperbola
      const kw = tq*r*2*Math.PI/60000;
      const hp = kw*1.341;
      pts.push({ rpm:r, hp:+hp.toFixed(1), kw:+kw.toFixed(1), torque:Math.round(tq),
                 bmep:0, ve:0, bsfc:0, egt:0, heat:Math.round(r/maxRpm*20) });
      if(hp>maxHp){ maxHp=hp; maxHpRpm=r; }
      if(tq>maxTq) maxTq=tq;
    }
    // battery sag: cheap packs current-limit mid-pull
    let sag=null;
    if(b.id==="pb" && maxHp>120){ sag="Lead-acid pack current-limited: peak power fell 18% by minute two.";
      for(const p of pts) if(p.rpm>kneeRpm){ p.hp*=0.82; p.torque*=0.82; } }
    return { ok:true, ev:true, points:pts, sag,
      peak:{ hp:Math.round(maxHp), hpRpm:maxHpRpm, tq:Math.round(maxTq), tqRpm:kneeRpm },
      ceiling:maxRpm, redline:maxRpm, cr:"—", disp:b.range+" km range", cyls:"electric",
      powerPerLitre:"—", torquePerLitre:"—", noiseDb:12, areaUnderCurve:Math.round(pts.reduce((a,p)=>a+p.kw,0)*200/9500) };
  },

  // ─────────── failure consequence application (real money & state damage) ───────────
  applyBlowup(s, res){
    const f = res.fail;
    let cost = 0, relDamage = 0;
    switch(f.type){
      case "overrev":     cost = 5200;  relDamage = 8; break;
      case "pistonspeed": cost = 6800;  relDamage = 10; break;
      case "detonation":  cost = 7400;  relDamage = 12; break;
      case "overheat":    cost = 4600;  relDamage = 7;  break;
      case "rodload":     cost = 8100;  relDamage = 11; break;
      case "overboost":   cost = 9500;  relDamage = 14; break;
      case "bigcyl":      cost = 8800;  relDamage = 13; break;
      default:            cost = 5000;  relDamage = 8;
    }
    const eraF = 0.3 + 0.7*Math.max(0,(s.year-1950))/75;
    cost = Math.round(cost*eraF*10);   // prototype machining & test-cell burn
    s.money -= cost;
    s.dynoBlowups = (s.dynoBlowups||0)+1;
    s.rep = clamp(s.rep - 0.4, -100, 100);
    Systems.pushNewsLite(s, `💥 DYNO FAILURE — <b>${f.label}</b> at ${f.rpm} rpm. Prototype destroyed, $${fmt(cost)} lost. Engineers shaken.`);
    toast(`💥 Engine blew up on the dyno! -$${fmt(cost)}`, "bad");
    return cost;
  },
  applySuccess(s, res){
    s.dynoRuns = (s.dynoRuns||0)+1;
    // knowledge gained: successful pulls generate RP (measured data is research!)
    const rpGain = Math.round(2 + res.points.length*0.03 + res.peak.hp*0.004);
    s.rp = (s.rp||0) + rpGain;
    Systems.pushNewsLite(s, `📈 Dyno pull complete: ${res.peak.hp} hp @ ${res.peak.hpRpm} rpm, `+
      `${res.peak.tq} Nm @ ${res.peak.tqRpm} rpm. Test data banked (+${rpGain} RP).`);
    return rpGain;
  },

  // ─────────── canvas rendering: hp/torque curves + gauge cluster ───────────
  drawChart(canvas, res, darkTheme){
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    const padL=44, padR=44, padT=18, padB=26;
    const plotW=W-padL-padR, plotH=H-padT-padB;
    const pts=res.points;
    if(!pts.length){ ctx.fillStyle="#8b98b3"; ctx.font="12px sans-serif"; ctx.fillText("No data.",10,20); return; }
    const maxRpm = pts[pts.length-1].rpm;
    const maxY = Math.max(res.peak.hp, res.peak.tq)*1.15;
    // grid
    ctx.strokeStyle="#2f3b52"; ctx.lineWidth=1; ctx.fillStyle="#6b7893"; ctx.font="10px monospace";
    for(let gy=0; gy<=4; gy++){
      const y=padT+plotH*gy/4, val=Math.round(maxY*(1-gy/4));
      ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(W-padR,y); ctx.stroke();
      ctx.fillText(val, 6, y+3);
    }
    for(let gx=0; gx<=6; gx++){
      const x=padL+plotW*gx/6, rpmv=Math.round(maxRpm*gx/6/100)*100;
      ctx.beginPath(); ctx.moveTo(x,padT); ctx.lineTo(x,H-padB); ctx.stroke();
      ctx.fillText(rpmv, x-14, H-8);
    }
    ctx.fillText("rpm", W-30, H-8);
    const X = rpm => padL + plotW*rpm/maxRpm;
    const Y = v   => padT + plotH*(1 - clamp(v/maxY,0,1));
    // torque curve (amber)
    ctx.strokeStyle="#f1c40f"; ctx.lineWidth=2.2; ctx.beginPath();
    pts.forEach((p,i)=> i?ctx.lineTo(X(p.rpm),Y(p.torque)):ctx.moveTo(X(p.rpm),Y(p.torque)));
    ctx.stroke();
    // power curve (green)
    ctx.strokeStyle="#4caf7d"; ctx.beginPath();
    pts.forEach((p,i)=> i?ctx.lineTo(X(p.rpm),Y(p.hp)):ctx.moveTo(X(p.rpm),Y(p.hp)));
    ctx.stroke();
    // fill under power subtly
    ctx.fillStyle="rgba(76,175,125,.08)";
    ctx.lineTo(X(pts[pts.length-1].rpm),H-padB); ctx.lineTo(X(pts[0].rpm),H-padB); ctx.closePath(); ctx.fill();
    // failure marker
    if(!res.ok && res.fail){
      const fx=X(res.fail.rpm);
      ctx.strokeStyle="#e74c3c"; ctx.lineWidth=2; ctx.setLineDash([4,3]);
      ctx.beginPath(); ctx.moveTo(fx,padT); ctx.lineTo(fx,H-padB); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle="#e74c3c"; ctx.font="bold 11px sans-serif";
      ctx.fillText("✖ "+res.fail.label, Math.min(fx+4, W-160), padT+12);
    }
    // legend
    ctx.font="11px sans-serif";
    ctx.fillStyle="#4caf7d"; ctx.fillText("— Horsepower", padL+6, padT+10);
    ctx.fillStyle="#f1c40f"; ctx.fillText("— Torque (Nm)", padL+100, padT+10);
  },

  drawGauges(el, res){
    // needle gauges drawn with inline SVG arcs — rpm & boost/vacuum
    const maxRpm = res.redline||8000;
    const lastPt = res.points[res.points.length-1]||{rpm:0};
    const rpmFrac = clamp(lastPt.rpm/maxRpm,0,1);
    el.innerHTML = `<div class="dyno-gauges">
      <svg viewBox="0 0 100 60" class="gauge">
        <path d="M10 55 A40 40 0 0 1 90 55" stroke="#2f3b52" stroke-width="7" fill="none"/>
        <path d="M10 55 A40 40 0 0 1 90 55" stroke="${rpmFrac>0.9?'#e74c3c':'#4caf7d'}" stroke-width="7" fill="none"
              stroke-dasharray="${(rpmFrac*126).toFixed(0)} 999"/>
        <text x="50" y="40" text-anchor="middle" fill="#ecf0f1" font-size="12" font-family="monospace">${lastPt.rpm}</text>
        <text x="50" y="52" text-anchor="middle" fill="#6b7893" font-size="6">RPM</text>
      </svg>
      <div class="gauge-readout">
        <div><b>${res.peak.hp}</b> hp @ ${res.peak.hpRpm}</div>
        <div><b>${res.peak.tq}</b> Nm @ ${res.peak.tqRpm}</div>
        <div>${res.ok?"✔ survived full pull":"✖ BUILD FAILED"} · ceiling ${res.ceiling} rpm</div>
      </div></div>`;
  },

  // quick static readout for editor side panel without running a full pull
  summaryRow(res){
    if(!res) return "";
    return `<div class="dyno-summary">
      <span>⚡ ${res.peak.hp} hp @ ${res.peak.hpRpm} rpm</span>
      <span>🌀 ${res.peak.tq} Nm @ ${res.peak.tqRpm} rpm</span>
      ${res.powerPerLitre&&res.powerPerLitre!=="—"?`<span>📐 ${res.powerPerLitre} hp/L</span>`:""}
      ${res.flatness?`<span>📊 torque flatness ${res.flatness}×</span>`:""}
      ${res.noiseDb!=null?`<span>🔊 ${res.noiseDb} dB</span>`:""}
    </div>`;
  },
};
