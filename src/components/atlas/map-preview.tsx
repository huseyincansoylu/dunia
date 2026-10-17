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
  /** Zoom in on one country and outline it (the country sheet). */
  focus?: string;
  label: string;
  className?: string;
};

const BOXES = map.boxes as unknown as Record<string, [number, number, number, number]>;
/** Width / height of the zoomed view; matches the country sheet's map strip. */
const FOCUS_ASPECT = 2.2;

/** The visible area around a country, padded and kept to FOCUS_ASPECT. */
function focusViewBox(iso2: string) {
  const box = BOXES[iso2];
  if (!box) return null;
  const [x0, y0, x1, y1] = box;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  let w = Math.max((x1 - x0) * 2, 70);
  let h = w / FOCUS_ASPECT;
  if ((y1 - y0) * 1.8 > h) {
    h = (y1 - y0) * 1.8;
    w = h * FOCUS_ASPECT;
  }
  return { viewBox: `${cx - w / 2} ${cy - h / 2} ${w} ${h}`, scale: map.width / w };
}

/** Read-only world map. For the editable one, see WorldMap. */
export function MapPreview({ visited, tone = "theme", animate = false, focus, label, className }: MapPreviewProps) {
  const order = new Map(visited.map((iso2, i) => [iso2, i]));
  const zoom = focus ? focusViewBox(focus) : null;
  // When zoomed in, keep borders hairline and dots small on screen.
  const stroke = zoom ? { vectorEffect: "non-scaling-stroke" as const } : undefined;
  const dotRadius = zoom ? Math.max(3 / zoom.scale, 0.6) * 2.5 : 3;

  const fill = (iso2: string | null) => {
    const i = iso2 ? order.get(iso2) : undefined;
    const focused = !!focus && iso2 === focus;
    if (i === undefined) {
      return { className: focused ? "fill-[#4fb3d9]" : "fill-(--map-land)" };
    }
    return {
      className: cn("fill-(--map-visited)", animate && "map-fill"),
      style: animate ? { animationDelay: `${400 + i * 55}ms` } : undefined,
    };
  };

  return (
    <svg
      viewBox={zoom?.viewBox ?? `0 0 ${map.width} ${map.height}`}
      preserveAspectRatio={zoom ? "xMidYMid slice" : undefined}
      role="img"
      aria-label={label}
      className={cn("block h-auto w-full", className)}
      style={TONES[tone] as React.CSSProperties}
    >
      <g strokeWidth={0.5} className="stroke-(--map-sea)">
        {map.shapes.map((shape, i) => (
          <path key={shape.iso2 ?? `land-${i}`} d={shape.d} {...stroke} {...fill(shape.iso2)} />
        ))}
      </g>
      <g strokeWidth={1.2} className="stroke-(--map-sea)">
        {map.dots.map((dot) => (
          <circle key={dot.iso2} cx={dot.x} cy={dot.y} r={dotRadius} {...stroke} {...fill(dot.iso2)} />
        ))}
      </g>
    </svg>
  );
}
