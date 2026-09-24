import React from 'react';
import { staffMembers } from '../../data/staffData';
import StaffTable from '../../components/staff/StaffTable/StaffTable';

const StaffList = () => {
  return (
    <div className="staff-list">
      <div className="staff-page-header">
        <div className="staff-page-header__info">
          <p className="staff-breadcrumb">OPERATIONS PROTOCOL // ROUTE /STAFF / MEMBERS</p>
          <h1>Staff Directory</h1>
          <p>View and manage all team members, roles, and shift assignments.</p>
        </div>
        <div className="staff-page-header__actions">
          <button className="btn-add-staff">+ Add Staff Member</button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="staff-list-toolbar">
        <input
          type="text"
          className="staff-search-input"
          placeholder="Search by name, role, or department..."
        />
        <span style={{ fontSize: '13px', color: '#8c857b' }}>
          {staffMembers.length} members total
        </span>
      </div>

      {/* Staff Table */}
      <StaffTable staff={staffMembers} />
    </div>
  );
};

export default StaffList;
