import { useState } from 'react';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { PRODUCTS } from '../../../data/lumoraData';
import Rating from '../../common/Rating/Rating';
import { ProductCardSkeleton } from '../../common/Skeleton/Skeleton';
import './ProductShowcase.css';

const TABS = [
  { id: 'featured', label: 'Nổi bật' },
  { id: 'new-arrivals', label: 'Hàng mới' },
  { id: 'best-sellers', label: 'Bán chạy' },
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
    <section className="section product-showcase" aria-label="Trưng bày sản phẩm">
      <div className="container">
        {/* Section Header */}
        <div className="section-heading">
          <span className="section-heading__badge">Chế tác kiệt tác</span>
          <h2 className="section-heading__title">Những món nội thất vượt thời gian</h2>
          <p className="section-heading__subtitle">
            Được chế tạo tỉ mỉ từ gỗ đạt chứng nhận FSC, vải lanh tự nhiên và đồng mạ tay.
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
                        {product.isNew && <span className="product-badge product-badge--new">Mới</span>}
                        {product.oldPrice && (
                          <span className="product-badge product-badge--sale">
                            Tiết kiệm ${(product.oldPrice - product.price).toLocaleString()}
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
                            ? `Xóa ${product.name} khỏi yêu thích`
                            : `Thêm ${product.name} vào yêu thích`
                        }
                        type="button"
                      >
                        <Heart size={18} fill={isWishlisted ? '#8A6A48' : 'none'} />
                      </button>

                      {/* Quick Hover Actions */}
                      <div className="product-card__quick-actions">
                        <button
                          className="product-card__quick-view-btn"
                          aria-label={`Xem nhanh ${product.name}`}
                          type="button"
                        >
                          <Eye size={16} />
                          <span>Xem nhanh</span>
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
                          aria-label={`Thêm ${product.name} vào giỏ hàng`}
                          type="button"
                        >
                          {isJustAdded ? (
                            <>
                              <Check size={16} />
                              <span>Đã thêm</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={16} />
                              <span>Thêm vào giỏ</span>
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
