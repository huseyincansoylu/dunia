/**
 * Generates src/data/globe.json — what the spinning globe on profiles draws.
 *
 *   node scripts/generate-globe.mts
 *
 * Unlike world-map.json (flat, pre-projected SVG paths), the globe rotates, so it
 * keeps real geometry: the Natural Earth 1:110m TopoJSON, each country tagged with
 * its ISO code. Every counted country also gets a point (its centroid, from 1:50m),
 * used to aim the globe at someone's countries and to draw countries that are too
 * small, or missing, at this scale as dots.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoArea, geoCentroid } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, Geometry } from "geojson";

const require = createRequire(import.meta.url);
const countries: { iso2: string; numeric: string }[] = JSON.parse(
  readFileSync(new URL("../src/data/countries.json", import.meta.url), "utf8")
);
const byNumeric = new Map(countries.map((c) => [c.numeric, c.iso2]));

type Props = { name: string };
// Kosovo has no numeric id in world-atlas, so match it by name.
const isoOf = (id: unknown, name: string) => byNumeric.get(String(id ?? "")) ?? (name === "Kosovo" ? "XK" : null);

/** Countries smaller than this (steradians, about 8,000 km²) get a dot as well as their shape. */
const SMALL_AREA = 2e-4;
// Tuvalu is missing even at 1:50m.
const MANUAL_CENTROIDS: Record<string, [number, number]> = { TV: [179.2, -8.5] };

const topo = structuredClone(require("world-atlas/countries-110m.json"));
const geometries = topo.objects.countries.geometries as { id?: string; properties: Props & { iso2?: string | null } }[];
topo.objects.countries.geometries = geometries
  .filter((g) => g.properties.name !== "Antarctica")
  .map((g) => ({ ...g, id: undefined, properties: { iso2: isoOf(g.id, g.properties.name) } }));
// Land, not countries: what's outside the country list (Greenland, Western Sahara, ...) is drawn but never highlighted.

const shapes110 = feature(topo, topo.objects.countries) as unknown as { features: Feature<Geometry, { iso2: string | null }>[] };
const area110 = new Map(shapes110.features.filter((f) => f.properties.iso2).map((f) => [f.properties.iso2!, geoArea(f)]));

const topo50 = require("world-atlas/countries-50m.json");
const shapes50 = (feature(topo50, topo50.objects.countries) as unknown as { features: Feature<Geometry, Props>[] }).features;

function largestPartCentroid(f: Feature<Geometry>): [number, number] {
  if (f.geometry.type !== "MultiPolygon") return geoCentroid(f);
  const parts = f.geometry.coordinates.map((coordinates) => ({ type: "Polygon" as const, coordinates }));
  return geoCentroid(parts.reduce((a, b) => (geoArea(b) > geoArea(a) ? b : a)));
}

const points = countries.map(({ iso2 }) => {
  const f50 = shapes50.find((f) => isoOf(f.id, f.properties.name) === iso2);
  const lonLat = MANUAL_CENTROIDS[iso2] ?? (f50 && largestPartCentroid(f50));
  if (!lonLat) throw new Error(`No location for ${iso2}`);
  const small = (area110.get(iso2) ?? 0) < SMALL_AREA;
  return [iso2, Math.round(lonLat[0] * 100) / 100, Math.round(lonLat[1] * 100) / 100, small ? 1 : 0] as const;
});

const json = JSON.stringify({ topology: topo, points });
writeFileSync(new URL("../src/data/globe.json", import.meta.url), json + "\n");
console.log(`Wrote globe.json: ${points.length} points (${points.filter((p) => p[3]).length} small), ${(json.length / 1024).toFixed(0)} KB`);
