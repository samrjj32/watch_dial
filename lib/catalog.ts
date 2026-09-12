/**
 * Catalog for the JellyLab Casio Royale builder.
 *
 * Ported from the original storefront modules (jellylab-catalog, -decals,
 * -text-removal, -engraving). Prices are USD cents. Window paths, decal
 * registration and text-removal bounds are the production values: they are
 * registered against the 1033 x 1470 photograph and must not be "tidied".
 */

export const BASE_PRICE = 14_500;
export const US_FREE_SHIPPING_THRESHOLD = 15_000;
export const TEXT_REMOVAL_PRICE = 2_500;
export const ENGRAVING_PRICE = 2_500;
export const ENGRAVING_MAX_LENGTH = 25;

/* ------------------------------------------------------------------ */
/* Photograph geometry                                                 */
/* ------------------------------------------------------------------ */

/**
 * Layer artwork is 1033 x 1523; the preview shows the top 1033 x 1470.
 * The cropped strip is a caption baked into the artwork itself
 * ("Tap a window to color it. / Window 1 selected").
 */
export const PHOTO_WIDTH = 1033;
export const PHOTO_HEIGHT = 1470;

/** Region the strap artwork owns; case, dial and typography never come from it. */
export const BAND_PATH =
  'M 0 0 H 1033 V 234 H 684 V 265 H 347 V 234 H 0 Z ' +
  'M 348 1049 H 684 V 1082 H 1033 V 1470 H 0 V 1082 H 348 Z';

/** Circle decals print as a 164 x 164 square registered on the analog pivot. */
export const DECAL_CENTER = { x: 393, y: 558.5 } as const;
export const DECAL_SIZE = 164;
export const TRANSPARENT_DECAL_OPACITY = 0.94;

/* ------------------------------------------------------------------ */
/* Options                                                             */
/* ------------------------------------------------------------------ */

export interface Option {
  id: string;
  name: string;
  description?: string;
  price?: number;
  swatch?: string;
  color?: string | null;
}

export const CASES: Option[] = [
  { id: 'resin-black', name: 'Black', description: 'Resin · included', price: 0, swatch: 'linear-gradient(135deg,#515252,#121314)' },
  { id: 'resin-silver', name: 'Silver', description: 'Painted resin · included', price: 0, swatch: 'linear-gradient(130deg,#f1f2f2,#a0a5a8)' },
  { id: 'resin-gold', name: 'Gold', description: 'Resin · included', price: 0, swatch: 'linear-gradient(135deg,#b5a080,#80694b)' },
  { id: 'metal-polished', name: 'Metal, polished', description: '+$65', price: 6_500, swatch: 'linear-gradient(135deg,#8d979d 0%,#fbffff 40%,#a8adb0 52%,#e5e8e9 80%)' },
  { id: 'metal-matte', name: 'Metal, matte', description: '+$65', price: 6_500, swatch: 'linear-gradient(135deg,#d3d7d8,#979fa3)' },
  { id: 'metal-black', name: 'Metal, black', description: '+$65', price: 6_500, swatch: 'linear-gradient(135deg,#6b6f72,#1b1d1e)' },
];

export const BANDS: Option[] = [
  { id: 'rubber-black', name: 'Black rubber', description: 'Stock resin strap · included', price: 0, swatch: 'linear-gradient(135deg,#343434,#171717)' },
  { id: 'leather-brown', name: 'Brown leather', description: '+$35', price: 3_500, swatch: 'linear-gradient(135deg,#b17942,#73451f)' },
  { id: 'leather-black', name: 'Black leather', description: '+$35', price: 3_500, swatch: 'linear-gradient(135deg,#4f4844,#211e1c)' },
  { id: 'steel', name: 'Steel bracelet', description: '+$40', price: 4_000, swatch: 'repeating-linear-gradient(90deg,#b0b7bc 0 5px,#f0f2f3 5px 8px,#899399 8px 11px)' },
];

/**
 * The band each case ships with. The three resin watches are stocked as
 * complete watches — black on rubber, silver on the steel bracelet, gold on
 * brown leather — and the metal cases follow the finish they are closest to.
 * Choosing a case moves the band to its pairing until the customer picks a
 * band themselves, after which their choice is left alone.
 */
export const STOCK_BAND: Record<string, string> = {
  'resin-black': 'rubber-black',
  'resin-silver': 'steel',
  'resin-gold': 'leather-brown',
  'metal-polished': 'steel',
  'metal-matte': 'steel',
  'metal-black': 'rubber-black',
};

