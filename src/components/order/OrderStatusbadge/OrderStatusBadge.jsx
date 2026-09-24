import React from 'react';
import './OrderStatusBadge.css';

const statusConfig = {
  'Needs Confirmation': { className: 'badge--amber', label: 'Cần Xác Nhận' },
  'Swatch Review':      { className: 'badge--blue',  label: 'Xét Mẫu Vải' },
  'Allocated':          { className: 'badge--green', label: 'Đã Phân Bổ' },
  'Dispatched':         { className: 'badge--grey',  label: 'Đã Giao' },
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
