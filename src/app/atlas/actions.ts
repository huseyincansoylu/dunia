"use server";

import { COUNTRIES, getCountry } from "@/data/countries";
import { getCurrentUser } from "@/lib/auth";
import { NOTE_MAX_LENGTH, VISIT_STATUSES, YEAR_MIN, type VisitStatus } from "@/lib/visit-status";
import { addVisits, removeVisits, saveVisit, startMap } from "@/lib/visits";

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

export type CountryDetails = { status: VisitStatus; year: number | null; note: string | null };

/** Saves the country sheet: Visited / Want to go / Lived here, the first trip's year and a private note. */
export async function saveCountryDetails(iso2: string, details: CountryDetails): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;

  const country = getCountry(String(iso2));
  if (!country) return { ok: false, error: "That country isn't on the list." };

  const status = details?.status;
  if (!VISIT_STATUSES.includes(status)) return { ok: false, error: "Choose Visited, Want to go or Lived here." };

  const thisYear = new Date().getFullYear();
  const year = details.year == null ? null : Number(details.year);
  if (year !== null && (!Number.isInteger(year) || year < YEAR_MIN || year > thisYear)) {
    return { ok: false, error: `Enter a year between ${YEAR_MIN} and ${thisYear}, or leave it empty.` };
  }

  const note = typeof details.note === "string" ? details.note.trim() : "";
  if (note.length > NOTE_MAX_LENGTH) return { ok: false, error: `Keep the note under ${NOTE_MAX_LENGTH} characters.` };

  try {
    // A wishlist country has no first trip yet.
    await saveVisit(user.id, { iso2: country.iso2, status, year: status === "want" ? null : year, note: note || null });
    return { ok: true };
  } catch {
    return { ok: false, error: `Couldn't save ${country.name.en}. Check your connection and try again.` };
  }
}

/** The first-run flow (/atlas/start): a home country and a batch of visited ones. */
export async function saveFirstMap(home: string | null, iso2s: string[]): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  if (!Array.isArray(iso2s)) return { ok: false, error: "Nothing to save." };

  const homeCode = home ? (getCountry(String(home))?.iso2 ?? null) : null;
  const valid = [
    ...new Set(
      iso2s
        .slice(0, COUNTRIES.length)
        .map((c) => getCountry(String(c))?.iso2)
        .filter((c): c is string => !!c)
    ),
  ];

  try {
    await startMap(user.id, homeCode, valid);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't save your map. Check your connection and try again." };
  }
}
