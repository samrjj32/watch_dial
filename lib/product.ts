/**
 * Product data for the "Custom Casio Royale", extracted from the original
 * Shopify product page (jellylabwatches.com/products/custom-casio-royale).
 *
 * Prices are stored in rupees (the source store rendered INR). The variant
 * table below reproduces every Case × Band × Service combination from the
 * original product JSON, including the real Shopify variant ids (they form
 * arithmetic sequences in the source data, so they are generated here
 * instead of being hand-copied 96 times).
 */

export const PRODUCT = {
  id: 9041986027739,
  title: 'Custom Casio Royale',
  handle: 'custom-casio-royale',
  vendor: 'JellyLab Watches',
  currency: 'INR',
  descriptionHtml: `
    <p>A custom Royale build where you select all of the materials and colors.</p>
    <p><strong>Custom process:</strong></p>
    <p>Step 1: Select a case color · Step 2: Select a band · Step 3: Select window
    colors or decals (tap a window in the preview to color it).</p>
  `,
} as const;

export type CaseId =
  | 'black'
  | 'silver'
  | 'gold'
  | 'metal-polished'
  | 'metal-matte'
  | 'metal-black';

export type BandId = 'black-rubber' | 'brown-leather' | 'black-leather' | 'steel';

export type ServiceId = 'none' | 'text-removal' | 'engraving' | 'both';

export interface CaseOption {
  id: CaseId;
  /** Exact Shopify option value, used for variant lookup */
  value: string;
  label: string;
  tier: 'resin' | 'metal';
  /** Swatch colors for the picker chip */
  swatch: [string, string];
}

export interface BandOption {
  id: BandId;
  value: string;
  label: string;
  swatch: [string, string];
}

export const CASE_OPTIONS: CaseOption[] = [
  { id: 'silver', value: 'Silver', label: 'Silver', tier: 'resin', swatch: ['#c9cdd3', '#9aa0a8'] },
  { id: 'black', value: 'Black', label: 'Black', tier: 'resin', swatch: ['#3a3a3c', '#141416'] },
  { id: 'gold', value: 'Gold', label: 'Gold / Bronze', tier: 'resin', swatch: ['#d3a45c', '#a67434'] },
  { id: 'metal-polished', value: 'Metal (Polished)', label: 'Metal · Polished', tier: 'metal', swatch: ['#eef1f5', '#b7bec7'] },
  { id: 'metal-matte', value: 'Metal (Matte)', label: 'Metal · Matte', tier: 'metal', swatch: ['#aab0b7', '#7e858d'] },
  { id: 'metal-black', value: 'Metal (Black)', label: 'Metal · Black', tier: 'metal', swatch: ['#2c2e33', '#0c0d0f'] },
];

export const BAND_OPTIONS: BandOption[] = [
  { id: 'black-rubber', value: 'Black Rubber', label: 'Black rubber', swatch: ['#2b2b2e', '#101012'] },
  { id: 'brown-leather', value: 'Brown Leather', label: 'Brown leather', swatch: ['#8a5a33', '#5b3517'] },
  { id: 'black-leather', value: 'Black Leather', label: 'Black leather', swatch: ['#3b3733', '#17140f'] },
  { id: 'steel', value: 'Stainless Steel Bracelet', label: 'Steel bracelet', swatch: ['#dfe3e8', '#a3abb4'] },
];

export const SERVICE_VALUES: Record<ServiceId, string> = {
  none: 'None',
  'text-removal': 'Text removal',
  engraving: 'Laser engraving',
  both: 'Text removal + laser engraving',
};

/** Base price (₹) by case tier and band, for the "None" service. */
const BASE_PRICE: Record<'resin' | 'metal', Record<BandId, number>> = {
  resin: { 'black-rubber': 14100, 'brown-leather': 17500, 'black-leather': 17500, steel: 18000 },
  metal: { 'black-rubber': 20400, 'brown-leather': 23800, 'black-leather': 23800, steel: 24300 },
};

const SERVICE_PRICE_EACH = 2400; // text removal or engraving alone

/** Service surcharge (₹). Matches the source variant table exactly,
 *  including its one quirk: resin case + steel bracelet + both services
 *  is +4800 instead of +4900. */
function serviceAdd(tier: 'resin' | 'metal', band: BandId, service: ServiceId): number {
  switch (service) {
    case 'none':
      return 0;
    case 'text-removal':
    case 'engraving':
      return SERVICE_PRICE_EACH;
    case 'both':
      return tier === 'resin' && band === 'steel' ? 4800 : 4900;
  }
}

export function getCase(id: CaseId): CaseOption {
  return CASE_OPTIONS.find((c) => c.id === id)!;
}

export function getBand(id: BandId): BandOption {
  return BAND_OPTIONS.find((b) => b.id === id)!;
}

export function priceFor(caseId: CaseId, band: BandId, service: ServiceId): number {
  const tier = getCase(caseId).tier;
  return BASE_PRICE[tier][band] + serviceAdd(tier, band, service);
}

export interface Variant {
  id: number;
  title: string;
  caseId: CaseId;
  bandId: BandId;
  serviceId: ServiceId;
  price: number; // rupees
}

/**
 * Rebuild the 96-variant table. In the source JSON, variant ids increase by
 * 32768 within each contiguous block:
 *  - block A (47946707009755…): Black/Silver/Gold/Metal-Polished × 4 bands, service "None"
 *  - block B (49155597074651…): Metal-Matte/Metal-Black × 4 bands, service "None"
 *  - block C (49262822686939…): all 6 cases × 4 bands × 3 paid services
 */
function buildVariants(): Variant[] {
  const STEP = 32768;
  const bands: BandId[] = ['black-rubber', 'brown-leather', 'black-leather', 'steel'];
  const caseOrder: CaseId[] = ['black', 'silver', 'gold', 'metal-polished', 'metal-matte', 'metal-black'];
  const paidServices: ServiceId[] = ['text-removal', 'engraving', 'both'];
  const variants: Variant[] = [];

  const push = (id: number, caseId: CaseId, bandId: BandId, serviceId: ServiceId) => {
    variants.push({
      id,
      title: `${getCase(caseId).value} / ${getBand(bandId).value} / ${SERVICE_VALUES[serviceId]}`,
      caseId,
      bandId,
      serviceId,
      price: priceFor(caseId, bandId, serviceId),
    });
  };

  let id = 47946707009755;
  for (const caseId of caseOrder.slice(0, 4))
    for (const band of bands) push(id, caseId, band, 'none'), (id += STEP);

  id = 49155597074651;
  for (const caseId of caseOrder.slice(4))
    for (const band of bands) push(id, caseId, band, 'none'), (id += STEP);

  id = 49262822686939;
  for (const caseId of caseOrder)
    for (const band of bands)
      for (const service of paidServices) push(id, caseId, band, service), (id += STEP);

  return variants;
}

export const VARIANTS: Variant[] = buildVariants();

export function findVariant(caseId: CaseId, band: BandId, service: ServiceId): Variant {
  return VARIANTS.find(
    (v) => v.caseId === caseId && v.bandId === band && v.serviceId === service
  )!;
}
