import type { Metadata } from "next";
import { Suspense } from "react";
import { CONTINENTS, visitStats } from "@/data/countries";
import { CONTINENT_NAMES } from "@/components/atlas/visit-summary";
import { DuniaMark } from "@/components/brand/dunia-logo";
import { requireUser } from "@/lib/auth";
import { getVisitedCountries } from "@/lib/visits";

export const metadata: Metadata = { title: "Stats" };

/** Round numbers worth celebrating, smallest first. The last is the whole list. */
const MILESTONES = [5, 10, 25, 50, 75, 100, 125, 150, 175, 197];

export default function StatsPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-3.5 px-5 pt-3 pb-6">
      <header className="flex h-11 items-center">
        <h1 className="text-2xl font-extrabold tracking-[-0.02em]">Stats</h1>
      </header>
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>
    </main>
  );
}

async function Stats() {
  const user = await requireUser("/atlas/stats");
  const stats = visitStats(await getVisitedCountries(user.id));
  const next = MILESTONES.find((m) => m > stats.visited);

  return (
    <>
      <section className="flex flex-col gap-3.5 rounded-[22px] border bg-card p-4">
        <div className="flex items-baseline justify-between">
          <p className="font-heading text-[34px] leading-none font-extrabold tracking-[-0.03em]">
            {stats.percent}%<span className="font-sans text-sm font-normal tracking-normal text-muted-foreground"> of the world</span>
          </p>
          <span className="font-mono text-[13px] text-muted-foreground tabular-nums">
            {stats.visited}/{stats.total}
          </span>
        </div>
        {/* One dot per country: the filled ones are yours. */}
        <div
          role="img"
          aria-label={`${stats.total} dots, one per country, ${stats.visited} of them filled`}
          className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-[5px]"
        >
          {Array.from({ length: stats.total }, (_, i) => (
            <span key={i} className={i < stats.visited ? "aspect-square rounded-full bg-visited" : "aspect-square rounded-full bg-border"} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2.5 rounded-[22px] bg-deep p-4 text-deep-foreground">
        {next ? (
          <>
            <div className="flex items-baseline justify-between text-[13px] text-deep-muted">
              <span>Next milestone</span>
              <span>{next - stats.visited} to go</span>
            </div>
            <p className="font-heading text-2xl font-extrabold text-white">{next === stats.total ? "Every country" : `${next} countries`}</p>
            <span
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={next}
              aria-valuenow={stats.visited}
              aria-label={`${stats.visited} of ${next} countries`}
              className="block h-2 overflow-hidden rounded-full bg-[#21404f]"
            >
              <span className="block h-full rounded-full bg-visited" style={{ width: `${(stats.visited / next) * 100}%` }} />
            </span>
          </>
        ) : (
          <p className="font-heading text-2xl font-extrabold text-white">You&apos;ve seen every country.</p>
        )}
      </section>

      <section aria-label="Continents" className="grid grid-cols-3 gap-x-1 gap-y-3 rounded-[22px] border bg-card px-2 py-3.5">
        {CONTINENTS.map((continent) => {
          const { visited, total } = stats.byContinent[continent];
          return (
            <div key={continent} className="flex flex-col items-center gap-1 text-center">
              <DuniaMark level={visited / total} className="size-10" />
              <span className="font-heading text-[15px] font-extrabold tabular-nums">
                {visited}
                <span className="text-xs text-muted-foreground">/{total}</span>
              </span>
              <span className="text-[11px] text-muted-foreground">{CONTINENT_NAMES[continent]}</span>
            </div>
          );
        })}
      </section>
    </>
  );
}

function StatsSkeleton() {
  return (
    <div className="flex flex-col gap-3.5" aria-busy="true" aria-label="Loading your stats">
      <div className="h-56 animate-pulse rounded-[22px] bg-muted" />
      <div className="h-28 animate-pulse rounded-[22px] bg-muted" />
      <div className="h-48 animate-pulse rounded-[22px] bg-muted" />
    </div>
  );
}
