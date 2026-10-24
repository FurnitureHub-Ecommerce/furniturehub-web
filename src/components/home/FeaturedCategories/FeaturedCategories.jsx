import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, AlertCircle, RefreshCw, FolderX, ArrowRight, Sparkles } from 'lucide-react';
import { Skeleton } from '../../common/Skeleton/Skeleton';
import { formatCategoryName } from '../../../utils/formatters';
import { categoryAPI, productAPI, getApiErrorMessage } from '../../../services/api';
import './FeaturedCategories.css';

export function FeaturedCategories({
  categories: initialCategories = null,
  isLoading: initialLoading = false,
  error: initialError = null,
  onRetry = null,
}) {
  const scrollRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [categoryImages, setCategoryImages] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBackendData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Gọi đồng thời API Danh mục và API Sản phẩm từ Backend
      const [catRes, prodRes] = await Promise.all([
        categoryAPI.getCategories(),
        productAPI.getProducts(),
      ]);

      const catList = Array.isArray(catRes)
        ? catRes
        : (catRes?.data?.categories || catRes?.data || []);

      const prodList = Array.isArray(prodRes)
        ? prodRes
        : (prodRes?.data?.products || prodRes?.data || []);

      // 2. Map ảnh từ mảng images của sản phẩm vào Category ID tương ứng
      const imageMap = {};
      prodList.forEach((product) => {
        const rawCatId = product.categoryId?._id || product.categoryId?.id || product.categoryId;
        const catIdStr = rawCatId ? String(rawCatId) : null;

        if (catIdStr && !imageMap[catIdStr] && Array.isArray(product.images) && product.images.length > 0) {
          const firstImg = product.images.find((img) => typeof img === 'string' && img.trim() !== '');
          if (firstImg) {
            imageMap[catIdStr] = firstImg;
          }
        }
      });

      setCategoryImages(imageMap);
      setCategories(catList);
    } catch (err) {
      console.error('Lỗi tải danh mục từ API:', err);
      setError(getApiErrorMessage(err, 'Không thể kết nối máy chủ để tải danh mục.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialCategories !== null) {
      const list = Array.isArray(initialCategories)
        ? initialCategories
        : initialCategories?.categories || initialCategories?.data || [];
      setCategories(list);
      setIsLoading(initialLoading);
      setError(initialError);
    } else {
      fetchBackendData();
    }
  }, [initialCategories, initialLoading, initialError]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === 'left' ? -360 : 360;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className="section categories-section" aria-label="Khám phá theo không gian">
      <div className="container">
        {/* Section Header */}
        <div className="categories__header">
          <div className="categories__header-text">
            <span className="section-heading__badge">
              <Sparkles size={11} style={{ display: 'inline', marginRight: 6 }} />
              Bộ sưu tập theo không gian
            </span>
            <h2 className="categories__title">Khám Phá Theo Không Gian</h2>
            <p className="categories__subtitle">
              Mỗi không gian sống là một tác phẩm nghệ thuật với đường nét kiến trúc tinh tế, hòa hợp thiên nhiên.
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

        {/* Trạng thái Lỗi API */}
        {error ? (
          <div className="ui-state-card ui-state-card--error">
            <AlertCircle size={38} color="#D93838" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px', color: '#2C221E' }}>Không thể tải danh mục từ Backend</h3>
            <p style={{ color: '#6E615B', fontSize: '0.9rem', marginBottom: '20px' }}>{error}</p>
            <button
              onClick={onRetry || fetchBackendData}
              className="ui-state-retry-btn"
              type="button"
            >
              <RefreshCw size={16} />
              <span>Thử Lại Kết Nối API</span>
            </button>
          </div>
        ) : categories.length === 0 && !isLoading ? (
          /* Trạng thái trống */
          <div className="ui-state-card ui-state-card--empty">
            <FolderX size={38} color="#A3968C" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px', color: '#2C221E' }}>Chưa có danh mục nào từ máy chủ</h3>
            <p style={{ color: '#6E615B', fontSize: '0.9rem' }}>Hiện chưa có danh mục sản phẩm nào trong hệ thống Backend.</p>
          </div>
        ) : (
          /* Render dữ liệu thực từ API */
          <div className="categories__track-wrapper">
            <div className="categories__track" ref={scrollRef}>
              {isLoading
                ? Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="category-card-skeleton">
                      <Skeleton height="380px" borderRadius="16px" />
                    </div>
                  ))
                : categories.map((cat, idx) => {
                    const catIdStr = String(cat._id || cat.id || '');
                    const rawName = cat.name || '';
                    const displayName = formatCategoryName(rawName) || rawName;

                    const categoryImage =
                      (Array.isArray(cat.images) && cat.images[0]) ||
                      cat.image ||
                      cat.imageUrl ||
                      categoryImages[catIdStr];

                    return (
                      <Link
                        key={catIdStr || idx}
                        to={`/category/${cat.slug || catIdStr}`}
                        className="category-card"
                        aria-label={`Khám phá không gian ${displayName}`}
                      >
                        <div className="category-card__image-wrap">
                          {categoryImage ? (
                            <img
                              src={categoryImage}
                              alt={displayName}
                              className="category-card__image"
                              loading="lazy"
                            />
                          ) : (
                            <div className="category-card__no-image">
                              <span>Chưa có ảnh sản phẩm</span>
                            </div>
                          )}
                          <div className="category-card__overlay" />
                        </div>

                        <div className="category-card__content">
                          <div>
                            <span className="category-card__item-tag">
                              {cat.itemCount ? `${cat.itemCount} sản phẩm` : 'Bộ sưu tập tuyển chọn'}
                            </span>
                            <h3 className="category-card__name">
                              {displayName}
                            </h3>
                            <p className="category-card__desc">
                              {cat.description || 'Chưa có mô tả cho danh mục này.'}
                            </p>
                          </div>

                          <div className="category-card__footer">
                            <span className="category-card__cta-text">
                              Khám phá không gian
                            </span>

                            <div
                              className="category-card__action-btn"
                              title={`Xem bộ sưu tập ${displayName}`}
                            >
                              <ArrowRight size={16} />
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