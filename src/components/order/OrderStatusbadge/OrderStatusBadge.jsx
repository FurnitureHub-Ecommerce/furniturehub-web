import React from 'react';
import './OrderStatusBadge.css';

const statusConfig = {
  // Enum Backend & Customer statuses
  pending: { className: 'badge--pending', label: 'Chờ xác nhận', dot: true },
  confirmed: { className: 'badge--confirmed', label: 'Đã xác nhận' },
  shipping: { className: 'badge--shipping', label: 'Đang vận chuyển', dot: true },
  delivered: { className: 'badge--delivered', label: 'Đã giao hàng' },
  cancelled: { className: 'badge--cancelled', label: 'Đã hủy' },
  rejected: { className: 'badge--rejected', label: 'Đã từ chối' },

  // Uppercase variations
  PENDING: { className: 'badge--pending', label: 'Chờ xác nhận', dot: true },
  CONFIRMED: { className: 'badge--confirmed', label: 'Đã xác nhận' },
  SHIPPING: { className: 'badge--shipping', label: 'Đang vận chuyển', dot: true },
  DELIVERED: { className: 'badge--delivered', label: 'Đã giao hàng' },
  CANCELLED: { className: 'badge--cancelled', label: 'Đã hủy' },
  REJECTED: { className: 'badge--rejected', label: 'Đã từ chối' },

  // Vietnamese variations
  'Chờ xác nhận': { className: 'badge--pending', label: 'Chờ xác nhận', dot: true },
  'Đã xác nhận': { className: 'badge--confirmed', label: 'Đã xác nhận' },
  'Đang vận chuyển': { className: 'badge--shipping', label: 'Đang vận chuyển', dot: true },
  'Đang giao': { className: 'badge--shipping', label: 'Đang vận chuyển', dot: true },
  'Đã giao hàng': { className: 'badge--delivered', label: 'Đã giao hàng' },
  'Đã giao': { className: 'badge--delivered', label: 'Đã giao hàng' },
  'Đã hủy': { className: 'badge--cancelled', label: 'Đã hủy' },
  'Đã từ chối': { className: 'badge--rejected', label: 'Đã từ chối' },

  // Legacy mockup labels for admin
  'Needs Confirmation': { className: 'badge--amber', label: 'Cần Xác Nhận' },
  'Swatch Review':      { className: 'badge--blue',  label: 'Xét Mẫu Vải' },
  'Allocated':          { className: 'badge--green', label: 'Đã Phân Bổ' },
  'Dispatched':         { className: 'badge--grey',  label: 'Đã Giao' },
};

export const getStatusMeta = (status) => {
  if (!status) return { className: 'badge--default', label: 'Không xác định' };
  const key = String(status).trim();
  return statusConfig[key] || statusConfig[key.toLowerCase()] || { className: 'badge--default', label: key };
};

const OrderStatusBadge = ({ status, showDot = true, className = '' }) => {
  const config = getStatusMeta(status);

  return (
    <span className={`order-status-badge ${config.className} ${className}`.trim()}>
      {showDot && config.dot && <span className="order-status-badge__dot" />}
      <span className="order-status-badge__text">{config.label}</span>
    </span>
  );
};

export default OrderStatusBadge;
