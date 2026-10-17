"use client";

import { useState } from "react";
import { CopyIcon, DownloadIcon, ExternalLinkIcon, ShareIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "story" | "post" | "link";

const MODES: { value: Mode; label: string }[] = [
  { value: "story", label: "Story" },
  { value: "post", label: "Post" },
  { value: "link", label: "Bio link" },
];

type ShareViewProps = {
  username: string;
  /** The deployed site, e.g. https://duniamap.vercel.app */
  siteUrl: string;
  /** Changes with the countries, so the image URL never serves an old picture. */
  version: string;
  isPublic: boolean;
};

/** The Share tab: a story or post image of the map, or the link for the bio. */
export function ShareView({ username, siteUrl, version, isPublic }: ShareViewProps) {
  const [mode, setMode] = useState<Mode>("story");
  const [showName, setShowName] = useState(true);
  const [showGlobe, setShowGlobe] = useState(true);
  const [dark, setDark] = useState(true);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const pageUrl = `${siteUrl}/${username}`;
  const displayUrl = pageUrl.replace(/^https?:\/\//, "");
  const format = mode === "post" ? "post" : "story";
  const imageSrc = `/${username}/share.png?${new URLSearchParams({
    format,
    name: showName ? "1" : "0",
    globe: showGlobe ? "1" : "0",
    theme: dark ? "dark" : "light",
    v: version,
  })}`;
  const filename = `dunia-${username}-${format}.png`;

  const shareImage = async () => {
    setStatus(null);
    try {
      const blob = await (await fetch(imageSrc)).blob();
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Dunia map" });
        return;
      }
      // No share sheet with files (most desktops): save it instead.
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
      setStatus("Image saved. Post it from your photos.");
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") setStatus("Couldn't prepare the image. Try again.");
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setStatus("Link copied.");
    } catch {
      setStatus(`Copy this link: ${displayUrl}`);
    }
  };

  return (
    <div className="flex flex-col gap-3.5">
      <div role="tablist" aria-label="Format" className="grid grid-cols-3 rounded-xl bg-secondary p-[3px]">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            role="tab"
            aria-selected={mode === m.value}
            onClick={() => {
              setMode(m.value);
              setStatus(null);
            }}
            className={cn(
              "h-9 rounded-[9px] text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              mode === m.value ? "bg-card font-semibold text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "link" ? (
        <section className="flex flex-col gap-3">
          {!isPublic && (
            <p className="rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground">
              Your page is private, so only you can open this link.
            </p>
          )}
          <div className="flex flex-col gap-3 rounded-[22px] bg-deep p-5 text-deep-foreground">
            <span className="text-[13px] text-deep-muted">Your page</span>
            <span className="font-mono text-lg break-all text-white">{displayUrl}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void copyLink()}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white text-[15px] font-semibold text-deep outline-none focus-visible:ring-3 focus-visible:ring-white/50"
              >
                <CopyIcon className="size-4" aria-hidden="true" />
                Copy link
              </button>
              <a
                href={`/${username}`}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 text-[15px] font-medium text-white outline-none focus-visible:ring-3 focus-visible:ring-white/50"
              >
                <ExternalLinkIcon className="size-4" aria-hidden="true" />
                Open
              </a>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            On Instagram: <strong className="font-semibold text-foreground">Edit profile → Links → Add external link</strong>, then paste it.
          </p>
        </section>
      ) : (
        <>
          <div className="flex items-start gap-3.5">
            <div
              className={cn(
                "relative shrink-0 overflow-hidden rounded-[18px] bg-muted shadow-lg",
                format === "story" ? "aspect-[9/16] w-[46%]" : "aspect-square w-[52%]"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- generated per request, nothing to optimize */}
              <img
                src={imageSrc}
                alt={`Preview of your ${format} image`}
                onLoad={() => setLoadedSrc(imageSrc)}
                className={cn("size-full transition-opacity", loadedSrc === imageSrc ? "opacity-100" : "opacity-40")}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <Toggle label="Show my name" checked={showName} onChange={setShowName} />
              <Toggle label="Show the globe" checked={showGlobe} onChange={setShowGlobe} />
              <Toggle label="Dark background" checked={dark} onChange={setDark} />
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {format === "story" ? "1080 × 1920, for Instagram, WhatsApp and TikTok stories." : "1080 × 1080, for a feed post."}
              </p>
            </div>
          </div>

          <div className="mt-1 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => void shareImage()}
              className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-deep text-base font-semibold text-deep-foreground outline-none hover:bg-deep/90 focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-primary dark:text-primary-foreground"
            >
              <ShareIcon className="size-[18px]" aria-hidden="true" />
              Share {format}
            </button>
            <a
              href={imageSrc}
              download={filename}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl border bg-card text-[15px] font-semibold outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <DownloadIcon className="size-[18px]" aria-hidden="true" />
              Save image
            </a>
          </div>
        </>
      )}

      <p role="status" aria-live="polite" className="min-h-5 text-center text-sm text-muted-foreground">
        {status}
      </p>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-2 border-b text-sm">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "flex h-[26px] w-11 shrink-0 rounded-full p-[3px] transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          checked ? "justify-end bg-primary" : "justify-start bg-land"
        )}
      >
        <span className="size-5 rounded-full bg-white shadow-sm" />
      </button>
    </div>
  );
}
