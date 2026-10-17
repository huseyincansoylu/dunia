import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { visitStats } from "@/data/countries";
import { MapPreview } from "@/components/atlas/map-preview";
import { DuniaLogo } from "@/components/brand/dunia-logo";
import { GlobeCanvas } from "@/components/profile/globe-canvas";
import { aimAt } from "@/lib/globe";
import { GLOBE_POINTS } from "@/lib/globe-svg";
import { SAMPLE_PROFILE } from "./sample";

const SIGNUP = "/signup";

const STEPS = [
  { title: "Mark your countries", body: "Tap them on the map or search. Small ones like Malta get their own dot." },
  { title: "Get your number", body: "Out of 197, with the share of the world and every continent." },
  { title: "Put it in your bio", body: "Your map lives at dunia/yourname. Share it as a story too." },
];

/** The landing page, phone first: a globe, one promise, one button. */
export function Landing() {
  const { visited, displayName, username } = SAMPLE_PROFILE;
  const stats = visitStats(visited);

  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-deep text-deep-foreground">
        <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 pb-9 text-center">
          <header className="flex h-14 w-full items-center justify-between">
            <DuniaLogo tone="onDeep" className="text-[19px] text-white" />
            <Link href="/login" className="py-2.5 text-[15px] font-medium text-deep-foreground/80 hover:text-white">
              Sign in
            </Link>
          </header>

          <div
            role="img"
            aria-label="A globe with visited countries in saffron"
            className="relative mt-1 aspect-square w-[290px] max-w-full bg-[radial-gradient(circle_closest-side,rgba(79,179,217,0.45)_80%,rgba(79,179,217,0.16)_87%,transparent_100%)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- a static SVG, nothing for next/image to optimize */}
            <img src="/sample-globe.svg" alt="" fetchPriority="high" className="absolute inset-0 size-full" />
            <GlobeCanvas visited={visited} rotate={aimAt(new Set(visited), GLOBE_POINTS)} />
          </div>

          <h1 className="mt-1 font-heading text-[38px] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance text-white">
            Your travel map, made for your bio.
          </h1>
          <p className="mt-3.5 max-w-[30ch] text-base leading-normal text-deep-muted">
            Mark the countries you&apos;ve been to and share the number every traveler wants to know.
          </p>
          <Link
            href={SIGNUP}
            className="mt-[22px] flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white text-base font-semibold text-deep outline-none hover:bg-white/90 focus-visible:ring-3 focus-visible:ring-white/50"
          >
            Create your map
            <ArrowRightIcon className="size-[18px] text-[#0b4f6c]" aria-hidden="true" />
          </Link>
          <p className="mt-3 text-[13px] text-deep-muted">Takes about a minute.</p>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <section className="flex flex-col gap-3.5 px-5 pt-9 pb-2">
          <h2 className="font-heading text-[26px] font-extrabold tracking-[-0.02em]">Three taps to your number</h2>
          <ol className="flex flex-col gap-2.5">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex items-start gap-3.5 rounded-[18px] border bg-card p-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-secondary font-mono text-sm font-medium text-primary">
                  {i + 1}
                </span>
                <span className="flex flex-col gap-0.5">
                  <strong className="font-semibold">{step.title}</strong>
                  <span className="text-sm leading-snug text-muted-foreground">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-3.5 px-5 pt-7 pb-2">
          <h2 className="font-heading text-[26px] font-extrabold tracking-[-0.02em]">A page for your bio</h2>
          <figure className="flex flex-col gap-3 rounded-[22px] bg-deep p-[18px] text-deep-foreground">
            <span className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-white/10 text-xs font-semibold text-white">
                  {displayName[0]}
                </span>
                {displayName}
              </span>
              <span className="font-mono text-xs text-deep-muted">dunia/{username}</span>
            </span>
            <span className="font-heading text-[56px] leading-[0.85] font-extrabold tracking-[-0.05em] text-white tabular-nums">
              {stats.visited}
              <span className="text-[22px] text-deep-muted">/{stats.total}</span>
            </span>
            <MapPreview visited={visited} tone="deep" label={`${displayName}'s map with ${stats.visited} countries in saffron`} />
          </figure>
          <p className="text-sm text-muted-foreground">One link that shows your count, your map and every country.</p>
        </section>

        <section className="mt-auto flex flex-col gap-3.5 px-5 pt-8 pb-6 text-center">
          <p className="font-heading text-[30px] font-extrabold tracking-[-0.03em]">What&apos;s your number?</p>
          <Link
            href={SIGNUP}
            className="flex h-14 items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Create your map
          </Link>
          <p className="mt-2 text-xs text-muted-foreground">
            <strong className="font-semibold text-foreground">Dunia</strong> means &ldquo;world&rdquo; in Malay, Indonesian
            and Swahili.
          </p>
        </section>
      </div>
    </main>
  );
}