export const stockBandFor = (caseId: string) => STOCK_BAND[caseId] ?? 'rubber-black';

export const BOXES: Option[] = [
  { id: 'none', name: 'No preference', color: null },
  { id: 'dark-blue', name: 'Dark blue', color: '#223462' },
  { id: 'dark-green', name: 'Dark green', color: '#405c32' },
  { id: 'orange', name: 'Orange', color: '#eb692d' },
];

export interface Filter {
  id: string;
  name: string;
  /** Gradients show a two-line label. */
  short?: string;
  direction?: string;
  colors: string[] | null;
}

export const FILTERS: Filter[] = [
  { id: 'none', name: 'None', colors: null },
  { id: 'red', name: 'Red', colors: ['#f0273d'] },
  { id: 'blue', name: 'Blue', colors: ['#2583ed'] },
  { id: 'green', name: 'Green', colors: ['#26b556'] },
  { id: 'orange', name: 'Orange', colors: ['#ff861c'] },
  { id: 'purple', name: 'Purple', colors: ['#8741d9'] },
  { id: 'yellow', name: 'Yellow', colors: ['#f6d01b'] },
  { id: 'neon-yellow', name: 'Neon yellow', colors: ['#d9ff00'] },
  { id: 'pink', name: 'Pink', colors: ['#ed76b8'] },
  { id: 'neon-pink', name: 'Neon pink', colors: ['#ff2794'] },
  { id: 'sunset-yellow', name: 'Sunset, yellow up', short: 'Sunset', direction: 'Yellow up', colors: ['#ffdf19', '#ffa22d', '#ed408f'] },
  { id: 'sunset-purple', name: 'Sunset, purple up', short: 'Sunset', direction: 'Purple up', colors: ['#b45eae', '#ff942b', '#ffe130'] },
  { id: 'starship-blue', name: 'Starship, blue up', short: 'Starship', direction: 'Blue up', colors: ['#3189ff', '#8155dd', '#ec4da6'] },
  { id: 'starship-pink', name: 'Starship, pink up', short: 'Starship', direction: 'Pink up', colors: ['#ef429f', '#9056d4', '#3584f5'] },
  { id: 'portals-orange', name: 'Portals, orange up', short: 'Portals', direction: 'Orange up', colors: ['#ff9220', '#e5c47c', '#458bd2'] },
  { id: 'portals-blue', name: 'Portals, blue up', short: 'Portals', direction: 'Blue up', colors: ['#468bd2', '#e4c581', '#ff921f'] },
];

export interface WatchWindow {
  id: string;
  name: string;
  description: string;
  /** Aperture outline in photograph coordinates. */
  path: string;
  bounds: [number, number, number, number];
}

export const WINDOWS: WatchWindow[] = [
  {
    id: 'circle',
    name: 'Circle',
    description: 'Circular analog display',
    path: 'M 473.4 557.8 A 80.8 80.8 0 1 1 311.8 557.8 A 80.8 80.8 0 1 1 473.4 557.8 Z',
    bounds: [311, 477, 164, 163],
  },
  {
    id: 'thin',
    name: 'Thin',
    description: 'Upper right display',
    path: 'M 535 461.5 L 719 461.5 L 730.2 471 L 730.2 502 Q 729 513.5 718 514 L 535 514 Q 522 513 521.5 502 L 521.5 473 Z',
    bounds: [521, 461, 210, 54],
  },
  {
    id: 'map',
    name: 'Map',
    description: 'World time map display',
    path: 'M 535 535 L 719 535 L 730.5 546 L 730.5 636 L 720 648.5 L 533 648.5 L 521.5 638 L 521.5 548 Z',
    bounds: [521, 535, 210, 114],
  },
  {
    id: 'time',
    name: 'Time',
    description: 'Main time and date display',
    path:
      'M 520 670 L 719 670 L 730.5 680.5 L 730.5 849 L 718 862 L 313.5 862 L 299.5 849 ' +
      'L 299.5 719 L 312 705.5 L 477 705.5 Q 485 705.5 490.5 699.5 Z',
    bounds: [299, 670, 432, 193],
  },
];

/* ------------------------------------------------------------------ */
/* Circle decals                                                       */
/* ------------------------------------------------------------------ */

export type DecalFinish = 'opaque' | 'transparent';

export interface Decal {
  id: string;
  name: string;
  image: string;
  finishes: DecalFinish[];
}

