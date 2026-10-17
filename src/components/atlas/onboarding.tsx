"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CheckIcon, HouseIcon, SearchIcon } from "lucide-react";
import { saveFirstMap } from "@/app/atlas/actions";
import { COUNTRIES, getCountry, searchCountries, type Continent, type Locale } from "@/data/countries";
import { cn } from "@/lib/utils";

const LOCALE: Locale = "en";
const TOTAL = 197;
const RESULTS = 6;

/** The pick screen's tabs; the Americas share one so the tab row fits a phone. */
const GROUPS: { label: string; continents: Continent[] }[] = [
  { label: "Europe", continents: ["europe"] },
  { label: "Asia", continents: ["asia"] },
  { label: "Africa", continents: ["africa"] },
  { label: "Americas", continents: ["north-america", "south-america"] },
  { label: "Oceania", continents: ["oceania"] },
];

const byName = [...COUNTRIES].sort((a, b) => a.name[LOCALE].localeCompare(b.name[LOCALE], LOCALE));

type OnboardingProps = {
  /** Already set (a country marked "lived") or guessed from the IP address. */
  initialHome: string | null;
  initialVisited: string[];
};

/** Step 1: where are you from. Step 2: tap the countries you've been to. Step 3 is the map itself. */
export function Onboarding({ initialHome, initialVisited }: OnboardingProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [home, setHome] = useState<string | null>(initialHome);
  const [picked, setPicked] = useState(() => new Set(initialVisited));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finish = async () => {
    setPending(true);
    setError(null);
    const result = await saveFirstMap(home, [...picked]);
    if (result.ok) {
      router.push("/atlas");
      return;
    }
    setPending(false);
    setError(result.error);
  };

  return step === 1 ? (
    <HomeStep home={home} onChange={setHome} onSkip={() => (setHome(null), setStep(2))} onNext={() => setStep(2)} />
  ) : (
    <PickStep
      home={home}
      picked={picked}
      onToggle={(iso2) =>
        setPicked((set) => {
          const next = new Set(set);
          if (!next.delete(iso2)) next.add(iso2);
          return next;
        })
      }
      pending={pending}
      error={error}
      onFinish={() => void finish()}
    />
  );
}

function Steps({ current }: { current: 1 | 2 }) {
  return (
    <div role="img" aria-label={`Step ${current} of 3`} className="flex gap-1.5">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={cn("h-1.5 rounded-full", n === current ? "w-7" : "w-3.5", n <= current ? "bg-primary" : "bg-border")}
        />
      ))}
    </div>
  );
}

const primaryButton =
  "flex h-14 w-full items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60";

function HomeStep({
  home,
  onChange,
  onSkip,
  onNext,
}: {
  home: string | null;
  onChange: (iso2: string) => void;
  onSkip: () => void;
  onNext: () => void;
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    if (query.trim()) return searchCountries(query, LOCALE).slice(0, RESULTS);
    return home ? [getCountry(home)!] : [];
  }, [query, home]);

  return (
    <div className="flex flex-1 flex-col gap-[22px] px-5 pt-4 pb-7">
      <header className="flex h-11 items-center justify-between">
        <Steps current={1} />
        <button
          type="button"
          onClick={onSkip}
          className="h-10 rounded-lg px-2 text-[15px] font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Skip
        </button>
      </header>

      <section className="flex flex-col gap-2">
        <h1 className="font-heading text-[34px] leading-[1.05] font-extrabold tracking-[-0.03em]">Where are you from?</h1>
        <p className="text-base text-muted-foreground">Your map starts at home. It counts as your first country.</p>
      </section>

      <label className="flex h-[52px] items-center gap-2.5 rounded-2xl border-2 border-primary px-3.5">
        <SearchIcon className="size-[18px] text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Search for your country</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search countries"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
      </label>

      <ul role="listbox" aria-label="Countries" className="flex flex-col gap-2">
        {results.map((c) => {
          const selected = c.iso2 === home;
          return (
            <li key={c.iso2} role="option" aria-selected={selected}>
              <button
                type="button"
                onClick={() => onChange(c.iso2)}
                className={cn(
                  "flex h-[60px] w-full items-center gap-3 rounded-2xl px-4 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  selected ? "border-2 border-visited bg-visited/15" : "border bg-card hover:bg-secondary"
                )}
              >
                <span className="w-[34px] font-mono text-xs text-muted-foreground">{c.iso2}</span>
                <span className={cn("flex-1 text-[17px]", selected && "font-medium")}>{c.name[LOCALE]}</span>
                {selected && <CheckIcon className="size-5" strokeWidth={2.5} aria-hidden="true" />}
              </button>
            </li>
          );
        })}
        {query.trim() && results.length === 0 && (
          <li className="py-6 text-center text-sm text-muted-foreground">No country matches &ldquo;{query}&rdquo;.</li>
        )}
      </ul>

      <div className="mt-auto flex flex-col gap-3">
        <p className="text-center text-sm text-muted-foreground">You can change this later.</p>
        <button type="button" onClick={onNext} disabled={!home} className={primaryButton}>
          Continue
        </button>
      </div>
    </div>
  );
}

