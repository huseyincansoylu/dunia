import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Database = PostgresJsDatabase<typeof schema>;

// Reuse one client across hot reloads in development so connections don't pile up.
const globalForDb = globalThis as unknown as { db?: Database };

/**
 * Connects on first use, not on import: `next build` loads route modules to read their
 * config, and a missing DATABASE_URL there shouldn't fail the build. It fails the first query.
 */
function connect(): Database {
  if (globalForDb.db) return globalForDb.db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  // prepare: false — Supabase's transaction pooler doesn't support prepared statements.
  const db = drizzle({ client: postgres(url, { prepare: false }), schema, casing: "snake_case" });
  if (process.env.NODE_ENV !== "production") globalForDb.db = db;
  return db;
}

let instance: Database | undefined;

export const db = new Proxy({} as Database, {
  get(_target, prop) {
    instance ??= connect();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
