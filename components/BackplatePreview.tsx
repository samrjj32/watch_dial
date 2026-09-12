'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ENGRAVING_ROWS, engravingFont, engravingFontStack, type Engraving } from '@/lib/catalog';
import { ASSETS } from '@/lib/assets';

const SIZE = 1024;
const FONT_SIZE = 70;

/** Engraving strips, independent of the factory inscription block. */
const AREAS: Record<string, [number, number, number, number]> = {
  top: [247, 257, 530, 86],
  bottom: [247, 685, 530, 86],
};

/**
 * The factory block is composited as real type rather than generated pixels,
 * so the model number and legends can never drift.
 */
const INSCRIPTION = [
  { text: 'CASIO', y: 441, size: 29, weight: 700 },
  { text: 'AE-1200WH', x: 544, y: 475, size: 19 },
  { text: 'STAINLESS STEEL BACK', y: 503, size: 17 },
  { text: 'WATER RESISTANT 10BAR', y: 530, size: 17 },
  { text: 'MADE IN CHINA', y: 557, size: 15 },
  { text: 'EA', y: 583, size: 15 },
];

const INSCRIPTION_FONT = '"JellyLab Engraving", Arial, Helvetica, sans-serif';

/** Scales a row down until it fits its strip, mirroring the canvas renderer. */
function EngravedRow({ text, area, family, weight }: {
  text: string;
  area: [number, number, number, number];
  family: string;
  weight: number;
}) {
  const ref = useRef<SVGTextElement>(null);
  const [scale, setScale] = useState(1);
  const [x, y, width, height] = area;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const value = text.trim();

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || !value) return;
    let active = true;
    const fit = () => {
      if (!active) return;
      const measured = element.getComputedTextLength();
      if (!measured) return;
      setScale(Math.min(1, (width - 12) / measured, (height - 8) / FONT_SIZE));
    };
    fit();
    document.fonts?.ready.then(fit).catch(() => {});
    return () => {
      active = false;
    };
  }, [value, family, weight, width, height]);

  if (!value) return null;

  return (
    <g
      transform={`translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`}
      style={{ mixBlendMode: 'multiply' }}
    >
      <text
        ref={ref}
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily={family}
        fontWeight={weight}
        fontSize={FONT_SIZE}
        fill="rgba(89,49,30,.82)"
      >
        {value}
      </text>
    </g>
  );
}

export default function BackplatePreview({
  engraving,
  label,
}: {
  engraving: Engraving;
  label: string;
}) {
  const font = engravingFont(engraving.font);
  const [imageFailed, setImageFailed] = useState(false);

  // The <image> element has no onError in every engine; probe the URL instead.
  useEffect(() => {
    const probe = new Image();
    probe.onerror = () => setImageFailed(true);
    probe.src = ASSETS.backplate;
  }, []);

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={label}>
      <rect x="0" y="0" width={SIZE} height={SIZE} fill="#fff" />
      {imageFailed ? (
        <>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 24} fill="#c3c7cb" />
          <circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 86} fill="#d5d9dc" />
        </>
      ) : (
        <image href={ASSETS.backplate} x="0" y="0" width={SIZE} height={SIZE} />
      )}

      <g fontFamily={INSCRIPTION_FONT} textAnchor="middle" dominantBaseline="central">
        {INSCRIPTION.map((line) => (
          <g key={line.text}>
            <text
              x={(line.x ?? 512) + 0.7}
              y={line.y + 1.1}
              fontSize={line.size}
              fontWeight={line.weight ?? 400}
              fill="rgba(255,255,255,.64)"
            >
              {line.text}
            </text>
            <text
              x={line.x ?? 512}
              y={line.y}
              fontSize={line.size}
              fontWeight={line.weight ?? 400}
              fill="rgba(66,60,53,.42)"
            >
              {line.text}
            </text>
          </g>
        ))}
        <rect x="410.7" y="463.1" width="51" height="23" fill="none" stroke="rgba(255,255,255,.58)" strokeWidth="1" />
        <text x="436.2" y="476.1" fontSize="18" fill="rgba(255,255,255,.64)">3299</text>
        <text x="435.5" y="475" fontSize="18" fill="rgba(66,60,53,.42)">3299</text>
        <rect x="410" y="462" width="51" height="23" fill="none" stroke="rgba(66,60,53,.4)" strokeWidth="1" />
      </g>

      {ENGRAVING_ROWS.map((row) => (
        <EngravedRow
          key={row}
          text={engraving[row]}
          area={AREAS[row]}
          family={engravingFontStack(font)}
          weight={font.weight}
        />
      ))}
    </svg>
  );
}
