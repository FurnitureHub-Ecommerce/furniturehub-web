import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpg";
import {
  LayoutDashboard, ChartNoAxesCombined, Users, ShieldCheck, Sofa,
  SlidersHorizontal, Folder, DraftingCompass, Menu, X, Search, Bell, User, LogOut,
} from "lucide-react";
import "./AdminLayout.css";

const navigation = [
  {
    label: "DASHBOARD & GOVERNANCE",
    items: [
      [LayoutDashboard, "Executive Dashboard", "/admin/dashboard"],
      [ChartNoAxesCombined, "Thống Kê & Phân Tích", "/admin/analytics"],
    ],
  },
  {
    label: "NGƯỜI DÙNG & PHÂN QUYỀN (RBAC)",
    items: [
      [Users, "Quản Lý Người Dùng", "/admin/users"],
      [ShieldCheck, "Ma Trận Phân Quyền & Vai Trò", "/admin/roles"],
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

  // Trang chi tiết dùng mục cha hiện có, không tạo thêm route hoặc mục menu.
  const activePath = pathname.replace(/\/+$/, "") || "/";
  function isCurrent(to) {
    return activePath === to
      || (to === "/admin/dashboard" && activePath === "/admin")
      || (to === "/admin/monitoring" && activePath.startsWith("/admin/orders/"))
      || (to === "/admin/variants" && activePath.startsWith("/admin/inventory/"));
  }

  return (
    <div className="lumora-admin">
      {open && <button type="button" className="la-backdrop" tabIndex={-1}
        aria-label="Đóng menu quản trị" onClick={closeMenu} />}
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
          <div>SYSTEM HEALTH <span>Chưa tích hợp</span></div>
          <div>Database Sync <span>Chưa tích hợp</span></div>
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
          <div className="la-governance">GOVERNANCE<br />&amp; OPERATOR CORE</div>
          <div className="la-role-tabs" aria-label="Không gian vai trò">
            {["Customer", "Staff", "Storage", "Admin"].map((role) => (
              <button type="button" key={role} disabled
                className={role === "Admin" ? "la-role-active" : ""}
                title="Chưa triển khai chuyển vai trò">{role}</button>
            ))}
          </div>
          <label className="la-search" title="Tìm kiếm chưa tích hợp">
            <Search size={17} />
            <input disabled aria-label="Tìm kiếm chưa tích hợp"
              placeholder="Search catalog, SKUs, logs..." />
            <kbd>⌘K</kbd>
          </label>
          <span className="la-live">LIVE PING:<br />Chưa tích hợp</span>
          <button type="button" disabled className="la-bell"
            title="Thông báo chưa tích hợp" aria-label="Thông báo chưa tích hợp">
            <Bell size={18} />
          </button>
          <div className="la-profile">{userName}<small>{userRole}</small></div>
          <span className="la-avatar-slot" aria-hidden="true"><User size={18} /></span>
        </header>
        <main className="la-content"><Outlet /></main>
      </div>
    </div>
  );
}
