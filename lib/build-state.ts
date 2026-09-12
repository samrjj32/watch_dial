import type { BandId, CaseId, ServiceId } from './product';
import { findVariant, priceFor } from './product';
import type { BoxId, WindowId } from './customizer';
import { ALL_FILTERS, DECALS, ENGRAVING_FONTS, WINDOWS } from './customizer';

export interface WindowState {
  filterId: string | null;
  /** circle window only */
  decalId: string | null;
  decalFinish: 'transparent' | 'opaque';
}

export interface EngravingState {
  enabled: boolean;
  fontId: string;
  top: string;
  bottom: string;
}

export interface BuildState {
  caseId: CaseId;
  bandId: BandId;
  windows: Record<WindowId, WindowState>;
  activeWindow: WindowId;
  textRemoval: { enabled: boolean; targets: string[] };
  engraving: EngravingState;
  boxId: BoxId;
  termsAccepted: boolean;
}

export const emptyWindow = (): WindowState => ({
  filterId: null,
  decalId: null,
  decalFinish: 'transparent',
});

export const INITIAL_BUILD: BuildState = {
  caseId: 'silver',
  bandId: 'black-rubber',
  windows: { w1: emptyWindow(), w2: emptyWindow(), w3: emptyWindow(), w4: emptyWindow() },
  activeWindow: 'w1',
  textRemoval: { enabled: false, targets: [] },
  engraving: { enabled: false, fontId: 'sans', top: '', bottom: '' },
  boxId: 'standard',
  termsAccepted: false,
};

export function serviceIdFor(build: BuildState): ServiceId {
  const text = build.textRemoval.enabled && build.textRemoval.targets.length > 0;
  const engrave = build.engraving.enabled && (build.engraving.top.trim() || build.engraving.bottom.trim());
  if (text && engrave) return 'both';
  if (text) return 'text-removal';
  if (engrave) return 'engraving';
  return 'none';
}

export function buildPricing(build: BuildState) {
  const service = serviceIdFor(build);
  const base = priceFor(build.caseId, build.bandId, 'none');
  const total = priceFor(build.caseId, build.bandId, service);
  const variant = findVariant(build.caseId, build.bandId, service);
  return { base, total, serviceAdd: total - base, service, variant };
}

/* ------------------------------------------------------------------ */
/* "Copy link to build" — (de)serialize the build to URL params        */
/* ------------------------------------------------------------------ */

export function buildToParams(build: BuildState): URLSearchParams {
  const p = new URLSearchParams();
  p.set('case', build.caseId);
  p.set('band', build.bandId);
  for (const w of WINDOWS) {
    const s = build.windows[w.id];
    if (s.filterId) p.set(w.id, s.filterId);
    if (w.supportsDecals && s.decalId) p.set(`${w.id}d`, `${s.decalId}.${s.decalFinish}`);
  }
  if (build.textRemoval.enabled && build.textRemoval.targets.length)
    p.set('tr', build.textRemoval.targets.join('~'));
  if (build.engraving.enabled && (build.engraving.top || build.engraving.bottom))
    p.set('eng', [build.engraving.fontId, build.engraving.top, build.engraving.bottom].join('~'));
  p.set('box', build.boxId);
  return p;
}

export function buildFromParams(params: URLSearchParams): BuildState {
  const build: BuildState = structuredClone(INITIAL_BUILD);

  const caseId = params.get('case');
  if (caseId && ['black', 'silver', 'gold', 'metal-polished', 'metal-matte', 'metal-black'].includes(caseId))
    build.caseId = caseId as CaseId;

  const bandId = params.get('band');
  if (bandId && ['black-rubber', 'brown-leather', 'black-leather', 'steel'].includes(bandId))
    build.bandId = bandId as BandId;

  for (const w of WINDOWS) {
    const filterId = params.get(w.id);
    if (filterId && ALL_FILTERS.some((f) => f.id === filterId)) build.windows[w.id].filterId = filterId;
    const decal = params.get(`${w.id}d`);
    if (decal && w.supportsDecals) {
      const [decalId, finish] = decal.split('.');
      if (DECALS.some((d) => d.id === decalId)) {
        build.windows[w.id].decalId = decalId;
        build.windows[w.id].decalFinish = finish === 'opaque' ? 'opaque' : 'transparent';
      }
    }
  }

  const tr = params.get('tr');
  if (tr) build.textRemoval = { enabled: true, targets: tr.split('~').filter(Boolean) };

  const eng = params.get('eng');
  if (eng) {
    const [fontId, top = '', bottom = ''] = eng.split('~');
    build.engraving = {
      enabled: true,
      fontId: ENGRAVING_FONTS.some((f) => f.id === fontId) ? fontId : 'sans',
      top: top.slice(0, 25),
      bottom: bottom.slice(0, 25),
    };
  }

  const box = params.get('box');
  if (box && ['standard', 'travel', 'none'].includes(box)) build.boxId = box as BoxId;

  return build;
}
