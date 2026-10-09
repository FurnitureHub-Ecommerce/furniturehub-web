import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  X,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  Truck,
  Copy,
  Check,
  QrCode,
  AlertCircle,
  ExternalLink,
  Phone,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { orderAPI, paymentAPI, getApiErrorMessage } from "../../../services/api";
import { formatCurrency, PRODUCT_IMAGE_OVERRIDES } from "../../../utils/formatters";
import OrderStatusBadge from "../OrderStatusbadge/OrderStatusBadge";
import OrderStatusStepper from "../OrderStatusStepper/OrderStatusStepper";
import "./OrderDetailModal.css";

const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80";

export default function OrderDetailModal({
  isOpen,
  onClose,
  order: initialOrder,
  orderId: propOrderId,
  onCancelClick,
}) {
  const [order, setOrder] = useState(initialOrder);
  const [payment, setPayment] = useState(initialOrder?.payment || null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const activeOrderId = order?._id || order?.id || propOrderId;

  useEffect(() => {
    setOrder(initialOrder);
    setPayment(initialOrder?.payment || null);
  }, [initialOrder]);

  // Khóa scroll trang khi modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Nếu mở bằng orderId hoặc cần fetch chi tiết bổ sung
  useEffect(() => {
    if (!isOpen || !activeOrderId) return;

    let isMounted = true;
    async function fetchFullDetails() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [ordRes, payRes] = await Promise.allSettled([
          orderAPI.getMyOrderById(activeOrderId),
          paymentAPI.getPaymentByOrder(activeOrderId),
        ]);

        if (!isMounted) return;

        if (ordRes.status === "fulfilled" && ordRes.value?.data) {
          const fetchedOrder = ordRes.value.data.order || ordRes.value.data;
          setOrder(fetchedOrder);
        }

        if (payRes.status === "fulfilled" && payRes.value?.data) {
          const fetchedPayment = payRes.value.data.payment || payRes.value.data;
          setPayment(fetchedPayment);
        }
      } catch (err) {
        if (isMounted) {
          setLoadError(getApiErrorMessage(err, "Không thể tải chi tiết đơn hàng."));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    // Nếu chưa có items hoặc muốn fetch mới nhất
    if (!order || !order.items || order.items.length === 0) {
      fetchFullDetails();
    }
  }, [isOpen, activeOrderId]);

  if (!isOpen) return null;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isPending = order?.status === "pending";
  const shipping = order?.shippingAddress || {};
  const items = order?.items || [];
  const paymentMethod =
    payment?.paymentMethod || order?.paymentMethod || (order?.payment?.paymentMethod) || "COD";
  const isBankTransfer = paymentMethod === "BANK_TRANSFER";
  const isPaid = payment?.status === "paid" || order?.paymentStatus === "paid";
  const totalAmount = order?.totalAmount ?? order?.subtotal ?? 0;
  const subtotal = order?.subtotal ?? totalAmount;

  return (
    <div className="order-modal__overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="order-modal__container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="order-modal__header">
          <div className="order-modal__header-left">
            <span className="order-modal__badge">CHI TIẾT ĐƠN HÀNG LUMORA</span>
            <div className="order-modal__title-row">
              <h2 className="order-modal__title">
                Đơn hàng #{activeOrderId ? activeOrderId.slice(-8).toUpperCase() : "---"}
              </h2>
              {activeOrderId && (
                <button
                  type="button"
                  className="order-modal__copy-id-btn"
                  onClick={() => handleCopy(activeOrderId, "orderId")}
                  title="Sao chép toàn bộ mã đơn hàng"
                >
                  {copiedField === "orderId" ? (
                    <>
                      <Check size={13} className="text-emerald-600" /> Đã chép mã
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> #{activeOrderId}
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
              <p>Đang tải chi tiết đơn hàng từ hệ thống LUMORA...</p>
            </div>
          ) : loadError && !order ? (
            <div className="order-modal__error">
              <AlertCircle size={24} />
              <p>{loadError}</p>
            </div>
          ) : (
            <>
              {/* Task 18: Stepper Progress Timeline */}
              <div className="order-modal__section">
                <span className="order-modal__section-heading">
                  TIẾN TRÌNH ĐƠN HÀNG
                </span>
                <OrderStatusStepper
                  status={order?.status || "pending"}
                  variant="full"
                  createdAt={order?.createdAt}
                  updatedAt={order?.updatedAt}
                />
              </div>

              {/* 2-Columns: Shipping Address & Payment Method */}
              <div className="order-modal__meta-grid">
                {/* Shipping Details */}
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
                        .join(", ") || "Địa chỉ mặc định theo tài khoản"}
                    </p>
                    <div className="order-modal__shipping-tag">
                      <Truck size={13} /> Giao hàng White-Glove (Miễn phí tận nơi)
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="order-modal__card">
                  <div className="order-modal__card-header">
                    <CreditCard size={17} className="order-modal__card-icon" />
                    <h4>Phương Thức Thanh Toán</h4>
                  </div>
                  <div className="order-modal__card-content">
                    <p className="order-modal__payment-method">
                      <strong>Hình thức:</strong>{" "}
                      {isBankTransfer
                        ? "Chuyển khoản Ngân hàng (VietQR)"
                        : "Thanh toán khi nhận hàng (COD)"}
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
                          ? "Chờ xác nhận chuyển khoản"
                          : "Thanh toán khi nhận hàng"}
                      </span>
                    </p>
                    <div className="order-modal__guarantee">
                      <ShieldCheck size={13} /> Cam kết minh bạch & bảo vệ quyền lợi người mua
                    </div>
                  </div>
                </div>
              </div>

              {/* VietQR Bank Details (Nếu là chuyển khoản & chưa thanh toán & đơn chưa hủy) */}
              {isBankTransfer && !isPaid && order?.status !== "cancelled" && (
                <div className="order-modal__bank-box">
                  <div className="order-modal__bank-header">
                    <QrCode size={18} />
                    <h4>Thông Tin Chuyển Khoản Qua VietQR</h4>
                  </div>
                  <p className="order-modal__bank-note">
                    Quý khách có thể quét mã VietQR tự động điền số tiền và nội dung đơn hàng:
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
                        <strong>MB Bank (Ngân hàng Quân Đội)</strong>
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
                            {copiedField === "acc" ? (
                              <Check size={12} className="text-emerald-600" />
                            ) : (
                              <Copy size={12} />
                            )}
                            {copiedField === "acc" ? "Đã chép" : "Sao chép"}
                          </button>
                        </div>
                      </div>
                      <div className="order-modal__bank-row">
                        <span>Chủ tài khoản:</span>
                        <strong>CONG TY TNHH NOI THAT LUMORA</strong>
                      </div>
                      <div className="order-modal__bank-row">
                        <span>Số tiền:</span>
                        <strong className="order-modal__bank-amount">
                          {formatCurrency(totalAmount)}
                        </strong>
                      </div>
                      <div className="order-modal__bank-row">
                        <span>Nội dung chuyển khoản:</span>
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
                            {copiedField === "msg" ? (
                              <Check size={12} className="text-emerald-600" />
                            ) : (
                              <Copy size={12} />
                            )}
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
                    DANH SÁCH SẢN PHẨM ({items.length})
                  </span>
                </div>

                <div className="order-modal__items-list">
                  {items.map((it, idx) => {
                    const fallbackImg =
                      PRODUCT_IMAGE_OVERRIDES[it.productName]?.[0] ||
                      FALLBACK_PRODUCT_IMAGE;
                    const itemImage =
                      it.image || it.productImage || it.product?.images?.[0] || fallbackImg;
                    const unitPrice = it.unitPrice || 0;
                    const qty = it.quantity || 1;
                    const lineTotal = it.itemSubtotal || unitPrice * qty;

                    return (
                      <div key={it._id || idx} className="order-modal__item-card">
                        <div className="order-modal__item-thumb">
                          <img
                            src={itemImage}
                            alt={it.productName || "Sản phẩm LUMORA"}
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                            }}
                          />
                        </div>

                        <div className="order-modal__item-info">
                          <div className="order-modal__item-header">
                            <h4 className="order-modal__item-title">
                              {it.productName || "Nội thất cao cấp LUMORA"}
                            </h4>
                          </div>

                          <div className="order-modal__item-attrs">
                            <span className="order-modal__item-sku">
                              SKU: {it.sku || it.variantId || "LUMORA-ART"}
                            </span>
                            {[it.color, it.size, it.material]
                              .filter(Boolean)
                              .map((attr, aIdx) => (
                                <span
                                  key={aIdx}
                                  className="order-modal__item-pill"
                                >
                                  {attr}
                                </span>
                              ))}
                          </div>

                          <div className="order-modal__item-math">
                            <span className="order-modal__item-unit-price">
                              {formatCurrency(unitPrice)}
                            </span>
                            <span className="order-modal__item-multiplier">
                              × {qty}
                            </span>
                          </div>
                        </div>

                        <div className="order-modal__item-subtotal">
                          {formatCurrency(lineTotal)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bảng tổng kết chi phí */}
              <div className="order-modal__summary-box">
                <div className="order-modal__summary-line">
                  <span>Tạm tính hàng hóa:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="order-modal__summary-line">
                  <span>Dịch vụ vận chuyển White-Glove:</span>
                  <span className="order-modal__free-shipping">Miễn phí</span>
                </div>
                {order?.discountAmount > 0 && (
                  <div className="order-modal__summary-line order-modal__summary-line--discount">
                    <span>Ưu đãi áp dụng:</span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
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

        {/* Modal Footer */}
        <div className="order-modal__footer">
          <div className="order-modal__footer-left">
            {/* Task 17: Nút Hủy đơn hàng - CHỈ hiển thị khi đơn đang ở trạng thái PENDING */}
            {isPending && (
              <button
                type="button"
                className="order-modal__btn-cancel"
                onClick={() => {
                  if (onCancelClick) {
                    onCancelClick(order);
                  }
                }}
              >
                Hủy Đơn Hàng
              </button>
            )}
          </div>

          <div className="order-modal__footer-right">
            <button
              type="button"
              className="order-modal__btn-close"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
