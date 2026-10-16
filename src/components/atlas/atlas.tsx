"use client";

import { useMemo } from "react";
import { visitStats, type Locale } from "@/data/countries";
import { useAtlas } from "@/hooks/use-atlas";
import { ContinentBars, VisitCounter } from "./visit-summary";
import { CountryPicker } from "./country-picker";
import { WorldMap } from "./world-map";

// English only for now; country names already exist in other locales.
const LOCALE: Locale = "en";

export function Atlas() {
  const { visited, toggle } = useAtlas();
  const visitedSet = useMemo(() => new Set(visited), [visited]);
  const stats = useMemo(() => visitStats(visited), [visited]);

  return (
    <div className="grid gap-6">
      <VisitCounter stats={stats} />

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
