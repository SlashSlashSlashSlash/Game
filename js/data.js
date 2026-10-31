/* ═══════════ GAME DATA — Car Company Tycoon ═══════════ */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Market segments (what buyers care about) ──
const SEGMENTS = [
  { id:"budget",   name:"Budget",        icon:"💵", priceIdeal:3500,  priceTol:.45, demandBase:16000, w:{price:35,reliability:20,performance:8,comfort:7,looks:10,safety:10,fuelEco:10}, unlock:1950 },
  { id:"economy",  name:"Economy",       icon:"🚗", priceIdeal:6500,  priceTol:.40, demandBase:14000, w:{price:27,reliability:22,performance:9,comfort:11,looks:11,safety:10,fuelEco:10}, unlock:1950 },
  { id:"family",   name:"Family",        icon:"👨‍👩‍👧", priceIdeal:11000, priceTol:.40, demandBase:10500, w:{price:16,reliability:20,performance:9,comfort:17,looks:11,safety:17,fuelEco:10}, unlock:1950 },
  { id:"sports",   name:"Sports",        icon:"🏎️", priceIdeal:32000, priceTol:.45, demandBase:3600,  w:{price:6,reliability:10,performance:34,comfort:8,looks:26,safety:6,fuelEco:4},  unlock:1950 },
  { id:"luxury",   name:"Luxury",        icon:"💎", priceIdeal:60000, priceTol:.50, demandBase:2300,  w:{price:4,reliability:14,performance:12,comfort:28,looks:22,safety:12,fuelEco:3},  unlock:1952 },
  { id:"suv",      name:"SUV / Truck",   icon:"🛻", priceIdeal:24000, priceTol:.42, demandBase:6200,  w:{price:12,reliability:18,performance:14,comfort:14,looks:12,safety:20,fuelEco:10}, unlock:1955 },
  { id:"supercar", name:"Supercar",      icon:"🐎", priceIdeal:190000,priceTol:.55, demandBase:650,   w:{price:2,reliability:8,performance:40,comfort:8,looks:34,safety:4,fuelEco:1},    unlock:1963 },
  { id:"ev",       name:"Electric",      icon:"🔋", priceIdeal:34000, priceTol:.45, demandBase:4200,  w:{price:14,reliability:18,performance:16,comfort:14,looks:16,safety:12,fuelEco:10}, unlock:1998 },
];

// ── Body types (compatible segments + stat modifiers) ──
const BODY_TYPES = [
  { id:"sedan",     name:"Sedan",        segs:["budget","economy","family","luxury","ev"], mods:{reliability:3,comfort:4,looks:0,performance:-2,safety:3} },
  { id:"hatch",     name:"Hatchback",    segs:["budget","economy","family"],               mods:{fuelEco:5,comfort:-2,looks:1} },
  { id:"coupe",     name:"Coupe",        segs:["sports","luxury","supercar","ev"],         mods:{looks:7,performance:3,comfort:-3,safety:-2} },
  { id:"convert",   name:"Convertible",  segs:["sports","luxury"],                         mods:{looks:9,performance:1,comfort:-4,reliability:-3,safety:-4} },
  { id:"wagon",     name:"Station Wagon",segs:["family","economy"],                        mods:{comfort:5,looks:-3} },
  { id:"pickup",    name:"Pickup",       segs:["suv"],                                     mods:{performance:-4,comfort:-5,looks:-2,safety:2} },
  { id:"suvbody",   name:"SUV",          segs:["suv","luxury","ev"],                       mods:{safety:6,comfort:3,fuelEco:-6,performance:-3} },
  { id:"van",       name:"Van / MPV",    segs:["family","budget"],                         mods:{comfort:2,looks:-6,performance:-5} },
  { id:"roadster",  name:"Roadster",     segs:["sports","supercar"],                       mods:{performance:7,looks:6,comfort:-7,reliability:-4,safety:-5} },
];

// ── Technology tree ──
const TECHS = [
  { id:"ice",        name:"Inline Engine",            cat:"Engine",     cost:0,     time:0,  desc:"Basic inline powerplants.", req:[] },
  { id:"vengine",    name:"V-Engine Layout",          cat:"Engine",     cost:45000, time:5,  desc:"Unlocks V6 & V8 engines.", req:["ice"] },
  { id:"diesel",     name:"Diesel Engines",           cat:"Engine",     cost:38000, time:4,  desc:"Torque-rich, durable engines.", req:["ice"] },
  { id:"turbo",      name:"Turbocharging",            cat:"Engine",     cost:60000, time:5,  desc:"Forced induction power.", req:["vengine"] },
  { id:"fuelinj",    name:"Fuel Injection",           cat:"Engine",     cost:52000, time:4,  desc:"Better than carburetors.", req:["ice"] },
  { id:"dohc",       name:"DOHC Multi-Valve",         cat:"Engine",     cost:85000, time:6,  desc:"High-revving performance heads.", req:["fuelinj"] },
  { id:"hybrid",     name:"Hybrid Drive",             cat:"Engine",     cost:150000,time:8,  desc:"Petrol + electric synergy.", req:["dohc"], year:1995 },
  { id:"evdrive",    name:"EV Powertrain",            cat:"Engine",     cost:200000,time:9,  desc:"Full electric drivetrains.", req:[], year:1996 },
  { id:"manual3",    name:"3-Speed Manual",           cat:"Gearbox",    cost:0,     time:0,  desc:"", req:[] },
  { id:"manual4",    name:"4-Speed Manual",           cat:"Gearbox",    cost:25000, time:3,  desc:"", req:["manual3"] },
  { id:"auto3",      name:"3-Speed Automatic",        cat:"Gearbox",    cost:40000, time:4,  desc:"Convenience selling in the 50s.", req:["manual3"] },
  { id:"manual5",    name:"5-Speed Manual",           cat:"Gearbox",    cost:60000, time:4,  desc:"", req:["manual4"] },
  { id:"auto4",      name:"4-Speed Automatic",        cat:"Gearbox",    cost:70000, time:5,  desc:"", req:["auto3"] },
  { id:"cvt",        name:"CVT Gearbox",              cat:"Gearbox",    cost:95000, time:5,  desc:"Smooth & efficient.", req:["auto4"], year:1985 },
  { id:"auto6",      name:"6-Speed Auto/DCT",         cat:"Gearbox",    cost:130000,time:6,  desc:"Performance automatics.", req:["auto4","dohc"] },
  { id:"rwd",        name:"Rear-Wheel Drive",         cat:"Drivetrain", cost:0,     time:0,  desc:"", req:[] },
  { id:"fwd",        name:"Front-Wheel Drive",        cat:"Drivetrain", cost:35000, time:4,  desc:"Packaging & traction.", req:["manual3"] },
  { id:"awd",        name:"All-Wheel Drive",          cat:"Drivetrain", cost:90000, time:5,  desc:"Grip in all conditions.", req:["fwd"] },
  { id:"ladder",     name:"Ladder Frame Chassis",     cat:"Chassis",    cost:0,     time:0,  desc:"", req:[] },
  { id:"unibody",    name:"Unibody Construction",     cat:"Chassis",    cost:65000, time:5,  desc:"Lighter, stiffer bodies.", req:["ladder"] },
  { id:"monocoque",  name:"Spaceframe Monocoque",     cat:"Chassis",    cost:160000,time:6,  desc:"Exotic lightweight structures.", req:["unibody"], year:1975 },
  { id:"carbon",     name:"Carbon Fiber Panels",      cat:"Chassis",    cost:240000,time:7,  desc:"Featherweight supercar skin.", req:["monocoque"], year:1985 },
  { id:"drumbrake",  name:"Drum Brakes",              cat:"Brakes",     cost:0,     time:0,  desc:"", req:[] },
  { id:"discbrake",  name:"Disc Brakes",              cat:"Brakes",     cost:42000, time:4,  desc:"Far better stopping power.", req:["drumbrake"] },
  { id:"abs",        name:"Anti-lock Brakes (ABS)",   cat:"Brakes",     cost:80000, time:4,  desc:"Stop without skidding.", req:["discbrake"], year:1978 },
  { id:"liveaxle",   name:"Live Axle Suspension",     cat:"Suspension", cost:0,     time:0,  desc:"", req:[] },
  { id:"macpherson", name:"MacPherson Struts",        cat:"Suspension", cost:38000, time:4,  desc:"Modern compact suspension.", req:["liveaxle"] },
  { id:"multilink",  name:"Multi-Link Suspension",    cat:"Suspension", cost:88000, time:5,  desc:"The handling benchmark.", req:["macpherson"] },
  { id:"airshock",   name:"Adaptive/Air Suspension",  cat:"Suspension", cost:140000,time:5,  desc:"Magic carpet ride.", req:["multilink"], year:1989 },
  { id:"biasply",    name:"Bias-Ply Tyres",           cat:"Tyres",      cost:0,     time:0,  desc:"", req:[] },
  { id:"radial",     name:"Radial Tyres",             cat:"Tyres",      cost:46000, time:4,  desc:"Grip + longevity.", req:["biasply"] },
  { id:"perftyre",   name:"Performance Radials",      cat:"Tyres",      cost:98000, time:4,  desc:"Track-grade rubber.", req:["radial"], year:1972 },
  { id:"smog",       name:"Emissions Smog Control",   cat:"Emissions",  cost:55000, time:4,  desc:"Required as laws tighten (1970).", req:["fuelinj"] },
  { id:"catconv",    name:"Catalytic Converter",      cat:"Emissions",  cost:85000, time:4,  desc:"Clean exhaust.", req:["smog"], year:1975 },
  { id:"basicint",   name:"Basic Interior Trim",      cat:"Interior",   cost:0,     time:0,  desc:"", req:[] },
  { id:"vinyl",      name:"Vinyl & Bench Seats",      cat:"Interior",   cost:15000, time:2,  desc:"50s flair.", req:["basicint"] },
  { id:"clothint",   name:"Cloth Comfort Interior",   cat:"Interior",   cost:40000, time:3,  desc:"", req:["basicint"] },
  { id:"leather",    name:"Leather Appointed Cabin",  cat:"Interior",   cost:90000, time:4,  desc:"Executive comfort.", req:["clothint"] },
  { id:"digicluster",name:"Digital Instrumentation",  cat:"Interior",   cost:70000, time:3,  desc:"", req:["clothint"], year:1988 },
  { id:"radiomanual",name:"Car Radio",                cat:"Electronics",cost:12000, time:2,  desc:"Entertainment on wheels.", req:[] },
  { id:"powerwin",   name:"Power Windows & Locks",    cat:"Electronics",cost:35000, time:3,  desc:"", req:["radiomanual"] },
  { id:"ac",         name:"Air Conditioning",         cat:"Electronics",cost:50000, time:3,  desc:"Essential for luxury buyers.", req:["radiomanual"] },
  { id:"cruise",     name:"Cruise Control",           cat:"Electronics",cost:42000, time:3,  desc:"", req:["powerwin"] },
  { id:"airbag",     name:"Airbags",                  cat:"Safety",     cost:75000, time:4,  desc:"Life-saving tech.", req:[], year:1985 },
  { id:"crumple",    name:"Crumple Zones",            cat:"Safety",     cost:60000, time:4,  desc:"Engineered crash structure.", req:["unibody"] },
  { id:"esp",        name:"Electronic Stability (ESP)",cat:"Safety",    cost:120000,time:5,  desc:"", req:["abs","airbag"], year:1995 },
  { id:"infotain",   name:"Touchscreen Infotainment", cat:"Electronics",cost:110000,time:4,  desc:"", req:["digicluster"], year:2008 },
  { id:"autopark",   name:"Auto Parking Assist",      cat:"Electronics",cost:150000,time:5,  desc:"", req:["infotain","esp"], year:2012 },
  { id:"batt_li",    name:"Lithium-Ion Battery Pack", cat:"EV",         cost:180000,time:6,  desc:"Serious EV range.", req:["evdrive"] },
  { id:"fastcharge", name:"Fast Charging",            cat:"EV",         cost:120000,time:4,  desc:"", req:["batt_li"], year:2012 },
  { id:"vvt",      name:"Variable Valve Timing",     cat:"Engine",     cost:110000,time:5,  desc:"Power across the rev range.", req:["dohc"], year:1980 },
  { id:"drysump",  name:"Dry Sump Lubrication",     cat:"Engine",     cost:70000, time:3,  desc:"Race-grade oiling, lower CG.", req:["vengine"], year:1960 },
  { id:"hybridfull",name:"Full Hybrid Assist",      cat:"Engine",     cost:180000,time:7,  desc:"Regen braking + electric torque fill.", req:["hybrid","batt_li"], year:2004 },
  { id:"solidbatt",name:"Solid-State Battery",      cat:"EV",         cost:320000,time:8,  desc:"Dense, safe next-gen cells.", req:["batt_li"], year:2024 },
  { id:"hydrogen", name:"Hydrogen Fuel Cell",       cat:"EV",         cost:280000,time:8,  desc:"Zero-emission long range.", req:["evdrive"], year:2015 },
  { id:"autotech", name:"Autonomous Driving Stack", cat:"Electronics",cost:260000,time:7,  desc:"Self-driving hardware suite.", req:["infotain","esp"], year:2016 },
  { id:"telemetry",name:"Motorsport Telemetry",     cat:"Motorsport", cost:90000, time:4,  desc:"+10% race performance.", req:[], year:1980 },
  { id:"windtunnel",name:"Wind Tunnel",             cat:"Motorsport", cost:150000,time:5,  desc:"+aero: looks & high-speed grip.", req:[], year:1970 },
  // ── extra gates for the deep-part library ──
  { id:"alloyhead",   name:"Alloy Cylinder Heads",     cat:"Engine",    cost:48000, time:4,  desc:"Free-flowing alloy heads & aluminium blocks.", req:["fuelinj"] },
  { id:"hypereut",    name:"Hypereutectic Pistons",    cat:"Engine",    cost:62000, time:3,  desc:"Light, cheap cast-alloy piston sets.", req:["alloyhead"], year:1980 },
  { id:"tirod",       name:"Titanium Con-Rod Program", cat:"Engine",    cost:170000,time:5,  desc:"Screaming revs without throwing rods through blocks.", req:["dohc"], year:1996 },
  { id:"boostctrl",   name:"Boost Control Electronics",cat:"Engine",    cost:95000, time:3,  desc:"Electronic wastegates & mapped boost safety.", req:["turbo"], year:1998 },
  { id:"intercooler", name:"Charge-Cooling Systems",   cat:"Engine",    cost:70000, time:3,  desc:"Air-to-air & water intercooling hardware.", req:["turbo"], year:1976 },
  { id:"euro3",       name:"Euro III Compliance Lab",  cat:"Emissions", cost:120000,time:4,  desc:"Dual-bank catalysts keep you legal after 1999.", req:["catconv"], year:1996 },
  { id:"partfilter",  name:"Particulate Filtration",   cat:"Emissions", cost:160000,time:4,  desc:"DPF & NOx traps for the modern era.", req:["euro3"], year:2004 },
  { id:"nvh",         name:"NVH Engineering Dept",     cat:"Interior",  cost:55000, time:3,  desc:"Sound-deadening & refinement packages.", req:[] },
  { id:"ledtech",     name:"LED Lighting Signature",   cat:"Electronics",cost:80000,time:3,  desc:"Daytime running lights & adaptive beams.", req:["infotain"], year:2006 },
  { id:"glassbond",   name:"Bonded Laminated Glass",   cat:"Chassis",   cost:45000, time:3,  desc:"Structural gluing & panoramic roofs.", req:["unibody"] },
  { id:"forgewheel",  name:"Forged Wheel Foundry",     cat:"Chassis",   cost:90000, time:3,  desc:"Big lightweight alloy & carbon rims.", req:["multilink"], year:1990 },
  { id:"difftech",    name:"Differential Tech",        cat:"Drivetrain",cost:60000, time:3,  desc:"LSDs, locking diffs & torque vectoring.", req:["awd"] },
];

