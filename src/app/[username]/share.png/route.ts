import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProfileByUsername } from "@/lib/profiles";
import { renderShareImage, type ShareFormat } from "@/lib/share-image";
import { normalizeUsername, usernameProblem } from "@/lib/username";

/**
 * The shareable image of a profile: ?format=story|post, plus ?name=0, ?globe=0 and
 * ?theme=light to turn options off. The Share tab links it with ?v=<hash of the countries>.
 */
export async function GET(request: NextRequest, { params }: RouteContext<"/[username]/share.png">) {
  const username = normalizeUsername(decodeURIComponent((await params).username));
  if (usernameProblem(username)) return new Response("Not found", { status: 404 });

  const profile = await getProfileByUsername(username);
  if (!profile) return new Response("Not found", { status: 404 });
  if (!profile.isPublic) {
    const viewer = await getCurrentUser();
    if (viewer?.id !== profile.id) return new Response("Not found", { status: 404 });
  }

  const q = request.nextUrl.searchParams;
  const format: ShareFormat = q.get("format") === "post" ? "post" : "story";
  const image = await renderShareImage(profile, {
    format,
    showName: q.get("name") !== "0",
    showGlobe: q.get("globe") !== "0",
    dark: q.get("theme") !== "light",
  });

  image.headers.set("Cache-Control", profile.isPublic ? "public, max-age=31536000, immutable" : "private, no-store");
  image.headers.set("Content-Disposition", `inline; filename="dunia-${username}-${format}.png"`);
  return image;
}
