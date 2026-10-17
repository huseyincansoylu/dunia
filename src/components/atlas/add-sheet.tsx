"use client";

import { useId, useMemo, useState } from "react";
import { CheckIcon, PlusIcon, SearchIcon } from "lucide-react";
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { COUNTRIES, searchCountries, type Continent, type Locale } from "@/data/countries";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const FILTERS: { id: string; label: string; continents: Continent[] | null }[] = [
  { id: "all", label: "All", continents: null },
  { id: "europe", label: "Europe", continents: ["europe"] },
  { id: "asia", label: "Asia", continents: ["asia"] },
  { id: "africa", label: "Africa", continents: ["africa"] },
  { id: "americas", label: "Americas", continents: ["north-america", "south-america"] },
  { id: "oceania", label: "Oceania", continents: ["oceania"] },
];

const inFilter = (filter: (typeof FILTERS)[number], continent: Continent) =>
  !filter.continents || filter.continents.includes(continent);

type AddSheetProps = {
  visited: ReadonlySet<string>;
  locale: Locale;
  onToggle: (iso2: string) => void;
};

/** "Search or add a country": a bottom sheet with search, continent filters and one-tap toggles. */
export function AddSheet({ visited, locale, onToggle }: AddSheetProps) {
  const [query, setQuery] = useState("");
  const [filterId, setFilterId] = useState("all");
  const inputId = useId();
  const filter = FILTERS.find((f) => f.id === filterId) ?? FILTERS[0];

  const results = useMemo(
    () => searchCountries(query, locale).filter((c) => inFilter(filter, c.continent)),
    [query, locale, filter]
  );
  const pool = COUNTRIES.filter((c) => inFilter(filter, c.continent));
  const seenInFilter = pool.filter((c) => visited.has(c.iso2)).length;

  // Each time the sheet opens it starts fresh: no leftover search or continent filter.
  const onOpenChange = (open: boolean) => {
    if (!open) return;
    setQuery("");
    setFilterId("all");
  };

  return (
    <Sheet onOpenChange={onOpenChange}>
      <SheetTrigger
        render={
          <button
            type="button"
            className="flex h-13 w-full items-center gap-2.5 rounded-2xl border bg-card px-4 text-left text-[15px] text-muted-foreground outline-none hover:border-ring/40 focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        }
      >
        <SearchIcon className="size-[18px]" aria-hidden="true" />
        Search or add a country
      </SheetTrigger>

      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto max-w-lg data-[side=bottom]:h-[88dvh] gap-0 rounded-t-3xl px-5 pt-2.5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <span className="mx-auto h-1 w-10 shrink-0 rounded-full bg-land" aria-hidden="true" />
        <div className="flex items-center justify-between pt-3 pb-3">
          <SheetTitle className="font-heading text-[22px] font-extrabold">Add countries</SheetTitle>
          <span className="font-mono text-[13px] text-muted-foreground tabular-nums">
            {visited.size}/{COUNTRIES.length}
          </span>
        </div>
        <SheetDescription className="sr-only">Search for a country or browse by continent, then tap to add it.</SheetDescription>

        <label htmlFor={inputId} className="flex h-12 shrink-0 items-center gap-2.5 rounded-[14px] bg-muted px-3.5">
          <SearchIcon className="size-[18px] text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Search countries</span>
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Japan, Peru, Iceland…"
            autoComplete="off"
            className="h-full flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </label>

        <div role="tablist" aria-label="Continent" className="-mx-5 flex shrink-0 gap-1.5 overflow-x-auto px-5 py-3.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={f.id === filterId}
              onClick={() => setFilterId(f.id)}
              className={cn(
                "h-9 shrink-0 rounded-full px-3.5 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                f.id === filterId ? "bg-foreground text-background" : "bg-muted text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <ul className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1" aria-label="Countries">
          {results.length === 0 && (
            <li className="py-10 text-center text-sm text-muted-foreground">No country matches &ldquo;{query}&rdquo;.</li>
          )}
          {results.map((c) => {
            const on = visited.has(c.iso2);
            return (
              <li key={c.iso2} className="flex min-h-13 items-center gap-3 border-b border-muted">
                <span className="w-8 font-mono text-xs text-muted-foreground">{c.iso2}</span>
                <span className="flex-1 text-base">{c.name[locale]}</span>
                <button
                  type="button"
                  aria-pressed={on}
                  aria-label={`${on ? "Remove" : "Add"} ${c.name[locale]}`}
                  onClick={() => onToggle(c.iso2)}
                  className={cn(
                    "grid size-9 place-items-center rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    on ? "bg-visited text-visited-foreground" : "bg-secondary text-muted-foreground"
                  )}
                >
                  {on ? <CheckIcon className="size-4" strokeWidth={2.5} /> : <PlusIcon className="size-4" strokeWidth={2.5} />}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t pt-3.5">
          <span className="text-sm text-muted-foreground">
            <strong className="font-semibold text-foreground tabular-nums">
              {seenInFilter} of {pool.length}
            </strong>{" "}
            {filter.continents ? `in ${filter.label}` : "countries"}
          </span>
          <SheetPrimitive.Close render={<Button className="h-12 rounded-[14px] px-7 text-base" />}>Done</SheetPrimitive.Close>
        </div>
      </SheetContent>
    </Sheet>
  );
}
