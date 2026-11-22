import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { getProduct } from '../data/products.js';
import ProductCard from '../components/ProductCard.jsx';
import { PageHeader } from '../components/ui.jsx';

export function WishlistGrid() {
  const { wishlist } = useStore();
  const items = wishlist.map(getProduct).filter(Boolean);
  if (items.length === 0)
    return (
      <div className="shop-empty">
        <p className="serif-lead">Nothing saved yet. Tap the heart on any essence to keep it here.</p>
        <Link to="/shop" className="btn">
          Discover the collection
        </Link>
      </div>
    );
  return (
    <div className="related__grid">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} showRating={false} />
      ))}
    </div>
  );
}

export default function Wishlist() {
  return (
    <>
      <PageHeader eyebrow="Wishlist" title="The essences you love" />
      <section className="container" style={{ paddingBottom: 'clamp(72px, 9vw, 130px)' }}>
        <WishlistGrid />
      </section>
    </>
  );
}
