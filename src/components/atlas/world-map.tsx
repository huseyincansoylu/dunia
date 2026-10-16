"use client";

import { useState } from "react";
import map from "@/data/world-map.json";
import { flagEmoji, getCountry, type Locale } from "@/data/countries";
import { cn } from "@/lib/utils";

type WorldMapProps = {
  visited: ReadonlySet<string>;
  locale: Locale;
  onToggle: (iso2: string) => void;
  className?: string;
};

/**
 * Tap a country to mark it visited. Countries too small to tap also have a dot.
 * The map is pointer-only; the country search is the keyboard and screen-reader path.
 */
export function WorldMap({ visited, locale, onToggle, className }: WorldMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  // Territories we don't count (Greenland, Western Sahara, ...) have no country.
  const counts = (iso2: string | null): iso2 is string => !!iso2 && !!getCountry(iso2);

  const isoFromEvent = (e: React.SyntheticEvent) => {
    const iso2 = (e.target as Element).getAttribute("data-iso");
    return counts(iso2) ? iso2 : null;
  };

  const hoveredCountry = hovered ? getCountry(hovered) : undefined;

  return (
    <div className={cn("relative rounded-2xl border bg-sea p-2 sm:p-3", className)}>
      <svg
        viewBox={`0 0 ${map.width} ${map.height}`}
        className="block h-auto w-full select-none"
        aria-hidden="true"
        onClick={(e) => {
          const iso2 = isoFromEvent(e);
          if (iso2) {
            onToggle(iso2);
            setHovered(iso2);
          }
        }}
        onPointerOver={(e) => setHovered(isoFromEvent(e))}
        onPointerLeave={() => setHovered(null)}
      >
        <g strokeWidth={0.5} className="stroke-sea">
          {map.shapes.map((shape, i) => {
            const counted = counts(shape.iso2);
            const isVisited = counted && visited.has(shape.iso2!);
            return (
              <path
                key={shape.iso2 ?? `land-${i}`}
                d={shape.d}
                data-iso={shape.iso2 ?? undefined}
                className={cn(
                  "transition-colors duration-150",
                  isVisited ? "fill-visited" : "fill-land",
                  !counted && "opacity-50",
                  counted && "cursor-pointer hover:opacity-80",
                  counted && hovered === shape.iso2 && "opacity-80"
                )}
              />
            );
          })}
        </g>
        <g strokeWidth={1.2} className="stroke-sea">
          {map.dots.map((dot) => {
            if (!counts(dot.iso2)) return null;
            const isVisited = visited.has(dot.iso2);
            return (
              <circle
                key={dot.iso2}
                cx={dot.x}
                cy={dot.y}
                r={3.4}
                data-iso={dot.iso2}
                className={cn(
                  "cursor-pointer transition-colors duration-150",
                  isVisited ? "fill-visited" : "fill-land brightness-90 dark:brightness-125"
                )}
              />
            );
          })}
        </g>
      </svg>

      {hoveredCountry && (
        <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-1.5 rounded-full border bg-card/95 px-3 py-1 text-sm font-medium shadow-sm">
          <span aria-hidden="true">{flagEmoji(hoveredCountry.iso2)}</span>
          {hoveredCountry.name[locale]}
          {visited.has(hoveredCountry.iso2) && (
            <span className="ml-1 size-2 rounded-full bg-visited" aria-hidden="true" />
          )}
        </div>
      )}
    </div>
  );
}
