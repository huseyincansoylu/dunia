"use client";

import { useId, useState } from "react";
import { BookmarkIcon, CheckIcon, HouseIcon } from "lucide-react";
import { CONTINENT_NAMES } from "@/components/atlas/visit-summary";
import { getCountry, type Locale } from "@/data/countries";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { isCounted, NOTE_MAX_LENGTH, YEAR_MIN, type VisitStatus } from "@/lib/visit-status";
import { cn } from "@/lib/utils";
import { MapPreview } from "./map-preview";

export type Entry = { status: VisitStatus; year: number | null; note: string | null };

const STATUS_OPTIONS: { value: VisitStatus; label: string; Icon: typeof CheckIcon }[] = [
  { value: "visited", label: "Visited", Icon: CheckIcon },
  { value: "want", label: "Want to go", Icon: BookmarkIcon },
  { value: "lived", label: "Lived here", Icon: HouseIcon },
];

type CountrySheetProps = {
  /** The country being edited, or null when the sheet is closed. */
  iso2: string | null;
  entry: Entry | undefined;
  /** Counted countries, for the map strip and the "N of your M" line. */
  visited: readonly string[];
  locale: Locale;
  onClose: () => void;
  onSave: (iso2: string, entry: Entry) => Promise<string | null>;
  onRemove: (iso2: string) => Promise<string | null>;
};

/** Opens when a country is tapped: status, first trip and a private note. */
export function CountrySheet({ iso2, entry, visited, locale, onClose, onSave, onRemove }: CountrySheetProps) {
  return (
    <Sheet open={iso2 !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto max-h-[92dvh] max-w-lg gap-0 overflow-y-auto rounded-t-3xl p-0"
      >
        {/* Re-mount per country so the form starts from that country's saved values. */}
        {iso2 && <CountryForm key={iso2} {...{ iso2, entry, visited, locale, onClose, onSave, onRemove }} />}
      </SheetContent>
    </Sheet>
  );
}

function CountryForm({ iso2, entry, visited, locale, onClose, onSave, onRemove }: CountrySheetProps & { iso2: string }) {
  const country = getCountry(iso2)!;
  const [status, setStatus] = useState<VisitStatus>(entry?.status ?? "visited");
  const [year, setYear] = useState(entry?.year ? String(entry.year) : "");
  const [note, setNote] = useState(entry?.note ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const yearId = useId();
  const noteId = useId();

  const continentName = CONTINENT_NAMES[country.continent];
  const inContinent = visited.filter((c) => getCountry(c)?.continent === country.continent).length;
  const thisYear = new Date().getFullYear();

  const run = async (action: () => Promise<string | null>) => {
    setPending(true);
    setError(null);
    const message = await action();
    setPending(false);
    if (message) setError(message);
    else onClose();
  };

  const save = () => {
    const trimmed = year.trim();
    const parsed = trimmed ? Number(trimmed) : null;
    if (parsed !== null && (!Number.isInteger(parsed) || parsed < YEAR_MIN || parsed > thisYear)) {
      setError(`Enter a year between ${YEAR_MIN} and ${thisYear}, or leave it empty.`);
      return;
    }
    void run(() => onSave(iso2, { status, year: status === "want" ? null : parsed, note: note.trim() || null }));
  };

  return (
    <form
      className="flex flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="relative h-44 overflow-hidden rounded-t-3xl bg-deep">
        <MapPreview visited={visited} tone="deep" focus={iso2} label={`Map around ${country.name[locale]}`} className="h-full" />
        <span className="absolute top-2.5 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/40" aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-5 px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <header className="flex items-center gap-3.5">
          <span
            className={cn(
              "grid size-14 shrink-0 place-items-center rounded-2xl font-heading text-xl font-extrabold",
              entry && isCounted(entry.status) ? "bg-visited text-visited-foreground" : "bg-secondary text-secondary-foreground"
            )}
          >
            {country.iso2}
          </span>
          <div className="min-w-0">
            <SheetTitle className="truncate font-heading text-[28px] leading-tight font-extrabold tracking-[-0.02em]">
              {country.name[locale]}
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              {continentName} · {inContinent} of your countries in {continentName}
            </SheetDescription>
          </div>
        </header>

        <div role="radiogroup" aria-label="Status" className="grid grid-cols-3 gap-2">
          {STATUS_OPTIONS.map(({ value, label, Icon }) => {
            const on = status === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setStatus(value)}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 rounded-2xl text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  on && value !== "want" && "border-2 border-visited bg-visited/15 font-semibold",
                  on && value === "want" && "border-2 border-dashed border-primary bg-secondary font-semibold",
                  !on && "border text-muted-foreground"
                )}
              >
                <Icon className="size-[18px]" strokeWidth={on ? 2.5 : 2} aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>

        {status !== "want" && (
          <div className="flex flex-col gap-2">
            <label htmlFor={yearId} className="text-sm font-semibold">
              First trip
            </label>
            <input
              id={yearId}
              inputMode="numeric"
              maxLength={4}
              placeholder="Year, optional"
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
              className="h-12 rounded-[14px] border bg-transparent px-3.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor={noteId} className="text-sm font-semibold">
            Note <span className="font-normal text-muted-foreground">· only you see this</span>
          </label>
          <textarea
            id={noteId}
            rows={3}
            maxLength={NOTE_MAX_LENGTH}
            placeholder={`What do you remember about ${country.name[locale]}?`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="resize-none rounded-[14px] border bg-transparent px-3.5 py-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-3">
          {entry ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => void run(() => onRemove(iso2))}
              className="h-12 rounded-lg px-1 text-[15px] font-medium text-destructive outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Remove from map
            </button>
          ) : (
            <span />
          )}
          <Button type="submit" disabled={pending} className="h-13 rounded-[14px] px-8 text-base">
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}
