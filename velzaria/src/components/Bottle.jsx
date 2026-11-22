import { useId } from 'react';
import { CAPS } from '../data/quiz.js';

/**
 * Art-directed SVG renderings of the five VÉLZARIA bottles.
 * Each silhouette is unique; they share a language of thick glass,
 * fine gold collars and sculpted caps.
 *
 * Replace with real product photography by adding `photos` in data/products.js.
 */

const CAP_SETS = {
  ...Object.fromEntries(CAPS.map((c) => [c.id, c.colors])),
  stone: ['#4A4B33', '#A3A27E', '#6C6D4A'],
};

export const BOTTLE_DEFAULTS = {
  sovereign: { glass: '#EEF0EE', liquid: '#EBD9B4', cap: 'antique' },
  romantic: { glass: '#F2D4D1', liquid: '#E9B3AE', cap: 'rose' },
  conqueror: { glass: '#5E3F78', liquid: '#4A2C63', cap: 'antique' },
  artist: { glass: '#8C8D5A', liquid: '#6F7344', cap: 'stone' },
  spark: { glass: '#E6957D', liquid: '#E07F66', cap: 'champagne' },
};

export function shade(hex, amt) {
  const n = parseInt(hex.replace('#', ''), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  r = Math.round((t - r) * p + r);
  g = Math.round((t - g) * p + g);
  b = Math.round((t - b) * p + b);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function luminance(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}

const SHAPES = {
  sovereign: {
    body: 'M64,112 L136,112 L152,128 L152,290 Q152,302 140,302 L60,302 Q48,302 48,290 L48,128 Z',
    liquidY: 150,
    baseY: 268,
    neck: { x: 88, y: 98, w: 24, h: 16 },
    highlight: { x: 58, y: 128, w: 9, h: 136 },
    engraveY: 214,
    collar: <rect x="82" y="90" width="36" height="12" rx="1" />,
    cap: (
      <>
        <path d="M77,90 L77,42 L88,24 L112,24 L123,42 L123,90 Z" />
      </>
    ),
    capFacets: (
      <>
        <path d="M88,24 L91,42 L91,90 M112,24 L109,42 L109,90 M77,42 L123,42" fill="none" />
        <rect x="77" y="78" width="46" height="3" />
      </>
    ),
    glassDetail: (
      <>
        <path d="M64,112 L56,128 L56,286 M136,112 L144,128 L144,286" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth=".8" />
        <path d="M48,128 L152,128" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth=".8" />
      </>
    ),
  },
  romantic: {
    body: 'M84,126 C84,146 40,170 40,224 C40,272 68,302 100,302 C132,302 160,272 160,224 C160,170 116,146 116,126 Z',
    liquidY: 172,
    baseY: 286,
    neck: { x: 89, y: 110, w: 22, h: 18 },
    highlight: { x: 54, y: 178, w: 9, h: 90 },
    engraveY: 238,
    collar: <rect x="84" y="102" width="32" height="10" rx="3" />,
    cap: (
      <>
        <path d="M100,28 C121,38 128,62 119,82 C114,93 108,100 100,103 C92,100 86,93 81,82 C72,62 79,38 100,28 Z" />
      </>
    ),
    capFacets: (
      <>
        <path d="M100,28 C93,48 92,80 100,103 M100,28 C108,50 110,80 100,103 M84,56 C94,64 106,64 116,56" fill="none" />
      </>
    ),
    glassDetail: (
      <>
        <path d="M70,168 C58,196 56,250 76,286" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth=".8" />
        <path d="M130,168 C142,196 144,250 124,286" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth=".8" />
      </>
    ),
  },
  conqueror: {
    body: 'M52,124 L148,124 L164,176 L140,302 L60,302 L36,176 Z',
    liquidY: 148,
    baseY: 288,
    neck: { x: 89, y: 110, w: 22, h: 16 },
    highlight: { x: 50, y: 178, w: 8, h: 100 },
    engraveY: 232,
    collar: <path d="M82,102 L118,102 L114,114 L86,114 Z" />,
    cap: (
      <>
        <path d="M84,102 L116,102 L110,44 L100,22 L90,44 Z" />
      </>
    ),
    capFacets: (
      <>
        <path d="M100,22 L100,102 M90,44 L110,44" fill="none" />
      </>
    ),
    glassDetail: (
      <>
        <path d="M36,176 L164,176" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth=".9" />
        <path d="M52,124 L76,176 L100,124 L124,176 L148,124" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth=".8" />
        <path d="M76,176 L100,302 L124,176" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth=".8" />
        <path d="M76,176 L100,124 L124,176 Z" fill="#fff" fillOpacity=".07" />
        <path d="M36,176 L60,302 L76,176 Z" fill="#000" fillOpacity=".08" />
      </>
    ),
    goldDetail: <path d="M44,176 L156,176" fill="none" strokeWidth="1.1" />,
  },
  artist: {
    body: 'M86,130 C62,132 36,164 36,214 C36,266 66,302 108,300 C148,298 166,262 164,218 C162,170 140,134 114,130 Z',
    liquidY: 168,
    baseY: 284,
    neck: { x: 90, y: 114, w: 22, h: 18 },
    highlight: { x: 50, y: 172, w: 9, h: 92 },
    engraveY: 226,
    collar: <rect x="86" y="107" width="30" height="8" rx="4" />,
    cap: (
      <>
        <path d="M97,108 C80,106 74,86 82,66 C90,48 106,36 119,43 C132,50 130,72 124,88 C119,100 112,110 97,108 Z" />
      </>
    ),
    capFacets: (
      <>
        <path d="M90,98 C88,80 96,60 114,48" fill="none" />
      </>
    ),
    glassDetail: null,
    goldDetail: (
      <>
        <path d="M62,282 C72,250 88,238 96,206 C101,186 112,174 124,166" fill="none" strokeWidth="1" />
        <ellipse cx="84" cy="246" rx="7" ry="3" transform="rotate(-40 84 246)" />
        <ellipse cx="99" cy="214" rx="6.5" ry="2.6" transform="rotate(30 99 214)" />
        <ellipse cx="110" cy="182" rx="6" ry="2.4" transform="rotate(-35 110 182)" />
      </>
    ),
  },
  spark: {
    body: 'M90,146 A76,76 0 1 0 110,146 Z',
    liquidY: 176,
    baseY: 288,
    neck: { x: 90, y: 130, w: 20, h: 18 },
    highlight: { x: 44, y: 184, w: 9, h: 74 },
    engraveY: 236,
    collar: <rect x="84" y="122" width="32" height="10" rx="2" />,
    cap: (
      <>
        <path d="M70,124 C70,82 130,82 130,124 Z" />
        <path d="M100,62 C108,70 108,82 100,86 C92,82 92,70 100,62 Z" />
      </>
    ),
    capFacets: (
      <>
        <path d="M78,124 C80,98 120,98 122,124" fill="none" />
      </>
    ),
    glassDetail: (
      <>
        <path d="M58,176 C90,204 70,262 102,296" fill="none" stroke="#fff" strokeOpacity=".32" strokeWidth=".9" />
        <path d="M82,152 C120,190 96,252 136,290" fill="none" stroke="#fff" strokeOpacity=".24" strokeWidth=".9" />
        <path d="M120,150 C152,184 142,236 172,246" fill="none" stroke="#000" strokeOpacity=".08" strokeWidth=".9" />
      </>
    ),
  },
};

export const SILHOUETTES = Object.keys(SHAPES);

function initials(text) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .join('.')
    .concat(text.trim() ? '.' : '');
}

export default function Bottle({
  shape = 'sovereign',
  glass,
  liquid,
  cap,
  engraving,
  engravingStyle = 'serif',
  label,
  shadow = true,
  className,
  title,
}) {
  const s = SHAPES[shape] || SHAPES.sovereign;
  const d = BOTTLE_DEFAULTS[shape] || BOTTLE_DEFAULTS.sovereign;
  const g = glass || d.glass;
  const l = liquid || d.liquid;
  const capColors = CAP_SETS[cap || d.cap] || CAP_SETS.antique;
  const uidRaw = useId();
  const id = `b${uidRaw.replace(/[^a-zA-Z0-9]/g, '')}`;
  const dark = luminance(g) < 0.55;
  const gold = CAP_SETS.antique;

  let engraveText = (engraving || '').trim();
  if (engraveText && engravingStyle === 'initials') engraveText = initials(engraveText);
  const engraveFont =
    engravingStyle === 'italic'
      ? { fontStyle: 'italic', letterSpacing: '0.04em', fontSize: engraveText.length > 12 ? 11 : 14 }
      : { letterSpacing: '0.22em', fontSize: engraveText.length > 12 ? 8.5 : 10.5, textTransform: 'uppercase' };

  return (
    <svg className={className} viewBox="0 0 200 320" role="img" aria-label={title || `${shape} bottle`}>
      <defs>
        <linearGradient id={`${id}g`} x1="0" x2="1">
          <stop offset="0" stopColor={shade(g, -0.28)} stopOpacity=".95" />
          <stop offset=".16" stopColor={shade(g, 0.1)} stopOpacity=".62" />
          <stop offset=".5" stopColor={shade(g, 0.35)} stopOpacity=".42" />
          <stop offset=".84" stopColor={shade(g, 0.05)} stopOpacity=".66" />
          <stop offset="1" stopColor={shade(g, -0.32)} stopOpacity=".96" />
        </linearGradient>
        <linearGradient id={`${id}l`} x1="0" x2="1">
          <stop offset="0" stopColor={shade(l, -0.25)} />
          <stop offset=".35" stopColor={shade(l, 0.12)} />
          <stop offset=".7" stopColor={l} />
          <stop offset="1" stopColor={shade(l, -0.3)} />
        </linearGradient>
        <linearGradient id={`${id}base`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".12" stopColor={shade(g, 0.25)} stopOpacity=".55" />
          <stop offset="1" stopColor={shade(g, -0.2)} stopOpacity=".85" />
        </linearGradient>
        <linearGradient id={`${id}c`} x1="0" x2="1">
          <stop offset="0" stopColor={capColors[0]} />
          <stop offset=".28" stopColor={capColors[1]} />
          <stop offset=".52" stopColor={capColors[2]} />
          <stop offset=".74" stopColor={capColors[1]} />
          <stop offset="1" stopColor={capColors[0]} />
        </linearGradient>
        <linearGradient id={`${id}gold`} x1="0" x2="1">
          <stop offset="0" stopColor={gold[0]} />
          <stop offset=".4" stopColor={gold[1]} />
          <stop offset="1" stopColor={gold[0]} />
        </linearGradient>
        <linearGradient id={`${id}hl`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".25" stopColor="#fff" stopOpacity=".85" />
          <stop offset=".8" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}clip`}>
          <path d={s.body} />
        </clipPath>
        <filter id={`${id}blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <filter id={`${id}shadow`} x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {shadow && (
        <>
          <ellipse cx="100" cy="305" rx="66" ry="6" fill="#3b332d" opacity=".28" filter={`url(#${id}shadow)`} />
          <ellipse cx="100" cy="303" rx="40" ry="2.5" fill="#3b332d" opacity=".25" filter={`url(#${id}blur)`} />
        </>
      )}

      {/* neck */}
      <rect x={s.neck.x} y={s.neck.y} width={s.neck.w} height={s.neck.h} fill={`url(#${id}g)`} stroke={shade(g, -0.4)} strokeOpacity=".35" strokeWidth=".8" />

      {/* body glass */}
      <path d={s.body} fill={`url(#${id}g)`} />
      <g clipPath={`url(#${id}clip)`}>
        <rect x="0" y={s.liquidY} width="200" height="200" fill={`url(#${id}l)`} opacity={dark ? 0.82 : 0.62} />
        <rect x="0" y={s.liquidY - 1.5} width="200" height="3" fill="#fff" opacity=".35" />
        <rect x="0" y={s.baseY} width="200" height="60" fill={`url(#${id}base)`} />
        {s.glassDetail}
        <rect x={s.highlight.x} y={s.highlight.y} width={s.highlight.w} height={s.highlight.h} rx="4" fill={`url(#${id}hl)`} filter={`url(#${id}blur)`} opacity=".9" />
        <rect x={200 - s.highlight.x - 4} y={s.highlight.y + 10} width="2.5" height={s.highlight.h * 0.8} rx="1" fill="#fff" opacity=".35" />
      </g>
      <path d={s.body} fill="none" stroke={shade(g, -0.45)} strokeOpacity={dark ? 0.6 : 0.4} strokeWidth="1.1" />
      <path d={s.body} fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth=".6" transform="translate(0.6 0.4)" />

      {s.goldDetail && (
        <g clipPath={`url(#${id}clip)`} fill={`url(#${id}gold)`} stroke={`url(#${id}gold)`} opacity=".9">
          {s.goldDetail}
        </g>
      )}

      {engraveText && (
        <text
          x="100"
          y={s.engraveY}
          textAnchor="middle"
          fontFamily="Cormorant Garamond, Georgia, serif"
          fill={dark ? '#F3E7D2' : '#4A3F37'}
          fillOpacity={dark ? 0.92 : 0.72}
          style={engraveFont}
        >
          {engraveText.slice(0, 22)}
        </text>
      )}
      {label && (
        <text x="100" y={s.engraveY + (engraveText ? 16 : 0)} textAnchor="middle" fontFamily="Manrope, Arial, sans-serif" fontSize="5.5" letterSpacing="0.3em" fill={dark ? '#F3E7D2' : '#4A3F37'} fillOpacity=".7">
          {label.toUpperCase().slice(0, 24)}
        </text>
      )}

      {/* collar + cap */}
      <g fill={`url(#${id}gold)`}>{s.collar}</g>
      <g fill={`url(#${id}c)`}>{s.cap}</g>
      <g stroke="#fff" strokeOpacity=".35" strokeWidth=".7" fill="#000" fillOpacity=".08">
        {s.capFacets}
      </g>
    </svg>
  );
}
