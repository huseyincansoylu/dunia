import "server-only";
import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";
import data from "@/data/globe.json";
import { aimAt, DOT_RADIUS, GLOBE_COLORS, GLOBE_RADIUS, type GlobePoint } from "@/lib/globe";

const VIEW = 600;
const topology = data.topology as unknown as Topology;
export const GLOBE_POINTS = data.points as unknown as GlobePoint[];
const countries = (
  feature(topology, topology.objects.countries) as unknown as FeatureCollection<Geometry, { iso2: string | null }>
).features;

/**
 * The globe's first frame as a standalone SVG image, served from /<username>/globe.svg.
 * The canvas in the browser draws the same picture and then spins it.
 */
export function renderGlobeSvg(visited: readonly string[], { glow = false }: { glow?: boolean } = {}): string {
  const visitedSet = new Set(visited);
  const projection = geoOrthographic()
    .scale(VIEW * GLOBE_RADIUS)
    .translate([VIEW / 2, VIEW / 2])
    .rotate(aimAt(visitedSet, GLOBE_POINTS))
    .clipAngle(90);
  const path = geoPath(projection).digits(1);

  const isVisited = (iso2: string | null) => !!iso2 && visitedSet.has(iso2);
  const land = path({ type: "FeatureCollection", features: countries.filter((f) => !isVisited(f.properties.iso2)) }) ?? "";
  const visitedLand = path({ type: "FeatureCollection", features: countries.filter((f) => isVisited(f.properties.iso2)) }) ?? "";
  const dots =
    path.pointRadius(DOT_RADIUS)({
      type: "MultiPoint",
      coordinates: GLOBE_POINTS.filter(([iso2, , , small]) => small && visitedSet.has(iso2)).map(([, lon, lat]) => [lon, lat]),
    }) ?? "";
  const sphere = path({ type: "Sphere" }) ?? "";
  const graticule = path(geoGraticule10()) ?? "";
  const c = VIEW / 2;
  const r = VIEW * GLOBE_RADIUS;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}">
<defs>${glow ? `<radialGradient id="g" cx="${c}" cy="${c}" r="${c}" gradientUnits="userSpaceOnUse"><stop offset="${(r / c).toFixed(3)}" stop-color="#4fb3d9" stop-opacity="0.45"/><stop offset="${((r + 14) / c).toFixed(3)}" stop-color="#4fb3d9" stop-opacity="0.16"/><stop offset="1" stop-color="#4fb3d9" stop-opacity="0"/></radialGradient>` : ""}<radialGradient id="s" cx="${c - r * 0.25}" cy="${c - r * 0.35}" r="${r * 1.3}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0.1"/><stop offset="0.6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.35"/></radialGradient></defs>
${glow ? `<circle cx="${c}" cy="${c}" r="${c}" fill="url(#g)"/>` : ""}
<path d="${sphere}" fill="${GLOBE_COLORS.ocean}"/>
<path d="${graticule}" fill="none" stroke="${GLOBE_COLORS.graticule}" stroke-width="0.6"/>
<path d="${land}" fill="${GLOBE_COLORS.land}" stroke="${GLOBE_COLORS.border}" stroke-width="0.5"/>
<path d="${visitedLand}" fill="${GLOBE_COLORS.visited}" stroke="${GLOBE_COLORS.border}" stroke-width="0.5"/>
<path d="${dots}" fill="${GLOBE_COLORS.visited}" stroke="${GLOBE_COLORS.border}" stroke-width="1"/>
<path d="${sphere}" fill="url(#s)"/>
<path d="${sphere}" fill="none" stroke="${GLOBE_COLORS.rim}" stroke-width="1"/>
</svg>`;
}

/** Changes whenever the visited list does, so the SVG's URL can be cached for good. */
export function globeVersion(visited: readonly string[]): string {
  let hash = 5381;
  for (const ch of [...visited].sort().join(",")) hash = ((hash << 5) + hash + ch.charCodeAt(0)) | 0;
  return (hash >>> 0).toString(36);
}
