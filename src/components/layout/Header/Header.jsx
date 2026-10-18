import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  User,
  LogOut,
  MapPin,
  Package,
} from "lucide-react";
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
  const { cartCount, wishlistCount, setIsSearchOpen, setIsCartOpen } =
    useShop();

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
        <div className="container-fluid header__topbar-inner">
          {" "}
          {/* Dùng container-fluid nếu muốn rộng hết màn hình */}
          <div className="header__topbar-marquee">
            <div className="header__topbar-track">
              {/* Nhóm nội dung */}
              <span className="header__topbar-text">
                <span>
                  Miễn Phí Giao Hàng Cao Cấp & Lắp Ráp Cho Đơn Hàng Trên
                  5.000.000 ₫
                </span>
                <span className="header__topbar-divider">•</span>
                <span className="header__topbar-highlight">
                  Gỗ Bền Vững Đạt Chuẩn FSC®
                </span>
                <span className="header__topbar-divider">•</span>
                <span>Bảo Hành Chính Hãng 2 Năm</span>
                <span className="header__topbar-divider">•</span>
                <span className="header__topbar-highlight">
                  Đổi Trả Miễn Phí Trong 30 Ngày
                </span>
              </span>

              {/* Lặp lại nhóm nội dung để tạo vòng lặp vô tận mượt mà */}
              <span className="header__topbar-text">
                <span className="header__topbar-divider">•</span>
                <span>
                  Miễn Phí Giao Hàng Cao Cấp & Lắp Ráp Cho Đơn Hàng Trên
                  5.000.000 ₫
                </span>
                <span className="header__topbar-divider">•</span>
                <span className="header__topbar-highlight">
                  Gỗ Bền Vững Đạt Chuẩn FSC®
                </span>
                <span className="header__topbar-divider">•</span>
                <span>Bảo Hành Chính Hãng 2 Năm</span>
                <span className="header__topbar-divider">•</span>
                <span className="header__topbar-highlight">
                  Đổi Trả Miễn Phí Trong 30 Ngày
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`header ${scrolled ? "header--scrolled" : ""}`}
        role="banner"
      >
        <div className="header__inner flex items-center justify-between">
          {/* 1. Nhóm bên trái: Nút Menu Mobile & Logo Brand */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
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
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

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
          </div>

          {/* 2. Điều hướng chính giữa (Desktop Navigation) */}
          <nav
            className="header__nav hidden lg:flex shrink min-w-0 mx-4"
            aria-label="Điều Hướng Chính"
          >
            <ul className="header__nav-list flex items-center gap-5 xl:gap-8 flex-nowrap">
              {NAV_LINKS.map(({ label, to }) => {
                const isActive = pathname === to;
                return (
                  <li key={to} className="header__nav-item shrink-0">
                    <Link
                      to={to}
                      className={`header__nav-link whitespace-nowrap ${
                        isActive ? "header__nav-link--active" : ""
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 3. Nhóm tiện ích bên phải (Actions / Utilities) */}
          <div
            className="header__actions flex items-center gap-2 sm:gap-3 shrink-0"
            role="toolbar"
            aria-label="Tiện Ích Tiêu Đề"
          >
            {/* Nút Tìm kiếm */}
            <button
              id="header-search-btn"
              className="header__action-btn"
              aria-label="Tìm Kiếm Danh Mục"
              type="button"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search size={19} />
            </button>

            {/* Nút Yêu thích (Wishlist) */}
            <button
              id="header-wishlist-btn"
              className="header__action-btn shrink-0 hidden sm:flex"
              aria-label={`Sản phẩm yêu thích, ${wishlistCount} mục đã lưu`}
              type="button"
              onClick={() => navigate("/wishlist")}
            >
              <Heart size={19} />
              {wishlistCount > 0 && (
                <span className="header__badge" aria-hidden="true">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Giỏ hàng (Cart) */}
            <button
              id="header-cart-btn"
              className="header__action-btn header__cart-btn shrink-0"
              aria-label={`Giỏ hàng, ${cartCount} sản phẩm`}
              type="button"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span className="header__badge" aria-hidden="true">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Trạng thái User (Chưa login vs Đã login) */}
            {currentUser ? (
              <div
                ref={dropdownRef}
                className="flex items-center shrink-0 relative ml-1"
              >
                <button
                  id="header-user-btn"
                  className="header__user-logged-btn flex items-center gap-2.5 p-1.5 rounded-full transition-all duration-200 hover:bg-neutral-100 cursor-pointer border border-transparent hover:border-neutral-200"
                  aria-label="Tài khoản khách hàng"
                  aria-expanded={userDropdownOpen}
                  type="button"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                >
                  <div className="header__user-avatar shrink-0 w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-medium text-xs overflow-hidden shadow-sm">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name || currentUser.fullName || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="header__user-avatar-text">
                        {(currentUser.name ||
                          currentUser.fullName ||
                          currentUser.email ||
                          "C")[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="header__user-name hidden xl:inline-block font-medium text-xs tracking-wide text-neutral-800">
                    {currentUser.name ||
                      currentUser.fullName ||
                      currentUser.email?.split("@")[0] ||
                      "Khách Hàng"}
                  </span>
                </button>

                {/* Dropdown Menu cao cấp */}
                {userDropdownOpen && (
                  <div
                    className="header__user-dropdown animate-in fade-in zoom-in-95 duration-150 shadow-2xl rounded-xl border border-neutral-100 bg-white py-2 absolute right-0 top-full mt-2 w-64 z-50"
                    role="menu"
                  >
                    <div className="header__user-dropdown-header px-4 py-3 border-b border-neutral-100">
                      <p className="header__user-dropdown-name truncate font-semibold text-sm text-neutral-900">
                        {currentUser.name ||
                          currentUser.fullName ||
                          "Khách Hàng"}
                      </p>
                      <p className="header__user-dropdown-email truncate text-xs text-neutral-500 mt-0.5">
                        {currentUser.email || ""}
                      </p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-neutral-100 text-neutral-700 text-[10px] font-semibold tracking-wider uppercase rounded">
                        {currentUser.role || "CUSTOMER"}
                      </span>
                    </div>

                    <div className="header__user-dropdown-links py-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="header__user-dropdown-item flex items-center gap-3 px-4 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
                        role="menuitem"
                      >
                        <User size={15} className="text-neutral-500" />
                        <span>Hồ sơ cá nhân</span>
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="header__user-dropdown-item flex items-center gap-3 px-4 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
                        role="menuitem"
                      >
                        <Package size={15} className="text-neutral-500" />
                        <span>Đơn hàng của tôi</span>
                      </Link>
                      <Link
                        to="/addresses"
                        onClick={() => setUserDropdownOpen(false)}
                        className="header__user-dropdown-item flex items-center gap-3 px-4 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
                        role="menuitem"
                      >
                        <MapPin size={15} className="text-neutral-500" />
                        <span>Sổ địa chỉ nhận hàng</span>
                      </Link>
                      <Link
                        to="/cart"
                        onClick={() => setUserDropdownOpen(false)}
                        className="header__user-dropdown-item flex items-center gap-3 px-4 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
                        role="menuitem"
                      >
                        <ShoppingBag size={15} className="text-neutral-500" />
                        <span>Giỏ hàng của tôi</span>
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="header__user-dropdown-item flex items-center gap-3 px-4 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
                        role="menuitem"
                      >
                        <Heart size={15} className="text-neutral-500" />
                        <span>Sản phẩm yêu thích</span>
                      </Link>

                      {/* Quản trị / Nhân sự quyền hạn */}
                      {(currentUser.role?.toUpperCase() === "ADMIN" ||
                        currentUser.role?.toUpperCase() === "MANAGER") && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="header__user-dropdown-item flex items-center gap-3 px-4 py-2.5 text-xs text-amber-800 font-semibold hover:bg-amber-50/50 transition-colors"
                          role="menuitem"
                        >
                          <span>Quản trị hệ thống</span>
                        </Link>
                      )}
                      {currentUser.role?.toUpperCase() === "STAFF" && (
                        <Link
                          to="/staff"
                          onClick={() => setUserDropdownOpen(false)}
                          className="header__user-dropdown-item flex items-center gap-3 px-4 py-2.5 text-xs text-amber-800 font-semibold hover:bg-amber-50/50 transition-colors"
                          role="menuitem"
                        >
                          <span>Cổng Nhân viên</span>
                        </Link>
                      )}
                      {(currentUser.role?.toUpperCase() === "STORAGE" ||
                        currentUser.role?.toUpperCase() ===
                          "STORAGE_MANAGER") && (
                        <Link
                          to="/storage"
                          onClick={() => setUserDropdownOpen(false)}
                          className="header__user-dropdown-item flex items-center gap-3 px-4 py-2.5 text-xs text-amber-800 font-semibold hover:bg-amber-50/50 transition-colors"
                          role="menuitem"
                        >
                          <span>Quản lý kho</span>
                        </Link>
                      )}
                    </div>

                    <div className="header__user-dropdown-footer border-t border-neutral-100 pt-1 mt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="header__user-dropdown-logout flex items-center gap-3 w-full px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                        role="menuitem"
                      >
                        <LogOut size={15} />
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
                <User size={19} />
              </button>
            )}
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
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="header__logo"
                aria-label="Nội Thất Cao Cấp LUMORA - Trang Chủ"
              >
                <img
                  src={logoImg}
                  alt="Nội Thất Cao Cấp LUMORA"
                  className="header__logo-img header__logo-img--mobile"
                />
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
                      {
                        (currentUser.name ||
                          currentUser.fullName ||
                          currentUser.email ||
                          "C")[0]
                      }
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
