import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { flagEmoji, getCountry, visitStats } from "@/data/countries";
import { MapPreview } from "@/components/atlas/map-preview";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SAMPLE_PROFILE } from "./sample";
import { APP_HREF } from "./site-chrome";

export function Hero() {
  const { visited } = SAMPLE_PROFILE;
  const stats = visitStats(visited);
  const last = visited[visited.length - 1];

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-4 pt-14 pb-20 sm:px-6 sm:pt-20">
      <div className="grid max-w-3xl gap-6">
        <p className="w-fit rounded-full border bg-card px-3 py-1 font-mono text-xs tracking-wide text-muted-foreground uppercase">
          Your travel atlas
        </p>
        <h1 className="text-5xl leading-[1.02] font-extrabold sm:text-7xl">
          Every country you&apos;ve visited, a color on <span className="text-primary">your map</span>.
        </h1>
        <p className="max-w-[54ch] text-lg text-muted-foreground sm:text-xl">
          Mark the countries you&apos;ve been to, watch your world fill up, and share the number travelers put in
          their bio.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={APP_HREF} className={cn(buttonVariants({ size: "lg" }), "h-12 gap-2 rounded-xl px-6 text-base")}>
            Create your map
            <ArrowRightIcon />
          </Link>
          <a
            href="#how-it-works"
            className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "h-12 rounded-xl px-5 text-base")}
          >
            See how it works
          </a>
        </div>
        <p className="text-sm text-muted-foreground">Sign up with your email in a few seconds.</p>
      </div>

      <div className="relative">
        <div className="rounded-[1.75rem] border bg-card p-2 shadow-sm sm:p-3">
          <div className="rounded-[1.25rem] bg-sea p-3 sm:p-6">
            <MapPreview visited={visited} animate label={`Example map with ${stats.visited} visited countries`} />
          </div>
        </div>

        <div className="absolute -bottom-8 left-4 rounded-2xl border bg-card px-5 py-4 shadow-lg sm:left-8">
          <p className="font-heading text-5xl leading-none font-extrabold tracking-tighter tabular-nums">
            <span className="count-up" style={{ "--to": stats.visited } as React.CSSProperties} aria-hidden="true" />
            <span className="sr-only">{stats.visited}</span>
            <span className="text-[0.45em] text-muted-foreground">/{stats.total}</span>
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">countries · {stats.continentsVisited} continents</p>
        </div>

        <div className="absolute top-6 right-6 hidden items-center gap-2 rounded-full border bg-card py-1.5 pr-3 pl-2 text-sm font-medium shadow-md sm:flex">
          <span aria-hidden="true">{flagEmoji(last)}</span>
          {getCountry(last)?.name.en}
          <span className="rounded-full bg-visited px-2 py-0.5 text-xs text-visited-foreground">added</span>
        </div>
      </div>
    </section>
  );
}
