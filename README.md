# watch_dial — JellyLab Casio Royale Builder (Next.js)

A Next.js conversion of the JellyLab Watches "Custom Casio Royale" Shopify product
page (a custom watch builder). The original page was a Shopify Dawn theme section
driven by an embedded product JSON config; this project reimplements it as a
standalone React app.

## Features

- **Live watch preview** — layered product renders (base watch, case overlay, band
  overlay, text-removal patches) with tappable window hotspots. If the Shopify CDN
  images can't load, the preview falls back to a fully drawn SVG schematic watch that
  still reflects every selection (including hiding removed dial text).
- **Step 1 · Case** — Black / Silver / Gold resin and three metal finishes.
- **Step 2 · Band** — Black rubber, brown/black leather, stainless steel bracelet.
- **Step 3 · Windows** — 4 windows, 9 solid filter colors (incl. UV-reactive),
  6 gradient filters, 13 circle-window decals with transparent/opaque finishes,
  "apply to all windows" and per-window clear.
- **Step 4 · Text removal** — pick the dial markings to remove (flat fee).
- **Step 5 · Laser engraving** — 4 fonts, two 25-character rows, backplate preview.
- **Step 6 · Watch box** selection.
- **Real pricing** — the full 96-variant Case × Band × Service price table from the
  source product (including its pricing quirks and real Shopify variant ids) drives
  the price breakdown, sticky purchase bar, and free-shipping progress.
- **Copy link to build** — the whole configuration serializes to URL query params,
  so builds are shareable and restored on load.
- **Add to cart (demo)** — validates the returns-policy checkbox and produces a
  Shopify-style line-item payload (variant id + line item properties).

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project structure

```
app/
  layout.tsx        Root layout + metadata
  page.tsx          Renders the builder (Suspense for useSearchParams)
  globals.css       All styling
components/
  Builder.tsx       Page orchestration: sections, pricing, cart, toast, share link
  WatchPreview.tsx  Layered preview + SVG hotspots + schematic fallback
lib/
  product.ts        Product, options, price rules, generated 96-variant table
  customizer.ts     Windows, filters, gradients, decals, services, CDN assets
  build-state.ts    Build state model, pricing, URL (de)serialization
  format.ts         INR money formatting ("Rs. 14,100.00")
```

## Notes

- Product imagery is hotlinked from the original Shopify CDN
  (`cdn.shopify.com/s/files/1/0787/8508/5659/…`); every image layer degrades
  gracefully if unavailable.
- Prices are in INR, matching the currency of the captured page. The variant id
  sequences match the source product JSON.
- There is no real checkout — "Add to cart" logs the payload and shows a toast.
