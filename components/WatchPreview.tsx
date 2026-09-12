'use client';

import { useState } from 'react';
import type { BuildState } from '@/lib/build-state';
import {
  ASSETS,
  STAGE,
  WINDOWS,
  bandOverlay,
  caseOverlay,
  decalAsset,
  getDecal,
  getFilter,
  type WindowId,
} from '@/lib/customizer';
import { getBand, getCase } from '@/lib/product';

interface Props {
  build: BuildState;
  onSelectWindow: (id: WindowId) => void;
}

const CIRCLE = WINDOWS[0].shape as { kind: 'circle'; cx: number; cy: number; r: number };

/** Rendered when the CDN photography can't load: a schematic AE1200. */
function SchematicWatch({ build }: { build: BuildState }) {
  const caseColors = getCase(build.caseId).swatch;
  const bandColors = getBand(build.bandId).swatch;
  const removed = new Set(build.textRemoval.enabled ? build.textRemoval.targets : []);
  const label = (text: string, x: number, y: number, size = 26, rotate = 0) =>
    removed.has(text) ? null : (
      <text
        key={text}
        x={x}
        y={y}
        fontSize={size}
        fontWeight={700}
        fill="#e8e8e8"
        textAnchor="middle"
        transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
        style={{ letterSpacing: 3 }}
      >
        {text}
      </text>
    );

  return (
    <svg viewBox={`0 0 ${STAGE.width} ${STAGE.height}`} className="watch-hotspots" aria-hidden>
      <defs>
        <linearGradient id="schematic-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={bandColors[0]} />
          <stop offset="1" stopColor={bandColors[1]} />
        </linearGradient>
        <linearGradient id="schematic-case" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={caseColors[0]} />
          <stop offset="1" stopColor={caseColors[1]} />
        </linearGradient>
      </defs>
      {/* straps */}
      <rect x={355} y={10} width={330} height={330} rx={40} fill="url(#schematic-band)" />
      <rect x={355} y={1130} width={330} height={330} rx={40} fill="url(#schematic-band)" />
      {/* case + bezel */}
      <rect x={205} y={300} width={640} height={860} rx={90} fill="url(#schematic-case)" />
      <rect x={262} y={368} width={524} height={716} rx={56} fill="#17181b" />
      {/* markings */}
      {label('WORLD TIME', 524, 430, 30)}
      {label('5 ALARMS', 384, 500, 22)}
      {label('CASIO', 648, 500, 26)}
      {label('WR100M', 396, 690, 20)}
      {label('10 YEAR BATTERY', 524, 912, 22)}
      {label('ILLUMINATOR', 524, 1035, 34)}
      {label('ADJUST', 288, 555, 18, -90)}
      {label('LIGHT', 762, 505, 18, 90)}
      {label('MODE', 288, 780, 18, -90)}
      {label('SEARCH', 762, 780, 18, 90)}
      {/* LCD windows */}
      <circle cx={CIRCLE.cx} cy={CIRCLE.cy} r={CIRCLE.r} fill="#cfd3c4" />
      {!removed.has('Analog clock numbers') && (
        <g fill="#3a3d35" fontSize={20} fontWeight={700} textAnchor="middle">
          <text x={CIRCLE.cx} y={CIRCLE.cy - CIRCLE.r + 26}>60</text>
          <text x={CIRCLE.cx + CIRCLE.r - 18} y={CIRCLE.cy + 7}>15</text>
          <text x={CIRCLE.cx} y={CIRCLE.cy + CIRCLE.r - 12}>30</text>
          <text x={CIRCLE.cx - CIRCLE.r + 18} y={CIRCLE.cy + 7}>45</text>
        </g>
      )}
      <g stroke="#2c2e2a" strokeWidth={7} strokeLinecap="round">
        <line x1={CIRCLE.cx} y1={CIRCLE.cy} x2={CIRCLE.cx + 8} y2={CIRCLE.cy - 62} />
        <line x1={CIRCLE.cx} y1={CIRCLE.cy} x2={CIRCLE.cx + 46} y2={CIRCLE.cy + 34} />
      </g>
      <circle cx={CIRCLE.cx} cy={CIRCLE.cy} r={11} fill="#2c2e2a" />
      <rect x={516} y={455} width={230} height={66} rx={10} fill="#cfd3c4" />
      <rect x={516} y={533} width={230} height={120} rx={10} fill="#cfd3c4" />
      <rect x={300} y={668} width={448} height={200} rx={12} fill="#cfd3c4" />
      <g fill="#33362f" fontFamily="monospace">
        <text x={330} y={718} fontSize={38} fontWeight={700}>PAR</text>
        <text x={620} y={718} fontSize={38} fontWeight={700}>7-4</text>
        <text x={318} y={830} fontSize={104} fontWeight={700}>10:22</text>
        <text x={648} y={840} fontSize={56} fontWeight={700}>31</text>
      </g>
    </svg>
  );
}

