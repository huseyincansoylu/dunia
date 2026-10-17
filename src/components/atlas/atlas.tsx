"use client";

import { useMemo, useState } from "react";
import { setCountryVisited } from "@/app/atlas/actions";
import { getCountry, visitStats, type Locale } from "@/data/countries";
import { GlobeCanvas } from "@/components/profile/globe-canvas";
import { cn } from "@/lib/utils";
import { AddSheet } from "./add-sheet";
import { DeviceImport } from "./device-import";
import { WorldMap } from "./world-map";

// English only for now; country names already exist in other locales.
const LOCALE: Locale = "en";
const RECENT_COUNT = 3;

type AtlasProps = {
  initialVisited: string[];
  /** Where the globe faces first, computed on the server from the countries. */
  globeRotate: [number, number];
};

/**
 * The map tab. Changes show immediately and save in the background; if a save
 * fails, that country goes back to how it was and an error appears.
 */
export function Atlas({ initialVisited, globeRotate }: AtlasProps) {
  const [visited, setVisited] = useState(initialVisited);
  const [view, setView] = useState<"globe" | "flat">("globe");
  const [saving, setSaving] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const visitedSet = useMemo(() => new Set(visited), [visited]);
  const stats = useMemo(() => visitStats(visited), [visited]);
  const recent = visited.slice(-RECENT_COUNT).reverse();

  const apply = (iso2: string, on: boolean) =>
    setVisited((v) => (on ? (v.includes(iso2) ? v : [...v, iso2]) : v.filter((c) => c !== iso2)));

  const toggle = async (iso2: string) => {
    const on = !visitedSet.has(iso2);
    apply(iso2, on);
    setError(null);
    setSaving((n) => n + 1);
    try {
      const result = await setCountryVisited(iso2, on);
      if (!result.ok) {
        apply(iso2, !on);
        setError(result.error);
      }
    } catch {
      apply(iso2, !on);
      setError("Couldn't save your change. Check your connection and try again.");
    } finally {
      setSaving((n) => n - 1);
    }
  };

  return (
    <div className="flex flex-col gap-[18px]">
      <DeviceImport
        visited={visitedSet}
        onImported={(codes) => setVisited((v) => [...v, ...codes.filter((c) => !v.includes(c))])}
      />

      <section className="flex items-end justify-between gap-3">
        <div>
          <p className="font-heading text-6xl leading-[0.85] font-extrabold tracking-[-0.05em] tabular-nums">
            {stats.visited}
            <span className="text-2xl tracking-[-0.02em] text-muted-foreground">/{stats.total}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground" role="status" aria-live="polite">
            {saving > 0
              ? "Saving…"
              : `${stats.percent}% of the world · ${stats.continentsVisited} ${stats.continentsVisited === 1 ? "continent" : "continents"}`}
          </p>
        </div>
        <div role="radiogroup" aria-label="Map style" className="flex rounded-xl bg-secondary p-[3px]">
          {(["globe", "flat"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={view === v}
              onClick={() => setView(v)}
              className={cn(
                "h-9 rounded-[9px] px-3 text-[13px] font-medium capitalize outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {view === "globe" ? (
        <section className="relative flex h-[300px] items-center justify-center overflow-hidden rounded-3xl bg-deep">
          <div
            className="relative aspect-square w-[290px] max-w-full bg-[radial-gradient(circle_closest-side,rgba(79,179,217,0.45)_80%,rgba(79,179,217,0.16)_87%,transparent_100%)]"
            role="img"
            aria-label={`Your globe with ${stats.visited} countries`}
          >
            <GlobeCanvas visited={visited} rotate={globeRotate} />
          </div>
          <span className="absolute bottom-3 left-3.5 text-xs text-deep-muted">Drag to turn · switch to Flat to tap</span>
        </section>
      ) : (
        <WorldMap visited={visitedSet} locale={LOCALE} onToggle={toggle} />
      )}

      <AddSheet visited={visitedSet} locale={LOCALE} onToggle={toggle} />

      {recent.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-[13px] font-semibold text-muted-foreground">Recently added</h2>
          <ul className="flex flex-wrap gap-2">
            {recent.map((iso2) => (
              <li
                key={iso2}
                className="flex items-center gap-1.5 rounded-full border bg-card py-1.5 pr-3 pl-1.5 text-sm"
              >
                <span className="rounded-full bg-visited px-1.5 py-0.5 font-mono text-[10px] text-visited-foreground">
                  {iso2}
                </span>
                {getCountry(iso2)?.name[LOCALE]}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
