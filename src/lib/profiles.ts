import "server-only";
import { db } from "@/db";
import { profiles } from "@/db/schema";

/** First sign-in creates an empty profile; later calls do nothing. */
export async function ensureProfile(userId: string) {
  await db.insert(profiles).values({ id: userId }).onConflictDoNothing();
}
