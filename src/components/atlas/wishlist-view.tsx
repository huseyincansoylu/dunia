"use client";

import { useState } from "react";
import { PlusIcon, XIcon } from "lucide-react";
import { saveCountryDetails, setCountryVisited, type SaveResult } from "@/app/atlas/actions";
import { getCountry, type Locale } from "@/data/countries";
import { CONTINENT_NAMES } from "./visit-summary";

const LOCALE: Locale = "en";
const NETWORK_ERROR = "Couldn't save your change. Check your connection and try again.";

type WishlistViewProps = {
  /** Countries marked "Want to go", oldest first. */
  initialWishlist: string[];
  /** Neighbours of countries they've been to, not on their map yet. */
  initialSuggestions: string[];
};

/** The Wishlist tab: places to go, marked visited in one tap. */
export function WishlistView({ initialWishlist, initialSuggestions }: WishlistViewProps) {
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [error, setError] = useState<string | null>(null);

  /** Applies a change right away and puts both lists back if saving fails. */
  const commit = async (nextWishlist: string[], nextSuggestions: string[], save: () => Promise<SaveResult>) => {
    const previous = { wishlist, suggestions };
    setWishlist(nextWishlist);
    setSuggestions(nextSuggestions);
    setError(null);
    try {
      const result = await save();
      if (result.ok) return;
      setError(result.error);
    } catch {
      setError(NETWORK_ERROR);
    }
    setWishlist(previous.wishlist);
    setSuggestions(previous.suggestions);
  };

  const without = (iso2: string) => wishlist.filter((c) => c !== iso2);
  // "Been there" keeps the row (and any note) and moves it to visited.
  const beenThere = (iso2: string) => commit(without(iso2), suggestions, () => setCountryVisited(iso2, true));
  const remove = (iso2: string) => commit(without(iso2), suggestions, () => setCountryVisited(iso2, false));
  const add = (iso2: string) =>
    commit([...wishlist, iso2], suggestions.filter((c) => c !== iso2), () =>
      saveCountryDetails(iso2, { status: "want", year: null, note: null })
    );

  return (
    <div className="flex flex-col gap-4">
      <header className="flex h-11 items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-[-0.02em]">Want to go</h1>
        <span className="font-mono text-[13px] text-muted-foreground tabular-nums">
          {wishlist.length} {wishlist.length === 1 ? "place" : "places"}
        </span>
      </header>

      {error && (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {wishlist.length === 0 ? (
        <p className="rounded-[22px] border bg-card px-5 py-8 text-center text-[15px] text-muted-foreground">
          Nothing here yet. Tap a country on your map and choose <strong className="font-semibold text-foreground">Want to go</strong>, or
          start with a suggestion below.
        </p>
      ) : (
        <ul className="overflow-hidden rounded-[22px] border bg-card" aria-label="Places you want to go">
          {wishlist.map((iso2) => {
            const country = getCountry(iso2);
            if (!country) return null;
            return (
              <li key={iso2} className="flex items-center gap-3 border-b border-muted py-2.5 pr-2 pl-3.5 last:border-b-0">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-dashed border-primary font-mono text-xs font-medium text-primary">
                  {iso2}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-base">{country.name[LOCALE]}</span>
                  <span className="text-xs text-muted-foreground">{CONTINENT_NAMES[country.continent]}</span>
                </span>
                <button
                  type="button"
                  onClick={() => void beenThere(iso2)}
                  className="h-9 shrink-0 rounded-[10px] border bg-card px-3 text-[13px] font-medium outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  Been there
                </button>
                <button
                  type="button"
                  onClick={() => void remove(iso2)}
                  aria-label={`Remove ${country.name[LOCALE]} from your wishlist`}
                  className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <XIcon className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {suggestions.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-[13px] font-semibold text-muted-foreground">Close to places you&apos;ve been</h2>
          <ul className="flex flex-wrap gap-2">
            {suggestions.map((iso2) => (
              <li key={iso2}>
                <button
                  type="button"
                  onClick={() => void add(iso2)}
                  aria-label={`Add ${getCountry(iso2)?.name[LOCALE]} to your wishlist`}
                  className="flex h-9 items-center gap-1.5 rounded-full border bg-card pr-3 pl-2.5 text-sm outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <PlusIcon className="size-3.5 text-primary" strokeWidth={2.5} aria-hidden="true" />
                  {getCountry(iso2)?.name[LOCALE]}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
