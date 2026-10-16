import data from "./countries.json";

/** Regenerate countries.json with `node scripts/generate-countries.mts`. */

export const LOCALES = ["en", "tr"] as const;
export type Locale = (typeof LOCALES)[number];

export const CONTINENTS = [
  "europe",
  "asia",
  "africa",
  "north-america",
  "south-america",
  "oceania",
] as const;
export type Continent = (typeof CONTINENTS)[number];

/**
 * Which countries count toward the total. Lists are nested:
 * un193 ⊂ un195 ⊂ all197, and each country's `tier` is the smallest list it belongs to.
 */
export const COUNTRY_LISTS = ["un193", "un195", "all197"] as const;
export type CountryList = (typeof COUNTRY_LISTS)[number];
export const DEFAULT_LIST: CountryList = "all197";

export type Country = {
  iso2: string;
  iso3: string;
  /** ISO 3166-1 numeric; matches world-atlas feature ids. */
  numeric: string;
  continent: Continent;
  tier: CountryList;
  name: Record<Locale, string>;
};

export const COUNTRIES = data as Country[];

const BY_ISO2 = new Map(COUNTRIES.map((c) => [c.iso2, c]));

export function getCountry(iso2: string): Country | undefined {
  return BY_ISO2.get(iso2.toUpperCase());
}

export function isInList(country: Country, list: CountryList): boolean {
  return COUNTRY_LISTS.indexOf(country.tier) <= COUNTRY_LISTS.indexOf(list);
}

export function countriesInList(list: CountryList): Country[] {
  return COUNTRIES.filter((c) => isInList(c, list));
}

/** "TR" → "🇹🇷" (regional indicator symbols). */
export function flagEmoji(iso2: string): string {
  return String.fromCodePoint(
    ...[...iso2.toUpperCase()].map((ch) => 0x1f1a5 + ch.charCodeAt(0))
  );
}

/** Lowercase, strip accents and fold Turkish dotted/dotless i, so "izlanda" finds "İzlanda". */
export function normalizeForSearch(text: string): string {
  return text
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .toLowerCase()
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

const SEARCH_INDEX = COUNTRIES.map((c) => ({
  country: c,
  terms: [...LOCALES.map((l) => normalizeForSearch(c.name[l])), c.iso2.toLowerCase(), c.iso3.toLowerCase()],
}));

/**
 * Matches names in every locale and ISO codes. Names starting with the query
 * come first, then names containing it; ties are sorted by the locale's name.
 */
export function searchCountries(
  query: string,
  locale: Locale,
  list: CountryList = DEFAULT_LIST
): Country[] {
  const q = normalizeForSearch(query);
  const pool = SEARCH_INDEX.filter(({ country }) => isInList(country, list));
  const byName = (a: Country, b: Country) => a.name[locale].localeCompare(b.name[locale], locale);
  if (!q) return pool.map((e) => e.country).sort(byName);

  const ranked: { country: Country; rank: number }[] = [];
  for (const { country, terms } of pool) {
    if (terms.some((t) => t === q || t.startsWith(q) || t.split(/[\s-]+/).some((w) => w.startsWith(q)))) {
      ranked.push({ country, rank: 0 });
    } else if (terms.some((t) => t.includes(q))) {
      ranked.push({ country, rank: 1 });
    }
  }
  return ranked
    .sort((a, b) => a.rank - b.rank || byName(a.country, b.country))
    .map((r) => r.country);
}

export type VisitStats = {
  visited: number;
  total: number;
  /** Whole percent, rounded down so 196/197 never shows 100%. */
  percent: number;
  continentsVisited: number;
  byContinent: Record<Continent, { visited: number; total: number }>;
};

/** Codes outside the chosen list are ignored, so switching lists never inflates the count. */
export function visitStats(visitedIso2: Iterable<string>, list: CountryList = DEFAULT_LIST): VisitStats {
  const visitedSet = new Set([...visitedIso2].map((c) => c.toUpperCase()));
  const byContinent = Object.fromEntries(
    CONTINENTS.map((c) => [c, { visited: 0, total: 0 }])
  ) as VisitStats["byContinent"];

  let visited = 0;
  for (const country of countriesInList(list)) {
    const bucket = byContinent[country.continent];
    bucket.total++;
    if (visitedSet.has(country.iso2)) {
      bucket.visited++;
      visited++;
    }
  }
  const total = countriesInList(list).length;

  return {
    visited,
    total,
    percent: Math.floor((visited / total) * 100),
    continentsVisited: CONTINENTS.filter((c) => byContinent[c].visited > 0).length,
    byContinent,
  };
}
