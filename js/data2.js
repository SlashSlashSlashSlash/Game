/* ═══════════ GAME DATA PART 2 — CEO, Brand, HQ, Regions, Critics, Marketing, Motorsport ═══════════ */

// ── CEO persona roles (passive perks, chosen at founding like CCT) ──
const CEO_ROLES = [
  { id:"marketer",     name:"Marketer",             icon:"📣", desc:"Marketing campaigns cost 15% less.",
    perks:{ marketingCostMul:.85 } },
  { id:"celebrity",    name:"Media Personality",    icon:"🌟", desc:"+30% brand fans gained per vehicle sold; press events hit harder.",
    perks:{ fanPerCarMul:1.3, pressRepBonus:1 } },
  { id:"entrepreneur", name:"Entrepreneur",         icon:"💼", desc:"Start with 20% more cash reserves.",
    perks:{ startCashMul:1.2 } },
  { id:"innovator",    name:"Innovator",            icon:"🧠", desc:"Begin with a +50% head start on every research project and cheaper labs.",
    perks:{ researchSpeedAdd:.5, labCostMul:.85 } },
];

// ── Logo builder: symbol × shape × corporate colours ──
const LOGO_SYMBOLS = [
  { id:"bolt",   name:"Lightning Bolt", d:"M50 8 L30 52 L46 52 L38 92 L74 42 L54 42 Z" },
  { id:"star",   name:"Star",           d:"M50 6 L61 38 L95 38 L67 58 L78 92 L50 71 L22 92 L33 58 L5 38 L39 38 Z" },
  { id:"shield", name:"Shield",         d:"M50 6 L88 20 L88 52 Q88 80 50 96 Q12 80 12 52 L12 20 Z" },
  { id:"wing",   name:"Wings",          d:"M8 44 Q32 24 50 40 Q68 24 92 44 L92 58 Q68 44 50 56 Q32 44 8 58 Z" },
  { id:"horse",  name:"Galloping Horse",d:"M28 88 Q24 60 40 46 Q34 34 44 22 L52 30 L60 16 L64 30 Q82 36 84 58 Q86 74 74 80 L70 64 Q60 74 56 88 Z" },
  { id:"arrow",  name:"Arrowhead",      d:"M50 6 L82 62 L60 56 L66 92 L34 92 L40 56 L18 62 Z" },
  { id:"ring",   name:"Twin Rings",     d:"M2 M32 A24 24 0 1 1 2 52 A24 24 0 1 1 2 32 M34 32 A24 24 0 1 1 34 52 A24 24 0 1 1 34 32" },
  { id:"crown",  name:"Crown",          d:"M10 78 L10 34 L30 54 L50 22 L70 54 L90 34 L90 78 Z" },
  { id:"fox",    name:"Fox Head",       d:"M14 20 L38 34 Q50 28 62 34 L86 20 L80 52 Q74 76 50 90 Q26 76 20 52 Z" },
  { id:"gear",   name:"Cogwheel",       d:"M42 4 H58 V16 A34 34 0 0 1 68 20 L78 10 L90 22 L80 32 A34 34 0 0 1 84 42 H96 V58 H84 A34 34 0 0 1 80 68 L90 78 L78 90 L68 80 A34 34 0 0 1 58 84 V96 H42 V84 A34 34 0 0 1 32 80 L22 90 L10 78 L20 68 A34 34 0 0 1 16 58 H4 V42 H16 A34 34 0 0 1 20 32 L10 22 L22 10 L32 20 A34 34 0 0 1 42 16 Z M50 36 A14 14 0 1 0 50 64 A14 14 0 1 0 50 36 Z" },
  { id:"wave",   name:"Speed Wave",     d:"M6 62 Q30 30 54 50 T96 40 L96 56 Q70 78 46 60 T6 76 Z" },
  { id:"diamond",name:"Diamond",        d:"M50 6 L94 50 L50 94 L6 50 Z" },
];
const LOGO_SHAPES = [
  { id:"circle",   name:"Circle",   css:"50%" },
  { id:"hex",      name:"Hexagon",  css:"polygon(25% 5%, 75% 5%, 97% 50%, 75% 95%, 25% 95%, 3% 50%)" },
  { id:"rrect",    name:"Plaque",   css:"18%" },
  { id:"diamonds", name:"Rhombus",  css:"polygon(50% 2%, 98% 50%, 50% 98%, 2% 50%)" },
  { id:"shieldsh", name:"Badge",    css:"polygon(6% 6%, 94% 6%, 94% 62%, 50% 97%, 6% 62%)" },
];
const BRAND_COLORS = [
  { id:"rosso",   name:"Racing Red",   hex:"#c0392b" },
  { id:"blu",     name:"Azure Blue",   hex:"#2980b9" },
  { id:"verde",   name:"British Green",hex:"#27ae60" },
  { id:"giallo",  name:"Modena Yellow",hex:"#f1c40f" },
  { id:"viola",   name:"Royal Purple", hex:"#8e44ad" },
  { id:"bianco",  name:"Pearl White",  hex:"#ecf0f1" },
  { id:"nero",    name:"Onyx Black",   hex:"#2c3e50" },
  { id:"arancio", name:"Papaya Orange",hex:"#e67e22" },
  { id:"argento", name:"Silver",       hex:"#bdc3c7" },
  { id:"cyan",    name:"Electric Cyan",hex:"#16a085" },
];

