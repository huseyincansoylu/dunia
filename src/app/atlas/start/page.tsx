import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Onboarding } from "@/components/atlas/onboarding";
import { requireUser } from "@/lib/auth";
import { guessHomeCountry } from "@/lib/home-country";
import { getProfile } from "@/lib/profiles";
import { getAtlasEntries } from "@/lib/visits";

export const metadata: Metadata = { title: "Start your map" };

// The first-run flow: home country, then a quick pass continent by continent.
export default function StartPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <Suspense fallback={<div className="m-5 h-[480px] animate-pulse rounded-[22px] bg-muted" aria-busy="true" />}>
        <Start />
      </Suspense>
    </main>
  );
}

async function Start() {
  const user = await requireUser("/atlas/start");
  const [profile, entries, guess] = await Promise.all([getProfile(user.id), getAtlasEntries(user.id), guessHomeCountry()]);
  if (!profile?.username) redirect("/welcome");

  const lived = entries.find((e) => e.status === "lived")?.iso2;
  return (
    <Onboarding
      initialHome={lived ?? guess}
      initialVisited={entries.filter((e) => e.status === "visited").map((e) => e.iso2)}
    />
  );
}
