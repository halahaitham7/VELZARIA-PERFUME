import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore, lineUnitPrice } from '../context/StoreContext.jsx';
import { products, getProduct, getSize, discoverySet } from '../data/products.js';
import { ALL_NOTES } from '../data/quiz.js';
import { money, cls, shippingFor, SHIPPING } from '../lib/format.js';
import { ProductPhoto, BespokePhoto, Quantity, DiscoveryCase } from './ui.jsx';
import { productLine } from './ProductCard.jsx';
import { IconClose, IconSearch, IconArrow } from './Icons.jsx';

function useEscape(open, onClose) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
}

/* ================= Cart line (shared by drawer & cart page) ================= */
export function LineThumb({ line }) {
  if (line.type === 'discovery') {
    return (
      <div className="thumb thumb--discovery">
        <DiscoveryCase />
      </div>
    );
  }
  if (line.type === 'bespoke') {
    return (
      <div className="thumb thumb--photo">
        <BespokePhoto creation={line.creation} />
      </div>
    );
  }
  const p = getProduct(line.productId);
  return (
    <div className="thumb thumb--photo">
      <ProductPhoto product={p} />
    </div>
  );
}

export function LineDetails({ line }) {
  return (
    <ul className="line__opts">
      {line.sizeLabel && <li>{line.sizeLabel}</li>}
      {line.type === 'bespoke' && <li>“{line.creation.perfumeName}” · composed by {line.creation.creatorName}</li>}
      {line.options?.engraving && <li>Engraving: “{line.options.engraving}”</li>}
      {line.options?.giftWrap && <li>Gift wrapped{line.options.giftMessage ? ` · card: “${line.options.giftMessage}”` : ''}</li>}
    </ul>
  );
}

export function CartLine({ line, compact }) {
  const { updateQty, removeLine } = useStore();
  const p = line.type === 'product' ? getProduct(line.productId) : null;
  const href = p ? `/perfume/${p.slug}` : line.type === 'discovery' ? '/shop/discovery-set' : '/create';
  return (
    <div className={cls('line', compact && 'line--compact')}>
      <Link to={href} className="line__thumb">
        <LineThumb line={line} />
      </Link>
      <div className="line__info">
        <div className="line__head">
          <Link to={href} className="line__name">
            {line.name}
          </Link>
          <span className="line__price">{money(lineUnitPrice(line) * line.qty)}</span>
        </div>
        <LineDetails line={line} />
        <div className="line__actions">
          <Quantity value={line.qty} onChange={(q) => updateQty(line.key, q)} />
          <button className="line__remove" onClick={() => removeLine(line.key)}>
            Remove
          </button>
        </div>
        {!compact && <span className="tiny muted">{money(lineUnitPrice(line))} each</span>}
      </div>
    </div>
  );
}