// ── ENGINES ──
// Cylinders are computed from layout geometry: inline n, V (n/2 per bank), W (4 banks), flat (n/2 per side)
const ENGINE_LAYOUTS = [
  { id:"i2",  name:"Inline-2",        tech:"ice",     year:1950, mult:.35, mass:-60, cyls:2,  form:"inline" },
  { id:"i3",  name:"Inline-3",        tech:"ice",     year:1950, mult:.55, mass:-40, cyls:3,  form:"inline" },
  { id:"i4",  name:"Inline-4",        tech:"ice",     year:1950, mult:.8,  mass:-20, cyls:4,  form:"inline" },
  { id:"i5",  name:"Inline-5",        tech:"ice",     year:1958, mult:.95, mass:-10, cyls:5,  form:"inline" },
  { id:"i6",  name:"Inline-6",        tech:"ice",     year:1950, mult:1.05,mass:10,  cyls:6,  form:"inline" },
  { id:"v6",  name:"V6",              tech:"vengine", year:1950, mult:1.15,mass:0,   cyls:6,  form:"vee" },
  { id:"v8",  name:"V8",              tech:"vengine", year:1950, mult:1.5, mass:35,  cyls:8,  form:"vee" },
  { id:"v10", name:"V10",             tech:"vengine", year:1988, mult:1.8, mass:55,  cyls:10, form:"vee" },
  { id:"v12", name:"V12",             tech:"vengine", year:1950, mult:2.2, mass:85,  cyls:12, form:"vee" },
  { id:"f4",  name:"Flat-4 Boxer",    tech:"vengine", year:1957, mult:.9,  mass:-5,  cyls:4,  form:"flat" },
  { id:"f6",  name:"Flat-6 Boxer",    tech:"vengine", year:1963, mult:1.3, mass:15,  cyls:6,  form:"flat" },
  { id:"w16", name:"W16 Quad-Bank",   tech:"dohc",    year:1999, mult:3.0, mass:110, cyls:16, form:"w" },
];
// Fine displacement slider (litres). Bore/stroke sliders in the editor derive from this + cylinder count.
const DISPLACEMENTS = [];
for(let cc=600; cc<=8500; cc+=100){
  DISPLACEMENTS.push({ id:"cc"+cc, name:(cc/1000).toFixed(1)+" L", cc });
}
const FUEL_SYS = [
  { id:"carb1", name:"Single Carburetor",    tech:null,      year:1950, powerM:1,    relM:0,  ecoM:1,    cost:120 },
  { id:"carb2", name:"Twin Carburetors",     tech:null,      year:1955, powerM:1.1,  relM:-6, ecoM:1.15, cost:260 },
  { id:"mpfi",  name:"Multi-Point Injection",tech:"fuelinj", year:1980, powerM:1.12, relM:4,  ecoM:.85,  cost:520 },
  { id:"gdi",   name:"Direct Injection GDI", tech:"dohc",    year:2005, powerM:1.22, relM:1,  ecoM:.75,  cost:840 },
];
const ASPIRATION = [
  { id:"na",     name:"Naturally Aspirated", tech:null,     year:1950, powerM:1,    relM:0,   ecoM:1,   cost:0 },
  { id:"turbo",  name:"Turbocharger",        tech:"turbo",  year:1975, powerM:1.45, relM:-8,  ecoM:.92, cost:950 },
  { id:"bturbo", name:"Twin Turbo",          tech:"turbo",  year:1985, powerM:1.85, relM:-15, ecoM:1.0, cost:2100 },
  { id:"sc",     name:"Supercharger",        tech:null,     year:1955, powerM:1.35, relM:-6,  ecoM:1.1, cost:1300 },
];
const ENGINE_FUELS = [
  { id:"petrol", name:"Petrol",        tech:null,     year:1950, powerM:1,   relM:0,  ecoM:1,  cost:0 },
  { id:"diesel", name:"Diesel",        tech:"diesel", year:1950, powerM:.9,  relM:8,  ecoM:.8, cost:300 },
  { id:"hybridf",name:"Hybrid Petrol", tech:"hybrid", year:1997, powerM:1.05,relM:-3, ecoM:.6, cost:2600 },
];
const EV_MOTORS = [
  { id:"em1", name:"Single Electric Motor 75 kW", tech:"evdrive", year:1996, hp:100, relM:15, cost:3800, mass:-30 },
  { id:"em2", name:"Dual Motor AWD 150 kW",       tech:"evdrive", year:2008, hp:200, relM:12, cost:6500, mass:0 },
  { id:"em3", name:"Tri-Motor 330 kW",            tech:"evdrive", year:2015, hp:440, relM:10, cost:9800, mass:25 },
  { id:"em4", name:"Quad Motor 590 kW",           tech:"evdrive", year:2020, hp:790, relM:8,  cost:15500,mass:40 },
];
const EV_BATTERIES = [
  { id:"pb",   name:"Lead-Acid Pack 16 kWh", tech:"evdrive", year:1996, range:80,  mass:220, cost:2600 },
  { id:"nh",   name:"NiMH Pack 22 kWh",      tech:"hybrid",  year:2000, range:120, mass:160, cost:3900 },
  { id:"li40", name:"Li-Ion 40 kWh",         tech:"batt_li", year:2010, range:230, mass:95,  cost:6800 },
  { id:"li75", name:"Li-Ion 75 kWh",         tech:"batt_li", year:2015, range:400, mass:110, cost:10500 },
  { id:"li100",name:"Li-Ion 100 kWh",        tech:"batt_li", year:2020, range:550, mass:130, cost:14000 },
  { id:"solid80",name:"Solid-State 80 kWh",   tech:"solidbatt",year:2024, range:620, mass:85,  cost:16500 },
  { id:"h2fuel", name:"Hydrogen Fuel Cell 60kW-eq", tech:"hydrogen", year:2015, range:480, mass:120, cost:13000 },
];

