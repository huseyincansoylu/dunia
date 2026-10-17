import { SAMPLE_PROFILE } from "@/components/landing/sample";
import { renderGlobeSvg } from "@/lib/globe-svg";

// The landing page's globe: the example traveler's countries. Built once at build time.
export function GET() {
  return new Response(renderGlobeSvg(SAMPLE_PROFILE.visited), {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
  });
}
