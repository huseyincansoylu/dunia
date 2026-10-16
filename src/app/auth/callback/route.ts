import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth";
import { ensureProfile } from "@/lib/profiles";
import { createClient } from "@/lib/supabase/server";

/**
 * Email links (sign-up confirmation, password reset) land here with a one-time
 * ?code=. Exchange it for a session cookie, then continue to ?next=.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      await ensureProfile(data.user.id);
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // An expired reset link should lead back to requesting a new one, anything else to sign-in.
  const fallback = new URL(next === "/reset-password" ? "/forgot-password" : "/login", origin);
  fallback.searchParams.set("error", "link");
  if (next !== "/reset-password") fallback.searchParams.set("next", next);
  return NextResponse.redirect(fallback);
}
