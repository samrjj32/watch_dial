'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import WatchPreview from './WatchPreview';
import MiniWatch from './MiniWatch';
import BackplatePreview from './BackplatePreview';
import CartDrawer, { type CartItem } from './CartDrawer';
import {
  CASES,
  DECALS,
  DECAL_FINISHES,
  DEFAULT_BUILD,
  ENGRAVING_MAX_LENGTH,
  ENGRAVING_FONTS,
  ENGRAVING_ROWS,
  ENGRAVING_EXAMPLES,
  FILTERS,
  TEXT_REMOVALS,
  TEXT_REMOVAL_PRICE,
  ENGRAVING_PRICE,
  WINDOWS,
  type Build,
  type DecalFinish,
  byId,
  buildProperties,
  circleDecalName,
  decalById,
  engravingFont,
  extendGradient,
  filterBackground,
  hasEngraving,
  money,
  normalizeBuild,
  normalizeEngravingLine,
  priceBuild,
  usShippingStatus,
} from '@/lib/catalog';
import { ASSETS, CASE_IMAGES, decalImage, isTextAsset } from '@/lib/assets';

const STORAGE_KEY = 'jellylab:builder';

/** Keyboard support for every `role="radiogroup"` in the builder. */
function handleRadioKeys(event: React.KeyboardEvent<HTMLElement>) {
  const current = (event.target as HTMLElement).closest?.('[role=radio]') as HTMLElement | null;
  const group = current?.closest('[role=radiogroup]');
  if (!current || !group) return;
  const options = Array.from(group.querySelectorAll<HTMLElement>('[role=radio]'));
  const index = options.indexOf(current);
  let target: HTMLElement | undefined;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = options[(index + 1) % options.length];
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = options[(index - 1 + options.length) % options.length];
  if (event.key === 'Home') target = options[0];
  if (event.key === 'End') target = options.at(-1);
  if (!target) return;
  event.preventDefault();
  target.click();
  target.focus();
}

/**
 * Decorative artwork. If the CDN is unreachable the image collapses instead of
 * leaving a broken-image glyph in the middle of a swatch or a heading.
 */
function Art({
  src,
  size,
  className,
}: {
  src: string;
  size: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      className={className}
      src={src}
      width={size}
      height={size}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

/** Tracks whether the artwork for the current case has arrived. */
function useArtworkReady(build: Build) {
  const caseUrl = CASE_IMAGES[build.case] ?? CASE_IMAGES['resin-silver'];
  const decal = decalById(build.circleDecal?.id);
  const decalUrl = decal ? decalImage(decal.image) : null;
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let active = true;
    setState('loading');
    const load = (src: string) =>
      new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve();
        image.onerror = () => reject(new Error(src));
        image.src = src;
      });
    // Text assets carry their payload as base64 and are resolved by the preview.
    const sources = [isTextAsset(caseUrl) ? null : caseUrl, decalUrl].filter(Boolean) as string[];
    Promise.all(sources.map(load))
      .then(() => active && setState('ready'))
      .catch(() => active && setState('error'));
    return () => {
      active = false;
    };
  }, [caseUrl, decalUrl]);

  return state;
}

