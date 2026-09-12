import type { CaseId, BandId } from './product';

/**
 * Image assets from the original builder (Shopify CDN). They are hotlinked;
 * every layer that uses them hides itself gracefully if a request fails.
 */
const CDN = 'https://cdn.shopify.com/s/files/1/0787/8508/5659/files';

export const ASSETS = {
  logo: `${CDN}/jellylab-builder-logo-r10.webp?v=1788910244`,
  logo3d: `${CDN}/jellylab-builder-r10-branding-jellylab-logo-3d.webp?v=1788910345`,
  base: `${CDN}/jellylab-builder-r10-royale-base.png?v=1788910287`,
  bandLeather: `${CDN}/jellylab-builder-r10-band-leather.png?v=1788910299`,
  bandSteel: `${CDN}/jellylab-builder-r10-band-steel-v2.webp?v=1788910310`,
  textRemovalPatches: `${CDN}/jellylab-builder-r10-text-removal-patches.webp?v=1788910323`,
  backplate: `${CDN}/jellylab-builder-r10-backplate.webp?v=1788910336`,
  cases: {
    'metal-black': `${CDN}/jellylab-builder-r10-cases-metal-black.webp?v=1788910353`,
    'metal-matte': `${CDN}/jellylab-builder-r10-cases-metal-matte.webp?v=1788910363`,
    'metal-polished': `${CDN}/jellylab-builder-r10-cases-metal-polished.webp?v=1788910372`,
    black: `${CDN}/jellylab-builder-r10-cases-resin-black.webp?v=1788910382`,
    silver: `${CDN}/jellylab-builder-r10-cases-resin-silver.webp?v=1788910401`,
    gold: null, // gold overlay was served as a theme asset in the source; approximated with a tint layer
  } as Record<CaseId, string | null>,
} as const;

export function decalAsset(slug: string): string {
  return `${CDN}/jellylab-builder-r10-decals-registered-${slug}.webp?v=1788910410`;
}

/** Case overlay to composite over the base render (null = base image already shows it). */
export function caseOverlay(caseId: CaseId): string | null {
  if (caseId === 'silver') return null; // base render is the silver case
  return ASSETS.cases[caseId];
}

export function bandOverlay(bandId: BandId): { src: string; className?: string } | null {
  switch (bandId) {
    case 'black-rubber':
      return null; // base render already shows the rubber band
    case 'brown-leather':
      return { src: ASSETS.bandLeather };
    case 'black-leather':
      // only a brown leather layer ships with the builder; darken it for black
      return { src: ASSETS.bandLeather, className: 'layer-darken' };
    case 'steel':
      return { src: ASSETS.bandSteel };
  }
}

/* ------------------------------------------------------------------ */
/* Windows                                                             */
/* ------------------------------------------------------------------ */

/** Preview stage coordinate space (matches the original canvas). */
export const STAGE = { width: 1033, height: 1470 } as const;

export type WindowId = 'w1' | 'w2' | 'w3' | 'w4';

export interface WatchWindow {
  id: WindowId;
  index: number;
  label: string;
  description: string;
  shape:
    | { kind: 'circle'; cx: number; cy: number; r: number }
    | { kind: 'rect'; x: number; y: number; w: number; h: number; rx: number };
  supportsDecals: boolean;
}

export const WINDOWS: WatchWindow[] = [
  {
    id: 'w1',
    index: 1,
    label: 'Circle',
    description: 'Circular analog display (top left)',
    shape: { kind: 'circle', cx: 395, cy: 555, r: 102 },
    supportsDecals: true,
  },
  {
    id: 'w2',
    index: 2,
    label: 'Thin',
    description: 'Thin window (top right)',
    shape: { kind: 'rect', x: 516, y: 455, w: 230, h: 66, rx: 12 },
    supportsDecals: false,
  },
  {
    id: 'w3',
    index: 3,
    label: 'Map',
    description: 'Map window (middle right)',
    shape: { kind: 'rect', x: 516, y: 533, w: 230, h: 120, rx: 10 },
    supportsDecals: false,
  },
  {
    id: 'w4',
    index: 4,
    label: 'Main',
    description: 'Main time window (bottom)',
    shape: { kind: 'rect', x: 300, y: 668, w: 448, h: 200, rx: 14 },
    supportsDecals: false,
  },
];

/* ------------------------------------------------------------------ */
/* Filters (window colors)                                             */
/* ------------------------------------------------------------------ */

export interface Filter {
  id: string;
  label: string;
  kind: 'solid' | 'gradient';
  /** solid: [color]; gradient: [top, bottom] */
  colors: string[];
  uv?: boolean;
}

export const SOLID_FILTERS: Filter[] = [
  { id: 'red', label: 'Red', kind: 'solid', colors: ['#e6342c'] },
  { id: 'blue', label: 'Blue', kind: 'solid', colors: ['#2464e0'] },
  { id: 'green', label: 'Green', kind: 'solid', colors: ['#2ba24c'] },
  { id: 'orange', label: 'Orange', kind: 'solid', colors: ['#f07b1c'] },
  { id: 'purple', label: 'Purple', kind: 'solid', colors: ['#7a3fd1'] },
  { id: 'yellow', label: 'Yellow', kind: 'solid', colors: ['#f4c81f'] },
  { id: 'neon-yellow', label: 'Neon yellow', kind: 'solid', colors: ['#e8ff2b'], uv: true },
  { id: 'pink', label: 'Pink', kind: 'solid', colors: ['#f0569c'] },
  { id: 'neon-pink', label: 'Neon pink', kind: 'solid', colors: ['#ff3fae'], uv: true },
];

