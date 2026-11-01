import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Calendar,
  MapPin,
  CreditCard,
  Truck,
  Copy,
  Check,
  QrCode,
  AlertCircle,
  Phone,
  ShieldCheck,
  Package,
} from "lucide-react";
import { orderAPI, paymentAPI, getApiErrorMessage } from "../../../services/api";
import { formatCurrency } from "../../../utils/formatters";
import OrderStatusBadge from "../OrderStatusbadge/OrderStatusBadge";
import CancelOrderModal from "../CancelOrderModal/CancelOrderModal";
import OrderTrackingTimeline from "../../customer/OrderTrackingTimeline";
import "./OrderDetailModal.css";

// Component con hiển thị thông tin chi tiết từng sản phẩm một cách trực quan, có nhãn rõ ràng
function OrderItemCard({ item }) {
  const unitPrice = item.unitPrice || 0;
  const qty = item.quantity || 1;
  const lineTotal = item.itemSubtotal || unitPrice * qty;

  return (
    <div className="order-modal__item-card">
      <div className="order-modal__item-thumb">
        <div className="order-modal__item-icon-wrap">
          <Package size={26} strokeWidth={1.5} />
        </div>
      </div>

      <div className="order-modal__item-info">
        <h4 className="order-modal__item-title">
          {item.productName || "Sản phẩm nội thất"}
        </h4>

        <div className="order-modal__item-sku">
          SKU: {item.sku || item.variantId || "N/A"}
        </div>

        {/* Hiển thị thông số dạng danh sách phẳng, tinh tế không khung thừa */}
        <div className="order-modal__specs-list">
          {item.color && (
            <div className="order-modal__spec-row">
              <span className="order-modal__spec-label">Màu sắc:</span>
              <span className="order-modal__spec-value">{item.color}</span>
            </div>
          )}
          {item.size && (
            <div className="order-modal__spec-row">
              <span className="order-modal__spec-label">Kích thước:</span>
              <span className="order-modal__spec-value">{item.size}</span>
            </div>
          )}
          {item.material && (
            <div className="order-modal__spec-row">
              <span className="order-modal__spec-label">Chất liệu:</span>
              <span className="order-modal__spec-value">{item.material}</span>
            </div>
          )}
        </div>

        <div className="order-modal__item-math">
          <span className="order-modal__item-unit-price">
            {formatCurrency(unitPrice)}
          </span>
          <span className="order-modal__item-multiplier">× {qty}</span>
        </div>
      </div>

      <div className="order-modal__item-subtotal">
        {formatCurrency(lineTotal)}
      </div>
    </div>
  );
}

// Hàm bóc tách lý do từ chối / hủy đơn hàng từ object đơn hàng hoặc lịch sử tiến trình (timeline/statusHistory/history)
function extractCancelOrRejectReason(orderObj, trackingObj) {
  const pickValidText = (...candidates) => {
    for (const val of candidates) {
      if (typeof val === "string" && val.trim()) {
        return val.trim();
      }
    }
    return "";
  };

  const extractFromHistoryArrays = (source) => {
    if (!source || typeof source !== "object") return "";
    const arrays = [
      source.timeline,
      source.statusHistory,
      source.history,
      source.logs,
      source.tracking?.timeline,
      source.tracking?.statusHistory,
      source.tracking?.history,
    ];

    for (const arr of arrays) {
      if (!Array.isArray(arr) || arr.length === 0) continue;
      for (let i = arr.length - 1; i >= 0; i--) {
        const step = arr[i];
        if (!step || typeof step !== "object") continue;
        const stepStatus = String(
          step.status || step.state || step.title || step.action || ""
        ).toLowerCase();
        const isRejectedOrCancelledStep =
          stepStatus.includes("reject") ||
          stepStatus.includes("cancel") ||
          stepStatus.includes("từ chối") ||
          stepStatus.includes("hủy");

        if (isRejectedOrCancelledStep) {
          const stepReason = pickValidText(
            step.rejectReason,
            step.rejectionReason,
            step.cancelReason,
            step.cancellationReason,
            step.reason,
            step.cancelNote,
            step.note,
            step.comment,
            step.message
          );
          if (stepReason) return stepReason;
        }
      }

      // Fallback: quét bất kỳ bước nào trong lịch sử có gắn reason/note
      for (let i = arr.length - 1; i >= 0; i--) {
        const step = arr[i];
        if (!step || typeof step !== "object") continue;
        const stepReason = pickValidText(
          step.rejectReason,
          step.rejectionReason,
          step.cancelReason,
          step.cancellationReason,
          step.reason,
          step.cancelNote,
          step.note
        );
        if (stepReason) return stepReason;
      }
    }
    return "";
  };

  const directReason = pickValidText(
    orderObj?.rejectReason,
    orderObj?.rejectionReason,
    orderObj?.cancelReason,
    orderObj?.cancellationReason,
    orderObj?.reason,
    orderObj?.cancelNote,
    orderObj?.note,
    trackingObj?.rejectReason,
    trackingObj?.rejectionReason,
    trackingObj?.cancelReason,
    trackingObj?.cancellationReason,
    trackingObj?.reason,
    trackingObj?.cancelNote,
    trackingObj?.note
  );

  if (directReason) return directReason;

  return (
    extractFromHistoryArrays(orderObj) ||
    extractFromHistoryArrays(trackingObj) ||
    ""
  );
}

