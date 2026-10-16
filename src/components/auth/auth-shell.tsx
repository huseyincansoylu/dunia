import Link from "next/link";
import { Suspense } from "react";
import { DuniaLogo } from "@/components/brand/dunia-logo";
import { ThemeToggle } from "@/components/theme-toggle";

/** Centered column shared by the sign-in, sign-up and password pages. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-sm gap-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="Dunia home" className="w-fit">
            <DuniaLogo />
          </Link>
          <ThemeToggle />
        </div>
        {/* The content reads cookies or search params, so it renders per request. */}
        <Suspense fallback={<div className="h-80" />}>{children}</Suspense>
      </div>
    </main>
  );
}

export function AuthHeading({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      {children && <p className="text-muted-foreground">{children}</p>}
    </div>
  );
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-medium text-primary underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}
