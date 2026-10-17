import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { getCountry } from "@/data/countries";
import { CompareActions } from "@/components/profile/compare-actions";
import { COMPARE_COLORS, CompareMap } from "@/components/profile/compare-map";
import { requireUser } from "@/lib/auth";
import { getProfile, getProfileByUsername } from "@/lib/profiles";
import { getAtlasEntries } from "@/lib/visits";
import { isCounted } from "@/lib/visit-status";
import { normalizeUsername, usernameProblem } from "@/lib/username";

type Props = PageProps<"/[username]/compare">;

// Signed-in only and different for every viewer, so it renders in one piece per request.
export const instant = false;

export const metadata: Metadata = { title: "Compare maps", robots: { index: false } };

const NAMES_SHOWN = 7;

export default async function ComparePage({ params }: Props) {
  const username = normalizeUsername(decodeURIComponent((await params).username));
  if (usernameProblem(username)) notFound();

  const viewer = await requireUser(`/${username}/compare`);
  const [them, me, entries] = await Promise.all([
    getProfileByUsername(username),
    getProfile(viewer.id),
    getAtlasEntries(viewer.id),
  ]);
  if (!them || (!them.isPublic && them.id !== viewer.id)) notFound();
  if (!me?.username) redirect("/welcome");
  if (them.id === viewer.id) redirect(`/${username}`);

  const mine = new Set(entries.filter((e) => isCounted(e.status)).map((e) => e.iso2));
  const theirs = new Set(them.visited);
  const both = [...mine].filter((c) => theirs.has(c));
  const onlyMine = [...mine].filter((c) => !theirs.has(c));
  const onlyTheirs = them.visited
    .filter((c) => !mine.has(c))
    .map((c) => getCountry(c))
    .filter((c) => !!c)
    .sort((a, b) => a.name.en.localeCompare(b.name.en, "en"));
  const onWishlist = new Set(entries.filter((e) => e.status === "want").map((e) => e.iso2));
  const toWishlist = onlyTheirs.filter((c) => !onWishlist.has(c.iso2)).map((c) => c.iso2);

  const name = them.displayName ?? them.username;
  const myName = me.displayName ?? me.username;
  const legend = [
    { label: "Both", n: both.length, swatch: COMPARE_COLORS.both },
    { label: "Only you", n: onlyMine.length, swatch: COMPARE_COLORS.mine },
    { label: `Only ${name}`, n: onlyTheirs.length, swatch: COMPARE_COLORS.theirs },
  ];

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 pt-3 pb-7">
      <header className="flex h-[52px] items-center gap-3">
        <Link
          href={`/${them.username}`}
          aria-label={`Back to ${name}'s map`}
          className="-ml-2 grid size-10 place-items-center rounded-full outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ArrowLeftIcon className="size-5" aria-hidden="true" />
        </Link>
        <span className="flex" aria-hidden="true">
          <span className="grid size-10 place-items-center rounded-full border-[3px] border-background bg-primary font-bold text-primary-foreground uppercase">
            {myName[0]}
          </span>
          <span className="-ml-3 grid size-10 place-items-center rounded-full border-[3px] border-background bg-[#8fcbe1] font-bold text-[#0a2233] uppercase">
            {name[0]}
          </span>
        </span>
        <h1 className="min-w-0 truncate font-heading text-2xl font-extrabold tracking-[-0.02em]">You &amp; {name}</h1>
      </header>

      <p className="font-heading text-[30px] leading-[1.1] font-extrabold tracking-[-0.03em]">
        {both.length === 0 ? (
          <>No countries in common yet.</>
        ) : (
          <>
            You&apos;ve both been to{" "}
            <span className="rounded-lg bg-visited px-1.5 text-visited-foreground">{both.length}</span>{" "}
            {both.length === 1 ? "country" : "countries"}.
          </>
        )}
      </p>

      <div className="rounded-[22px] border bg-sea p-2.5">
        <CompareMap
          mine={mine}
          theirs={theirs}
          label={`World map: ${both.length} countries you've both been to, ${onlyMine.length} only you, ${onlyTheirs.length} only ${name}`}
        />
      </div>

      <ul className="grid grid-cols-3 gap-2">
        {legend.map((l) => (
          <li key={l.label} className="flex min-w-0 flex-col gap-1 rounded-2xl border bg-card p-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <svg viewBox="0 0 10 10" className="size-2.5 shrink-0" aria-hidden="true">
                <rect width="10" height="10" rx="3" className={l.swatch} />
              </svg>
              <span className="truncate">{l.label}</span>
            </span>
            <span className="font-heading text-2xl font-extrabold tabular-nums">{l.n}</span>
          </li>
        ))}
      </ul>

      {onlyTheirs.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-sm font-semibold">{name}&apos;s been, you haven&apos;t</h2>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            {onlyTheirs
              .slice(0, NAMES_SHOWN)
              .map((c) => c.name.en)
              .join(", ")}
            {onlyTheirs.length > NAMES_SHOWN && ` and ${onlyTheirs.length - NAMES_SHOWN} more`}
          </p>
        </section>
      )}

      <div className="mt-auto">
        <CompareActions toWishlist={toWishlist} myUsername={me.username} />
      </div>
    </main>
  );
}
