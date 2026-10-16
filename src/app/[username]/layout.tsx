import Link from "next/link";
import { DuniaLogo } from "@/components/brand/dunia-logo";

/** Shared frame for public profiles and their not-found page. Mobile first: most visits come from Instagram. */
export default function ProfileLayout({ children }: LayoutProps<"/[username]">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-4 pt-4 sm:px-6">
        <Link href="/" aria-label="Dunia home" className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <DuniaLogo className="text-xl" />
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-6 pb-12 sm:px-6">{children}</main>
    </div>
  );
}
