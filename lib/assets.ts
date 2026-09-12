/**
 * Artwork URLs, taken from the storefront's asset manifest.
 *
 * Every layer is registered to the same 1033 x 1523 photograph, of which the
 * builder shows the top 1033 x 1470.
 */

const FILES = 'https://cdn.shopify.com/s/files/1/0787/8508/5659/files';
const THEME = 'https://jellylabwatches.com/cdn/shop/t/9/assets';

export const ASSETS = {
  logo: `${FILES}/jellylab-builder-logo-r10.webp?v=1788910244`,
  logoSpin: `${FILES}/jellylab-builder-r10-branding-jellylab-logo-3d.webp?v=1788910345`,
  bandLeather: `${FILES}/jellylab-builder-r10-band-leather.png?v=1788910299`,
  bandSteel: `${FILES}/jellylab-builder-r10-band-steel-v2.webp?v=1788910310`,
  textRemoval: `${FILES}/jellylab-builder-r10-text-removal-patches.webp?v=1788910323`,
} as const;

/** Case artwork is the complete watch photograph in that case colour. */
export const CASE_IMAGES: Record<string, string> = {
  'resin-black': `${FILES}/jellylab-builder-r10-cases-resin-black.webp?v=1788910382`,
  'resin-silver': `${FILES}/jellylab-builder-r10-cases-resin-silver.webp?v=1788910401`,
  // Served as a base64 payload in a theme text asset; resolved at runtime.
  'resin-gold': `${THEME}/jellylab-resin-gold-bronze-v1.image.txt?v=71367073527954102631788989302`,
};

const DECAL_VERSIONS: Record<string, number> = {
  'american-flag': 1788910410,
  baseball: 1788910419,
  basketball: 1788910427,
  'blood-moon': 1788910437,
  earth: 1788910446,
  ghost: 1788910457,
  'golf-ball': 1788910467,
  jupiter: 1788910477,
  mars: 1788910486,
  mercury: 1788910494,
  moon: 1788910503,
  nuke: 1788910513,
  'tennis-ball': 1788910523,
};

export function decalImage(name: string): string {
  return `${FILES}/jellylab-builder-r10-decals-registered-${name}.webp?v=${DECAL_VERSIONS[name] ?? 1788910410}`;
}

/** True for assets stored as a base64 payload inside a text file. */
export const isTextAsset = (url: string) => /\.image\.txt(?:\?|$)/.test(url);
