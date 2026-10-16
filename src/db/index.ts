import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

// Reuse one client across hot reloads in development so connections don't pile up.
const globalForDb = globalThis as unknown as { pgClient?: postgres.Sql };

// prepare: false — Supabase's transaction pooler doesn't support prepared statements.
const client = globalForDb.pgClient ?? postgres(process.env.DATABASE_URL, { prepare: false });
if (process.env.NODE_ENV !== "production") globalForDb.pgClient = client;

export const db = drizzle({ client, schema, casing: "snake_case" });
