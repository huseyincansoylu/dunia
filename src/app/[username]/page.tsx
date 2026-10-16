import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { ArrowRightIcon } from "lucide-react";
import { CONTINENTS, flagEmoji, getCountry, visitStats } from "@/data/countries";
import { MapPreview } from "@/components/atlas/map-preview";
import { CONTINENT_NAMES, ContinentBars } from "@/components/atlas/visit-summary";
import { DuniaMark } from "@/components/brand/dunia-logo";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getProfileByUsername, type PublicProfile } from "@/lib/profiles";
import { normalizeUsername, usernameProblem } from "@/lib/username";
import { cn } from "@/lib/utils";

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

function Profile({ profile, isOwner }: { profile: PublicProfile; isOwner: boolean }) {
  const name = profile.displayName ?? profile.username;
  const stats = visitStats(profile.visited);

  return (
    <div className="grid gap-6">
      <section className="grid gap-5">
        <div className="flex items-center gap-3">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-secondary font-heading text-2xl font-bold text-secondary-foreground uppercase">
            {name.charAt(0)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold">{name}</h1>
            <p className="truncate text-muted-foreground">@{profile.username}</p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-heading text-7xl leading-none font-extrabold tracking-tighter tabular-nums">
              {stats.visited}
              <span className="text-[0.4em] text-muted-foreground">/{stats.total}</span>
            </p>
            <p className="mt-2 text-muted-foreground">
              {stats.visited === 1 ? "country" : "countries"} · {stats.percent}% of the world ·{" "}
              {stats.continentsVisited} {stats.continentsVisited === 1 ? "continent" : "continents"}
            </p>
          </div>
          <DuniaMark level={stats.visited / stats.total} className="size-12 shrink-0" />
        </div>
      </section>

      <div className="rounded-2xl border bg-sea p-2 sm:p-3">
        <MapPreview
          visited={profile.visited}
          animate
          label={`World map with ${stats.visited} countries ${name} has visited`}
        />
      </div>

      {stats.visited === 0 ? (
        <p className="rounded-2xl border bg-card px-5 py-8 text-center text-muted-foreground">
          {isOwner ? "Your map is empty. Add the countries you've been to." : `${name} hasn't added any countries yet.`}
        </p>
      ) : (
        <>
          <ContinentBars stats={stats} />
          <CountryList visited={profile.visited} />
        </>
      )}

      {!isOwner && <MakeYourOwn />}
    </div>
  );
}

function CountryList({ visited }: { visited: readonly string[] }) {
  const countries = visited.map((iso2) => getCountry(iso2)).filter((c) => !!c);
  return (
    <section className="grid gap-5" aria-label="Countries visited">
      {CONTINENTS.map((continent) => {
        const here = countries
          .filter((c) => c.continent === continent)
          .sort((a, b) => a.name.en.localeCompare(b.name.en, "en"));
        if (here.length === 0) return null;
        return (
          <div key={continent} className="grid gap-2.5">
            <h2 className="flex items-baseline justify-between text-sm font-medium">
              {CONTINENT_NAMES[continent]}
              <span className="font-mono text-xs text-muted-foreground tabular-nums">{here.length}</span>
            </h2>
            <ul className="flex flex-wrap gap-1.5">
              {here.map((c) => (
                <li
                  key={c.iso2}
                  className="flex items-center gap-1.5 rounded-full border bg-card py-1 pr-3 pl-2 text-sm"
                >
                  <span aria-hidden="true">{flagEmoji(c.iso2)}</span>
                  {c.name.en}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

function MakeYourOwn() {
  return (
    <aside className="mt-4 grid gap-4 rounded-3xl bg-primary px-5 py-7 text-primary-foreground sm:px-8">
      <p className="font-heading text-3xl leading-tight font-extrabold">How many have you seen?</p>
      <p className="opacity-85">Mark your countries and get a page like this one for your bio.</p>
      <Link
        href="/signup"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-12 w-full gap-2 rounded-xl bg-primary-foreground text-base text-primary hover:bg-primary-foreground/90 sm:w-fit sm:px-6"
        )}
      >
        Create your map
        <ArrowRightIcon />
      </Link>
    </aside>
  );
}
