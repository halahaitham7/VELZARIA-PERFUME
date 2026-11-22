import { useState } from 'react';
import { Link } from 'react-router-dom';
import { products, discoverySet, GIFT_WRAP_PRICE } from '../data/products.js';
import { useStore } from '../context/StoreContext.jsx';
import { DiscoveryCase, Quantity, Reveal } from '../components/ui.jsx';
import { money } from '../lib/format.js';

export default function DiscoverySet() {
  const { addToCart } = useStore();
  const [qty, setQty] = useState(1);
  const [gift, setGift] = useState(false);

  function add() {
    addToCart({
      type: 'discovery',
      productId: discoverySet.id,
      name: discoverySet.name,
      size: '5x2',
      sizeLabel: '5 × 2 ml vials',
      basePrice: discoverySet.price,
      options: gift ? { giftWrap: true } : {},
      qty,
    });
  }

  return (
    <>
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span aria-current="page">Discovery Set</span>
        </nav>
        <section className="dsp">
          <div className="dsp__visual">
            <DiscoveryCase eager />
          </div>
          <div>
            <p className="eyebrow eyebrow--gold">Five essences · 5 × 2 ml</p>
            <h1 className="h1" style={{ margin: '12px 0 18px' }}>
              The Discovery Set
            </h1>
            <p className="lead">{discoverySet.summary}</p>
            <ul className="discovery__list">
              {products.map((p) => (
                <li key={p.id}>
                  <span className="dot" style={{ background: p.palette.liquid }} />
                  <Link to={`/perfume/${p.slug}`}>{p.name}</Link>
                  <small>{p.direction}</small>
                </li>
              ))}
            </ul>
            <div className="pdp__price">{money((discoverySet.price + (gift ? GIFT_WRAP_PRICE : 0)) * qty)}</div>
            <div className="extra" style={{ marginBottom: 18 }}>
              <label className="check">
                <input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} />
                <span>
                  Gift wrap with a handwritten card <span className="muted">+ {money(GIFT_WRAP_PRICE)}</span>
                </span>
              </label>
            </div>
            <div className="pdp__buy">
              <Quantity value={qty} onChange={setQty} />
              <button className="btn" onClick={add}>
                Add to bag
              </button>
            </div>
            <p className="tiny muted">
              Enjoy the set, then use code <strong>DISCOVERY</strong> on any order over EGP 4,000 to receive the full {money(discoverySet.credit)} back as credit.
            </p>
          </div>
        </section>
      </div>
      <section className="section bg-champagne">
        <div className="container">
          <Reveal>
            <p className="eyebrow eyebrow--gold">The Ritual</p>
            <h2 className="h2" style={{ margin: '12px 0 48px' }}>
              Five days. Five women. <em>One of them is you.</em>
            </h2>
          </Reveal>
          <div className="dsp__how">
            {[
              ['Wear one a day', 'Apply each essence in the morning and notice how it changes on your skin through the day — perfume is personal chemistry.'],
              ['Listen to your instinct', 'The right essence is the one you keep reaching for, and the one people ask you about.'],
              ['Choose your signature', 'Order your full bottle with code DISCOVERY and the full price of your set is credited back.'],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 120}>
                <span className="numeral">0{i + 1}</span>
                <h3>{t}</h3>
                <p className="muted">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
