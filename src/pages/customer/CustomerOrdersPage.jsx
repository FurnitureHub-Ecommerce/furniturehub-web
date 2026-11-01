import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useSearchParams, useParams } from "react-router-dom";
import {
  Package,
  Calendar,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  MapPin,
  Copy,
  Check,
  CheckCircle2,
  Truck,
  Eye,
} from "lucide-react";
import { orderAPI, getApiErrorMessage } from "../../services/api";
import { formatCurrency } from "../../utils/formatters";
import OrderStatusBadge from "../../components/order/OrderStatusbadge/OrderStatusBadge";
import OrderDetailModal from "../../components/order/OrderDetailModal/OrderDetailModal";
import CancelOrderModal from "../../components/order/CancelOrderModal/CancelOrderModal";
import OrderTrackingTimeline from "../../components/customer/OrderTrackingTimeline";
import OrderTrackingModal from "../../components/customer/OrderTrackingModal";
import "./CustomerOrders.css";

export default function CustomerOrdersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { orderId: paramOrderId } = useParams();
  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [detailOrder, setDetailOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const targetOrderId = searchParams.get("orderId") || paramOrderId;
  const [reloadKey, setReloadKey] = useState(0);

  const fetchOrderDetail = useCallback(async (orderIdToFetch) => {
    if (!orderIdToFetch) return null;
    try {
      const res = await orderAPI.getMyOrderById(orderIdToFetch);
      const fetched = res.data?.order || res.data || null;
      if (fetched) {
        setOrders((prev) =>
          prev.map((ord) =>
            (ord._id || ord.id) === (fetched._id || fetched.id || orderIdToFetch)
              ? {
                  ...ord,
                  ...fetched,
                  reason: fetched.reason || fetched.cancelReason || ord.reason || ord.cancelReason,
                  cancelReason: fetched.cancelReason || fetched.reason || ord.cancelReason || ord.reason,
                }
              : ord
          )
        );
      }
      return fetched;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/login?redirect=/orders");
      return;
    }

    let isMounted = true;
    async function loadOrders() {
      setError(null);
      try {
        const res = await orderAPI.getMyOrders();
        if (!isMounted) return;
        const list = res.data?.orders || res.data || [];
        const orderArray = Array.isArray(list) ? list : [];
        setOrders(orderArray);

        if (targetOrderId) {
          const matched = orderArray.find(
            (o) => (o._id || o.id) === targetOrderId,
          );
          if (matched) {
            setDetailOrder(matched);
            setIsDetailOpen(true);
          } else {
            setDetailOrder({ _id: targetOrderId });
            setIsDetailOpen(true);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        const msg = getApiErrorMessage(
          err,
          "Không thể tải lịch sử đơn hàng. Vui lòng kiểm tra lại phiên đăng nhập.",
        );
        setError(msg);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadOrders();
    return () => {
      isMounted = false;
    };
  }, [token, targetOrderId, reloadKey, navigate]);

  const handleRefresh = () => {
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  const showToast = (message, duration = 3500) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, duration);
  };

  const handleCopyId = (id) => {
    if (!id) return;
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleOpenDetail = (order) => {
    setDetailOrder(order);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    if (searchParams.get("orderId")) {
      searchParams.delete("orderId");
      setSearchParams(searchParams, { replace: true });
    } else if (paramOrderId) {
      navigate("/orders", { replace: true });
    }
  };

  const handleOpenTracking = (order) => {
    setTrackingOrder(order);
    setIsTrackingOpen(true);
  };

  const handleCloseTracking = () => {
    setIsTrackingOpen(false);
    setTrackingOrder(null);
  };

  // Khi bấm nút 'Hủy đơn hàng': CHỈ mở Modal lý do, không gọi API hay hiện thông báo trước
  const handleOpenCancelModal = (order) => {
    setCancellingOrder(order);
    setCancelModalVisible(true);
  };

  const handleCloseCancelModal = () => {
    setCancelModalVisible(false);
    setCancellingOrder(null);
  };

  const handleOrderCancelledSuccess = async (updatedOrder) => {
    const updatedId = updatedOrder._id || updatedOrder.id;
    const reasonText = updatedOrder.reason || updatedOrder.cancelReason;

    setOrders((prev) =>
      prev.map((ord) => {
        const ordId = ord._id || ord.id;
        if (ordId === updatedId) {
          return {
            ...ord,
            ...updatedOrder,
            status: updatedOrder.status || "cancelled",
            reason: reasonText,
            cancelReason: reasonText,
          };
        }
        return ord;
      }),
    );

    if (detailOrder && (detailOrder._id || detailOrder.id) === updatedId) {
      setDetailOrder((prev) => ({
        ...prev,
        ...updatedOrder,
        status: updatedOrder.status || "cancelled",
        reason: reasonText,
        cancelReason: reasonText,
      }));
    }

    if (trackingOrder && (trackingOrder._id || trackingOrder.id) === updatedId) {
      setTrackingOrder((prev) => ({
        ...prev,
        ...updatedOrder,
        status: updatedOrder.status || "cancelled",
        reason: reasonText,
        cancelReason: reasonText,
      }));
    }

    handleCloseCancelModal();
    await fetchOrderDetail(updatedId);
    showToast(`Đã hủy thành công đơn hàng #${updatedId?.slice(-6).toUpperCase()}`);
  };

  const tabCounts = useMemo(() => {
    const getSt = (o) => String(o.status || "").toLowerCase();
    return {
      all: orders.length,
      pending: orders.filter((o) => getSt(o) === "pending").length,
      confirmed: orders.filter((o) => getSt(o) === "confirmed").length,
      shipping: orders.filter((o) => getSt(o) === "shipping").length,
      delivered: orders.filter((o) => getSt(o) === "delivered").length,
      cancelled: orders.filter((o) => getSt(o) === "cancelled").length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (activeTab !== "all") {
      result = result.filter(
        (o) => String(o.status || "").toLowerCase() === activeTab
      );
    }

    if (timeFilter !== "all") {
      const now = new Date();
      result = result.filter((o) => {
        if (!o.createdAt) return true;
        const orderDate = new Date(o.createdAt);
        if (isNaN(orderDate.getTime())) return true;

        if (timeFilter === "30days") {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          return orderDate >= thirtyDaysAgo;
        } else if (timeFilter === "6months") {
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(now.getMonth() - 6);
          return orderDate >= sixMonthsAgo;
        } else if (timeFilter === "thisYear") {
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          return orderDate >= startOfYear;
        }
        return true;
      });
    }

    return result;
  }, [orders, activeTab, timeFilter]);

  return (
    <div className="section container customer-orders-page">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="orders-toast">
          <CheckCircle2 size={18} className="orders-toast__icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="orders-header">
        <span className="orders-header__badge">Theo dõi đơn hàng</span>
        <h1 className="orders-header__title">Đơn Hàng Của Tôi</h1>
        <p className="orders-header__subtitle">
          Theo dõi tiến độ chế tác, đóng gói và dịch vụ giao hàng White-Glove
          dành riêng cho không gian sống của quý khách.
        </p>
      </div>

      {/* Filter Toolbar: Status Tabs & Time Filter */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div className="orders-tabs" role="tablist" style={{ margin: 0 }}>
          <button
            type="button"
            className={`orders-tab ${
              activeTab === "all" ? "orders-tab--active" : ""
            }`}
            onClick={() => setActiveTab("all")}
          >
            Tất cả ({tabCounts.all})
          </button>
          <button
            type="button"
            className={`orders-tab ${
              activeTab === "pending" ? "orders-tab--active" : ""
            }`}
            onClick={() => setActiveTab("pending")}
          >
            Chờ xác nhận ({tabCounts.pending})
          </button>
          <button
            type="button"
            className={`orders-tab ${
              activeTab === "confirmed" ? "orders-tab--active" : ""
            }`}
            onClick={() => setActiveTab("confirmed")}
          >
            Đã xác nhận ({tabCounts.confirmed})
          </button>
          <button
            type="button"
            className={`orders-tab ${
              activeTab === "shipping" ? "orders-tab--active" : ""
            }`}
            onClick={() => setActiveTab("shipping")}
          >
            Đang vận chuyển ({tabCounts.shipping})
          </button>
          <button
            type="button"
            className={`orders-tab ${
              activeTab === "delivered" ? "orders-tab--active" : ""
            }`}
            onClick={() => setActiveTab("delivered")}
          >
            Đã giao hàng ({tabCounts.delivered})
          </button>
          <button
            type="button"
            className={`orders-tab ${
              activeTab === "cancelled" ? "orders-tab--active" : ""
            }`}
            onClick={() => setActiveTab("cancelled")}
          >
            Đã hủy ({tabCounts.cancelled})
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--lumora-text-muted)", fontWeight: 500 }}>
            Thời gian:
          </span>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid var(--lumora-border)",
              backgroundColor: "#fff",
              fontSize: "0.85rem",
              color: "var(--lumora-text-main)",
              cursor: "pointer",
              outline: "none",
            }}
            aria-label="Lọc đơn hàng theo thời gian"
          >
            <option value="all">Tất cả thời gian</option>
            <option value="30days">30 ngày gần đây</option>
            <option value="6months">6 tháng gần đây</option>
            <option value="thisYear">Năm nay</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="orders-error">
          <AlertCircle size={20} className="shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={handleRefresh}
            className="orders-retry-btn"
          >
            <RefreshCw size={14} /> Thử lại
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="orders-skeleton-list">
          {[1, 2, 3].map((sk) => (
            <div key={sk} className="order-skeleton-card">
              <div className="order-skeleton-card__top">
                <div className="skeleton-box skeleton-box--id" />
                <div className="skeleton-box skeleton-box--badge" />
              </div>
              <div className="order-skeleton-card__stepper">
                <div className="skeleton-box skeleton-box--bar" />
              </div>
              <div className="order-skeleton-card__body">
                <div className="skeleton-box skeleton-box--img" />
                <div className="order-skeleton-card__lines">
                  <div className="skeleton-box skeleton-box--title" />
                  <div className="skeleton-box skeleton-box--sub" />
                </div>
              </div>
              <div className="order-skeleton-card__bottom">
                <div className="skeleton-box skeleton-box--address" />
                <div className="skeleton-box skeleton-box--btn" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="orders-empty">
          <Package size={52} className="orders-empty__icon" />
          <h3 className="orders-empty__title">Chưa có đơn hàng nào</h3>
          <p className="orders-empty__desc">
            {activeTab === "all"
              ? "Quý khách chưa có đơn hàng nào tại LUMORA. Hãy khám phá bộ sưu tập nội thất độc bản của chúng tôi để kiến tạo không gian sống hoàn mỹ."
              : `Không có đơn hàng nào trong danh mục này.`}
          </p>
          <Link to="/products" className="orders-btn-primary">
            Khám Phá Bộ Sưu Tập <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((ord) => {
            const ordId = ord._id || ord.id;
            const shipping = ord.shippingAddress || {};
            const items = ord.items || [];
            const statusLower = String(ord.status || "").toLowerCase();
            const canCancel = statusLower === "pending";
            const isCancelled = statusLower === "cancelled";
            const total = ord.totalAmount ?? ord.subtotal ?? 0;

            return (
              <div key={ordId} className="order-item-card">
                {/* Card Top */}
                <div className="order-item-card__top">
                  <div className="order-item-card__identifiers">
                    <span className="order-item-card__id">
                      Mã đơn: #{ordId?.slice(-8).toUpperCase()}
                    </span>

                    <button
                      type="button"
                      className="order-card-copy-btn"
                      onClick={() => handleCopyId(ordId)}
                      title="Sao chép toàn bộ mã đơn hàng"
                    >
                      {copiedId === ordId ? (
                        <>
                          <Check size={12} className="text-emerald-600" />
                          <span>Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>

                    <span className="order-item-card__date">
                      <Calendar size={13} />
                      {ord.createdAt
                        ? new Date(ord.createdAt).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "---"}
                    </span>
                  </div>

                  <div className="order-item-card__status-group">
                    <OrderStatusBadge status={ord.status} />
                  </div>
                </div>

                {/* Stepper Timeline */}
                <div className="order-item-card__stepper-wrap">
                  <OrderTrackingTimeline
                    status={ord.status}
                    variant="compact"
                    createdAt={ord.createdAt}
                    updatedAt={ord.updatedAt}
                    reason={ord.reason || ord.cancelReason}
                    cancelReason={ord.cancelReason || ord.reason}
                  />
                  {isCancelled && (
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "0.84rem",
                        color: "#DC2626",
                        fontWeight: 500,
                      }}
                    >
                      Lý do: {ord.reason || ord.cancelReason || "Người mua yêu cầu hủy"}
                    </div>
                  )}
                </div>

                {/* Items Preview */}
                <div className="order-item-card__items">
                  {items.map((it, idx) => {
                    const unitPrice = it.unitPrice || 0;
                    const qty = it.quantity || 1;

                    return (
                      <div
                        key={it._id || idx}
                        className="order-line-item-preview"
                      >
                        <div className="order-line-item-preview__thumb">
                          <div className="order-line-item-icon-wrap">
                            <Package size={24} strokeWidth={1.5} />
                          </div>
                        </div>

                        <div className="order-line-item-preview__info">
                          <span className="order-line-item-preview__title">
                            {it.productName || "Sản phẩm nội thất"}
                          </span>
                          <div className="order-line-item-preview__sku">
                            SKU: {it.sku || it.variantId || "N/A"}
                          </div>
                        </div>

                        <div className="order-line-item-preview__price-block">
                          <div className="order-line-item-preview__price">
                            {formatCurrency(unitPrice)}
                          </div>
                          <div className="order-line-item-preview__qty">
                            Số lượng: <strong>x{qty}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Card Bottom */}
                <div className="order-item-card__bottom">
                  <div className="order-item-card__shipping-preview">
                    <MapPin size={15} className="shrink-0 order-pin-icon" />
                    <span>
                      Giao tới: <strong>{shipping.receiverName || "Khách hàng"}</strong>
                      {shipping.phone ? ` (${shipping.phone})` : ""} -{" "}
                      {[shipping.addressLine, shipping.ward, shipping.city]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>

                  <div className="order-item-card__total-section">
                    <div className="order-item-card__total-group">
                      <span className="order-item-card__total-label">
                        Tổng thanh toán:
                      </span>
                      <strong className="order-item-card__total-val">
                        {formatCurrency(total)}
                      </strong>
                    </div>

                    <div className="order-item-card__actions">
                      {canCancel && !isCancelled && (
                        <button
                          type="button"
                          className="order-btn-cancel"
                          onClick={() => handleOpenCancelModal(ord)}
                        >
                          Hủy đơn hàng
                        </button>
                      )}

                      <button
                        type="button"
                        className="order-btn-view"
                        style={{
                          backgroundColor: "#FAF8F5",
                          borderColor: "#E2DBD0",
                          color: "#8A6A48",
                          marginRight: "0.5rem",
                        }}
                        onClick={() => handleOpenTracking(ord)}
                        title="Theo dõi tiến trình vận chuyển White-Glove"
                      >
                        <Truck size={14} /> Theo Dõi
                      </button>

                      <button
                        type="button"
                        className="order-btn-view"
                        onClick={() => handleOpenDetail(ord)}
                      >
                        <Eye size={14} /> Chi Tiết Đơn
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <OrderDetailModal
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        order={detailOrder}
        onCancelClick={(ord) => {
          handleOpenCancelModal(ord);
        }}
        onOrderCancelled={handleOrderCancelledSuccess}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={handleCloseTracking}
        order={trackingOrder}
        onViewFullDetail={(ord) => {
          handleCloseTracking();
          handleOpenDetail(ord);
        }}
        onCancelClick={(ord) => {
          handleOpenCancelModal(ord);
        }}
        onOrderCancelled={handleOrderCancelledSuccess}
      />

      <CancelOrderModal
        isOpen={cancelModalVisible}
        onClose={handleCloseCancelModal}
        order={cancellingOrder}
        onCancelled={handleOrderCancelledSuccess}
      />
    </div>
  );
}