export default function Builder() {
  const [build, setBuild] = useState<Build>(DEFAULT_BUILD);
  const [activeWindow, setActiveWindow] = useState(0);
  const [expanded, setExpanded] = useState({ removal: false, engraving: false });
  const [toast, setToast] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const windowsSection = useRef<HTMLElement>(null);
  const previewCard = useRef<HTMLDivElement>(null);
  const hydrated = useRef(false);

  /* -------------------------------------------------- restore a saved build */
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const encoded =
        new URLSearchParams(window.location.hash.slice(1)).get('build') ||
        sessionStorage.getItem(STORAGE_KEY);
      if (encoded && encoded.length < 4000) setBuild(normalizeBuild(JSON.parse(encoded)));
    } catch {
      /* a malformed link just starts from the default build */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(build));
    } catch {
      /* private mode */
    }
  }, [build]);

  /* -------------------------------------------------- derived values */
  const pricing = useMemo(() => priceBuild(build), [build]);
  const properties = useMemo(() => buildProperties(build), [build]);
  const shipping = usShippingStatus(pricing.total);
  const artwork = useArtworkReady(build);
  const window0Decal = decalById(build.circleDecal?.id);
  const activeFilter = byId(FILTERS, build.windows[activeWindow])!;
  const activeIsDecal = activeWindow === 0 && !!build.circleDecal;
  const engravingSelected = hasEngraving(build.engraving);
  const previewEngraving = engravingSelected
    ? build.engraving
    : { ...ENGRAVING_EXAMPLES, font: build.engraving.font };
  const watchLabel = 'Your Casio Royale: ' + Object.values(properties).join(', ');

  const update = useCallback((patch: Partial<Build>) => {
    setBuild((current) => normalizeBuild({ ...current, ...patch }));
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 4000);
  }, []);

  /*
   * Publish the sticky preview's height so the stylesheet can keep scroll
   * targets clear of it. Without this the browser's own scroll-into-view
   * (focus, anchors, `scrollIntoView`) parks a control underneath the preview
   * or the fixed purchase bar, where it can't be tapped.
   */
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const card = previewCard.current;
    const host = root.current;
    if (!card || !host || typeof ResizeObserver === 'undefined') return;
    const publish = () => {
      host.style.setProperty('--sticky-preview', `${Math.round(card.offsetHeight)}px`);
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  /* -------------------------------------------------- interactions */
  const selectWindow = (index: number, { fromPreview = false } = {}) => {
    setActiveWindow(index);
    if (!fromPreview) return;
    // On one-column layouts the controls sit below the sticky preview.
    if (!window.matchMedia('(max-width: 820px)').matches) return;
    const section = windowsSection.current;
    if (!section) return;
    const offset = (previewCard.current?.getBoundingClientRect().height ?? 0) + 12;
    window.scrollTo({
      top: section.getBoundingClientRect().top + window.scrollY - offset,
      behavior: 'smooth',
    });
  };

  const selectFilter = (id: string) => {
    const windows = [...build.windows];
    windows[activeWindow] = id;
    update({
      windows,
      gradientLayout: 'separate',
      ...(activeWindow === 0 ? { circleDecal: null } : {}),
    });
  };

  const selectDecal = (id: string | 'none') => {
    const decal = id === 'none' ? null : decalById(id);
    if (id !== 'none' && !decal) return;
    const windows = [...build.windows];
    windows[0] = 'none';
    update({ windows, circleDecal: decal ? { id: decal.id, finish: decal.finishes[0] } : null });
  };

  const setDecalFinish = (finish: DecalFinish) => {
    if (!build.circleDecal) return;
    update({ circleDecal: { ...build.circleDecal, finish } });
  };

  const applyToAll = () => {
    if (activeIsDecal) return;
    if ((activeFilter.colors?.length ?? 0) > 1) {
      setBuild(extendGradient(build, activeFilter.id));
      showToast(
        build.circleDecal
          ? 'Gradient extended across the thin, map and time windows. Your decal stays in place.'
          : 'Gradient extended across all four windows.'
      );
      return;
    }
    update({
      windows: WINDOWS.map(() => activeFilter.id),
      circleDecal: null,
      gradientLayout: 'separate',
    });
    showToast('Applied to all four windows.');
  };

  const clearWindow = () => {
    const windows = [...build.windows];
    windows[activeWindow] = 'none';
    update({
      windows,
      gradientLayout: 'separate',
      ...(activeWindow === 0 ? { circleDecal: null } : {}),
    });
  };

  const toggleRemoval = (id: string, checked: boolean) => {
    const selected = new Set(build.textRemovals);
    if (checked) selected.add(id);
    else selected.delete(id);
    update({ textRemovals: [...selected] });
  };

  const toggleAllRemovals = (checked: boolean) => {
    update({ textRemovals: checked ? TEXT_REMOVALS.map((option) => option.id) : [] });
  };

  const copyBuild = async () => {
    const url = new URL(window.location.href);
    url.hash = new URLSearchParams({ build: JSON.stringify(build) }).toString();
    try {
      await navigator.clipboard.writeText(url.href);
      showToast('Build link copied.');
    } catch {
      window.history.replaceState(null, '', url);
      showToast('Your build is in the address bar. Copy the URL to share it.');
    }
  };

  const startOver = () => {
    setBuild(DEFAULT_BUILD);
    setActiveWindow(0);
    setExpanded({ removal: false, engraving: false });
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    showToast('Started a fresh build.');
  };

  const surpriseMe = () => {
    const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
    const colours = FILTERS.filter((filter) => filter.colors);
    const useDecal = Math.random() < 0.35;
    const decal = pick(DECALS);
    setBuild(
      normalizeBuild({
        ...DEFAULT_BUILD,
        case: pick(CASES).id,
        windows: WINDOWS.map(() => pick(colours).id),
        circleDecal: useDecal ? { id: decal.id, finish: decal.finishes[0] } : null,
      })
    );
    showToast('Here is a random Royale. Keep tweaking it.');
  };

  const addToCart = () => {
    const snapshot = normalizeBuild(build);
    const id =
      'JL-' +
      (globalThis.crypto?.randomUUID?.().slice(0, 8).toUpperCase() ??
        Math.random().toString(36).slice(2, 10).toUpperCase());
    setCart((items) => [
      ...items,
      { id, build: snapshot, quantity: 1, unitPrice: priceBuild(snapshot).total },
    ]);
    setCartOpen(true);
  };

  /* -------------------------------------------------- render */
  const sections: Array<{
    key: 'removal' | 'engraving';
    label: string;
    selected: boolean;
  }> = [
    { key: 'removal', label: 'text removal', selected: build.textRemovals.length > 0 },
    { key: 'engraving', label: 'laser engraving', selected: engravingSelected },
  ];
  const toggleLabel = (key: 'removal' | 'engraving') => {
    const section = sections.find((s) => s.key === key)!;
    return expanded[key] ? 'Done' : section.selected ? 'Edit' : 'Add';
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="jellylab-royale-builder" ref={root} onKeyDown={handleRadioKeys}>
      <header className="topbar">
        <span className="brand">
          <span className="brand-star" aria-hidden>
            ✳
          </span>
          JellyLab
        </span>
        <span className="topbar-product">Custom Casio Royale</span>
        <span className="prototype-pill">Prototype</span>
        <button
          type="button"
          className="cart-trigger"
          onClick={() => setCartOpen(true)}
          aria-label={`Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
        >
          {/* Narrow layouts drop the word, so the button keeps a glyph. */}
          <svg className="cart-icon" viewBox="0 0 24 24" aria-hidden>
            <path d="M6 7h12l-1 12H7L6 7Zm3 0a3 3 0 0 1 6 0" />
          </svg>
          <span className="cart-label">Cart</span>
          <span className="cart-count">{cartCount}</span>
        </button>
      </header>

      <div className="builder">
        {/* ------------------------------------------------ preview */}
        <div className="preview-column">
          <div className="preview-sticky">
            <div className="preview-card" ref={previewCard}>
              <div className="preview-topline">
                <p className="eyebrow">YOUR ROYALE · DIGITAL MOCKUP</p>
                <span className="made-to-order">
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Hand built to order
                </span>
              </div>

              <div className="watch-stage" aria-busy={artwork === 'loading'}>
                <WatchPreview
                  className="watch-canvas"
                  build={build}
                  activeWindow={activeWindow}
                  onSelectWindow={(index) => selectWindow(index, { fromPreview: true })}
                  interactive
                  label={watchLabel}
                />
                <span className="preview-logo" aria-hidden>
                  <Art className="preview-logo-spin" src={ASSETS.logoSpin} size={56} />
                </span>
                {artwork !== 'ready' && (
                  <div className="image-loading">
                    {artwork === 'loading'
                      ? 'Loading your watch preview…'
                      : 'This watch preview could not load. Select your option again to retry.'}
                  </div>
                )}
              </div>

              <div className="preview-caption">
                <span className="preview-instruction">Tap a window to color it.</span>
                <span className="active-caption">
                  0{activeWindow + 1} · {WINDOWS[activeWindow].name} selected
                </span>
              </div>
            </div>

            <section className="build-summary" aria-labelledby="summary-title">
              <div className="summary-heading">
                <h2 className="eyebrow" id="summary-title">
                  YOUR BUILD
                </h2>
                <button type="button" className="text-button" onClick={copyBuild}>
                  Copy link to build ↗
                </button>
              </div>
              <dl>
                {Object.entries(properties).map(([label, value]) => (
                  <div key={label} style={{ display: 'contents' }}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>

        {/* ------------------------------------------------ controls */}
        <div className="controls-column">
          <div className="intro">
            <div className="builder-heading">
              <Art className="builder-logo" src={ASSETS.logo} size={64} />
              <h1>
                JellyLab <span>Casio Royale</span> Builder
              </h1>
            </div>
            <p>
              Choose the watch, its window colours and the finishing services. Every Royale is a
              genuine Casio AE1200 rebuilt by hand.
            </p>
            <div className="build-actions">
              <button type="button" className="outline-button" onClick={surpriseMe}>
                Surprise me
              </button>
              <button type="button" className="text-button" onClick={startOver}>
                Start over
              </button>
            </div>
          </div>

          {/* 1 · Case */}
          <section className="option-section case-section" aria-labelledby="case-heading">
            <div className="section-heading">
              <h2 id="case-heading">
                <span className="step">1</span> Case
              </h2>
              <span className="selection-label">{byId(CASES, build.case)!.name}</span>
            </div>
            <div className="choice-grid case-grid" role="radiogroup" aria-label="Case material and color">
              {CASES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="choice"
                  role="radio"
                  aria-checked={build.case === option.id}
                  tabIndex={build.case === option.id ? 0 : -1}
                  onClick={() => update({ case: option.id })}
                >
                  <span className="material-swatch" style={{ background: option.swatch }} />
                  <span className="choice-text">
                    <span className="choice-name">{option.name}</span>
                    <span className="choice-description">{option.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* 2 · Windows */}
          <section className="option-section" aria-labelledby="window-heading" ref={windowsSection}>
            <div className="section-heading">
              <h2 id="window-heading">
                <span className="step">2</span> Windows
              </h2>
              <span className="included-label">Filters &amp; decals included</span>
            </div>

            <div className="window-options">
              {WINDOWS.map((window, index) => {
                const decal = index === 0 ? window0Decal : null;
                const filter = byId(FILTERS, build.windows[index])!;
                return (
                  <button
                    key={window.id}
                    type="button"
                    className="window-option"
                    aria-pressed={index === activeWindow}
                    aria-label={`Window ${index + 1}, ${window.name}: ${
                      decal ? circleDecalName(build.circleDecal) : filter.name
                    }`}
                    onClick={() => selectWindow(index)}
                  >
                    <MiniWatch build={build} window={index} activeWindow={activeWindow} />
                    <span>
                      {index + 1} · {window.name}
                    </span>
                    {decal ? (
                      <Art
                        className="window-filter-dot window-decal-dot"
                        src={decalImage(decal.image)}
                        size={14}
                      />
                    ) : (
                      <i className="window-filter-dot" style={{ background: filterBackground(filter) }} />
                    )}
                  </button>
                );
              })}
            </div>

            <p className="window-description">
              <span>{WINDOWS[activeWindow].description}</span>
              <span className="current-filter">
                {activeIsDecal
                  ? circleDecalName(build.circleDecal)
                  : activeFilter.id === 'none'
                    ? 'No filter'
                    : activeFilter.name}
              </span>
            </p>

            {activeWindow === 0 && (
              <fieldset className="decal-fieldset">
                <legend>
                  DECALS <span>Included · Circle only</span>
                </legend>
                <div className="decal-options" role="radiogroup" aria-label="Circle decal">
                  <button
                    type="button"
                    className="decal-option"
                    role="radio"
                    aria-checked={!build.circleDecal}
                    tabIndex={!build.circleDecal ? 0 : -1}
                    onClick={() => selectDecal('none')}
                  >
                    <span className="decal-disc decal-none" aria-hidden />
                    <span>None</span>
                  </button>
                  {DECALS.map((decal) => (
                    <button
                      key={decal.id}
                      type="button"
                      className="decal-option"
                      role="radio"
                      aria-checked={build.circleDecal?.id === decal.id}
                      tabIndex={build.circleDecal?.id === decal.id ? 0 : -1}
                      aria-label={`${decal.name} decal`}
                      onClick={() => selectDecal(decal.id)}
                    >
                      <span className="decal-disc">
                        <Art src={decalImage(decal.image)} size={52} />
                      </span>
                      <span>{decal.name}</span>
                    </button>
                  ))}
                </div>
                {window0Decal && window0Decal.finishes.length > 1 && (
                  <div className="decal-finish">
                    <span>Decal finish</span>
                    <div role="radiogroup" aria-label="Decal finish" className="decal-finish-options">
                      {DECAL_FINISHES.map((finish) => (
                        <button
                          key={finish.id}
                          type="button"
                          className="decal-finish-option"
                          role="radio"
                          aria-checked={build.circleDecal?.finish === finish.id}
                          tabIndex={build.circleDecal?.finish === finish.id ? 0 : -1}
                          onClick={() => setDecalFinish(finish.id)}
                        >
                          {finish.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </fieldset>
            )}

            <fieldset className="filter-fieldset">
              <legend>FILTER COLORS</legend>
              <div className="color-options" role="radiogroup" aria-label="Solid filter colors">
                {FILTERS.filter((filter) => !filter.short).map((filter) => {
                  const checked = !activeIsDecal && build.windows[activeWindow] === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      className="color-option"
                      role="radio"
                      aria-checked={checked}
                      tabIndex={checked ? 0 : -1}
                      data-value={filter.id}
                      aria-label={filter.name}
                      onClick={() => selectFilter(filter.id)}
                    >
                      <span className="color-disc" style={{ background: filterBackground(filter) }} />
                      <span className="color-name">{filter.name}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="filter-fieldset gradient-fieldset">
              <legend>GRADIENT FILTERS</legend>
              <div className="gradient-options" role="radiogroup" aria-label="Gradient filters">
                {FILTERS.filter((filter) => filter.short).map((filter) => {
                  const checked = !activeIsDecal && build.windows[activeWindow] === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      className="color-option"
                      role="radio"
                      aria-checked={checked}
                      tabIndex={checked ? 0 : -1}
                      aria-label={filter.name}
                      onClick={() => selectFilter(filter.id)}
                    >
                      <span className="color-disc" style={{ background: filterBackground(filter) }} />
                      <span className="color-name">
                        <b>{filter.short}</b>
                        {filter.direction}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="window-actions">
              {!activeIsDecal && (
                <button
                  type="button"
                  className="outline-button"
                  aria-pressed={
                    (activeFilter.colors?.length ?? 0) > 1 && build.gradientLayout === 'continuous'
                  }
                  onClick={applyToAll}
                >
                  {(activeFilter.colors?.length ?? 0) > 1
                    ? 'Extend gradient across all windows'
                    : 'Apply to all 4 windows'}
                </button>
              )}
              <button type="button" className="text-button clear-button" onClick={clearWindow}>
                Clear this window
              </button>
            </div>
          </section>

          {/* 3 · Text removal */}
          <section
            className="option-section optional-service"
            data-expanded={expanded.removal}
            aria-labelledby="removal-heading"
          >
            <div className="section-heading">
              <h2 id="removal-heading">
                <span className="step">3</span> Text removal
              </h2>
              <div className="service-heading-actions">
                <span className="selection-label">
                  {build.textRemovals.length
                    ? `+${money(TEXT_REMOVAL_PRICE)} added`
                    : `Optional · +${money(TEXT_REMOVAL_PRICE)}`}
                </span>
                <button
                  type="button"
                  className="service-toggle"
                  aria-expanded={expanded.removal}
                  aria-label={`${toggleLabel('removal')} text removal`}
                  onClick={() => setExpanded((s) => ({ ...s, removal: !s.removal }))}
                >
                  {toggleLabel('removal')}
                </button>
              </div>
            </div>
            {expanded.removal && (
              <div>
                <p className="removal-help">
                  Choose the words or analog clock numbers to remove. {money(TEXT_REMOVAL_PRICE)} per
                  watch, regardless of how many you select.
                </p>
                <div className="removal-options">
                  <label
                    className="removal-choice removal-all"
                    data-selected={build.textRemovals.length > 0}
                  >
                    <input
                      type="checkbox"
                      checked={build.textRemovals.length === TEXT_REMOVALS.length}
                      ref={(element) => {
                        if (element)
                          element.indeterminate =
                            build.textRemovals.length > 0 &&
                            build.textRemovals.length < TEXT_REMOVALS.length;
                      }}
                      onChange={(event) => toggleAllRemovals(event.target.checked)}
                    />
                    <span>Remove all</span>
                  </label>
                  {TEXT_REMOVALS.map((option) => {
                    const checked = build.textRemovals.includes(option.id);
                    return (
                      <label key={option.id} className="removal-choice" data-selected={checked}>
                        <input
                          type="checkbox"
                          checked={checked}
                          aria-label={`Remove ${option.name}`}
                          onChange={(event) => toggleRemoval(option.id, event.target.checked)}
                        />
                        <span>{option.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* 4 · Laser engraving */}
          <section
            className="option-section optional-service engraving-section"
            data-expanded={expanded.engraving}
            aria-labelledby="engraving-heading"
          >
            <div className="section-heading">
              <h2 id="engraving-heading">
                <span className="step">4</span> Laser engraving
              </h2>
              <div className="service-heading-actions">
                <span className="selection-label">
                  {engravingSelected
                    ? `+${money(ENGRAVING_PRICE)}`
                    : `Optional · +${money(ENGRAVING_PRICE)}`}
                </span>
                <button
                  type="button"
                  className="service-toggle"
                  aria-expanded={expanded.engraving}
                  aria-label={`${toggleLabel('engraving')} laser engraving`}
                  onClick={() => setExpanded((s) => ({ ...s, engraving: !s.engraving }))}
                >
                  {toggleLabel('engraving')}
                </button>
              </div>
            </div>
            {expanded.engraving && (
              <div>
                <p className="engraving-help">
                  Add a personal message above or below the original Casio engraving. Leave either
                  row blank to skip it.
                </p>
                <fieldset className="engraving-font-fieldset">
                  <legend>Font</legend>
                  <div className="engraving-font-options">
                    {ENGRAVING_FONTS.map((font) => (
                      <label
                        key={font.id}
                        className="engraving-font-choice"
                        data-font={font.id}
                        data-selected={build.engraving.font === font.id}
                      >
                        <input
                          type="radio"
                          name="engraving-font"
                          value={font.id}
                          checked={build.engraving.font === font.id}
                          onChange={() =>
                            update({ engraving: { ...build.engraving, font: font.id } })
                          }
                        />
                        <span className="font-sample" aria-hidden>
                          Aa
                        </span>
                        <span>{font.name}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="engraving-fields">
                  {ENGRAVING_ROWS.map((row) => (
                    <div className="engraving-field" key={row}>
                      <label htmlFor={`engraving-${row}`}>
                        {row === 'top' ? 'Top row' : 'Bottom row'}
                        <span>
                          {Array.from(build.engraving[row]).length} / {ENGRAVING_MAX_LENGTH}
                        </span>
                      </label>
                      <input
                        id={`engraving-${row}`}
                        type="text"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder={ENGRAVING_EXAMPLES[row]}
                        value={build.engraving[row]}
                        onChange={(event) =>
                          update({
                            engraving: {
                              ...build.engraving,
                              [row]: normalizeEngravingLine(event.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
                <p className="engraving-limits">
                  Text only · Up to {ENGRAVING_MAX_LENGTH} characters per row.
                </p>

                <figure className="engraving-preview">
                  <BackplatePreview
                    engraving={previewEngraving}
                    label={`${engravingSelected ? 'Your' : 'Example'} stainless steel backplate with original Casio engraving. Font: ${engravingFont(build.engraving.font).name}. Top row: ${previewEngraving.top.trim() || 'blank'}. Bottom row: ${previewEngraving.bottom.trim() || 'blank'}.`}
                  />
                  <figcaption>
                    <span>{engravingSelected ? 'YOUR BACKPLATE' : 'EXAMPLE ENGRAVING'}</span>
                    {engravingSelected && (
                      <button
                        type="button"
                        className="text-button"
                        onClick={() =>
                          update({ engraving: { ...build.engraving, top: '', bottom: '' } })
                        }
                      >
                        Clear text
                      </button>
                    )}
                  </figcaption>
                </figure>
              </div>
            )}
          </section>

          {/* Price */}
          <section className="price-breakdown" aria-label="Price breakdown">
            <div>
              <span>Custom Royale</span>
              <span>{money(pricing.base)}</span>
            </div>
            <div className="upgrade-prices">
              {pricing.upgrades.map((upgrade) => (
                <div className="upgrade-price" key={upgrade.id}>
                  <span>{upgrade.name}</span>
                  <span>+{money(upgrade.price)}</span>
                </div>
              ))}
            </div>
            <div className="total-line">
              <strong>Your total</strong>
              <strong>
                {money(pricing.total)}
                <span> USD</span>
              </strong>
            </div>
            <p>All builds include a brand new genuine Casio AE1200 base watch.</p>
          </section>
        </div>
      </div>

      {/* ------------------------------------------------ purchase bar */}
      <footer className="purchase-bar">
        <div className="purchase-inner">
          <div className="purchase-summary">
            <span className="purchase-preview" aria-hidden>
              <WatchPreview build={build} label="" />
            </span>
            <span className="purchase-price">
              <span className="purchase-title">Your custom Royale</span>
              <strong>
                {money(pricing.total)} <small>USD</small>
              </strong>
            </span>
          </div>
          <p className="purchase-note">
            <span>Gifting and uncertain?</span>
            <a href="https://jellylabwatches.com/products/jellylab-watches-gift-card" target="_blank" rel="noopener noreferrer">
              We have gift cards
            </a>
          </p>
          <div className="purchase-actions">
            <div className="purchase-shipping" data-unlocked={shipping.unlocked} aria-label={shipping.label}>
              <strong>{shipping.headline}</strong>
              <span>{shipping.detail}</span>
            </div>
            <button type="button" className="primary-button add-button" onClick={addToCart}>
              <span>Add to cart</span>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M5 12h14m-5-5 5 5-5 5" />
              </svg>
            </button>
          </div>
        </div>
      </footer>

      <div className={`toast${toast ? ' visible' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>

      <CartDrawer
        open={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onChangeQuantity={(id, quantity) =>
          setCart((items) =>
            quantity <= 0
              ? items.filter((item) => item.id !== id)
              : items.map((item) => (item.id === id ? { ...item, quantity } : item))
          )
        }
        onRemove={(id) => setCart((items) => items.filter((item) => item.id !== id))}
      />
    </div>
  );
}