export const DECALS: Decal[] = [
  { id: 'moon', name: 'Moon', image: 'moon', finishes: ['opaque', 'transparent'] },
  { id: 'blood-moon', name: 'Blood Moon', image: 'blood-moon', finishes: ['opaque', 'transparent'] },
  { id: 'mars', name: 'Mars', image: 'mars', finishes: ['opaque', 'transparent'] },
  { id: 'earth', name: 'Earth', image: 'earth', finishes: ['opaque', 'transparent'] },
  { id: 'mercury', name: 'Mercury', image: 'mercury', finishes: ['opaque', 'transparent'] },
  { id: 'jupiter', name: 'Jupiter', image: 'jupiter', finishes: ['opaque', 'transparent'] },
  { id: 'american-flag', name: 'American Flag', image: 'american-flag', finishes: ['transparent', 'opaque'] },
  { id: 'nuke', name: 'Nuke', image: 'nuke', finishes: ['opaque', 'transparent'] },
  { id: 'ghost', name: 'Ghost', image: 'ghost', finishes: ['opaque', 'transparent'] },
  { id: 'golf-ball', name: 'Golf Ball', image: 'golf-ball', finishes: ['opaque', 'transparent'] },
  { id: 'baseball', name: 'Baseball', image: 'baseball', finishes: ['opaque', 'transparent'] },
  { id: 'basketball', name: 'Basketball', image: 'basketball', finishes: ['opaque', 'transparent'] },
  { id: 'tennis-ball', name: 'Tennis Ball', image: 'tennis-ball', finishes: ['opaque', 'transparent'] },
];

export const DECAL_FINISHES: { id: DecalFinish; name: string }[] = [
  { id: 'opaque', name: 'Opaque' },
  { id: 'transparent', name: 'Transparent' },
];

export const decalById = (id?: string | null) => DECALS.find((d) => d.id === id);

export interface CircleDecal {
  id: string;
  finish: DecalFinish;
}

export function normalizeCircleDecal(input: Partial<CircleDecal> | null | undefined): CircleDecal | null {
  const decal = decalById(input?.id);
  if (!decal) return null;
  const finish = input?.finish;
  return { id: decal.id, finish: finish && decal.finishes.includes(finish) ? finish : decal.finishes[0] };
}

export function circleDecalName(input: Partial<CircleDecal> | null | undefined): string {
  const value = normalizeCircleDecal(input);
  if (!value) return 'None';
  const decal = decalById(value.id)!;
  return decal.name + (decal.finishes.length > 1 ? ' · ' + DECAL_FINISHES.find((f) => f.id === value.finish)!.name : '');
}

/* ------------------------------------------------------------------ */
/* Text removal                                                        */
/*                                                                     */
/* Printed labels on the inner faceplate. Case lettering and LCD       */
/* content are separate physical elements, never part of these masks.  */
/* ------------------------------------------------------------------ */

export interface TextRemoval {
  id: string;
  name: string;
  bounds: [number, number, number, number];
  ring?: { cx: number; cy: number; inner: number; outer: number };
}

export const TEXT_REMOVALS: TextRemoval[] = [
  { id: 'alarms', name: '5 ALARMS', bounds: [329, 414, 149, 27] },
  { id: 'casio', name: 'CASIO', bounds: [563, 413, 129, 32] },
  { id: 'adjust', name: 'ADJUST', bounds: [253, 491, 27, 119] },
  { id: 'light', name: 'LIGHT', bounds: [749, 491, 28, 90] },
  { id: 'wr100m', name: 'WR100M', bounds: [333, 671, 123, 28] },
  { id: 'mode', name: 'MODE', bounds: [253, 731, 28, 92] },
  { id: 'search', name: 'SEARCH', bounds: [749, 720, 29, 116] },
  { id: 'battery', name: '10 YEAR BATTERY', bounds: [392, 880, 246, 28] },
  {
    id: 'analog-numbers',
    name: 'Analog clock numbers',
    bounds: [281, 446, 224, 224],
    ring: { cx: 393, cy: 558, inner: 81.5, outer: 108 },
  },
];

export function normalizeTextRemovals(value: unknown): string[] {
  const requested = new Set(Array.isArray(value) ? (value as string[]) : []);
  // Older shared links may carry one part of a split label; map to the whole label.
  if (requested.has('alarm-count')) requested.add('alarms');
  if (requested.has('battery-years') || requested.has('year')) requested.add('battery');
  return TEXT_REMOVALS.filter((option) => requested.has(option.id)).map((option) => option.id);
}

/* ------------------------------------------------------------------ */
/* Engraving                                                           */
/* ------------------------------------------------------------------ */

