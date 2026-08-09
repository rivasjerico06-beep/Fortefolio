/**
 * The yard's inventory.
 *
 * Reads go through the async accessors at the foot of this file rather than
 * touching `UNITS` directly, so pointing the demo at a real rental-management
 * API later changes this file and nothing else. The shapes are what a yard
 * system actually holds — a unit number, a category, a status, and the specs a
 * renter asks about on the phone — not what any one screen happens to render.
 *
 * Rates are deliberately absent. A rental rate depends on term, delivery radius
 * and damage waiver, and a number invented for a demo is worse than no number:
 * every rate is rendered as an em dash beside a line telling you to call. The
 * footer says the same thing.
 */

/** Route root. Lives here rather than in the chrome so a client module can
    reach it without pulling the whole header in with it. */
export const BASE = "/work/usa-equipment";

export type StatusKey = "in-yard" | "on-rent" | "inbound";

export type Status = {
  label: string;
  /** Reads as 11px text, so each clears 4.5:1 on both grounds it lands on. */
  color: string;
  note: string;
};

export const STATUS: Record<StatusKey, Status> = {
  "in-yard": { label: "In yard", color: "var(--ue-in-yard)", note: "Ready for pickup" },
  "on-rent": { label: "On rent", color: "var(--ue-on-rent)", note: "Back —/—" },
  inbound: { label: "Inbound", color: "var(--ue-inbound)", note: "Arriving —/—" },
};

export type Unit = {
  /** The stencil on the machine. Doubles as the URL segment. */
  id: string;
  name: string;
  category: string;
  sub: string;
  status: StatusKey;
  /** How many of this unit the yard holds, when it holds more than one. */
  count?: number;
  specs: readonly { k: string; v: string }[];
};

