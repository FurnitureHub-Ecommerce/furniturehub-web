import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight, AlertCircle, RefreshCw, FolderX } from 'lucide-react';
import { CATEGORIES as MOCK_CATEGORIES } from '../../../data/lumoraData';
import { Skeleton } from '../../common/Skeleton/Skeleton';
import './FeaturedCategories.css';

export function FeaturedCategories({
  isLoading = false,
  error = null,
  categories = null,
  onRetry = null,
}) {
  const scrollRef = useRef(null);

  const displayCategories =
    categories && categories.length > 0
      ? categories
      : !isLoading && !error && categories !== null && categories.length === 0
      ? []
      : MOCK_CATEGORIES;

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === 'left' ? -340 : 340;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className="section categories-section" aria-label="Danh mục nổi bật">
      <div className="container">
        {/* Section Header */}
        <div className="categories__header">
          <div>
            <span className="section-heading__badge">Không gian kiến trúc</span>
            <h2 className="categories__title">Danh mục nổi bật</h2>
            <p className="categories__subtitle">
              Khám phá bộ sưu tập nội thất được chế tác tỉ mỉ, thiết kế cho không gian sống hài hòa.
            </p>
          </div>

          <div className="categories__controls">
            <button
              className="categories__arrow-btn"
              onClick={() => handleScroll('left')}
              aria-label="Cuộn danh mục sang trái"
              type="button"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="categories__arrow-btn"
              onClick={() => handleScroll('right')}
              aria-label="Cuộn danh mục sang phải"
              type="button"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* UI State Conditionals */}
        {error ? (
          <div className="ui-state-card ui-state-card--error" style={{ textAlign: 'center', padding: '40px 20px', border: '1px solid var(--lumora-border)', borderRadius: 'var(--radius-lg)', backgroundColor: '#FFFBFB' }}>
            <AlertCircle size={36} color="#D93838" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>Không thể tải danh mục từ API</h3>
            <p style={{ color: 'var(--lumora-text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>{error}</p>
            {onRetry && (
              <button onClick={onRetry} style={{ padding: '10px 20px', backgroundColor: 'var(--lumora-text-main)', color: '#FFF', borderRadius: 'var(--radius-md)', gap: '8px', cursor: 'pointer' }}>
                <RefreshCw size={16} />
                <span>Thử Lại API</span>
              </button>
            )}
          </div>
        ) : displayCategories.length === 0 && !isLoading ? (
          <div className="ui-state-card ui-state-card--empty" style={{ textAlign: 'center', padding: '40px 20px', border: '1px solid var(--lumora-border)', borderRadius: 'var(--radius-lg)' }}>
            <FolderX size={36} color="var(--lumora-text-light)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', marginBottom: '4px' }}>Chưa có danh mục nào từ API</h3>
            <p style={{ color: 'var(--lumora-text-muted)', fontSize: '0.9rem' }}>Dữ liệu từ máy chủ hiện đang rỗng.</p>
          </div>
        ) : (
          <div className="categories__track-wrapper">
            <div className="categories__track" ref={scrollRef}>
              {isLoading
                ? Array.from({ length: 5 }).map((_, idx) => (
                    <div key={idx} className="category-card-skeleton">
                      <Skeleton height="380px" borderRadius="var(--radius-md)" />
                    </div>
                  ))
                : displayCategories.map((category) => (
                    <Link
                      key={category.id || category._id}
                      to={category.link || `/category/${category.id || category._id}`}
                      className="category-card"
                      aria-label={`Khám phá bộ sưu tập ${category.name}`}
                    >
                      <div className="category-card__image-wrap">
                        <img
                          src={category.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'}
                          alt={category.name}
                          className="category-card__image"
                          loading="lazy"
                        />
                        <div className="category-card__overlay" />
                      </div>

                      <div className="category-card__content">
                        <div className="category-card__top">
                          <span className="category-card__count">{category.itemCount || 'Thiết kế cao cấp'}</span>
                          <div className="category-card__icon-btn">
                            <ArrowUpRight size={18} />
                          </div>
                        </div>

                        <div className="category-card__bottom">
                          <h3 className="category-card__name">{category.name}</h3>
                          <p className="category-card__desc">{category.description || 'Nội thất sang trọng Wabi-Sabi & Bắc Âu.'}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedCategories;
