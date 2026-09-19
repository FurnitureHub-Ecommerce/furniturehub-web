import React from 'react';
import { staffMembers } from '../../data/staffData';
import StaffTable from '../../components/staff/StaffTable/StaffTable';

const StaffList = () => {
  return (
    <div className="staff-list">
      <div className="staff-page-header">
        <div className="staff-page-header__info">
          <p className="staff-breadcrumb">PROTOCOL VẬN HÀNH // TUYẾN ĐƯỜNG /STAFF / NHÂN VIÊN</p>
          <h1>Danh Sách Nhân Viên</h1>
          <p>Xem và quản lý toàn bộ nhân sự, vai trò và ca làm việc.</p>
        </div>
        <div className="staff-page-header__actions">
          <button className="btn-add-staff">+ Thêm Nhân Viên</button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="staff-list-toolbar">
        <input
          type="text"
          className="staff-search-input"
          placeholder="Tìm theo tên, vai trò hoặc phòng ban..."
        />
        <span style={{ fontSize: '13px', color: '#8c857b' }}>
          Tổng cộng {staffMembers.length} nhân viên
        </span>
      </div>

      {/* Staff Table */}
      <StaffTable staff={staffMembers} />
    </div>
  );
};

export default StaffList;
