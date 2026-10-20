import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpg";
import {
  LayoutDashboard,
  ChartNoAxesCombined,
  Users,
  Sofa,
  SlidersHorizontal,
  Folder,
  DraftingCompass,
  Menu,
  X,
  LogOut,
  Settings,
} from "lucide-react";
import "./AdminLayout.css";

const navigation = [
  {
    label: "TỔNG QUAN",
    items: [[LayoutDashboard, "Bảng điều khiển ", "/admin/dashboard"]],
  },
  {
    label: "NGƯỜI DÙNG",
    items: [[Users, "Quản Lý Người Dùng", "/admin/users"]],
  },
  {
    label: "QUẢN TRỊ DANH MỤC ",
    items: [
      [Sofa, "Quản Lý Sản Phẩm", "/admin/catalog"],
      [SlidersHorizontal, "Biến Thể & SKU", "/admin/variants"],
      [Folder, "Danh Mục & Bộ Sưu Tập", "/admin/categories"],
      [DraftingCompass, "Thương Hiệu & Xưởng Atelier", "/admin/brands"],
      [ChartNoAxesCombined, "Giám Sát Đơn Hàng & Tồn Kho", "/admin/monitoring"],
    ],
  },
];

function sessionText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getInitials(name) {
  if (!name) return "AD";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const drawer = useRef(null);
  const trigger = useRef(null);
  const content = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function closeMenu() {
    setOpen(false);
    requestAnimationFrame(() => {
      if (trigger.current?.getClientRects().length) trigger.current.focus();
    });
  }

  // Đóng popup menu profile khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const element = drawer.current;
    element.querySelector("button")?.focus();
    function keyboard(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        setShowDropdown(false);
      }
    }
    element.addEventListener("keydown", keyboard);
    return () => element.removeEventListener("keydown", keyboard);
  }, [open]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch {}

  const userName =
    sessionText(storedUser?.fullName) ||
    sessionText(storedUser?.name) ||
    "Administrator";
  const userRole = sessionText(storedUser?.role) || "QUẢN TRỊ VIÊN HỆ THỐNG";

  const activePath = pathname.replace(/\/+$/, "") || "/";
  function isCurrent(to) {
    return (
      activePath === to ||
      (to === "/admin/dashboard" && activePath === "/admin") ||
      (to === "/admin/variants" && activePath.startsWith("/admin/inventory/"))
    );
  }

  const currentPage = navigation
    .flatMap((group) => group.items)
    .find(([, , to]) => isCurrent(to));
  const currentPageLabel = currentPage?.[1] || "Không Gian Quản Trị";

  useLayoutEffect(() => {
    const element = content.current;
    if (!element) return;
    element.classList.remove("la-content-route-enter");
    void element.offsetWidth;
    element.classList.add("la-content-route-enter");
  }, [pathname]);

  return (
    <div className="lumora-admin">
      <button
        type="button"
        className={`la-backdrop ${open ? "la-backdrop-open" : ""}`}
        tabIndex={-1}
        aria-hidden={!open}
        aria-label="Đóng menu quản trị"
        onClick={closeMenu}
      />

      <aside
        ref={drawer}
        id="la-admin-navigation"
        className={`la-sidebar ${open ? "la-sidebar-open" : ""}`}
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        aria-label="Điều hướng Admin"
      >
        <button
          type="button"
          className="la-drawer-close"
          onClick={closeMenu}
          aria-label="Đóng menu quản trị"
        >
          <X size={18} />
        </button>

        {/* Logo */}
        {/* Logo Atelier */}
        <div className="brand-logo">
          <img src={logo} alt="LUMORA Atelier" />
        </div>

        {/* Navigation Links */}
        <nav className="la-nav-container" aria-label="Các trang quản trị">
          {navigation.map((group) => (
            <div className="la-nav-group" key={group.label}>
              <p className="la-nav-group-title">{group.label}</p>
              <div className="la-nav-items">
                {group.items.map(([Icon, label, to]) => (
                  <NavLink
                    key={to}
                    to={to}
                    end
                    aria-current={isCurrent(to) ? "page" : undefined}
                    className={`la-nav-link ${isCurrent(to) ? "la-nav-active" : ""}`}
                    onClick={() => {
                      if (open) closeMenu();
                    }}
                  >
                    <span className="la-nav-icon-wrap">
                      <Icon size={16} strokeWidth={1.8} />
                    </span>
                    <span className="la-nav-label">{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Profile Card ở đáy Sidebar (giống Staff) */}
        <div className="la-sidebar-footer" ref={dropdownRef}>
          {showDropdown && (
            <div className="la-profile-popup-menu">
              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false);
                  navigate("/admin/dashboard");
                }}
              >
                <Settings size={15} /> Cài Đặt Hệ Thống
              </button>
              <button
                type="button"
                className="la-logout-option"
                onClick={handleLogout}
              >
                <LogOut size={15} /> Đăng Xuất
              </button>
            </div>
          )}

          <div
            className="la-sidebar-profile-card"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            <div className="la-sidebar-avatar">{getInitials(userName)}</div>
            <div className="la-sidebar-user-info">
              <strong className="la-sidebar-name">{userName}</strong>
              <small className="la-sidebar-role">{userRole}</small>
            </div>
            <button
              type="button"
              className="la-sidebar-gear"
              aria-label="Tùy chọn tài khoản"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="la-workspace" inert={open ? true : undefined}>
        <main
          ref={content}
          className="la-content"
          onAnimationEnd={(event) => {
            if (
              event.target === event.currentTarget &&
              event.animationName === "lm-page-enter"
            ) {
              event.currentTarget.classList.remove("la-content-route-enter");
            }
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
