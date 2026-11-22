import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Bottle from './Bottle.jsx';
import { getProduct } from '../data/products.js';
import { IMAGES } from '../data/images.js';
import { cls } from '../lib/format.js';

/* ---------- Logo ---------- */
export function Logo({ className, light }) {
  return (
    <Link to="/" className={cls('logo', light && 'logo--light', className)} aria-label="VÉLZARIA — home">
      <span className="logo__word">VÉLZARIA</span>
    </Link>
  );
}

/* ---------- Reveal on scroll ---------- */
export function Reveal({ as: Tag = 'div', delay = 0, img = false, className, children, ...rest }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={cls(img ? 'reveal-img' : 'reveal', inView && 'is-in', className)} style={{ '--d': `${delay}ms`, ...(rest.style || {}) }} {...rest}>
      {children}
    </Tag>
  );
}

/* ---------- Photography ----------
 * Images are always shown at their natural aspect ratio (width/height come
 * from src/data/images.js), so a bottle can never be cropped or stretched.
 */
const PHOTO_FOR_VIEW = { stage: 'bottle', bottle: 'bottle', tight: 'tight', detail: 'tight', mood: 'collection', packaging: 'collection', collection: 'collection' };
const PHOTO_ALT = {
  bottle: (p) => `${p.name} perfume bottle on a marble pedestal, studio photograph`,
  tight: (p) => `${p.name} perfume bottle photographed among flowers`,
  collection: (p) => `${p.name} photographed with its sister essences`,
};

/** Any image from the manifest, at its natural ratio. */
export function Photo({ image, alt, className, eager, sizes }) {
  if (!image) return null;
  return (
    <img
      className={cls('photo', className)}
      src={image.src}
      width={image.w}
      height={image.h}
      alt={alt}
      sizes={sizes}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}

/** Real product photo for a catalogue perfume. */
export function ProductPhoto({ product, kind = 'bottle', className, eager }) {
  const image = product.photos?.[kind];
  if (!image) return <Bottle shape={product.id} title={product.name} />;
  return <Photo image={image} alt={PHOTO_ALT[kind](product)} className={className} eager={eager} />;
}

/**
 * A framed photograph. `fit` keeps the frame at a fixed ratio and fits the
 * whole image inside it on a soft mat (used where views of different ratios
 * share one slot, e.g. the product gallery); otherwise the frame follows the image.
 */
export function Frame({ children, ratio, tone = 'mat', className, caption }) {
  return (
    <figure className={cls('frame', `frame--${tone}`, ratio && 'frame--fit', className)} style={ratio ? { aspectRatio: ratio } : undefined}>
      {children}
      {caption && <figcaption className="caption">{caption}</figcaption>}
    </figure>
  );
}

/**
 * A customer's bespoke creation: the photographed bottle shape it is based on,
 * with a swatch showing the chosen glass tint.
 */
export function BespokePhoto({ creation, className }) {
  const base = getProduct(creation.silhouette);
  return (
    <span className={cls('bespoke-photo', className)}>
      {base && <ProductPhoto product={base} kind="bottle" />}
      <span className="bespoke-photo__tint" style={{ background: `linear-gradient(135deg, ${creation.glass}, ${creation.liquid})` }} title={`${creation.tint} glass`} />
    </span>
  );
}

export function ProductVisual({ product, view = 'stage', className, plinth = true, engraving, eager, children }) {
  const kind = PHOTO_FOR_VIEW[view] || 'bottle';
  const style = { '--stage': product.palette.stage, '--stage-deep': product.palette.stageDeep, '--ink': product.palette.ink };
  if (product.photos?.[kind]) {
    const img = product.photos[kind];
    return (
      <div className={cls('stage stage--photo', `stage--photo-${kind}`, className)} style={{ ...style, aspectRatio: `${img.w} / ${img.h}` }}>
        <ProductPhoto product={product} kind={kind} eager={eager} />
        {engraving && kind === 'bottle' && (
          <span className="stage__engraving" aria-label={`Engraving preview: ${engraving}`}>
            {engraving}
          </span>
        )}
        {children}
      </div>
    );
  }
  return (
    <div className={cls('stage', `stage--${view}`, `stage--${product.id}`, className)} style={style}>
      {view === 'mood' && <span className="stage__word" aria-hidden="true">{product.short}</span>}
      {view === 'packaging' && <PackagingBox product={product} />}
      <div className="stage__bottle">
        <Bottle shape={product.id} title={`${product.name} perfume bottle`} engraving={engraving} />
      </div>
      {plinth && view === 'stage' && <span className="stage__plinth" aria-hidden="true" />}
      {children}
    </div>
  );
}

function PackagingBox({ product }) {
  return (
    <div className="stage__box" aria-hidden="true">
      <span className="stage__box-logo">VÉLZARIA</span>
      <span className="stage__box-name">{product.name}</span>
      <span className="stage__box-num">N° {product.number}</span>
    </div>
  );
}

/* ---------- Stars ---------- */
export function Stars({ value = 5, size = 12 }) {
  return (
    <span className="stars" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3.5l2.6 5.5 6 .7-4.4 4.1 1.2 5.9L12 16.8 6.6 19.7l1.2-5.9L3.4 9.7l6-.7Z" fill={i <= Math.round(value) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1" />
        </svg>
      ))}
    </span>
  );
}

/* ---------- Quantity ---------- */
export function Quantity({ value, onChange, min = 1, max = 10, label = 'Quantity' }) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Decrease quantity">
        −
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}

/* ---------- Page header ---------- */
export function PageHeader({ eyebrow, title, intro, children, align = 'left' }) {
  return (
    <header className={cls('page-header', `page-header--${align}`)}>
      <div className="container">
        {eyebrow && <p className="eyebrow eyebrow--gold">{eyebrow}</p>}
        <h1 className="h1">{title}</h1>
        {intro && <p className="lead">{intro}</p>}
        {children}
      </div>
    </header>
  );
}

/* ---------- Discovery Set visual ----------
 * No photograph of the set itself exists yet, so it is represented by a
 * photograph of the five essences. Pass `image` to choose the composition.
 * When the real set is photographed, add it to src/data/images.js and pass it here.
 */
export function DiscoveryCase({ image = IMAGES.campaign.hero, className, eager }) {
  return (
    <span className={cls('dcase-photo', className)}>
      <Photo image={image} alt="The five VÉLZARIA essences included in the Discovery Set" eager={eager} />
    </span>
  );
}

/* ---------- Note swatch (ingredient colour) ---------- */
export function NoteSwatch({ color, image }) {
  if (image) return <img className="swatch swatch--img" src={image} alt="" loading="lazy" />;
  return <span className="swatch" style={{ '--c': color }} aria-hidden="true" />;
}


/* ---------- Prototype notice ---------- */
export function ProtoNote({ children }) {
  return (
    <p className="notice">
      <strong>Prototype · </strong>
      {children}
    </p>
  );
}
