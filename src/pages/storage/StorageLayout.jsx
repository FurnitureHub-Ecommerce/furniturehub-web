import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Settings, User, LogOut } from 'lucide-react';
import logo from '../../assets/logo.jpg';
import './Storage.css';

const StorageLayout = () => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const navigate = useNavigate();

  const currentUser = {
    name: 'Vy Dang',
    role: 'STORAGE OPS DIRECTOR',
    avatar: 'https://ui-avatars.com/api/?name=Vy+Dang&background=1c1c1c&color=fff'
  };

  const handleLogout = () => {
    // Thêm logic xóa token/session ở đây nếu có
    navigate('/login');
  };

  return (
    <div className="storage-container">
      <aside className="storage-sidebar">
        <div className="sidebar-top">
          <div className="brand-logo">
            <img src={logo} alt="LUMORA Atelier" />
          </div>

          <div className="nav-group">
            <p className="nav-label">TỔNG QUAN & DỮ LIỆU KHO</p>
            <ul>
              <li className="active"><Link to="/storage">Inventory Telemetry</Link></li>
              <li><Link to="/storage/reports">Báo cáo tồn kho</Link></li>
            </ul>
          </div>

          <div className="nav-group">
            <p className="nav-label">VẬN HÀNH KHO</p>
            <ul>
              <li><Link to="/storage/inbound">Nhập kho - Inbound Manifest</Link></li>
              <li><Link to="/storage/outbound">Xuất kho - Outbound Dispatch</Link></li>
              <li><Link to="/storage/audit">Điều chỉnh kiểm kê - Stock Audit</Link></li>
            </ul>
          </div>

          <div className="nav-group">
            <p className="nav-label">DANH MỤC & CẢNH BÁO</p>
            <ul>
              <li><Link to="/storage/skus">Quản lý SKU & Biến thể</Link></li>
              <li><Link to="/storage/alerts">Cảnh báo tồn thấp</Link></li>
              <li><Link to="/storage/history">Lịch sử biến động kho</Link></li>
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
              <Link to="/storage/profile" onClick={() => setShowSettingsMenu(false)}>
                <User size={18} />
                Profile cá nhân
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={18} />
                Đăng xuất
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