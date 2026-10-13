import React, { useState, useMemo } from "react";
import { Search, Calendar, X, RotateCcw } from "lucide-react";
import OrderStatusBadge from "../OrderStatusbadge/OrderStatusBadge";
import "./OrderTable.css";

const STATUS_TABS = [
  { key: "", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "cancelled", label: "Đã hủy" },
  { key: "rejected", label: "Bị từ chối" },
];

const OrderTable = ({
  orders = [],
  selectedOrderId,
  onSelectOrder,
  statusFilter = "",
  onStatusChange,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  loading = false,
  onSearchExactId,
}) => {
  const [jumpPage, setJumpPage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // 'all' | 'today' | '7days' | '30days' | 'custom'
  const [customDate, setCustomDate] = useState("");

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
      rejected: "Bị từ chối",
    })[s] || s;

  // Filter orders in current page by search term & date
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Search term (Mã đơn, Tên người nhận, SĐT)
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const idMatch = order._id.toLowerCase().includes(term);
        const nameMatch = (order.shippingAddress?.receiverName || "")
          .toLowerCase()
          .includes(term);
        const phoneMatch = (order.shippingAddress?.phone || "")
          .toLowerCase()
          .includes(term);

        if (!idMatch && !nameMatch && !phoneMatch) {
          return false;
        }
      }

      // 2. Date filter (Ngày tạo)
      if (dateFilter !== "all") {
        const orderDate = new Date(order.createdAt);
        const now = new Date();

        if (dateFilter === "today") {
          const isSameDay =
            orderDate.getDate() === now.getDate() &&
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear();
          if (!isSameDay) return false;
        } else if (dateFilter === "7days") {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          if (orderDate < sevenDaysAgo) return false;
        } else if (dateFilter === "30days") {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          if (orderDate < thirtyDaysAgo) return false;
        } else if (dateFilter === "custom" && customDate) {
          const [year, month, day] = customDate.split("-").map(Number);
          const isSameDay =
            orderDate.getFullYear() === year &&
            orderDate.getMonth() + 1 === month &&
            orderDate.getDate() === day;
          if (!isSameDay) return false;
        }
      }

      return true;
    });
  }, [orders, searchTerm, dateFilter, customDate]);

  // Is searching for a 24-hex MongoDB ID that is missing from current page?
  const isLookingForObjectId = useMemo(() => {
    const term = searchTerm.trim();
    return /^[0-9a-fA-F]{24}$/.test(term) && filteredOrders.length === 0;
  }, [searchTerm, filteredOrders.length]);

  const hasActiveFilters = searchTerm || dateFilter !== "all" || customDate;

  const handleResetFilters = () => {
    setSearchTerm("");
    setDateFilter("all");
    setCustomDate("");
  };

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
        {/* Top: Title & Status Tabs */}
        <div className="order-table-header__top">
          <div className="order-table-header__title-group">
            <h3>Đơn Hàng Đang Hoạt Động</h3>
            <span className="order-route">Tuyến: /staff/orders</span>
          </div>

          <div className="order-status-tabs" role="tablist">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={statusFilter === tab.key}
                className={`status-tab ${statusFilter === tab.key ? "status-tab--active" : ""}`}
                onClick={() => onStatusChange?.(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar: Universal Search & Date Filters */}
        <div className="order-table-toolbar">
          {/* Universal Search (Mã đơn, Người nhận, SĐT) */}
          <div className="order-search-box">
            <Search size={14} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="order-search-input"
              placeholder="Tìm theo mã đơn, người nhận, SĐT..."
            />
            {searchTerm && (
              <button
                type="button"
                className="order-search-clear"
                onClick={() => setSearchTerm("")}
                title="Xóa tìm kiếm"
              >
                ×
              </button>
            )}
          </div>

          {/* Date Range Presets & Custom Picker */}
          <div className="order-date-filters">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="order-date-select"
              aria-label="Lọc theo thời gian"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="custom">Chọn ngày cụ thể...</option>
            </select>

            {dateFilter === "custom" && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="order-date-input"
              />
            )}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-reset-filters"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw size={12} />
                Đặt lại
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Global Lookup Hint if exact ID not found in current page */}
      {isLookingForObjectId && (
        <div className="lookup-global-hint">
          <span>
            Đơn hàng #{searchTerm.slice(-8).toUpperCase()} không có trong trang này.
          </span>
          <button
            type="button"
            onClick={() => onSearchExactId?.(searchTerm.trim())}
          >
            Tìm trên toàn hệ thống
          </button>
        </div>
      )}

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
          {filteredOrders.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                style={{
                  textAlign: "center",
                  padding: "36px",
                  color: "#8c857b",
                }}
              >
                {hasActiveFilters
                  ? "Không có đơn hàng nào khớp với bộ lọc."
                  : "Không có đơn hàng nào trong trạng thái này."}
              </td>
            </tr>
          ) : (
            filteredOrders.map((order) => (
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
          {hasActiveFilters
            ? `Hiển thị ${filteredOrders.length}/${orders.length} đơn trên trang này (Tổng ${totalItems} đơn)`
            : `Hiển thị ${orders.length} / ${totalItems || orders.length} đơn hàng`}
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
