"use client";

import { useMemo } from "react";
import { visitStats, type Locale } from "@/data/countries";
import { useAtlas } from "@/hooks/use-atlas";
import { ContinentBars, VisitCounter } from "./visit-summary";
import { CountryPicker } from "./country-picker";
import { ListSwitch } from "./list-switch";
import { WorldMap } from "./world-map";

// Turkish only until next-intl lands.
const LOCALE: Locale = "tr";

export function Atlas() {
  const { visited, list, toggle, setList } = useAtlas();
  const visitedSet = useMemo(() => new Set(visited), [visited]);
  const stats = useMemo(() => visitStats(visited, list), [visited, list]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <VisitCounter stats={stats} />
        <ListSwitch value={list} onChange={setList} />
      </div>

      <WorldMap visited={visitedSet} list={list} locale={LOCALE} onToggle={toggle} />

      <div className="grid items-start gap-6 md:grid-cols-[1fr_20rem]">
        <CountryPicker visited={visitedSet} list={list} locale={LOCALE} onToggle={toggle} />
        <div className="grid gap-3">
          <h2 className="text-sm font-medium">Kıtalar</h2>
          <ContinentBars stats={stats} />
        </div>
      </div>
    </div>
  );
}
