import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
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
  Menu,
  X,
  Settings,
  User,
  LogOut,
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
    label: "NGƯỜI DÙNG & PHÂN QUYỀN",
    items: [
      [Users, "Quản Lý Người Dùng", "/admin/users"],
      [ShieldCheck, "Ma Trận Phân Quyền"],
    ],
  },
  {
    label: "QUẢN TRỊ DANH MỤC",
    items: [
      [Sofa, "Quản Lý Sản Phẩm", "/admin/catalog"],
      [SlidersHorizontal, "Biến Thể & SKU", "/admin/variants"],
      [Folder, "Danh Mục & Bộ Sưu Tập", "/admin/categories"],
      [DraftingCompass, "Thương Hiệu & Xưởng", "/admin/brands"],
      [ChartNoAxesCombined, "Giám Sát Tồn Kho", "/admin/monitoring"],
    ],
  },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const drawer = useRef(null);
  const trigger = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    getDashboard()
      .then((data) => {
        if (!cancelled) setProfile(data.profile);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function closeMenu() {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = storedUser.fullName || profile?.name || "Vy Đặng";

  return (
    <div className="lumora-admin" style={{ fontFamily: "'Inter', sans-serif", display: "flex", minHeight: "100vh", background: "#fcfbfa" }}>
      {open && (
        <button
          className="la-backdrop"
          tabIndex={-1}
          aria-label="Đóng menu"
          onClick={closeMenu}
        />
      )}
      
      {/* SIDEBAR */}
      <aside
        ref={drawer}
        className={`la-sidebar ${open ? "la-sidebar-open" : ""}`}
        aria-label="Điều hướng Admin"
        style={{
          background: "#fbf9f4",
          borderRight: "1px solid #eae6df",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "24px 16px",
          width: "280px",
          minWidth: "280px",
          height: "100vh",
          position: "sticky",
          top: 0,
          boxSizing: "border-box",
          zIndex: 10,
        }}
      >
        <div style={{ overflowY: "auto", flex: 1, paddingRight: "4px" }}>
          <button
            className="la-drawer-close"
            onClick={closeMenu}
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
          
          <div style={{ background: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #eae6df", marginBottom: "24px", textAlign: "center" }}>
            <img src={logo} alt="Logo LUMORA" style={{ width: "100%", maxHeight: "40px", objectFit: "contain" }} />
          </div>

          <nav>
            {navigation.map((group) => (
              <div className="la-nav-group" key={group.label} style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#8c857b", marginBottom: "8px", letterSpacing: "0.05em" }}>{group.label}</p>
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
                      style={({ isActive }) => ({
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? "#1c1c1c" : "#57534e",
                        background: isActive ? "#ede8e1" : "transparent",
                        textDecoration: "none",
                        marginBottom: "4px",
                      })}
                    >
                      <Icon size={17} strokeWidth={1.7} />
                      {label}
                    </NavLink>
                  ) : (
                    <button
                      key={label}
                      type="button"
                      disabled
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        color: "#a8a29e",
                        background: "transparent",
                        border: "none",
                        width: "100%",
                        textAlign: "left",
                        cursor: "not-allowed",
                        marginBottom: "4px",
                      }}
                    >
                      <Icon size={17} strokeWidth={1.7} />
                      {label}
                    </button>
                  ),
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* USER PROFILE & LOGOUT POPUP */}
        <div ref={menuRef} style={{ position: "relative", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #eae6df" }}>
          {showMenu && (
            <div style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              left: 0,
              right: 0,
              background: "#fff",
              border: "1px solid #eae6df",
              borderRadius: "12px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              padding: "6px",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}>
              <button
                onClick={() => {
                  setShowMenu(false);
                  alert("Chức năng Hồ Sơ Cá Nhân đang được phát triển!");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  background: "transparent",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#292524",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "#f4f1ea"}
                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
              >
                <User size={16} color="#57534e" />
                Hồ Sơ Cá Nhân
              </button>

              <div style={{ height: "1px", background: "#f2efeb", margin: "2px 6px" }} />

              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  background: "transparent",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#dc2626",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "#fef2f2"}
                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
              >
                <LogOut size={16} color="#dc2626" />
                Đăng Xuất
              </button>
            </div>
          )}

          <div 
            onClick={() => setShowMenu(!showMenu)}
            style={{
              background: "#fff",
              border: "1px solid #eae6df",
              borderRadius: "10px",
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#1c1c1c",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "12px",
              }}>
                {userName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div style={{ overflow: "hidden" }}>
                <strong style={{ fontSize: "13px", color: "#1c1c1c", display: "block", whiteSpace: "nowrap" }}>{userName}</strong>
              </div>
            </div>
            <div style={{
              background: showMenu ? "#ede8e1" : "#f4f1ea",
              padding: "6px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#57534e",
            }}>
              <Settings size={16} />
            </div>
          </div>
        </div>
      </aside>

      {/* WORKSPACE CHÍNH (Đã loại bỏ header chứa nút role thừa thãi) */}
      <div className="la-workspace" inert={open ? true : undefined} style={{ background: "#fcfbfa", minHeight: "100vh", display: "flex", flexDirection: "column", flex: 1 }}>
        <main className="la-content" style={{ flex: 1, boxSizing: "border-box" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}