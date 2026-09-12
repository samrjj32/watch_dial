# watch_dial — JellyLab Casio Royale Builder (Next.js)

A Next.js port of the JellyLab Watches "Custom Casio Royale" builder, rebuilt from
the original Shopify storefront modules (`jellylab-catalog`, `jellylab-renderer`,
`jellylab-decals`, `jellylab-text-removal`). Catalog data, prices, aperture geometry
and the design system are ports of that source rather than approximations.

It is the configurator alone: no site chrome, no cart, no checkout. There is no
header, no fixed purchase bar and no "Add to cart" — the page is meant to sit
inside a host that provides those.

## Features

- **Live watch preview** — the original canvas pixel pipeline is reproduced as a
  single composited SVG: the case photo, the band clipped to the strap region, the
  text-removal patch masked per label, the window filters as `multiply` fills, and
  the circle decal clipped to the aperture. Every aperture path and the decal
  placement (centre 393 × 558.5, 164 px) come from the source, so the hotspots line
  up with the artwork exactly.
- **Step 1 · Case** — the three stock watches, each sold complete with the band it
  ships on: black on rubber (included), silver on the steel bracelet (+$40), gold on
  brown leather (+$35). The band is not a separate choice — `normalizeBuild` derives
  it from the case, so no stored build or link can separate the two.
- **Step 2 · Windows** — four apertures, nine solid filters, six three-stop
  gradients, thirteen circle decals with transparent or opaque finishes. A gradient
  can be extended across every window as one continuous sweep.
- **Step 3 · Text removal** — pick the printed legends (and the analog numbers ring)
  to remove; $25 per watch regardless of how many.
- **Pricing** — USD, in cents: $145 for the black watch, $180 gold, $185 silver,
  plus $25 if any text is removed. The breakdown sits at the foot of the controls.
- **Shareable builds** — "Copy link to build" writes the configuration to the URL
  hash; the same state is kept in `sessionStorage` between reloads.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project structure

```
app/
  layout.tsx        Root layout, metadata, Inter + CDN preconnects
  page.tsx          Renders the builder
  globals.css       The ported design system, scoped to .jellylab-royale-builder
components/
  Builder.tsx       Sections, pricing, keyboard radiogroups, persistence
  WatchPreview.tsx  The composited watch SVG and its aperture hotspots
  MiniWatch.tsx     Window-picker diagram, sharing the renderer's aperture paths
lib/
  catalog.ts        Cases, bands, filters, windows, decals, text removal, pricing
  assets.ts         CDN artwork URLs
```

## Notes

- Artwork is hotlinked from the original Shopify CDN and the store's theme assets.
  Every layer degrades gracefully when an asset is unavailable: the preview shows a
  retry message, decorative images collapse instead of showing a broken glyph, and
  the gold case (served as a base64 `.image.txt` payload) falls back to a tinted
  silver render.
- Case photos are 1033 × 1523; the live preview crops to 1033 × 1470 so the caption
  baked into the bottom of each photo never appears.
