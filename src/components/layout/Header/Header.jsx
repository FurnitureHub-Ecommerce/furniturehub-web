import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingBag, Menu, X, User, LogOut } from "lucide-react";
import { useShop } from "../../../context/ShopContext";
import "./Header.css";
import logoImg from "../../../assets/images/logo.jpg";

const NAV_LINKS = [
  { label: "Trang Chủ", to: "/" },
  { label: "Bộ Sưu Tập", to: "/products" },
  { label: "Phòng Khách", to: "/category/living-room" },
  { label: "Phòng Ăn", to: "/category/dining-room" },
  { label: "Phòng Ngủ", to: "/category/bedroom" },
  { label: "Đèn & Trang Trí", to: "/category/lighting-decor" },
  { label: "Lookbook", to: "/lookbook" },
];

export function Header() {
  const {
    cartCount,
    wishlistCount,
    setIsSearchOpen,
    setIsCartOpen,
  } = useShop();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      return token && user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  });
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Đồng bộ trạng thái user khi đổi trang hoặc có storage event
  useEffect(() => {
    const syncUser = () => {
      try {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        setCurrentUser(token && user ? JSON.parse(user) : null);
      } catch {
        setCurrentUser(null);
      }
    };
    syncUser();

    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, [pathname]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userDropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setUserDropdownOpen(false);
    navigate("/login");
  };

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
              Miễn Phí Giao Hàng Cao Cấp & Lắp Ráp Cho Đơn Hàng Trên 5.000.000 ₫
            </span>
            <span className="header__topbar-divider">•</span>
            <span className="header__topbar-highlight">
              Gỗ Bền Vững Đạt Chuẩn FSC®
            </span>
          </p>
          <div className="header__topbar-links">
            <a href="#currency">VNĐ (₫)</a>
            <a href="#support">Hỗ Trợ</a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`header ${scrolled ? "header--scrolled" : ""}`}
        role="banner"
      >
        <div className="header__inner flex items-center justify-between">
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
            className="header__logo flex items-center shrink-0"
            aria-label="Nội Thất Cao Cấp LUMORA - Trang Chủ"
          >
            <img
              src={logoImg}
              alt="Nội Thất Cao Cấp LUMORA"
              className="header__logo-img"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="header__nav shrink min-w-0" aria-label="Điều Hướng Chính">
            <ul className="header__nav-list flex items-center gap-3 lg:gap-4 xl:gap-6 flex-nowrap">
              {NAV_LINKS.map(({ label, to }) => {
                const isActive = pathname === to;
                return (
                  <li key={to} className="header__nav-item shrink-0">
                    <Link
                      to={to}
                      className={`header__nav-link whitespace-nowrap ${isActive ? "header__nav-link--active" : ""}`}
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
            className="header__actions flex items-center gap-2.5 sm:gap-3.5 shrink-0"
            role="toolbar"
            aria-label="Tiện Ích Tiêu Đề"
          >
            <button
              id="header-search-btn"
              className="header__action-btn"
              aria-label="Tìm Kiếm Danh Mục"
              type="button"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search size={20} />
            </button>

            {/* Trạng thái User (Chưa login vs Đã login) */}
            {currentUser ? (
              <div
                ref={dropdownRef}
                className="flex items-center gap-3 shrink-0 relative"
              >
                <button
                  id="header-user-btn"
                  className="header__user-logged-btn flex items-center gap-2 p-1 rounded-full transition-colors hover:bg-black/5 cursor-pointer"
                  aria-label="Tài khoản khách hàng"
                  aria-expanded={userDropdownOpen}
                  type="button"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                >
                  <div className="header__user-avatar shrink-0">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name || currentUser.fullName || "User"}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="header__user-avatar-text">
                        {(currentUser.name || currentUser.fullName || currentUser.email || "C")[0]}
                      </span>
                    )}
                  </div>
                  <span className="header__user-name hidden xl:inline-block">
                    {currentUser.name || currentUser.fullName || currentUser.email?.split("@")[0] || "Khách Hàng"}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="header__user-dropdown animate-in fade-in zoom-in-95 duration-150"
                    role="menu"
                  >
                    <div className="header__user-dropdown-header">
                      <p className="header__user-dropdown-name truncate">
                        {currentUser.name || currentUser.fullName || "Khách Hàng"}
                      </p>
                      <p className="header__user-dropdown-email truncate">
                        {currentUser.email || ""}
                      </p>
                      <span className="header__user-dropdown-badge">
                        {currentUser.role || "CUSTOMER"}
                      </span>
                    </div>

                    <div className="header__user-dropdown-links">
                      <Link
                        to="/cart"
                        onClick={() => setUserDropdownOpen(false)}
                        className="header__user-dropdown-item"
                        role="menuitem"
                      >
                        <ShoppingBag size={14} />
                        <span>Giỏ hàng của tôi</span>
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="header__user-dropdown-item"
                        role="menuitem"
                      >
                        <Heart size={14} />
                        <span>Sản phẩm yêu thích</span>
                      </Link>
                      {(currentUser.role?.toUpperCase() === "ADMIN" || currentUser.role?.toUpperCase() === "MANAGER") && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="header__user-dropdown-item text-amber-800 font-semibold"
                          role="menuitem"
                        >
                          <span>Quản trị hệ thống</span>
                        </Link>
                      )}
                      {currentUser.role?.toUpperCase() === "STAFF" && (
                        <Link
                          to="/staff"
                          onClick={() => setUserDropdownOpen(false)}
                          className="header__user-dropdown-item text-amber-800 font-semibold"
                          role="menuitem"
                        >
                          <span>Cổng Nhân viên</span>
                        </Link>
                      )}
                      {(currentUser.role?.toUpperCase() === "STORAGE" || currentUser.role?.toUpperCase() === "STORAGE_MANAGER") && (
                        <Link
                          to="/storage"
                          onClick={() => setUserDropdownOpen(false)}
                          className="header__user-dropdown-item text-amber-800 font-semibold"
                          role="menuitem"
                        >
                          <span>Quản lý kho</span>
                        </Link>
                      )}
                    </div>

                    <div className="header__user-dropdown-footer">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="header__user-dropdown-logout"
                        role="menuitem"
                      >
                        <LogOut size={14} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-user-btn"
                className="header__action-btn header__user-btn shrink-0"
                aria-label="Tài Khoản Khách Hàng"
                type="button"
                onClick={() => navigate("/login")}
              >
                <User size={20} />
              </button>
            )}

            <button
              id="header-wishlist-btn"
              className="header__action-btn shrink-0"
              aria-label={`Sản phẩm yêu thích, ${wishlistCount} mục đã lưu`}
              type="button"
              onClick={() => navigate("/wishlist")}
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
              className="header__action-btn header__cart-btn shrink-0"
              aria-label={`Giỏ hàng, ${cartCount} sản phẩm`}
              type="button"
              onClick={() => setIsCartOpen(true)}
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

            {/* Mobile User Section */}
            {currentUser && (
              <div className="header__mobile-user-card">
                <div className="header__user-avatar shrink-0">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name || "User"}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="header__user-avatar-text">
                      {(currentUser.name || currentUser.fullName || currentUser.email || "C")[0]}
                    </span>
                  )}
                </div>
                <div className="header__mobile-user-info truncate">
                  <p className="font-semibold text-sm text-neutral-800 truncate">
                    {currentUser.name || currentUser.fullName || "Khách Hàng"}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">
                    {currentUser.email || ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="header__mobile-logout-btn"
                  title="Đăng xuất"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}

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