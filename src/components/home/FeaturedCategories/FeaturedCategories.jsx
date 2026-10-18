import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, AlertCircle, RefreshCw, FolderX, ShoppingBag } from 'lucide-react';
import { Skeleton } from '../../common/Skeleton/Skeleton';
import { formatCurrency } from '../../../utils/formatters';
import { productAPI, getApiErrorMessage } from '../../../services/api';
import './FeaturedCategories.css';

export function FeaturedCategories() {
  const scrollRef = useRef(null);
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await productAPI.getProducts();
      
      let actualData = [];
      if (Array.isArray(response)) {
        actualData = response;
      } else if (Array.isArray(response?.data)) {
        actualData = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        actualData = response.data.data;
      } else if (Array.isArray(response?.data?.products)) {
        actualData = response.data.products;
      }

      setProducts(actualData);
    } catch (err) {
      const errorMsg = getApiErrorMessage(err, 'Không thể tải sản phẩm từ máy chủ.');
      setError(errorMsg);
      console.error('Lỗi tải sản phẩm:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === 'left' ? -340 : 340;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className="section categories-section" aria-label="Sản phẩm nổi bật">
      <div className="container">
        {/* Section Header */}
        <div className="categories__header">
          <div className="categories__header-text">
            <span className="section-heading__badge">Bộ sưu tập độc quyền</span>
            <h2 className="categories__title">Sản phẩm nổi bật</h2>
            <p className="categories__subtitle">
              Khám phá các thiết kế nội thất bán chạy nhất, mang lại sự sang trọng cho ngôi nhà của bạn.
            </p>
          </div>

          <div className="categories__controls">
            <button
              className="categories__arrow-btn"
              onClick={() => handleScroll('left')}
              aria-label="Cuộn sang trái"
              type="button"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="categories__arrow-btn"
              onClick={() => handleScroll('right')}
              aria-label="Cuộn sang phải"
              type="button"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* UI State Conditionals */}
        {error ? (
          <div className="ui-state-card ui-state-card--error">
            <AlertCircle size={36} color="#D93838" className="ui-state-icon" />
            <h3 className="ui-state-title">Không thể tải dữ liệu từ Backend</h3>
            <p className="ui-state-desc">{error}</p>
            <button onClick={fetchProducts} className="ui-state-retry-btn" type="button">
              <RefreshCw size={16} />
              <span>Thử Lại API</span>
            </button>
          </div>
        ) : products.length === 0 && !isLoading ? (
          <div className="ui-state-card ui-state-card--empty">
            <FolderX size={36} color="var(--lumora-text-light)" className="ui-state-icon" />
            <h3 className="ui-state-title">Chưa có sản phẩm nào từ Backend</h3>
            <p className="ui-state-desc">Dữ liệu từ máy chủ hiện đang rỗng.</p>
          </div>
        ) : (
          <div className="categories__track-wrapper">
            <div className="categories__track" ref={scrollRef}>
              {isLoading
                ? Array.from({ length: 5 }).map((_, idx) => (
                    <div key={idx} className="category-card-skeleton">
                      <Skeleton height="340px" borderRadius="12px" />
                    </div>
                  ))
                : products.map((item) => {
                    const itemId = item.id || item._id;
                    const itemName = item.name || 'Sản phẩm cao cấp';
                    const itemPrice = item.minPrice ?? item.price ?? 2500000;
                    
                    const itemImage = Array.isArray(item.images) && item.images.length > 0 
                      ? item.images[0] 
                      : (item.image || item.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80');

                    return (
                      <Link
                        key={itemId}
                        to={`/product/${itemId}`}
                        className="category-card"
                        aria-label={`Xem chi tiết ${itemName}`}
                      >
                        <div className="category-card__image-wrap">
                          
                          <img
                            src={itemImage}
                            alt={itemName}
                            className="category-card__image"
                            loading="lazy"
                          />
                        </div>

                        <div className="category-card__content">
                          <h3 className="category-card__name">
                            {itemName}
                          </h3>
                          
                          <div className="category-card__footer">
                            <div className="category-card__price-box">
                              <span className="category-card__price">
                                {formatCurrency(itemPrice)}
                              </span>
                              <span className="category-card__desc">
                                {item.description || 'Chính hãng cao cấp'}
                              </span>
                            </div>

                            <div 
                              className="category-card__action-btn"
                              title="Thêm vào giỏ hàng"
                              onClick={(e) => {
                                e.preventDefault();
                              }}
                            >
                              <ShoppingBag size={16} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedCategories;