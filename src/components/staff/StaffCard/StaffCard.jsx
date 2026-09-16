import React from 'react';
import './StaffCard.css';

const statusConfig = {
  active:     { className: 'card-status--active',  label: 'Active' },
  'on-leave': { className: 'card-status--leave',   label: 'On Leave' },
  'off-duty': { className: 'card-status--off',     label: 'Off Duty' },
};

const StaffCard = ({ member }) => {
  const status = statusConfig[member.status] || statusConfig.active;

  return (
    <div className="staff-card">
      <div className="staff-card__top">
        <img src={member.avatar} alt={member.name} className="staff-card__avatar" />
        <span className={`staff-card__status ${status.className}`}>
          <span className="staff-card__status-dot" />
          {status.label}
        </span>
      </div>
      <div className="staff-card__info">
        <strong className="staff-card__name">{member.name}</strong>
        <span className="staff-card__role">{member.role}</span>
      </div>
      <div className="staff-card__stats">
        <div className="staff-card__stat">
          <span className="staff-card__stat-value">{member.ordersHandled}</span>
          <span className="staff-card__stat-label">Orders</span>
        </div>
        <div className="staff-card__stat">
          <span className="staff-card__stat-value">{member.slaScore}%</span>
          <span className="staff-card__stat-label">SLA</span>
        </div>
      </div>
    </div>
  );
};

export default StaffCard;
