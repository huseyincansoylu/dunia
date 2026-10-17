import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { visitStats } from "@/data/countries";
import { renderGlobeSvg } from "@/lib/globe-svg";

export const SHARE_FORMATS = {
  story: { width: 1080, height: 1920 },
  post: { width: 1080, height: 1080 },
  /** Link previews (WhatsApp, iMessage, X…). */
  og: { width: 1200, height: 630 },
} as const;
export type ShareFormat = keyof typeof SHARE_FORMATS;

export type ShareOptions = {
  format: ShareFormat;
  /** Show the display name above the handle. */
  showName: boolean;
  /** Show the globe. */
  showGlobe: boolean;
  dark: boolean;
};

const THEMES = {
  dark: { bg: "#0a2233", fg: "#ffffff", muted: "#9db3bf", ring: "#4fb3d9" },
  light: { bg: "#f7fafb", fg: "#0a2233", muted: "#4f6573", ring: "#0b4f6c" },
};

// The brand fonts, read once per server instance. next/og needs TTF, so they live in assets/fonts.
let fonts: Promise<{ name: string; data: Buffer; weight: 400 | 500 | 800 }[]> | undefined;
function loadFonts() {
  fonts ??= Promise.all([
    readFile(join(process.cwd(), "assets/fonts/FunnelDisplay-800.ttf")).then((data) => ({ name: "Funnel Display", data, weight: 800 as const })),
    readFile(join(process.cwd(), "assets/fonts/Geist-400.ttf")).then((data) => ({ name: "Geist", data, weight: 400 as const })),
    readFile(join(process.cwd(), "assets/fonts/Geist-500.ttf")).then((data) => ({ name: "Geist", data, weight: 500 as const })),
  ]);
  return fonts;
}

const svgDataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

/** The Dunia mark (globe ring with a saffron wave) at a given fill level. */
function markSvg(ring: string, level: number) {
  const y = (53 - Math.min(1, Math.max(0, level)) * 42).toFixed(1);
  const wave = level > 0 ? `<g clip-path="url(#c)"><path d="M0 ${y}q8 -4.5 16 0t16 0t16 0t16 0V64H0Z" fill="#f4a62a"/></g>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><clipPath id="c"><circle cx="32" cy="32" r="21.5"/></clipPath></defs><circle cx="32" cy="32" r="27" fill="none" stroke="${ring}" stroke-width="7"/>${wave}</svg>`;
}

type Person = { username: string; displayName: string | null; visited: readonly string[] };

/** A shareable image of someone's map: a 9:16 story or a 1:1 post. */
export async function renderShareImage(person: Person, options: ShareOptions): Promise<ImageResponse> {
  const { width, height } = SHARE_FORMATS[options.format];
  const story = options.format === "story";
  const wide = options.format === "og";
  const t = options.dark ? THEMES.dark : THEMES.light;
  const stats = visitStats(person.visited);
  const globe = svgDataUri(renderGlobeSvg(person.visited, { glow: options.dark }));
  const mark = svgDataUri(markSvg(t.ring, stats.visited / stats.total));
  const continents = `${stats.continentsVisited} ${stats.continentsVisited === 1 ? "continent" : "continents"}`;

  const handle = (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {options.showName && person.displayName && (
        <div style={{ fontSize: story ? 44 : 38, fontWeight: 500, color: t.fg }}>{person.displayName}</div>
      )}
      <div style={{ fontSize: story ? 36 : 30, color: t.muted }}>{`@${person.username}`}</div>
    </div>
  );

  const count = (
    <div style={{ display: "flex", flexDirection: "column", gap: story ? 24 : 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", fontFamily: "Funnel Display", fontWeight: 800, color: t.fg, letterSpacing: "-0.05em" }}>
        <span style={{ fontSize: 340, lineHeight: 0.85 }}>{stats.visited}</span>
        <span style={{ fontSize: story ? 120 : 84, color: t.muted, letterSpacing: "-0.02em" }}>{`/${stats.total}`}</span>
      </div>
      <div style={{ fontSize: story ? 42 : 34, color: t.muted }}>
        {`${stats.visited === 1 ? "country" : "countries"} · ${stats.percent}% of the world · ${continents}`}
      </div>
    </div>
  );

  const logo = (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img */}
      <img src={mark} width={story ? 52 : wide ? 38 : 44} height={story ? 52 : wide ? 38 : 44} alt="" />
      <span style={{ fontFamily: "Funnel Display", fontWeight: 800, fontSize: story ? 56 : wide ? 40 : 46, color: t.fg, letterSpacing: "-0.03em" }}>dunia</span>
    </div>
  );

  const footer = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%" }}>
      {handle}
      <div style={{ fontSize: story ? 34 : 28, color: t.muted }}>{`dunia/${person.username}`}</div>
    </div>
  );

  const body = story ? (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "96px 88px 104px", background: t.bg, fontFamily: "Geist" }}>
      {logo}
      {options.showGlobe ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img */}
          <img src={globe} width={920} height={920} alt="" />
        </div>
      ) : (
        <div style={{ display: "flex", flex: 1 }} />
      )}
      <div style={{ display: "flex", marginTop: options.showGlobe ? 24 : 0 }}>{count}</div>
      <div style={{ display: "flex", flex: 1 }} />
      {footer}
    </div>
  ) : (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: wide ? "52px 72px" : "72px 76px", background: t.bg, fontFamily: "Geist" }}>
      {logo}
      <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", gap: wide ? 12 : 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", fontFamily: "Funnel Display", fontWeight: 800, color: t.fg, letterSpacing: "-0.05em" }}>
            <span style={{ fontSize: wide ? 200 : 230, lineHeight: 0.85 }}>{stats.visited}</span>
            <span style={{ fontSize: wide ? 74 : 86, color: t.muted, letterSpacing: "-0.02em" }}>{`/${stats.total}`}</span>
          </div>
          {options.showGlobe && (
            // eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img
            <img src={globe} width={wide ? 310 : 400} height={wide ? 310 : 400} alt="" />
          )}
        </div>
        <div style={{ fontSize: wide ? 30 : 34, color: t.muted }}>
          {`${stats.visited === 1 ? "country" : "countries"} · ${stats.percent}% of the world · ${continents}`}
        </div>
      </div>
      {footer}
    </div>
  );

  return new ImageResponse(body, { width, height, fonts: (await loadFonts()).map((f) => ({ ...f, style: "normal" as const })) });
}

/** For link previews of pages that aren't a public profile: the brand and its promise. */
export async function renderBrandImage(): Promise<ImageResponse> {
  const { width, height } = SHARE_FORMATS.og;
  const t = THEMES.dark;
  const globe = svgDataUri(renderGlobeSvg(["TR", "FR", "IT", "ES", "GR", "EG", "MA", "IN", "KE", "JP", "BR", "US"], { glow: true }));
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", padding: "56px 72px", background: t.bg, fontFamily: "Geist", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img */}
            <img src={svgDataUri(markSvg(t.ring, 0.45))} width={44} height={44} alt="" />
            <span style={{ fontFamily: "Funnel Display", fontWeight: 800, fontSize: 46, color: t.fg, letterSpacing: "-0.03em" }}>dunia</span>
          </div>
          <div style={{ fontFamily: "Funnel Display", fontWeight: 800, fontSize: 64, lineHeight: 1.02, color: t.fg, letterSpacing: "-0.035em" }}>
            Every country you&apos;ve visited, a color on your map.
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img */}
        <img src={globe} width={440} height={440} alt="" />
      </div>
    ),
    { width, height, fonts: (await loadFonts()).map((f) => ({ ...f, style: "normal" as const })) }
  );
}
