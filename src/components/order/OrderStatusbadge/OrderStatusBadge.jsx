import React from 'react';
import './OrderStatusBadge.css';

const statusConfig = {
  'Needs Confirmation': { className: 'badge--amber', label: 'Needs Confirmation' },
  'Swatch Review':      { className: 'badge--blue',  label: 'Swatch Review' },
  'Allocated':          { className: 'badge--green', label: 'Allocated' },
  'Dispatched':         { className: 'badge--grey',  label: 'Dispatched' },
};

const OrderStatusBadge = ({ status }) => {
  const config = statusConfig[status] || { className: 'badge--default', label: status };

  return (
    <span className={`order-status-badge ${config.className}`}>
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;
