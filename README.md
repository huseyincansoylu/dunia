# Dunia

**Every country you've visited, a color on your map.**

Dunia lets travelers mark the countries they've been to, see their count (the "42/197" you see in Instagram bios) and share their map.

*Dunia* means "world" in Indonesian, Malay and Swahili. The word comes from Arabic *dunyā* ("the nearest one") and travelled with merchants across the Indian Ocean into Turkish, Persian, Hindi and more. Our name has travelled too.

## Status

Early MVP, web first (mobile responsive).

- [x] Brand and "Muson" theme (light and dark)
- [x] Country dataset (197 countries)
- [x] Interactive world map, counter, continent breakdown, country search
- [ ] Instagram story share image
- [ ] Accounts and public profile pages (`/username`)
- [ ] More languages (country names already exist in English and Turkish)

## Tech stack

| | |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, [shadcn/ui](https://ui.shadcn.com) (Base UI) |
| Map | Natural Earth via [world-atlas](https://github.com/topojson/world-atlas), pre-rendered to SVG paths with d3-geo |
| Fonts | Funnel Display (headings), Geist, Geist Mono |

## Getting started

Requires Node.js 22+ and pnpm.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command | What it does |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm generate:countries` | Regenerate `src/data/countries.json` |
| `pnpm generate:map` | Regenerate `src/data/world-map.json` (run after the countries) |

## Project structure

```
src/
  app/                 Routes, layout, global theme (globals.css), icons
  components/
    atlas/             World map, counter, continent bars, country search
    brand/             Dunia logo and mark
    ui/                shadcn components
  data/                Country dataset, map paths and helpers
  hooks/               use-atlas (visited countries, stored in localStorage)
scripts/               Data generators
```

## Data

### Countries

`src/data/countries.json` is generated, so edit `scripts/generate-countries.mts` and rerun it instead of editing the JSON.

- **197 countries**: the 193 UN member states, the two UN observer states (Vatican City, Palestine), plus Kosovo and Taiwan. Each country's `tier` records which of those groups it belongs to.
- **Continents** follow the UN M49 geoscheme, so Türkiye, Cyprus and the Caucasus are in Asia and Russia is in Europe. The Americas are split into North (including Central America and the Caribbean) and South.
- **Names** come from CLDR (`Intl.DisplayNames`), with a few overrides where CLDR's wording isn't what people say. To add a language, add its code to `LOCALES` in the script and in `src/data/countries.ts`.

### Map

`src/data/world-map.json` holds ready-to-render SVG paths, so the browser never loads d3 or TopoJSON. Shapes come from Natural Earth 1:110m. Countries too small to tap at that scale (or missing from it) get a dot at their centroid from the 1:50m data. Tuvalu, missing from both, is placed by hand.

## Theme

The "Muson" palette is defined as CSS variables in `src/app/globals.css`:

- **Indian Ocean blue** (`primary`) for actions and the logo ring.
- **Saffron** (`visited`) means "visited", in both themes. Don't use it for anything else, not even warnings.
- `land` and `sea` color the map.

Use them as Tailwind classes, for example `bg-visited`, `text-primary`, `fill-land`.

The full brand board (story, palette, logo, light and dark previews) lives in the Dunia Marka Tahtası artifact on claude.ai.