// ── GEARBOXES ──
const GEARBOXES = [
  { id:"m3", name:"3-Speed Manual",    tech:"manual3", year:1950, cost:400,  rel:0,  perf:0,  comfort:1 },
  { id:"m4", name:"4-Speed Manual",    tech:"manual4", year:1961, cost:550,  rel:2,  perf:4,  comfort:2 },
  { id:"a3", name:"3-Speed Automatic", tech:"auto3",   year:1954, cost:900,  rel:-4, perf:-6, comfort:6 },
  { id:"a4", name:"4-Speed Automatic", tech:"auto4",   year:1968, cost:1200, rel:-2, perf:-2, comfort:8 },
  { id:"m5", name:"5-Speed Manual",    tech:"manual5", year:1977, cost:700,  rel:3,  perf:7,  comfort:2 },
  { id:"cvt",name:"CVT Automatic",     tech:"cvt",     year:1987, cost:1400, rel:-3, perf:2,  comfort:9, eco:.82 },
  { id:"m6", name:"6-Speed Manual",    tech:"manual5", year:1997, cost:900,  rel:3,  perf:10, comfort:2 },
  { id:"a6", name:"6-Speed Auto",      tech:"auto6",   year:2003, cost:1900, rel:0,  perf:8,  comfort:9 },
  { id:"dct",name:"8-Speed DCT",       tech:"auto6",   year:2009, cost:2900, rel:-4, perf:15, comfort:7 },
  { id:"dct10",name:"10-Speed DCT",      tech:"auto6",   year:2015, cost:3800, rel:-3, perf:19, comfort:8 },
  { id:"m7", name:"7-Speed Manual",    tech:"manual5", year:2012, cost:1200, rel:3,  perf:13, comfort:2 },
  { id:"sg", name:"Single-Speed (EV)", tech:"evdrive", year:1996, cost:1100, rel:12, perf:6,  comfort:8, evOnly:true },
];

// ── DRIVETRAIN ──
const DRIVETRAINS = [
  { id:"rwd", name:"Rear-Wheel Drive",  tech:"rwd", year:1950, cost:600,  perf:5, rel:0,  safety:0, handling:3 },
  { id:"fwd", name:"Front-Wheel Drive", tech:"fwd", year:1959, cost:650,  perf:0, rel:3,  safety:2, handling:0, eco:.95 },
  { id:"awd", name:"All-Wheel Drive",   tech:"awd", year:1980, cost:1500, perf:6, rel:-3, safety:8, handling:8, massP:8, eco:1.08 },
  { id:"4wd", name:"Part-Time 4WD",     tech:"awd", year:1972, cost:1300, perf:2, rel:2,  safety:5, handling:4, massP:12, eco:1.12 },
];

// ── CHASSIS ──
const CHASSIS = [
  { id:"lad", name:"Ladder Frame",        tech:"ladder",    year:1950, cost:900,   massP:18, safety:2,  handling:-4, comfort:-3, rel:5 },
  { id:"uni", name:"Unibody Steel",       tech:"unibody",   year:1956, cost:1400,  massP:0,  safety:8,  handling:5,  comfort:5,  rel:3 },
  { id:"alu", name:"Aluminium Spaceframe",tech:"monocoque", year:1982, cost:3400,  massP:-14,safety:10, handling:10, comfort:6,  rel:0 },
  { id:"cf",  name:"Carbon Monocoque",    tech:"carbon",    year:1988, cost:11000, massP:-30,safety:14, handling:18, comfort:4,  rel:-2 },
];

// ── BRAKES ──
const BRAKES = [
  { id:"drum",  name:"Drum Brakes",      tech:"drumbrake", year:1950, cost:220,  safety:0,  perf:0 },
  { id:"discF", name:"Front Discs",      tech:"discbrake", year:1958, cost:480,  safety:8,  perf:3 },
  { id:"discA", name:"All-Disc",         tech:"discbrake", year:1972, cost:760,  safety:12, perf:5 },
  { id:"absd",  name:"ABS + Ventilated", tech:"abs",       year:1988, cost:1350, safety:20, perf:7 },
  { id:"carbc", name:"Carbon-Ceramic",   tech:"abs",       year:2001, cost:4200, safety:24, perf:10 },
];

// ── SUSPENSION ──
const SUSPENSIONS = [
  { id:"leaf", name:"Leaf Springs (Live Axle)",     tech:"liveaxle",   year:1950, cost:300,  comfort:-6, handling:-6 },
  { id:"mcph", name:"MacPherson Struts",            tech:"macpherson", year:1962, cost:560,  comfort:4,  handling:5 },
  { id:"multi",name:"Multi-Link Suspension",        tech:"multilink",  year:1978, cost:1100, comfort:8,  handling:12 },
  { id:"air",  name:"Air / Adaptive Dampers",       tech:"airshock",   year:1990, cost:2400, comfort:15, handling:10, rel:-4 },
];

// ── TYRES ──
const TYRES = [
  { id:"bias", name:"Bias-Ply",           tech:"biasply",  year:1950, cost:120, grip:-6, comfort:-4 },
  { id:"rad",  name:"Radial Touring",     tech:"radial",   year:1968, cost:260, grip:4,  comfort:4 },
  { id:"perf", name:"Performance Radial", tech:"perftyre", year:1974, cost:520, grip:12, comfort:2 },
  { id:"semi", name:"Semi-Slick",         tech:"perftyre", year:1990, cost:900, grip:20, comfort:-8 },
];

// ── INTERIOR ──
const INTERIORS = [
  { id:"bare",  name:"Bare Metal & Vinyl Bench", tech:"basicint",    year:1950, cost:180,  comfort:-8, looks:-4, rel:2 },
  { id:"basic", name:"Basic Cloth Trim",         tech:"basicint",    year:1950, cost:380,  comfort:0,  looks:0 },
  { id:"vinyli",name:"Flamed Vinyl & Chrome",    tech:"vinyl",       year:1955, cost:520,  comfort:1,  looks:6 },
  { id:"comf",  name:"Comfort Cloth Cabin",      tech:"clothint",    year:1965, cost:760,  comfort:6,  looks:2 },
  { id:"leath", name:"Leather Executive",        tech:"leather",     year:1970, cost:1900, comfort:14, looks:10 },
  { id:"nappa", name:"Nappa Leather + Wood",     tech:"leather",     year:1990, cost:3600, comfort:20, looks:15 },
  { id:"digic", name:"Digital Cockpit",          tech:"digicluster", year:1992, cost:2200, comfort:10, looks:12 },
  { id:"luxdig",name:"Luxury Digital Lounge",    tech:"digicluster", year:2012, cost:5200, comfort:24, looks:20 },
];

// ── ELECTRONICS ──
const ELECTRONICS = [
  { id:"norad",   name:"No Electronics",           tech:null,         year:1950, cost:0,    comfort:0,  looks:0,  safety:0 },
  { id:"radio",   name:"AM Radio",                 tech:"radiomanual",year:1953, cost:140,  comfort:3,  looks:1 },
  { id:"cass",    name:"Cassette Stereo",          tech:"radiomanual",year:1973, cost:260,  comfort:5,  looks:2 },
  { id:"cdp",     name:"CD Player",                tech:"radiomanual",year:1985, cost:380,  comfort:6,  looks:3 },
  { id:"pw",      name:"Power Windows/Locks",      tech:"powerwin",   year:1960, cost:420,  comfort:7,  rel:-2 },
  { id:"acunit",  name:"Air Conditioning",         tech:"ac",         year:1958, cost:700,  comfort:10, rel:-2, ecoPen:1.05 },
  { id:"cruiseE", name:"Cruise Control",           tech:"cruise",     year:1965, cost:380,  comfort:6 },
  { id:"navi",    name:"Satellite Navigation",     tech:"digicluster",year:1995, cost:950,  comfort:8,  looks:5 },
  { id:"touch",   name:"Touchscreen Infotainment", tech:"infotain",   year:2008, cost:1400, comfort:12, looks:10 },
  { id:"parkcam", name:"Parking Sensors/Camera",   tech:"autopark",   year:2008, cost:680,  comfort:6,  safety:8 },
  { id:"autodrv", name:"Autonomous Driving Pack",  tech:"autopark",   year:2016, cost:3800, comfort:16, safety:15, looks:10 },
];

// ── SAFETY EQUIPMENT ──
const SAFETY_EQUIP = [
  { id:"none",  name:"Minimal Safety Structure",  tech:null,     year:1950, cost:0,    safety:0 },
  { id:"belts", name:"Seat Belts",                tech:null,     year:1959, cost:90,   safety:10 },
  { id:"crump", name:"Crumple Zones",             tech:"crumple",year:1968, cost:340,  safety:16 },
  { id:"bags1", name:"Front Airbags",             tech:"airbag", year:1987, cost:560,  safety:18 },
  { id:"curt",  name:"Side Curtains + Headrests", tech:"airbag", year:1998, cost:880,  safety:26 },
  { id:"espe",  name:"ESP + Full Airbag Suite",   tech:"esp",    year:2000, cost:1500, safety:36 },
];

// ── EMISSION CONTROL ──
const EMISSIONS = [
  { id:"raw",   name:"None (Raw Exhaust)",     tech:null,      year:1950, cost:0,    ecoPen:1,    legalUntil:1970 },
  { id:"smogc", name:"Smog Pump / PCV",        tech:"smog",    year:1968, cost:210,  ecoPen:1.03, legalUntil:1975 },
  { id:"catc",  name:"Catalytic Converter",    tech:"catconv", year:1975, cost:520,  ecoPen:1.06, legalUntil:2000 },
  { id:"euro4", name:"Euro IV Aftertreatment", tech:"catconv", year:1999, cost:900,  ecoPen:1.02, legalUntil:2015 },
  { id:"euro6", name:"Euro VI + GPF",          tech:"catconv", year:2014, cost:1400, ecoPen:1.0,  legalUntil:2099 },
];

// ── OPTIONS (checkbox extras; unit = added unit cost) ──
const OPTIONS = [
  { id:"spoiler", name:"Sport Spoiler",     cost:340,  unit:18,  looks:5, perf:2, year:1965 },
  { id:"stripes", name:"Racing Stripes",    cost:180,  unit:9,   looks:4, year:1963 },
  { id:"chromep", name:"Chrome Package",    cost:420,  unit:22,  looks:6, year:1950 },
  { id:"sunroof", name:"Sunroof",           cost:900,  unit:45,  comfort:4, looks:4, rel:-1, year:1952 },
  { id:"towpack", name:"Tow Package",       cost:600,  unit:30,  utility:10, perf:-2, year:1955 },
  { id:"roofrack",name:"Roof Rack",         cost:350,  unit:17,  utility:8, looks:-1, year:1958 },
  { id:"ledl",    name:"LED Headlights",    cost:1100, unit:55,  looks:8, safety:4, year:2006 },
  { id:"heated",  name:"Heated Seats",      cost:480,  unit:24,  comfort:6, year:1990 },
  { id:"sportst", name:"Sport Seats",       cost:850,  unit:42,  comfort:3, looks:5, perf:1, year:1970 },
  { id:"premaud", name:"Premium Audio",     cost:1400, unit:70,  comfort:7, looks:3, year:1990 },
];

