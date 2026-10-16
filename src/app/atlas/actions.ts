"use server";

import { COUNTRIES, getCountry } from "@/data/countries";
import { getCurrentUser } from "@/lib/auth";
import { addVisits, removeVisits } from "@/lib/visits";

export type SaveResult = { ok: true } | { ok: false; error: string };

const SIGNED_OUT: SaveResult = { ok: false, error: "Your session has ended. Sign in again to keep editing." };

/**
 * Sets one country to visited or not. Takes the desired state rather than
 * "toggle", so a retried or repeated call can't flip it the wrong way.
 */
export async function setCountryVisited(iso2: string, visited: boolean): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;

  const country = getCountry(String(iso2));
  if (!country) return { ok: false, error: "That country isn't on the list." };

  try {
    if (visited) await addVisits(user.id, [country.iso2]);
    else await removeVisits(user.id, [country.iso2]);
    return { ok: true };
  } catch {
    return { ok: false, error: `Couldn't save ${country.name.en}. Check your connection and try again.` };
  }
}

/** Adds countries marked in this browser before the user had an account. Unknown codes are skipped. */
export async function importCountries(iso2s: string[]): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  if (!Array.isArray(iso2s)) return { ok: false, error: "Nothing to import." };

  const valid = [
    ...new Set(
      iso2s
        .slice(0, COUNTRIES.length)
        .map((c) => getCountry(String(c))?.iso2)
        .filter((c): c is string => !!c)
    ),
  ];

  try {
    await addVisits(user.id, valid);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't add those countries. Try again." };
  }
}
