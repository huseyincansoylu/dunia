"use server";

import { redirect } from "next/navigation";
import { getCurrentUser, safeNextPath } from "@/lib/auth";
import { EMAIL_PATTERN as EMAIL, MIN_PASSWORD_LENGTH } from "@/lib/auth-rules";
import { claimUsername, ensureProfile, isUsernameTaken } from "@/lib/profiles";
import { normalizeUsername, usernameProblem } from "@/lib/username";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  email?: string;
  username?: string;
  error?: string;
  fieldErrors?: { username?: string; email?: string; password?: string; confirm?: string };
  /** Set when an email was sent instead of signing in. */
  sent?: boolean;
};

// Every export of this file is a Server Action that the browser can call, so it
// only exports form actions and the username check; helpers live in src/lib.

function readEmail(formData: FormData) {
  return String(formData.get("email") ?? "").trim().toLowerCase();
}

function callbackUrl(next: string) {
  const url = new URL("/auth/callback", process.env.NEXT_PUBLIC_SITE_URL);
  url.searchParams.set("next", next);
  return url.toString();
}

function passwordError(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  return undefined;
}

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = readEmail(formData);
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));

  if (!EMAIL.test(email)) return { email, fieldErrors: { email: "Enter a valid email address." } };
  if (!password) return { email, fieldErrors: { password: "Enter your password." } };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { email, error: "Confirm your email first. Open the link we sent when you signed up." };
    }
    if (error.status === 429) return { email, error: "Too many attempts. Wait a minute and try again." };
    return { email, error: "Email or password is incorrect." };
  }

  await ensureProfile(data.user.id);
  redirect(next);
}

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = readEmail(formData);
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const password = String(formData.get("password") ?? "");
  // New accounts start with the first-run flow unless they were headed somewhere specific.
  const requested = safeNextPath(String(formData.get("next") ?? ""));
  const next = requested === "/atlas" ? "/atlas/start" : requested;

  const fieldErrors = {
    username: usernameProblem(username) ?? undefined,
    email: EMAIL.test(email) ? undefined : "Enter a valid email address.",
    password: passwordError(password),
  };
  if (!fieldErrors.username && (await isUsernameTaken(username))) {
    fieldErrors.username = "That username is taken. Try another one.";
  }
  if (fieldErrors.username || fieldErrors.email || fieldErrors.password) return { email, username, fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: callbackUrl(next) },
  });

  if (error) {
    if (error.code === "weak_password") {
      return { email, username, fieldErrors: { password: "This password is too easy to guess. Try a longer one." } };
    }
    if (error.code === "user_already_exists") {
      return { email, username, error: "There's already an account with this email. Sign in instead." };
    }
    // Supabase's built-in email service only delivers to the project's team members.
    if (error.code === "email_address_not_authorized") {
      return { email, username, error: "We can't send email to this address yet. Try another one." };
    }
    if (error.status === 429) return { email, username, error: "Too many attempts. Wait a minute and try again." };
    return { email, username, error: "We couldn't create your account. Try again." };
  }

  // For an email that already has an account, Supabase returns a stand-in user with no
  // identities (so nobody can probe which emails are registered). Only real new users get a profile.
  const isNewUser = !!data.user && (data.user.identities?.length ?? 0) > 0;
  if (isNewUser) {
    // Reserve the username now, even before the email is confirmed.
    const claim = await claimUsername(data.user!.id, username);
    // Lost a race for the same username: they'll pick another one after confirming (see /welcome).
    if (claim === "taken") await ensureProfile(data.user!.id);
  }

  // With email confirmation off, Supabase signs the user in right away.
  if (data.session && isNewUser) redirect(next);

  return { email, username, sent: true };
}

export type UsernameCheck = { available: boolean; message: string };

/** Live feedback while typing. Not a reservation: the final check happens on submit. */
export async function checkUsername(input: string): Promise<UsernameCheck> {
  const username = normalizeUsername(String(input));
  const problem = usernameProblem(username);
  if (problem) return { available: false, message: problem };
  if (await isUsernameTaken(username)) return { available: false, message: "That username is taken. Try another one." };
  return { available: true, message: `dunia/${username} is available.` };
}

/** For signed-in users without a username yet (/welcome). */
export async function chooseUsername(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/welcome");

  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const problem = usernameProblem(username);
  if (problem) return { username, fieldErrors: { username: problem } };

  const claim = await claimUsername(user.id, username);
  if (claim === "taken") return { username, fieldErrors: { username: "That username is taken. Try another one." } };
  redirect("/atlas/start");
}

export async function requestPasswordReset(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = readEmail(formData);
  if (!EMAIL.test(email)) return { email, fieldErrors: { email: "Enter a valid email address." } };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: callbackUrl("/reset-password") });

  if (error?.status === 429) return { email, error: "Too many emails for now. Wait a minute and try again." };
  // Same answer whether or not the account exists.
  return { email, sent: true };
}

export async function updatePassword(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const fieldErrors = {
    password: passwordError(password),
    confirm: password === confirm ? undefined : "The passwords don't match.",
  };
  if (fieldErrors.password || fieldErrors.confirm) return { fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    if (error.code === "same_password") {
      return { fieldErrors: { password: "Choose a password you haven't used here before." } };
    }
    if (error.code === "weak_password") {
      return { fieldErrors: { password: "This password is too easy to guess. Try a longer one." } };
    }
    return { error: "Your reset link has expired. Request a new one." };
  }

  redirect("/atlas");
}
