import { CONTINENTS, type Continent, type VisitStats } from "@/data/countries";

const CONTINENT_NAMES: Record<Continent, string> = {
  europe: "Europe",
  asia: "Asia",
  africa: "Africa",
  "north-america": "North America",
  "south-america": "South America",
  oceania: "Oceania",
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function VisitCounter({ stats }: { stats: VisitStats }) {
  return (
    <div>
      <p
        className="font-heading text-6xl leading-none font-extrabold tracking-tighter tabular-nums sm:text-7xl"
        aria-label={`${stats.visited} of ${stats.total} countries`}
      >
        {stats.visited}
        <span className="text-[0.45em] text-muted-foreground">/{stats.total}</span>
      </p>
      <p className="mt-2 text-muted-foreground">
        {stats.visited === 1 ? "country" : "countries"} · {stats.percent}% of the world ·{" "}
        {plural(stats.continentsVisited, "continent", "continents")}
      </p>
    </div>
  );
}

export function ContinentBars({ stats }: { stats: VisitStats }) {
  return (
    <ul className="grid gap-2.5 rounded-2xl border bg-card p-4">
      {CONTINENTS.map((continent) => {
        const { visited, total } = stats.byContinent[continent];
        return (
          <li key={continent} className="grid grid-cols-[7.5rem_1fr_3rem] items-center gap-3 text-sm">
            <span>{CONTINENT_NAMES[continent]}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-land">
              <span
                className="block h-full rounded-full bg-visited transition-[width] duration-300"
                style={{ width: `${(visited / total) * 100}%` }}
              />
            </span>
            <span className="text-right font-mono text-xs text-muted-foreground tabular-nums">
              {visited}/{total}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
