"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartNoAxesColumnIcon, MapIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Tabs appear here as their pages ship: Wishlist, Share and Me come next.
const TABS = [
  { href: "/atlas", label: "Map", Icon: MapIcon },
  { href: "/atlas/stats", label: "Stats", Icon: ChartNoAxesColumnIcon },
];

/** The signed-in app's bottom tab bar. */
export function AppTabs() {
  const pathname = usePathname();

  return (
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
  );
}
