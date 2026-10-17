import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpg";
import {
  LayoutDashboard, ChartNoAxesCombined, Users, Sofa,
  SlidersHorizontal, Folder, DraftingCompass, Menu, X, User, LogOut,
} from "lucide-react";
import "./AdminLayout.css";

const navigation = [
  {
    label: "DASHBOARD & GOVERNANCE",
    items: [
      [LayoutDashboard, "Executive Dashboard", "/admin/dashboard"],
    ],
  },
  {
    label: "NGƯỜI DÙNG",
    items: [
      [Users, "Quản Lý Người Dùng", "/admin/users"],
    ],
  },
  {
    label: "QUẢN TRỊ DANH MỤC (CATALOG)",
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

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const drawer = useRef(null);
  const trigger = useRef(null);
  const content = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function closeMenu() {
    setOpen(false);
    requestAnimationFrame(() => {
      if (trigger.current?.getClientRects().length) trigger.current.focus();
    });
  }

  useEffect(() => {
    if (!open) return;
    const element = drawer.current;
    element.querySelector("button")?.focus();
    function keyboard(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
      if (event.key === "Tab") {
        const controls = [...element.querySelectorAll("button:not(:disabled), a[href]")]
          .filter((control) => control.getClientRects().length);
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    element.addEventListener("keydown", keyboard);
    return () => element.removeEventListener("keydown", keyboard);
  }, [open]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1280px)");
    function desktopChanged(event) {
      // Bỏ inert khi chuyển sang desktop và chuyển focus khỏi nút đóng bị ẩn.
      if (event.matches) {
        const closeFocused = document.activeElement?.classList.contains("la-drawer-close");
        setOpen(false);
        if (closeFocused) drawer.current?.querySelector("a")?.focus();
      }
    }
    media.addEventListener("change", desktopChanged);
    return () => media.removeEventListener("change", desktopChanged);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    // Layout chỉ hiển thị phiên; ProtectedRoute vẫn chịu trách nhiệm xác thực.
  }
  const userName = sessionText(storedUser?.fullName)
    || sessionText(storedUser?.name) || "Tài khoản";
  const userRole = sessionText(storedUser?.role) || "Chưa có thông tin vai trò";

  // Trang chi tiết Inventory dùng mục cha hiện có.
  const activePath = pathname.replace(/\/+$/, "") || "/";
  function isCurrent(to) {
    return activePath === to
      || (to === "/admin/dashboard" && activePath === "/admin")
      || (to === "/admin/variants" && activePath.startsWith("/admin/inventory/"));
  }

  const currentPage = navigation.flatMap((group) => group.items)
    .find(([, , to]) => isCurrent(to));
  const currentPageLabel = currentPage?.[1] || "Không Gian Quản Trị";

  useLayoutEffect(() => {
    const element = content.current;
    if (!element) return;
    // Khởi động lại entrance của nội dung mà không remount trang hoặc reset dữ liệu.
    element.classList.remove("la-content-route-enter");
    void element.offsetWidth;
    element.classList.add("la-content-route-enter");
  }, [pathname]);

  return (
    <div className="lumora-admin">
      <button type="button" className={`la-backdrop ${open ? "la-backdrop-open" : ""}`}
        tabIndex={-1} aria-hidden={!open} aria-label="Đóng menu quản trị"
        onClick={closeMenu} />
      <aside ref={drawer} id="la-admin-navigation"
        className={`la-sidebar ${open ? "la-sidebar-open" : ""}`}
        role={open ? "dialog" : undefined} aria-modal={open ? true : undefined}
        aria-label="Điều hướng Admin">
        <button type="button" className="la-drawer-close" onClick={closeMenu}
          aria-label="Đóng menu quản trị"><X size={20} /></button>
        <div className="la-brand">
          <img className="la-logo-slot" src={logo} alt="Logo LUMORA" />
          <div>LUMORA<small>ATELIER<br />SYSTEMS</small></div>
        </div>
        <p className="la-portal">PORTAL / ENTERPRISE</p>
        <nav aria-label="Các trang quản trị">
          {navigation.map((group) => (
            <div className="la-nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map(([Icon, label, to]) => (
                <NavLink key={to} to={to} end
                  aria-current={isCurrent(to) ? "page" : undefined}
                  className={`la-nav-link ${isCurrent(to) ? "la-nav-active" : ""}`}
                  onClick={() => { if (open) closeMenu(); }}>
                  <Icon size={17} strokeWidth={1.7} />{label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="la-system">
          <button type="button" onClick={handleLogout}>
            <LogOut size={16} /> Đăng Xuất
          </button>
        </div>
      </aside>
      <div className="la-workspace" inert={open ? true : undefined}>
        <header className="la-header">
          <button ref={trigger} type="button" className="la-menu-toggle"
            onClick={() => setOpen(true)} aria-expanded={open}
            aria-controls="la-admin-navigation" aria-label="Mở menu quản trị">
            <Menu size={22} />
          </button>
          <div className="la-enterprise">LUMORA<br />ENTERPRISE</div>
          <div className="la-governance">
            <span>GOVERNANCE &amp; OPERATOR CORE</span>
            <strong>{currentPageLabel}</strong>
          </div>
          <div className="la-profile">{userName}<small>{userRole}</small></div>
          <span className="la-avatar-slot" aria-hidden="true"><User size={18} /></span>
        </header>
        <main ref={content} className="la-content" onAnimationEnd={event => {
          if (event.target === event.currentTarget && event.animationName === "lm-page-enter") {
            event.currentTarget.classList.remove("la-content-route-enter");
          }
        }}><Outlet /></main>
      </div>
    </div>
  );
}