export const UNITS: readonly Unit[] = [
  /* Light towers ---------------------------------------------------------- */
  {
    id: "LT-2214",
    name: "Allmand Night-Lite Pro II",
    category: "Light Towers",
    sub: "Light tower · 20 ft mast",
    status: "in-yard",
    specs: [
      { k: "Engine", v: "Kubota diesel" },
      { k: "Output", v: "8 kW" },
      { k: "Mast height", v: "20 ft" },
      { k: "Fuel tank", v: "30 gal" },
      { k: "Run time", v: "60 hr" },
      { k: "Weight", v: "2,900 lb" },
      { k: "Towable", v: "Yes" },
    ],
  },
  {
    id: "LT-2208",
    name: "Allmand Maxi-Lite II",
    category: "Light Towers",
    sub: "Light tower · 30 ft mast",
    status: "in-yard",
    specs: [
      { k: "Engine", v: "Kubota diesel" },
      { k: "Output", v: "6 kW" },
      { k: "Mast height", v: "30 ft" },
      { k: "Fuel tank", v: "30 gal" },
      { k: "Run time", v: "66 hr" },
      { k: "Weight", v: "2,750 lb" },
      { k: "Towable", v: "Yes" },
    ],
  },
  {
    id: "LT-3301",
    name: "Allmand Night-Lite V-Series",
    category: "Light Towers",
    sub: "LED light tower · vertical mast",
    status: "inbound",
    specs: [
      { k: "Engine", v: "Kubota diesel" },
      { k: "Output", v: "6 kW" },
      { k: "Lamps", v: "4 × 320 W LED" },
      { k: "Fuel tank", v: "30 gal" },
      { k: "Run time", v: "100 hr" },
      { k: "Weight", v: "2,400 lb" },
      { k: "Towable", v: "Yes" },
    ],
  },

  /* Generators ------------------------------------------------------------ */
  {
    id: "GN-1140",
    name: "Kubota Lowboy GL11000",
    category: "Generators",
    sub: "Towable generator · lowboy",
    status: "in-yard",
    specs: [
      { k: "Engine", v: "Kubota diesel" },
      { k: "Output", v: "11 kW" },
      { k: "Voltage", v: "120 / 240 V" },
      { k: "Fuel tank", v: "17 gal" },
      { k: "Run time", v: "24 hr" },
      { k: "Weight", v: "1,058 lb" },
      { k: "Towable", v: "Yes" },
    ],
  },
  {
    id: "GN-0925",
    name: "Kohler 25REOZT",
    category: "Generators",
    sub: "Towable generator · 25 kW",
    status: "in-yard",
    specs: [
      { k: "Engine", v: "John Deere diesel" },
      { k: "Output", v: "25 kW" },
      { k: "Voltage", v: "120 / 208 / 240 V" },
      { k: "Fuel tank", v: "56 gal" },
      { k: "Run time", v: "31 hr" },
      { k: "Weight", v: "2,180 lb" },
      { k: "Towable", v: "Yes" },
    ],
  },
  {
    id: "GN-2260",
    name: "Kubota GL14000",
    category: "Generators",
    sub: "Towable generator · 14 kW",
    status: "on-rent",
    specs: [
      { k: "Engine", v: "Kubota diesel" },
      { k: "Output", v: "14 kW" },
      { k: "Voltage", v: "120 / 240 V" },
      { k: "Fuel tank", v: "17 gal" },
      { k: "Run time", v: "20 hr" },
      { k: "Weight", v: "1,290 lb" },
      { k: "Towable", v: "Yes" },
    ],
  },
  {
    id: "GN-0418",
    name: "Kohler 48RCL",
    category: "Generators",
    sub: "Standby generator · 48 kW",
    status: "in-yard",
    specs: [
      { k: "Engine", v: "Kohler diesel" },
      { k: "Output", v: "48 kW" },
      { k: "Voltage", v: "120 / 208 V" },
      { k: "Fuel tank", v: "94 gal" },
      { k: "Run time", v: "28 hr" },
      { k: "Weight", v: "3,640 lb" },
      { k: "Towable", v: "Skid mounted" },
    ],
  },

  /* Compaction ------------------------------------------------------------ */
  {
    id: "CM-3301",
    name: "Bomag MPH122 Reclaimer",
    category: "Compaction",
    sub: "Reclaimer / mixer",
    status: "in-yard",
    count: 2,
    specs: [
      { k: "Engine", v: "Deutz diesel" },
      { k: "Working width", v: "86 in" },
      { k: "Cutting depth", v: "20 in" },
      { k: "Fuel tank", v: "106 gal" },
      { k: "Weight", v: "38,600 lb" },
      { k: "Towable", v: "No — lowboy" },
    ],
  },
  {
    id: "CM-1120",
    name: "Bomag BW120AD-5",
    category: "Compaction",
    sub: "Tandem roller · 47 in drum",
    status: "in-yard",
    specs: [
      { k: "Engine", v: "Kubota diesel" },
      { k: "Drum width", v: "47 in" },
      { k: "Centrifugal force", v: "6,070 lbf" },
      { k: "Fuel tank", v: "8 gal" },
      { k: "Weight", v: "5,730 lb" },
      { k: "Towable", v: "Trailered" },
    ],
  },
  {
    id: "CM-0755",
    name: "Bomag BPR 45/55 D",
    category: "Compaction",
    sub: "Reversible plate · 21 in",
    status: "in-yard",
    specs: [
      { k: "Engine", v: "Hatz diesel" },
      { k: "Working width", v: "21 in" },
      { k: "Centrifugal force", v: "10,600 lbf" },
      { k: "Fuel tank", v: "1 gal" },
      { k: "Weight", v: "615 lb" },
      { k: "Towable", v: "No — hand guided" },
    ],
  },
  {
    id: "CM-0212",
    name: "Bomag BT65 Rammer",
    category: "Compaction",
    sub: "Jumping jack · 11 in shoe",
    status: "on-rent",
    specs: [
      { k: "Engine", v: "Honda gas" },
      { k: "Shoe width", v: "11 in" },
      { k: "Percussion rate", v: "700 bpm" },
      { k: "Fuel tank", v: "0.8 gal" },
      { k: "Weight", v: "150 lb" },
      { k: "Towable", v: "No — hand guided" },
    ],
  },

  /* Pressure washers ------------------------------------------------------ */
  {
    id: "PW-0472",
    name: "BE 4000 PSI Hot Water",
    category: "Pressure Washers",
    sub: "Hot water washer · 4000 PSI",
    status: "inbound",
    specs: [
      { k: "Engine", v: "Honda gas" },
      { k: "Output", v: "4,000 PSI" },
      { k: "Flow", v: "4.0 GPM" },
      { k: "Burner", v: "Diesel-fired" },
      { k: "Weight", v: "425 lb" },
      { k: "Towable", v: "Cart mounted" },
    ],
  },
  {
    id: "PW-0318",
    name: "BE 3500 PSI Cold Water",
    category: "Pressure Washers",
    sub: "Cold water washer · 3500 PSI",
    status: "in-yard",
    specs: [
      { k: "Engine", v: "Honda gas" },
      { k: "Output", v: "3,500 PSI" },
      { k: "Flow", v: "4.0 GPM" },
      { k: "Pump", v: "Triplex, belt drive" },
      { k: "Weight", v: "185 lb" },
      { k: "Towable", v: "Cart mounted" },
    ],
  },
  {
    id: "PW-0640",
    name: "BE Whirlaway 24 in",
    category: "Pressure Washers",
    sub: "Surface cleaner attachment",
    status: "in-yard",
    specs: [
      { k: "Type", v: "Attachment" },
      { k: "Cleaning width", v: "24 in" },
      { k: "Max pressure", v: "4,000 PSI" },
      { k: "Max flow", v: "8 GPM" },
      { k: "Weight", v: "44 lb" },
      { k: "Towable", v: "No — attachment" },
    ],
  },

  /* Pumps ----------------------------------------------------------------- */
  {
    id: "PU-0530",
    name: "Koshin 3 in Trash Pump",
    category: "Pumps",
    sub: "Trash pump · 3 in ports",
    status: "in-yard",
    specs: [
      { k: "Engine", v: "Honda gas" },
      { k: "Flow", v: "340 GPM" },
      { k: "Solids handling", v: "1.1 in" },
      { k: "Total head", v: "92 ft" },
      { k: "Weight", v: "134 lb" },
      { k: "Towable", v: "Skid frame" },
    ],
  },
  {
    id: "PU-0210",
    name: "Koshin 2 in Centrifugal",
    category: "Pumps",
    sub: "Dewatering pump · 2 in ports",
    status: "in-yard",
    specs: [
      { k: "Engine", v: "Honda gas" },
      { k: "Flow", v: "185 GPM" },
      { k: "Solids handling", v: "0.2 in" },
      { k: "Total head", v: "105 ft" },
      { k: "Weight", v: "53 lb" },
      { k: "Towable", v: "Carry frame" },
    ],
  },
  {
    id: "PU-0640",
    name: "Koshin 4 in Diaphragm",
    category: "Pumps",
    sub: "Mud pump · 4 in ports",
    status: "on-rent",
    specs: [
      { k: "Engine", v: "Honda gas" },
      { k: "Flow", v: "95 GPM" },
      { k: "Solids handling", v: "1.6 in" },
      { k: "Total head", v: "26 ft" },
      { k: "Weight", v: "220 lb" },
      { k: "Towable", v: "Skid frame" },
    ],
  },

  /* Lift equipment -------------------------------------------------------- */
  {
    id: "LF-0119",
    name: "Niftylift HR12 Boom",
    category: "Lift Equipment",
    sub: "Articulating boom · 41 ft",
    status: "in-yard",
    specs: [
      { k: "Power", v: "Bi-energy" },
      { k: "Working height", v: "41 ft" },
      { k: "Outreach", v: "20 ft" },
      { k: "Platform capacity", v: "440 lb" },
      { k: "Weight", v: "6,900 lb" },
      { k: "Towable", v: "Yes" },
    ],
  },
  {
    id: "LF-0212",
    name: "Niftylift HR15 Boom",
    category: "Lift Equipment",
    sub: "Articulating boom · 50 ft",
    status: "in-yard",
    specs: [
      { k: "Power", v: "Diesel 4×4" },
      { k: "Working height", v: "50 ft" },
      { k: "Outreach", v: "27 ft" },
      { k: "Platform capacity", v: "440 lb" },
      { k: "Weight", v: "9,900 lb" },
      { k: "Towable", v: "No — self propelled" },
    ],
  },
  {
    id: "LF-0330",
    name: "Niftylift SD64 Trailer Boom",
    category: "Lift Equipment",
    sub: "Towable boom · 64 ft",
    status: "inbound",
    specs: [
      { k: "Power", v: "Bi-energy" },
      { k: "Working height", v: "64 ft" },
      { k: "Outreach", v: "31 ft" },
      { k: "Platform capacity", v: "440 lb" },
      { k: "Weight", v: "4,850 lb" },
      { k: "Towable", v: "Yes" },
    ],
  },

  /* Air compressors ------------------------------------------------------- */
  {
    id: "CP-0885",
    name: "Airman PDS185S",
    category: "Air Compressors",
    sub: "Towable compressor · 185 CFM",
    status: "on-rent",
    specs: [
      { k: "Engine", v: "Isuzu diesel" },
      { k: "Output", v: "185 CFM" },
      { k: "Pressure", v: "100 PSI" },
      { k: "Fuel tank", v: "26 gal" },
      { k: "Run time", v: "12 hr" },
      { k: "Weight", v: "2,650 lb" },
      { k: "Towable", v: "Yes" },
    ],
  },
  {
    id: "CP-0400",
    name: "Airman PDS400S",
    category: "Air Compressors",
    sub: "Towable compressor · 400 CFM",
    status: "in-yard",
    specs: [
      { k: "Engine", v: "Isuzu diesel" },
      { k: "Output", v: "400 CFM" },
      { k: "Pressure", v: "100 PSI" },
      { k: "Fuel tank", v: "58 gal" },
      { k: "Run time", v: "10 hr" },
      { k: "Weight", v: "5,290 lb" },
      { k: "Towable", v: "Yes" },
    ],
  },

  /* Mixers ---------------------------------------------------------------- */
  {
    id: "MX-0208",
    name: "TK Portable Mixer",
    category: "Mixers",
    sub: "Concrete mixer · towable",
    status: "on-rent",
    specs: [
      { k: "Engine", v: "Honda gas" },
      { k: "Drum capacity", v: "9 cu ft" },
      { k: "Batch size", v: "6 cu ft" },
      { k: "Weight", v: "760 lb" },
      { k: "Towable", v: "Yes" },
    ],
  },
  {
    id: "MX-0312",
    name: "Oztec Concrete Vibrator",
    category: "Mixers",
    sub: "Flex-shaft vibrator · 2 in head",
    status: "on-rent",
    specs: [
      { k: "Power", v: "Electric, 115 V" },
      { k: "Head diameter", v: "2 in" },
      { k: "Shaft length", v: "14 ft" },
      { k: "Vibrations", v: "10,500 vpm" },
      { k: "Weight", v: "68 lb" },
      { k: "Towable", v: "No — portable" },
    ],
  },
];

