# watch_dial — ZZZ Culture Casio Royale Builder (Next.js)

A ZZZ Culture Casio Royale builder. It began as a Next.js port of the JellyLab
Watches storefront page — the renderer, aperture geometry and text-removal
registration are ports of that source (`jellylab-catalog`, `jellylab-renderer`,
`jellylab-decals`, `jellylab-text-removal`) rather than approximations — and the
catalog, prices and branding are now ZZZ Culture's own.

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
- **Step 1 · Model** — the three stock watches, each sold complete with the band it
  ships on: AE-1200WH-1AV black on rubber (₹2,995), AE-1200WHD-1AV silver on the
  steel bracelet (₹3,995), AE-1200WHL-5AV brown on leather (₹4,495). The band is not
  a separate choice — `normalizeBuild` derives it from the model, so no stored build
  or link can separate the two.
- **Step 2 · Windows** — four apertures, nine solid filters, six three-stop
  gradients, thirteen circle decals with transparent or opaque finishes. A gradient
  can be extended across every window as one continuous sweep.
- **Step 3 · Text removal** — pick the printed legends (and the analog numbers ring)
  to remove; ₹500 per watch regardless of how many.
- **Pricing** — whole rupees. The watch is the base price; colouring a window is
  ₹500 each, except that one colour across all four is ₹1,000 rather than ₹2,000,
  so filling every aperture the same way costs less than doing three separately. A
  circle decal is ₹500 and takes the circle out of the window count. The breakdown
  sits at the foot of the controls.
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
  ZzzMark.tsx       The ZZZ Culture mark, drawn as SVG paths
lib/
  catalog.ts        Models, bands, filters, windows, decals, text removal, pricing
  assets.ts         CDN artwork URLs
```

## Branding

The ZZZ Culture mark is drawn as SVG paths in `ZzzMark.tsx` — three stepped Zs,
blue inside a cream keyline inside a black outline, following the embroidered
patch. It is a stand-in built from the patch photograph, not the artwork itself;
drop the real file in and swap the component if you have vector art. The palette
tokens (`--brand`, `--cream`) at the top of `globals.css` carry the patch colours.

## Notes

- Artwork is hotlinked from the original Shopify CDN and the store's theme assets.
  Every layer degrades gracefully when an asset is unavailable: the preview shows a
  retry message, decorative images collapse instead of showing a broken glyph, and
  the gold case (served as a base64 `.image.txt` payload) falls back to a tinted
  silver render.
- Case photos are 1033 × 1523; the live preview crops to 1033 × 1470 so the caption
  baked into the bottom of each photo never appears.
