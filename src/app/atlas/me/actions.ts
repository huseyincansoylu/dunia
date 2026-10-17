"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { deleteAccount, getProfile, setDisplayName, setProfilePublic } from "@/lib/profiles";
import { createClient } from "@/lib/supabase/server";
import { DISPLAY_NAME_MAX_LENGTH } from "@/lib/username";

export type SaveResult = { ok: true } | { ok: false; error: string };

const SIGNED_OUT: SaveResult = { ok: false, error: "Your session has ended. Sign in again." };

/** The name shown on the public page; empty clears it, and the page falls back to the username. */
export async function saveDisplayName(name: string): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;

  const trimmed = String(name).trim().replace(/\s+/g, " ");
  if (trimmed.length > DISPLAY_NAME_MAX_LENGTH) {
    return { ok: false, error: `Keep it under ${DISPLAY_NAME_MAX_LENGTH} characters.` };
  }
  try {
    await setDisplayName(user.id, trimmed || null);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't save your name. Try again." };
  }
}

export async function savePublic(isPublic: boolean): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  try {
    await setProfilePublic(user.id, isPublic === true);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't change that. Try again." };
  }
}

/** Deletes the account for good. The username typed back is the confirmation. */
export async function deleteMyAccount(confirmUsername: string): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;

  const profile = await getProfile(user.id);
  if (!profile?.username || String(confirmUsername).trim().toLowerCase() !== profile.username) {
    return { ok: false, error: "Type your username exactly to confirm." };
  }
  try {
    await deleteAccount(user.id);
  } catch {
    return { ok: false, error: "Couldn't delete your account. Try again." };
  }
  // The token would stay valid for up to an hour; drop it from this browser now.
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/");
}
