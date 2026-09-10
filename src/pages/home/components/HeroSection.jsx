import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

import slide1Img from '../../../assets/images/hero-slide-1.jpg';
import slide2Img from '../../../assets/images/hero-slide-2.jpg';
import slide3Img from '../../../assets/images/hero-slide-3.jpg';

/** Slide data – replace with API data later */
const SLIDES = [
  {
    id: 1,
    image: slide1Img,
    alt: 'Pendant lamps collection',
    label: 'Furniture Designs Ideas',
    heading: 'LIGHTING',
    subheading: 'PENDANT LAMPS',
    description:
      'Consectetur adipisicing elit. Beatae accusamus,\noptio, repellendus inventore',
    ctaLink: '/products',
    align: 'center',
  },
  {
    id: 2,
    image: slide2Img,
    alt: 'Scandinavian daybed sofa',
    label: 'Furniture Designs Ideas',
    heading: 'SCANDINAVIAN',
    subheading: 'DAYBED SOFA',
    description:
      'Excepteur sint occaecat cupidatat non proident,\nsunt in culpa qui officia.',
    ctaLink: '/products',
    align: 'right', // Daybed on the left -> Text moved to the right
  },
  {
    id: 3,
    image: slide3Img,
    alt: 'Wooden lounge chairs',
    label: 'Furniture Designs Ideas',
    heading: 'WOODEN CRAFT',
    subheading: 'LOUNGE CHAIRS',
    description:
      'Duis aute irure dolor in reprehenderit in voluptate\nvelit esse cillum dolore.',
    ctaLink: '/products',
    align: 'left', // Chairs on the right -> Text moved to the left
  },
];

const AUTO_PLAY_INTERVAL = 5000; // ms

function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback((index) => {
    setCurrent((index + SLIDES.length) % SLIDES.length);
  }, []);

  /* Auto-play */
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = SLIDES[current];
  const alignClass = `hero__content--${slide.align || 'center'}`;

  return (
    <section
      className="hero"
      aria-label="Featured products slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ---- Slides ---- */}
      {SLIDES.map((s, idx) => (
        <div
          key={s.id}
          className={`hero__slide${idx === current ? ' hero__slide--active' : ''}`}
          aria-hidden={idx !== current}
        >
          <img
            src={s.image}
            alt={s.alt}
            className="hero__slide-img"
            loading={idx === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}

      {/* ---- Text Content (dynamically aligned per slide) ---- */}
      <div className={`hero__content ${alignClass}`}>
        <div className="hero__content-box">
          <p className="hero__label">{SLIDES[current].label}</p>
          <h1 className="hero__heading">{SLIDES[current].heading}</h1>
          <h2 className="hero__subheading">{SLIDES[current].subheading}</h2>
          <p className="hero__description">
            {SLIDES[current].description.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </p>

          {/* — SHOP NOW — */}
          <div className="hero__cta-wrap">
            <span className="hero__cta-line" aria-hidden="true" />
            <Link
              id={`hero-cta-${SLIDES[current].id}`}
              to={SLIDES[current].ctaLink}
              className="hero__cta"
            >
              Shop Now
            </Link>
            <span className="hero__cta-line" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* ---- Dots ---- */}
      <div className="hero__dots" role="tablist" aria-label="Slide navigation">
        {SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            id={`hero-dot-${slide.id}`}
            className={`hero__dot${idx === current ? ' hero__dot--active' : ''}`}
            role="tab"
            aria-selected={idx === current}
            aria-label={`Slide ${idx + 1}: ${slide.heading}`}
            onClick={() => goTo(idx)}
            type="button"
          />
        ))}
      </div>
    </section>
  );
}

export default HeroSection;
