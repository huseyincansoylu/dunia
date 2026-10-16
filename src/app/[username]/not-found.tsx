import Link from "next/link";
import { DuniaLogo, DuniaMark } from "@/components/brand/dunia-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ProfileNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5">
      <header className="flex h-14 items-center">
        <Link href="/" aria-label="Dunia home" className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <DuniaLogo className="text-lg" />
        </Link>
      </header>
      <main className="grid justify-items-start gap-5 py-10">
        <DuniaMark level={0} className="size-14" />
        <h1 className="text-3xl font-extrabold">There&apos;s no map here</h1>
        <p className="max-w-[44ch] text-muted-foreground">
          This page doesn&apos;t exist or is private. Check the link, or make a map of your own.
        </p>
        <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-xl px-5 text-base")}>
          Create your map
        </Link>
      </main>
    </div>
  );
}
