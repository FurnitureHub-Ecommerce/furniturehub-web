import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, AlertCircle, RefreshCw, FolderX, ArrowRight, Sparkles } from 'lucide-react';
import { Skeleton } from '../../common/Skeleton/Skeleton';
import { formatCategoryName } from '../../../utils/formatters';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../../../data/lumoraData';
import { categoryAPI, getApiErrorMessage } from '../../../services/api';
import './FeaturedCategories.css';

const CATEGORY_IMAGE_MAP = {
  'living-room': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  'dining-room': 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
  'bedroom': 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
  'studio-office': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
  'lighting-decor': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
  'outdoor-living': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'kitchen-ware': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
  'lounge-chairs': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
  'carpets-rugs': 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
  'wall-art-mirrors': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
  'bookshelves-storage': 'https://images.unsplash.com/photo-1594626115865-5eef6a061413?auto=format&fit=crop&w=800&q=80',
  'ceramic-vases': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
};

const CATEGORY_DESC_MAP = {
  'living-room': 'Sofa, bàn trà & ghế thư giãn cao cấp phong cách tối giản',
  'dining-room': 'Bàn ăn gỗ sồi thủ công và ghế ăn tiêu chuẩn bền vững',
  'bedroom': 'Khung giường gỗ tự nhiên, chăn lanh mềm thư thái',
  'studio-office': 'Bàn viết gỗ óc chó và ghế công thái học bọc da',
  'lighting-decor': 'Đèn thả alabaster, bình gốm và nghệ thuật chiếu sáng',
  'outdoor-living': 'Bàn trà teak và ghế mây đan ngoài trời chống chịu thời tiết',
  'kitchen-ware': 'Ghế quầy bar và hệ tủ kệ bếp tối giản hiện đại',
  'lounge-chairs': 'Ghế bành đọc sách và đôn bọc da nappa thượng hạng',
};

export function FeaturedCategories({
  categories: initialCategories = null,
  isLoading: initialLoading = false,
  error: initialError = null,
  onRetry = null,
}) {
  const scrollRef = useRef(null);
  const [categories, setCategories] = useState(initialCategories || []);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState(initialError);

  useEffect(() => {
    if (initialCategories !== null) {
      const list = Array.isArray(initialCategories)
        ? initialCategories
        : initialCategories?.categories || initialCategories?.data || [];
      if (list.length > 0) {
        setCategories(list);
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
      setIsLoading(initialLoading);
      setError(initialError);
    }
  }, [initialCategories, initialLoading, initialError]);

  // Fetch internal fallback if no categories provided from parent
  useEffect(() => {
    if (initialCategories === null) {
      let isMounted = true;
      const fetchCategories = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await categoryAPI.getCategories();
          const list = Array.isArray(res.data)
            ? res.data
            : res.data?.categories || res.data?.data || [];
          if (isMounted) {
            setCategories(list.length > 0 ? list : DEFAULT_CATEGORIES);
          }
        } catch (err) {
          if (isMounted) {
            console.warn('Lỗi khi fetch categories:', err.message);
            setCategories(DEFAULT_CATEGORIES);
          }
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };

      fetchCategories();
      return () => {
        isMounted = false;
      };
    }
  }, [initialCategories]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === 'left' ? -340 : 340;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const displayList = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  return (
    <section className="section categories-section" aria-label="Khám phá theo không gian">
      <div className="container">
        {/* Section Header */}
        <div className="categories__header">
          <div className="categories__header-text">
            <span className="section-heading__badge">
              <Sparkles size={12} style={{ display: 'inline', marginRight: 5 }} />
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

        {/* UI State Conditionals */}
        {error && displayList.length === 0 ? (
          <div className="ui-state-card ui-state-card--error">
            <AlertCircle size={36} color="#D93838" className="ui-state-icon" />
            <h3 className="ui-state-title">Không thể tải danh mục từ máy chủ</h3>
            <p className="ui-state-desc">{error}</p>
            {onRetry && (
              <button onClick={onRetry} className="ui-state-retry-btn" type="button">
                <RefreshCw size={16} />
                <span>Thử Lại API</span>
              </button>
            )}
          </div>
        ) : (
          <div className="categories__track-wrapper">
            <div className="categories__track" ref={scrollRef}>
              {isLoading
                ? Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="category-card-skeleton">
                      <Skeleton height="340px" borderRadius="12px" />
                    </div>
                  ))
                : displayList.map((cat, idx) => {
                    const slug = cat.slug || cat.id || cat._id || `cat-${idx}`;
                    const name = formatCategoryName(cat.name) || cat.name || 'Không gian sống';
                    const image =
                      cat.image ||
                      cat.imageUrl ||
                      CATEGORY_IMAGE_MAP[slug] ||
                      CATEGORY_IMAGE_MAP[cat.name] ||
                      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80';
                    const desc =
                      cat.description ||
                      CATEGORY_DESC_MAP[slug] ||
                      'Tuyển tập các thiết kế nội thất tối giản, tinh tế cho ngôi nhà hiện đại.';
                    const itemCount = cat.itemCount || 'Bộ sưu tập tuyển chọn';

                    return (
                      <Link
                        key={slug}
                        to={`/category/${slug}`}
                        className="category-card"
                        aria-label={`Khám phá không gian ${name}`}
                      >
                        <div className="category-card__image-wrap">
                          <img
                            src={image}
                            alt={name}
                            className="category-card__image"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                        </div>

                        <div className="category-card__content">
                          <div>
                            <span
                              style={{
                                display: 'inline-block',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                color: '#8C6D48',
                                marginBottom: '6px',
                              }}
                            >
                              {itemCount}
                            </span>
                            <h3 className="category-card__name" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>
                              {name}
                            </h3>
                            <p
                              style={{
                                fontSize: '0.82rem',
                                color: '#6E615B',
                                lineHeight: '1.45',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {desc}
                            </p>
                          </div>

                          <div className="category-card__footer">
                            <span
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                color: '#2C221E',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              Khám phá không gian
                            </span>

                            <div
                              className="category-card__action-btn"
                              title={`Xem bộ sưu tập ${name}`}
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