// ── Factory buildings ──
const BUILDINGS = [
  { id:"assembly", name:"Assembly Plant",  icon:"🏭", baseCost:60000, perLevel:45000, max:8, effect:l=>`+${l*100} cars/mo capacity`, desc:"More halls = more cars built per month." },
  { id:"toolshop", name:"Tool & Die Shop", icon:"🔧", baseCost:50000, perLevel:40000, max:6, effect:l=>`-${l*4}% unit build cost`,   desc:"Precision tooling cuts build costs." },
  { id:"lab",      name:"R&D Laboratory",  icon:"🧪", baseCost:45000, perLevel:38000, max:6, effect:l=>`+${l*25}% research speed`,   desc:"Speeds up technology research." },
  { id:"showroom", name:"Marketing Dept.", icon:"📣", baseCost:40000, perLevel:35000, max:6, effect:l=>`+${l*8}% sales demand`,      desc:"Ad campaigns boost desire for your cars." },
  { id:"qc",       name:"Quality Control", icon:"✅", baseCost:38000, perLevel:32000, max:6, effect:l=>`+${l*3} effective reliability`, desc:"Fewer defects, happier owners." },
  { id:"warehouse",name:"Warehouse",       icon:"📦", baseCost:25000, perLevel:20000, max:6, effect:l=>`+${l*500} stock capacity`,   desc:"Store more finished cars." },
];

// ── Staff roles ──
const STAFF_ROLES = [
  { id:"designer",   name:"Designer",   icon:"✏️", salaryMul:1,   benefit:"Improves design quality & speeds designs." },
  { id:"engineer",   name:"Engineer",   icon:"🔧", salaryMul:1.1, benefit:"Boosts reliability & performance of designs." },
  { id:"researcher", name:"Researcher", icon:"🔬", salaryMul:1.2, benefit:"Increases research progress per month." },
  { id:"manager",    name:"Manager",    icon:"📋", salaryMul:1.3, benefit:"Raises factory output efficiency." },
  { id:"marketer",   name:"Marketer",   icon:"📣", salaryMul:.9,  benefit:"Increases sales demand & reputation gain." },
];

// ═══════════ DEEP-PART LIBRARY — hundreds of granular engine components (CCT-style) ═══════════
// Each part is a real engineering component with physical effects on the Designer simulation:
// power multiplier, torque shape, reliability delta, fuel-consumption delta, noise, mass, unit cost,
// and either a tech-gate or an availability year.

// ── Crankshafts (per cylinder count 2–16; forged billet cranks at every size) ──
const CRANKSHAFTS = [];
for(const cy of [2,3,4,5,6,8,10,12,16]){
  CRANKSHAFTS.push({ id:"cs"+cy, cyls:cy, name:(cy>=10?"Billet "+cy+"-Cyl":"Forged "+cy+"-Cyl")+" Crankshaft",
    year:1950, revLimit:Math.round(7600-cy*240), relM:3+Math.round(cy/4), massP:Math.round(cy*2.1), cost:Math.round(90+cy*26) });
}
// Lightweight racing crankshafts for 4/6/8/10/12 banks
for(const cy of [4,6,8,10,12]){
  CRANKSHAFTS.push({ id:"csl"+cy, cyls:cy, name:"Lightweight Flat-Crank "+cy+"-Cyl", year:1988, tech:"dohc",
    revLimit:Math.round(9300-cy*260), relM:1, massP:Math.round(cy*1.2)-6, cost:Math.round(420+cy*45) });
}
// Crossplane V8 crank — classic American muscle character
CRANKSHAFTS.push({ id:"cscross", cyls:8, name:"Crossplane V8 Crank", year:1959, revLimit:6600,
  torqueM:1.12, rpmPeakShift:-0.08, relM:4, massP:24, noise:6, cost:380 });

// ── Camshaft profiles (matched to each cylinder count) ──
const CAM_PROFILES = [];
for(const cy of [2,3,4,5,6,8,10,12,16]){
  CAM_PROFILES.push({ id:"cmS"+cy,  cyls:cy, name:"Street Cam "+cy+"-Cyl",     year:1950, revLimit:0,    powerM:1,     ecoM:1,    relM:2,  veAdd:0,     cost:0 });
  CAM_PROFILES.push({ id:"cmT"+cy,  cyls:cy, name:"Touring Grind "+cy+"-Cyl",  year:1965, revLimit:400,  powerM:1.04,  ecoM:.98,  relM:0,  veAdd:.015,  cost:Math.round(110+cy*8) });
  CAM_PROFILES.push({ id:"cmR"+cy,  cyls:cy, name:"Race Cam "+cy+"-Cyl",       year:1975, tech:"dohc", revLimit:1500, powerM:1.09, ecoM:1.06, relM:-4, veAdd:.035, cost:Math.round(300+cy*22), desc:"Top-end power, weak idle" });
  CAM_PROFILES.push({ id:"cmD"+cy,  cyls:cy, name:"Drag Grind "+cy+"-Cyl",     year:1968, tech:"vengine", revLimit:900, powerM:1.05, torqueM:1.08, rpmPeakShift:-0.12, ecoM:1.08, relM:-2, veAdd:.02, cost:Math.round(240+cy*16) });
}

// ── Pistons (alloy families per cylinder count) ──
const PISTON_SETS = [];
for(const cy of [2,3,4,5,6,8,10,12,16]){
  PISTON_SETS.push({ id:"ptF"+cy, cyls:cy, name:"Cast Piston Set ×"+cy,        year:1950, compAdd:0,   relM:3,  massP:cy*1.4,  cost:0 });
  PISTON_SETS.push({ id:"ptA"+cy, cyls:cy, name:"Forged Alloy Pistons ×"+cy,   year:1963, compAdd:.4,  relM:1,  massP:cy*0.9,  revLimit:500, cost:Math.round(140+cy*14) });
  PISTON_SETS.push({ id:"ptH"+cy, cyls:cy, name:"Hypereutectic Set ×"+cy,      year:1983, compAdd:.3,  relM:2,  massP:cy*0.8,  cost:Math.round(90+cy*9) });
  PISTON_SETS.push({ id:"ptC"+cy, cyls:cy, name:"Carbon-Sleeve Pistons ×"+cy,  year:2002, tech:"carbon", compAdd:.6, relM:-1, massP:cy*0.45, revLimit:900, cost:Math.round(600+cy*55) });
}

// ── Connecting rod sets (per cylinder count) ──
const CONROD_SETS = [];
for(const cy of [2,3,4,5,6,8,10,12,16]){
  CONROD_SETS.push({ id:"crC"+cy, cyls:cy, name:"Cast Rod Set ×"+cy,          year:1950, revLimit:0,    relM:0,  massP:cy*1.1, cost:0 });
  CONROD_SETS.push({ id:"crF"+cy, cyls:cy, name:"Forged Rod Set ×"+cy,        year:1960, revLimit:900,  relM:2,  massP:cy*0.9, cost:Math.round(160+cy*16) });
  CONROD_SETS.push({ id:"crP"+cy, cyls:cy, name:"Powder-Metal Rods ×"+cy,     year:1990, tech:"dohc", revLimit:1500, relM:1, massP:cy*0.8, cost:Math.round(300+cy*24) });
  CONROD_SETS.push({ id:"crT"+cy, cyls:cy, name:"Titanium Rods ×"+cy,         year:2000, tech:"carbon", revLimit:2600, relM:-1, massP:cy*0.35, cost:Math.round(900+cy*80) });
}

// ── Cylinder heads (per cylinder count) ──
const CYL_HEADS = [];
for(const cy of [2,3,4,5,6,8,10,12,16]){
  CYL_HEADS.push({ id:"hdI"+cy, cyls:cy, name:"Cast-Iron Head ×"+cy,       year:1950, flowM:1,     compAdd:0,   relM:2,  massP:cy*2.2, cost:0 });
  CYL_HEADS.push({ id:"hdA"+cy, cyls:cy, name:"Alloy Head ×"+cy,           year:1962, flowM:1.05,  compAdd:.3,  relM:0,  massP:cy*1.2, cost:Math.round(130+cy*12) });
  CYL_HEADS.push({ id:"hdM"+cy, cyls:cy, name:"Multi-Valve Alloy Head ×"+cy, year:1985, tech:"dohc", flowM:1.13, compAdd:.5, relM:-1, massP:cy*1.3, revLimit:700, cost:Math.round(320+cy*30) });
  CYL_HEADS.push({ id:"hdP"+cy, cyls:cy, name:"Printed 3D Titanium Head ×"+cy, year:2019, tech:"autotech", flowM:1.2, compAdd:.7, relM:-2, massP:cy*0.7, revLimit:1200, cost:Math.round(1200+cy*90) });
}

// ── Engine blocks (material × cylinder count) ──
const ENGINE_BLOCKS = [];
for(const cy of [2,3,4,5,6,8,10,12,16]){
  ENGINE_BLOCKS.push({ id:"bkI"+cy, cyls:cy, name:"Cast-Iron Block ("+cy+"-cyl)",    year:1950, massP:Math.round(cy*9),   relM:5,  compCap:0,  cost:0 });
  ENGINE_BLOCKS.push({ id:"bkS"+cy, cyls:cy, name:"Stamped-Steel Block ("+cy+")",    year:1955, massP:Math.round(cy*6.5), relM:2,  compCap:0,  cost:Math.round(120+cy*10) });
  ENGINE_BLOCKS.push({ id:"bkA"+cy, cyls:cy, name:"Aluminium Block ("+cy+")",        year:1965, tech:"unibody", massP:Math.round(cy*4.2), relM:-1, compCap:.6, cost:Math.round(420+cy*30) });
  ENGINE_BLOCKS.push({ id:"bkC"+cy, cyls:cy, name:"Ceramic-Matrix Block ("+cy+")",   year:1995, tech:"carbon", massP:Math.round(cy*2.6), relM:-3, compCap:1.2, cost:Math.round(1300+cy*90) });
}

