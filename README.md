# watch_dial — JellyLab Casio Royale Builder (Next.js)

A Next.js port of the JellyLab Watches "Custom Casio Royale" builder, rebuilt from
the original Shopify storefront modules (`jellylab-catalog`, `jellylab-renderer`,
`jellylab-decals`, `jellylab-engraving`, `jellylab-text-removal`,
`jellylab-backplate-renderer`). Catalog data, prices, aperture geometry and the
design system are ports of that source rather than approximations.

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
- **Step 4 · Laser engraving** — three Liberation faces, two rows of up to 25
  graphemes, previewed on a caseback render; $25.
- **Step 5 · Watch box** — colour preference, included.
- **Pricing** — USD, in cents: $145 for the black watch, $180 gold, $185 silver,
  plus $25 for each finishing service, and the $150 free-US-shipping threshold drives the purchase bar.
- **Shareable builds** — "Copy link to build" writes the configuration to the URL
  hash; the same state is kept in `sessionStorage` between reloads.
- **Cart** — a modal drawer with per-item previews, build codes, quantities and a
  prototype checkout summary. No payment backend.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project structure

```
app/
  layout.tsx           Root layout, metadata, Inter + CDN preconnects
  page.tsx             Renders the builder
  globals.css          The ported design system, scoped to .jellylab-royale-builder
components/
  Builder.tsx          Sections, pricing, keyboard radiogroups, persistence, cart
  WatchPreview.tsx     The composited watch SVG and its aperture hotspots
  MiniWatch.tsx        Window-picker diagram, sharing the renderer's aperture paths
  BackplatePreview.tsx Caseback with the factory block and the engraved rows
  CartDrawer.tsx       Cart dialog and prototype checkout
lib/
  catalog.ts           Cases, bands, filters, windows, decals, engraving, pricing
  assets.ts            CDN artwork URLs and the engraving font files
```

## Notes

- Artwork is hotlinked from the original Shopify CDN and the store's theme assets.
  Every layer degrades gracefully when an asset is unavailable: the preview shows a
  retry message, decorative images collapse instead of showing a broken glyph, and
  the gold case (served as a base64 `.image.txt` payload) falls back to a tinted
  silver render.
- Case photos are 1033 × 1523; the live preview crops to 1033 × 1470 so the caption
  baked into the bottom of each photo never appears.
- There is no checkout — "Add to cart" builds the Shopify-style line-item
  properties and opens the cart drawer.
