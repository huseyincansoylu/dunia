"use client";

import { useId, useMemo, useState } from "react";
import { CheckIcon, PlusIcon, SearchIcon } from "lucide-react";
import { flagEmoji, searchCountries, type Locale } from "@/data/countries";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CountryPickerProps = {
  visited: ReadonlySet<string>;
  locale: Locale;
  onToggle: (iso2: string) => void;
};

export function CountryPicker({ visited, locale, onToggle }: CountryPickerProps) {
  const [query, setQuery] = useState("");
  const inputId = useId();
  const results = useMemo(() => searchCountries(query, locale), [query, locale]);

  return (
    <div className="grid gap-3">
      <label htmlFor={inputId} className="text-sm font-medium">
        Search countries
      </label>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Japan, Peru, Iceland…"
          autoComplete="off"
          className="h-11 rounded-xl pl-9 text-base"
        />
      </div>

      <ul className="max-h-80 overflow-y-auto rounded-2xl border bg-card p-1.5" aria-label="Countries">
        {results.length === 0 && (
          <li className="px-3 py-6 text-center text-sm text-muted-foreground">
            No country matches &ldquo;{query}&rdquo;.
          </li>
        )}
        {results.map((country) => {
          const isVisited = visited.has(country.iso2);
          return (
            <li key={country.iso2}>
              <button
                type="button"
                aria-pressed={isVisited}
                onClick={() => onToggle(country.iso2)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="text-lg leading-none" aria-hidden="true">
                  {flagEmoji(country.iso2)}
                </span>
                <span className="flex-1">{country.name[locale]}</span>
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-full transition-colors",
                    isVisited ? "bg-visited text-visited-foreground" : "bg-secondary text-muted-foreground"
                  )}
                  aria-hidden="true"
                >
                  {isVisited ? <CheckIcon className="size-3.5" /> : <PlusIcon className="size-3.5" />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