// ── Turbocharger sizing (boost hardware; only usable when aspiration is boosted) ──
const TURBO_SIZING = [
  { id:"tnone", name:"No Turbo Needed",        minDisp:0,    maxDisp:99999, boostBar:0,    lagK:0,   powerM:1,    relM:0,  cost:0,    desc:"Fitment requires forced induction first." },
  { id:"tsmall",name:"Small Frame (low boost)",minDisp:600,  maxDisp:2600,  boostBar:.55,  lagK:.35, powerM:1.14, relM:2,  cost:700,  year:1975, tech:"turbo", desc:"Quick spool, modest gains, reliable." },
  { id:"tmed",  name:"Medium Frame Turbo",     minDisp:1400, maxDisp:5200,  boostBar:.85,  lagK:.55, powerM:1.3,  relM:-3, cost:1100, year:1975, tech:"turbo" },
  { id:"tlarge",name:"Large Frame Turbo",      minDisp:2600, maxDisp:8500,  boostBar:1.25, lagK:.8,  powerM:1.5,  relM:-8, cost:1700, year:1983, tech:"turbo" },
  { id:"ttwin", name:"Twin Sequential Turbos", minDisp:2800, maxDisp:8500,  boostBar:1.5,  lagK:.5,  powerM:1.72, relM:-12,cost:3100, year:1990, tech:"turbo" },
  { id:"telec", name:"Electric Super-Turbo",   minDisp:1200, maxDisp:6500,  boostBar:1.05, lagK:.05, powerM:1.28, relM:-2,cost:3800, year:2016, tech:"autotech", desc:"E-compressor kills turbo lag entirely." },
];

// ── Wastegates & boost controllers ──
const WASTEGATES = [
  { id:"wgint", name:"Internal Wastegate",     year:1978, relM:0,  boostAdj:0,    cost:0,    desc:"Stock, simple, limited control." },
  { id:"wgbos", name:"Blow-Off Valve",         year:1985, relM:-1, boostAdj:.04,  cost:180,  noise:8, desc:"Throttle-up whoosh, tiny boost hold." },
  { id:"wgebc", name:"Electronic Boost Ctrl",  year:2000, tech:"autotech", relM:3, boostAdj:.08, cost:650, desc:"Precise map-tuned boost safety." },
];

// ── Intercoolers (only meaningful with turbo/supercharger) ──
const INTERCOOLERS = [
  { id:"icnone", name:"None (hot intake)",     year:1950, powerM:1,    tempRisk:0,  cost:0 },
  { id:"icair",  name:"Air-to-Air Front Mount",year:1978, powerM:1.07, tempRisk:-4, cost:520, massP:9 },
  { id:"icwat",  name:"Air-to-Water Circuit",  year:1995, powerM:1.11, tempRisk:-8, cost:1150, massP:14 },
  { id:"ich2o",  name:"Charged Water Injection",year:2010,tech:"autotech", powerM:1.14, tempRisk:-12, relM:2, cost:1800, massP:18 },
];

// ── Fuel mixture tuning positions (fine-grained richness slider, 7 steps) ──
const MIXTURE_TUNE = [
  { id:"mx1", name:"Extremely Lean (−18%)", lambda:1.18, powerM:.86,  ecoM:.82,  relM:-14, knockAdd:2.2, tempRisk:10 },
  { id:"mx2", name:"Lean (−10%)",           lambda:1.10, powerM:.93,  ecoM:.88,  relM:-6,  knockAdd:1.4, tempRisk:5 },
  { id:"mx3", name:"Slightly Lean (−4%)",   lambda:1.04, powerM:.97,  ecoM:.94,  relM:-2,  knockAdd:.6,  tempRisk:2 },
  { id:"mx4", name:"Stoichiometric 14.7:1", lambda:1.00, powerM:1,    ecoM:1,    relM:0,   knockAdd:0,   tempRisk:0 },
  { id:"mx5", name:"Slightly Rich (+4%)",   lambda:.96,  powerM:1.03, ecoM:1.06, relM:1,   knockAdd:-.6, tempRisk:-2 },
  { id:"mx6", name:"Rich (+10%)",           lambda:.90,  powerM:1.07, ecoM:1.16, relM:2,   knockAdd:-1.2,tempRisk:-4 },
  { id:"mx7", name:"Very Rich (+18%)",      lambda:.82,  powerM:1.10, ecoM:1.32, relM:3,   knockAdd:-2.0,tempRisk:-7, desc:"Power now, plugs fouled later" },
];

// ── Rev-limit governor settings ──
const REV_GOVERNORS = [
  { id:"rg50", name:"Factory Limiter @5,000", rpm:5000, relM:4,  cost:0 },
  { id:"rg55", name:"Governor @5,500",        rpm:5500, relM:3,  cost:0 },
  { id:"rg60", name:"Standard @6,000",        rpm:6000, relM:2,  cost:0 },
  { id:"rg65", name:"Open @6,500",            rpm:6500, relM:1,  cost:40 },
  { id:"rg70", name:"Sport @7,000",           rpm:7000, relM:0,  cost:90 },
  { id:"rg75", name:"High-Rev @7,500",        rpm:7500, relM:-1, cost:160 },
  { id:"rg80", name:"Race @8,000",            rpm:8000, relM:-2, cost:240 },
  { id:"rg85", name:"Apex @8,500",            rpm:8500, relM:-3, cost:330 },
  { id:"rg90", name:"Screamer @9,000",        rpm:9000, relM:-5, cost:450 },
  { id:"rg95", name:"Unlimited @9,500",       rpm:9500, relM:-7, cost:600 },
];

// ── Cooling system fine parts ──
const COOLING_PARTS = [
  { id:"clStat",  name:"Standard Thermostat",     year:1950, tempRisk:0,  relM:0,  cost:0 },
  { id:"clLow",   name:"Lower-Temp Thermostat",   year:1965, tempRisk:-3, relM:1,  cost:60,  powerM:1.01 },
  { id:"clBig",   name:"Oversized Aluminium Rad", year:1972, tempRisk:-6, relM:2,  cost:240, massP:4 },
  { id:"clFan",   name:"Electric Fan Pack",       year:1985, tempRisk:-8, relM:3,  cost:380, massP:5 },
  { id:"clDual",  name:"Dual Radiator Loop",      year:1990, tech:"turbo", tempRisk:-14, relM:5, cost:780, massP:16, revLimit:600 },
  { id:"clOil",   name:"Dedicated Oil Cooler",    year:1965, tempRisk:-5, relM:4,  cost:260, massP:4, revLimit:400 },
  { id:"clMis",   name:"Mismatched Cheap Parts",  year:1950, tempRisk:12, relM:-8, cost:-120, desc:"Saves money… cooks engines" },
];

// ── Exhaust back-pressure routing (manifold → pipe → cat/muffler paths) ──
const EXHAUST_ROUTING = [
  { id:"exLog",  name:"Long-Path Restrictive",   year:1950, powerM:.90, ecoM:.97, noise:-6, backPressure:.45, cost:0 },
  { id:"exStk",  name:"Stock Single Pipe",       year:1950, powerM:1,   ecoM:1,   noise:0,  backPressure:.28, cost:0 },
  { id:"exHdr",  name:"4-2-1 Header Merge",      year:1968, powerM:1.05,ecoM:.97, noise:4,  backPressure:.16, cost:320 },
  { id:"exTri",  name:"Tri-Y Race Headers",      year:1975, tech:"vengine", powerM:1.08, ecoM:.95, noise:7, backPressure:.10, cost:640 },
  { id:"exInch", name:"Full Straight-Through",   year:1985, powerM:1.11, ecoM:1.04,noise:12, backPressure:.05, cost:520, legality:-1 },
  { id:"exTi",   name:"Titanium Race System",    year:1998, tech:"carbon", powerM:1.13, ecoM:1.02, noise:14, backPressure:.03, massP:-11, cost:1400, legality:-1 },
];

// ── Catalytic converter paths (emissions legality hardware) ──
const CAT_PATHS = [
  { id:"ctRaw",   name:"No Catalyst (raw pipes)",   year:1950, ecoPen:1,      legality:0,  powerM:1.02, cost:0,    legalUntil:1970 },
  { id:"ctSmog",  name:"Smog Pump / Air Injection", year:1967, ecoPen:1.05,   legality:1,  powerM:.98,  cost:180,  legalUntil:1976, tech:"smog" },
  { id:"ctOxi",   name:"Oxidising Converter",       year:1975, ecoPen:1.08,   legality:2,  powerM:.96,  cost:340,  legalUntil:1982, tech:"catconv" },
  { id:"ctThree", name:"3-Way Closed-Loop Cat",     year:1981, ecoPen:1.06,   legality:3,  powerM:.97,  cost:520,  legalUntil:1994, tech:"catconv" },
  { id:"ctDual",  name:"Dual-Bank Cat + Sensors",   year:1994, ecoPen:1.04,   legality:4,  powerM:.95,  cost:820,  legalUntil:2005, tech:"catconv" },
  { id:"ctPart",  name:"Particulate + NOx Trap",    year:2005, ecoPen:1.03,   legality:5,  powerM:.94,  cost:1250, legalUntil:2018, tech:"autotech" },
  { id:"ctZero",  name:"Euro-6 Clean-Combustion",   year:2016, ecoPen:1.02,   legality:6,  powerM:.93,  cost:1800, legalUntil:2099, tech:"autotech" },
];

// ── Chassis sub-parts: reinforcement structures & undertrays ──
const CHASSIS_STRUCTURES = [
  { id:"csLad",  name:"Ladder Frame Rails",      year:1950, tech:"ladder",   massP:0,   stiffness:20, safety:6,  cost:0 },
  { id:"csUni",  name:"Stamped Unibody Tub",     year:1950, tech:"unibody",  massP:-40, stiffness:55, safety:12, cost:260 },
  { id:"csSpa",  name:"Spaceframe Tube Cage",    year:1962, tech:"monocoque",massP:-70, stiffness:80, safety:16, cost:900 },
  { id:"csMono", name:"Bonded Aluminium Mono",   year:1994, tech:"monocoque",massP:-95, stiffness:92, safety:18, cost:2100 },
  { id:"csCarb", name:"Carbon Monocoque Tub",    year:1985, tech:"carbon",   massP:-150,stiffness:100,safety:14, cost:6200 },
];
const REINFORCEMENTS = [
  { id:"rnStrut", name:"Front Strut-Bar",        year:1970, handlingAdd:3,  massP:4,  cost:90 },
  { id:"rnFoor",  name:"Reinforced Door Rings",  year:1985, safetyAdd:5,    massP:9,  cost:160 },
  { id:"rnRoll",  name:"Integrated Roll Cage",   year:1965, tech:"monocoque", safetyAdd:12, handlingAdd:6, massP:45, comfortAdd:-6, cost:950 },
  { id:"rnSide",  name:"Side-Impact Beams",      year:1990, safetyAdd:8,    massP:12, cost:280 },
  { id:"rnXbrace",name:"Subframe X-Brace",       year:1988, handlingAdd:5,  massP:14, cost:340 },
];
const UNDERTRAYS = [
  { id:"utNone", name:"Bare Underside",        year:1950, cdDelta:0,     cost:0 },
  { id:"utPanel",name:"Stamped Belly Panels",  year:1979, cdDelta:-.012, cost:140, massP:6 },
  { id:"utDiff", name:"Venturi Diffuser",      year:1988, cdDelta:-.02,  downforceAdd:8, cost:420, massP:4 },
  { id:"utFlat", name:"Full Flat Aero Tray",   year:2005, tech:"windtunnel", cdDelta:-.032, downforceAdd:14, cost:980, massP:9 },
];

