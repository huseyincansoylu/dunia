"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";
import { saveCountryDetails, setCountryVisited, type SaveResult } from "@/app/atlas/actions";
import { getCountry, visitStats, type Locale } from "@/data/countries";
import { GlobeCanvas } from "@/components/profile/globe-canvas";
import { isCounted } from "@/lib/visit-status";
import { cn } from "@/lib/utils";
import { AddSheet } from "./add-sheet";
import { CountrySheet, type Entry } from "./country-sheet";
import { DeviceImport } from "./device-import";
import { WorldMap } from "./world-map";

// English only for now; country names already exist in other locales.
const LOCALE: Locale = "en";
const RECENT_COUNT = 3;

type AtlasEntry = Entry & { iso2: string };

type AtlasProps = {
  /** Every country on the map, wishlist included, oldest first. */
  initialEntries: AtlasEntry[];
  /** Where the globe faces first, computed on the server from the countries. */
  globeRotate: [number, number];
  /** For an empty map: a guess at the user's home country, offered as the first one to add. */
  suggestedHome: string | null;
};

const NETWORK_ERROR = "Couldn't save your change. Check your connection and try again.";

/**
 * The map tab. Changes show immediately and save in the background; if a save
 * fails, the map goes back to how it was and an error appears.
 */
export function Atlas({ initialEntries, globeRotate, suggestedHome }: AtlasProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [view, setView] = useState<"globe" | "flat">("globe");
  const [saving, setSaving] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const byIso = useMemo(() => new Map(entries.map((e) => [e.iso2, e])), [entries]);
  // Only visited and lived-in countries count; the wishlist stays off the map and the number.
  const visited = useMemo(() => entries.filter((e) => isCounted(e.status)).map((e) => e.iso2), [entries]);
  const visitedSet = useMemo(() => new Set(visited), [visited]);
  const stats = useMemo(() => visitStats(visited), [visited]);
  const recent = visited.slice(-RECENT_COUNT).reverse();

  /** Applies a change right away, saves it, and puts the previous entries back if saving fails. */
  const commit = async (next: AtlasEntry[], save: () => Promise<SaveResult>): Promise<string | null> => {
    const previous = entries;
    setEntries(next);
    setError(null);
    setSaving((n) => n + 1);
    try {
      const result = await save();
      if (result.ok) return null;
      setEntries(previous);
      setError(result.error);
      return result.error;
    } catch {
      setEntries(previous);
      setError(NETWORK_ERROR);
      return NETWORK_ERROR;
    } finally {
      setSaving((n) => n - 1);
    }
  };

  const without = (iso2: string) => entries.filter((e) => e.iso2 !== iso2);

  /** The quick toggle in the search sheet: visited, or off the map. */
  const toggle = (iso2: string) => {
    const on = !visitedSet.has(iso2);
    const current = byIso.get(iso2);
    const next = on
      ? current
        ? entries.map((e) => (e.iso2 === iso2 ? { ...e, status: "visited" as const } : e))
        : [...entries, { iso2, status: "visited" as const, year: null, note: null }]
      : without(iso2);
    void commit(next, () => setCountryVisited(iso2, on));
  };

  const saveDetails = (iso2: string, entry: Entry) => {
    const next = byIso.has(iso2)
      ? entries.map((e) => (e.iso2 === iso2 ? { iso2, ...entry } : e))
      : [...entries, { iso2, ...entry }];
    return commit(next, () => saveCountryDetails(iso2, entry));
  };

  const remove = (iso2: string) => commit(without(iso2), () => setCountryVisited(iso2, false));

  const addHome = (iso2: string) => {
    const entry = { status: "lived" as const, year: null, note: null };
    void commit([...entries, { iso2, ...entry }], () => saveCountryDetails(iso2, entry));
  };

  const deviceImport = (
    <DeviceImport
      visited={visitedSet}
      onImported={(codes) =>
        setEntries((list) => [
          ...list,
          ...codes.filter((c) => !list.some((e) => e.iso2 === c)).map((iso2) => ({ iso2, status: "visited" as const, year: null, note: null })),
        ])
      }
    />
  );

  if (entries.length === 0) {
    const home = suggestedHome ? getCountry(suggestedHome) : undefined;
    return (
      <div className="flex flex-col gap-[18px]">
        {deviceImport}
        <section>
          <p className="font-heading text-6xl leading-[0.85] font-extrabold tracking-[-0.05em] text-muted-foreground/60 tabular-nums">
            0<span className="text-2xl tracking-[-0.02em]">/{stats.total}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground" role="status" aria-live="polite">
            {saving > 0 ? "Saving…" : "Every country you add lights up here."}
          </p>
        </section>
        {error && (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {/* Just a picture until the first country: inert keeps its countries out of reach. */}
        <div inert className="opacity-60 grayscale">
          <WorldMap visited={visitedSet} locale={LOCALE} onSelect={setSelected} />
        </div>
        <section className="flex flex-col gap-3 rounded-[22px] border bg-card p-[18px]">
          <h2 className="font-heading text-xl font-extrabold">{home ? "Start with home" : "Start your map"}</h2>
          <p className="text-[15px] text-muted-foreground">
            {home
              ? `Add ${home.name[LOCALE]}, then the places you've traveled to.`
              : "Pick the countries you've been to. It takes about a minute."}
          </p>
          {home && (
            <button
              type="button"
              onClick={() => addHome(home.iso2)}
              className="flex h-[52px] items-center justify-center gap-2 rounded-[14px] bg-primary text-base font-semibold text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <PlusIcon className="size-[18px]" strokeWidth={2.5} aria-hidden="true" />
              Add {home.name[LOCALE]}
            </button>
          )}
          <Link
            href="/atlas/start"
            className={cn(
              "flex items-center justify-center rounded-[14px] font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              home
                ? "h-12 border bg-card text-[15px] hover:bg-secondary"
                : "h-[52px] bg-primary text-base text-primary-foreground hover:bg-primary/90"
            )}
          >
            Pick countries
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[18px]">
      {deviceImport}

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
        <WorldMap visited={visitedSet} locale={LOCALE} onSelect={setSelected} />
      )}

      <AddSheet visited={visitedSet} locale={LOCALE} onToggle={toggle} />

      {recent.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-[13px] font-semibold text-muted-foreground">Recently added</h2>
          <ul className="flex flex-wrap gap-2">
            {recent.map((iso2) => (
              <li key={iso2}>
                <button
                  type="button"
                  onClick={() => setSelected(iso2)}
                  className="flex items-center gap-1.5 rounded-full border bg-card py-1.5 pr-3 pl-1.5 text-sm outline-none hover:border-ring/40 focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="rounded-full bg-visited px-1.5 py-0.5 font-mono text-[10px] text-visited-foreground">
                    {iso2}
                  </span>
                  {getCountry(iso2)?.name[LOCALE]}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <CountrySheet
        iso2={selected}
        entry={selected ? byIso.get(selected) : undefined}
        visited={visited}
        locale={LOCALE}
        onClose={() => setSelected(null)}
        onSave={saveDetails}
        onRemove={remove}
      />
    </div>
  );
}
