import { flagEmoji, visitStats } from "@/data/countries";
import { DuniaMark } from "@/components/brand/dunia-logo";
import { cn } from "@/lib/utils";
import { MapPreview } from "./map-preview";
import { ContinentBars } from "./visit-summary";

type ProfileCardProps = {
  displayName: string;
  username: string;
  visited: readonly string[];
  className?: string;
};

const MAX_FLAGS = 14;

/** The public card at /<username>: count, map, continents and flags. */
export function ProfileCard({ displayName, username, visited, className }: ProfileCardProps) {
  const stats = visitStats(visited);
  const extra = visited.length - MAX_FLAGS;

  return (
    <article className={cn("grid gap-5 rounded-3xl border bg-card p-5 shadow-sm sm:p-6", className)}>
      <header className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-secondary font-heading text-lg font-bold text-secondary-foreground">
          {displayName.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{displayName}</p>
          <p className="truncate text-sm text-muted-foreground">@{username}</p>
        </div>
        <DuniaMark level={stats.visited / stats.total} className="size-7" />
      </header>

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <p className="font-heading text-5xl leading-none font-extrabold tracking-tighter tabular-nums">
          {stats.visited}
          <span className="text-[0.45em] text-muted-foreground">/{stats.total}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          {stats.percent}% of the world · {stats.continentsVisited} continents
        </p>
      </div>

      <div className="rounded-2xl bg-sea p-2">
        <MapPreview visited={visited} label={`Map of ${displayName}'s ${stats.visited} countries`} />
      </div>

      <ContinentBars stats={stats} />

      <p className="flex flex-wrap gap-1 text-xl leading-none" aria-label={`${stats.visited} countries`}>
        {visited.slice(0, MAX_FLAGS).map((iso2) => (
          <span key={iso2} aria-hidden="true">
            {flagEmoji(iso2)}
          </span>
        ))}
        {extra > 0 && <span className="ml-1 self-center text-sm text-muted-foreground">+{extra}</span>}
      </p>
    </article>
  );
}