// ── Headquarters cities (starting region — like CCT's HQ selection) ──
const HQ_CITIES = [
  { id:"rome",      name:"Rome, Italy",          flag:"🇮🇹", homeBonus:1.12, shipCost:1.00, prestige:1.05, tax:1.10, hqCost:120000, blurb:"Passionate domestic buyers & design heritage. High taxes." },
  { id:"detroit",   name:"Detroit, USA",         flag:"🇺🇸", homeBonus:1.10, shipCost:0.95, prestige:1.00, tax:1.00, hqCost:130000, blurb:"The motor city: cheap shipping, huge market, cut-throat rivals." },
  { id:"stuttgart", name:"Stuttgart, Germany",   flag:"🇩🇪", homeBonus:1.08, shipCost:1.00, prestige:1.12, tax:1.15, hqCost:140000, blurb:"Engineering prestige boosts critic scores. Expensive to run." },
  { id:"tokyo",     name:"Tokyo, Japan",         flag:"🇯🇵", homeBonus:1.15, shipCost:1.05, prestige:1.02, tax:0.95, hqCost:125000, blurb:"Reliability reputation bonus at home; compact-car obsessed market." },
  { id:"crane",     name:"Crane, Michigan",      flag:"🏞️", homeBonus:1.05, shipCost:1.10, prestige:0.95, tax:0.80, hqCost:70000,  blurb:"Small quiet town where Car Company Tycoon legends begin. Cheap & cheerful." },
];

// ── World market regions (global distribution & shipping) ──
const REGIONS = [
  { id:"nafta", name:"North America", icon:"🌎", size:1.35, traits:{ suv:1.45, pickup:1.4, budget:.8, luxury:1.15, supercar:.9, sports:.95, family:1.1, economy:1.0, ev:1.05 }, shipCost:1.00, entryCost:60000 },
  { id:"eu",    name:"Europe",        icon:"🌍", size:1.15, traits:{ budget:1.2, economy:1.3, sports:1.2, supercar:1.25, suv:.8, pickup:.4, luxury:1.05, family:1.0, ev:1.2 }, shipCost:0.90, entryCost:50000 },
  { id:"latam", name:"South America", icon:"🌎", size:0.55, traits:{ budget:1.5, economy:1.3, suv:1.1, sports:.6, luxury:.7, supercar:.4, family:1.0, ev:.5 }, shipCost:1.25, entryCost:30000 },
  { id:"apac",  name:"Asia-Pacific",  icon:"🌏", size:1.25, traits:{ budget:1.4, economy:1.35, ev:1.4, suv:.85, pickup:.5, luxury:1.1, sports:1.0, supercar:1.1, family:1.0 }, shipCost:1.15, entryCost:55000 },
  { id:"meaf",  name:"Middle East & Africa", icon:"🕌", size:0.6, traits:{ suv:1.5, luxury:1.3, supercar:1.4, pickup:1.3, budget:.9, economy:.9, ev:.6, sports:1.1, family:1.0 }, shipCost:1.30, entryCost:40000 },
];

