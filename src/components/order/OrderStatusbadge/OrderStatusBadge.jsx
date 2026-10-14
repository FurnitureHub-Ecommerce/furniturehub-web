import React from 'react';
import './OrderStatusBadge.css';

const statusConfig = {
  'Needs Confirmation': { className: 'badge--amber', label: 'Cần Xác Nhận' },
  'Swatch Review':      { className: 'badge--blue',  label: 'Xét Mẫu Vải' },
  'Allocated':          { className: 'badge--green', label: 'Đã Phân Bổ' },
  'Dispatched':         { className: 'badge--grey',  label: 'Đã Giao' },
  // Trạng thái tiếng Việt từ OrderTable:
  'Chờ xác nhận':       { className: 'badge--amber', label: 'Chờ xác nhận' },
  'Đã xác nhận':        { className: 'badge--green', label: 'Đã xác nhận' },
  'Đang giao':          { className: 'badge--blue',  label: 'Đang giao' },
  'Đã giao':            { className: 'badge--grey',  label: 'Đã giao' },
  'Đã hủy':             { className: 'badge--red',   label: 'Đã hủy' },
  'Bị từ chối':         { className: 'badge--red',   label: 'Bị từ chối' },
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
