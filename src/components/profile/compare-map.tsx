import map from "@/data/world-map.json";

type CompareMapProps = {
  mine: ReadonlySet<string>;
  theirs: ReadonlySet<string>;
  label: string;
};

/** Saffron where both have been, ocean blue for only you, pale blue for only them. */
export const COMPARE_COLORS = {
  both: "fill-visited",
  mine: "fill-primary",
  theirs: "fill-[#8fcbe1] dark:fill-[#a3c3d0]",
} as const;

export function CompareMap({ mine, theirs, label }: CompareMapProps) {
  const fill = (iso2: string | null) => {
    if (!iso2) return "fill-land";
    const m = mine.has(iso2), t = theirs.has(iso2);
    return m && t ? COMPARE_COLORS.both : m ? COMPARE_COLORS.mine : t ? COMPARE_COLORS.theirs : "fill-land";
  };

  return (
    <svg viewBox={`0 0 ${map.width} ${map.height}`} role="img" aria-label={label} className="block h-auto w-full">
      <g strokeWidth={0.5} className="stroke-sea">
        {map.shapes.map((shape, i) => (
          <path key={shape.iso2 ?? `land-${i}`} d={shape.d} className={fill(shape.iso2)} />
        ))}
      </g>
      <g strokeWidth={1.2} className="stroke-sea">
        {map.dots
          .filter((dot) => mine.has(dot.iso2) || theirs.has(dot.iso2))
          .map((dot) => (
            <circle key={dot.iso2} cx={dot.x} cy={dot.y} r={3} className={fill(dot.iso2)} />
          ))}
      </g>
    </svg>
  );
}
