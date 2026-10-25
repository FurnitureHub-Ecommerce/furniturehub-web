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
  ChevronDown,
} from "lucide-react";
import { useShop } from "../../../context/ShopContext";
import { categoryAPI } from "../../../services/api";
import "./Header.css";
import logoImg from "../../../assets/images/logo.jpg";

const CATEGORY_TRANSLATIONS = {
  "Home Decor & Lighting": "Trang Trí & Đèn",
  "TV Units & Media": "Kệ Tivi & Giải Trí",
  "Bookshelves & Shelving": "Kệ Sách & Tủ Kệ",
  "Coffee & Side Tables": "Bàn Trà & Bàn Góc",
  "Wardrobes & Cabinets": "Tủ Quần Áo & Tủ Lớn",
  "Office Desks & Chairs": "Bàn Ghế Làm Việc",
  "Dining Tables & Chairs": "Bàn Ghế Ăn",
  "Beds & Mattresses": "Giường Ngủ & Nệm",
  "Sofa & Armchair": "Sofa & Ghế Thư Giãn",
};

export function Header() {
  const { cartCount, wishlistCount, setIsSearchOpen, setIsCartOpen } =
    useShop();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  // Trạng thái tài khoản khách hàng
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

  // Gọi API lấy danh mục từ Backend
  useEffect(() => {
    let isMounted = true;
    async function fetchCategories() {
      try {
        const res =
          (await categoryAPI.getCategories?.()) ||
          (await fetch("/api/categories").then((r) => r.json()));
        const list = res?.data?.categories || res?.data || res || [];
        if (Array.isArray(list) && isMounted) {
          setCategories(list);
        }
      } catch (err) {
        console.warn("Không thể tải danh mục:", err);
      }
    }
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setUserDropdownOpen(false);
    navigate("/");
  };

  const handleNavClick = (to) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileOpen(false);
    setMegaMenuOpen(false);
    navigate(to);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const userInitial = currentUser?.name
    ? currentUser.name.charAt(0).toUpperCase()
    : "V";

  return (
    <>
      {/* Top Banner Announcement */}
      <div className="header__topbar">
        <div className="container-fluid header__topbar-inner">
          <div className="header__topbar-marquee">
            <div className="header__topbar-track">
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
          {/* 1. LOGO BÊN TRÁI */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              className="header__mobile-toggle"
              onClick={() => setMobileOpen((prev) => !prev)}
              type="button"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="header__logo flex items-center shrink-0"
            >
              <img src={logoImg} alt="LUMORA" className="header__logo-img" />
            </Link>
          </div>

          {/* 2. PHẦN GIỮA: GỌN GÀNG VỚI MEGA MENU */}
          <nav className="header__nav hidden lg:flex shrink min-w-0 mx-4">
            <ul className="header__nav-list flex items-center gap-8 flex-nowrap">
              <li className="header__nav-item">
                <button
                  type="button"
                  onClick={() => handleNavClick("/")}
                  className={`header__nav-link bg-transparent border-none cursor-pointer ${pathname === "/" ? "header__nav-link--active" : ""}`}
                >
                  Trang Chủ
                </button>
              </li>

              <li
                className="header__nav-item header__nav-item--dropdown"
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => handleNavClick("/products")}
                  className={`header__nav-link bg-transparent border-none cursor-pointer flex items-center gap-1.5 ${pathname.startsWith("/products") || pathname.startsWith("/category") ? "header__nav-link--active" : ""}`}
                >
                  Bộ Sưu Tập <ChevronDown size={14} />
                </button>

                <div
                  className={`header__megamenu ${megaMenuOpen ? "header__megamenu--open" : ""}`}
                >
                  <div className="header__megamenu-column">
                    <h4>Không Gian Sống</h4>
                    <ul className="header__megamenu-list">
                      {categories.slice(0, 5).map((cat) => {
                        const translatedName =
                          CATEGORY_TRANSLATIONS[cat.name] || cat.name;
                        return (
                          <li key={cat._id || cat.id}>
                            <Link
                              to={`/category/${cat._id || cat.id}`}
                              className="header__megamenu-link"
                              onClick={() => {
                                setMegaMenuOpen(false);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                            >
                              {translatedName}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="header__megamenu-column">
                    <h4>Nội Thất & Trang Trí</h4>
                    <ul className="header__megamenu-list">
                      {categories.slice(5).map((cat) => {
                        const translatedName =
                          CATEGORY_TRANSLATIONS[cat.name] || cat.name;
                        return (
                          <li key={cat._id || cat.id}>
                            <Link
                              to={`/category/${cat._id || cat.id}`}
                              className="header__megamenu-link"
                              onClick={() => {
                                setMegaMenuOpen(false);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                            >
                              {translatedName}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          </nav>

          {/* 3. PHẦN BÊN PHẢI (ACTIONS & USER) */}
          <div className="header__actions flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              className="header__action-btn"
              type="button"
              onClick={() => setIsSearchOpen(true)}
              title="Tìm kiếm"
            >
              <Search size={19} />
            </button>
            <button
              className="header__action-btn hidden sm:flex"
              type="button"
              onClick={() => navigate("/wishlist")}
              title="Yêu thích"
            >
              <Heart size={19} />
              {wishlistCount > 0 && (
                <span className="header__badge">{wishlistCount}</span>
              )}
            </button>
            <button
              className="header__action-btn"
              type="button"
              onClick={() => setIsCartOpen(true)}
              title="Giỏ hàng"
            >
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span className="header__badge">{cartCount}</span>
              )}
            </button>

            <div
              className="header__user-menu-wrapper relative ml-1"
              ref={dropdownRef}
            >
              {currentUser ? (
                <>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 py-1.5 px-3 rounded-full border border-gray-200 bg-white hover:border-gray-300 transition cursor-pointer"
                    type="button"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#8A6A48] text-white flex items-center justify-center font-semibold text-xs shadow-sm">
                      {userInitial}
                    </div>
                    <span className="text-xs font-medium text-gray-800 max-w-25 truncate hidden sm:inline">
                      {currentUser.name}
                    </span>
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-xs text-gray-400">
                          Tài khoản của bạn
                        </p>
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {currentUser.name}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                      >
                        <User size={15} className="text-gray-500" /> Hồ sơ cá
                        nhân
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Package size={15} className="text-gray-500" /> Đơn hàng
                        của tôi
                      </Link>
                      <Link
                        to="/addresses"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                      >
                        <MapPin size={15} className="text-gray-500" /> Sổ địa
                        chỉ giao hàng
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:pl-5 transition-all duration-200 text-left active:scale-[0.98]"
                        type="button"
                      >
                        <LogOut
                          size={15}
                          className="transition-transform duration-200 group-hover:rotate-12"
                        />{" "}
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 py-1.5 px-3.5 rounded-full border border-[#8A6A48] text-[#8A6A48] hover:bg-[#8A6A48] hover:text-white transition text-xs font-semibold uppercase tracking-wider"
                >
                  <User size={14} /> Đăng Nhập
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