export default function OrderDetailModal({
  isOpen,
  onClose,
  order: initialOrder,
  orderId: propOrderId,
  onCancelClick,
  onOrderCancelled,
}) {
  const [order, setOrder] = useState(initialOrder);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [payment, setPayment] = useState(initialOrder?.payment || null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  const activeOrderId = order?._id || order?.id || initialOrder?._id || initialOrder?.id || propOrderId;

  useEffect(() => {
    setOrder(initialOrder);
    setPayment(initialOrder?.payment || null);
  }, [initialOrder]);

  // Khóa scroll khi mở modal
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
      const [ordRes, trackRes] = await Promise.all([
        orderAPI.getMyOrderById(activeOrderId),
        orderAPI.getOrderTracking
          ? orderAPI.getOrderTracking(activeOrderId).catch(() => null)
          : Promise.resolve(null),
      ]);

      const trackData = trackRes?.data?.tracking || trackRes?.data?.data || trackRes?.data || null;
      if (trackData) {
        setTrackingInfo(trackData);
      }

      if (ordRes?.data) {
        const fetchedOrder = ordRes.data.order || ordRes.data.data || ordRes.data;
        const resolvedCancelReason = extractCancelOrRejectReason(fetchedOrder, trackData);
        setOrder((prev) => {
          const prevReason = extractCancelOrRejectReason(prev, null);
          const finalReason = resolvedCancelReason || prevReason;
          return {
            ...prev,
            ...fetchedOrder,
            ...(finalReason
              ? {
                  reason: finalReason,
                  cancelReason: finalReason,
                  rejectReason: fetchedOrder?.rejectReason || finalReason,
                }
              : {}),
          };
        });

        // Chỉ gọi API lấy payment nếu đơn chọn chuyển khoản ngân hàng
        const method = fetchedOrder.paymentMethod;
        if (method === "BANK_TRANSFER" || method === "bank_transfer") {
          try {
            const payRes = await paymentAPI.getPaymentByOrder(activeOrderId);
            if (payRes?.data) {
              setPayment(payRes.data.payment || payRes.data);
            }
          } catch {
            // Bỏ qua lỗi 404 nếu payment chưa được tạo
          }
        }
        return fetchedOrder;
      }
    } catch (err) {
      setLoadError(getApiErrorMessage(err, "Không thể tải chi tiết đơn hàng từ hệ thống."));
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [activeOrderId]);

  // Gọi API chuẩn từ Backend khi mở modal
  useEffect(() => {
    if (!isOpen || !activeOrderId) return;
    fetchOrderDetail();
  }, [isOpen, activeOrderId, fetchOrderDetail]);

  if (!isOpen) return null;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const statusLower = String(order?.status || "").toLowerCase();
  const isPending = statusLower === "pending";
  const isCancelled = statusLower === "cancelled" || statusLower === "rejected";
  const extractedReason = extractCancelOrRejectReason(order, trackingInfo);
  const cancelReasonText = extractedReason || "Đơn hàng đã được hủy bởi cửa hàng";
  const shipping = order?.shippingAddress || {};
  const items = order?.items || [];

  const paymentMethod = payment?.paymentMethod || order?.paymentMethod || "COD";
  const isBankTransfer = paymentMethod === "BANK_TRANSFER" || paymentMethod === "bank_transfer";
  const isPaid = payment?.status === "paid" || order?.paymentStatus === "paid";

  const totalAmount = order?.totalAmount ?? 0;
  const subtotal = order?.subtotal ?? totalAmount;

  const handleCancelledSuccess = async (updatedOrder) => {
    setCancelModalVisible(false);
    setOrder((prev) => ({
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
    <div className="order-modal__overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="order-modal__container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="order-modal__header">
          <div className="order-modal__header-left">
            <span className="order-modal__badge">CHI TIẾT ĐƠN HÀNG</span>
            <div className="order-modal__title-row">
              <h2 className="order-modal__title">
                Đơn hàng #{activeOrderId ? activeOrderId.slice(-8).toUpperCase() : "---"}
              </h2>
              {activeOrderId && (
                <button
                  type="button"
                  className="order-modal__copy-id-btn"
                  onClick={() => handleCopy(activeOrderId, "orderId")}
                  title="Sao chép mã đơn hàng"
                >
                  {copiedField === "orderId" ? (
                    <>
                      <Check size={13} className="text-emerald-600" /> Đã chép
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> #{activeOrderId.slice(-6).toUpperCase()}
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="order-modal__date-row">
              <Calendar size={14} />
              <span>
                Thời gian đặt:{" "}
                {order?.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Đang cập nhật"}
              </span>
            </div>
          </div>

          <div className="order-modal__header-right">
            {order && <OrderStatusBadge status={order.status} />}
            <button
              type="button"
              className="order-modal__close-btn"
              onClick={onClose}
              aria-label="Đóng"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="order-modal__body">
          {isLoading && !order ? (
            <div className="order-modal__loading">
              <div className="order-modal__spinner" />
              <p>Đang đồng bộ dữ liệu từ máy chủ...</p>
            </div>
          ) : loadError && !order ? (
            <div className="order-modal__error">
              <AlertCircle size={24} />
              <p>{loadError}</p>
            </div>
          ) : (
            <>
              {/* Tiến trình đơn hàng */}
              <div className="order-modal__section">
                <span className="order-modal__section-heading">
                  TIẾN TRÌNH ĐƠN HÀNG
                </span>
                <OrderTrackingTimeline
                  orderId={activeOrderId}
                  trackingData={trackingInfo}
                  status={order?.status || "pending"}
                  variant="full"
                  createdAt={order?.createdAt}
                  updatedAt={order?.updatedAt}
                  reason={cancelReasonText}
                  cancelReason={cancelReasonText}
                  onRefresh={(data) => {
                    if (data) setTrackingInfo(data);
                  }}
                />
              </div>

              {/* Địa chỉ & Thanh toán */}
              <div className="order-modal__meta-grid">
                <div className="order-modal__card">
                  <div className="order-modal__card-header">
                    <MapPin size={17} className="order-modal__card-icon" />
                    <h4>Địa Chỉ Nhận Hàng</h4>
                  </div>
                  <div className="order-modal__card-content">
                    <div className="order-modal__receiver">
                      <strong>{shipping.receiverName || "Khách hàng"}</strong>
                      {shipping.phone && (
                        <span className="order-modal__phone">
                          <Phone size={13} /> {shipping.phone}
                        </span>
                      )}
                    </div>
                    <p className="order-modal__address">
                      {[
                        shipping.addressLine,
                        shipping.ward,
                        shipping.city,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Chưa cập nhật địa chỉ"}
                    </p>
                    <div className="order-modal__shipping-tag">
                      <Truck size={13} /> Vận chuyển tiêu chuẩn
                    </div>
                  </div>
                </div>

                <div className="order-modal__card">
                  <div className="order-modal__card-header">
                    <CreditCard size={17} className="order-modal__card-icon" />
                    <h4>Thanh Toán</h4>
                  </div>
                  <div className="order-modal__card-content">
                    <p className="order-modal__payment-method">
                      <strong>Hình thức:</strong>{" "}
                      {isBankTransfer ? "Chuyển khoản Ngân hàng (VietQR)" : "Thanh toán khi nhận hàng (COD)"}
                    </p>
                    <p className="order-modal__payment-status">
                      <strong>Trạng thái:</strong>{" "}
                      <span
                        className={`order-modal__pay-pill ${
                          isPaid
                            ? "order-modal__pay-pill--paid"
                            : isBankTransfer
                            ? "order-modal__pay-pill--pending"
                            : "order-modal__pay-pill--cod"
                        }`}
                      >
                        {isPaid
                          ? "Đã thanh toán"
                          : isBankTransfer
                          ? "Chờ chuyển khoản"
                          : "Thanh toán khi nhận hàng"}
                      </span>
                    </p>
                    <div className="order-modal__guarantee">
                      <ShieldCheck size={13} /> Giao dịch bảo mật
                    </div>
                  </div>
                </div>
              </div>

              {/* VietQR Box (Chỉ hiển thị nếu là chuyển khoản và chưa thanh toán) */}
              {isBankTransfer && !isPaid && !isCancelled && (
                <div className="order-modal__bank-box">
                  <div className="order-modal__bank-header">
                    <QrCode size={18} />
                    <h4>Thông Tin Quét Mã VietQR</h4>
                  </div>
                  <p className="order-modal__bank-note">
                    Sử dụng ứng dụng ngân hàng để quét mã QR thanh toán đơn hàng:
                  </p>
                  <div className="order-modal__bank-details">
                    <div className="order-modal__qr-wrap">
                      <img
                        src={`https://img.vietqr.io/image/MB-0912345678-compact2.png?amount=${totalAmount}&addInfo=DH${(
                          activeOrderId || ""
                        )
                          .slice(-6)
                          .toUpperCase()}&accountName=CONG%20TY%20NOI%20THAT%20LUMORA`}
                        alt="VietQR Transfer"
                        className="order-modal__qr-img"
                      />
                    </div>
                    <div className="order-modal__bank-info">
                      <div className="order-modal__bank-row">
                        <span>Ngân hàng:</span>
                        <strong>MB Bank</strong>
                      </div>
                      <div className="order-modal__bank-row">
                        <span>Số tài khoản:</span>
                        <div className="order-modal__copy-group">
                          <strong>0912 345 678</strong>
                          <button
                            type="button"
                            className="order-modal__copy-btn-sm"
                            onClick={() => handleCopy("0912345678", "acc")}
                          >
                            {copiedField === "acc" ? <Check size={12} /> : <Copy size={12} />}
                            {copiedField === "acc" ? "Đã chép" : "Sao chép"}
                          </button>
                        </div>
                      </div>
                      <div className="order-modal__bank-row">
                        <span>Số tiền:</span>
                        <strong className="order-modal__bank-amount">
                          {formatCurrency(totalAmount)}
                        </strong>
                      </div>
                      <div className="order-modal__bank-row">
                        <span>Nội dung:</span>
                        <div className="order-modal__copy-group">
                          <strong className="order-modal__bank-content-tag">
                            DH{(activeOrderId || "").slice(-6).toUpperCase()}
                          </strong>
                          <button
                            type="button"
                            className="order-modal__copy-btn-sm"
                            onClick={() =>
                              handleCopy(
                                `DH${(activeOrderId || "").slice(-6).toUpperCase()}`,
                                "msg",
                              )
                            }
                          >
                            {copiedField === "msg" ? <Check size={12} /> : <Copy size={12} />}
                            {copiedField === "msg" ? "Đã chép" : "Sao chép"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Danh sách sản phẩm */}
              <div className="order-modal__section">
                <div className="order-modal__section-header-row">
                  <span className="order-modal__section-heading">
                    SẢN PHẨM TRONG ĐƠN ({items.length})
                  </span>
                </div>

                <div className="order-modal__items-list">
                  {items.map((it, idx) => (
                    <OrderItemCard key={it._id || idx} item={it} />
                  ))}
                </div>
              </div>

              {/* Tổng kết chi phí */}
              <div className="order-modal__summary-box">
                <div className="order-modal__summary-line">
                  <span>Tạm tính sản phẩm:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="order-modal__summary-line">
                  <span>Phí vận chuyển:</span>
                  <span className="order-modal__free-shipping">Miễn phí</span>
                </div>
                <div className="order-modal__summary-divider" />
                <div className="order-modal__summary-line order-modal__summary-line--total">
                  <span>Tổng thanh toán:</span>
                  <strong className="order-modal__summary-grand-total">
                    {formatCurrency(totalAmount)}
                  </strong>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="order-modal__footer">
          <div className="order-modal__footer-left">
            {!isCancelled && isPending && (
              <button
                type="button"
                className="order-modal__btn-cancel"
                onClick={() => {
                  // CHỈ mở Modal lý do, không gọi API hay hiện thông báo thành công trước
                  setCancelModalVisible(true);
                }}
              >
                Hủy đơn hàng
              </button>
            )}
          </div>
          <div className="order-modal__footer-right">
            <button type="button" className="order-modal__btn-close" onClick={onClose}>
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
