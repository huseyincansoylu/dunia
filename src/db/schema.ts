// Database tables. After changing this file:
//   pnpm db:generate   → writes a SQL migration to ./drizzle
//   pnpm db:migrate    → applies it to the database
//
// RLS is enabled with no policies: the app reaches these tables only through
// Drizzle on the server, and the public Supabase API key can't read or write them.

import { sql } from "drizzle-orm";
import { boolean, char, check, pgTable, primaryKey, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import { VISIT_STATUSES } from "@/lib/visit-status";

const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
};

export const profiles = pgTable(
  "profiles",
  {
    // Same id as the Supabase Auth user; deleting the account deletes the profile.
    id: uuid()
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    // Null until the user picks one. Public page lives at /<username>.
    username: text().unique(),
    displayName: text(),
    isPublic: boolean().notNull().default(true),
    ...timestamps,
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    check("profiles_username_format", sql`${t.username} ~ '^[a-z0-9_]{3,20}$'`),
    check("profiles_display_name_length", sql`char_length(${t.displayName}) <= 50`),
  ]
).enableRLS();

export const visits = pgTable(
  "visits",
  {
    userId: uuid()
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    // ISO 3166-1 alpha-2, matches src/data/countries.json.
    countryIso2: char({ length: 2 }).notNull(),
    // "visited" and "lived" count toward the total; "want" is the wishlist and doesn't.
    status: text({ enum: VISIT_STATUSES }).notNull().default("visited"),
    // Year of the first trip, optional. Private to the user.
    year: smallint(),
    // Private to the user; never shown on the public page.
    note: text(),
    ...timestamps,
  },
  (t) => [
    // A country appears once per user; also serves "all visits of a user" lookups.
    primaryKey({ columns: [t.userId, t.countryIso2] }),
    check("visits_country_iso2_format", sql`${t.countryIso2} ~ '^[A-Z]{2}$'`),
    check("visits_status", sql`${t.status} in ('visited', 'want', 'lived')`),
    check("visits_year_range", sql`${t.year} between 1900 and 2100`),
    check("visits_note_length", sql`char_length(${t.note}) <= 500`),
  ]
).enableRLS();

export type Profile = typeof profiles.$inferSelect;
export type Visit = typeof visits.$inferSelect;
