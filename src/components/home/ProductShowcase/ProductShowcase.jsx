import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Check, AlertCircle, RefreshCw, PackageX } from 'lucide-react';
import { PRODUCTS as MOCK_PRODUCTS } from '../../../data/lumoraData';
import { useShop } from '../../../context/ShopContext';
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
  error = null,
  products = null,
  onRetry = null,
}) {
  const [activeTab, setActiveTab] = useState('featured');
  const [addedItem, setAddedItem] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { wishlist, toggleWishlist, addToCart, setQuickViewProduct } = useShop();

  const rawProducts = Array.isArray(products)
    ? products
    : products?.data || products?.items || [];

  const allProducts = rawProducts.length > 0 
    ? rawProducts 
    : (isLoading ? [] : MOCK_PRODUCTS);

  const filteredProducts = allProducts.filter((p) => {
    if (!p.tab) return true;
    return p.tab === activeTab;
  });

  // Reset về 0 khi đổi tab
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab, filteredProducts.length]);

  // Tự động xoay vòng sản phẩm mỗi 4.5 giây
  useEffect(() => {
    if (filteredProducts.length <= 4 || isLoading) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 4;
        return nextIndex >= filteredProducts.length ? 0 : nextIndex;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [filteredProducts.length, isLoading]);

  const displayedProducts = filteredProducts.slice(currentIndex, currentIndex + 4);

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedItem(product.id || product._id);
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

        {/* UI States: Error / Empty / Data Grid */}
        {error ? (
          <div className="ui-state-card ui-state-card--error" style={{ textAlign: 'center', padding: '48px 20px', border: '1px solid var(--lumora-border)', borderRadius: 'var(--radius-lg)', backgroundColor: '#FFFBFB' }}>
            <AlertCircle size={40} color="#D93838" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>Không thể kết nối danh sách sản phẩm API</h3>
            <p style={{ color: 'var(--lumora-text-muted)', fontSize: '0.95rem', marginBottom: '20px' }}>{error}</p>
            {onRetry && (
              <button onClick={onRetry} style={{ padding: '12px 24px', backgroundColor: 'var(--lumora-text-main)', color: '#FFF', borderRadius: 'var(--radius-md)', gap: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                <RefreshCw size={18} />
                <span>Thử Lại Lấy Dữ Liệu API</span>
              </button>
            )}
          </div>
        ) : filteredProducts.length === 0 && !isLoading ? (
          <div className="ui-state-card ui-state-card--empty" style={{ textAlign: 'center', padding: '48px 20px', border: '1px solid var(--lumora-border)', borderRadius: 'var(--radius-lg)' }}>
            <PackageX size={40} color="var(--lumora-text-light)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-serif)', marginBottom: '6px' }}>Danh sách sản phẩm API hiện đang rỗng</h3>
            <p style={{ color: 'var(--lumora-text-muted)', fontSize: '0.95rem' }}>Hiện chưa có sản phẩm nào thuộc tab này trên server.</p>
          </div>
        ) : (
          /* Thêm key={currentIndex} ở đây để kích hoạt hiệu ứng mờ dần từ dưới lên mỗi khi đổi bộ 4 sản phẩm */
          <div className="product-showcase__grid" key={currentIndex}>
            {isLoading
              ? Array.from({ length: 4 }).map((_, idx) => <ProductCardSkeleton key={idx} />)
              : displayedProducts.map((product) => {
                  const prodId = String(product.id || product._id);
                  const isWishlisted = wishlist.includes(prodId);
                  const isJustAdded = addedItem === prodId;

                  return (
                    <article key={prodId} className="product-card">
                      <div className="product-card__image-container">
                        <img
                          src={product.image || product.imageUrl || 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80'}
                          alt={product.name}
                          className="product-card__image product-card__image--primary"
                          loading="lazy"
                        />
                        <img
                          src={product.hoverImage || product.image || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80'}
                          alt={`${product.name} lifestyle angle`}
                          className="product-card__image product-card__image--hover"
                          loading="lazy"
                        />

                        <div className="product-card__badges">
                          {product.isNew && <span className="product-badge product-badge--new">Mới</span>}
                          {product.oldPrice && product.oldPrice > product.price && (
                            <span className="product-badge product-badge--sale">
                              Tiết kiệm ${(product.oldPrice - product.price).toLocaleString()}
                            </span>
                          )}
                        </div>

                        <button
                          className={`product-card__wishlist-btn ${
                            isWishlisted ? 'product-card__wishlist-btn--active' : ''
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(prodId);
                          }}
                          aria-label={
                            isWishlisted
                              ? `Xóa ${product.name} khỏi yêu thích`
                              : `Thêm ${product.name} vào yêu thích`
                          }
                          type="button"
                        >
                          <Heart
                            size={18}
                            fill={isWishlisted ? '#E53E3E' : 'none'}
                            color={isWishlisted ? '#E53E3E' : 'currentColor'}
                          />
                        </button>

                        <div className="product-card__quick-actions">
                          <button
                            className="product-card__quick-view-btn"
                            onClick={() => setQuickViewProduct(product)}
                            aria-label={`Xem nhanh ${product.name}`}
                            type="button"
                          >
                            <Eye size={16} />
                            <span>Xem nhanh</span>
                          </button>
                        </div>
                      </div>

                      <div className="product-card__details">
                        <div className="product-card__meta">
                          <span className="product-card__variant">{product.variantLabel || 'Solid Oak / Crafted'}</span>
                          <Rating score={product.rating || 4.9} reviewCount={product.reviewCount || 24} />
                        </div>

                        <h3 className="product-card__title">
                          <Link to={`/product/${product.slug || prodId}`}>{product.name}</Link>
                        </h3>

                        <div className="product-card__footer">
                          <div className="product-card__pricing">
                            <span className="product-card__price">
                              ${(product.price || 0).toLocaleString()}
                            </span>
                            {product.oldPrice && (
                              <span className="product-card__old-price">
                                ${product.oldPrice.toLocaleString()}
                              </span>
                            )}
                          </div>

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
        )}
      </div>
    </section>
  );
}

export default ProductShowcase;