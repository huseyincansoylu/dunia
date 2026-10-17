import { getCurrentUser } from "@/lib/auth";
import { renderGlobeSvg } from "@/lib/globe-svg";
import { getProfileByUsername } from "@/lib/profiles";
import { normalizeUsername, usernameProblem } from "@/lib/username";

/**
 * The profile globe's first frame. The page links it with ?v=<hash of the countries>,
 * so a public profile's image can be cached for good: new countries mean a new URL.
 */
export async function GET(_request: Request, { params }: RouteContext<"/[username]/globe.svg">) {
  const username = normalizeUsername(decodeURIComponent((await params).username));
  if (usernameProblem(username)) return new Response("Not found", { status: 404 });

  const profile = await getProfileByUsername(username);
  if (!profile) return new Response("Not found", { status: 404 });

  // Private profiles: only their owner, and never from a shared cache.
  if (!profile.isPublic) {
    const viewer = await getCurrentUser();
    if (viewer?.id !== profile.id) return new Response("Not found", { status: 404 });
  }

  return new Response(renderGlobeSvg(profile.visited), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": profile.isPublic ? "public, max-age=31536000, immutable" : "private, no-store",
    },
  });
}
