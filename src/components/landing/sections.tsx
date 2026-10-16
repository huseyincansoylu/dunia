import Link from "next/link";
import { ArrowRightIcon, CheckIcon, PlusIcon } from "lucide-react";
import { flagEmoji, getCountry, visitStats } from "@/data/countries";
import { ProfileCard } from "@/components/atlas/profile-card";
import { StoryCard } from "@/components/atlas/story-card";
import { ContinentBars } from "@/components/atlas/visit-summary";
import { DuniaMark } from "@/components/brand/dunia-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SAMPLE_PROFILE } from "./sample";
import { APP_HREF } from "./site-chrome";

function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="grid max-w-2xl content-start gap-4">
      <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">{eyebrow}</p>
      <h2 className="text-4xl leading-[1.05] font-extrabold sm:text-5xl">{title}</h2>
      {children && <p className="text-lg text-muted-foreground">{children}</p>}
    </div>
  );
}

/** The format people already use: "42/197" in an Instagram-style bio. */
export function BioSection() {
  const stats = visitStats(SAMPLE_PROFILE.visited);
  return (
    <section className="border-y bg-card/60">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-[1fr_24rem]">
        <SectionHeading eyebrow="You've seen it before" title={<>The number in every traveler&apos;s bio.</>}>
          &ldquo;42/197&rdquo; means 42 of the world&apos;s 197 countries. Dunia keeps that number honest, shows
          the map behind it, and gives you a link that proves it.
        </SectionHeading>

        <div className="grid gap-4 rounded-3xl border bg-background p-5 shadow-sm" aria-label="Example social profile">
          <div className="flex items-center gap-4">
            <span className="grid size-16 place-items-center rounded-full bg-primary p-[3px]">
              <span className="grid size-full place-items-center rounded-full bg-background font-heading text-2xl font-bold">
                E
              </span>
            </span>
            <div className="grid flex-1 grid-cols-3 text-center text-sm">
              {[
                ["214", "posts"],
                ["1,208", "followers"],
                ["390", "following"],
              ].map(([n, label]) => (
                <div key={label}>
                  <p className="font-semibold tabular-nums">{n}</p>
                  <p className="text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-0.5 text-sm">
            <p className="font-semibold">Ece · ece.travels</p>
            <p>Istanbul based, always packing</p>
            <p>
              ✈️ <mark className="rounded bg-visited/40 px-1 font-semibold text-foreground">
                {stats.visited}/{stats.total}
              </mark>{" "}
              🇹🇷 🇯🇵 🇵🇪 🇰🇪
            </p>
            <p className="font-medium text-primary">dunia/ece</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const STEP_COUNTRIES = ["JP", "PE", "IS", "MA"];

export function HowItWorks() {
  const stats = visitStats(SAMPLE_PROFILE.visited);
  const steps = [
    {
      title: "Mark your countries",
      body: "Tap them on the map or search by name. Small countries like Malta or Singapore get their own dot.",
      visual: (
        <ul className="grid gap-1.5">
          {STEP_COUNTRIES.map((iso2, i) => {
            const on = i !== 2;
            return (
              <li key={iso2} className="flex items-center gap-3 rounded-xl bg-background px-3 py-2 text-sm">
                <span aria-hidden="true">{flagEmoji(iso2)}</span>
                <span className="flex-1">{getCountry(iso2)?.name.en}</span>
                <span
                  className={cn(
                    "grid size-5 place-items-center rounded-full",
                    on ? "bg-visited text-visited-foreground" : "bg-secondary text-muted-foreground"
                  )}
                >
                  {on ? <CheckIcon className="size-3" /> : <PlusIcon className="size-3" />}
                </span>
              </li>
            );
          })}
        </ul>
      ),
    },
    {
      title: "See your world",
      body: "Your count out of 197, the share of the world you've seen, and how far you've got on each continent.",
      visual: <ContinentBars stats={stats} />,
    },
    {
      title: "Share it",
      body: "Post a story image in one tap, or put your Dunia link in your bio so anyone can see the whole map.",
      visual: (
        <div className="mx-auto w-40">
          <StoryCard size="sm" username={SAMPLE_PROFILE.username} visited={SAMPLE_PROFILE.visited} />
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="mx-auto grid max-w-6xl scroll-mt-20 gap-12 px-4 py-24 sm:px-6">
      <SectionHeading eyebrow="How it works" title="Three steps, about two minutes." />
      <ol className="grid gap-5 md:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step.title} className="grid grid-rows-[auto_1fr] gap-5 rounded-3xl border bg-card p-5">
            <div className="grid gap-2">
              <p className="font-mono text-xs text-muted-foreground">Step {i + 1}</p>
              <h3 className="text-2xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground">{step.body}</p>
            </div>
            <div className="self-end rounded-2xl bg-muted p-3">{step.visual}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function YourPage() {
  return (
    <section id="your-page" className="border-y bg-card/60">
      <div className="mx-auto grid max-w-6xl scroll-mt-20 gap-12 px-4 py-24 sm:px-6">
        <SectionHeading eyebrow="Your page" title={<>A page of your own, made for your bio.</>}>
          Pick a username and your map lives at its own address. Anyone with the link sees your count, your
          continents and every flag. You can make it private any time.
        </SectionHeading>
        <div className="grid items-start gap-8 md:grid-cols-[1fr_17rem]">
          <ProfileCard
            displayName={SAMPLE_PROFILE.displayName}
            username={SAMPLE_PROFILE.username}
            visited={SAMPLE_PROFILE.visited}
          />
          <div className="grid gap-3">
            <StoryCard username={SAMPLE_PROFILE.username} visited={SAMPLE_PROFILE.visited} />
            <p className="text-center text-sm text-muted-foreground">Story image, 1080×1920</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const ROUTE = [
  ["dunyā", "Arabic"],
  ["donyā", "Persian"],
  ["dünya", "Turkish"],
  ["duniyā", "Hindi"],
  ["dunia", "Malay"],
  ["dunia", "Swahili"],
];

export function OurName() {
  return (
    <section id="our-name" className="scroll-mt-16 bg-deep text-deep-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-24 sm:px-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="grid max-w-2xl gap-5">
          <p className="font-mono text-xs tracking-wide text-deep-muted uppercase">Our name</p>
          <h2 className="text-4xl leading-[1.05] font-extrabold sm:text-5xl">Our name has travelled too.</h2>
          <p className="text-lg text-deep-muted">
            <em className="text-deep-foreground not-italic">Dunia</em> means &ldquo;world&rdquo; in Indonesian,
            Malay and Swahili. It comes from the Arabic <em>dunyā</em>, &ldquo;the nearest one&rdquo;, and
            sailed with spice merchants on the monsoon winds across the Indian Ocean. Today more than two billion
            people say some version of it.
          </p>
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-3" aria-label="How the word travelled">
            {ROUTE.map(([word, language], i) => (
              <li key={language} className="flex items-center gap-2">
                <span className="grid rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
                  <span className="font-heading text-lg font-bold">{word}</span>
                  <span className="font-mono text-[0.7rem] text-deep-muted">{language}</span>
                </span>
                {i < ROUTE.length - 1 && <ArrowRightIcon className="size-4 text-deep-muted" aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </div>
        <DuniaMark tone="onDeep" level={0.62} className="hidden size-56 md:block" />
      </div>
    </section>
  );
}

const FAQ = [
  {
    q: "Why 197 countries?",
    a: "Dunia counts the 193 UN member states, the two UN observer states (Vatican City and Palestine), plus Kosovo and Taiwan. That's the 197 most travelers use, and it means your number matches theirs.",
  },
  {
    q: "What counts as visiting a country?",
    a: "That's up to you. Some people count airport layovers, some only count places they've stayed the night. Your map, your rules.",
  },
  {
    q: "Who can see my map?",
    a: "Your page is public by default so you can share it, and you can make it private from your settings at any time. Your email address is never shown.",
  },
  {
    q: "Do I need an account?",
    a: "Yes, so your map is saved and has its own link. All you need is an email address and a password.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto grid max-w-6xl scroll-mt-20 gap-10 px-4 py-24 sm:px-6 md:grid-cols-[1fr_1.4fr]">
      <SectionHeading eyebrow="FAQ" title="Questions travelers ask." />
      <div className="divide-y rounded-3xl border bg-card">
        {FAQ.map((item) => (
          <details key={item.q} className="group px-5 py-4 open:pb-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
              {item.q}
              <PlusIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45" aria-hidden="true" />
            </summary>
            <p className="mt-3 max-w-[60ch] text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <div className="grid justify-items-start gap-6 rounded-[2rem] bg-primary px-6 py-14 text-primary-foreground sm:px-12">
        <h2 className="max-w-xl text-4xl leading-[1.05] font-extrabold sm:text-6xl">Where next?</h2>
        <p className="max-w-[48ch] text-lg opacity-85">
          Start with the countries you&apos;ve already seen. The rest of the map is waiting.
        </p>
        <Link
          href={APP_HREF}
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-12 gap-2 rounded-xl bg-primary-foreground px-6 text-base text-primary hover:bg-primary-foreground/90"
          )}
        >
          Create your map
          <ArrowRightIcon />
        </Link>
      </div>
    </section>
  );
}
