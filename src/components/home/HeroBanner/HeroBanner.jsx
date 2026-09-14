import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, TreeDeciduous, Truck, ShieldCheck, Leaf } from 'lucide-react';
import { HERO_BANNERS, USP_ITEMS } from '../../../data/lumoraData';
import { HeroSkeleton } from '../../common/Skeleton/Skeleton';
import './HeroBanner.css';

const ICON_MAP = {
  Tree: TreeDeciduous,
  Truck: Truck,
  ShieldCheck: ShieldCheck,
  Leaf: Leaf,
};

export function HeroBanner({ isLoading = false }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isLoading || isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isLoading, isPaused]);

  if (isLoading) {
    return <HeroSkeleton />;
  }

  const currentBanner = HERO_BANNERS[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? HERO_BANNERS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % HERO_BANNERS.length);
  };

  return (
    <section
      className="hero"
      aria-label="Featured Collection Showcase"
      onMouseEnter={() => setIsPaused(true)}
      aria-roledescription="carousel"
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Banner Slides */}
      <div className="hero__slides">
        {HERO_BANNERS.map((banner, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={banner.id}
              className={`hero__slide ${isActive ? 'hero__slide--active' : ''}`}
              aria-hidden={!isActive}
            >
              <div
                className="hero__bg-image"
                style={{ backgroundImage: `url(${banner.image})` }}
              />
              <div className="hero__overlay" />
            </div>
          );
        })}
      </div>

      {/* Content Container */}
      <div className="container hero__content-wrapper">
        <div className="hero__card">
          {/* Badge & Tag */}
          <div className="hero__meta">
            <span className="hero__badge">{currentBanner.badge}</span>
            <span className="hero__tag">
              <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} />
              {currentBanner.tag}
            </span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="hero__title">{currentBanner.title}</h1>
          <p className="hero__subtitle">{currentBanner.subtitle}</p>

          {/* Price Snippet & CTAs */}
          <div className="hero__actions-row">
            <div className="hero__price-box">
              <span className="hero__price-label">Starting Price</span>
              <span className="hero__price-value">{currentBanner.priceSnippet}</span>
            </div>

            <div className="hero__cta-group">
              <Link to={currentBanner.primaryLink} className="hero__btn hero__btn--primary">
                <span>{currentBanner.ctaPrimary}</span>
                <ArrowRight size={16} />
              </Link>
              <Link to={currentBanner.secondaryLink} className="hero__btn hero__btn--secondary">
                <span>{currentBanner.ctaSecondary}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="hero__controls">
          <div className="hero__indicators">
            {HERO_BANNERS.map((_, idx) => (
              <button
                key={idx}
                className={`hero__dot ${idx === activeIndex ? 'hero__dot--active' : ''}`}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="hero__arrows">
            <button
              className="hero__arrow-btn"
              onClick={handlePrev}
              aria-label="Previous Slide"
              type="button"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="hero__counter">
              0{activeIndex + 1} / 0{HERO_BANNERS.length}
            </span>
            <button
              className="hero__arrow-btn"
              onClick={handleNext}
              aria-label="Next Slide"
              type="button"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* USP Ticker Bar */}
      <div className="hero__usp-bar">
        <div className="container hero__usp-container">
          {USP_ITEMS.map((item) => {
            const IconComp = ICON_MAP[item.icon] || Leaf;
            return (
              <div key={item.id} className="hero__usp-item">
                <IconComp size={18} className="hero__usp-icon" />
                <span className="hero__usp-text">{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