// ── Rim dimensions (physical diameter/influence) ──
const RIM_SIZES = [
  { id:"rim13", name:'13" Steel Rims',     year:1950, diam:13, gripAdd:0,  comfortAdd:5,  massP:0,  cost:0 },
  { id:"rim14", name:'14" Steel Rims',     year:1955, diam:14, gripAdd:1,  comfortAdd:3,  massP:2,  cost:60 },
  { id:"rim15", name:'15" Alloy Wheels',   year:1968, diam:15, gripAdd:2,  comfortAdd:1,  massP:1,  cost:180 },
  { id:"rim16", name:'16" Alloys',         year:1978, diam:16, gripAdd:3,  comfortAdd:-1, massP:3,  cost:280 },
  { id:"rim17", name:'17" Forged Alloys',  year:1988, diam:17, gripAdd:4,  comfortAdd:-3, massP:4,  cost:520 },
  { id:"rim18", name:'18" Flow-Forged',    year:1998, diam:18, gripAdd:5,  comfortAdd:-5, massP:6,  cost:850 },
  { id:"rim19", name:'19" Ultra-Light',    year:2006, diam:19, gripAdd:6,  comfortAdd:-7, massP:7,  cost:1300 },
  { id:"rim20", name:'20" Carbon-Shell',   year:2012, tech:"carbon", diam:20, gripAdd:7, comfortAdd:-9, massP:5, cost:2400 },
  { id:"rim21", name:'21" Mega Forged',    year:2016, tech:"carbon", diam:21, gripAdd:8, comfortAdd:-12, massP:8, cost:3200 },
];

// ── Brake disc materials & layouts ──
const BRAKE_LAYOUTS = [
  { id:"blDDD", name:"Drums All Round",        year:1950, tech:"drumbrake", stopQ:18, fade:14, massP:0,  cost:0 },
  { id:"blFDD", name:"Front Discs / Rear Drums",year:1962, tech:"discbrake", stopQ:42, fade:8,  massP:8,  cost:240 },
  { id:"blFSD", name:"Vented Front Discs",     year:1972, tech:"discbrake", stopQ:52, fade:5,  massP:11, cost:420 },
  { id:"blADD", name:"Discs All Round",        year:1978, tech:"discbrake", stopQ:62, fade:4,  massP:16, cost:620 },
  { id:"blABD", name:"ABS Vented All-Disc",    year:1987, tech:"abs",       stopQ:76, fade:2,  massP:20, cost:1100 },
  { id:"blCER", name:"Carbon-Ceramic Big Stop",year:2002, tech:"carbon",    stopQ:92, fade:0,  massP:12, cost:3400 },
  { id:"blCAR", name:"Carbon Race Calipers",   year:2008, tech:"carbon",    stopQ:97, fade:-2, massP:8,  cost:5200 },
];

// ── Tyre compound classifications ──
const TYRE_COMPOUNDS = [
  { id:"tcBia", name:"Bias-Ply Touring",      year:1950, tech:"biasply",   grip:14, wear:1.0,  comfort:10, rolling:.34, cost:0 },
  { id:"tcRad", name:"Radial All-Season",     year:1968, tech:"radial",    grip:26, wear:1.05, comfort:14, rolling:.28, cost:160 },
  { id:"tcGT",  name:"Grand-Touring Radials", year:1978, tech:"radial",    grip:34, wear:1.1,  comfort:16, rolling:.26, cost:280 },
  { id:"tcPer", name:"Performance Sport",     year:1972, tech:"perftyre",  grip:48, wear:.8,   comfort:8,  rolling:.24, cost:520 },
  { id:"tcUlp", name:"Ultra-High-Performance",year:1995, tech:"perftyre",  grip:60, wear:.6,   comfort:4,  rolling:.22, cost:880 },
  { id:"tcSem", name:"Semi-Slick Track",      year:1998, tech:"perftyre",  grip:76, wear:.35,  comfort:-4, rolling:.2,  cost:1400, legalityNoise:12 },
  { id:"tcSli", name:"Full Slick Racing",     year:1965, tech:"perftyre",  grip:88, wear:.15,  comfort:-10,rolling:.18, cost:2200, legality:0, wetGrip:8, desc:"Illegal on roads, devastating on track" },
  { id:"tcAll", name:"All-Terrain Knobbies",  year:1975, tech:"radial",    grip:30, wear:1.2,  comfort:6,  rolling:.36, cost:340, offroad:22 },
  { id:"tcWin", name:"Winter Friction Compound",year:1990,tech:"radial",    grip:38, wear:1.0,  comfort:12, rolling:.3,  cost:420, snow:25 },
];

// ── Suspension damper & spring fine parts ──
const SUSP_PARTS = [
  { id:"spLeaf", name:"Transverse Leaf Springs", year:1950, tech:"liveaxle",  comfort:8,  handling:14, massP:0,  cost:0 },
  { id:"spCoil", name:"Coil-Over Standard",      year:1958, tech:"macpherson",comfort:16, handling:26, massP:4,  cost:220 },
  { id:"spMcP",  name:"MacPherson Struts",       year:1950, tech:"macpherson",comfort:18, handling:34, massP:2,  cost:300 },
  { id:"spMult", name:"Double-Wishbone Multi-Link",year:1968,tech:"multilink", comfort:20, handling:52, massP:12, cost:780 },
  { id:"spRace", name:"Race Coilovers (adjustable)",year:1978,tech:"multilink",comfort:6,  handling:66, massP:8,  cost:1250, tuneRange:20 },
  { id:"spAir",  name:"Adaptive Air Suspension", year:1989, tech:"airshock",  comfort:34, handling:44, massP:18, cost:1900 },
  { id:"spMag",  name:"Magnetic Dampers",        year:1997, tech:"airshock",  comfort:30, handling:60, massP:14, cost:2800 },
];

// ── Transmission gear-count ladder (type × gears) ──
const TRANS_GEARS = [
  // manuals
  { id:"g_m3", type:"Manual", gears:3, year:1950, tech:"manual3",   eff:.96, shift:.5,  relM:4,  cost:380,  massP:45 },
  { id:"g_m4", type:"Manual", gears:4, year:1961, tech:"manual4",   eff:.965,shift:.55, relM:4,  cost:520,  massP:47 },
  { id:"g_m5", type:"Manual", gears:5, year:1977, tech:"manual5",   eff:.97, shift:.6,  relM:4,  cost:640,  massP:50 },
  { id:"g_m6", type:"Manual", gears:6, year:1997, tech:"manual5",   eff:.972,shift:.62, relM:4,  cost:820,  massP:52 },
  { id:"g_m7", type:"Manual", gears:7, year:2012, tech:"auto6",     eff:.974,shift:.65, relM:3,  cost:1150, massP:56 },
  // torque-converter autos
  { id:"g_a2", type:"Auto",   gears:2, year:1950, tech:"auto3",     eff:.88, shift:.9,  relM:-2, cost:720,  massP:60 },
  { id:"g_a3", type:"Auto",   gears:3, year:1954, tech:"auto3",     eff:.89, shift:.9,  relM:-3, cost:900,  massP:62 },
  { id:"g_a4", type:"Auto",   gears:4, year:1968, tech:"auto4",     eff:.9,  shift:.95, relM:-2, cost:1150, massP:64 },
  { id:"g_a5", type:"Auto",   gears:5, year:1996, tech:"auto6",     eff:.91, shift:.95, relM:-1, cost:1600, massP:66 },
  { id:"g_a6", type:"Auto",   gears:6, year:2003, tech:"auto6",     eff:.92, shift:1.0, relM:0,  cost:1900, massP:68 },
  { id:"g_a8", type:"Auto",   gears:8, year:2009, tech:"auto6",     eff:.93, shift:1.0, relM:0,  cost:2400, massP:72 },
  { id:"g_a10",type:"Auto",   gears:10,year:2015, tech:"auto6",     eff:.94, shift:1.05,relM:-1, cost:3100, massP:76 },
  // dual-clutch
  { id:"g_d6", type:"DCT",    gears:6, year:2005, tech:"auto6",     eff:.95, shift:1.6, relM:-3, cost:2600, massP:70 },
  { id:"g_d7", type:"DCT",    gears:7, year:2009, tech:"auto6",     eff:.955,shift:1.7, relM:-4, cost:3200, massP:74 },
  { id:"g_d8", type:"DCT",    gears:8, year:2013, tech:"auto6",     eff:.96, shift:1.8, relM:-4, cost:3900, massP:78 },
  { id:"g_d10",type:"DCT",    gears:10,year:2018, tech:"auto6",     eff:.965,shift:1.9, relM:-3, cost:4600, massP:80 },
  // CVT & single-speed
  { id:"g_cv4",type:"CVT",    gears:8, year:1987, tech:"cvt",       eff:.9,  shift:1.3, relM:-2, cost:1400, massP:58, ecoBonus:.85 },
  { id:"g_cv7",type:"CVT",    gears:12,year:2010, tech:"cvt",       eff:.92, shift:1.4, relM:-2, cost:1900, massP:60, ecoBonus:.82 },
  { id:"g_sg1",type:"Single", gears:1, year:1996, tech:"evdrive",   eff:.97, shift:2.5, relM:10, cost:1100, massP:38, evOnly:true },
  { id:"g_sg2",type:"Two-Spd EV",gears:2,year:2020,tech:"evdrive",  eff:.96, shift:2.2, relM:6,  cost:1800, massP:44, evOnly:true },
];

// ── Differential & axle assemblies ──
const DIFFS_AXLES = [
  { id:"dfOpen", name:"Open Differential",       year:1950, gripAdd:0,  relM:2,  cost:0,    massP:18 },
  { id:"dfLSD",  name:"Limited-Slip Differential",year:1960, gripAdd:8, relM:0,  cost:420,  massP:22 },
  { id:"dfLock", name:"Locking Rear Diff",       year:1972, gripAdd:12, relM:-2, cost:680,  massP:28, offroad:15 },
  { id:"dfTorv", name:"Torque-Vectoring AWD Unit",year:2005,tech:"awd", gripAdd:18, relM:-3, cost:1900, massP:40 },
  { id:"dfeLSD", name:"Electronic Clutch LSD",   year:2010, tech:"autotech", gripAdd:15, relM:-1, cost:1200, massP:26 },
  { id:"axSolid",name:"Solid Live Axle",         year:1950, tech:"liveaxle", durab:14, comfortAdd:-4, cost:0, massP:52 },
  { id:"axIRS",  name:"Independent Rear Susp.",  year:1960, tech:"macpherson", durab:6, comfortAdd:8, cost:520, massP:44 },
  { id:"axIFS",  name:"Independent Front Drive", year:1959, tech:"fwd", durab:5, comfortAdd:6, cost:460, massP:38 },
];

