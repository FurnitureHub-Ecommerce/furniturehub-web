import React from 'react';
import OrderStatusBadge from '../OrderStatusbadge/OrderStatusBadge';
import './OrderTable.css';

const OrderTable = ({ orders, selectedOrderId, onSelectOrder }) => {
  return (
    <div className="order-table-wrapper">
      <div className="order-table-header">
        <h3>Active Orders</h3>
        <div className="order-table-meta">
          <span className="order-route">Route: /staff/orders</span>
          <input
            type="text"
            className="order-filter-input"
            placeholder="Filter by ID, client..."
          />
        </div>
      </div>

      <table className="order-table">
        <thead>
          <tr>
            <th>ORDER ID</th>
            <th>CLIENT & TIER</th>
            <th>DATE</th>
            <th>TOTAL</th>
            <th>STATUS</th>
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
        <span>Showing {orders.length} of 18 pending orders</span>
        <div className="pagination">
          <button className="page-btn" disabled>Previous</button>
          <button className="page-btn page-btn--active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">Next</button>
        </div>
      </div>
    </div>
  );
};

export default OrderTable;
