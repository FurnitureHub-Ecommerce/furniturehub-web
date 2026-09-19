import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../../../data/lumoraData';
import { Skeleton } from '../../common/Skeleton/Skeleton';
import './FeaturedCategories.css';

export function FeaturedCategories({ isLoading = false }) {
  const scrollRef = useRef(null);

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

        {/* Categories Grid / Horizontal Snapping Track */}
        <div className="categories__track-wrapper">
          <div className="categories__track" ref={scrollRef}>
            {isLoading
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="category-card-skeleton">
                    <Skeleton height="380px" borderRadius="var(--radius-md)" />
                  </div>
                ))
              : CATEGORIES.map((category) => (
                  <Link
                    key={category.id}
                    to={category.link}
                    className="category-card"
                    aria-label={`Khám phá bộ sưu tập ${category.name}`}
                  >
                    <div className="category-card__image-wrap">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="category-card__image"
                        loading="lazy"
                      />
                      <div className="category-card__overlay" />
                    </div>

                    <div className="category-card__content">
                      <div className="category-card__top">
                        <span className="category-card__count">{category.itemCount}</span>
                        <div className="category-card__icon-btn">
                          <ArrowUpRight size={18} />
                        </div>
                      </div>

                      <div className="category-card__bottom">
                        <h3 className="category-card__name">{category.name}</h3>
                        <p className="category-card__desc">{category.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturedCategories;
