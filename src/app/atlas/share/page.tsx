import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ShareView } from "@/components/atlas/share-view";
import { requireUser } from "@/lib/auth";
import { globeVersion } from "@/lib/globe-svg";
import { getProfile } from "@/lib/profiles";
import { getVisitedCountries } from "@/lib/visits";

export const metadata: Metadata = { title: "Share" };

export default function SharePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-3.5 px-5 pt-3 pb-6">
      <header className="flex h-11 items-center">
        <h1 className="text-2xl font-extrabold tracking-[-0.02em]">Share your map</h1>
      </header>
      <Suspense fallback={<div className="h-[480px] animate-pulse rounded-[22px] bg-muted" aria-busy="true" />}>
        <Share />
      </Suspense>
    </main>
  );
}

async function Share() {
  const user = await requireUser("/atlas/share");
  const [profile, visited] = await Promise.all([getProfile(user.id), getVisitedCountries(user.id)]);
  if (!profile?.username) redirect("/welcome");

  return (
    <ShareView
      username={profile.username}
      siteUrl={(process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "")}
      version={globeVersion(visited)}
      isPublic={profile.isPublic}
    />
  );
}
