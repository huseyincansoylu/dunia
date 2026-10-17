import type { Metadata } from "next";
import { Suspense } from "react";
import { WishlistView } from "@/components/atlas/wishlist-view";
import { requireUser } from "@/lib/auth";
import { suggestNearby } from "@/lib/neighbors";
import { isCounted } from "@/lib/visit-status";
import { getAtlasEntries } from "@/lib/visits";

export const metadata: Metadata = { title: "Want to go" };

export default function WishlistPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 pt-3 pb-6">
      <Suspense fallback={<WishlistSkeleton />}>
        <Wishlist />
      </Suspense>
    </main>
  );
}

async function Wishlist() {
  const user = await requireUser("/atlas/wishlist");
  const entries = await getAtlasEntries(user.id);
  const wishlist = entries.filter((e) => e.status === "want").map((e) => e.iso2);
  const visited = entries.filter((e) => isCounted(e.status)).map((e) => e.iso2);
  const suggestions = suggestNearby(visited, new Set(entries.map((e) => e.iso2)));

  return <WishlistView initialWishlist={wishlist} initialSuggestions={suggestions} />;
}

function WishlistSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading your wishlist">
      <div className="h-11 w-40 animate-pulse rounded-lg bg-muted" />
      <div className="h-64 animate-pulse rounded-[22px] bg-muted" />
    </div>
  );
}
