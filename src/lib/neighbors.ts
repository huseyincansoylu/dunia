import "server-only";
import { neighbors } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { getCountry } from "@/data/countries";
import data from "@/data/globe.json";

type CountryGeometry = { properties?: { iso2?: string | null } };

/**
 * Borders through overseas territories (French Guiana makes France touch Brazil) don't make
 * two countries "close". Neighbours on the same continent always count; across continents,
 * only if the main landmasses' centres are near (Russia and China yes, France and Brazil no).
 */
const MAX_DISTANCE_KM = 4000;
const CENTROIDS = new Map((data.points as unknown as [string, number, number, number][]).map(([iso2, lon, lat]) => [iso2, [lon, lat] as const]));

const sameContinent = (a: string, b: string) => getCountry(a)?.continent === getCountry(b)?.continent;

function distanceKm(a: string, b: string): number {
  const p = CENTROIDS.get(a), q = CENTROIDS.get(b);
  if (!p || !q) return Infinity;
  const rad = Math.PI / 180;
  const dLat = (q[1] - p[1]) * rad, dLon = (q[0] - p[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(p[1] * rad) * Math.cos(q[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/**
 * Land neighbours, from the borders countries share in the globe's 1:110m data.
 * Island nations, and countries too small for that scale, have none.
 */
const NEIGHBORS: ReadonlyMap<string, readonly string[]> = (() => {
  const topology = data.topology as unknown as Topology;
  const collection = topology.objects.countries as GeometryCollection;
  const adjacency = neighbors(collection.geometries);
  const geometries = collection.geometries as unknown as CountryGeometry[];
  const map = new Map<string, string[]>();
  geometries.forEach((g, i) => {
    const iso2 = g.properties?.iso2;
    if (!iso2) return;
    const near = adjacency[i]
      .map((j) => geometries[j].properties?.iso2)
      .filter((c): c is string => !!c && (sameContinent(iso2, c) || distanceKm(iso2, c) <= MAX_DISTANCE_KM));
    map.set(iso2, [...new Set([...(map.get(iso2) ?? []), ...near])]);
  });
  return map;
})();

/**
 * Countries that border the ones someone has been to, that aren't on their map yet.
 * Ranked by how many of their countries they touch, then alphabetically.
 */
export function suggestNearby(visited: readonly string[], exclude: ReadonlySet<string>, limit = 6): string[] {
  const score = new Map<string, number>();
  for (const iso2 of visited) {
    for (const near of NEIGHBORS.get(iso2) ?? []) {
      if (exclude.has(near)) continue;
      score.set(near, (score.get(near) ?? 0) + 1);
    }
  }
  return [...score.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([iso2]) => iso2);
}
