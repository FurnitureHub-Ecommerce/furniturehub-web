import React from 'react';
import OrderStatusBadge from '../OrderStatusbadge/OrderStatusBadge';
import './OrderTable.css';

const OrderTable = ({ orders, selectedOrderId, onSelectOrder }) => {

  // Format VND
  const formatVND = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  // Short date
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });

  // Vietnamese status label
  const statusLabel = (s) =>
    ({ pending: "Chờ xác nhận", confirmed: "Đã xác nhận", shipping: "Đang giao", delivered: "Đã giao", cancelled: "Đã hủy" }[s] || s);

  return (
    <div className="order-table-wrapper">
      <div className="order-table-header">
        <h3>Đơn Hàng Đang Hoạt Động</h3>
        <div className="order-table-meta">
          <span className="order-route">Tuyến: /staff/orders</span>
          <input
            type="text"
            className="order-filter-input"
            placeholder="Lọc theo ID, khách hàng..."
          />
        </div>
      </div>

      <table className="order-table">
        <thead>
          <tr>
            <th>MÃ ĐƠN</th>
            <th>NGƯỜI NHẬN</th>
            <th>NGÀY</th>
            <th>TỔNG</th>
            <th>TRẠNG THÁI</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order._id}
              className={`order-row ${selectedOrderId === order._id ? 'order-row--selected' : ''}`}
              onClick={() => onSelectOrder?.(order._id)}
            >
              <td>
                <span className="order-id-link">
                  ...{order._id.slice(-6)}
                </span>
              </td>
              <td>
                <div className="client-info">
                  <strong>{order.shippingAddress?.receiverName || "—"}</strong>
                  <span className="client-tier">{order.shippingAddress?.phone}</span>
                </div>
              </td>
              <td>{formatDate(order.createdAt)}</td>
              <td><strong>{formatVND(order.totalAmount)}</strong></td>
              <td>
                <OrderStatusBadge status={statusLabel(order.status)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="order-table-footer">
        <span>Hiển thị {orders.length} đơn hàng</span>
        <div className="pagination">
          <button className="page-btn" disabled>Trước</button>
          <button className="page-btn page-btn--active">1</button>
          <button className="page-btn">Sau</button>
        </div>
      </div>
    </div>
  );
};

export default OrderTable;
