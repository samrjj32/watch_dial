'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import WatchPreview from './WatchPreview';
import {
  INITIAL_BUILD,
  buildFromParams,
  buildPricing,
  buildToParams,
  emptyWindow,
  type BuildState,
} from '@/lib/build-state';
import {
  ASSETS,
  BOX_OPTIONS,
  DECALS,
  ENGRAVING_FONTS,
  ENGRAVING_MAX_CHARS,
  GRADIENT_FILTERS,
  SERVICE_PRICE,
  SOLID_FILTERS,
  TEXT_REMOVAL_TARGETS,
  WINDOWS,
  decalAsset,
  getDecal,
  getFilter,
  type WindowId,
} from '@/lib/customizer';
import { BAND_OPTIONS, CASE_OPTIONS, PRODUCT, getBand, getCase } from '@/lib/product';
import { money } from '@/lib/format';

const FREE_SHIPPING_AT = 15000; // ₹

export default function Builder() {
  const [build, setBuild] = useState<BuildState>(INITIAL_BUILD);
  const [toast, setToast] = useState('');
  const [cartError, setCartError] = useState('');
  const [logoOk, setLogoOk] = useState(true);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useRef(false);

  // Hydrate a shared build from the URL once (client only, keeps the page static).
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const params = new URLSearchParams(window.location.search);
    if ([...params.keys()].length > 0) setBuild(buildFromParams(params));
  }, []);

  const pricing = useMemo(() => buildPricing(build), [build]);
  const activeWindow = WINDOWS.find((w) => w.id === build.activeWindow)!;
  const activeState = build.windows[build.activeWindow];
  const activeFilter = getFilter(activeState.filterId);
  const activeDecal = getDecal(activeState.decalId);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  };

  const patch = (partial: Partial<BuildState>) => setBuild((b) => ({ ...b, ...partial }));

  const patchWindow = (id: WindowId, partial: Partial<BuildState['windows'][WindowId]>) =>
    setBuild((b) => ({ ...b, windows: { ...b.windows, [id]: { ...b.windows[id], ...partial } } }));

  const selectFilter = (filterId: string) => {
    const next = activeState.filterId === filterId ? null : filterId;
    patchWindow(build.activeWindow, { filterId: next, ...(next ? { decalId: null } : {}) });
  };

  const selectDecal = (decalId: string) => {
    const decal = getDecal(decalId);
    const next = activeState.decalId === decalId ? null : decalId;
    patchWindow('w1', {
      decalId: next,
      decalFinish: next && decal && !decal.finishes.includes(activeState.decalFinish)
        ? decal.finishes[0]
        : activeState.decalFinish,
      ...(next ? { filterId: null } : {}),
    });
  };

  const applyToAllWindows = () => {
    if (!activeState.filterId) return showToast('Pick a filter color first.');
    setBuild((b) => ({
      ...b,
      windows: Object.fromEntries(
        WINDOWS.map((w) => [w.id, { ...b.windows[w.id], filterId: activeState.filterId, decalId: null }])
      ) as BuildState['windows'],
    }));
    showToast('Filter applied to all 4 windows.');
  };

  const clearWindow = () => patchWindow(build.activeWindow, emptyWindow());

  const toggleRemovalTarget = (target: string) =>
    setBuild((b) => {
      const targets = b.textRemoval.targets.includes(target)
        ? b.textRemoval.targets.filter((t) => t !== target)
        : [...b.textRemoval.targets, target];
      return { ...b, textRemoval: { ...b.textRemoval, targets } };
    });

  const copyBuildLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}?${buildToParams(build)}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Build link copied to clipboard.');
    } catch {
      showToast(url);
    }
  };

  const addToCart = () => {
    if (!build.termsAccepted) {
      setCartError('Please confirm that custom designs are exempt from returns.');
      return;
    }
    setCartError('');
    const payload = {
      productId: PRODUCT.id,
      variantId: pricing.variant.id,
      variantTitle: pricing.variant.title,
      quantity: 1,
      price: pricing.total,
      properties: {
        ...Object.fromEntries(
          WINDOWS.map((w) => {
            const s = build.windows[w.id];
            const value = s.decalId
              ? `${getDecal(s.decalId)?.label} decal (${s.decalFinish})`
              : getFilter(s.filterId)?.label ?? 'Empty (no color)';
            return [`Window ${w.index}`, value];
          })
        ),
        ...(build.textRemoval.enabled && build.textRemoval.targets.length
          ? { 'Text removal': build.textRemoval.targets.join(', ') }
          : {}),
        ...(build.engraving.enabled && (build.engraving.top || build.engraving.bottom)
          ? {
              'Engraving font': ENGRAVING_FONTS.find((f) => f.id === build.engraving.fontId)?.label,
              'Engraving top': build.engraving.top,
              'Engraving bottom': build.engraving.bottom,
            }
          : {}),
        Box: BOX_OPTIONS.find((o) => o.id === build.boxId)?.label,
      },
    };
    console.info('[cart] add', payload);
    showToast(`Added to cart — ${money(pricing.total)} (demo store, no checkout)`);
  };

  const shippingRemaining = Math.max(0, FREE_SHIPPING_AT - pricing.total);

  return (
    <main className="builder">
      {/* ------------------------------------------------ preview column */}
      <div className="preview-column">
        <div className="preview-sticky">
          <div className="preview-card">
            <div className="preview-topline">
              <span className="eyebrow">Your Royale · Digital mockup</span>
              <span className="made-to-order">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Hand built to order
              </span>
            </div>

            <WatchPreview build={build} onSelectWindow={(id) => patch({ activeWindow: id })} />

            <div className="preview-caption">
              <span>Tap a window to color it.</span>
              <span className="active-caption">
                0{activeWindow.index} · {activeWindow.label} selected
              </span>
              <span>3,000+ built</span>
              <span aria-label="4.92 stars based on 390 plus reviews">
                4.92 <span className="review-star" aria-hidden>★</span> (390+ reviews)
              </span>
            </div>
          </div>

          <section className="build-summary" aria-labelledby="summary-title">
            <div className="summary-heading">
              <h2 className="eyebrow" id="summary-title">Your build</h2>
              <button type="button" className="text-button" onClick={copyBuildLink}>
                Copy link to build ↗
              </button>
            </div>
            <dl>
              <dt>Case</dt>
              <dd>{getCase(build.caseId).label}</dd>
              <dt>Band</dt>
              <dd>{getBand(build.bandId).label}</dd>
              {WINDOWS.map((w) => {
                const s = build.windows[w.id];
                const value = s.decalId
                  ? `${getDecal(s.decalId)?.label} decal`
                  : getFilter(s.filterId)?.label ?? 'No filter';
                return (
                  <FragmentRow key={w.id} label={`Window ${w.index}`} value={value} />
                );
              })}
              <dt>Services</dt>
              <dd>
                {pricing.service === 'none'
                  ? 'None'
                  : pricing.variant.title.split(' / ').slice(-1)[0]}
              </dd>
              <dt>Box</dt>
              <dd>{BOX_OPTIONS.find((o) => o.id === build.boxId)?.label}</dd>
            </dl>
          </section>
        </div>
      </div>

      {/* ------------------------------------------------ controls column */}
      <div className="controls-column">
        <div className="intro">
          <div className="builder-heading">
            {logoOk ? (
              <img
                className="builder-logo"
                src={ASSETS.logo}
                alt="JellyLab logo"
                width={52}
                height={52}
                onError={() => setLogoOk(false)}
              />
            ) : (
              <span className="builder-logo" aria-hidden style={{ display: 'grid', placeItems: 'center', fontSize: 24 }}>⌚</span>
            )}
            <h1>JellyLab Casio Royale Builder</h1>
          </div>
          <div className="builder-proof" aria-label="About JellyLab">
            <div className="proof-item"><strong>3,000+</strong><span>watches built</span></div>
            <div className="proof-item">
              <strong><span className="proof-star" aria-hidden>★</span> 4.92 stars</strong>
              <span>based on 390+ reviews</span>
            </div>
            <div className="proof-item"><strong>150k+</strong><span>follow our builds on YouTube</span></div>
          </div>
        </div>

        {/* 1 · Case */}
        <section className="option-section" aria-labelledby="case-heading">
          <div className="section-heading">
            <h2 id="case-heading"><span className="step">1</span> Case</h2>
            <span className="selection-label">{getCase(build.caseId).label}</span>
          </div>
          <div className="choice-grid">
            {CASE_OPTIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`choice${build.caseId === c.id ? ' selected' : ''}`}
                onClick={() => patch({ caseId: c.id })}
                aria-pressed={build.caseId === c.id}
              >
                <span className="swatch" style={{ background: `linear-gradient(135deg, ${c.swatch[0]}, ${c.swatch[1]})` }} />
                <span className="choice-label">
                  {c.label}
                  <span className="choice-sub">{c.tier === 'metal' ? `+ ${money(6300)}` : 'Included'}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 2 · Band */}
        <section className="option-section" aria-labelledby="band-heading">
          <div className="section-heading">
            <h2 id="band-heading"><span className="step">2</span> Band</h2>
            <span className="selection-label">{getBand(build.bandId).label}</span>
          </div>
          <div className="choice-grid">
            {BAND_OPTIONS.map((b) => {
              const upcharge =
                b.id === 'black-rubber' ? 0 : b.id === 'steel' ? 3900 : 3400;
              return (
                <button
                  key={b.id}
                  type="button"
                  className={`choice${build.bandId === b.id ? ' selected' : ''}`}
                  onClick={() => patch({ bandId: b.id })}
                  aria-pressed={build.bandId === b.id}
                >
                  <span className="swatch" style={{ background: `linear-gradient(135deg, ${b.swatch[0]}, ${b.swatch[1]})` }} />
                  <span className="choice-label">
                    {b.label}
                    <span className="choice-sub">{upcharge ? `+ ${money(upcharge)}` : 'Included'}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3 · Windows */}
        <section className="option-section" aria-labelledby="window-heading">
          <div className="section-heading">
            <h2 id="window-heading"><span className="step">3</span> Windows</h2>
            <span className="included-label">Filters &amp; decals included</span>
          </div>

          <div className="window-options" role="tablist" aria-label="Choose a window to customize">
            {WINDOWS.map((w) => {
              const s = build.windows[w.id];
              const filter = getFilter(s.filterId);
              const dotStyle: React.CSSProperties = s.decalId
                ? { background: '#d9c9f2' }
                : filter
                  ? filter.kind === 'solid'
                    ? { background: filter.colors[0] }
                    : { background: `linear-gradient(${filter.colors[0]}, ${filter.colors[1]})` }
                  : {};
              return (
                <button
                  key={w.id}
                  type="button"
                  role="tab"
                  aria-selected={build.activeWindow === w.id}
                  className={`window-tab${build.activeWindow === w.id ? ' selected' : ''}`}
                  onClick={() => patch({ activeWindow: w.id })}
                >
                  <span className="num">0{w.index}</span>
                  <span className="dot" style={dotStyle} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{w.label}</span>
                </button>
              );
            })}
          </div>

          <div className="window-description">
            <span><strong>{activeWindow.description}</strong></span>
            <span>
              {activeDecal
                ? `${activeDecal.label} decal`
                : activeFilter
                  ? activeFilter.label
                  : 'No filter'}
            </span>
          </div>

          {activeWindow.supportsDecals && (
            <fieldset className="decal-fieldset">
              <legend>Decals <span>· Included · Circle only</span></legend>
              <div className="decal-options" role="radiogroup" aria-label="Circle decal">
                {DECALS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    role="radio"
                    aria-checked={activeState.decalId === d.id}
                    className={`decal-chip${activeState.decalId === d.id ? ' selected' : ''}`}
                    onClick={() => selectDecal(d.id)}
                    title={d.label}
                  >
                    <DecalThumb id={d.id} slug={d.slug} label={d.label} />
                  </button>
                ))}
              </div>
              {activeDecal && activeDecal.finishes.length > 1 && (
                <div className="decal-finish">
                  <span>Decal finish</span>
                  <div className="pill-group" role="radiogroup" aria-label="Decal finish">
                    {activeDecal.finishes.map((finish) => (
                      <button
                        key={finish}
                        type="button"
                        role="radio"
                        aria-checked={activeState.decalFinish === finish}
                        className={activeState.decalFinish === finish ? 'selected' : ''}
                        onClick={() => patchWindow('w1', { decalFinish: finish })}
                      >
                        {finish === 'transparent' ? 'Transparent' : 'Opaque'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </fieldset>
          )}

          <fieldset className="filter-fieldset">
            <legend>Filter colors</legend>
            <div className="color-options">
              {SOLID_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`filter-chip${activeState.filterId === f.id ? ' selected' : ''}`}
                  style={{ background: f.colors[0] }}
                  title={f.label}
                  aria-pressed={activeState.filterId === f.id}
                  onClick={() => selectFilter(f.id)}
                >
                  {f.uv && <span className="uv">UV</span>}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="filter-fieldset gradient-fieldset">
            <legend>Gradient filters</legend>
            <div className="gradient-options">
              {GRADIENT_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`filter-chip${activeState.filterId === f.id ? ' selected' : ''}`}
                  style={{ background: `linear-gradient(${f.colors[0]}, ${f.colors[1]})` }}
                  title={f.label}
                  aria-pressed={activeState.filterId === f.id}
                  onClick={() => selectFilter(f.id)}
                />
              ))}
            </div>
          </fieldset>

          <div className="window-actions">
            <button type="button" className="outline-button" onClick={applyToAllWindows}>
              Apply to all 4 windows
            </button>
            <button type="button" className="text-button clear-button" onClick={clearWindow}>
              Clear this window
            </button>
          </div>
        </section>

        {/* 4 · Text removal */}
        <section className="option-section" aria-labelledby="text-removal-heading">
          <div className="section-heading">
            <h2 id="text-removal-heading"><span className="step">4</span> Text removal</h2>
            <div className="service-heading-actions">
              <span className="selection-label">Optional · + {money(SERVICE_PRICE)}</span>
              <button
                type="button"
                className="service-toggle"
                aria-expanded={build.textRemoval.enabled}
                aria-controls="text-removal-panel"
                onClick={() =>
                  patch({ textRemoval: { ...build.textRemoval, enabled: !build.textRemoval.enabled } })
                }
              >
                {build.textRemoval.enabled ? 'Remove' : 'Add'}
              </button>
            </div>
          </div>
          {build.textRemoval.enabled && (
            <div id="text-removal-panel">
              <p className="removal-help">
                Choose the words or analog clock numbers to remove. {money(SERVICE_PRICE)} per watch,
                regardless of how many you select.
              </p>
              <div className="removal-options" role="group" aria-labelledby="text-removal-heading">
                {TEXT_REMOVAL_TARGETS.map((target) => (
                  <button
                    key={target}
                    type="button"
                    className={`removal-chip${build.textRemoval.targets.includes(target) ? ' selected' : ''}`}
                    aria-pressed={build.textRemoval.targets.includes(target)}
                    onClick={() => toggleRemovalTarget(target)}
                  >
                    {target}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 5 · Laser engraving */}
        <section className="option-section" aria-labelledby="engraving-heading">
          <div className="section-heading">
            <h2 id="engraving-heading"><span className="step">5</span> Laser engraving</h2>
            <div className="service-heading-actions">
              <span className="selection-label">Optional · + {money(SERVICE_PRICE)}</span>
              <button
                type="button"
                className="service-toggle"
                aria-expanded={build.engraving.enabled}
                aria-controls="engraving-panel"
                onClick={() => patch({ engraving: { ...build.engraving, enabled: !build.engraving.enabled } })}
              >
                {build.engraving.enabled ? 'Remove' : 'Add'}
              </button>
            </div>
          </div>
          {build.engraving.enabled && (
            <div id="engraving-panel">
              <p className="engraving-help">
                Add a personal message above or below the original Casio engraving. Leave either row
                blank to skip it.
              </p>
              <fieldset className="filter-fieldset">
                <legend>Font</legend>
                <div className="engraving-font-options">
                  {ENGRAVING_FONTS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={`font-chip${build.engraving.fontId === f.id ? ' selected' : ''}`}
                      style={{ fontFamily: f.css, fontWeight: f.weight }}
                      aria-pressed={build.engraving.fontId === f.id}
                      onClick={() => patch({ engraving: { ...build.engraving, fontId: f.id } })}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="engraving-fields">
                <EngravingInput
                  id="engraving-top"
                  label="Top row"
                  value={build.engraving.top}
                  onChange={(top) => patch({ engraving: { ...build.engraving, top } })}
                />
                <EngravingInput
                  id="engraving-bottom"
                  label="Bottom row"
                  value={build.engraving.bottom}
                  onChange={(bottom) => patch({ engraving: { ...build.engraving, bottom } })}
                />
              </div>
              <p className="engraving-limits">Text only · Up to {ENGRAVING_MAX_CHARS} characters per row.</p>
              <EngravingPreview build={build} />
            </div>
          )}
        </section>

        {/* 6 · Watch box */}
        <section className="option-section" aria-labelledby="box-heading">
          <div className="section-heading">
            <h2 id="box-heading"><span className="step">6</span> Watch box</h2>
            <span className="included-label">Included</span>
          </div>
          <div className="choice-grid">
            {BOX_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`choice${build.boxId === o.id ? ' selected' : ''}`}
                aria-pressed={build.boxId === o.id}
                onClick={() => patch({ boxId: o.id })}
              >
                <span className="swatch" style={{ background: o.id === 'none' ? '#e4e4ea' : 'linear-gradient(135deg,#9b5fff,#5b21b6)' }} />
                <span className="choice-label">
                  {o.label}
                  <span className="choice-sub">{o.description}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Price breakdown */}
        <section className="price-breakdown" aria-label="Price breakdown">
          <div className="row">
            <span>Custom Royale · {getCase(build.caseId).label} / {getBand(build.bandId).label}</span>
            <span>{money(pricing.base)}</span>
          </div>
          {pricing.service !== 'none' && (
            <div className="row">
              <span>
                {pricing.service === 'both'
                  ? 'Text removal + laser engraving'
                  : pricing.service === 'text-removal'
                    ? 'Text removal'
                    : 'Laser engraving'}
              </span>
              <span>+ {money(pricing.serviceAdd)}</span>
            </div>
          )}
          <div className="row total-line">
            <strong>Your total</strong>
            <strong>{money(pricing.total)} <small>{PRODUCT.currency}</small></strong>
          </div>
          <p className="note">All builds include a brand new genuine Casio AE1200 base watch.</p>
          <label className="terms-check">
            <input
              type="checkbox"
              checked={build.termsAccepted}
              onChange={(e) => {
                patch({ termsAccepted: e.target.checked });
                if (e.target.checked) setCartError('');
              }}
            />
            <span>I understand that custom designs are exempt from returns.</span>
          </label>
          {cartError && <p className="cart-error" role="alert">{cartError}</p>}
        </section>
      </div>

      {/* ------------------------------------------------ purchase bar */}
      <footer className="purchase-bar">
        <div className="purchase-inner">
          <div className="purchase-summary">
            <div className="purchase-price">
              <span className="purchase-title">Your custom Royale · {pricing.variant.title}</span>
              <strong>{money(pricing.total)} <small>{PRODUCT.currency}</small></strong>
            </div>
          </div>
          <span className="purchase-note">
            Gifting and uncertain? We have gift cards.
          </span>
          <div className="purchase-actions">
            <div className="purchase-shipping" role="status" data-unlocked={shippingRemaining === 0}>
              <strong>
                {shippingRemaining === 0 ? 'Unlocked' : `${money(shippingRemaining)} to unlock`}
              </strong>
              <span>Free shipping over {money(FREE_SHIPPING_AT)}</span>
            </div>
            <button type="button" className="primary-button" onClick={addToCart}>
              <span>Add to cart</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14m-5-5 5 5-5 5" />
              </svg>
            </button>
          </div>
        </div>
      </footer>

      <div className={`toast${toast ? ' show' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function FragmentRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

function DecalThumb({ id, slug, label }: { id: string; slug: string; label: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="decal-fallback">{label}</span>;
  return <img src={decalAsset(slug)} alt={label} loading="lazy" onError={() => setFailed(true)} />;
}

function EngravingInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="engraving-field">
      <label htmlFor={id}>
        {label} <span>{value.length} / {ENGRAVING_MAX_CHARS}</span>
      </label>
      <input
        id={id}
        type="text"
        maxLength={ENGRAVING_MAX_CHARS}
        autoComplete="off"
        spellCheck={false}
        placeholder={label === 'Top row' ? 'engraving 1' : 'engraving 2'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function EngravingPreview({ build }: { build: BuildState }) {
  const [imgFailed, setImgFailed] = useState(false);
  const font = ENGRAVING_FONTS.find((f) => f.id === build.engraving.fontId) ?? ENGRAVING_FONTS[0];
  const hasText = build.engraving.top.trim() || build.engraving.bottom.trim();
  return (
    <figure className="engraving-preview">
      {!imgFailed && (
        <img
          src={ASSETS.backplate}
          alt="Stainless steel backplate with original Casio engraving"
          onError={() => setImgFailed(true)}
        />
      )}
      <div className="engraving-lines" style={{ fontFamily: font.css, fontWeight: font.weight }}>
        <span>{build.engraving.top || ' '}</span>
        <span>{build.engraving.bottom || ' '}</span>
      </div>
      <figcaption>{hasText ? 'ENGRAVING PREVIEW' : 'EXAMPLE ENGRAVING'}</figcaption>
    </figure>
  );
}