function PickStep({
  home,
  picked,
  onToggle,
  pending,
  error,
  onFinish,
}: {
  home: string | null;
  picked: ReadonlySet<string>;
  onToggle: (iso2: string) => void;
  pending: boolean;
  error: string | null;
  onFinish: () => void;
}) {
  const homeContinent = home ? getCountry(home)?.continent : undefined;
  const [group, setGroup] = useState(() =>
    Math.max(0, GROUPS.findIndex((g) => homeContinent && g.continents.includes(homeContinent)))
  );

  const isOn = (iso2: string) => iso2 === home || picked.has(iso2);
  const count = picked.size + (home && !picked.has(home) ? 1 : 0);
  const tiles = byName.filter((c) => GROUPS[group].continents.includes(c.continent));

  return (
    <div className="flex flex-1 flex-col gap-[18px] px-5 pt-4">
      <header className="flex h-11 items-center justify-between">
        <Steps current={2} />
        <p aria-live="polite" className="font-heading text-[26px] font-extrabold tracking-[-0.03em] tabular-nums">
          {count}
          <span className="text-sm text-muted-foreground">/{TOTAL}</span>
        </p>
      </header>

      <section className="flex flex-col gap-1.5">
        <h1 className="font-heading text-[30px] leading-[1.05] font-extrabold tracking-[-0.03em]">Tap where you&apos;ve been</h1>
        <p className="text-[15px] text-muted-foreground">Go continent by continent. It takes about a minute.</p>
      </section>

      <div role="tablist" aria-label="Continent" className="-mx-5 flex gap-1.5 overflow-x-auto px-5 [scrollbar-width:none]">
        {GROUPS.map((g, i) => {
          const n = COUNTRIES.filter((c) => g.continents.includes(c.continent) && isOn(c.iso2)).length;
          return (
            <button
              key={g.label}
              type="button"
              role="tab"
              aria-selected={group === i}
              onClick={() => setGroup(i)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                group === i ? "bg-deep text-deep-foreground dark:bg-primary dark:text-primary-foreground" : "bg-secondary text-foreground"
              )}
            >
              {n ? `${g.label} · ${n}` : g.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" aria-label={GROUPS[group].label} className="grid grid-cols-3 gap-2">
        {tiles.map((c) => {
          const isHome = c.iso2 === home;
          const on = isOn(c.iso2);
          return (
            <button
              key={c.iso2}
              type="button"
              aria-pressed={on}
              disabled={isHome}
              onClick={() => onToggle(c.iso2)}
              className={cn(
                "flex h-[66px] flex-col items-start justify-between rounded-[14px] px-2.5 py-2 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                on ? "border-2 border-visited bg-visited text-visited-foreground" : "border bg-card hover:bg-secondary"
              )}
            >
              <span className="flex items-center gap-1 font-mono text-[11px] opacity-75">
                {isHome && <HouseIcon className="size-3" aria-hidden="true" />}
                {isHome ? "Home" : c.iso2}
              </span>
              <span className="line-clamp-2 text-sm leading-[1.15] font-medium">{c.name[LOCALE]}</span>
            </button>
          );
        })}
      </div>

      <div className="sticky bottom-0 -mx-5 mt-auto flex flex-col gap-2 bg-background/95 px-5 pt-3 pb-[max(1.75rem,env(safe-area-inset-bottom))] backdrop-blur-md">
        {error && (
          <p role="alert" className="text-center text-sm text-destructive">
            {error}
          </p>
        )}
        <button type="button" onClick={onFinish} disabled={pending} className={primaryButton}>
          {pending ? "Saving…" : count > 0 ? "Show my map" : "Skip for now"}
        </button>
      </div>
    </div>
  );
}
