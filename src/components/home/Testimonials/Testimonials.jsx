import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, CheckCircle2 } from 'lucide-react';
import { TESTIMONIALS } from '../../../data/lumoraData';
import Rating from '../../common/Rating/Rating';
import './Testimonials.css';

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[activeIndex];

  return (
    <section className="section testimonials-section" aria-label="Đánh giá khách hàng">
      <div className="container">
        <div className="section-heading">
          <span className="section-heading__badge">Ngôi nhà & Nhà sưu tập</span>
          <h2 className="section-heading__title">Giọng nói của LUMORA</h2>
        </div>

        <div className="testimonials__card">
          <Quote className="testimonials__quote-icon" size={48} />

          <div className="testimonials__content">
            <Rating score={current.rating} size={18} />

            <blockquote className="testimonials__quote">
              "{current.quote}"
            </blockquote>

            <div className="testimonials__author-box">
              <img
                src={current.avatar}
                alt={current.author}
                className="testimonials__avatar"
              />
              <div className="testimonials__author-info">
                <div className="testimonials__name-row">
                  <span className="testimonials__author-name">{current.author}</span>
                  {current.verified && (
                    <span className="testimonials__verified-badge">
                      <CheckCircle2 size={13} />
                      Nhà sưu tập xác thực
                    </span>
                  )}
                </div>
                <span className="testimonials__author-role">{current.role}</span>
                <span className="testimonials__author-location">{current.location}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="testimonials__controls">
            <button
              className="testimonials__arrow-btn"
              onClick={handlePrev}
              aria-label="Đánh giá trước"
              type="button"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="testimonials__dots">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  className={`testimonials__dot ${idx === activeIndex ? 'testimonials__dot--active' : ''}`}
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Đi tới đánh giá ${idx + 1}`}
                  type="button"
                />
              ))}
            </div>

            <button
              className="testimonials__arrow-btn"
              onClick={handleNext}
              aria-label="Đánh giá tiếp theo"
              type="button"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
