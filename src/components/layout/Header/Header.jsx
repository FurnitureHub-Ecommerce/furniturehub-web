import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingCart,
  AlignJustify,
  X,
} from 'lucide-react';
import './Header.css';

const NAV_LINKS = [
  { label: 'Home',     to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Blog',     to: '/blog' },
  { label: 'Pages',    to: '/pages',   hasDropdown: true },
  { label: 'About',    to: '/about' },
  { label: 'Contact',  to: '/contact' },
];

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  // Mock counts – will be replaced by context later
  const wishlistCount = 2;
  const cartCount = 3;

  return (
    <>
      <header className="header" role="banner">
        <div className="header__inner">

          {/* ---- Logo ---- */}
          <Link to="/" className="header__logo" aria-label="Schön – Home">
            <span className="header__logo-text">schön</span>
            <span className="header__logo-dot" aria-hidden="true">.</span>
          </Link>

          {/* ---- Desktop Nav ---- */}
          <nav className="header__nav" aria-label="Primary navigation">
            <ul className="header__nav-list" role="list">
              {NAV_LINKS.map(({ label, to, hasDropdown }) => (
                <li key={to} className="header__nav-item">
                  <Link
                    to={to}
                    className={[
                      'header__nav-link',
                      hasDropdown ? 'header__nav-link--has-dropdown' : '',
                      pathname === to ? 'active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ---- Right Actions ---- */}
          <div className="header__actions" role="toolbar" aria-label="Header actions">
            {/* Search */}
            <button
              id="header-search-btn"
              className="header__action-btn"
              aria-label="Search"
              type="button"
            >
              <Search />
            </button>

            {/* Wishlist */}
            <button
              id="header-wishlist-btn"
              className="header__action-btn"
              aria-label={`Wishlist – ${wishlistCount} items`}
              type="button"
            >
              {/* fill="none" prevents Lucide v1.43 from filling the heart red */}
              <Heart fill="none" />
              {wishlistCount > 0 && (
                <span className="header__badge" aria-hidden="true">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              id="header-cart-btn"
              className="header__action-btn"
              aria-label={`Cart – ${cartCount} items`}
              type="button"
            >
              <ShoppingCart />
              {cartCount > 0 && (
                <span className="header__badge" aria-hidden="true">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="header-mobile-menu-btn"
              className="header__menu-toggle header__action-btn"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="header-mobile-nav"
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X /> : <AlignJustify />}
            </button>
          </div>

        </div>
      </header>

      {/* ---- Mobile Drawer ---- */}
      <nav
        id="header-mobile-nav"
        className={`header__mobile-nav${mobileOpen ? ' open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
      >
        <ul className="header__mobile-nav-list" role="list">
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
      </nav>
    </>
  );
}

export default Header;
