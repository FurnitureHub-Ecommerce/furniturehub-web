import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import Rating from './Rating';
import { formatCurrency, PRODUCT_IMAGE_OVERRIDES, getProductMetrics } from '../../../utils/formatters';
import './ProductCard.css';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80';

/**
 * ProductCard – shared UI component.
 */
function ProductCard({ product }) {
  const {
    id,
    name,
    slug = '#',
    price,
    oldPrice,
    image,
    isNew = false,
    discount = null,
  } = product;

  const overrideImages = PRODUCT_IMAGE_OVERRIDES[name];
  const finalImage = overrideImages?.[0] || image || DEFAULT_FALLBACK_IMAGE;
  const metrics = getProductMetrics(name, product.rating, product.reviewCount);

  return (
    <article className="product-card group" aria-label={name}>
      {/* ---- Image ---- */}
      <div className="product-card__img-wrap relative overflow-hidden">
        <img
          src={finalImage}
          alt={name}
          className="product-card__img group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
          }}
        />

        {/* Badges */}
        {(isNew || discount) && (
          <div className="product-card__badges absolute top-3 left-3 z-10">
            {discount && (
              <span className="badge badge--discount">-{discount}%</span>
            )}
            {isNew && <span className="badge badge--new">Mới</span>}
          </div>
        )}

        {/* Hover action buttons */}
        <div className="product-card__actions" role="group" aria-label="Quick actions">
          <button
            id={`add-to-cart-${id}`}
            className="product-card__action-btn"
            type="button"
            aria-label={`Add ${name} to cart`}
            title="Add to cart"
          >
            <ShoppingCart size={15} strokeWidth={1.5} />
          </button>
          <button
            id={`wishlist-${id}`}
            className="product-card__action-btn"
            type="button"
            aria-label={`Add ${name} to wishlist`}
            title="Add to wishlist"
          >
            <Heart size={15} strokeWidth={1.5} fill="none" />
          </button>
          <button
            id={`quick-view-${id}`}
            className="product-card__action-btn"
            type="button"
            aria-label={`Quick view ${name}`}
            title="Quick view"
          >
            <Eye size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ---- Info ---- */}
      <div className="product-card__info">
        <Rating value={metrics.rating} showCount={metrics.reviewCount > 0} count={metrics.reviewCount} />

        <Link to={`/products/${slug}`} className="product-card__name">
          {name}
        </Link>

        <div className="product-card__price-row">
          <span className="product-card__price">{formatCurrency(price)}</span>
          {oldPrice && (
            <span className="product-card__price product-card__price--old">
              {formatCurrency(oldPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
