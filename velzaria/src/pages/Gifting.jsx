import { Link } from 'react-router-dom';
import { products, discoverySet, GIFT_WRAP_PRICE, ENGRAVING_PRICE, EDITORIAL } from '../data/products.js';
import { useStore } from '../context/StoreContext.jsx';
import { PageHeader, Photo, Frame, Reveal } from '../components/ui.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { money } from '../lib/format.js';

export default function Gifting() {
  const { addToCart } = useStore();
  return (
    <>
      <PageHeader eyebrow="Luxury Gifting" title={<>A gift that <em>already knows her.</em></>} intro="Choose the essence that matches her personality, and we will wrap it, engrave it and write your words by hand." />
      <section className="section--tight">
        <div className="container feature-split">
          <Reveal img>
            <Frame tone="bare" caption="The Romantic and The Conqueror — wrapped by hand in our atelier on request"><Photo image={EDITORIAL['duo-romantic-conqueror']} alt="The Romantic and The Conqueror perfume bottles" /></Frame>
          </Reveal>
          <Reveal>
            <div className="feature-list">
              {[
                ['Signature gift box', `Ivory box, silk ribbon and tissue — ${money(GIFT_WRAP_PRICE)} per item. Select “Make it a gift” on any perfume.`],
                ['Handwritten card', 'Your message, written by hand by our team. Prices are never included in gift parcels.'],
                ['Personalised engraving', `Her name or initials on 50 ml and 100 ml bottles — ${money(ENGRAVING_PRICE)}.`],
                ['Send it directly', 'Enter her address at checkout and add your gift note. Delivery across Egypt.'],
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
            <div className="hero__ctas">
              <Link to="/shop" className="btn">
                Choose a perfume
              </Link>
              <button
                className="btn btn--ghost"
                onClick={() =>
                  addToCart({ type: 'discovery', productId: discoverySet.id, name: discoverySet.name, size: '5x2', sizeLabel: '5 × 2 ml vials', basePrice: discoverySet.price, options: { giftWrap: true } })
                }
              >
                Gift the Discovery Set
              </button>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="section bg-champagne">
        <div className="container">
          <h2 className="h2" style={{ marginBottom: 40 }}>
            Which woman is she?
          </h2>
          <div className="gift-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} showRating={false} className="pcard--compact" />
            ))}
          </div>
          <p className="small muted" style={{ marginTop: 32 }}>
            Not sure? <Link to="/create" className="link-inline">Take our personality journey</Link> with her in mind.
          </p>
        </div>
      </section>
    </>
  );
}
