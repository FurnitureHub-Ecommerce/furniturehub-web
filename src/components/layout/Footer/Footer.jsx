import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Footer.css';

export function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      {/* Top Newsletter Section */}
      <div className="footer__newsletter">
        <div className="container footer__newsletter-inner">
          <div className="footer__newsletter-content">
            <span className="footer__newsletter-tag">Bản Tin LUMORA Atelier</span>
            <h3 className="footer__newsletter-title">Đăng Ký Nhận Xem Trước & Ghi Chép Thiết Kế</h3>
            <p className="footer__newsletter-desc">
              Nhận bộ sưu tập theo mùa, thư mời thương mại và quyền truy cập sớm độc quyền các sản phẩm thủ công giới hạn.
            </p>
          </div>
          <form className="footer__newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <div className="footer__input-wrap">
              <input
                type="email"
                placeholder="Nhập địa chỉ email của bạn"
                required
                aria-label="Địa chỉ email để đăng ký bản tin"
              />
              <button type="submit" aria-label="Đăng ký nhận bản tin">
                <span>Đăng Ký</span>
                <ArrowRight size={16} />
              </button>
            </div>
            <span className="footer__disclaimer">
              Bằng cách đăng ký, bạn đồng ý với Chính Sách Bảo Mật của chúng tôi. Hủy đăng ký bất cứ lúc nào.
            </span>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="footer__main">
        <div className="container footer__main-grid">
          {/* Brand Info */}
          <div className="footer__col footer__col--brand">
            <Link to="/" className="footer__logo">
              <span className="footer__logo-name">LUMORA</span>
              <span className="footer__logo-sub">STUDIO</span>
            </Link>
            <p className="footer__brand-desc">
              Nội thất cao cấp hiện đại được chế tác với tư duy kiến trúc, kết cấu gỗ mộc tự nhiên và chủ nghĩa tối giản tinh tế. Được thiết kế cho sự bền vững trường tồn.
            </p>
            <div className="footer__socials">
              <a href="https://www.instagram.com/zi_dht?obrf=MXFtZ3p0YndrYWZ3MQ==" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://www.facebook.com/beaimini" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 1: Collections */}
          <div className="footer__col">
            <h4 className="footer__heading">Bộ Sưu Tập</h4>
            <ul className="footer__list">
              <li><Link to="/products" style={{ fontWeight: '600', color: '#FFF' }}>Tất Cả Sản Phẩm</Link></li>
              <li><Link to="/category/living-room">Không Gian Wabi-Sabi</Link></li>
              <li><Link to="/category/dining-room">Phòng Ăn Solace</Link></li>
              <li><Link to="/category/bedroom">Thiền Viện Bắc Âu</Link></li>
              <li><Link to="/category/studio-office">Studio Kiến Trúc</Link></li>
              <li><Link to="/category/lighting-decor">Đèn & Đồ Trang Trí</Link></li>
            </ul>
          </div>

          {/* Column 2: Client Care */}
          <div className="footer__col">
            <h4 className="footer__heading">Chăm Sóc Khách Hàng</h4>
            <ul className="footer__list">
              <li><a href="#concierge">Dịch Vụ Concierge Cao Cấp</a></li>
              <li><a href="#custom">Mẫu Vải Tùy Chỉnh</a></li>
              <li><a href="#warranty">Chi Tiết Bảo Hành 10 Năm</a></li>
              <li><a href="#shipping">Vận Chuyển & Bù Đắp Carbon</a></li>
              <li><a href="#trade">Đăng Ký Chương Trình Đối Tác</a></li>
            </ul>
          </div>

          {/* Column 3: Showrooms */}
          <div className="footer__col">
            <h4 className="footer__heading">Cửa Hàng Trưng Bày</h4>
            <div className="footer__address">
              <p><strong>Kyoto Studio:</strong> Quận Gion, Higashiyama, Kyoto 605-0074</p>
              <p><strong>New York Flagship:</strong> 452 Broome St, SoHo, NY 10013</p>
              <p><strong>Copenhagen:</strong> Store Kongensgade 48, 1264 København</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {new Date().getFullYear()} LUMORA Studio Inc. Bảo lưu mọi quyền.</p>
          <div className="footer__bottom-links">
            <Link to="/privacy">Chính Sách Bảo Mật</Link>
            <Link to="/terms">Điều Khoản Chế Tác</Link>
            <Link to="/collections">Bộ Sưu Tập</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;