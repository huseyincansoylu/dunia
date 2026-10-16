import { visitStats } from "@/data/countries";
import { DuniaLogo } from "@/components/brand/dunia-logo";
import { cn } from "@/lib/utils";
import { MapPreview } from "./map-preview";

const SIZES = {
  sm: { card: "gap-2 rounded-2xl p-3", logo: "text-xs", count: "text-3xl", sub: "text-[0.6rem]", foot: "text-[0.5rem]" },
  md: { card: "gap-4 rounded-[1.75rem] p-5", logo: "text-lg", count: "text-6xl", sub: "mt-2 text-sm", foot: "text-[0.7rem]" },
};

type StoryCardProps = {
  username: string;
  visited: readonly string[];
  size?: keyof typeof SIZES;
  className?: string;
};

/**
 * The 9:16 Instagram story image. Always deep water with a saffron map,
 * whatever theme the viewer uses.
 */
export function StoryCard({ username, visited, size = "md", className }: StoryCardProps) {
  const stats = visitStats(visited);
  const s = SIZES[size];

  return (
    <div
      className={cn(
        "grid aspect-9/16 w-full grid-rows-[auto_1fr_auto_auto] bg-deep text-deep-foreground shadow-xl ring-1 ring-black/5 dark:ring-white/10",
        s.card,
        className
      )}
    >
      <DuniaLogo tone="onDeep" level={stats.visited / stats.total} className={s.logo} />
      <div className="self-end">
        <p className={cn("font-heading leading-none font-extrabold tracking-tighter tabular-nums", s.count)}>
          {stats.visited}
          <span className="text-[0.42em] text-deep-muted">/{stats.total}</span>
        </p>
        <p className={cn("text-deep-muted", s.sub)}>countries · {stats.percent}% of the world</p>
      </div>
      <MapPreview visited={visited} tone="deep" label={`Map of ${stats.visited} visited countries`} />
      <p className={cn("flex justify-between font-mono text-deep-muted", s.foot)}>
        <span>@{username}</span>
        <span>dunia</span>
      </p>
    </div>
  );
}
