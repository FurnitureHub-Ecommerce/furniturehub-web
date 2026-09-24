import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Settings, User, LogOut } from 'lucide-react';
import logo from '../../assets/logo.jpg';
import './Storage.css';

const StorageLayout = () => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const navigate = useNavigate();

  const currentUser = {
    name: 'Vy Đặng',
    role: 'GIÁM ĐỐC VẬN HÀNH KHO',
    avatar: 'https://ui-avatars.com/api/?name=Vy+Dang&background=1c1c1c&color=fff'
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="storage-container" style={{ fontFamily: "'Inter', sans-serif" }}>
      <aside className="storage-sidebar">
        <div className="sidebar-top">
          <div className="brand-logo">
            <img src={logo} alt="LUMORA Atelier" />
          </div>

          <div className="nav-group">
            <p className="nav-label" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>TỔNG QUAN & DỮ LIỆU KHO</p>
            <ul style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '15px' }}>
              {/* Dùng end cho đường dẫn trang chủ /storage để không bị nhận diện nhầm với các trang con khác */}
              <li><NavLink to="/storage" end>Tổng Quan Tồn Kho</NavLink></li>
              <li><NavLink to="/storage/statistics">Thống Kê và Báo Cáo</NavLink></li>
            </ul>
          </div>

          <div className="nav-group">
            <p className="nav-label" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>VẬN HÀNH KHO</p>
            <ul style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '15px' }}>
              <li><NavLink to="/storage/inbound-outbound">Nhập & Xuất Kho</NavLink></li>
              <li><NavLink to="/storage/availability">Tình Trạng Sẵn Có</NavLink></li>
              <li><NavLink to="/storage/adjustment">Điều Chỉnh Kiểm Kê</NavLink></li>
            </ul>
          </div>

          <div className="nav-group">
            <p className="nav-label" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>DANH MỤC & CẢNH BÁO</p>
            <ul style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '15px' }}>
              <li><NavLink to="/storage/skus">Quản Lý SKU & Biến Thể</NavLink></li>
              <li><NavLink to="/storage/alerts">Cảnh Báo Tồn Thấp</NavLink></li>
              <li><NavLink to="/storage/search">Tìm Kiếm & Bộ Lọc</NavLink></li>
              <li><NavLink to="/storage/history">Lịch Sử Biến Động Kho</NavLink></li>
              <li><NavLink to="/storage/testing">Kiểm Thử Hệ Thống</NavLink></li>
            </ul>
          </div>
        </div>

        {/* User Account Section */}
        <div className="user-profile-wrapper">
          <div className="user-profile">
            <div className="user-main-info">
              <img src={currentUser.avatar} alt={currentUser.name} className="user-avatar" />
              <span className="user-name">{currentUser.name}</span>
            </div>
            
            <button 
              className={`settings-btn ${showSettingsMenu ? 'active' : ''}`}
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              type="button"
              title="Cài đặt"
            >
              <Settings size={18} />
            </button>
          </div>

          {/* Settings Dropdown Menu */}
          {showSettingsMenu && (
            <div className="settings-dropdown">
              <NavLink to="/storage/profile" onClick={() => setShowSettingsMenu(false)}>
                <User size={18} />
                Hồ Sơ Cá Nhân
              </NavLink>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={18} />
                Đăng Xuất
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="storage-content">
        <Outlet />
      </main>
    </div>
  );
};

export default StorageLayout;