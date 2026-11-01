import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Check, AlertCircle, RefreshCw, PackageX, ArrowRight, Sparkles } from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import { ProductCardSkeleton } from '../../common/Skeleton/Skeleton';
import { formatCurrency } from '../../../utils/formatters';
import { productAPI, getApiErrorMessage } from '../../../services/api';
import './ProductShowcase.css';

const TABS = [
  { id: 'featured', label: 'Nổi bật' },
  { id: 'new-arrivals', label: 'Hàng mới' },
  { id: 'best-sellers', label: 'Bán chạy' },
];

export function ProductShowcase({
  products: initialProducts = null,
  isLoading: initialLoading = false,
  error: initialError = null,
  onRetry = null,
}) {
  const [products, setProducts] = useState(initialProducts || []);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState(initialError);
  const [activeTab, setActiveTab] = useState('featured');
  const [addedItem, setAddedItem] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { wishlist, toggleWishlist, addToCart, setQuickViewProduct } = useShop();

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await productAPI.getProducts();
      const rawList = res?.data?.products || res?.data || [];
      setProducts(rawList);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tải danh sách sản phẩm từ API.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialProducts === null) {
      fetchProducts();
    } else {
      const rawList = initialProducts?.products || initialProducts?.data || initialProducts || [];
      setProducts(rawList);
      setIsLoading(initialLoading);
      setError(initialError);
    }
  }, [initialProducts, initialLoading, initialError]);

  // Logic lọc dữ liệu thực từ API Backend
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];

    const listCopy = [...products];

    if (activeTab === 'new-arrivals') {
      // Sắp xếp theo thời gian tạo createdAt mới nhất
      return listCopy.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    if (activeTab === 'best-sellers') {
      // Ưu tiên sản phẩm có số lượng bán soldCount cao hơn hoặc minPrice
      return listCopy.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    }

    // Tab 'featured': Giữ nguyên danh sách nổi bật mặc định từ API
    return listCopy;
  }, [products, activeTab]);

  useEffect(() => {
    if (filteredProducts.length <= 4 || isLoading) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 4 >= filteredProducts.length ? 0 : prev + 4));
    }, 4500);
    return () => clearInterval(interval);
  }, [filteredProducts.length, isLoading]);

  const safeIndex = currentIndex >= filteredProducts.length ? 0 : currentIndex;
  const displayedProducts = filteredProducts.slice(safeIndex, safeIndex + 4);

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedItem(product._id || product.id);
    setTimeout(() => setAddedItem(null), 2000);
  };

  return (
    <section className="section product-showcase" aria-label="Trưng bày sản phẩm">
      <div className="container">
        {/* Section Header */}
        <div className="section-heading">
          <span className="section-heading__badge">
            <Sparkles size={11} style={{ display: 'inline', marginRight: 6 }} />
            Chế tác kiệt tác
          </span>
          <h2 className="section-heading__title">Những Món Nội Thất Vượt Thời Gian</h2>
          <p className="section-heading__subtitle">
            Được chế tạo tỉ mỉ từ gỗ tự nhiên, vải lanh cao cấp và đường nét thiết kế hiện đại.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="product-showcase__tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`product-showcase__tab ${activeTab === tab.id ? 'product-showcase__tab--active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentIndex(0);
              }}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* UI States */}
        {error ? (
          <div className="ui-state-card ui-state-card--error">
            <AlertCircle size={38} color="#D93838" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px', color: '#1A1615' }}>
              Không thể kết nối danh sách sản phẩm API
            </h3>
            <p style={{ color: '#6E615B', fontSize: '0.9rem', marginBottom: '20px' }}>{error}</p>
            <button onClick={onRetry || fetchProducts} className="ui-state-retry-btn" type="button">
              <RefreshCw size={16} />
              <span>Thử Lại Kết Nối API</span>
            </button>
          </div>
        ) : filteredProducts.length === 0 && !isLoading ? (
          <div className="ui-state-card ui-state-card--empty">
            <PackageX size={38} color="#A3968C" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '6px', color: '#1A1615' }}>
              Không tìm thấy sản phẩm phù hợp
            </h3>
            <p style={{ color: '#6E615B', fontSize: '0.9rem' }}>Hiện chưa có sản phẩm nào cho mục này.</p>
          </div>
        ) : (
          <div className="product-showcase__grid" key={`${activeTab}-${currentIndex}`}>
            {isLoading
              ? Array.from({ length: 4 }).map((_, idx) => <ProductCardSkeleton key={idx} />)
              : displayedProducts.map((product) => {
                    const prodId = String(product._id || product.id);
                    const isWishlisted = wishlist.includes(prodId);
                    const isJustAdded = addedItem === prodId;

                    const primaryImg = Array.isArray(product.images) && product.images.length > 0 
                      ? product.images[0] 
                      : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80';
                    const hoverImg = Array.isArray(product.images) && product.images.length > 1 
                      ? product.images[1] 
                      : primaryImg;
                    const currentPrice = product.minPrice ?? 0;

                    return (
                      <article key={prodId} className="product-card">
                        <div className="product-card__image-container">
                          <img src={primaryImg} alt={product.name} className="product-card__image product-card__image--primary" loading="lazy" />
                          <img src={hoverImg} alt={product.name} className="product-card__image product-card__image--hover" loading="lazy" />

                          <button
                            className={`product-card__wishlist-btn ${isWishlisted ? 'product-card__wishlist-btn--active' : ''}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(prodId);
                            }}
                            type="button"
                            aria-label="Thêm vào yêu thích"
                          >
                            <Heart size={17} fill={isWishlisted ? '#C29A62' : 'none'} color={isWishlisted ? '#C29A62' : '#1A1615'} />
                          </button>

                          <div className="product-card__quick-actions">
                            <button className="product-card__quick-view-btn" onClick={() => setQuickViewProduct(product)} type="button">
                              <Eye size={15} />
                              <span>Xem nhanh</span>
                            </button>
                          </div>
                        </div>

                        <div className="product-card__details">
                          <div className="product-card__meta">
                            <span className="product-card__category">
                              {product.categoryId?.name || product.brandId?.name || 'Nội thất cao cấp'}
                            </span>
                          </div>

                          <h3 className="product-card__title">
                            <Link to={`/product/${product.slug || prodId}`}>{product.name}</Link>
                          </h3>

                          <div className="product-card__footer">
                            <div className="product-card__pricing">
                              <span className="product-card__price">{formatCurrency(currentPrice)}</span>
                            </div>

                            <button
                              className={`product-card__cart-btn ${isJustAdded ? 'product-card__cart-btn--added' : ''}`}
                              onClick={() => handleAddToCart(product)}
                              type="button"
                            >
                              {isJustAdded ? (
                                <>
                                  <Check size={15} />
                                  <span>Đã thêm</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag size={15} />
                                  <span>Thêm giỏ</span>
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

        <div className="product-showcase__view-all-wrapper">
          <Link to="/products" className="product-showcase__view-all-btn">
            <span>XEM TẤT CẢ SẢN PHẨM</span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ProductShowcase;