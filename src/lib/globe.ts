/**
 * Shared by the server-rendered globe (first paint, SVG) and the spinning one
 * (canvas, in the browser), so both draw the same picture.
 */

/** [iso2, longitude, latitude, 1 if the country is too small to see at this scale] */
export type GlobePoint = readonly [string, number, number, number];

export const GLOBE_COLORS = {
  ocean: "#0f3045",
  land: "#2a4f63",
  border: "#0f3045",
  visited: "#f4a62a",
  graticule: "rgba(79, 179, 217, 0.08)",
  rim: "rgba(79, 179, 217, 0.5)",
};

/** The sphere's radius as a share of the drawing's width; the rest is room for the glow. */
export const GLOBE_RADIUS = 0.41;
export const DOT_RADIUS = 2.6;

/**
 * Where the globe should face: the average position of someone's countries,
 * tilted gently so the equator stays in view. Returns a d3 `rotate` value.
 */
export function aimAt(visited: ReadonlySet<string>, points: readonly GlobePoint[]): [number, number] {
  let x = 0, y = 0, z = 0;
  for (const [iso2, lon, lat] of points) {
    if (!visited.has(iso2)) continue;
    const λ = (lon * Math.PI) / 180, φ = (lat * Math.PI) / 180;
    x += Math.cos(φ) * Math.cos(λ);
    y += Math.cos(φ) * Math.sin(λ);
    z += Math.sin(φ);
  }
  // Nothing to aim at (or countries on opposite sides cancelling out): face Europe and Africa.
  if (Math.hypot(x, y, z) < 1e-6) return [-15, -20];
  const lon = (Math.atan2(y, x) * 180) / Math.PI;
  const lat = (Math.atan2(z, Math.hypot(x, y)) * 180) / Math.PI;
  const tilt = Math.max(-25, Math.min(30, lat * 0.7));
  return [-lon, -tilt];
}