/* ================= Cart drawer ================= */
export function CartDrawer() {
  const { cartOpen, setCartOpen, cart, subtotal } = useStore();
  const close = () => setCartOpen(false);
  useEscape(cartOpen, close);
  const toFree = SHIPPING.freeOver - subtotal;

  return (
    <div className={cls('drawer', cartOpen && 'is-open')} aria-hidden={!cartOpen}>
      <div className="drawer__backdrop" onClick={close} />
      <aside className="drawer__panel" role="dialog" aria-label="Shopping bag" aria-modal="true">
        <div className="drawer__head">
          <h2 className="h3">Your bag</h2>
          <button className="icon-btn" onClick={close} aria-label="Close bag">
            <IconClose />
          </button>
        </div>
        {cart.lines.length === 0 ? (
          <div className="drawer__empty">
            <p className="serif-lead">Your bag is waiting for its first essence.</p>
            <Link to="/shop" className="btn" onClick={close}>
              Discover the collection
            </Link>
          </div>
        ) : (
          <>
            <div className="drawer__ship">
              {toFree > 0 ? (
                <>
                  <span>{money(toFree)} away from complimentary shipping</span>
                  <span className="drawer__bar">
                    <i style={{ width: `${Math.min(100, (subtotal / SHIPPING.freeOver) * 100)}%` }} />
                  </span>
                </>
              ) : (
                <span>Your order ships complimentary.</span>
              )}
            </div>
            <div className="drawer__lines">
              {cart.lines.map((l) => (
                <CartLine key={l.key} line={l} compact />
              ))}
            </div>
            <div className="drawer__foot">
              <div className="drawer__total">
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </div>
              <p className="tiny muted">Shipping and discount codes are calculated at the next step.</p>
              <Link to="/checkout" className="btn btn--block" onClick={close}>
                Proceed to checkout
              </Link>
              <Link to="/cart" className="btn btn--ghost btn--block" onClick={close}>
                View full bag
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

/* ================= Quick view ================= */
export function QuickView() {
  const { quickView, setQuickView, addToCart, toggleWishlist, wishlist } = useStore();
  const product = quickView ? getProduct(quickView) : null;
  const [ml, setMl] = useState(50);
  const close = () => setQuickView(null);
  useEscape(!!product, close);
  useEffect(() => setMl(50), [quickView]);

  if (!product) return null;
  const size = getSize(product, ml);
  const saved = wishlist.includes(product.id);
  return (
    <div className="modal is-open">
      <div className="modal__backdrop" onClick={close} />
      <div className="modal__panel qv" role="dialog" aria-modal="true" aria-label={`Quick view: ${product.name}`}>
        <button className="icon-btn modal__close" onClick={close} aria-label="Close quick view">
          <IconClose />
        </button>
        <span className="qv__visual"><ProductPhoto product={product} eager /></span>
        <div className="qv__body">
          <span className="numeral">N° {product.number}</span>
          <h2 className="h2">{product.name}</h2>
          <p className="eyebrow eyebrow--gold">{product.direction}</p>
          <p className="qv__personality">{product.personality}</p>
          <dl className="notes-mini">
            <div>
              <dt>Top</dt>
              <dd>{product.notes.top.join(', ')}</dd>
            </div>
            <div>
              <dt>Heart</dt>
              <dd>{product.notes.heart.join(', ')}</dd>
            </div>
            <div>
              <dt>Base</dt>
              <dd>{product.notes.base.join(', ')}</dd>
            </div>
          </dl>
          <div className="sizes" role="radiogroup" aria-label="Size">
            {product.sizes.map((s) => (
              <button key={s.ml} role="radio" aria-checked={ml === s.ml} className={cls('size', ml === s.ml && 'is-active')} onClick={() => setMl(s.ml)}>
                <span>{s.ml} ml</span>
                <small>{money(s.price)}</small>
              </button>
            ))}
          </div>
          <div className="qv__actions">
            <button
              className="btn"
              onClick={() => {
                addToCart(productLine(product, ml));
                close();
              }}
            >
              Add to bag · {money(size.price)}
            </button>
            <button className="btn btn--ghost" onClick={() => toggleWishlist(product.id)} aria-pressed={saved}>
              {saved ? 'Saved' : 'Wishlist'}
            </button>
          </div>
          <Link to={`/perfume/${product.slug}`} className="link" onClick={close}>
            View full details
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ================= Search ================= */
export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useStore();
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const close = () => setSearchOpen(false);
  useEscape(searchOpen, close);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 80);
    else setQ('');
  }, [searchOpen]);

  const results = useMemo(() => searchCatalogue(q), [q]);

  function go(path) {
    close();
    navigate(path);
  }

  return (
    <div className={cls('search', searchOpen && 'is-open')} aria-hidden={!searchOpen}>
      <div className="search__backdrop" onClick={close} />
      <div className="search__panel" role="dialog" aria-modal="true" aria-label="Search">
        <div className="container">
          <form
            className="search__form"
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) go(`/shop?q=${encodeURIComponent(q.trim())}`);
            }}
          >
            <IconSearch width="22" height="22" />
            <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search perfumes, notes or personalities…" aria-label="Search" />
            <button type="button" className="icon-btn" onClick={close} aria-label="Close search">
              <IconClose />
            </button>
          </form>

          {!q.trim() ? (
            <div className="search__suggest">
              <span className="eyebrow">Popular searches</span>
              <div className="search__chips">
                {['Rose', 'Vanilla', 'Amber', 'Fresh', 'Woody', 'Confident', 'Gift'].map((s) => (
                  <button key={s} className="chip" onClick={() => setQ(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="search__results">
              <div>
                <span className="eyebrow">Perfumes ({results.products.length})</span>
                {results.products.length === 0 && <p className="muted small">No perfume matches “{q}”. Try a note such as rose or amber.</p>}
                <ul className="search__list">
                  {results.products.map(({ product, reason }) => (
                    <li key={product.id}>
                      <button onClick={() => go(`/perfume/${product.slug}`)}>
                        <span className="search__thumb search__thumb--photo">
                          <ProductPhoto product={product} />
                        </span>
                        <span>
                          <strong>{product.name}</strong>
                          <small>{reason}</small>
                        </span>
                        <IconArrow />
                      </button>
                    </li>
                  ))}
                  {results.discovery && (
                    <li>
                      <button onClick={() => go('/shop/discovery-set')}>
                        <span className="search__thumb" style={{ background: '#EAE4DA' }} />
                        <span>
                          <strong>{discoverySet.name}</strong>
                          <small>Five 2 ml samples · {money(discoverySet.price)}</small>
                        </span>
                        <IconArrow />
                      </button>
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <span className="eyebrow">Fragrance notes ({results.notes.length})</span>
                <div className="search__chips">
                  {results.notes.map((n) => (
                    <button key={n} className="chip" onClick={() => go(`/shop?q=${encodeURIComponent(n)}`)}>
                      {n}
                    </button>
                  ))}
                  {results.notes.length === 0 && <p className="muted small">No matching notes.</p>}
                </div>
                {results.pages.map((p) => (
                  <button key={p.to} className="link search__page" onClick={() => go(p.to)}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const PAGES = [
  { label: 'Create your own perfume', to: '/create', k: ['create', 'custom', 'bespoke', 'quiz', 'personal', 'own'] },
  { label: 'Creator’s Award', to: '/creators-award', k: ['award', 'competition', 'contest', 'creator'] },
  { label: 'Luxury gifting', to: '/gifting', k: ['gift', 'wrap', 'present'] },
  { label: 'Refill programme', to: '/refill', k: ['refill', 'sustain', 'eco'] },
  { label: 'Track an order', to: '/track', k: ['track', 'order', 'delivery'] },
  { label: 'Shipping & returns', to: '/info/shipping-returns', k: ['ship', 'return', 'delivery'] },
];

export function searchCatalogue(query) {
  const q = query.trim().toLowerCase();
  if (!q) return { products: [], notes: [], pages: [], discovery: false };
  const productsOut = [];
  products.forEach((p) => {
    const allNotes = [...p.notes.top, ...p.notes.heart, ...p.notes.base];
    const note = allNotes.find((n) => n.toLowerCase().includes(q));
    if (p.name.toLowerCase().includes(q) || p.short.toLowerCase().includes(q)) productsOut.push({ product: p, reason: p.direction });
    else if (note) productsOut.push({ product: p, reason: `Contains ${note}` });
    else if (p.families.some((f) => f.toLowerCase().includes(q)) || p.direction.toLowerCase().includes(q)) productsOut.push({ product: p, reason: p.direction });
    else if ([p.personality, p.summary, ...p.traits, p.archetype].join(' ').toLowerCase().includes(q)) productsOut.push({ product: p, reason: p.personality });
  });
  const noteSet = new Set();
  products.forEach((p) => [...p.notes.top, ...p.notes.heart, ...p.notes.base].forEach((n) => n.toLowerCase().includes(q) && noteSet.add(n)));
  ALL_NOTES.forEach((n) => n.label.toLowerCase().includes(q) && noteSet.add(n.label));
  return {
    products: productsOut,
    notes: [...noteSet].slice(0, 12),
    pages: PAGES.filter((p) => p.k.some((k) => k.includes(q) || q.includes(k))),
    discovery: ['discovery', 'sample', 'set', 'vial', 'trial'].some((k) => k.includes(q) || q.includes(k)),
  };
}

/* ================= Toasts ================= */
export function Toasts() {
  const { toasts, setCartOpen } = useStore();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span>{t.message}</span>
          {t.link && (
            <Link to={t.link} className="toast__link">
              {t.linkLabel || 'View'}
            </Link>
          )}
          {t.openCart && (
            <button className="toast__link" onClick={() => setCartOpen(true)}>
              View bag
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export { shippingFor };
