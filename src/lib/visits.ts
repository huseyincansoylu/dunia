import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { visits } from "@/db/schema";

/** A user's visited countries as ISO codes, oldest first. */
export async function getVisitedCountries(userId: string): Promise<string[]> {
  const rows = await db
    .select({ iso2: visits.countryIso2 })
    .from(visits)
    .where(eq(visits.userId, userId))
    .orderBy(asc(visits.createdAt), asc(visits.countryIso2));
  return rows.map((r) => r.iso2);
}

/** Codes must already be validated against the country list. Adding twice is a no-op. */
export async function addVisits(userId: string, iso2s: string[]) {
  if (iso2s.length === 0) return;
  await db
    .insert(visits)
    .values(iso2s.map((countryIso2) => ({ userId, countryIso2 })))
    .onConflictDoNothing();
}

export async function removeVisits(userId: string, iso2s: string[]) {
  if (iso2s.length === 0) return;
  await db.delete(visits).where(and(eq(visits.userId, userId), inArray(visits.countryIso2, iso2s)));
}
