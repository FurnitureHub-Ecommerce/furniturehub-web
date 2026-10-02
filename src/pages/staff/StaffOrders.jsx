import React, { useState, useEffect } from "react";
import { MapPin, Check, Clock, Shield } from "lucide-react";
import { orderAPI } from "../../services/api";
import OrderTable from "../../components/order/OrderTable/OrderTable";

const StaffOrders = () => {
  // ── State ──────────────────────────────────────────────
  // orders from the API
  const [orderList, setOrderList] = useState([]);
  // track which order the user clicked in the table
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  // UI feedback states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showNotification, setShowNotification] = useState(true);

  // ── Fetch orders on mount ──────────────────────────────
  // useEffect cannot be async directly, so we define an
  // async function INSIDE it and call it immediately.
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Call GET /api/orders?page=1&limit=10
        // Axios wraps the HTTP response; the actual JSON body is in `res.data`
        const res = await orderAPI.getOrders({ page: 1, limit: 10 });

        // Your backend returns { orders: [...], page, limit, total }
        // We grab the array from res.data.orders
        const orders = res.data.orders || [];
        setOrderList(orders);

        // Auto-select the first order so the detail panel isn't empty
        if (orders.length > 0) {
          setSelectedOrderId(orders[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại.");
      } finally {
        // Whether success or failure, stop the loading spinner
        setLoading(false);
      }
    };

    fetchOrders();
  }, []); // empty deps array → runs once on mount

  // ── Derived state ───────────────────────────────────────
  // Find the full order object that matches what the user clicked
  const selectedOrder = orderList.find((o) => o._id === selectedOrderId);

  // ── Helper: format VND currency ────────────────────────
  const formatVND = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  // ── Helper: format date string ─────────────────────────
  const formatDate = (isoString) =>
    new Date(isoString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // ── Helper: map status to Vietnamese label ─────────────
  const statusLabel = (status) => {
    const map = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      shipping: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
    };
    return map[status] || status;
  };

  // ── Loading state ──────────────────────────────────────
  if (loading) {
    return (
      <div
        className="staff-orders"
        style={{ padding: 80, textAlign: "center", color: "#8c857b" }}
      >
        Đang tải đơn hàng...
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────
  if (error) {
    return (
      <div
        className="staff-orders"
        style={{ padding: 80, textAlign: "center", color: "#dc2626" }}
      >
        {error}
      </div>
    );
  }

  return (
    <div className="staff-orders">
      {/* Role Guard Banner */}
      <div className="role-guard-banner">
        <div className="role-guard__left">
          <div className="role-guard__status">
            <span className="role-guard__dot" />
            <span className="role-guard__label">
              CHẾ ĐỘ BẢO VỆ VAI TRÒ NHÂN VIÊN ĐANG HOẠT ĐỘNG
            </span>
          </div>
          <span className="role-guard__scope">
            <strong>Phạm vi xác thực:</strong> staff.fulfillment.manage — Trạm
            xác nhận đã được kiểm định: Desk Terminal A-04.
          </span>
        </div>
        <div className="role-guard__right">
          <span className="sla-badge">
            <Clock size={14} />
            Ca A đang hoạt động
          </span>
        </div>
      </div>

      {/* Page Header */}
      <div className="staff-page-header">
        <div className="staff-page-header__info">
          <p className="staff-breadcrumb">QUẢN LÝ ĐƠN HÀNG // /STAFF/ORDERS</p>
          <h1>Danh Sách Đơn Hàng</h1>
        </div>
        <div className="staff-page-header__actions">
          <span className="sla-badge">
            <Shield size={14} />
            Tổng: {orderList.length} đơn hàng
          </span>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="order-desk-layout">
        {/* Left: Active Orders Table — pass real data */}
        <OrderTable
          orders={orderList}
          selectedOrderId={selectedOrderId}
          onSelectOrder={setSelectedOrderId}
        />

        {/* Right: Order Detail Panel */}
        {selectedOrder && (
          <div className="order-inspection">
            {/* Header */}
            <div className="order-inspection__header">
              <div>
                <span className="order-inspection__title">
                  CHI TIẾT ĐƠN HÀNG
                </span>
                <div className="order-inspection__id">
                  {selectedOrder._id.slice(-8).toUpperCase()}
                </div>
              </div>
              <div className="order-inspection__priority">
                <span className="order-inspection__priority-label">
                  TRẠNG THÁI
                </span>
                <span className="order-inspection__priority-value">
                  {statusLabel(selectedOrder.status)}
                </span>
              </div>
            </div>

            {/* Line Items — Product Information */}
            <div className="order-inspection__section">
              <span className="order-inspection__section-title">
                SẢN PHẨM ({selectedOrder.items.length})
              </span>
              {selectedOrder.items.map((item) => (
                <div key={item._id} className="line-item">
                  <div className="line-item__details">
                    <div className="line-item__name">{item.productName}</div>
                    <div className="line-item__sku">
                      {item.sku} · SL: {item.quantity}
                    </div>
                    <div className="line-item__finish">
                      {[item.color, item.size, item.material]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>
                  <div className="line-item__price">
                    {formatVND(item.unitPrice)}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="order-inspection__section">
              <span className="order-inspection__section-title">
                TỔNG ĐƠN HÀNG
              </span>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 13, color: "#6e6860" }}>Tạm tính</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {formatVND(selectedOrder.subtotal)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>Tổng cộng</span>
                <span
                  style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a" }}
                >
                  {formatVND(selectedOrder.totalAmount)}
                </span>
              </div>
            </div>

            {/* Shipping / Customer Information */}
            <div className="order-inspection__section">
              <span className="order-inspection__section-title">
                THÔNG TIN GIAO HÀNG & KHÁCH HÀNG
              </span>
              <div className="delivery-spec">
                <div className="delivery-spec__icon">
                  <MapPin size={16} />
                </div>
                <div className="delivery-spec__info">
                  <div className="delivery-spec__address">
                    {selectedOrder.shippingAddress.receiverName}
                  </div>
                  <div className="delivery-spec__city">
                    {selectedOrder.shippingAddress.addressLine},{" "}
                    {selectedOrder.shippingAddress.ward},{" "}
                    {selectedOrder.shippingAddress.city}
                  </div>
                  <div className="delivery-spec__notes">
                    <span>
                      <strong>SĐT:</strong>{" "}
                      {selectedOrder.shippingAddress.phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="order-inspection__section">
              <span className="order-inspection__section-title">THỜI GIAN</span>
              <div style={{ fontSize: 12, color: "#6e6860", lineHeight: 1.8 }}>
                <div>
                  <strong>Tạo lúc:</strong>{" "}
                  {formatDate(selectedOrder.createdAt)}
                </div>
                <div>
                  <strong>Cập nhật:</strong>{" "}
                  {formatDate(selectedOrder.updatedAt)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="order-actions">
              <button className="btn-approve">
                <Check size={16} />
                DUYỆT & PHÂN BỔ
              </button>
              <button className="btn-decline">TỪ CHỐI / HỦY</button>
            </div>

            {/* Dispatch Notification */}
            {showNotification && (
              <div className="dispatch-notification">
                <div className="dispatch-notification__content">
                  <span className="dispatch-notification__title">
                    XÁC NHẬN ĐƠN HÀNG
                  </span>
                  <span className="dispatch-notification__text">
                    Đơn hàng ...{selectedOrder._id.slice(-6)} đã sẵn sàng xử lý.
                  </span>
                </div>
                <button
                  className="dispatch-notification__close"
                  onClick={() => setShowNotification(false)}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffOrders;
