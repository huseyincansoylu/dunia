import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next.js, so load .env.local ourselves (CI sets env directly).
try {
  process.loadEnvFile(".env.local");
} catch {}

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL },
  // Supabase owns the auth, storage and other schemas; only manage ours.
  schemaFilter: ["public"],
  // Must match the casing option on the db client in src/db/index.ts.
  casing: "snake_case",
  strict: true,
  verbose: true,
});
