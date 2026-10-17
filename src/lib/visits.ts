import "server-only";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { visits } from "@/db/schema";
import { COUNTED_STATUSES, type VisitStatus } from "@/lib/visit-status";

export type AtlasEntry = {
  iso2: string;
  status: VisitStatus;
  year: number | null;
  note: string | null;
};

/** Every country a user has on their map, wishlist included, oldest first. Private data. */
export async function getAtlasEntries(userId: string): Promise<AtlasEntry[]> {
  return db
    .select({ iso2: visits.countryIso2, status: visits.status, year: visits.year, note: visits.note })
    .from(visits)
    .where(eq(visits.userId, userId))
    .orderBy(asc(visits.createdAt), asc(visits.countryIso2));
}

/** The countries that count (visited or lived), as ISO codes, oldest first. Safe to show publicly. */
export async function getVisitedCountries(userId: string): Promise<string[]> {
  const rows = await db
    .select({ iso2: visits.countryIso2 })
    .from(visits)
    .where(and(eq(visits.userId, userId), inArray(visits.status, [...COUNTED_STATUSES])))
    .orderBy(asc(visits.createdAt), asc(visits.countryIso2));
  return rows.map((r) => r.iso2);
}

/**
 * Marks countries as visited. Codes must already be validated against the country list.
 * A wishlist country becomes visited; one already visited or lived in is left alone.
 */
export async function addVisits(userId: string, iso2s: string[]) {
  if (iso2s.length === 0) return;
  await db
    .insert(visits)
    .values(iso2s.map((countryIso2) => ({ userId, countryIso2, status: "visited" as const })))
    .onConflictDoUpdate({
      target: [visits.userId, visits.countryIso2],
      set: { status: "visited" },
      setWhere: sql`${visits.status} = 'want'`,
    });
}

/** Takes countries off the map entirely, wishlist and notes included. */
export async function removeVisits(userId: string, iso2s: string[]) {
  if (iso2s.length === 0) return;
  await db.delete(visits).where(and(eq(visits.userId, userId), inArray(visits.countryIso2, iso2s)));
}

/** Creates or replaces one country's details. */
export async function saveVisit(userId: string, entry: AtlasEntry) {
  const values = { status: entry.status, year: entry.year, note: entry.note };
  await db
    .insert(visits)
    .values({ userId, countryIso2: entry.iso2, ...values })
    .onConflictDoUpdate({ target: [visits.userId, visits.countryIso2], set: values });
}