/** The categories, in the order the quick-find strip shows them. */
export const CATEGORIES = [
  "Generators",
  "Light Towers",
  "Compaction",
  "Pressure Washers",
  "Pumps",
  "Lift Equipment",
  "Air Compressors",
  "Mixers",
] as const;

export const BRANDS: readonly { name: string; category: string }[] = [
  { name: "Airman / MMD", category: "Air compressors" },
  { name: "Allmand", category: "Light towers" },
  { name: "Allied / Rammer", category: "Hammers" },
  { name: "American Pneumatic", category: "Air tools" },
  { name: "Abbott Rubber", category: "Hose" },
  { name: "Bomag", category: "Compaction" },
  { name: "BE Pressure", category: "Pressure washers" },
  { name: "Billy Goat", category: "Outdoor power" },
  { name: "Diamond Products", category: "Concrete saws" },
  { name: "Koshin", category: "Pumps" },
  { name: "Kohler", category: "Generators" },
  { name: "Kraft Tools", category: "Hand tools" },
  { name: "Kubota", category: "Generators" },
  { name: "Niftylift", category: "Lift equipment" },
  { name: "Oztec", category: "Vibrators" },
];

/* The yard itself -------------------------------------------------------- */

export const YARD = {
  name: "USA Equipment Co.",
  street: "11510 FM 1488 Rd., Ste. 100",
  city: "Magnolia, TX 77354",
  phone: "(281) 789-7664",
  /** Digits only, for tel: and sms: */
  phoneDial: "2817897664",
  fax: "(281) 259-4761",
  hours: [
    { days: "Mon – Fri", time: "7:00 AM – 5:00 PM" },
    { days: "Sat", time: "8:00 AM – 12:00 PM" },
    { days: "Sun", time: "Closed" },
  ],
} as const;

