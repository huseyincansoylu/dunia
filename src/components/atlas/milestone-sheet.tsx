"use client";

import Link from "next/link";
import { XIcon } from "lucide-react";
import { getCountry } from "@/data/countries";
import { DuniaMark } from "@/components/brand/dunia-logo";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { milestoneHeadline, nextMilestone } from "@/lib/milestones";

const TOTAL = 197;

export type Milestone = { count: number; country: string | null };

const ordinal = (n: number) => {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
};

/** Full-screen celebration when the map reaches 5, 10, 25, 50… countries. */
export function MilestoneSheet({ milestone, onClose }: { milestone: Milestone | null; onClose: () => void }) {
  const next = milestone ? nextMilestone(milestone.count) : null;
  const country = milestone?.country ? getCountry(milestone.country)?.name.en : undefined;

  return (
    <Sheet open={milestone !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto h-dvh max-w-md gap-0 border-0 bg-deep p-0 text-deep-foreground data-[side=bottom]:h-dvh"
      >
        {milestone && (
          <div className="flex flex-1 flex-col items-center gap-[22px] px-6 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))] text-center">
            <div className="flex h-11 w-full justify-end">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid size-11 place-items-center rounded-full bg-white/10 text-white outline-none hover:bg-white/15 focus-visible:ring-3 focus-visible:ring-white/50"
              >
                <XIcon className="size-[18px]" aria-hidden="true" />
              </button>
            </div>
            <span className="font-mono text-xs tracking-[0.16em] text-deep-muted">MILESTONE</span>
            <DuniaMark tone="onDeep" level={milestone.count / TOTAL} className="size-[200px]" />
            <div className="flex flex-col gap-1.5">
              <p className="font-heading text-[112px] leading-[0.85] font-extrabold tracking-[-0.06em] text-white tabular-nums">
                {milestone.count}
              </p>
              <p className="text-lg text-deep-foreground/80">countries</p>
            </div>
            <SheetTitle className="max-w-[14ch] font-heading text-[28px] leading-[1.15] font-extrabold tracking-[-0.02em] text-white">
              {milestoneHeadline(milestone.count)}
            </SheetTitle>
            <SheetDescription className="text-[15px] text-deep-muted">
              {country ? `Your ${ordinal(milestone.count)} was ${country}.` : ""}
              {next ? ` Next stop: ${next}.` : " You've seen them all."}
            </SheetDescription>
            <div className="mt-auto flex w-full flex-col gap-2.5">
              <Link
                href="/atlas/share"
                className="flex h-14 items-center justify-center rounded-2xl bg-white text-base font-semibold text-deep outline-none hover:bg-white/90 focus-visible:ring-3 focus-visible:ring-white/50"
              >
                Share this
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="h-12 rounded-2xl text-[15px] font-medium text-deep-foreground/80 outline-none hover:text-white focus-visible:ring-3 focus-visible:ring-white/50"
              >
                Keep going
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
