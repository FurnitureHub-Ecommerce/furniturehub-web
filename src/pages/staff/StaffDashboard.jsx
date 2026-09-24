import React from 'react';
import { staffMembers } from '../../data/staffData';
import { staffDashboardMetrics, recentActivity } from '../../data/staffMetrics';
import StaffMetrics from '../../components/staff/StaffMetrics/StaffMetrics';
import StaffCard from '../../components/staff/StaffCard/StaffCard';

const StaffDashboard = () => {
  const activeStaff = staffMembers.filter((m) => m.status === 'active');

  return (
    <div className="staff-dashboard">
      <div className="staff-page-header">
        <div className="staff-page-header__info">
          <p className="staff-breadcrumb">PROTOCOL VẬN HÀNH // TUYẾN ĐƯỜNG /STAFF / TỔNG QUAN</p>
          <h1>Tổng Quan Hoạt Động Nhân Viên</h1>
          <p>Theo dõi hiệu suất đội ngũ, ca làm việc và hoạt động gần đây trên toàn bộ các phòng ban.</p>
        </div>
      </div>

      {/* KPI Metrics */}
      <StaffMetrics metrics={staffDashboardMetrics} />

      {/* Active Staff Cards */}
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a', marginBottom: '16px' }}>
        Thành Viên Đang Hoạt Động
      </h3>
      <div className="staff-dashboard-grid">
        {activeStaff.map((member) => (
          <StaffCard key={member.id} member={member} />
        ))}
      </div>

      {/* Recent Activity Timeline */}
      <div className="activity-timeline">
        <h3>Hoạt Động Gần Đây</h3>
        {recentActivity.map((item) => (
          <div key={item.id} className="activity-item">
            <div className={`activity-item__dot activity-item__dot--${item.type}`} />
            <div className="activity-item__content">
              <span className="activity-item__staff">{item.staffName}</span>
              <p className="activity-item__action">{item.action}</p>
            </div>
            <span className="activity-item__time">{item.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffDashboard;
