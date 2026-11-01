import { useState, useEffect, useCallback } from "react";
import {
  X,
  Truck,
  MapPin,
  Calendar,
  Copy,
  Check,
  Phone,
  ShieldCheck,
  Eye,
  AlertCircle,
  Package,
} from "lucide-react";
import { orderAPI, getApiErrorMessage } from "../../services/api";
import OrderStatusBadge from "../order/OrderStatusbadge/OrderStatusBadge";
import CancelOrderModal from "../order/CancelOrderModal/CancelOrderModal";
import OrderTrackingTimeline from "./OrderTrackingTimeline";
import "./OrderTrackingModal.css";

export default function OrderTrackingModal({
  isOpen,
  onClose,
  order: initialOrder,
  orderId: propOrderId,
  onViewFullDetail,
  onCancelClick,
  onOrderCancelled,
}) {
  const [fetchedOrder, setFetchedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  const order = fetchedOrder || initialOrder || null;
  const activeOrderId = order?._id || order?.id || initialOrder?._id || initialOrder?.id || propOrderId;

  useEffect(() => {
    setFetchedOrder(initialOrder || null);
  }, [initialOrder]);

  // Khóa scroll body khi mở modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setCancelModalVisible(false);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Hàm tải lại chi tiết đơn hàng từ Backend
  const fetchOrderDetail = useCallback(async () => {
    if (!activeOrderId) return null;
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await orderAPI.getMyOrderById(activeOrderId);
      const fetched = res.data?.order || res.data?.data || res.data || null;
      if (fetched) {
        const resolvedCancelReason =
          fetched.cancelReason ||
          fetched.cancellationReason ||
          fetched.reason ||
          fetched.cancelNote ||
          fetched.rejectReason;
        setFetchedOrder((prev) => ({
          ...prev,
          ...fetched,
          reason:
            resolvedCancelReason ||
            prev?.cancelReason ||
            prev?.cancellationReason ||
            prev?.reason ||
            prev?.cancelNote,
          cancelReason:
            resolvedCancelReason ||
            prev?.cancelReason ||
            prev?.cancellationReason ||
            prev?.reason ||
            prev?.cancelNote,
        }));
        return fetched;
      }
    } catch (err) {
      setLoadError(
        getApiErrorMessage(err, "Không thể tải thông tin tiến trình đơn hàng.")
      );
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [activeOrderId]);

  // Fetch dữ liệu từ API thực tế của Backend khi mở modal
  useEffect(() => {
    if (!isOpen || !activeOrderId) return;
    fetchOrderDetail();
  }, [isOpen, activeOrderId, fetchOrderDetail]);

  if (!isOpen) return null;

  const handleCopyId = () => {
    if (!activeOrderId) return;
    navigator.clipboard?.writeText(activeOrderId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const shipping = order?.shippingAddress || {};
  const items = order?.items || [];
  const statusLower = String(order?.status || "").toLowerCase();
  const canCancel = statusLower === "pending";
  const isCancelled = statusLower === "cancelled" || statusLower === "rejected";
  const cancelReasonText =
    order?.cancelReason ||
    order?.cancellationReason ||
    order?.reason ||
    order?.cancelNote ||
    order?.rejectReason ||
    "Đơn hàng đã được hủy bởi cửa hàng";

  const formattedDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Đang cập nhật";

  const handleCancelledSuccess = async (updatedOrder) => {
    setCancelModalVisible(false);
    setFetchedOrder((prev) => ({
      ...prev,
      ...updatedOrder,
      status: updatedOrder.status || "cancelled",
      reason: updatedOrder.reason || updatedOrder.cancelReason,
      cancelReason: updatedOrder.cancelReason || updatedOrder.reason,
    }));
    const refreshed = await fetchOrderDetail();
    if (onOrderCancelled) {
      onOrderCancelled({
        ...updatedOrder,
        ...(refreshed || {}),
        reason: refreshed?.reason || refreshed?.cancelReason || updatedOrder.reason || updatedOrder.cancelReason,
        cancelReason: refreshed?.cancelReason || refreshed?.reason || updatedOrder.cancelReason || updatedOrder.reason,
      });
    }
  };

  return (
    <div
      className="lumora-track-modal__overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="lumora-track-modal__container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="lumora-track-modal__header">
          <div className="lumora-track-modal__header-left">
            <span className="lumora-track-modal__badge">
              <Truck size={18} className="text-amber-800 shrink-0" />
              Theo dõi đơn hàng
            </span>
            <div className="lumora-track-modal__id-row">
              <h2 className="lumora-track-modal__title">
                Đơn hàng #{activeOrderId ? activeOrderId.slice(-8).toUpperCase() : "---"}
              </h2>
              {activeOrderId && (
                <button
                  type="button"
                  className="lumora-track-modal__copy-btn"
                  onClick={handleCopyId}
                  title="Sao chép toàn bộ mã đơn hàng"
                >
                  {copiedId ? (
                    <>
                      <Check size={12} className="text-emerald-600" /> Đã chép
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> #{activeOrderId}
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="lumora-track-modal__date-row">
              <Calendar size={13} />
              <span>Thời gian đặt: {formattedDate}</span>
            </div>
          </div>

          <div className="lumora-track-modal__header-right">
            {order && <OrderStatusBadge status={order.status} />}
            <button
              type="button"
              className="lumora-track-modal__close-btn"
              onClick={onClose}
              aria-label="Đóng"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="lumora-track-modal__body">
          {isLoading && !order ? (
            <div className="lumora-track-modal__loading">
              <div className="lumora-track-modal__spinner" />
              <span>Đang kết nối hệ thống định vị vận đơn...</span>
            </div>
          ) : loadError && !order ? (
            <div className="lumora-track-modal__alert lumora-track-modal__alert--error">
              <AlertCircle size={18} className="shrink-0 text-red-600" />
              <span>{loadError}</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stepper Timeline Tiến Trình Trực Quan */}
              <div className="lumora-track-modal__stepper-section">
                <div className="lumora-track-modal__section-title">
                  Tiến Trình Xử Lý & Vận Chuyển
                </div>
                <OrderTrackingTimeline
                  orderId={activeOrderId}
                  status={order?.status || "pending"}
                  variant="full"
                  createdAt={order?.createdAt}
                  updatedAt={order?.updatedAt}
                  reason={cancelReasonText}
                  cancelReason={cancelReasonText}
                />
              </div>

              {/* 2 Cột Thông Tin Giao Nhận */}
              <div className="lumora-track-modal__grid">
                {/* Thông tin người nhận */}
                <div className="lumora-track-modal__card">
                  <div className="lumora-track-modal__card-head">
                    <MapPin size={16} className="text-amber-800 shrink-0" />
                    <h4>Địa Chỉ Nhận Hàng</h4>
                  </div>
                  <div className="lumora-track-modal__card-body">
                    <div className="lumora-track-modal__receiver-name">
                      {shipping.receiverName || "Quý Khách Hàng"}
                      {shipping.phone && (
                        <span className="lumora-track-modal__receiver-phone">
                          <Phone size={12} /> {shipping.phone}
                        </span>
                      )}
                    </div>
                    <p className="lumora-track-modal__address-text">
                      {[shipping.addressLine, shipping.ward, shipping.city]
                        .filter(Boolean)
                        .join(", ") || "Địa chỉ mặc định của tài khoản"}
                    </p>
                    <div className="lumora-track-modal__perk-badge">
                      <ShieldCheck size={13} className="text-amber-800" />
                      <span>Dịch vụ giao nhận tiêu chuẩn</span>
                    </div>
                  </div>
                </div>

                {/* Danh mục sản phẩm đang vận chuyển */}
                <div className="lumora-track-modal__card">
                  <div className="lumora-track-modal__card-head">
                    <Package size={16} className="text-amber-800 shrink-0" />
                    <h4>Kiện Hàng ({items.length} sản phẩm)</h4>
                  </div>
                  <div className="lumora-track-modal__card-body">
                    <div className="lumora-track-modal__items-preview">
                      {items.map((it, idx) => (
                        <div
                          key={it._id || idx}
                          className="lumora-track-modal__item-row"
                        >
                          <div className="lumora-track-modal__item-thumb">
                            <Package size={24} strokeWidth={1.5} className="text-amber-800" />
                          </div>
                          <div className="lumora-track-modal__item-info">
                            <span className="lumora-track-modal__item-title">
                              {it.productName || "Sản phẩm nội thất"}
                            </span>
                            <div className="lumora-track-modal__item-sku">
                              SKU: {it.sku || it.variantId || "N/A"}
                            </div>
                            <span className="lumora-track-modal__item-qty">
                              Số lượng: <strong>x{it.quantity || 1}</strong>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="lumora-track-modal__footer">
          <div className="lumora-track-modal__footer-left">
            {isCancelled ? (
              <div style={{ fontSize: "0.85rem", color: "#DC2626", fontWeight: 500 }}>
                Lý do:{" "}
                {order?.cancelReason ||
                  order?.cancellationReason ||
                  order?.reason ||
                  order?.cancelNote ||
                  "Đơn hàng đã được hủy bởi cửa hàng"}
              </div>
            ) : (
              canCancel && (
                <button
                  type="button"
                  className="lumora-track-modal__btn-cancel-order"
                  onClick={() => {
                    // CHỈ mở Modal lý do, không gọi API hay hiện thông báo thành công trước
                    setCancelModalVisible(true);
                  }}
                >
                  Hủy đơn hàng
                </button>
              )
            )}
          </div>

          <div className="lumora-track-modal__footer-right">
            {onViewFullDetail && (
              <button
                type="button"
                className="lumora-track-modal__btn-view-detail"
                onClick={() => {
                  onClose();
                  onViewFullDetail(order);
                }}
              >
                <Eye size={15} />
                <span>Xem Toàn Bộ Chi Tiết & Hóa Đơn</span>
              </button>
            )}
            <button
              type="button"
              className="lumora-track-modal__btn-close"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>

        {/* Modal nhập lý do hủy đơn hàng */}
        <CancelOrderModal
          isOpen={cancelModalVisible}
          onClose={() => setCancelModalVisible(false)}
          order={order}
          onCancelled={handleCancelledSuccess}
        />
      </div>
    </div>
  );
}