export const GRADIENT_FILTERS: Filter[] = [
  { id: 'sunset-yellow', label: 'Sunset · yellow top', kind: 'gradient', colors: ['#f4c81f', '#7a3fd1'] },
  { id: 'sunset-purple', label: 'Sunset · purple top', kind: 'gradient', colors: ['#7a3fd1', '#f4c81f'] },
  { id: 'starship-blue', label: 'Starship · blue top', kind: 'gradient', colors: ['#2464e0', '#f0569c'] },
  { id: 'starship-pink', label: 'Starship · pink top', kind: 'gradient', colors: ['#f0569c', '#2464e0'] },
  { id: 'portals-orange', label: 'Portals · orange top', kind: 'gradient', colors: ['#f07b1c', '#2464e0'] },
  { id: 'portals-blue', label: 'Portals · blue top', kind: 'gradient', colors: ['#2464e0', '#f07b1c'] },
];

export const ALL_FILTERS = [...SOLID_FILTERS, ...GRADIENT_FILTERS];

export function getFilter(id: string | null): Filter | null {
  return ALL_FILTERS.find((f) => f.id === id) ?? null;
}

/* ------------------------------------------------------------------ */
/* Decals (circle window only)                                         */
/* ------------------------------------------------------------------ */

export interface Decal {
  id: string;
  label: string;
  slug: string; // CDN slug
  finishes: Array<'transparent' | 'opaque'>;
}

export const DECALS: Decal[] = [
  { id: 'moon', label: 'Moon', slug: 'moon', finishes: ['transparent', 'opaque'] },
  { id: 'blood-moon', label: 'Blood moon', slug: 'blood-moon', finishes: ['transparent', 'opaque'] },
  { id: 'earth', label: 'Earth', slug: 'earth', finishes: ['opaque'] },
  { id: 'mars', label: 'Mars', slug: 'mars', finishes: ['transparent', 'opaque'] },
  { id: 'jupiter', label: 'Jupiter', slug: 'jupiter', finishes: ['opaque'] },
  { id: 'mercury', label: 'Mercury', slug: 'mercury', finishes: ['opaque'] },
  { id: 'nuke', label: 'Radiation', slug: 'nuke', finishes: ['transparent', 'opaque'] },
  { id: 'american-flag', label: 'American flag', slug: 'american-flag', finishes: ['transparent', 'opaque'] },
  { id: 'golf-ball', label: 'Golf ball', slug: 'golf-ball', finishes: ['opaque'] },
  { id: 'tennis-ball', label: 'Tennis ball', slug: 'tennis-ball', finishes: ['opaque'] },
  { id: 'baseball', label: 'Baseball', slug: 'baseball', finishes: ['opaque'] },
  { id: 'basketball', label: 'Basketball', slug: 'basketball', finishes: ['opaque'] },
  { id: 'ghost', label: 'Ghost', slug: 'ghost', finishes: ['opaque'] },
];

export function getDecal(id: string | null): Decal | null {
  return DECALS.find((d) => d.id === id) ?? null;
}

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

/** Words / markings that can be removed from the dial. Flat fee regardless of count. */
export const TEXT_REMOVAL_TARGETS = [
  'WORLD TIME',
  '5 ALARMS',
  'CASIO',
  'WR100M',
  '10 YEAR BATTERY',
  'ILLUMINATOR',
  'ADJUST',
  'LIGHT',
  'MODE',
  'SEARCH',
  'Analog clock numbers',
] as const;

export interface EngravingFont {
  id: string;
  label: string;
  css: string;
  weight: number;
}

export const ENGRAVING_FONTS: EngravingFont[] = [
  { id: 'sans', label: 'Sans', css: '"Liberation Sans", Arial, Helvetica, sans-serif', weight: 400 },
  { id: 'sans-bold', label: 'Sans bold', css: '"Liberation Sans", Arial, Helvetica, sans-serif', weight: 700 },
  { id: 'serif-bold', label: 'Serif bold', css: '"Liberation Serif", Georgia, "Times New Roman", serif', weight: 700 },
  { id: 'mono-bold', label: 'Mono bold', css: '"Liberation Mono", "Courier New", monospace', weight: 700 },
];

export const ENGRAVING_MAX_CHARS = 25;
export const SERVICE_PRICE = 2400; // ₹, shown next to each optional service

/* ------------------------------------------------------------------ */
/* Boxes                                                               */
/* ------------------------------------------------------------------ */

export const BOX_OPTIONS = [
  { id: 'standard', label: 'JellyLab box', description: 'Signature purple presentation box' },
  { id: 'travel', label: 'Travel case', description: 'Zippered travel case' },
  { id: 'none', label: 'No box', description: 'Ship it minimal' },
] as const;

export type BoxId = (typeof BOX_OPTIONS)[number]['id'];