export const ENGRAVING_ROWS = ['top', 'bottom'] as const;
export type EngravingRow = (typeof ENGRAVING_ROWS)[number];

export interface EngravingFont {
  id: string;
  name: string;
  family: string;
  /** Used until the Liberation face loads, and if it never does. */
  fallback: string;
  weight: number;
}

export const ENGRAVING_FONTS: EngravingFont[] = [
  {
    id: 'sans',
    name: 'Sans serif',
    family: 'JellyLab Engraving',
    fallback: 'Arial, Helvetica, sans-serif',
    weight: 700,
  },
  {
    id: 'serif',
    name: 'Serif',
    family: 'JellyLab Engraving Serif',
    fallback: 'Georgia, "Times New Roman", serif',
    weight: 700,
  },
  {
    id: 'mono',
    name: 'Monospace',
    family: 'JellyLab Engraving Mono',
    fallback: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    weight: 700,
  },
];

/** The full stack a row is drawn with, face first then its own fallback. */
export const engravingFontStack = (font: EngravingFont) =>
  `"${font.family}", ${font.fallback}`;

export const engravingFont = (id?: string) =>
  ENGRAVING_FONTS.find((font) => font.id === id) ?? ENGRAVING_FONTS[0];

export const ENGRAVING_EXAMPLES = { top: 'engraving 1', bottom: 'engraving 2' } as const;

export interface Engraving {
  top: string;
  bottom: string;
  font: string;
}

export function normalizeEngravingLine(value: unknown): string {
  if (typeof value !== 'string') return '';
  return Array.from(
    value
      .normalize('NFC')
      .replace(/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu, ' ')
      .replace(/\s+/gu, ' ')
  )
    .slice(0, ENGRAVING_MAX_LENGTH)
    .join('');
}

export function normalizeEngraving(input: Partial<Engraving> | null | undefined): Engraving {
  return {
    top: normalizeEngravingLine(input?.top),
    bottom: normalizeEngravingLine(input?.bottom),
    font: engravingFont(input?.font).id,
  };
}

export function hasEngraving(input: Partial<Engraving> | null | undefined): boolean {
  const engraving = normalizeEngraving(input);
  return ENGRAVING_ROWS.some((row) => engraving[row].trim().length > 0);
}

/* ------------------------------------------------------------------ */
/* Build                                                               */
/* ------------------------------------------------------------------ */

export type GradientLayout = 'separate' | 'continuous';

export interface Build {
  case: string;
  band: string;
  windows: string[];
  gradientLayout: GradientLayout;
  circleDecal: CircleDecal | null;
  textRemovals: string[];
  engraving: Engraving;
  box: string;
}

// Starts on the black watch: the one stock pairing where nothing is an upgrade,
// so the builder opens at the $145 headline price.
export const DEFAULT_BUILD: Build = {
  case: 'resin-black',
  band: 'rubber-black',
  windows: ['none', 'none', 'none', 'none'],
  gradientLayout: 'separate',
  circleDecal: null,
  textRemovals: [],
  engraving: { top: '', bottom: '', font: 'sans' },
  box: 'none',
};

export const byId = <T extends { id: string }>(items: T[], id?: string | null) =>
  items.find((item) => item.id === id);

export function normalizeBuild(input: Partial<Build> = {}): Build {
  const circleDecal = normalizeCircleDecal(input.circleDecal);
  const windows = WINDOWS.map((_, i) =>
    i === 0 && circleDecal ? 'none' : byId(FILTERS, input.windows?.[i])?.id ?? 'none'
  );
  const included = windows.slice(circleDecal ? 1 : 0);
  const first = byId(FILTERS, included[0]);
  const continuous =
    input.gradientLayout === 'continuous' &&
    (first?.colors?.length ?? 0) > 1 &&
    included.every((id) => id === included[0]);

  return {
    case: byId(CASES, input.case)?.id ?? DEFAULT_BUILD.case,
    band: byId(BANDS, input.band)?.id ?? DEFAULT_BUILD.band,
    windows,
    gradientLayout: continuous ? 'continuous' : 'separate',
    circleDecal,
    textRemovals: normalizeTextRemovals(input.textRemovals),
    engraving: normalizeEngraving(input.engraving),
    box: byId(BOXES, input.box)?.id ?? 'none',
  };
}

