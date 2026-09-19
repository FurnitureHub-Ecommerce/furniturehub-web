import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Settings,
  User,
  LogOut,
  LayoutDashboard,
  Users,
  ClipboardList,
} from "lucide-react";
import logo from "../../assets/logo.jpg";
import "./Staff.css";

const navItems = [
  {
    path: "/staff",
    label: "Tổng Quan",
    icon: LayoutDashboard,
    exact: true,
  },
  { path: "/staff/members", label: "Nhân Viên", icon: Users },
  { path: "/staff/orders", label: "Đơn Hàng", icon: ClipboardList },
];

const StaffLayout = () => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = {
    name: "E. Van Der Bilt",
    role: "GIÁM ĐỐC VẬN HÀNH",
    avatar:
      "https://ui-avatars.com/api/?name=E+Van+Der+Bilt&background=1c1c1c&color=fff",
  };

  const handleLogout = () => {
    navigate("/login");
  };

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="staff-container">
      <aside className="staff-sidebar">
        <div className="sidebar-top">
          <div className="brand-logo">
            <img src={logo} alt="LUMORA Atelier" />
          </div>

          <div className="staff-module-badge">
            <span className="staff-module-badge__dot" />
            <span className="staff-module-badge__text">
              Mô-Đun Vận Hành Nhân Sự
            </span>
          </div>

          <div className="nav-group">
            <p className="nav-label">Vận Hành & Đơn Hàng</p>
            <ul>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.path}
                    className={isActive(item) ? "active" : ""}
                  >
                    <Link to={item.path}>
                      <Icon size={16} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* User Account Section */}
        <div className="user-profile-wrapper">
          <div className="user-profile">
            <div className="user-main-info">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="user-avatar"
              />
              <div>
                <span className="user-name">{currentUser.name}</span>
                <span className="user-role">{currentUser.role}</span>
              </div>
            </div>

            <button
              className={`settings-btn ${showSettingsMenu ? "active" : ""}`}
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              type="button"
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>

          {showSettingsMenu && (
            <div className="settings-dropdown">
              <Link
                to="/staff/profile"
                onClick={() => setShowSettingsMenu(false)}
              >
                <User size={16} />
                Hồ Sơ
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={16} />
                Đăng Xuất
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="staff-content">
        <Outlet />
      </main>
    </div>
  );
};

export default StaffLayout;
