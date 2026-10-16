"use client";

import { useMemo, useState } from "react";
import { setCountryVisited } from "@/app/atlas/actions";
import { visitStats, type Locale } from "@/data/countries";
import { ContinentBars, VisitCounter } from "./visit-summary";
import { CountryPicker } from "./country-picker";
import { DeviceImport } from "./device-import";
import { WorldMap } from "./world-map";

// English only for now; country names already exist in other locales.
const LOCALE: Locale = "en";

/**
 * The editable map. Changes show immediately and save in the background;
 * if a save fails, that country goes back to how it was and an error appears.
 */
export function Atlas({ initialVisited }: { initialVisited: string[] }) {
  const [visited, setVisited] = useState(initialVisited);
  const [saving, setSaving] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const visitedSet = useMemo(() => new Set(visited), [visited]);
  const stats = useMemo(() => visitStats(visited), [visited]);

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
    <div className="grid gap-6">
      <DeviceImport
        visited={visitedSet}
        onImported={(codes) => setVisited((v) => [...v, ...codes.filter((c) => !v.includes(c))])}
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <VisitCounter stats={stats} />
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {saving > 0 ? "Saving…" : "All changes saved"}
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <WorldMap visited={visitedSet} locale={LOCALE} onToggle={toggle} />

      <div className="grid items-start gap-6 md:grid-cols-[1fr_20rem]">
        <CountryPicker visited={visitedSet} locale={LOCALE} onToggle={toggle} />
        <div className="grid gap-3">
          <h2 className="text-sm font-medium">Continents</h2>
          <ContinentBars stats={stats} />
        </div>
      </div>
    </div>
  );
}
