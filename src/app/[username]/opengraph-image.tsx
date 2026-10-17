import { connection } from "next/server";
import { getProfileByUsername } from "@/lib/profiles";
import { renderBrandImage, renderShareImage, SHARE_FORMATS } from "@/lib/share-image";
import { normalizeUsername, usernameProblem } from "@/lib/username";

export const alt = "A Dunia travel map";
export const size = SHARE_FORMATS.og;
export const contentType = "image/png";

/**
 * The link preview for dunia/<username>. Crawlers are anonymous, so a private or
 * missing profile gets the generic Dunia image: nothing about the person leaks.
 */
export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  await connection();
  const username = normalizeUsername(decodeURIComponent((await params).username));
  const profile = usernameProblem(username) ? null : await getProfileByUsername(username);
  if (!profile?.isPublic) return renderBrandImage();
  // The name is already the preview's title; the handle is enough here.
  return renderShareImage(profile, { format: "og", showName: false, showGlobe: true, dark: true });
}
