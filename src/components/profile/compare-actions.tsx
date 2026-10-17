"use client";

import { useState } from "react";
import { CheckIcon, ShareIcon } from "lucide-react";
import { wishlistCountries } from "@/app/atlas/actions";

type CompareActionsProps = {
  /** Their countries you haven't been to and haven't wishlisted yet. */
  toWishlist: string[];
  myUsername: string;
};

export function CompareActions({ toWishlist, myUsername }: CompareActionsProps) {
  const [added, setAdded] = useState(false);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const addAll = async () => {
    setPending(true);
    setStatus(null);
    const result = await wishlistCountries(toWishlist);
    setPending(false);
    if (result.ok) setAdded(true);
    else setStatus(result.error);
  };

  // Sends friends to a comparison with this user's map: they see their own overlap.
  const share = async () => {
    const url = `${window.location.origin}/${myUsername}/compare`;
    const text = "How does your map compare with mine?";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Dunia", text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setStatus("Link copied. Send it to a friend.");
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") setStatus(`Share this link: ${url}`);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {(toWishlist.length > 0 || added) && (
        <button
          type="button"
          onClick={() => void addAll()}
          disabled={pending || added}
          className="flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-80"
        >
          {added ? (
            <>
              <CheckIcon className="size-[18px]" aria-hidden="true" />
              Added to your wishlist
            </>
          ) : pending ? (
            "Adding…"
          ) : (
            `Add ${toWishlist.length === 1 ? "it" : `all ${toWishlist.length}`} to my wishlist`
          )}
        </button>
      )}
      <button
        type="button"
        onClick={() => void share()}
        className="flex h-12 items-center justify-center gap-2 rounded-2xl border bg-card text-[15px] font-semibold outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ShareIcon className="size-[18px]" aria-hidden="true" />
        Ask friends to compare
      </button>
      <p role="status" aria-live="polite" className="min-h-5 text-center text-sm text-muted-foreground">
        {status}
      </p>
    </div>
  );
}
