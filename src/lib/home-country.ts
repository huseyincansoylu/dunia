import "server-only";
import { headers } from "next/headers";
import { getCountry } from "@/data/countries";

/** A guess at the visitor's home country from Vercel's IP lookup; null when unknown (e.g. locally). */
export async function guessHomeCountry(): Promise<string | null> {
  const code = (await headers()).get("x-vercel-ip-country");
  return code ? (getCountry(code)?.iso2 ?? null) : null;
}
