import React, { useState } from "react";
import OrderStatusBadge from "../OrderStatusbadge/OrderStatusBadge";
import "./OrderTable.css";

const OrderTable = ({
  orders = [],
  selectedOrderId,
  onSelectOrder,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  loading = false,
}) => {
  const [jumpPage, setJumpPage] = useState("");

  // Format VND
  const formatVND = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  // Short date
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });

  // Vietnamese status label
  const statusLabel = (s) =>
    ({
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      shipping: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
    })[s] || s;

  // Generate pagination items with ellipses (Approach 1)
  const getPaginationItems = (current, total) => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const items = [];
    if (current <= 3) {
      for (let i = 1; i <= 4; i++) items.push(i);
      items.push("dots-end");
      items.push(total);
    } else if (current >= total - 2) {
      items.push(1);
      items.push("dots-start");
      for (let i = total - 3; i <= total; i++) items.push(i);
    } else {
      items.push(1);
      items.push("dots-start");
      items.push(current - 1, current, current + 1);
      items.push("dots-end");
      items.push(total);
    }
    return items;
  };

  // Handle Quick Jump submission (Approach 2)
  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPage, 10);
    if (
      !isNaN(pageNum) &&
      pageNum >= 1 &&
      pageNum <= totalPages &&
      pageNum !== currentPage
    ) {
      onPageChange?.(pageNum);
    }
    setJumpPage("");
  };

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

      <table className={`order-table ${loading ? "order-table--loading" : ""}`}>
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
          {orders.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                style={{
                  textAlign: "center",
                  padding: "32px",
                  color: "#8c857b",
                }}
              >
                Không có đơn hàng nào
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr
                key={order._id}
                className={`order-row ${selectedOrderId === order._id ? "order-row--selected" : ""}`}
                onClick={() => onSelectOrder?.(order._id)}
              >
                <td>
                  <span className="order-id-link">
                    ...{order._id.slice(-6)}
                  </span>
                </td>
                <td>
                  <div className="client-info">
                    <strong>
                      {order.shippingAddress?.receiverName || "—"}
                    </strong>
                    <span className="client-tier">
                      {order.shippingAddress?.phone}
                    </span>
                  </div>
                </td>
                <td>{formatDate(order.createdAt)}</td>
                <td>
                  <strong>{formatVND(order.totalAmount)}</strong>
                </td>
                <td>
                  <OrderStatusBadge status={statusLabel(order.status)} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="order-table-footer">
        <span>
          Hiển thị {orders.length} / {totalItems || orders.length} đơn hàng
        </span>

        <div className="pagination-controls">
          {/* Approach 1: Numbered pagination */}
          <div className="pagination">
            <button
              type="button"
              className="page-btn"
              disabled={loading || currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
            >
              Trước
            </button>

            {getPaginationItems(currentPage, totalPages).map((item, idx) => {
              if (typeof item === "string") {
                return (
                  <span key={item + idx} className="page-ellipsis">
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={item}
                  type="button"
                  className={`page-btn ${currentPage === item ? "page-btn--active" : ""}`}
                  disabled={loading}
                  onClick={() => onPageChange?.(item)}
                >
                  {item}
                </button>
              );
            })}

            <button
              type="button"
              className="page-btn"
              disabled={loading || currentPage >= totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
            >
              Sau
            </button>
          </div>

          {/* Approach 2: Quick Jump */}
          {totalPages > 1 && (
            <form onSubmit={handleJumpSubmit} className="page-jump-form">
              <span>Đến trang</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                placeholder={currentPage.toString()}
                className="page-jump-input"
                disabled={loading}
                aria-label="Nhập trang cần đến"
              />
              <button
                type="submit"
                className="page-jump-btn"
                disabled={loading}
              >
                Đi
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTable;
