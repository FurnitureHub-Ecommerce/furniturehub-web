import React from 'react';
import './StaffTable.css';

const statusConfig = {
  active:   { className: 'staff-status--active',   label: 'Active' },
  'on-leave': { className: 'staff-status--leave',  label: 'On Leave' },
  'off-duty': { className: 'staff-status--off',    label: 'Off Duty' },
};

const StaffTable = ({ staff }) => {
  return (
    <div className="staff-table-wrapper">
      <table className="staff-table">
        <thead>
          <tr>
            <th>STAFF MEMBER</th>
            <th>ROLE</th>
            <th>DEPARTMENT</th>
            <th>STATUS</th>
            <th>SHIFT</th>
            <th>ORDERS</th>
            <th>SLA</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((member) => {
            const status = statusConfig[member.status] || statusConfig.active;
            return (
              <tr key={member.id} className="staff-table__row">
                <td>
                  <div className="staff-table__member">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="staff-table__avatar"
                    />
                    <div>
                      <strong>{member.name}</strong>
                      <span className="staff-table__id">{member.id}</span>
                    </div>
                  </div>
                </td>
                <td>{member.role}</td>
                <td>{member.department}</td>
                <td>
                  <span className={`staff-status ${status.className}`}>
                    <span className="staff-status__dot" />
                    {status.label}
                  </span>
                </td>
                <td><span className="staff-table__shift">{member.shift}</span></td>
                <td><strong>{member.ordersHandled}</strong></td>
                <td>
                  <span className={`staff-sla ${member.slaScore >= 98 ? 'staff-sla--good' : 'staff-sla--warn'}`}>
                    {member.slaScore}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StaffTable;
