import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { ArrowRightIcon } from "lucide-react";
import { CONTINENTS, getCountry, visitStats, type Country } from "@/data/countries";
import { CONTINENT_NAMES } from "@/components/atlas/visit-summary";
import { DuniaLogo } from "@/components/brand/dunia-logo";
import { ProfileGlobe } from "@/components/profile/globe";
import { getCurrentUser } from "@/lib/auth";
import { getProfileByUsername, type PublicProfile } from "@/lib/profiles";
import { normalizeUsername, usernameProblem } from "@/lib/username";

type Props = PageProps<"/[username]">;

// Wait for the profile (one quick query) instead of streaming a skeleton, so the page
// appears in one piece. Missing or private profiles render not-found.tsx with noindex.
export const instant = false;

async function readUsername(params: Props["params"]) {
  const { username } = await params;
  return { username: normalizeUsername(decodeURIComponent(username)) };
}

/**
 * Private profiles are visible only to their owner; everyone else gets a 404.
 * Cached per request, so the page and its metadata share one lookup.
 */
const loadProfile = cache(async (username: string) => {
  await connection();
  if (usernameProblem(username)) return null;
  const profile = await getProfileByUsername(username);
  if (!profile) return null;
  const viewer = await getCurrentUser();
  const isOwner = viewer?.id === profile.id;
  if (!profile.isPublic && !isOwner) return null;
  return { profile, isOwner };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await loadProfile((await readUsername(params)).username);
  if (!result) return { title: "Not found", robots: { index: false } };
  const { profile } = result;
  const name = profile.displayName ?? `@${profile.username}`;
  const stats = visitStats(profile.visited);
  const summary = `${stats.visited}/${stats.total} countries · ${stats.percent}% of the world`;
  return {
    title: `${name} · ${stats.visited}/${stats.total}`,
    description: `${name} has been to ${summary}. See the map on Dunia.`,
    openGraph: { title: `${name} on Dunia`, description: summary, type: "profile" },
    robots: profile.isPublic ? undefined : { index: false },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await readUsername(params);
  const result = await loadProfile(username);
  if (!result) notFound();

  return <Profile {...result} />;
}

const PREVIEW_COUNT = 8;

function Profile({ profile, isOwner }: { profile: PublicProfile; isOwner: boolean }) {
  const name = profile.displayName ?? profile.username;
  const stats = visitStats(profile.visited);
  const continents = CONTINENTS.map((c) => ({ id: c, ...stats.byContinent[c] }))
    .filter((c) => c.visited > 0)
    .sort((a, b) => b.visited - a.visited);
  const countries = profile.visited
    .map((iso2) => getCountry(iso2))
    .filter((c) => !!c)
    .sort((a, b) => a.name.en.localeCompare(b.name.en, "en"));

  return (
    <main className="flex flex-1 flex-col bg-deep">
      {/* Globe hero: everything that matters fits the first screen of Instagram's in-app browser. */}
      <section className="mx-auto flex w-full max-w-md flex-col items-center px-5 pb-10 text-deep-foreground">
        <header className="flex h-14 w-full items-center justify-between">
          <Link
            href="/"
            aria-label="Dunia home"
            className="rounded-md text-white outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <DuniaLogo tone="onDeep" className="text-lg" />
          </Link>
          {!isOwner && (
            <Link href="/signup" className="py-2.5 text-sm font-medium text-deep-muted hover:text-white">
              Create yours
            </Link>
          )}
        </header>

        <ProfileGlobe
          username={profile.username}
          visited={profile.visited}
          label={`A globe with the ${stats.visited} countries ${name} has visited`}
          className="-mt-1 w-[330px] max-w-full"
        />

        <div className="-mt-1 flex flex-col items-center gap-2.5 text-center">
          <p className="flex items-center gap-2 text-[15px] text-deep-muted">
            <span className="grid size-7 place-items-center rounded-full bg-white/10 text-[13px] font-semibold text-white uppercase">
              {name.charAt(0)}
            </span>
            <span className="font-semibold text-white">{name}</span>@{profile.username}
          </p>
          <h1 className="font-heading text-[84px] leading-[0.85] font-extrabold tracking-[-0.05em] text-white tabular-nums">
            {stats.visited}
            <span className="text-[32px] tracking-[-0.02em] text-deep-muted">/{stats.total}</span>
            <span className="sr-only"> countries visited by {name}</span>
          </h1>
          <p className="text-[15px] text-deep-muted">
            {stats.visited === 1 ? "country" : "countries"} · {stats.percent}% of the world ·{" "}
            {stats.continentsVisited} {stats.continentsVisited === 1 ? "continent" : "continents"}
          </p>
        </div>

        {!isOwner && (
          <Link
            href="/signup"
            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white text-base font-semibold text-deep outline-none hover:bg-white/90 focus-visible:ring-3 focus-visible:ring-white/50"
          >
            How many have you seen?
            <ArrowRightIcon className="size-[18px] text-primary dark:text-[#0b4f6c]" aria-hidden="true" />
          </Link>
        )}
      </section>

      <section className="flex flex-1 flex-col rounded-t-3xl bg-background text-foreground">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pt-6 pb-10">
          {stats.visited === 0 ? (
            <p className="rounded-2xl border bg-card px-5 py-8 text-center text-muted-foreground">
              {isOwner ? "Your map is empty. Add the countries you've been to." : `${name} hasn't added any countries yet.`}
            </p>
          ) : (
            <>
              <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1" aria-label="Countries by continent">
                {continents.map((c) => (
                  <li key={c.id} className="flex shrink-0 flex-col gap-0.5 rounded-2xl border bg-card px-4 py-2.5">
                    <span className="font-heading text-xl font-extrabold tabular-nums">
                      {c.visited}
                      <span className="text-sm font-bold text-muted-foreground">/{c.total}</span>
                    </span>
                    <span className="text-xs whitespace-nowrap text-muted-foreground">{CONTINENT_NAMES[c.id]}</span>
                  </li>
                ))}
              </ul>

              <div>
                <h2 className="mb-1 text-sm font-medium">Countries</h2>
                <CountryRows countries={countries.slice(0, PREVIEW_COUNT)} />
                {countries.length > PREVIEW_COUNT && (
                  <details className="group">
                    <summary className="cursor-pointer list-none py-3.5 text-sm font-medium text-primary outline-none focus-visible:underline [&::-webkit-details-marker]:hidden">
                      <span className="group-open:hidden">Show all {countries.length} countries</span>
                      <span className="hidden group-open:inline">Show fewer</span>
                    </summary>
                    <CountryRows countries={countries.slice(PREVIEW_COUNT)} />
                  </details>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function CountryRows({ countries }: { countries: Country[] }) {
  return (
    <ul>
      {countries.map((c) => (
        <li key={c.iso2} className="flex items-center gap-3 border-b py-3">
          <span className="size-2 shrink-0 rounded-full bg-visited" aria-hidden="true" />
          <span className="flex-1">{c.name.en}</span>
          <span className="text-sm text-muted-foreground">{CONTINENT_NAMES[c.continent]}</span>
        </li>
      ))}
    </ul>
  );
}
