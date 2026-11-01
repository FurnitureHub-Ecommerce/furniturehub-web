import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, CheckCircle2, AlertCircle } from 'lucide-react';
import { TESTIMONIALS as DEFAULT_TESTIMONIALS } from '../../../data/lumoraData';
import Rating from '../../common/Rating/Rating';
import { reviewAPI } from '../../../services/api';
import './Testimonials.css';

export function Testimonials({ productId = null }) {
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!productId) return;

    const fetchReviews = async () => {
      try {
        const res = await reviewAPI.getProductReviews(productId);
        const reviewList = Array.isArray(res.data) ? res.data : res.data?.data || [];
        if (reviewList.length > 0) {
          const mappedReviews = reviewList.map((rev) => ({
            id: rev.id || rev._id,
            author: rev.user?.fullName || 'Khách hàng Lumora',
            role: 'Nhà sưu tập',
            location: 'Việt Nam',
            avatar: rev.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            rating: rev.rating || 5,
            quote: rev.comment || 'Sản phẩm hoàn thiện rất tỉ mỉ, chất lượng xuất sắc.',
            verified: true,
          }));
          setTestimonials(mappedReviews);
        }
      } catch (err) {
        console.warn('Lỗi lấy reviews:', err);
      }
    };

    fetchReviews();
  }, [productId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const current = testimonials[activeIndex] || DEFAULT_TESTIMONIALS[0];

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

          <div className="testimonials__controls">
            <button className="testimonials__arrow-btn" onClick={handlePrev} type="button">
              <ChevronLeft size={20} />
            </button>

            <div className="testimonials__dots">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  className={`testimonials__dot ${idx === activeIndex ? 'testimonials__dot--active' : ''}`}
                  onClick={() => setActiveIndex(idx)}
                  type="button"
                />
              ))}
            </div>

            <button className="testimonials__arrow-btn" onClick={handleNext} type="button">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;