/** Apply one gradient across every filterable window as a single sweep. */
export function extendGradient(input: Partial<Build>, filterId: string): Build {
  const build = normalizeBuild(input);
  const filter = byId(FILTERS, filterId);
  if ((filter?.colors?.length ?? 0) <= 1) return build;
  return normalizeBuild({
    ...build,
    gradientLayout: 'continuous',
    windows: WINDOWS.map((_, i) => (i === 0 && build.circleDecal ? 'none' : filterId)),
  });
}

/** Gradient extent: the window itself, or the union of every swept window. */
export function gradientWindowBounds(build: Build, index: number): [number, number, number, number] {
  if (build.gradientLayout !== 'continuous' || (index === 0 && build.circleDecal))
    return WINDOWS[index].bounds;
  const bounds = WINDOWS.slice(build.circleDecal ? 1 : 0).map((w) => w.bounds);
  const left = Math.min(...bounds.map((b) => b[0]));
  const top = Math.min(...bounds.map((b) => b[1]));
  return [
    left,
    top,
    Math.max(...bounds.map((b) => b[0] + b[2])) - left,
    Math.max(...bounds.map((b) => b[1] + b[3])) - top,
  ];
}

/* ------------------------------------------------------------------ */
/* Money, pricing and shipping                                         */
/* ------------------------------------------------------------------ */

export function money(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: cents % 100 ? 2 : 0,
  }).format(cents / 100);
}

export interface Upgrade {
  id: string;
  name: string;
  price: number;
}

export interface Pricing {
  currency: 'USD';
  base: number;
  upgrades: Upgrade[];
  total: number;
}

export function priceBuild(input: Partial<Build>): Pricing {
  const build = normalizeBuild(input);
  const upgrades: Upgrade[] = [byId(CASES, build.case)!, byId(BANDS, build.band)!]
    .filter((option) => (option.price ?? 0) > 0)
    .map((option) => ({ id: option.id, name: option.name, price: option.price! }));

  if (build.textRemovals.length)
    upgrades.push({ id: 'text-removal', name: 'Text removal', price: TEXT_REMOVAL_PRICE });
  if (hasEngraving(build.engraving))
    upgrades.push({ id: 'laser-engraving', name: 'Laser engraving', price: ENGRAVING_PRICE });

  return {
    currency: 'USD',
    base: BASE_PRICE,
    upgrades,
    total: BASE_PRICE + upgrades.reduce((sum, option) => sum + option.price, 0),
  };
}

export interface ShippingStatus {
  unlocked: boolean;
  headline: string;
  detail: string;
  label: string;
}

export function usShippingStatus(total: number): ShippingStatus {
  const detail = 'Free US shipping';
  const remaining = Math.max(0, US_FREE_SHIPPING_THRESHOLD - total);
  return remaining === 0
    ? { unlocked: true, headline: 'Unlocked ✓', detail, label: 'Free US shipping unlocked.' }
    : {
        unlocked: false,
        headline: money(remaining) + ' to unlock',
        detail,
        label: `Add ${money(remaining)} to unlock free US shipping at $150.`,
      };
}

/* ------------------------------------------------------------------ */
/* Cart properties                                                     */
/* ------------------------------------------------------------------ */

export function buildProperties(input: Partial<Build>): Record<string, string> {
  const b = normalizeBuild(input);
  return {
    Case: byId(CASES, b.case)!.name,
    Band: byId(BANDS, b.band)!.name,
    ...Object.fromEntries(
      WINDOWS.map((w, i) => [
        `Window ${i + 1} · ${w.name}`,
        i === 0 && b.circleDecal ? 'Decal · ' + circleDecalName(b.circleDecal) : byId(FILTERS, b.windows[i])!.name,
      ])
    ),
    ...(b.gradientLayout === 'continuous'
      ? {
          'Gradient layout': b.circleDecal
            ? 'Continuous across thin, map and time windows'
            : 'Continuous across all four windows',
        }
      : {}),
    'Text removal': b.textRemovals.length
      ? b.textRemovals.map((id) => byId(TEXT_REMOVALS, id)!.name).join(', ')
      : 'None',
    'Engraving · top': b.engraving.top.trim() || 'None',
    'Engraving · bottom': b.engraving.bottom.trim() || 'None',
    'Engraving · font': hasEngraving(b.engraving) ? engravingFont(b.engraving.font).name : 'None',
    'Watch box': byId(BOXES, b.box)!.name,
  };
}

export function filterBackground(filter: Filter): string {
  if (!filter.colors) return 'repeating-linear-gradient(45deg,#fff 0 4px,#dcdce2 4px 6px)';
  return filter.colors.length === 1
    ? filter.colors[0]
    : `linear-gradient(180deg,${filter.colors.join(',')})`;
}
