import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { profiles, type Profile } from "@/db/schema";
import { getVisitedCountries } from "./visits";

/** First sign-in creates an empty profile; later calls do nothing. */
export async function ensureProfile(userId: string) {
  await db.insert(profiles).values({ id: userId }).onConflictDoNothing();
}

export async function getProfile(userId: string): Promise<Profile | undefined> {
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  return profile;
}

export async function isUsernameTaken(username: string): Promise<boolean> {
  const [row] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.username, username)).limit(1);
  return !!row;
}

/** True when the error is Postgres refusing a duplicate (e.g. two people claiming one username at once). */
function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
}

export type ClaimResult = "claimed" | "taken" | "already-set";

/**
 * Creates the profile with a username, or gives an existing username-less profile one.
 * Never overwrites a username that's already set. The database's unique constraint
 * is the final word, so a race between two sign-ups can't produce duplicates.
 */
export async function claimUsername(userId: string, username: string): Promise<ClaimResult> {
  try {
    await db.insert(profiles).values({ id: userId, username }).onConflictDoNothing({ target: profiles.id });
    const [updated] = await db
      .update(profiles)
      .set({ username })
      .where(and(eq(profiles.id, userId), isNull(profiles.username)))
      .returning({ id: profiles.id });
    if (updated) return "claimed";
    const current = await getProfile(userId);
    return current?.username === username ? "claimed" : "already-set";
  } catch (error) {
    if (isUniqueViolation(error)) return "taken";
    throw error;
  }
}

export type PublicProfile = {
  id: string;
  username: string;
  displayName: string | null;
  isPublic: boolean;
  /** ISO codes, oldest first. */
  visited: string[];
};

/**
 * The profile behind dunia/<username>, or null if there's none. Includes private
 * profiles so the page can show them to their owner; callers decide who sees what.
 */
export async function getProfileByUsername(username: string): Promise<PublicProfile | null> {
  const [profile] = await db.select().from(profiles).where(eq(profiles.username, username)).limit(1);
  if (!profile?.username) return null;
  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.displayName,
    isPublic: profile.isPublic,
    visited: await getVisitedCountries(profile.id),
  };
}
