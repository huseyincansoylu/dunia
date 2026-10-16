import map from "@/data/world-map.json";
import { cn } from "@/lib/utils";

const TONES = {
  theme: { "--map-land": "var(--land)", "--map-visited": "var(--visited)", "--map-sea": "var(--sea)" },
  deep: { "--map-land": "#21404f", "--map-visited": "#f4a62a", "--map-sea": "#0a2233" },
} as const;

type MapPreviewProps = {
  /** Visited ISO codes, in the order they should fill in when animated. */
  visited: readonly string[];
  /** "deep" for surfaces that stay dark in both themes. */
  tone?: keyof typeof TONES;
  /** Fill visited countries one after another on load. */
  animate?: boolean;
  label: string;
  className?: string;
};

/** Read-only world map. For the editable one, see WorldMap. */
export function MapPreview({ visited, tone = "theme", animate = false, label, className }: MapPreviewProps) {
  const order = new Map(visited.map((iso2, i) => [iso2, i]));

  const fill = (iso2: string | null) => {
    const i = iso2 ? order.get(iso2) : undefined;
    if (i === undefined) return { className: "fill-(--map-land)" };
    return {
      className: cn("fill-(--map-visited)", animate && "map-fill"),
      style: animate ? { animationDelay: `${400 + i * 55}ms` } : undefined,
    };
  };

  return (
    <svg
      viewBox={`0 0 ${map.width} ${map.height}`}
      role="img"
      aria-label={label}
      className={cn("block h-auto w-full", className)}
      style={TONES[tone] as React.CSSProperties}
    >
      <g strokeWidth={0.5} className="stroke-(--map-sea)">
        {map.shapes.map((shape, i) => (
          <path key={shape.iso2 ?? `land-${i}`} d={shape.d} {...fill(shape.iso2)} />
        ))}
      </g>
      <g strokeWidth={1.2} className="stroke-(--map-sea)">
        {map.dots.map((dot) => (
          <circle key={dot.iso2} cx={dot.x} cy={dot.y} r={3} {...fill(dot.iso2)} />
        ))}
      </g>
    </svg>
  );
}
