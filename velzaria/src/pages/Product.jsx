import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { products, getProduct, getSize, ENGRAVING_PRICE, GIFT_WRAP_PRICE } from '../data/products.js';
import { reviewsFor } from '../data/reviews.js';
import { useStore } from '../context/StoreContext.jsx';
import ProductCard, { productLine } from '../components/ProductCard.jsx';
import { ProductPhoto, Frame, Quantity, Reveal, Stars } from '../components/ui.jsx';
import { IconHeart, IconArrow } from '../components/Icons.jsx';
import { money, cls, SHIPPING } from '../lib/format.js';
import NotFound from './NotFound.jsx';

const VIEWS = [
  { id: 'bottle', label: 'Studio' },
  { id: 'tight', label: 'In its setting' },
  { id: 'collection', label: 'With her sisters' },
];

export default function Product() {
  const { slug } = useParams();
  const product = getProduct(slug);
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const [view, setView] = useState('bottle');
  const [ml, setMl] = useState(50);
  const [qty, setQty] = useState(1);
  const [engrave, setEngrave] = useState(false);
  const [engraving, setEngraving] = useState('');
  const [gift, setGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  useEffect(() => {
    setView('bottle');
    setMl(50);
    setQty(1);
    setEngrave(false);
    setEngraving('');
    setGift(false);
    setGiftMessage('');
    if (product) document.title = `${product.name} — ${product.direction} | VÉLZARIA`;
  }, [slug]);

  if (!product) return <NotFound />;

  const size = getSize(product, ml);
  const canEngrave = ml === 50 || ml === 100;
  const unit = size.price + (engrave && canEngrave && engraving.trim() ? ENGRAVING_PRICE : 0) + (gift ? GIFT_WRAP_PRICE : 0);
  const saved = wishlist.includes(product.id);
  const reviews = reviewsFor(product.id);
  const related = products.filter((p) => p.id !== product.id);

  function add() {
    const options = {};
    if (engrave && canEngrave && engraving.trim()) options.engraving = engraving.trim();
    if (gift) {
      options.giftWrap = true;
      if (giftMessage.trim()) options.giftMessage = giftMessage.trim();
    }
    addToCart({ ...productLine(product, ml, options), qty });
  }

  return (
    <>
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span aria-current="page">{product.name}</span>
        </nav>

        <section className="pdp">
          <div className="gallery">
            <div className="gallery__thumbs" role="tablist" aria-label="Product images">
              {VIEWS.map((v) => (
                <button key={v.id} role="tab" aria-selected={view === v.id} aria-label={v.label} className={cls('gallery__thumb', view === v.id && 'is-active')} onClick={() => setView(v.id)}>
                  <Frame ratio="4 / 5">
                    <ProductPhoto product={product} kind={v.id} />
                  </Frame>
                  <span className="gallery__thumb-label">{v.label}</span>
                </button>
              ))}
            </div>
            <div className="gallery__main" key={view}>
              <Frame ratio="4 / 5" tone={view === 'bottle' ? 'bare' : 'mat'}>
                <ProductPhoto product={product} kind={view} eager />
                {view === 'bottle' && engrave && canEngrave && engraving.trim() && (
                  <span className="stage__engraving" aria-label={`Engraving preview: ${engraving}`}>
                    {engraving}
                  </span>
                )}
              </Frame>
            </div>
          </div>

          <div className="pdp__info">
            <span className="numeral pdp__num">N° {product.number}</span>
            <h1 className="pdp__title">{product.name}</h1>
            <p className="pdp__persona">{product.personality}</p>
            <div className="pdp__rating">
              <Stars value={product.rating} />
              <span>{product.rating}</span>
              <a href="#reviews">{product.reviewCount} reviews</a>
            </div>
            <p className="pdp__summary">{product.summary}</p>

            <div className="pdp__family">
              <span className="label">Fragrance family</span>
              <strong>{product.direction}</strong>
            </div>

            <div className="pdp__group">
              <span className="label">Size</span>
              <div className="sizes" role="radiogroup" aria-label="Size">
                {product.sizes.map((s) => (
                  <button key={s.ml} role="radio" aria-checked={ml === s.ml} className={cls('size', ml === s.ml && 'is-active')} onClick={() => setMl(s.ml)}>
                    <span>{s.ml} ml</span>
                    <small>{money(s.price)}</small>
                  </button>
                ))}
                <button role="radio" aria-checked={ml === 'refill'} className={cls('size', ml === 'refill' && 'is-active')} onClick={() => setMl('refill')}>
                  <span>Refill 100 ml</span>
                  <small>{money(product.refillPrice)}</small>
                </button>
              </div>
              {ml === 'refill' && (
                <p className="extra__note">
                  A refill pouch for your existing 100 ml bottle — <Link to="/refill" className="link-inline">how refills work</Link>.
                </p>
              )}
            </div>

            <div className="pdp__price" aria-live="polite">
              {money(unit * qty)}
              {qty > 1 && <span className="tiny muted"> · {money(unit)} each</span>}
            </div>

            <div className="pdp__extras">
              <div className="extra">
                <label className="check">
                  <input type="checkbox" checked={engrave && canEngrave} disabled={!canEngrave} onChange={(e) => setEngrave(e.target.checked)} />
                  <span>
                    Personalised engraving <span className="muted">+ {money(ENGRAVING_PRICE)}</span>
                    {!canEngrave && <span className="extra__note"> — available on 50 ml and 100 ml bottles</span>}
                  </span>
                </label>
                {engrave && canEngrave && (
                  <div className="extra__body">
                    <label className="sr-only" htmlFor="engr">
                      Engraving text
                    </label>
                    <input id="engr" className="input" maxLength={16} placeholder="A name or initials (max 16)" value={engraving} onChange={(e) => setEngraving(e.target.value)} />
                    <p className="extra__note">Previewed on the bottle. Engraved pieces are made to order and ship within 3–4 business days.</p>
                  </div>
                )}
              </div>
              <div className="extra">
                <label className="check">
                  <input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} />
                  <span>
                    Make it a gift <span className="muted">+ {money(GIFT_WRAP_PRICE)}</span>
                  </span>
                </label>
                {gift && (
                  <div className="extra__body">
                    <label className="sr-only" htmlFor="gmsg">
                      Gift message
                    </label>
                    <textarea id="gmsg" className="textarea" maxLength={200} rows={3} placeholder="Your message, handwritten on our card (optional)" value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} />
                    <p className="extra__note">Signature ivory box, silk ribbon and a handwritten card. Prices are never included in gift parcels.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pdp__buy">
              <Quantity value={qty} onChange={setQty} />
              <button className="btn" onClick={add}>
                Add to bag
              </button>
            </div>
            <button className="btn btn--ghost pdp__wish" onClick={() => toggleWishlist(product.id)} aria-pressed={saved}>
              <IconHeart filled={saved} width="16" height="16" /> {saved ? 'Saved to wishlist' : 'Add to wishlist'}
            </button>

            <div className="pdp__ship">
              <details open>
                <summary>Shipping</summary>
                <p>
                  Complimentary shipping on orders over {money(SHIPPING.freeOver)}. Otherwise from {money(SHIPPING.zones[0].fee)} — Cairo & Giza in 1–2 business days, the rest of
                  Egypt in 2–5. <Link to="/info/shipping-returns" className="link-inline">Shipping & returns</Link>
                </p>
              </details>
              <details>
                <summary>The bottle</summary>
                <p>{product.bottle}</p>
              </details>
              <details>
                <summary>Returns</summary>
                <p>Unopened bottles can be returned within 14 days. Engraved and bespoke pieces are made for you and cannot be returned unless faulty.</p>
              </details>
              <details>
                <summary>Ingredients & wear</summary>
                <p>
                  Eau de Parfum. Intensity: {product.intensity}. Apply to pulse points; avoid rubbing. A full ingredient list (INCI) is printed on every box and is available
                  from our <Link to="/info/support" className="link-inline">customer care team</Link>.
                </p>
              </details>
            </div>
          </div>
        </section>
      </div>

      {/* Who is she */}
      <section className="section who-band">
        <div className="container who">
          <Reveal className="who__aside">
            <span className="who__num">{product.number}</span>
            <p className="who__archetype">{product.archetype}</p>
            <p className="who__persona">{product.personality}</p>
          </Reveal>
          <Reveal className="who__text">
            <p className="eyebrow eyebrow--gold">The woman behind N° {product.number}</p>
            <h2 className="who__title">Who Is She?</h2>
            {product.whoIsShe.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
            <div className="who__traits">
              {product.traits.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <p className="who__moments">
              <span className="label">Her moments · </span>
              {product.moments}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Notes */}
      <section className="section">
        <div className="container">
          <Reveal>
            <p className="eyebrow eyebrow--gold">The Composition</p>
            <h2 className="h2" style={{ margin: '12px 0 48px' }}>
              {product.direction}
            </h2>
          </Reveal>
          <div className="pyramid">
            {[
              ['Top Notes', 'top', 'The first impression · 0–30 minutes'],
              ['Heart Notes', 'heart', 'Her character · 30 minutes – 4 hours'],
              ['Base Notes', 'base', 'What stays · 4 hours and beyond'],
            ].map(([title, key, hint], i) => (
              <Reveal key={key} delay={i * 120} className="pyramid__tier">
                <span className="numeral">0{i + 1}</span>
                <h3>{title}</h3>
                <span className="tiny muted">{hint}</span>
                <ul>
                  {product.notes[key].map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="section bg-champagne" id="reviews">
        <div className="container">
          <div className="pdp-reviews__head">
            <div>
              <p className="eyebrow eyebrow--gold">Customer Reviews</p>
              <h2 className="h2" style={{ marginTop: 12 }}>
                Worn and loved
              </h2>
            </div>
            <div className="pdp-reviews__score">
              <strong>{product.rating}</strong>
              <div>
                <Stars value={product.rating} size={14} />
                <div className="tiny muted">Based on {product.reviewCount} reviews</div>
              </div>
            </div>
          </div>
          <div className="pdp-reviews__grid">
            {reviews.map((r, i) => (
              <Reveal key={r.id} delay={i * 100} className="review">
                <Stars value={r.rating} />
                <h3 className="review__title">{r.title}</h3>
                <p>{r.body}</p>
                <footer>
                  <strong>{r.name}</strong> · {r.city}
                </footer>
              </Reveal>
            ))}
          </div>
          <ReviewForm product={product} />
        </div>
      </section>

      {/* Related */}
      <section className="section">
        <div className="container">
          <div className="best__head">
            <div>
              <p className="eyebrow eyebrow--gold">The Other Essences</p>
              <h2 className="h2" style={{ marginTop: 12 }}>
                Her sisters
              </h2>
            </div>
            <Link to="/shop" className="link">
              Shop all <IconArrow />
            </Link>
          </div>
          <div className="related__grid">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProductCard product={p} showRating={false} className="pcard--compact" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ReviewForm({ product }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [form, setForm] = useState({ name: '', title: '', body: '' });
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || form.body.trim().length < 20) {
      setError('Please add your name and a review of at least 20 characters.');
      return;
    }
    try {
      // Integration point: POST /reviews (moderated before publishing).
      const pending = JSON.parse(localStorage.getItem('vz_reviews_pending') || '[]');
      pending.push({ product: product.id, rating, ...form, createdAt: new Date().toISOString() });
      localStorage.setItem('vz_reviews_pending', JSON.stringify(pending));
    } catch {
      /* ignore storage errors */
    }
    setDone(true);
  }

  if (done)
    return (
      <div className="review-form">
        <p className="serif-lead">Thank you. Your review has been received and will appear once our team has checked it.</p>
      </div>
    );

  return (
    <div className="review-form">
      {!open ? (
        <button className="btn btn--ghost" onClick={() => setOpen(true)}>
          Write a review
        </button>
      ) : (
        <form onSubmit={submit} className="stack" style={{ '--stack': '18px' }} noValidate>
          <div className="field">
            <span className="label">Your rating</span>
            <div className="rating-input" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((i) => (
                <button type="button" key={i} role="radio" aria-checked={rating === i} aria-label={`${i} stars`} onClick={() => setRating(i)}>
                  {i <= rating ? '★' : '☆'}
                </button>
              ))}
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="rv-name">Name</label>
              <input id="rv-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="rv-title">Title</label>
              <input id="rv-title" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="field full">
              <label htmlFor="rv-body">Your review</label>
              <textarea id="rv-body" className="textarea" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </div>
          </div>
          {error && <p className="field-error">{error}</p>}
          <button className="btn" type="submit">
            Submit review
          </button>
        </form>
      )}
    </div>
  );
}
