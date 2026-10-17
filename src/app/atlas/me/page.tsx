import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { MeView } from "@/components/atlas/me-view";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/profiles";
import { getVisitedCountries } from "@/lib/visits";

export const metadata: Metadata = { title: "Me" };

export default function MePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-[18px] px-5 pt-3 pb-6">
      <header className="flex h-11 items-center">
        <h1 className="text-2xl font-extrabold tracking-[-0.02em]">Me</h1>
      </header>
      <Suspense fallback={<div className="h-[420px] animate-pulse rounded-[20px] bg-muted" aria-busy="true" />}>
        <Me />
      </Suspense>
    </main>
  );
}

async function Me() {
  const user = await requireUser("/atlas/me");
  const [profile, visited] = await Promise.all([getProfile(user.id), getVisitedCountries(user.id)]);
  if (!profile?.username) redirect("/welcome");

  return (
    <MeView
      username={profile.username}
      displayName={profile.displayName}
      isPublic={profile.isPublic}
      countries={visited.length}
      since={profile.createdAt.toLocaleDateString("en", { month: "long", year: "numeric", timeZone: "UTC" })}
      email={maskEmail(user.email)}
    />
  );
}

/** e•••@gmail.com: enough to recognise, not enough to read off a screenshot. */
function maskEmail(email: string | undefined): string {
  if (!email) return "";
  const at = email.indexOf("@");
  return at < 1 ? email : `${email[0]}•••${email.slice(at)}`;
}
