import { CONTINENTS, type Continent, type VisitStats } from "@/data/countries";

const CONTINENT_NAMES: Record<Continent, string> = {
  europe: "Avrupa",
  asia: "Asya",
  africa: "Afrika",
  "north-america": "Kuzey Amerika",
  "south-america": "Güney Amerika",
  oceania: "Okyanusya",
};

// Possessive suffix after a number, following how it's read aloud:
// %1'i (bir), %6'sı (altı), %20'si (yirmi), %40'ı (kırk), %100'ü (yüz).
const ONES = ["", "'i", "'si", "'ü", "'ü", "'i", "'sı", "'si", "'i", "'u"];
const TENS = ["", "'u", "'si", "'u", "'ı", "'si", "'ı", "'i", "'i", "'ı"];

function possessiveTr(n: number): string {
  if (n === 0) return "'ı";
  if (n % 100 === 0) return "'ü";
  return n % 10 !== 0 ? ONES[n % 10] : TENS[Math.floor(n / 10) % 10];
}

export function VisitCounter({ stats }: { stats: VisitStats }) {
  return (
    <div>
      <p
        className="font-heading text-6xl leading-none font-extrabold tracking-tighter tabular-nums sm:text-7xl"
        aria-label={`${stats.total} ülkeden ${stats.visited} ülke`}
      >
        {stats.visited}
        <span className="text-[0.45em] text-muted-foreground">/{stats.total}</span>
      </p>
      <p className="mt-2 text-muted-foreground">
        ülke · dünyanın %{stats.percent}
        {possessiveTr(stats.percent)} · {stats.continentsVisited} kıta
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
