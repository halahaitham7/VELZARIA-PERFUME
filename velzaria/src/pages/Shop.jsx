import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { products, FILTERS, priceFrom, discoverySet } from '../data/products.js';
import ProductCard from '../components/ProductCard.jsx';
import { PageHeader, Reveal, DiscoveryCase } from '../components/ui.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { money } from '../lib/format.js';

/** Fills the last row of the grid with the Discovery Set. */
function DiscoveryTile() {
  const { addToCart } = useStore();
  return (
    <Reveal className="shop-tile">
      <Link to="/shop/discovery-set" className="shop-tile__media" aria-label="The Discovery Set">
        <DiscoveryCase />
      </Link>
      <div className="shop-tile__body">
        <div className="pcard__meta">
          <span className="numeral">5 × 2 ml</span>
          <span className="eyebrow">All five essences</span>
        </div>
        <h3 className="pcard__name">
          <Link to="/shop/discovery-set">{discoverySet.name}</Link>
        </h3>
        <p className="pcard__desc">Wear each essence for a day before choosing your signature. Credited toward your first full bottle.</p>
        <div className="pcard__foot">
          <span className="pcard__price">{money(discoverySet.price)}</span>
          <button
            className="btn btn--sm"
            onClick={() => addToCart({ type: 'discovery', productId: discoverySet.id, name: discoverySet.name, size: '5x2', sizeLabel: '5 × 2 ml vials', basePrice: discoverySet.price, options: {} })}
          >
            Add to bag
          </button>
        </div>
        <Link to="/shop/discovery-set" className="link pcard__details">
          View Details
        </Link>
      </div>
    </Reveal>
  );
}
import { searchCatalogue } from '../components/Overlays.jsx';
import { IconArrow, IconClose } from '../components/Icons.jsx';

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'new', label: 'New Arrivals' },
  { id: 'best', label: 'Best Sellers' },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const families = (params.get('family') || '').split(',').filter(Boolean);
  const sort = params.get('sort') || 'featured';
  const q = params.get('q') || '';

  const list = useMemo(() => {
    let out = q ? searchCatalogue(q).products.map((r) => r.product) : [...products];
    if (families.length) out = out.filter((p) => families.some((f) => p.families.includes(f)));
    const sorters = {
      'price-asc': (a, b) => priceFrom(a) - priceFrom(b),
      'price-desc': (a, b) => priceFrom(b) - priceFrom(a),
      new: (a, b) => new Date(b.released) - new Date(a.released),
      best: (a, b) => a.salesRank - b.salesRank,
    };
    if (sorters[sort]) out.sort(sorters[sort]);
    return out;
  }, [families.join(','), sort, q]);

  function update(next) {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    setParams(p, { replace: true });
  }
  function toggleFamily(f) {
    const set = families.includes(f) ? families.filter((x) => x !== f) : [...families, f];
    update({ family: set.join(',') });
  }

  return (
    <>
      <PageHeader eyebrow="The Collection" title={<>Five essences. <em>Choose the one that is already you.</em></>}>
        <div className="shop-hero">
          <p className="lead">
            Every VÉLZARIA perfume is an Eau de Parfum composed around a personality. Not sure where to begin? Try the{' '}
            <Link to="/shop/discovery-set" className="link-inline">
              Discovery Set
            </Link>{' '}
            or let us{' '}
            <Link to="/create" className="link-inline">
              find your essence
            </Link>
            .
          </p>
        </div>
      </PageHeader>

      <div className="shop-bar">
        <div className="container shop-bar__inner">
          <div className="shop-filters" role="group" aria-label="Filter by fragrance family">
            <span className="label">Filter</span>
            <button className="chip" aria-pressed={families.length === 0} onClick={() => update({ family: '' })}>
              All
            </button>
            {FILTERS.map((f) => (
              <button key={f} className="chip" aria-pressed={families.includes(f)} onClick={() => toggleFamily(f)}>
                {f}
              </button>
            ))}
          </div>
          <div className="shop-sort">
            <label className="label" htmlFor="sort">
              Sort
            </label>
            <select id="sort" className="select" value={sort} onChange={(e) => update({ sort: e.target.value === 'featured' ? '' : e.target.value })}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <section className="container" style={{ paddingBottom: 'clamp(72px, 10vw, 140px)' }}>
        {q && (
          <div className="shop-query">
            <span>
              Results for <strong>“{q}”</strong>
            </span>
            <button className="chip" onClick={() => update({ q: '' })}>
              Clear search <IconClose width="12" height="12" />
            </button>
          </div>
        )}
        <p className="tiny muted" aria-live="polite" style={{ marginBottom: 24 }}>
          Showing {list.length} of {products.length} perfumes
          {families.length > 0 && ` · ${families.join(', ')}`}
        </p>

        {list.length === 0 ? (
          <div className="shop-empty">
            <p className="serif-lead">No essence matches this combination — yet.</p>
            <button className="btn btn--ghost" onClick={() => setParams({}, { replace: true })}>
              Clear filters
            </button>
            <Link to="/create" className="link">
              Or create your own <IconArrow />
            </Link>
          </div>
        ) : (
          <div className="shop-grid">
            {list.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 100}>
                <ProductCard product={p} />
              </Reveal>
            ))}
            {list.length % 3 !== 0 && <DiscoveryTile />}
          </div>
        )}

        <div className="shop-promo">
          <Link to="/shop/discovery-set" className="promo">
            <span className="eyebrow eyebrow--gold">Discovery Set</span>
            <h3>All five, in 2 ml vials</h3>
            <p>Wear each essence for a day. The set’s value is credited toward your first full bottle.</p>
            <span className="link">Discover</span>
          </Link>
          <Link to="/gifting" className="promo">
            <span className="eyebrow eyebrow--gold">Luxury Gifting</span>
            <h3>Wrapped, engraved, written</h3>
            <p>Signature gift box, a handwritten card and engraving on 50 ml and 100 ml bottles.</p>
            <span className="link">Explore gifting</span>
          </Link>
          <Link to="/refill" className="promo">
            <span className="eyebrow eyebrow--gold">Refill Programme</span>
            <h3>Keep the bottle, renew the essence</h3>
            <p>Every 100 ml bottle can be refilled — at 25% less, with less glass and less waste.</p>
            <span className="link">How it works</span>
          </Link>
        </div>
      </section>
    </>
  );
}