// ── Interior seat layouts & cabin tiers ──
const SEAT_LAYOUTS = [
  { id:"st2",   name:"2-Seat Bucket",        year:1950, seats:2, comfort:2,  sportiness:10, cost:0 },
  { id:"st22",  name:"2+2 Occasional",       year:1955, seats:4, comfort:0,  sportiness:6,  cost:80 },
  { id:"st23",  name:"2+3 Bench Front",      year:1950, seats:5, comfort:4,  sportiness:-2, cost:60 },
  { id:"st2pp", name:"2+Plus Fold-Out Jump", year:1965, seats:4, comfort:1,  sportiness:2,  cost:140 },
  { id:"st3",   name:"3-Row Family Captain", year:1990, seats:7, comfort:8,  sportiness:-6, cost:320 },
  { id:"st4",   name:"4-Seat Executive Lounge",year:1980,seats:4, comfort:14, sportiness:-4, cost:680 },
];
const CABIN_TIERS = [
  { id:"cbBas", name:"Hard Plastic Basic",   year:1950, comfort:4,  looks:2,  noiseInsul:2,  relM:2, cost:0 },
  { id:"cbClo", name:"Cloth Trim Mid",       year:1955, comfort:10, looks:6,  noiseInsul:5,  relM:1, cost:180 },
  { id:"cbVin", name:"Vinyl & Chrome Fifties",year:1957,comfort:8,  looks:14, noiseInsul:4,  relM:-1,cost:260 },
  { id:"cbLth", name:"Full Leather Appointed",year:1965, comfort:18, looks:16, noiseInsul:9,  relM:0, cost:620 },
  { id:"cbNap", name:"Nappa Hide + Wood",    year:1985, comfort:24, looks:22, noiseInsul:12, relM:0, cost:1400 },
  { id:"cbAlc", name:"Alcantara Sport Cabin",year:2005, comfort:16, looks:26, noiseInsul:8,  relM:1, cost:1800 },
  { id:"cbRec", name:"Recycled Vegan Luxury",year:2020, comfort:20, looks:20, noiseInsul:11, relM:2, cost:1500 },
];

// ── Dashboard technology levels ──
const DASH_TECH = [
  { id:"dsAna", name:"Analogue Dials",           year:1950, comfort:0, looks:0,  relM:2,  cost:0 },
  { id:"dsRad", name:"Radio Stack Delete",       year:1950, comfort:0, looks:-2, relM:0,  cost:0 },
  { id:"dsCas", name:"Cassette Deck",            year:1972, comfort:4, looks:2,  relM:-1, cost:120, tech:"radiomanual" },
  { id:"dsCD",  name:"CD Changer",               year:1990, comfort:6, looks:3,  relM:-1, cost:220, tech:"digicluster" },
  { id:"dsNav", name:"GPS Navigation Screen",    year:1998, comfort:10,looks:8,  relM:-2, cost:650, tech:"infotain" },
  { id:"dsDig", name:"Digital Cluster HUD",      year:2008, comfort:8, looks:12, relM:-2, cost:900, tech:"digicluster" },
  { id:"dsOTA", name:"Connected OTA Infotainment",year:2016,comfort:12,looks:14, relM:-3, cost:1300, tech:"autotech" },
];

// ── Sound-deadening & NVH packages ──
const NVH_PACKS = [
  { id:"nv0", name:"Bare Metal (loud!)",     year:1950, comfortAdd:-6, noiseLevel:14, massP:0,  cost:0 },
  { id:"nv1", name:"Basic Mats",             year:1955, comfortAdd:2,  noiseLevel:6,  massP:12, cost:80 },
  { id:"nv2", name:"Full Deadening Package", year:1970, comfortAdd:7,  noiseLevel:0,  massP:26, cost:240 },
  { id:"nv3", name:"Acoustic Laminated Glass",year:1995,comfortAdd:9,  noiseLevel:-3, massP:18, cost:520 },
  { id:"nv4", name:"Active Noise Cancelling",year:2012, comfortAdd:12, noiseLevel:-8, massP:6,  cost:880, tech:"autotech" },
];

// ── Lighting systems ──
const LIGHTING = [
  { id:"ltSe", name:"Sealed-Beam Halogen",  year:1950, safetyAdd:2,  looksAdd:0,  cost:0 },
  { id:"ltHa", name:"Twin Reflector Halogen",year:1970,safetyAdd:5,  looksAdd:2,  cost:90 },
  { id:"ltHID",name:"Xenon Projectors",     year:1996, safetyAdd:9,  looksAdd:6,  cost:380, tech:"infotain" },
  { id:"ltLed",name:"Full LED Signature",   year:2010, safetyAdd:11, looksAdd:12, cost:640, tech:"infotain" },
  { id:"ltMat",name:"Matrix Adaptive LEDs", year:2018, safetyAdd:15, looksAdd:16, cost:1200, tech:"autotech" },
];

// ── Glass package ──
const GLASS_PACKS = [
  { id:"glPl", name:"Plain Rolled Glass",     year:1950, comfort:0, safetyAdd:0,  weightP:0,  cost:0 },
  { id:"glLa", name:"Laminated Windscreen",   year:1965, comfort:2, safetyAdd:4,  weightP:6,  cost:120 },
  { id:"glAc", name:"Acoustic Laminated Set", year:1998, comfort:6, safetyAdd:5,  weightP:12, cost:420 },
  { id:"glPa", name:"Panoramic Tinted Roof",  year:2008, comfort:4, safetyAdd:1,  weightP:18, cost:780, looksAdd:8 },
];

// ── Aerodynamic devices ──
const AERO_DEVICES = [
  { id:"aeNo", name:"No Aero Devices",       year:1950, cdDelta:0,     downforce:0,  lift:0,  cost:0 },
  { id:"aeSp", name:"Decklid Spoiler",       year:1968, cdDelta:-.008, downforce:6,  cost:180 },
  { id:"aeLi", name:"Front Lip Splitter",    year:1978, cdDelta:-.012, downforce:9,  cost:260 },
  { id:"aeDi", name:"Rear Diffuser",         year:1988, cdDelta:-.02,  downforce:16, cost:420 },
  { id:"aeWs", name:"Adjustable Race Wing",  year:1995, tech:"windtunnel", cdDelta:.01, downforce:38, cost:900, topSpeedCut:8 },
  { id:"aeAct",name:"Active Aero Flaps",     year:2010, tech:"autotech", cdDelta:-.03, downforce:22, cost:1600 },
];

// ── Safety systems ladder (NCAP-oriented) ──
const SAFETY_SYSTEMS = [
  { id:"sfNo",  name:"None (period steel)",   year:1950, ncap:0,  safetyAdd:0,  cost:0 },
  { id:"sfBe",  name:"3-Point Belts",         year:1959, ncap:1,  safetyAdd:8,  cost:60 },
  { id:"sfHe",  name:"Headrests + Elum. Zones",year:1968,ncap:2,  safetyAdd:12, cost:140, tech:"crumple" },
  { id:"sfAb",  name:"Driver Airbag",         year:1985, ncap:3,  safetyAdd:18, cost:320, tech:"airbag" },
  { id:"sfAa",  name:"Dual Airbags + ABS",    year:1992, ncap:4,  safetyAdd:26, cost:680, tech:"airbag" },
  { id:"sfCu",  name:"Curtain Airbags + ESP", year:1999, ncap:5,  safetyAdd:34, cost:1100, tech:"esp" },
  { id:"sfAe",  name:"AEB + Lane Keep Assist",year:2014, ncap:6,  safetyAdd:44, cost:1700, tech:"autotech" },
  { id:"sfAd",  name:"Autonomous Emergency Stack",year:2020,ncap:7,safetyAdd:52, cost:2600, tech:"autotech" },
];

// ── Driver-assist suite ──
const ASSIST_SUITES = [
  { id:"asNo", name:"No Assistance",              year:1950, comfort:0, safetyAdd:0,  priceTag:0 },
  { id:"asCr", name:"Cruise Control",             year:1958, comfort:5, safetyAdd:2,  priceTag:180, tech:"cruise" },
  { id:"asSe", name:"Adaptive Cruise + Radar",    year:2005, comfort:9, safetyAdd:8,  priceTag:780, tech:"autotech" },
  { id:"asPk", name:"Auto Park + 360 Cameras",    year:2012, comfort:11,safetyAdd:10, priceTag:1100, tech:"autopark" },
  { id:"asL3", name:"Conditional Autonomy L3",    year:2021, comfort:16,safetyAdd:16, priceTag:2600, tech:"autotech" },
];

// ── Emissions aftertreatment paths (regulatory hardware) ──
const EMISSION_PATHS = [
  { id:"epNo", name:"Straight Pipes",        year:1950, clean:0, ecoPen:1,    legalityTier:0, cost:0 },
  { id:"epSm", name:"Smog Reactor",          year:1967, clean:1, ecoPen:1.05, legalityTier:1, cost:200, tech:"smog" },
  { id:"epO2", name:"Single O2 Sensor + Cat",year:1981, clean:2, ecoPen:1.06, legalityTier:2, cost:520, tech:"catconv" },
  { id:"epDl", name:"Dual-Bank Cat Setup",   year:1994, clean:3, ecoPen:1.05, legalityTier:3, cost:880, tech:"catconv" },
  { id:"epPt", name:"Diesel Particulate Trap",year:2005,clean:4, ecoPen:1.04, legalityTier:4, cost:1250, tech:"autotech" },
  { id:"epZev",name:"Zero-Emission Certified",year:2016,clean:6, ecoPen:1.02, legalityTier:5, cost:1900, tech:"autotech" },
];

// helper lookups used across designer/UI
function partById(arr,id){ return arr.find(x=>x.id===id)||null; }
function camsForCyls(n){ return CAM_PROFILES.filter(c=>c.cyls===n); }
function cranksForCyls(n){ return CRANKSHAFTS.filter(c=>c.cyls===n); }
function pistonsForCyls(n){ return PISTON_SETS.filter(p=>p.cyls===n); }
function rodsForCyls(n){ return CONROD_SETS.filter(r=>r.cyls===n); }
function headsForCyls(n){ return CYL_HEADS.filter(h=>h.cyls===n); }
function blocksForCyls(n){ return ENGINE_BLOCKS.filter(b=>b.cyls===n); }
const FIRST_NAMES = ["Alex","Maria","Johan","Priya","Kenji","Sofia","Dmitri","Amara","Liam","Chen","Isabella","Omar","Freya","Diego","Nadia","Tomas","Yuki","Elena","Marcus","Zara","Henrik","Lucia","Oskar","Ingrid","Rafael","Aiko","Pavel","Nia","Viktor","Mei"];
const LAST_NAMES = ["Ford","Ferrari","Mueller","Tanaka","Rossi","Jensen","Petrov","Dubois","Kim","Silva","Novak","Haddad","Larsen","Costa","Weber","Ito","Kowalski","Nguyen","Berg","Moretti","Varga","Ali","Lindqvist","Santos","Fischer","Park","Romanov","Okafor","Yamada","Beaumont"];

