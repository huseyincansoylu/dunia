import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Atlas } from "@/components/atlas/atlas";
import { DuniaLogo } from "@/components/brand/dunia-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/profiles";
import { getVisitedCountries } from "@/lib/visits";

export const metadata: Metadata = { title: "Your map" };

// The signed-in user's panel: mark and unmark countries. Saved to the database.
export default function AtlasPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex items-center justify-between gap-4 border-b pb-4">
        <Link href="/" aria-label="Dunia home">
          <DuniaLogo />
        </Link>
        <Suspense fallback={<div className="h-9" />}>
          <Account />
        </Suspense>
      </header>

      <section className="grid gap-2">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Your map</h1>
        <p className="max-w-[60ch] text-muted-foreground">
          Tap a country on the map or search for it below. Changes save automatically.
        </p>
      </section>

      <Suspense fallback={<AtlasSkeleton />}>
        <AtlasData />
      </Suspense>
    </main>
  );
}

async function Account() {
  const user = await requireUser("/atlas");
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="hidden truncate text-sm text-muted-foreground sm:block">{user.email}</span>
      <ThemeToggle />
      <form action="/auth/signout" method="post">
        <Button type="submit" variant="outline" className="h-9 rounded-xl px-3">
          Sign out
        </Button>
      </form>
    </div>
  );
}

async function AtlasData() {
  const user = await requireUser("/atlas");
  const [profile, visited] = await Promise.all([getProfile(user.id), getVisitedCountries(user.id)]);
  if (!profile?.username) redirect("/welcome");
  return <Atlas initialVisited={visited} />;
}

function AtlasSkeleton() {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label="Loading your map">
      <div className="h-24 w-48 animate-pulse rounded-2xl bg-muted" />
      <div className="aspect-[1000/436] animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
