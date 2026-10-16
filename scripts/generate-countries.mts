/**
 * Generates src/data/countries.json — the single source of truth for the
 * countries Dunia counts.
 *
 *   node scripts/generate-countries.mts
 *
 * Continents follow the UN M49 geoscheme (so Türkiye, Cyprus and the
 * Caucasus are in Asia, Russia is in Europe). The Americas are split into
 * North (incl. Central America and the Caribbean) and South.
 *
 * Lists are nested: un193 ⊂ un195 ⊂ all197.
 *   un193  — UN member states
 *   un195  — + UN observer states (Vatican City, Palestine)
 *   all197 — + Kosovo and Taiwan
 */
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const isoCountries = require("i18n-iso-countries");

type Continent =
  | "europe"
  | "asia"
  | "africa"
  | "north-america"
  | "south-america"
  | "oceania";
type Tier = "un193" | "un195" | "all197";

const UN_MEMBERS: Record<Continent, string[]> = {
  europe: "AL AD AT BY BE BA BG HR CZ DK EE FI FR DE GR HU IS IE IT LV LI LT LU MT MD MC ME NL MK NO PL PT RO RU SM RS SK SI ES SE CH UA GB".split(" "),
  asia: "AF AM AZ BH BD BT BN KH CN CY GE IN ID IR IQ IL JP JO KZ KW KG LA LB MY MV MN MM NP KP OM PK PH QA SA SG KR LK SY TJ TH TL TR TM AE UZ VN YE".split(" "),
  africa: "DZ AO BJ BW BF BI CV CM CF TD KM CG CD CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU MA MZ NA NE NG RW ST SN SC SL SO ZA SS SD TZ TG TN UG ZM ZW".split(" "),
  "north-america": "AG BS BB BZ CA CR CU DM DO SV GD GT HT HN JM MX NI PA KN LC VC TT US".split(" "),
  "south-america": "AR BO BR CL CO EC GY PY PE SR UY VE".split(" "),
  oceania: "AU FJ KI MH FM NR NZ PW PG WS SB TO TV VU".split(" "),
};

const EXTRAS: { iso2: string; continent: Continent; tier: Tier }[] = [
  { iso2: "VA", continent: "europe", tier: "un195" },
  { iso2: "PS", continent: "asia", tier: "un195" },
  { iso2: "XK", continent: "europe", tier: "all197" },
  { iso2: "TW", continent: "asia", tier: "all197" },
];

const LOCALES = ["en", "tr"] as const;

// CLDR names are mostly what people say; these are the exceptions.
const NAME_OVERRIDES: Record<string, Partial<Record<(typeof LOCALES)[number], string>>> = {
  PS: { en: "Palestine", tr: "Filistin" },
  CD: { en: "DR Congo", tr: "Kongo Demokratik Cumhuriyeti" },
  CG: { en: "Republic of the Congo", tr: "Kongo Cumhuriyeti" },
  CI: { tr: "Fildişi Sahili" },
  MM: { en: "Myanmar", tr: "Myanmar" },
  CV: { tr: "Yeşil Burun Adaları" },
  TL: { tr: "Doğu Timor" },
  VC: { en: "Saint Vincent and the Grenadines" },
  KN: { en: "Saint Kitts and Nevis" },
  LC: { en: "Saint Lucia" },
};

const EXPECTED = { un193: 193, un195: 195, all197: 197 };

const displayNames = Object.fromEntries(
  LOCALES.map((l) => [l, new Intl.DisplayNames([l], { type: "region" })])
);

function nameFor(iso2: string, locale: (typeof LOCALES)[number]) {
  const override = NAME_OVERRIDES[iso2]?.[locale];
  if (override) return override;
  const name = displayNames[locale].of(iso2);
  if (!name || name === iso2) throw new Error(`No ${locale} name for ${iso2}`);
  return locale === "en" ? name.replace(/ & /g, " and ") : name;
}

const entries = [
  ...Object.entries(UN_MEMBERS).flatMap(([continent, codes]) =>
    codes.map((iso2) => ({ iso2, continent: continent as Continent, tier: "un193" as Tier }))
  ),
  ...EXTRAS,
];

const seen = new Set<string>();
const countries = entries
  .map(({ iso2, continent, tier }) => {
    if (seen.has(iso2)) throw new Error(`Duplicate country: ${iso2}`);
    seen.add(iso2);
    const iso3 = isoCountries.alpha2ToAlpha3(iso2);
    // Kosovo has no official ISO numeric code; "983" is the common user-assigned one.
    const numeric = isoCountries.alpha2ToNumeric(iso2);
    if (!iso3 || !numeric) throw new Error(`Unknown ISO code: ${iso2}`);
    return {
      iso2,
      iso3,
      numeric,
      continent,
      tier,
      name: Object.fromEntries(LOCALES.map((l) => [l, nameFor(iso2, l)])),
    };
  })
  .sort((a, b) => a.name.en.localeCompare(b.name.en, "en"));

const count = (tiers: Tier[]) => countries.filter((c) => tiers.includes(c.tier)).length;
const totals = {
  un193: count(["un193"]),
  un195: count(["un193", "un195"]),
  all197: count(["un193", "un195", "all197"]),
};
for (const [list, n] of Object.entries(totals)) {
  const expected = EXPECTED[list as Tier];
  if (n !== expected) throw new Error(`${list}: expected ${expected}, got ${n}`);
}

writeFileSync(
  new URL("../src/data/countries.json", import.meta.url),
  JSON.stringify(countries, null, 2) + "\n"
);
console.log(`Wrote ${countries.length} countries`, totals);
