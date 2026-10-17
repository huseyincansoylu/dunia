import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowUpRightIcon } from "lucide-react";
import { Atlas } from "@/components/atlas/atlas";
import { requireUser } from "@/lib/auth";
import { aimAt } from "@/lib/globe";
import { GLOBE_POINTS } from "@/lib/globe-svg";
import { getProfile } from "@/lib/profiles";
import { getAtlasEntries } from "@/lib/visits";
import { isCounted } from "@/lib/visit-status";

export const metadata: Metadata = { title: "Your map" };

// The signed-in user's map tab. Mobile first: one column, the map and a search sheet.
export default function AtlasPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-3 pb-6">
      <Suspense fallback={<AtlasSkeleton />}>
        <AtlasData />
      </Suspense>
    </main>
  );
}

async function AtlasData() {
  const user = await requireUser("/atlas");
  const [profile, entries] = await Promise.all([getProfile(user.id), getAtlasEntries(user.id)]);
  if (!profile?.username) redirect("/welcome");

  return (
    <div className="flex flex-1 flex-col gap-[18px]">
      <header className="flex h-11 items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-[-0.02em]">Your map</h1>
        <Link
          href={`/${profile.username}`}
          className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2 font-mono text-xs text-secondary-foreground outline-none hover:bg-secondary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          dunia/{profile.username}
          <ArrowUpRightIcon className="size-3.5 text-primary" aria-hidden="true" />
          <span className="sr-only">(your public page)</span>
        </Link>
      </header>

      <Atlas
        initialEntries={entries}
        globeRotate={aimAt(new Set(entries.filter((e) => isCounted(e.status)).map((e) => e.iso2)), GLOBE_POINTS)}
      />
    </div>
  );
}

function AtlasSkeleton() {
  return (
    <div className="flex flex-col gap-[18px]" aria-busy="true" aria-label="Loading your map">
      <div className="h-11 w-32 animate-pulse rounded-lg bg-muted" />
      <div className="h-16 w-40 animate-pulse rounded-xl bg-muted" />
      <div className="h-[300px] animate-pulse rounded-3xl bg-muted" />
      <div className="h-13 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
