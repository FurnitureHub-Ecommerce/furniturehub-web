import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import Rating from './Rating';
import './ProductCard.css';

/**
 * ProductCard – shared UI component.
 *
 * Props:
 *   product {
 *     id, name, slug, price, oldPrice,
 *     rating, reviewCount,
 *     image, isNew, discount
 *   }
 */
function ProductCard({ product }) {
  const {
    id,
    name,
    slug = '#',
    price,
    oldPrice,
    rating = 0,
    reviewCount = 0,
    image,
    isNew = false,
    discount = null,
  } = product;

  return (
    <article className="product-card" aria-label={name}>
      {/* ---- Image ---- */}
      <div className="product-card__img-wrap">
        <img
          src={image}
          alt={name}
          className="product-card__img"
          loading="lazy"
        />

        {/* Badges */}
        {(isNew || discount) && (
          <div className="product-card__badges">
            {discount && (
              <span className="badge badge--discount">{discount}% Off</span>
            )}
            {isNew && <span className="badge badge--new">New</span>}
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
        <Rating value={rating} showCount={reviewCount > 0} count={reviewCount} />

        <Link to={`/products/${slug}`} className="product-card__name">
          {name}
        </Link>

        <div className="product-card__price-row">
          <span className="product-card__price">{price}</span>
          {oldPrice && (
            <span className="product-card__price product-card__price--old">
              {oldPrice}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