// ── Marketing campaign system ──
const MKT_CHANNELS = [
  { id:"print",   name:"Newspaper & Magazine", icon:"📰", baseCost:6000,  reach:1.0, durMin:2, durMax:8,  fanPer:0.004, best:["luxury","sports"],    minYear:1950 },
  { id:"tv",      name:"Television Spots",     icon:"📺", baseCost:24000, reach:1.7, durMin:2, durMax:6,  fanPer:0.007, best:["family","suv","economy"], minYear:1958 },
  { id:"radio",   name:"Radio Jingles",        icon:"📻", baseCost:8000,  reach:1.1, durMin:2, durMax:8,  fanPer:0.003, best:["budget","economy"],  minYear:1950 },
  { id:"billboard",name:"Billboards & Posters",icon:"🪧", baseCost:10000, reach:1.0, durMin:3, durMax:12, fanPer:0.003, best:["budget","family"],   minYear:1950 },
  { id:"internet",name:"Online & Social Media",icon:"💻", baseCost:15000, reach:1.5, durMin:1, durMax:6,  fanPer:0.009, best:["ev","sports","supercar"], minYear:2004 },
  { id:"influencer",name:"Influencer Sponsorships",icon:"🤳", baseCost:22000, reach:1.8, durMin:1, durMax:4, fanPer:0.012, best:["ev","supercar","sports"], minYear:2015 },
];
const MKT_SIZES = [
  { id:"local",  name:"Local Blitz",   mul:0.6,  reachMul:0.7  },
  { id:"regional",name:"Regional Push",mul:1.0,  reachMul:1.0  },
  { id:"national",name:"National Wave",mul:1.9,  reachMul:1.45 },
  { id:"global",  name:"Global Takeover",mul:3.4,reachMul:2.0  },
];

// ── Critic review personalities (magazine reviewers, 0–10 score) ──
const CRITICS = [
  { id:"autozeitung", name:"Auto Zeitung", icon:"🇩🇪", bias:{ performance:1.25, engineering:1.3, safety:1.1, comfort:.9, value:.85, reliability:1.05 } },
  { id:"autocar",     name:"Autocar UK",   icon:"🇬🇧", bias:{ performance:1.15, engineering:1.05, comfort:1.1, looks:1.1, value:1.0, reliability:1.0 } },
  { id:"motorweek",   name:"MotorWeek",    icon:"🇺🇸", bias:{ value:1.3, reliability:1.25, fuelEco:1.2, performance:.9, safety:1.1, comfort:1.0 } },
  { id:"ephemera",    name:"Ephemeral Drift", icon:"🌸", bias:{ looks:1.4, comfort:1.2, innovation:1.3, value:.8, performance:.95, reliability:.9 } },
];

// ── Motorsport championship calendar ──
const RACE_SERIES = [
  { id:"touring", name:"Touring Car Cup",   icon:"🏁", minHp:110, maxHp:340,  segs:["economy","family","sports","ev"],            cost:35000,  repWin:5,  fanWin:900,  prize:40000,  unlockYear:1952, weight:{ perf:45, rel:30, handling:25 } },
  { id:"gt",      name:"GT Endurance Series",icon:"🏆", minHp:280, maxHp:700,  segs:["sports","luxury","supercar","ev"],            cost:90000,  repWin:8,  fanWin:2200, prize:150000, unlockYear:1967, weight:{ perf:60, rel:25, handling:15 } },
  { id:"formula", name:"Formula Apex",       icon:"🏎️", minHp:450, maxHp:1500, segs:["supercar","sports"],                            cost:220000, repWin:12, fanWin:5000, prize:400000, unlockYear:1978, weight:{ perf:75, handling:20, rel:5 } },
  { id:"rally",   name:"World Rally Series", icon:"🌲", minHp:150, maxHp:500,  segs:["suv","family","sports","pickup","ev","economy"],cost:70000,  repWin:7,  fanWin:1600, prize:90000,  unlockYear:1960, weight:{ perf:40, rel:40, handling:20 } },
];
const RACES_PER_SEASON = ["Monaco Sprint","Silverstone 6h","Le Mans Classic","Nürburgring Loop","Laguna Seca","Tsukuba Cup","Bathurst Mount"," Monza Grand Prix"].slice(0,8);

// ── Recall & defect system tuning ──
const RECALL_CFG = { baseDefectPpm: 900, // parts-per-million defect rate baseline at reliability 50
  perRel: -14,                        // each reliability point reduces ppm
  qcPer: -60,                         // per QC building level
  minPpm: 25 };

