import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SessionUser = { id: string; email: string | undefined };

/** The signed-in user, verified from the session JWT, or null. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return { id: claims.sub, email: claims.email };
}

/** For pages behind sign-in. src/proxy.ts redirects first; this is the second line of defense. */
export async function requireUser(next: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

/** Only allow same-site paths after sign-in, so ?next= can't send people to another site. */
export function safeNextPath(next: string | null | undefined, fallback = "/atlas"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