export default function WatchPreview({ build, onSelectWindow }: Props) {
  const [baseFailed, setBaseFailed] = useState(false);
  const [failedLayers, setFailedLayers] = useState<Record<string, boolean>>({});

  const markFailed = (key: string) => setFailedLayers((prev) => ({ ...prev, [key]: true }));

  const caseSrc = caseOverlay(build.caseId);
  const band = bandOverlay(build.bandId);
  const w1 = build.windows.w1;
  const decal = getDecal(w1.decalId);

  return (
    <div className="watch-stage" id="watch-stage">
      {!baseFailed ? (
        <>
          <img
            className="layer"
            src={ASSETS.base}
            alt="Casio Royale base watch"
            onError={() => setBaseFailed(true)}
            draggable={false}
          />
          {caseSrc && !failedLayers[caseSrc] && (
            <img className="layer" src={caseSrc} alt="" onError={() => markFailed(caseSrc)} draggable={false} />
          )}
          {build.caseId === 'gold' && <div className="layer-gold-tint" />}
          {band && !failedLayers[band.src + build.bandId] && (
            <img
              className={`layer ${band.className ?? ''}`}
              src={band.src}
              alt=""
              onError={() => markFailed(band.src + build.bandId)}
              draggable={false}
            />
          )}
          {build.textRemoval.enabled &&
            build.textRemoval.targets.length > 0 &&
            !failedLayers.patches && (
              <img
                className="layer"
                src={ASSETS.textRemovalPatches}
                alt=""
                onError={() => markFailed('patches')}
                draggable={false}
              />
            )}
        </>
      ) : (
        <SchematicWatch build={build} />
      )}

      {/* Window filters, decal, and click hotspots */}
      <svg
        className="watch-hotspots"
        viewBox={`0 0 ${STAGE.width} ${STAGE.height}`}
        role="group"
        aria-label="Choose a watch window"
      >
        <defs>
          <clipPath id="clip-w1">
            <circle cx={CIRCLE.cx} cy={CIRCLE.cy} r={CIRCLE.r} />
          </clipPath>
          {WINDOWS.map((w) => {
            const filter = getFilter(build.windows[w.id].filterId);
            if (!filter || filter.kind !== 'gradient') return null;
            return (
              <linearGradient key={w.id} id={`grad-${w.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={filter.colors[0]} />
                <stop offset="1" stopColor={filter.colors[1]} />
              </linearGradient>
            );
          })}
        </defs>

        {/* color filters (multiply so the LCD shows through) */}
        <g style={{ mixBlendMode: 'multiply' }} opacity={0.82}>
          {WINDOWS.map((w) => {
            const filter = getFilter(build.windows[w.id].filterId);
            if (!filter) return null;
            const fill = filter.kind === 'solid' ? filter.colors[0] : `url(#grad-${w.id})`;
            return w.shape.kind === 'circle' ? (
              <circle key={w.id} cx={w.shape.cx} cy={w.shape.cy} r={w.shape.r} fill={fill} />
            ) : (
              <rect
                key={w.id}
                x={w.shape.x}
                y={w.shape.y}
                width={w.shape.w}
                height={w.shape.h}
                rx={w.shape.rx}
                fill={fill}
              />
            );
          })}
        </g>

        {/* circle-window decal */}
        {decal && !failedLayers[`decal-${decal.id}`] && (
          <image
            href={decalAsset(decal.slug)}
            x={CIRCLE.cx - CIRCLE.r}
            y={CIRCLE.cy - CIRCLE.r}
            width={CIRCLE.r * 2}
            height={CIRCLE.r * 2}
            clipPath="url(#clip-w1)"
            preserveAspectRatio="xMidYMid slice"
            opacity={w1.decalFinish === 'transparent' ? 0.55 : 1}
            onError={() => markFailed(`decal-${decal.id}`)}
          />
        )}

        {/* hotspots */}
        {WINDOWS.map((w) => {
          const active = build.activeWindow === w.id;
          const common = {
            className: `hotspot${active ? ' active' : ''}`,
            onClick: () => onSelectWindow(w.id),
            role: 'button' as const,
            tabIndex: 0,
            'aria-label': `Window ${w.index}: ${w.description}`,
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectWindow(w.id);
              }
            },
          };
          return w.shape.kind === 'circle' ? (
            <circle key={w.id} cx={w.shape.cx} cy={w.shape.cy} r={w.shape.r + 6} {...common} />
          ) : (
            <rect
              key={w.id}
              x={w.shape.x - 5}
              y={w.shape.y - 5}
              width={w.shape.w + 10}
              height={w.shape.h + 10}
              rx={w.shape.rx + 4}
              {...common}
            />
          );
        })}

        {/* window numbers */}
        {WINDOWS.map((w) => {
          const pos =
            w.shape.kind === 'circle'
              ? { x: w.shape.cx - w.shape.r - 26, y: w.shape.cy - w.shape.r + 4 }
              : { x: w.shape.x + w.shape.w + 16, y: w.shape.y + 26 };
          return (
            <text key={w.id} className="hotspot-num" x={pos.x} y={pos.y} textAnchor="middle">
              {w.index}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
