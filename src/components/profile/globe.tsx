import { aimAt } from "@/lib/globe";
import { GLOBE_POINTS, globeVersion } from "@/lib/globe-svg";
import { cn } from "@/lib/utils";
import { GlobeCanvas } from "./globe-canvas";

type ProfileGlobeProps = {
  username: string;
  visited: readonly string[];
  label: string;
  className?: string;
};

/**
 * A globe turned towards someone's countries. The first frame is an SVG image from
 * the server (/<username>/globe.svg), so it shows before any JavaScript; GlobeCanvas
 * then draws the same picture on top and spins it.
 */
export function ProfileGlobe({ username, visited, label, className }: ProfileGlobeProps) {
  const rotate = aimAt(new Set(visited), GLOBE_POINTS);

  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        // The atmosphere: the sphere's edge is at 82% of the half-width (GLOBE_RADIUS × 2).
        "relative aspect-square bg-[radial-gradient(circle_closest-side,rgba(79,179,217,0.45)_80%,rgba(79,179,217,0.16)_87%,transparent_100%)]",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- a server-rendered SVG, nothing for next/image to optimize */}
      <img
        src={`/${username}/globe.svg?v=${globeVersion(visited)}`}
        alt=""
        fetchPriority="high"
        className="absolute inset-0 size-full"
      />
      <GlobeCanvas visited={visited} rotate={rotate} />
    </div>
  );
}
