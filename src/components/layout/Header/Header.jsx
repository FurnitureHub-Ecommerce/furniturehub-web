import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Heart, ShoppingBag, Menu, X, User } from "lucide-react";
import "./Header.css";
import logoImg from "../../../assets/images/logo.jpg";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Collections", to: "/collections" },
  { label: "Living", to: "/category/living-room" },
  { label: "Dining", to: "/category/dining-room" },
  { label: "Bedroom", to: "/category/bedroom" },
  { label: "Lighting & Decor", to: "/category/lighting-decor" },
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
              Complimentary White-Glove Delivery & Assembly on Orders Over
              $2,000
            </span>
            <span className="header__topbar-divider">•</span>
            <span className="header__topbar-highlight">
              FSC® Certified Sustainable Timber
            </span>
          </p>
          <div className="header__topbar-links">
            <a href="#currency">USD ($)</a>
            <a href="#support">Concierge</a>
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
              mobileOpen ? "Close Navigation Menu" : "Open Navigation Menu"
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
            aria-label="LUMORA Luxury Furniture - Home"
          >
            <img
              src={logoImg}
              alt="LUMORA Luxury Furniture"
              className="header__logo-img"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="header__nav" aria-label="Main Navigation">
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
            aria-label="Header Utilities"
          >
            <button
              id="header-search-btn"
              className="header__action-btn"
              aria-label="Search Catalog"
              type="button"
            >
              <Search size={20} />
            </button>

            <button
              id="header-user-btn"
              className="header__action-btn header__user-btn"
              aria-label="Customer Account"
              type="button"
            >
              <User size={20} />
            </button>

            <button
              id="header-wishlist-btn"
              className="header__action-btn"
              aria-label={`Wishlist, ${wishlistCount} saved items`}
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
              aria-label={`Shopping Bag, ${cartCount} items`}
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
            aria-label="Mobile Menu"
          >
            <div className="header__mobile-drawer-header">
              <Link to="/" onClick={() => setMobileOpen(false)} className="header__logo" aria-label="LUMORA Luxury Furniture - Home">
                <img src={logoImg} alt="LUMORA Luxury Furniture" className="header__logo-img header__logo-img--mobile" />
              </Link>
              <button
                className="header__mobile-close"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
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
              <p>Need Design Assistance?</p>
              <a href="tel:+18005866721" className="header__mobile-phone">
                +1 (800) 586-6721
              </a>
              <span className="header__mobile-hours">
                Mon - Sat: 9:00 AM - 6:00 PM EST
              </span>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

export default Header;
