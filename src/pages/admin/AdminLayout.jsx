import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { getDashboard } from "../../services/admin/dashboard.service.js";
import logo from "../../assets/logo.jpg";
import {
  LayoutDashboard,
  ChartNoAxesCombined,
  Users,
  ShieldCheck,
  Sofa,
  SlidersHorizontal,
  Folder,
  DraftingCompass,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import "./AdminLayout.css";

const navigation = [
  {
    label: "DASHBOARD & GOVERNANCE",
    items: [
      [LayoutDashboard, "Executive Dashboard", "/admin"],
      [ChartNoAxesCombined, "Thống Kê & Phân Tích"],
    ],
  },
  {
    label: "NGƯỜI DÙNG & PHÂN QUYỀN (RBAC)",
    items: [
      [Users, "Quản Lý Người Dùng", "/admin/users"],
      [ShieldCheck, "Ma Trận Phân Quyền & Vai Trò"],
    ],
  },
  {
    label: "QUẢN TRỊ DANH MỤC (CATALOG)",
    items: [
      [Sofa, "Quản Lý Sản Phẩm"],
      [SlidersHorizontal, "Biến Thể & SKU"],
      [Folder, "Danh Mục & Bộ Sưu Tập"],
      [DraftingCompass, "Thương Hiệu & Xưởng Atelier"],
    ],
  },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const drawer = useRef(null);
  const trigger = useRef(null);
  useEffect(() => {
    let cancelled = false;
    getDashboard()
      .then((data) => {
        if (!cancelled) setProfile(data.profile);
      })
      .catch(() => {
        /* Giữ vùng tài khoản trống nếu không đọc được thông tin demo. */
      });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const element = drawer.current;
    element.querySelector("button")?.focus();
    function keyboard(event) {
      if (event.key === "Escape") {
        setOpen(false);
        requestAnimationFrame(() => trigger.current?.focus());
      }
      if (event.key === "Tab") {
        const buttons = [
          ...element.querySelectorAll("button:not(:disabled), a[href]"),
        ].filter((button) => button.getClientRects().length);
        const first = buttons[0];
        const last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    element.addEventListener("keydown", keyboard);
    return () => element.removeEventListener("keydown", keyboard);
  }, [open]);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1280px)");
    const close = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", close);
    return () => media.removeEventListener("change", close);
  }, []);
  function closeMenu() {
    setOpen(false);
    // Chờ React gỡ inert trước khi trả focus về nút mở drawer.
    requestAnimationFrame(() => trigger.current?.focus());
  }
  return (
    <div className="lumora-admin">
      {open && (
        <button
          className="la-backdrop"
          tabIndex={-1}
          aria-label="Đóng menu"
          onClick={closeMenu}
        />
      )}
      <aside
        ref={drawer}
        className={`la-sidebar ${open ? "la-sidebar-open" : ""}`}
        aria-label="Điều hướng Admin"
      >
        <button
          className="la-drawer-close"
          onClick={closeMenu}
          aria-label="Đóng menu"
        >
          <X size={20} />
        </button>
        <div className="la-brand">
          <img
            className="la-logo-slot"
            src={logo}
            alt="Logo LUMORA" />
          <div>
            LUMORA
            <small>
              ATELIER
              <br />
              SYSTEMS
            </small>
          </div>
        </div>
        <p className="la-portal">PORTAL // ENTERPRISE V4.8</p>
        <nav>
          {navigation.map((group) => (
            <div className="la-nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map(([Icon, label, to]) =>
                to ? (
                  <NavLink
                    key={label}
                    to={to}
                    end
                    className={({ isActive }) =>
                      isActive ? "la-nav-link la-nav-active" : "la-nav-link"
                    }
                    onClick={() => {
                      if (open) closeMenu();
                    }}
                  >
                    <Icon size={17} strokeWidth={1.7} />
                    {label}
                  </NavLink>
                ) : (
                  <button
                    key={label}
                    type="button"
                    disabled
                    title="Chưa khả dụng: màn hình chưa được triển khai"
                  >
                    <Icon size={17} strokeWidth={1.7} />
                    {label}
                    <small className="la-nav-pending">Chưa có</small>
                  </button>
                ),
              )}
            </div>
          ))}
        </nav>
        <p className="la-nav-caption">GIÁM SÁT HỆ THỐNG</p>
        <div className="la-system">
          <div>
            SYSTEM HEALTH <span>Chưa tích hợp</span>
          </div>
          <div>
            Database Sync <span>Chưa tích hợp</span>
          </div>
          <button disabled title="Chưa có phiên xác thực">
            <LogOut size={16} /> Log Out Session
          </button>
          <small>v4.8</small>
        </div>
      </aside>
      <div className="la-workspace" inert={open ? true : undefined}>
        <header className="la-header">
          <button
            ref={trigger}
            className="la-menu-toggle"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-label="Mở menu quản trị"
          >
            <Menu size={22} />
          </button>
          <div className="la-enterprise">
            LUMORA
            <br />
            ENTERPRISE
          </div>
          <div className="la-governance">
            GOVERNANCE
            <br />& OPERATOR CORE
          </div>
          <div className="la-role-tabs" aria-label="Không gian vai trò">
            {["Customer", "Staff", "Storage", "Admin"].map((role) => (
              <button
                key={role}
                className={role === "Admin" ? "la-role-active" : ""}
                title="Chưa triển khai chuyển vai trò"
                onClick={() => {}}
              >
                {role}
              </button>
            ))}
          </div>
          <label
            className="la-search"
            title="Tìm kiếm đang chờ mock Catalog và thiết kế kết quả"
          >
            <Search size={17} />
            <input
              disabled
              aria-label="Tìm kiếm chưa triển khai"
              placeholder="Search catalog, SKUs, logs..."
            />
            <kbd>⌘K</kbd>
          </label>
          <span className="la-live">
            LIVE PING:
            <br />
            Chưa tích hợp
          </span>
          <button
            disabled
            className="la-bell"
            title="Thông báo chưa tích hợp"
            aria-label="Thông báo chưa tích hợp"
          >
            <Bell size={18} />
          </button>
          <div className="la-profile">
            {profile?.name}
            <small>{profile?.role}</small>
          </div>
          <div
            className="la-avatar-slot"
            role="img"
            aria-label="Vùng chờ avatar gốc"
          />
        </header>
        <main className="la-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