// ── News ticker flavour lines (generated dynamically with state) ──
const NEWS_FLAVOUR = {
  launchOk: ["{m} rolls off the line to strong pre-orders.","Critics call {m} \"a statement of intent.\"","Dealers cannot keep {m} on the lot."],
  launchBad:["{m} flops in early sales surveys.","Reviewers pan {m}: \"confusing product.\"","Showrooms gather dust around {m}."],
  crisis:   ["Fuel queues stretch around blocks as oil prices spike.","Governors debate emergency rationing.","Drivers switch to smaller cars amid pump shock."],
  boom:     ["Consumer confidence hits record highs.","Credit is cheap — car lots overflow with buyers.","A new wave of prosperity lifts every segment."],
};

// ── Research points (RP) economy — CCT-style secondary research currency ──
const RP_CONFIG = {
  perEngineerBase: 2.2,      // RP/month per hired engineer (skill-scaled)
  labBonus: 0.35,            // extra multiplier per R&D lab level
  designerShare: 0.4,        // designers generate RP too (at this rate)
  researcherShare: 1.0,
  costs: {                   // RP price to refine part families (real spend, not fake gates)
    engine: 40, gearbox: 25, chassis: 30, brakes: 20, susp: 25, tyres: 20, interior: 25, electronics: 35, safety: 35, emissions: 30, options: 15,
  },
};

// ── Fan club / brand popularity tuning ──
const FANS_CFG = {
  perSale: 0.02,             // fans per car sold (x celebrity perk)
  perAppealMonth: 0.0006,    // fans from happy owners scaling with appeal & sales
  tierBonuses: [0, .02, .05, .09, .14], // demand bonus at fan tiers (0,25k,100k,400k,1M fans)
  tierThresholds:[0, 25000, 100000, 400000, 1000000],
};

// ── Expanded objectives for the deeper systems ──
const OBJECTIVES2 = [
  { id:"c1", txt:"Run your first marketing campaign", rew:8000, check:s=>(s.campaigns||[]).length>=1 || s.marketingHistory>=1 },
  { id:"c2", txt:"Earn a critic score of 7.0+ on any model", rew:15000, check:s=>Object.values(s.reviews||{}).some(rv=>rv.some(r=>r.score>=7)) },
  { id:"c3", txt:"Open sales operations in 2 foreign regions", rew:25000, check:s=>Object.keys(s.regions||{}).filter(k=>s.regions[k].opened && k!=="home").length>=2 },
  { id:"c4", txt:"Grow your fan club past 10,000 fans", rew:20000, check:s=>(s.fans||0)>=10000 },
  { id:"c5", txt:"Win your first motorsport race", rew:30000, check:s=>(s.raceWins||0)>=1 },
  { id:"c6", txt:"Reach 100,000 company valuation in one month of profit", rew:40000, check:s=>(s.lastStatement&&s.lastStatement.net>=100000) },
  { id:"c7", txt:"Survive an oil crisis without going into overdraft loan", rew:22000, check:s=>s.oilSurvived===true },
  { id:"c8", txt:"Publish a fully electric model", rew:35000, check:s=>s.models.some(m=>m.isEV&&m.published) },
  { id:"c9", txt:"Have 5 models selling simultaneously", rew:45000, check:s=>s.models.filter(m=>m.published).length>=5 },
  { id:"c10",txt:"Build headquarters to Mansion tier", rew:50000, check:s=>(s.hqLevel||0)>=3 },
  { id:"c11",txt:"Top the leaderboard as #1 global automaker", rew:200000, check:s=>s.leaderRank===1 },
  { id:"c12",txt:"Sell 1 million cars lifetime", rew:1000000, check:s=>s.totalSold>=1e6 },
];

// ── HQ upgrade ladder ──
const HQ_LEVELS = [
  { name:"Garage Workshop",   cost:0,      perk:"Where every legend starts.", capacity:0, rp:0 },
  { name:"Office Block",      cost:90000,  perk:"+1 production line slot, staff cap +6", lineSlot:1, staffCap:14, rp:2 },
  { name:"Corporate Campus",  cost:260000, perk:"+15% research speed, staff cap +10", resMul:1.15, staffCap:24, rp:5 },
  { name:"Executive Mansion", cost:650000, perk:"+10% all sales, prestige up", salesMul:1.10, staffCap:40, rp:9 },
  { name:"Skyscraper Tower",  cost:1600000,perk:"+18% sales, +25% research, global prestige", salesMul:1.18, resMul:1.25, staffCap:70, rp:15 },
];

// helper used across modules
function hqState(s){ return HQ_LEVELS[Math.min(s.hqLevel||0, HQ_LEVELS.length-1)]; }
