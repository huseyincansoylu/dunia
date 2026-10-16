/**
 * Generates src/data/world-map.json — the world map as ready-to-render SVG
 * paths, so the browser doesn't need d3 or topojson.
 *
 *   node scripts/generate-map.mts
 *
 * Shapes come from Natural Earth 1:110m (small and fast). Countries too small
 * to tap at that scale, or missing from it entirely, also get a dot placed at
 * their centroid from the 1:50m data.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoArea, geoCentroid, geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";

const require = createRequire(import.meta.url);
const countries: { iso2: string; numeric: string; name: { en: string } }[] = JSON.parse(
  readFileSync(new URL("../src/data/countries.json", import.meta.url), "utf8")
);

type Props = { name: string };
function load(resolution: "110m" | "50m") {
  const topo = require(`world-atlas/countries-${resolution}.json`);
  const fc = feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry, Props>;
  return fc.features.filter((f) => f.properties.name !== "Antarctica");
}

// Kosovo has no numeric id in world-atlas, so match it by name.
const idOf = (f: Feature<Geometry, Props>) => (f.id ? String(f.id) : f.properties.name === "Kosovo" ? "983" : undefined);
// Tuvalu is missing even at 1:50m.
const MANUAL_CENTROIDS: Record<string, [number, number]> = { TV: [179.2, -8.5] };

const WIDTH = 1000;
/** Shapes smaller than this (in px² at WIDTH) also get a tappable dot. */
const MIN_AREA = 24;

const shapes110 = load("110m");
const shapes50 = load("50m");
const projection = geoNaturalEarth1().fitWidth(WIDTH, { type: "FeatureCollection", features: shapes110 });
const path = geoPath(projection).digits(1);
const [[, y0], [, y1]] = path.bounds({ type: "FeatureCollection", features: shapes110 });
projection.translate([projection.translate()[0], projection.translate()[1] - y0]);
const height = Math.ceil(y1 - y0);

const byNumeric = new Map(countries.map((c) => [c.numeric, c]));
const shapes: { iso2: string | null; d: string }[] = [];
const drawn = new Set<string>();

for (const f of shapes110) {
  const country = byNumeric.get(idOf(f) ?? "");
  const d = path(f);
  if (!d) continue;
  // Territories we don't count (Greenland, Western Sahara, ...) are drawn as plain land.
  shapes.push({ iso2: country?.iso2 ?? null, d });
  if (country && path.area(f) >= MIN_AREA) drawn.add(country.iso2);
}

const dots: { iso2: string; x: number; y: number }[] = [];
for (const c of countries) {
  if (drawn.has(c.iso2)) continue;
  const f50 = shapes50.find((f) => idOf(f) === c.numeric);
  const lonLat = MANUAL_CENTROIDS[c.iso2] ?? (f50 && largestPartCentroid(f50));
  if (!lonLat) throw new Error(`No location for ${c.iso2} (${c.name.en})`);
  const [x, y] = projection(lonLat)!;
  dots.push({ iso2: c.iso2, x: round(x), y: round(y) });
}

// Archipelagos spread over the ocean: center the dot on the biggest island, not the sea between them.
function largestPartCentroid(f: Feature<Geometry, Props>): [number, number] {
  if (f.geometry.type !== "MultiPolygon") return geoCentroid(f);
  const parts = f.geometry.coordinates.map((coordinates) => ({ type: "Polygon" as const, coordinates }));
  const biggest = parts.reduce((a, b) => (geoArea(b) > geoArea(a) ? b : a));
  return geoCentroid(biggest);
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}

const out = { width: WIDTH, height, shapes, dots };
const json = JSON.stringify(out);
writeFileSync(new URL("../src/data/world-map.json", import.meta.url), json + "\n");
console.log(
  `Wrote ${shapes.length} shapes, ${dots.length} dots (${dots.map((d) => d.iso2).join(" ")}), ${WIDTH}×${height}, ${(json.length / 1024).toFixed(0)} KB`
);
