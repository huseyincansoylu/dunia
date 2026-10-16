import Link from "next/link";
import { DuniaLogo } from "@/components/brand/dunia-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Calls to action lead to sign-up; signed-in visitors are sent on to their map.
export const APP_HREF = "/signup";

const NAV = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#your-page", label: "Your page" },
  { href: "#our-name", label: "Our name" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" aria-label="Dunia home" className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <DuniaLogo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle className="mr-2 hidden lg:inline-flex" />
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "hidden h-10 rounded-xl px-3 sm:inline-flex")}>
            Sign in
          </Link>
          <Link href={APP_HREF} className={cn(buttonVariants(), "h-10 rounded-xl px-4")}>
            Create your map
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <div className="flex items-center gap-3">
          <DuniaLogo className="text-lg text-foreground" />
          <span>Every country you&apos;ve visited, a color on your map.</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <p>© Dunia</p>
        </div>
      </div>
    </footer>
  );
}
