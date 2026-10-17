"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookmarkIcon, ChartNoAxesColumnIcon, MapIcon, ShareIcon, UserRoundIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/atlas", label: "Map", Icon: MapIcon },
  { href: "/atlas/stats", label: "Stats", Icon: ChartNoAxesColumnIcon },
  { href: "/atlas/wishlist", label: "Wishlist", Icon: BookmarkIcon },
  { href: "/atlas/share", label: "Share", Icon: ShareIcon },
  { href: "/atlas/me", label: "Me", Icon: UserRoundIcon },
];

/** The signed-in app's bottom tab bar. */
export function AppTabs() {
  const pathname = usePathname();
  // The first-run flow is full screen.
  if (pathname === "/atlas/start") return null;

  return (
    <>
      {/* Keeps the end of each page clear of the fixed bar. */}
      <div aria-hidden="true" className="h-[calc(4rem+env(safe-area-inset-bottom))] shrink-0" />
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      >
        <ul className="mx-auto grid max-w-md" style={{ gridTemplateColumns: `repeat(${TABS.length}, minmax(0, 1fr))` }}>
          {TABS.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 text-[11px] outline-none focus-visible:bg-secondary",
                    active ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="size-[22px]" strokeWidth={2} aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
