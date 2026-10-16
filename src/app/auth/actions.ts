"use server";

import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/auth";
import { EMAIL_PATTERN as EMAIL, MIN_PASSWORD_LENGTH } from "@/lib/auth-rules";
import { ensureProfile } from "@/lib/profiles";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  email?: string;
  error?: string;
  fieldErrors?: { email?: string; password?: string; confirm?: string };
  /** Set when an email was sent instead of signing in. */
  sent?: boolean;
};

// Every export of this file is a Server Action that the browser can call, so it
// only exports the four form actions; helpers live in src/lib.

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
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));

  const fieldErrors = {
    email: EMAIL.test(email) ? undefined : "Enter a valid email address.",
    password: passwordError(password),
  };
  if (fieldErrors.email || fieldErrors.password) return { email, fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: callbackUrl(next) },
  });

  if (error) {
    if (error.code === "weak_password") {
      return { email, fieldErrors: { password: "This password is too easy to guess. Try a longer one." } };
    }
    if (error.code === "user_already_exists") {
      return { email, error: "There's already an account with this email. Sign in instead." };
    }
    if (error.status === 429) return { email, error: "Too many attempts. Wait a minute and try again." };
    return { email, error: "We couldn't create your account. Try again." };
  }

  // With email confirmation off, Supabase signs the user in right away.
  if (data.session && data.user) {
    await ensureProfile(data.user.id);
    redirect(next);
  }

  // Otherwise a confirmation email is on its way. Supabase gives the same answer for
  // addresses that already have an account, so nobody can probe which emails are registered.
  return { email, sent: true };
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
