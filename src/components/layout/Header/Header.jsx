import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Heart, ShoppingBag, Menu, X, User } from "lucide-react";
import "./Header.css";
import logoImg from "../../../assets/images/logo.jpg";

const NAV_LINKS = [
  { label: "Trang Chủ", to: "/" },
  { label: "Bộ Sưu Tập", to: "/collections" },
  { label: "Phòng Khách", to: "/category/living-room" },
  { label: "Phòng Ăn", to: "/category/dining-room" },
  { label: "Phòng Ngủ", to: "/category/bedroom" },
  { label: "Đèn & Trang Trí", to: "/category/lighting-decor" },
  { label: "Lookbook", to: "/lookbook" },
];

export function Header({ wishlistCount = 2, cartCount = 3 }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Banner Announcement */}
      <div className="header__topbar">
        <div className="container header__topbar-inner">
          <p className="header__topbar-text">
            <span>
              Miễn Phí Giao Hàng Cao Cấp & Lắp Ráp Cho Đơn Hàng Trên
              $2,000
            </span>
            <span className="header__topbar-divider">•</span>
            <span className="header__topbar-highlight">
              Gỗ Bền Vững Đạt Chuẩn FSC®
            </span>
          </p>
          <div className="header__topbar-links">
            <a href="#currency">USD ($)</a>
            <a href="#support">Hỗ Trợ</a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`header ${scrolled ? "header--scrolled" : ""}`}
        role="banner"
      >
        <div className="container header__inner">
          {/* Mobile Menu Toggle */}
          <button
            id="header-mobile-toggle"
            className="header__mobile-toggle"
            aria-label={
              mobileOpen ? "Đóng Menu Điều Hướng" : "Mở Menu Điều Hướng"
            }
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            type="button"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Brand Logo */}
          <Link
            to="/"
            className="header__logo"
            aria-label="Nội Thất Cao Cấp LUMORA - Trang Chủ"
          >
            <img
              src={logoImg}
              alt="Nội Thất Cao Cấp LUMORA"
              className="header__logo-img"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="header__nav" aria-label="Điều Hướng Chính">
            <ul className="header__nav-list">
              {NAV_LINKS.map(({ label, to }) => {
                const isActive = pathname === to;
                return (
                  <li key={to} className="header__nav-item">
                    <Link
                      to={to}
                      className={`header__nav-link ${isActive ? "header__nav-link--active" : ""}`}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right Utilities */}
          <div
            className="header__actions"
            role="toolbar"
            aria-label="Tiện Ích Tiêu Đề"
          >
            <button
              id="header-search-btn"
              className="header__action-btn"
              aria-label="Tìm Kiếm Danh Mục"
              type="button"
            >
              <Search size={20} />
            </button>

            <button
              id="header-user-btn"
              className="header__action-btn header__user-btn"
              aria-label="Tài Khoản Khách Hàng"
              type="button"
            >
              <User size={20} />
            </button>

            <button
              id="header-wishlist-btn"
              className="header__action-btn"
              aria-label={`Sản phẩm yêu thích, ${wishlistCount} mục đã lưu`}
              type="button"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="header__badge" aria-hidden="true">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              id="header-cart-btn"
              className="header__action-btn header__cart-btn"
              aria-label={`Giỏ hàng, ${cartCount} sản phẩm`}
              type="button"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="header__badge" aria-hidden="true">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div
          className="header__mobile-overlay"
          onClick={() => setMobileOpen(false)}
        >
          <nav
            id="header-mobile-drawer"
            className="header__mobile-drawer"
            onClick={(e) => e.stopPropagation()}
            aria-label="Menu Di Động"
          >
            <div className="header__mobile-drawer-header">
              <Link to="/" onClick={() => setMobileOpen(false)} className="header__logo" aria-label="Nội Thất Cao Cấp LUMORA - Trang Chủ">
                <img src={logoImg} alt="Nội Thất Cao Cấp LUMORA" className="header__logo-img header__logo-img--mobile" />
              </Link>
              <button
                className="header__mobile-close"
                onClick={() => setMobileOpen(false)}
                aria-label="Đóng menu"
              >
                <X size={22} />
              </button>
            </div>
            <ul className="header__mobile-nav-list">
              {NAV_LINKS.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="header__mobile-nav-link"
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="header__mobile-drawer-footer">
              <p>Bạn Cần Tư Vấn Thiết Kế?</p>
              <a href="tel:+18005866721" className="header__mobile-phone">
                +1 (800) 586-6721
              </a>
              <span className="header__mobile-hours">
                Thứ Hai - Thứ Bảy: 9:00 AM - 6:00 PM EST
              </span>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

export default Header;