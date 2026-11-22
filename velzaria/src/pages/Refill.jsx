import { Link } from 'react-router-dom';
import { products } from '../data/products.js';
import { useStore } from '../context/StoreContext.jsx';
import { PageHeader, ProductPhoto, Frame, Reveal } from '../components/ui.jsx';
import { productLine } from '../components/ProductCard.jsx';
import { money } from '../lib/format.js';

export default function Refill() {
  const { addToCart } = useStore();
  return (
    <>
      <PageHeader eyebrow="The Refill Programme" title={<>Keep the bottle. <em>Renew the essence.</em></>} intro="Our bottles are made of heavy glass designed to last a lifetime. Every 100 ml bottle can be refilled — at 25% less than a new one." />
      <section className="section--tight">
        <div className="container feature-split">
          <Reveal img>
            <Frame tone="mat" className="frame--tall" caption="N° 04 The Artist — every 100 ml bottle can be refilled"><ProductPhoto product={products[3]} kind="tight" /></Frame>
          </Reveal>
          <Reveal>
            <div className="feature-list">
              {[
                ['Order a refill', 'Choose “Refill 100 ml” on any perfume page. It arrives in a recyclable aluminium pouch with a funnel.'],
                ['Refill at home', 'Unscrew the collar of your 100 ml bottle with the included key, pour, and close. It takes a minute.'],
                ['Or in our atelier', 'Bring your bottle to a VÉLZARIA counter and we will refill and polish it for you.'],
                ['Return the pouch', 'Send empty pouches back with your next delivery courier — we recycle every one.'],
              ].map(([t, d], i) => (
                <div key={t}>
                  <span className="numeral">0{i + 1}</span>
                  <div>
                    <h3>{t}</h3>
                    <p>{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
      <section className="section bg-champagne">
        <div className="container">
          <h2 className="h2" style={{ marginBottom: 32 }}>
            Refill your essence
          </h2>
          <div className="refill-list">
            {products.map((p) => (
              <div key={p.id} className="refill-row">
                <span className="dot" style={{ background: p.palette.liquid, width: 14, height: 14 }} />
                <Link to={`/perfume/${p.slug}`} className="refill-row__name">
                  {p.name}
                </Link>
                <span className="muted small">
                  <s>{money(p.sizes[2].price)}</s> {money(p.refillPrice)}
                </span>
                <button className="btn btn--sm" onClick={() => addToCart(productLine(p, 'refill'))}>
                  Add refill
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
