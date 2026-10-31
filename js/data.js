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
];

// ── ENGINES ──
const ENGINE_LAYOUTS = [
  { id:"i2",  name:"Inline-2",       tech:"ice",     year:1950, mult:.35, mass:-60 },
  { id:"i3",  name:"Inline-3",       tech:"ice",     year:1950, mult:.55, mass:-40 },
  { id:"i4",  name:"Inline-4",       tech:"ice",     year:1950, mult:.8,  mass:-20 },
  { id:"i5",  name:"Inline-5",       tech:"ice",     year:1958, mult:.95, mass:-10 },
  { id:"v6",  name:"V6",             tech:"vengine", year:1950, mult:1.15,mass:0 },
  { id:"v8",  name:"V8",             tech:"vengine", year:1950, mult:1.5, mass:35 },
  { id:"v10", name:"V10",            tech:"vengine", year:1988, mult:1.8, mass:55 },
  { id:"v12", name:"V12",            tech:"vengine", year:1950, mult:2.2, mass:85 },
  { id:"w16", name:"W16 Quad-Turbo", tech:"dohc",    year:1999, mult:3.0, mass:110 },
];
const DISPLACEMENTS = [
  { id:"d08", name:"0.8 L", cc:800 }, { id:"d10", name:"1.0 L", cc:1000 }, { id:"d12", name:"1.2 L", cc:1200 },
  { id:"d14", name:"1.4 L", cc:1400 }, { id:"d16", name:"1.6 L", cc:1600 }, { id:"d18", name:"1.8 L", cc:1800 },
  { id:"d20", name:"2.0 L", cc:2000 }, { id:"d24", name:"2.4 L", cc:2400 }, { id:"d30", name:"3.0 L", cc:3000 },
  { id:"d35", name:"3.5 L", cc:3500 }, { id:"d40", name:"4.0 L", cc:4000 }, { id:"d48", name:"4.8 L", cc:4800 },
  { id:"d55", name:"5.5 L", cc:5500 }, { id:"d65", name:"6.5 L", cc:6500 }, { id:"d80", name:"8.0 L", cc:8000 },
];
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
