import { useState } from 'react';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { PRODUCTS } from '../../../data/lumoraData';
import Rating from '../../common/Rating/Rating';
import { ProductCardSkeleton } from '../../common/Skeleton/Skeleton';
import './ProductShowcase.css';

const TABS = [
  { id: 'featured', label: 'Curated Featured' },
  { id: 'new-arrivals', label: 'New Arrivals' },
  { id: 'best-sellers', label: 'Best Sellers' },
];

export function ProductShowcase({
  isLoading = false,
  wishlist = [],
  onToggleWishlist,
  onAddToCart,
}) {
  const [activeTab, setActiveTab] = useState('featured');
  const [addedItem, setAddedItem] = useState(null);

  // Filter products by tab
  const filteredProducts = PRODUCTS.filter((p) => p.tab === activeTab);

  const handleAddToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
    setAddedItem(product.id);
    setTimeout(() => {
      setAddedItem(null);
    }, 2000);
  };

  return (
    <section className="section product-showcase" aria-label="Product Showcase">
      <div className="container">
        {/* Section Header */}
        <div className="section-heading">
          <span className="section-heading__badge">Masterpiece Craftsmanship</span>
          <h2 className="section-heading__title">Timeless Furniture Pieces</h2>
          <p className="section-heading__subtitle">
            Meticulously engineered from FSC certified hardwood, natural linen, and hand-finished brass.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="product-showcase__tabs" role="tablist" aria-label="Product showcase tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`product-showcase__tab ${
                activeTab === tab.id ? 'product-showcase__tab--active' : ''
              }`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="product-showcase__grid">
          {isLoading
            ? Array.from({ length: 4 }).map((_, idx) => <ProductCardSkeleton key={idx} />)
            : filteredProducts.map((product) => {
                const isWishlisted = wishlist.includes(product.id) || product.isWishlisted;
                const isJustAdded = addedItem === product.id;

                return (
                  <article key={product.id} className="product-card">
                    {/* Aspect-Ratio Locked Image Box */}
                    <div className="product-card__image-container">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-card__image product-card__image--primary"
                        loading="lazy"
                      />
                      <img
                        src={product.hoverImage || product.image}
                        alt={`${product.name} lifestyle angle`}
                        className="product-card__image product-card__image--hover"
                        loading="lazy"
                      />

                      {/* Badges */}
                      <div className="product-card__badges">
                        {product.isNew && <span className="product-badge product-badge--new">New</span>}
                        {product.oldPrice && (
                          <span className="product-badge product-badge--sale">
                            Save ${(product.oldPrice - product.price).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Wishlist Toggle Button */}
                      <button
                        className={`product-card__wishlist-btn ${
                          isWishlisted ? 'product-card__wishlist-btn--active' : ''
                        }`}
                        onClick={() => onToggleWishlist && onToggleWishlist(product.id)}
                        aria-label={
                          isWishlisted
                            ? `Remove ${product.name} from Wishlist`
                            : `Add ${product.name} to Wishlist`
                        }
                        type="button"
                      >
                        <Heart size={18} fill={isWishlisted ? '#8A6A48' : 'none'} />
                      </button>

                      {/* Quick Hover Actions */}
                      <div className="product-card__quick-actions">
                        <button
                          className="product-card__quick-view-btn"
                          aria-label={`Quick View ${product.name}`}
                          type="button"
                        >
                          <Eye size={16} />
                          <span>Quick View</span>
                        </button>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="product-card__details">
                      <div className="product-card__meta">
                        <span className="product-card__variant">{product.variantLabel}</span>
                        <Rating score={product.rating} reviewCount={product.reviewCount} />
                      </div>

                      <h3 className="product-card__title">
                        <a href={`/product/${product.slug}`}>{product.name}</a>
                      </h3>

                      <div className="product-card__footer">
                        <div className="product-card__pricing">
                          <span className="product-card__price">
                            ${product.price.toLocaleString()}
                          </span>
                          {product.oldPrice && (
                            <span className="product-card__old-price">
                              ${product.oldPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          className={`product-card__cart-btn ${
                            isJustAdded ? 'product-card__cart-btn--added' : ''
                          }`}
                          onClick={() => handleAddToCart(product)}
                          aria-label={`Add ${product.name} to Cart`}
                          type="button"
                        >
                          {isJustAdded ? (
                            <>
                              <Check size={16} />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={16} />
                              <span>Add to Bag</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
        </div>
      </div>
    </section>
  );
}

export default ProductShowcase;
