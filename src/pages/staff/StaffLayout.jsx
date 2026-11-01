import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Settings, User, LogOut, ClipboardList, BarChart3 } from "lucide-react";
import logo from "../../assets/logo.jpg";
import "./Staff.css";

const StaffLayout = () => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({
    fullName: "Đang tải...",
    role: "NHÂN VIÊN VẬN HÀNH",
    avatar: "https://ui-avatars.com/api/?name=User&background=1c1c1c&color=fff",
  });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const fullName = parsed.fullName || "Nhân viên";
        const role = parsed.role || "STAFF";
        setCurrentUser({
          fullName: fullName,
          role: role === "STAFF" ? "NHÂN VIÊN VẬN HÀNH" : role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1c1c1c&color=fff`,
        });
      }
    } catch (e) {
      console.error("Không thể đọc thông tin user:", e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className="staff-container" style={{ fontFamily: "'Inter', sans-serif" }}>
      <aside className="staff-sidebar">
        <div className="sidebar-top">
          <div className="brand-logo">
            <img src={logo} alt="LUMORA Atelier" />
          </div>

          <div className="nav-group">
            <p className="nav-label" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>VẬN HÀNH ĐƠN HÀNG</p>
            <ul style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>
                <NavLink to="/staff" end style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                  borderRadius: '8px', textDecoration: 'none',
                  background: isActive ? '#111827' : 'transparent',
                  color: isActive ? '#FFF' : '#4B5563'
                })}>
                  <ClipboardList size={18} />
                  Danh Sách Đơn Hàng
                </NavLink>
              </li>
              <li>
                <NavLink to="/staff/dashboard" style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                  borderRadius: '8px', textDecoration: 'none',
                  background: isActive ? '#111827' : 'transparent',
                  color: isActive ? '#FFF' : '#4B5563'
                })}>
                  <BarChart3 size={18} />
                  Thống Kê Vận Hành
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        {/* User Account Section */}
        <div className="user-profile-wrapper">
          <div className="user-profile">
            <div className="user-main-info">
              <img src={currentUser.avatar} alt={currentUser.fullName} className="user-avatar" />
              <div>
                <span className="user-name">{currentUser.fullName}</span>
                <span className="user-role">{currentUser.role}</span>
              </div>
            </div>

            <button
              className={`settings-btn ${showSettingsMenu ? "active" : ""}`}
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              type="button"
              title="Cài đặt"
            >
              <Settings size={18} />
            </button>
          </div>

          {showSettingsMenu && (
            <div className="settings-dropdown">
              <NavLink to="/staff/profile" onClick={() => setShowSettingsMenu(false)}>
                <User size={16} />
                Trang cá nhân
              </NavLink>
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