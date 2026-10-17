import { useState, useEffect } from "react";
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
import OrderTrackingTimeline from "./OrderTrackingTimeline";
import { PRODUCT_IMAGE_OVERRIDES } from "../../utils/formatters";
import "./OrderTrackingModal.css";

const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80";

export default function OrderTrackingModal({
  isOpen,
  onClose,
  order: initialOrder,
  orderId: propOrderId,
  onViewFullDetail,
  onCancelClick,
}) {
  const [fetchedOrder, setFetchedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  const order = initialOrder || fetchedOrder || null;
  const activeOrderId = order?._id || order?.id || propOrderId;

  // Khóa scroll body khi mở modal
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

  // Fetch dữ liệu nếu cần
  useEffect(() => {
    if (!isOpen || !activeOrderId) return;

    let isMounted = true;
    async function fetchOrderInfo() {
      // Nếu đã có đủ thông tin order và shippingAddress thì không cần fetch lại
      if (order?.shippingAddress && order?.items) return;

      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await orderAPI.getMyOrderById(activeOrderId);
        if (!isMounted) return;
        const fetched = res.data?.order || res.data || null;
        if (fetched) {
          setFetchedOrder(fetched);
        }
      } catch (err) {
        if (isMounted) {
          setLoadError(
            getApiErrorMessage(err, "Không thể tải thông tin tiến trình đơn hàng.")
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchOrderInfo();
    return () => {
      isMounted = false;
    };
  }, [isOpen, activeOrderId, order]);

  if (!isOpen) return null;

  const handleCopyId = () => {
    if (!activeOrderId) return;
    navigator.clipboard?.writeText(activeOrderId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const shipping = order?.shippingAddress || {};
  const items = order?.items || [];
  const canCancel = order?.status === "pending";

  const formattedDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Đang cập nhật";

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
              <Truck size={13} className="text-amber-800 shrink-0" />
              THEO DÕI VẬN ĐƠN WHITE-GLOVE
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
              <span>Đang kết nối hệ thống định vị vận đơn LUMORA...</span>
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
                  cancelReason={order?.cancelReason}
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
                      <span>Dịch vụ giao nhận White-Glove chuẩn Châu Âu</span>
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
                      {items.map((it, idx) => {
                        const fallbackImg =
                          PRODUCT_IMAGE_OVERRIDES[it.productName]?.[0] ||
                          FALLBACK_PRODUCT_IMAGE;
                        const itemImg =
                          it.image ||
                          it.productImage ||
                          it.product?.images?.[0] ||
                          fallbackImg;

                        return (
                          <div
                            key={it._id || idx}
                            className="lumora-track-modal__item-row"
                          >
                            <img
                              src={itemImg}
                              alt={it.productName || "Sản phẩm"}
                              className="lumora-track-modal__item-thumb"
                              onError={(e) => {
                                e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                              }}
                            />
                            <div className="lumora-track-modal__item-info">
                              <span className="lumora-track-modal__item-title">
                                {it.productName || "Nội thất cao cấp LUMORA"}
                              </span>
                              <span className="lumora-track-modal__item-qty">
                                Số lượng: <strong>x{it.quantity || 1}</strong>
                              </span>
                            </div>
                          </div>
                        );
                      })}
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
            {canCancel && onCancelClick && (
              <button
                type="button"
                className="lumora-track-modal__btn-cancel-order"
                onClick={() => {
                  onClose();
                  onCancelClick(order);
                }}
              >
                Hủy Đơn Hàng
              </button>
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
      </div>
    </div>
  );
}