/* Accessors ---------------------------------------------------------------

   Async on purpose. They resolve local data today, but every call site already
   awaits them, so swapping in a fetch to a yard-management API is a change to
   this file alone. */

export async function getUnits() {
  return UNITS;
}

export async function getUnit(id: string) {
  return UNITS.find((unit) => unit.id.toLowerCase() === id.toLowerCase());
}

/** Units a renter tends to take alongside this one. */
export async function getRelated(id: string, limit = 3) {
  const unit = UNITS.find((candidate) => candidate.id === id);
  if (!unit) return [];

  // Same category first — a light tower goes out with another light tower more
  // often than with a concrete vibrator — then whatever else is ready to go.
  const sameCategory = UNITS.filter(
    (candidate) => candidate.id !== id && candidate.category === unit.category,
  );
  const readyElsewhere = UNITS.filter(
    (candidate) =>
      candidate.id !== id &&
      candidate.category !== unit.category &&
      candidate.status === "in-yard",
  );

  return [...sameCategory, ...readyElsewhere].slice(0, limit);
}

export async function getStatusCounts() {
  const counts: Record<StatusKey, number> = { "in-yard": 0, "on-rent": 0, inbound: 0 };
  for (const unit of UNITS) counts[unit.status] += 1;
  return counts;
}

/** How a unit's status reads on a card — "IN YARD (2)" when the yard holds two. */
export function statusLabel(unit: Unit) {
  const base = STATUS[unit.status].label;
  return unit.count && unit.count > 1 ? `${base} (${unit.count})` : base;
}
