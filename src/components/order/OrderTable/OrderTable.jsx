import React from 'react';
import OrderStatusBadge from '../OrderStatusbadge/OrderStatusBadge';
import './OrderTable.css';

const OrderTable = ({ orders, selectedOrderId, onSelectOrder }) => {
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
            <th>KHÁCH HÀNG & CẤP</th>
            <th>NGÀY</th>
            <th>TỔNG</th>
            <th>TRẠNG THÁI</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className={`order-row ${selectedOrderId === order.id ? 'order-row--selected' : ''}`}
              onClick={() => onSelectOrder?.(order.id)}
            >
              <td>
                <span className="order-id-link">{order.id}</span>
              </td>
              <td>
                <div className="client-info">
                  <strong>{order.clientName}</strong>
                  <span className="client-tier">{order.clientTier}</span>
                </div>
              </td>
              <td>{order.date}</td>
              <td><strong>{order.total}</strong></td>
              <td>
                <OrderStatusBadge status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="order-table-footer">
        <span>Hiển thị {orders.length} trong tổng số 18 đơn đang chờ</span>
        <div className="pagination">
          <button className="page-btn" disabled>Trước</button>
          <button className="page-btn page-btn--active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">Sau</button>
        </div>
      </div>
    </div>
  );
};

export default OrderTable;
