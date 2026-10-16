import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  // People type usernames the Instagram way: dunia/@ece → dunia/ece.
  const { pathname } = request.nextUrl;
  if (/^\/(@|%40)[^/]+\/?$/.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/" + pathname.replace(/^\/(@|%40)/, "").replace(/\/$/, "");
    return NextResponse.redirect(url, 308);
  }
  // Usernames are lowercase, so dunia/Ece and dunia/ece are the same page; keep one address.
  if (/^\/[A-Za-z0-9_]+$/.test(pathname) && /[A-Z]/.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.toLowerCase();
    return NextResponse.redirect(url, 308);
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    // Skip static files, image optimization and metadata images.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
