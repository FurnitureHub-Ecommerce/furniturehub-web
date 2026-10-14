import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { MapPin, Check, Clock, Shield } from "lucide-react";
import { orderAPI } from "../../services/api";
import OrderTable from "../../components/order/OrderTable/OrderTable";

const StaffOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Helper: read initial page from URL -> fallback to localStorage -> fallback to 1
  const getInitialPage = () => {
    const fromUrl = parseInt(searchParams.get("page"), 10);
    if (!isNaN(fromUrl) && fromUrl >= 1) return fromUrl;
    const fromStorage = parseInt(localStorage.getItem("staff_last_page"), 10);
    if (!isNaN(fromStorage) && fromStorage >= 1) return fromStorage;
    return 1;
  };

  // Helper: read initial orderId from URL -> fallback to localStorage -> null
  const getInitialOrderId = () => {
    const fromUrl = searchParams.get("orderId");
    if (fromUrl) return fromUrl;
    return localStorage.getItem("staff_last_order_id") || null;
  };

  const getInitialStatus = () => {
    return (
      searchParams.get("status") ||
      localStorage.getItem("staff_last_status") ||
      ""
    );
  };

  // ── State ──────────────────────────────────────────────
  const [orderList, setOrderList] = useState([]);
  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [selectedOrderId, setSelectedOrderId] = useState(getInitialOrderId);
  const [statusFilter, setStatusFilter] = useState(getInitialStatus);
  const [standaloneOrder, setStandaloneOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotification, setShowNotification] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [confirmError, setConfirmError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [successToast, setSuccessToast] = useState(null); // { orderId, shortId, type, title, sub }

  // Track initial mount so we respect restored orderId
  const isInitialMount = useRef(true);

  // Helper: Sync current page, orderId & status to both URL and localStorage
  const syncStateToUrlAndStorage = (page, orderId, status = statusFilter) => {
    const params = { page: page.toString() };
    if (status) params.status = status;
    if (orderId) params.orderId = orderId;
    setSearchParams(params, { replace: true });
    localStorage.setItem("staff_last_page", page.toString());
    if (orderId) {
      localStorage.setItem("staff_last_order_id", orderId);
    }
    if (status) {
      localStorage.setItem("staff_last_status", status);
    } else {
      localStorage.removeItem("staff_last_status");
    }
  };

  // If the target order isn't in current page's list, fetch it by ID directly
  const fetchStandaloneOrder = async (orderId, fallbackOrders = []) => {
    try {
      setDetailLoading(true);
      const res = await orderAPI.getOrdersById(orderId);
      const ord = res.data?.order || res.data;
      if (ord && ord._id) {
        setStandaloneOrder(ord);
        setSelectedOrderId(ord._id);
        syncStateToUrlAndStorage(currentPage, ord._id, statusFilter);
      } else if (fallbackOrders.length > 0) {
        setSelectedOrderId(fallbackOrders[0]._id);
        setStandaloneOrder(null);
        syncStateToUrlAndStorage(
          currentPage,
          fallbackOrders[0]._id,
          statusFilter,
        );
      }
    } catch (err) {
      console.warn("Could not fetch standalone order by ID:", err);
      if (fallbackOrders.length > 0) {
        setSelectedOrderId(fallbackOrders[0]._id);
        setStandaloneOrder(null);
        syncStateToUrlAndStorage(
          currentPage,
          fallbackOrders[0]._id,
          statusFilter,
        );
      }
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Fetch orders whenever currentPage or statusFilter changes ──
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = { page: currentPage, limit: 10 };
        if (statusFilter) {
          queryParams.status = statusFilter;
        }

        const res = await orderAPI.getOrders(queryParams);
        const orders = res.data.orders || [];
        const meta = res.data.pagination || {};

        setOrderList(orders);
        setPagination({
          page: meta.page || currentPage,
          limit: meta.limit || 10,
          totalPages: meta.totalPages || 1,
          totalItems: meta.totalItems ?? orders.length,
        });

        if (isInitialMount.current) {
          isInitialMount.current = false;
          const initialTargetId = getInitialOrderId();

          if (initialTargetId) {
            const found = orders.find((o) => o._id === initialTargetId);
            if (found) {
              setSelectedOrderId(found._id);
              setStandaloneOrder(null);
              syncStateToUrlAndStorage(currentPage, found._id, statusFilter);
            } else {
              // Target order is on another page -> fetch directly
              setSelectedOrderId(initialTargetId);
              fetchStandaloneOrder(initialTargetId, orders);
            }
          } else if (orders.length > 0) {
            setSelectedOrderId(orders[0]._id);
            setStandaloneOrder(null);
            syncStateToUrlAndStorage(currentPage, orders[0]._id, statusFilter);
          }
        } else {
          // Page or filter transition: auto-select first order of new list
          setStandaloneOrder(null);
          if (orders.length > 0) {
            setSelectedOrderId(orders[0]._id);
            syncStateToUrlAndStorage(currentPage, orders[0]._id, statusFilter);
          } else {
            setSelectedOrderId(null);
            syncStateToUrlAndStorage(currentPage, null, statusFilter);
          }
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, statusFilter]);

  // Handler when user clicks an order row in table
  const handleSelectOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setStandaloneOrder(null);
    syncStateToUrlAndStorage(currentPage, orderId, statusFilter);
  };

  // Handler when user switches status tab
  const handleStatusChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
    syncStateToUrlAndStorage(1, null, newStatus);
  };

  // Handler for direct ID lookup
  const handleSearchExactId = (id) => {
    fetchStandaloneOrder(id, orderList);
  };

  // Handler when user navigates page
  const handlePageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= pagination.totalPages &&
      newPage !== currentPage
    ) {
      setCurrentPage(newPage);
    }
  };

  // ── Derived state ───────────────────────────────────────
  // Find full order from list or use standalone fetched order
  const selectedOrder =
    orderList.find((o) => o._id === selectedOrderId) || standaloneOrder;

  // ── Toast Notification Helper ────────────────────────
  const showToast = useCallback(
    (
      orderId,
      shortId,
      type = "confirm",
      title = "Xác nhận thành công!",
      sub = `Đơn hàng #${shortId} đã được duyệt.`,
    ) => {
      setSuccessToast({ orderId, shortId, type, title, sub });
      setTimeout(() => setSuccessToast(null), 3500);
    },
    [],
  );

  // ── Confirm order (pending → confirmed) ───────────────
  const handleConfirmOrder = async () => {
    if (!selectedOrder || confirming || rejecting) return;
    try {
      setConfirming(true);
      setConfirmError(null);
      setActionError(null);
      await orderAPI.confirmOrderStatus(selectedOrder._id);
      // Optimistically update status in local list
      setOrderList((prev) =>
        prev.map((o) =>
          o._id === selectedOrder._id ? { ...o, status: "confirmed" } : o,
        ),
      );
      if (standaloneOrder && standaloneOrder._id === selectedOrder._id) {
        setStandaloneOrder((prev) =>
          prev ? { ...prev, status: "confirmed" } : null,
        );
      }
      showToast(
        selectedOrder._id,
        selectedOrder._id.slice(-8).toUpperCase(),
        "confirm",
        "Xác nhận thành công!",
        `Đơn hàng #${selectedOrder._id.slice(-8).toUpperCase()} đã được duyệt.`,
      );
    } catch (err) {
      console.error("Confirm order failed:", err);
      setConfirmError(
        err?.response?.data?.message || "Xác nhận thất bại. Vui lòng thử lại.",
      );
    } finally {
      setConfirming(false);
    }
  };

  // ── Reject order (pending/confirmed → rejected) ────────
  const handleRejectOrder = async () => {
    if (!selectedOrder || rejecting || confirming) return;

    const shortId = selectedOrder._id.slice(-8).toUpperCase();
    const isConfirmed = selectedOrder.status === "confirmed";

    try {
      setRejecting(true);
      setActionError(null);
      setConfirmError(null);

      await orderAPI.rejectOrderStatus(selectedOrder._id);

      // Optimistically update status in local list
      setOrderList((prev) =>
        prev.map((o) =>
          o._id === selectedOrder._id ? { ...o, status: "rejected" } : o,
        ),
      );
      if (standaloneOrder && standaloneOrder._id === selectedOrder._id) {
        setStandaloneOrder((prev) =>
          prev ? { ...prev, status: "rejected" } : null,
        );
      }

      showToast(
        selectedOrder._id,
        shortId,
        "reject",
        "Đã từ chối đơn hàng!",
        isConfirmed
          ? `Đơn hàng #${shortId} đã bị từ chối và tự động hoàn trả kho.`
          : `Đơn hàng #${shortId} đã bị từ chối.`,
      );
    } catch (err) {
      console.error("Reject order failed:", err);
      setActionError(
        err?.response?.data?.message ||
          "Từ chối đơn hàng thất bại. Vui lòng thử lại.",
      );
    } finally {
      setRejecting(false);
    }
  };

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
      rejected: "Bị từ chối",
    };
    return map[status] || status;
  };

  // ── Loading state (initial load only) ──────────────────
  if (loading && orderList.length === 0) {
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
  if (error && orderList.length === 0) {
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
      {/* ── Success Toast ──────────────────────────────── */}
      {successToast && (
        <div
          className={`confirm-toast confirm-toast--enter ${
            successToast.type === "reject" ? "confirm-toast--reject" : ""
          }`}
        >
          <div className="confirm-toast__icon">
            {successToast.type === "reject" ? "✕" : "✓"}
          </div>
          <div className="confirm-toast__body">
            <span className="confirm-toast__title">{successToast.title}</span>
            <span className="confirm-toast__sub">{successToast.sub}</span>
          </div>
          <button
            className="confirm-toast__close"
            onClick={() => setSuccessToast(null)}
          >
            ×
          </button>
        </div>
      )}
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
            Tổng: {pagination.totalItems || orderList.length} đơn hàng
          </span>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="order-desk-layout">
        {/* Left: Active Orders Table — pass real data & pagination */}
        <OrderTable
          orders={orderList}
          selectedOrderId={selectedOrderId}
          onSelectOrder={handleSelectOrder}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          onPageChange={handlePageChange}
          loading={loading}
          onSearchExactId={handleSearchExactId}
        />

        {/* Right: Order Detail Panel */}
        {detailLoading ? (
          <div
            className="order-inspection"
            style={{
              padding: 60,
              textAlign: "center",
              color: "#8c857b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Đang tải chi tiết đơn hàng...
          </div>
        ) : selectedOrder ? (
          <div className="order-inspection">
            {/* Header */}
            <div className="order-inspection__header">
              <div>
                <span className="order-inspection__title">
                  CHI TIẾT ĐƠN HÀNG
                </span>
                <div className="order-inspection__id">
                  {selectedOrder._id.toUpperCase()}
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
              {selectedOrder.status === "pending" && (
                <button
                  className="btn-approve"
                  onClick={handleConfirmOrder}
                  disabled={confirming || rejecting}
                >
                  <Check size={16} />
                  {confirming ? "ĐANG XÁC NHẬN..." : "DUYỆT & PHÂN BỔ"}
                </button>
              )}
              {["pending", "confirmed"].includes(selectedOrder.status) && (
                <button
                  className="btn-decline"
                  onClick={handleRejectOrder}
                  disabled={confirming || rejecting}
                >
                  {rejecting ? "ĐANG TỪ CHỐI..." : "TỪ CHỐI / HỦY"}
                </button>
              )}
              {(actionError || confirmError) && (
                <span
                  style={{
                    fontSize: 12,
                    color: "#dc2626",
                    marginTop: 6,
                    width: "100%",
                    display: "block",
                  }}
                >
                  {actionError || confirmError}
                </span>
              )}
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
        ) : (
          <div
            className="order-inspection"
            style={{
              padding: 60,
              textAlign: "center",
              color: "#8c857b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Vui lòng chọn một đơn hàng để xem chi tiết
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffOrders;