// ── Competitor names ──
const COMP_NAMES = ["Velmore","Kraxler","Auburn Motors","Nordwind","Castellano","Delta Works","Hartline","Mitsuyama","Rockford & Sons","Belavit","Steyric","Corsini","Everest Auto","Lumen Motors","Falconcrest","Jade Dragon Auto"];

// ── Random events ──
const EVENTS = [
  { id:"boom",     txt:"💹 Economic boom! Consumer spending is up.", type:"good", apply:s=>{s.econMod=1.25; s.econTimer=6;} },
  { id:"recession",txt:"📉 Recession hits — buyers tighten wallets.", type:"bad",  apply:s=>{s.econMod=.72; s.econTimer=8;} },
  { id:"oil",      txt:"⛽ Oil crisis! Fuel prices skyrocket.",       type:"bad",  apply:s=>{s.oilCrisis=s.absMonth+24;} },
  { id:"strike",   txt:"🛠️ Workers strike! Output halved this month.",type:"bad",  apply:s=>{s.strikeTimer=1;} },
  { id:"press",    txt:"⭐ Press praises your engineering. Reputation up!", type:"good", apply:s=>{s.rep=Math.min(100,s.rep+3);} },
  { id:"tax",      txt:"🏛️ New corporate tax — $25,000 due.",        type:"bad",  apply:s=>{s.money-=25000;} },
  { id:"grant",    txt:"🎁 Government grant: $30,000 for jobs created!", type:"good", apply:s=>{s.money+=30000;} },
];
const TREND_EVENTS = [
  { seg:"sports",   txt:"🏎️ Sports cars are trending in the magazines!" },
  { seg:"family",   txt:"👨‍👩‍👧 Baby boom — family cars are hot sellers!" },
  { seg:"luxury",   txt:"💎 The rich are flaunting luxury coupes this season!" },
  { seg:"economy",  txt:"💵 Frugality chic: economy cars fly off lots!" },
  { seg:"suv",      txt:"🛻 Crossover craze! SUV demand surges!" },
  { seg:"ev",       txt:"🔋 Green living is fashionable — EVs in demand!" },
];

// ── Awards (given each January) ──
const AWARD_TYPES = [
  { name:"Best Budget Car", seg:"budget" },
  { name:"Best Economy Car", seg:"economy" },
  { name:"Golden Family Sedan", seg:"family" },
  { name:"Sports Car of the Year", seg:"sports" },
  { name:"Luxury Excellence Award", seg:"luxury" },
  { name:"Utility Vehicle Trophy", seg:"suv" },
  { name:"Ultimate Supercar Cup", seg:"supercar" },
  { name:"Green Drive Prize", seg:"ev" },
];

// ── Objectives (tutorial-style goals like CCT) ──
const OBJECTIVES = [
  { id:"o1", txt:"Design and publish your first car", rew:5000, check:s=>s.models.some(m=>m.published) },
  { id:"o2", txt:"Assign a production line to a model", rew:5000, check:s=>s.lines.some(l=>l.modelId) },
  { id:"o3", txt:"Sell 100 cars total", rew:10000, check:s=>s.totalSold>=100 },
  { id:"o4", txt:"Reach 10 reputation", rew:12000, check:s=>s.rep>=10 },
  { id:"o5", txt:"Complete your first research project", rew:10000, check:s=>Object.keys(s.techs).length>4 },
  { id:"o6", txt:"Hire your first employee", rew:6000, check:s=>s.staff.length>=1 },
  { id:"o7", txt:"Own 3 published models", rew:15000, check:s=>s.models.filter(m=>m.published).length>=3 },
  { id:"o8", txt:"Have 3 production lines running", rew:20000, check:s=>s.lines.filter(l=>l.modelId).length>=3 },
  { id:"o9", txt:"Sell 5,000 cars total", rew:50000, check:s=>s.totalSold>=5000 },
  { id:"o10",txt:"Win an industry award", rew:25000, check:s=>s.awards.length>=1 },
  { id:"o11",txt:"Reach 50 reputation", rew:60000, check:s=>s.rep>=50 },
  { id:"o12",txt:"Grow company value past $5 million", rew:100000, check:s=>companyValue(s)>=5e6 },
  { id:"o13",txt:"Survive to the year 2000", rew:150000, check:s=>s.year>=2000 },
  { id:"o14",txt:"Sell 100,000 cars total", rew:500000, check:s=>s.totalSold>=100000 },
];

function companyValue(s){
  let v = Math.max(0,s.money);
  v += s.lines.length*40000;
  for(const b in s.buildings){ const bd=BUILDINGS.find(x=>x.id===b); if(bd) v += s.buildings[b]*bd.baseCost*.8; }
  for(const c of s.stock){ const m=s.models.find(mm=>mm.id===c.modelId); if(m) v += c.qty*m.unitCost; }
  for(const m of s.models) if(m.published) v += 20000 + m.salesTotal*8;
  v += Object.keys(s.techs).length*15000;
  return Math.round(v);
}


// ═══ INTERNAL MECHANICAL TUNING (CCT-style sliders & material pickers) ═══
const VALVETRAINS = [
  { id:"sv",  name:"Side Valve (SV)",      tech:null,     year:1950, powerM:.85, relM:6,  ecoM:1.05, cost:0 },
  { id:"ohv", name:"Overhead Valve (OHV)", tech:null,     year:1950, powerM:1,   relM:3,  ecoM:1,    cost:140 },
  { id:"sohc",name:"SOHC Multi-Valve",     tech:"dohc",   year:1970, powerM:1.07,relM:0,  ecoM:.95,  cost:420 },
  { id:"dohc",name:"DOHC 4-Valve/Cyl",     tech:"dohc",   year:1985, powerM:1.14,relM:-2, ecoM:.92,  cost:780 },
  { id:"vvtv",name:"DOHC + Variable Timing",tech:"vvt",   year:1995, powerM:1.2, relM:0,  ecoM:.85,  cost:1250 },
];
const BLOCK_MATERIALS = [
  { id:"iron",   name:"Cast Iron Block",       tech:null,          year:1950, massP:45,  relM:5,  cost:0 },
  { id:"steel",  name:"Stamped Steel Block",   tech:null,          year:1955, massP:25,  relM:2,  cost:180 },
  { id:"alublk", name:"Aluminium Alloy Block", tech:"unibody",     year:1965, massP:-15, relM:-2, cost:640 },
  { id:"compblk",name:"Composite Ceramic-Matrix",tech:"carbon",    year:1995, massP:-30, relM:-4, cost:1900 },
];
const ROD_MATERIALS = [
  { id:"cast",   name:"Cast Steel Rods",     tech:null,     year:1950, revLimit:0,   relM:0,  cost:0 },
  { id:"forged", name:"Forged Steel Rods",   tech:null,     year:1960, revLimit:800, relM:2,  cost:260 },
  { id:"powder", name:"Powder-Metal Rods",   tech:"dohc",   year:1990, revLimit:1400,relM:1,  cost:480 },
  { id:"titan",  name:"Titanium Con-Rods",   tech:"carbon", year:2000, revLimit:2200,relM:-1, cost:1400 },
];
const CRANK_MATERIALS = [
  { id:"steelcrank", name:"Billet Steel Crank", tech:null,    year:1950, revLimit:0,   massP:8,  cost:0 },
  { id:"nodular",    name:"Nodular Iron Crank", tech:null,    year:1970, revLimit:400, massP:0,  cost:150 },
  { id:"lightcrank", name:"Lightweight Forged", tech:"dohc",  year:1988, revLimit:1100,massP:-6, cost:520 },
];
const COOLING_SYS = [
  { id:"thermo", name:"Thermostatic Radiator", tech:null,    year:1950, relM:0,  cost:0 },
  { id:"oilcool",name:"Oil Cooler Added",      tech:null,    year:1965, relM:4,  revLimit:500, cost:220 },
  { id:"duocool",name:"Dual Radiator + Intercooler",tech:"turbo", year:1980, relM:8, revLimit:900, cost:640 },
];
const EXHAUST_SYS = [
  { id:"restricted", name:"Restricted Stock Exhaust", tech:null,   year:1950, powerM:.92, ecoM:.98, noise:-4, cost:0 },
  { id:"free",       name:"Free-Flow Exhaust",        tech:null,   year:1960, powerM:1.04,ecoM:1.02,noise:5,  cost:260 },
  { id:"raceexh",    name:"Race Headers & Titanium Pipes",tech:"carbon",year:1990,powerM:1.09,ecoM:1.04,noise:10,cost:900 },
];
const FUEL_RICHNESS = [ // mixture tuning slider positions
  { id:"lean",  name:"Lean Mixture",  powerM:.93, ecoM:.88, relM:-6 },
  { id:"ideal", name:"Ideal Ratio",   powerM:1,   ecoM:1,   relM:0 },
  { id:"rich",  name:"Rich Mixture",  powerM:1.07,ecoM:1.18,relM:2 },
];
const ENGINE_TUNING = {
  boreMin:72, boreMax:104, strokeMin:60, strokeMax:105,
  revBase:5200, revMaxAdd:{ rod:{ cast:0, forged:800, powder:1400, titan:2200 }, crank:{ steelcrank:0, nodular:400, lightcrank:1100 } },
};
const TRANSMISSION_TYPES = [ // fine-grained gearbox parts (replaces coarse list usage in editor for depth)
  { id:"mt",  name:"Manual Gearbox",      desc:"Robust, cheap, engaging.", relM:4,  comfortM:-2, costM:1 },
  { id:"at",  name:"Torque-Converter Auto",desc:"Convenience best-seller.", relM:-4, comfortM:6,  costM:2.1, ecoM:1.08 },
  { id:"amts",name:"Automated Manual",    desc:"Cheap auto-ish shifting.", relM:-6, comfortM:2,  costM:1.6, ecoM:1.02 },
  { id:"dctt",name:"Dual-Clutch (DCT)",   desc:"Fast shifts, premium.",   relM:-3, comfortM:4,  costM:3.2, ecoM:.95 },
  { id:"cvtg",name:"CVT Belt Drive",      desc:"Smooth & efficient.",     relM:-2, comfortM:7,  costM:2.3, ecoM:.85 },
];

// ═══ REGION FLAVOUR / macro events extra ═══
const MACRO_EVENTS = [
  { id:"envmandate", txt:"🌿 Environmental mandate: raw exhaust cars banned from sale!", minYear:1970, once:true, apply:s=>{ s.envMandate=true; } },
  { id:"evpush",     txt:"⚡ Green subsidy wave: EV segment demand +40% this decade.", minYear:2010, once:true, apply:s=>{ s.evSubsidy=true; } },
  { id:"suvboom",    txt:"🛻 The SUV boom rolls into town — utility vehicles sell themselves.", minYear:1992, once:true, apply:s=>{ s.suvBoom=true; } },
  { id:"gpstime",    txt:"🛰️ GPS navigation becomes a consumer must-have.", minYear:1998, once:true, apply:s=>{ s.gpsEra=true; } },
];
