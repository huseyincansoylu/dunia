/**
 * Usernames are the public address of a profile: dunia.app/<username>.
 * Shared by the forms (instant feedback) and the server (the real check).
 * The database enforces the same format (profiles_username_format).
 */

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
const PATTERN = /^[a-z0-9_]{3,20}$/;

/**
 * Words that can't be usernames because a page lives (or may one day live) at
 * that address, or because they could pass as Dunia itself. Kept generous on
 * purpose: a word is easy to release later and hard to take back.
 */
const RESERVED = new Set(
  `
  atlas login logout signin signout signup register join auth callback api
  account accounts settings preferences profile profiles welcome onboarding
  reset password forgot verify confirm invite invites new edit delete
  dashboard app apps home index search explore discover map maps world
  country countries continent continents share story stories card cards
  user users u me you we us everyone anonymous null undefined
  about blog help faq support contact pricing plans premium pro shop store
  terms privacy legal cookies security status docs developer developers
  press jobs careers team staff admin administrator root system moderator mod
  official verified dunia duniaapp dunia_app getdunia
  static assets public images img css js fonts favicon icon apple_icon robots sitemap manifest
  www mail email
  `
    .split(/\s+/)
    .filter(Boolean)
);

/** What people type: " @Ece_Travels " → "ece_travels". */
export function normalizeUsername(input: string): string {
  return input.trim().replace(/^@/, "").toLowerCase();
}

/** A sentence explaining what's wrong, or null when the format is fine (it may still be taken). */
export function usernameProblem(username: string): string | null {
  if (username.length < USERNAME_MIN) return `Use at least ${USERNAME_MIN} characters.`;
  if (username.length > USERNAME_MAX) return `Use at most ${USERNAME_MAX} characters.`;
  if (!PATTERN.test(username)) return "Use only lowercase letters, numbers and underscores.";
  if (RESERVED.has(username)) return "That username isn't available.";
  return null;
}

export function isReservedUsername(username: string): boolean {
  return RESERVED.has(username);
}

/** The optional name shown above the username. The database checks the same limit. */
export const DISPLAY_NAME_MAX_LENGTH = 50;
