import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { getSize, priceFrom } from '../data/products.js';
import { money, cls } from '../lib/format.js';
import { ProductPhoto, Stars } from './ui.jsx';
import { IconHeart } from './Icons.jsx';

export function productLine(product, ml = 50, options = {}) {
  const size = getSize(product, ml);
  return {
    type: 'product',
    productId: product.id,
    name: product.name,
    size: size.ml,
    sizeLabel: size.label,
    basePrice: size.price,
    options,
  };
}

export default function ProductCard({ product, showRating = true, className }) {
  const { addToCart, toggleWishlist, wishlist, setQuickView } = useStore();
  const saved = wishlist.includes(product.id);
  const size50 = getSize(product, 50);

  return (
    <article className={cls('pcard', className)}>
      <div className="pcard__media">
        <Link to={`/perfume/${product.slug}`} aria-label={`View ${product.name}`}>
          <span className="pcard__photo"><ProductPhoto product={product} /></span>
        </Link>
        <button className={cls('pcard__wish', saved && 'is-saved')} onClick={() => toggleWishlist(product.id)} aria-pressed={saved} aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}>
          <IconHeart filled={saved} width="18" height="18" />
        </button>
        <button className="pcard__quick" onClick={() => setQuickView(product.id)}>
          Quick View
        </button>
      </div>
      <div className="pcard__body">
        <div className="pcard__meta">
          <span className="numeral">N° {product.number}</span>
          <span className="eyebrow">{product.direction}</span>
        </div>
        <h3 className="pcard__name">
          <Link to={`/perfume/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="pcard__desc">{product.card}</p>
        {showRating && (
          <div className="pcard__rating">
            <Stars value={product.rating} /> <span className="tiny muted">{product.rating} · {product.reviewCount} reviews</span>
          </div>
        )}
        <div className="pcard__foot">
          <span className="pcard__price">
            <span className="tiny muted">From</span> {money(priceFrom(product))}
          </span>
          <button className="btn btn--sm" onClick={() => addToCart(productLine(product, 50))} aria-label={`Add ${product.name} 50 ml to bag`}>
            Add 50 ml · {money(size50.price)}
          </button>
        </div>
        <Link to={`/perfume/${product.slug}`} className="link pcard__details">
          View Details
        </Link>
      </div>
    </article>
  );
}
