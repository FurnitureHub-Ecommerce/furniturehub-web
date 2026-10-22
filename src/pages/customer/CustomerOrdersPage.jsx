import { useState, useEffect, useMemo } from "react";
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
import { formatCurrency, PRODUCT_IMAGE_OVERRIDES } from "../../utils/formatters";
import OrderStatusBadge from "../../components/order/OrderStatusbadge/OrderStatusBadge";
import OrderDetailModal from "../../components/order/OrderDetailModal/OrderDetailModal";
import CancelOrderModal from "../../components/order/CancelOrderModal/CancelOrderModal";
import OrderTrackingTimeline from "../../components/customer/OrderTrackingTimeline";
import OrderTrackingModal from "../../components/customer/OrderTrackingModal";
import "./CustomerOrders.css";

const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80";

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
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const targetOrderId = searchParams.get("orderId") || paramOrderId;
  const [reloadKey, setReloadKey] = useState(0);

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

        // Nếu có query param ?orderId=xxx hoặc URL /orders/:orderId
        if (targetOrderId) {
          const matched = orderArray.find(
            (o) => (o._id || o.id) === targetOrderId,
          );
          if (matched) {
            setDetailOrder(matched);
            setIsDetailOpen(true);
          } else {
            // Trường hợp đơn hàng không có trong mảng (hoặc pagination), mở modal và fetch trực tiếp
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

  // Mở modal chi tiết
  const handleOpenDetail = (order) => {
    setDetailOrder(order);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    // Xóa param trên URL nếu có
    if (searchParams.get("orderId")) {
      searchParams.delete("orderId");
      setSearchParams(searchParams, { replace: true });
    } else if (paramOrderId) {
      navigate("/orders", { replace: true });
    }
  };

  // Mở modal theo dõi vận đơn White-Glove
  const handleOpenTracking = (order) => {
    setTrackingOrder(order);
    setIsTrackingOpen(true);
  };

  const handleCloseTracking = () => {
    setIsTrackingOpen(false);
    setTrackingOrder(null);
  };

  // Mở modal xác nhận hủy đơn
  const handleOpenCancelModal = (order) => {
    setCancellingOrder(order);
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false);
    setCancellingOrder(null);
  };

  // Callback sau khi hủy đơn thành công
  const handleOrderCancelledSuccess = (updatedOrder) => {
    const updatedId = updatedOrder._id || updatedOrder.id;

    // Cập nhật danh sách đơn hàng
    setOrders((prev) =>
      prev.map((ord) => {
        const ordId = ord._id || ord.id;
        if (ordId === updatedId) {
          return {
            ...ord,
            status: "cancelled",
            cancelReason: updatedOrder.cancelReason,
          };
        }
        return ord;
      }),
    );

    // Cập nhật lại detailOrder nếu đang mở
    if (detailOrder && (detailOrder._id || detailOrder.id) === updatedId) {
      setDetailOrder((prev) => ({
        ...prev,
        status: "cancelled",
        cancelReason: updatedOrder.cancelReason,
      }));
    }

    showToast(`Đã hủy thành công đơn hàng #${updatedId?.slice(-6).toUpperCase()}`);
    handleCloseCancelModal();
  };

  // Lọc theo tabs
  const tabCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      shipping: orders.filter((o) => o.status === "shipping").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (activeTab !== "all") {
      result = result.filter((o) => o.status === activeTab);
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
        <span className="orders-header__badge">THEO DÕI ĐƠN HÀNG</span>
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
        {/* Tabs Filter */}
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

        {/* Time Filter Select */}
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

      {/* Error alert with retry */}
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

      {/* Loading Skeleton mượt mà */}
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
        /* Empty state sang trọng */
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
        /* Danh sách đơn hàng */
        <div className="orders-list">
          {filteredOrders.map((ord) => {
            const ordId = ord._id || ord.id;
            const shipping = ord.shippingAddress || {};
            const items = ord.items || [];
            const canCancel = ord.status === "pending";
            const total = ord.totalAmount ?? ord.subtotal ?? 0;

            return (
              <div key={ordId} className="order-item-card">
                {/* Card Top: Mã đơn, ngày giờ & Status badge */}
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
                    {/* Task 18: Phân màu badge đồng bộ Modern Luxury LUMORA */}
                    <OrderStatusBadge status={ord.status} />
                  </div>
                </div>

                {/* Task 6: Stepper Progress Timeline (Compact preview) */}
                <div className="order-item-card__stepper-wrap">
                  <OrderTrackingTimeline
                    status={ord.status}
                    variant="compact"
                    createdAt={ord.createdAt}
                    updatedAt={ord.updatedAt}
                  />
                </div>

                {/* Items preview */}
                <div className="order-item-card__items">
                  {items.map((it, idx) => {
                    const fallbackImg =
                      PRODUCT_IMAGE_OVERRIDES[it.productName]?.[0] ||
                      FALLBACK_PRODUCT_IMAGE;
                    const itemImage =
                      it.image ||
                      it.productImage ||
                      it.product?.images?.[0] ||
                      fallbackImg;
                    const unitPrice = it.unitPrice || 0;
                    const qty = it.quantity || 1;
                    const lineTotal = it.itemSubtotal || unitPrice * qty;

                    return (
                      <div
                        key={it._id || idx}
                        className="order-line-item-preview"
                      >
                        <div className="order-line-item-preview__thumb">
                          <img
                            src={itemImage}
                            alt={it.productName || "Sản phẩm"}
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                            }}
                          />
                        </div>

                        <div className="order-line-item-preview__info">
                          <span className="order-line-item-preview__title">
                            {it.productName || "Nội thất cao cấp LUMORA"}
                          </span>
                          <div className="order-line-item-preview__meta">
                            <span className="order-line-item-preview__sku">
                              SKU: {it.sku || it.variantId || "LUMORA-ART"}
                            </span>
                            <span className="order-line-item-preview__qty">
                              Số lượng: <strong>x{qty}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="order-line-item-preview__price">
                          {formatCurrency(lineTotal)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Card Bottom / Summary */}
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
                      {/* Task 17: Nút 'Hủy đơn hàng' CHỈ hiển thị khi đơn PENDING */}
                      {canCancel && (
                        <button
                          type="button"
                          className="order-btn-cancel"
                          onClick={() => handleOpenCancelModal(ord)}
                        >
                          Hủy Đơn Hàng
                        </button>
                      )}

                      {/* Task 6: Theo dõi timeline nhanh & chi tiết bằng OrderTrackingModal riêng biệt */}
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

                      {/* Task 16: Xem chi tiết mở OrderDetailModal */}
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

      {/* Task 16 + 18 + 17: Modal Chi Tiết Đơn Hàng (Sản phẩm, Hóa đơn, Thanh toán VietQR) */}
      <OrderDetailModal
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        order={detailOrder}
        onCancelClick={(ord) => {
          handleOpenCancelModal(ord);
        }}
      />

      {/* Task 6: Modal Theo Dõi Vận Đơn White-Glove (Tiến trình 5 bước, địa chỉ giao nhận) */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={handleCloseTracking}
        order={trackingOrder}
        onViewFullDetail={(ord) => {
          handleCloseTracking();
          handleOpenDetail(ord);
        }}
        onCancelClick={(ord) => {
          handleCloseTracking();
          handleOpenCancelModal(ord);
        }}
      />

      {/* Task 17: Modal Xác Nhận Hủy Đơn */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={handleCloseCancelModal}
        order={cancellingOrder}
        onCancelled={handleOrderCancelledSuccess}
      />
    </div>
  );
}
