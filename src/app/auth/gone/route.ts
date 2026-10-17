import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { accountExists } from "@/lib/profiles";
import { createClient } from "@/lib/supabase/server";

/**
 * Where a session ends up when its account was deleted (on another device, say):
 * the token is still valid for a while, so clear it here. Signs out only accounts
 * that no longer exist, so a link to this page can't sign anyone else out.
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (user && !(await accountExists(user.id))) {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "local" });
  }
  return NextResponse.redirect(new URL("/", request.nextUrl.origin), { status: 303 });
}
