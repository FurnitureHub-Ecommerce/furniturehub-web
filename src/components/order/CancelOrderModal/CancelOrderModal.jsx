import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  X,
  Loader2,
  CheckCircle,
  HelpCircle,
  Package,
} from "lucide-react";
import { orderAPI, getApiErrorMessage } from "../../../services/api";
import { formatCurrency } from "../../../utils/formatters";
import "./CancelOrderModal.css";

const CANCEL_REASONS = [
  "Muốn thay đổi địa chỉ giao hàng hoặc thông tin liên hệ",
  "Muốn thay đổi sản phẩm, số lượng hoặc phiên bản màu sắc",
  "Đặt nhầm hoặc phát sinh đơn hàng trùng lặp",
  "Thời gian giao hàng dự kiến không phù hợp",
  "Thay đổi kế hoạch tài chính / chưa có nhu cầu sử dụng",
  "Lý do khác",
];

export default function CancelOrderModal({
  isOpen,
  onClose,
  order,
  onCancelled,
}) {
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedReason(CANCEL_REASONS[0]);
      setCustomReason("");
      setErrorMsg(null);
      setIsSubmitting(false);
    }
  }, [isOpen, order]);

  // Ngăn cuộn trang khi modal mở
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

  if (!isOpen || !order) return null;

  const orderId = order._id || order.id;
  const isPending = String(order.status).toLowerCase() === "pending";

  const handleConfirmCancel = async () => {
    if (!orderId) return;

    if (!isPending) {
      setErrorMsg("Chỉ có thể hủy đơn hàng khi đang ở trạng thái Chờ xác nhận (PENDING).");
      return;
    }

    const finalReason =
      selectedReason === "Lý do khác"
        ? customReason.trim() || "Khách hàng yêu cầu hủy đơn."
        : selectedReason;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await orderAPI.cancelOrder(orderId, {
        reason: finalReason,
        status: "cancelled",
      });

      const updatedOrder = res?.data?.order || res?.data || {
        ...order,
        status: "cancelled",
        cancelReason: finalReason,
      };

      if (onCancelled) {
        onCancelled(updatedOrder);
      }
      onClose();
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        "Không thể hủy đơn hàng vào lúc này. Vui lòng thử lại hoặc liên hệ hotline LUMORA.",
      );
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cancel-modal__overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="cancel-modal__container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cancel-modal__header">
          <div className="cancel-modal__header-left">
            <span className="cancel-modal__badge">XÁC NHẬN YÊU CẦU</span>
            <h3 className="cancel-modal__title">Hủy Đơn Hàng #{orderId?.slice(-8).toUpperCase()}</h3>
          </div>
          <button
            type="button"
            className="cancel-modal__close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="cancel-modal__body">
          {/* Cảnh báo */}
          <div className="cancel-modal__alert">
            <AlertTriangle size={20} className="cancel-modal__alert-icon" />
            <div>
              <p className="cancel-modal__alert-text">
                Quý khách có chắc chắn muốn hủy đơn hàng này không? Sau khi xác nhận, đơn hàng sẽ chuyển sang trạng thái <strong>ĐÃ HỦY</strong> và các sản phẩm sẽ được hoàn trả lại kho lưu trữ.
              </p>
            </div>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="cancel-modal__summary">
            <div className="cancel-modal__summary-row">
              <span>Mã đơn hàng:</span>
              <strong>#{orderId}</strong>
            </div>
            <div className="cancel-modal__summary-row">
              <span>Số lượng sản phẩm:</span>
              <strong>{order.items?.length || 0} mục</strong>
            </div>
            <div className="cancel-modal__summary-row">
              <span>Tổng giá trị đơn:</span>
              <strong className="cancel-modal__summary-total">
                {formatCurrency(order.totalAmount || order.subtotal || 0)}
              </strong>
            </div>
          </div>

          {/* Chọn lý do hủy */}
          <div className="cancel-modal__field">
            <label className="cancel-modal__label">
              Vui lòng cho LUMORA biết lý do quý khách hủy đơn:
            </label>
            <div className="cancel-modal__reasons">
              {CANCEL_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`cancel-modal__reason-item ${
                    selectedReason === reason
                      ? "cancel-modal__reason-item--active"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="cancel_reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    disabled={isSubmitting}
                    className="cancel-modal__radio"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason === "Lý do khác" && (
              <textarea
                className="cancel-modal__textarea"
                rows={3}
                placeholder="Nhập chi tiết lý do hủy đơn của quý khách (tùy chọn)..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                disabled={isSubmitting}
                maxLength={300}
              />
            )}
          </div>

          {/* Thông báo lỗi nếu có */}
          {errorMsg && (
            <div className="cancel-modal__error-alert">
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="cancel-modal__footer">
          <button
            type="button"
            className="cancel-modal__btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Giữ Lại Đơn Hàng
          </button>
          <button
            type="button"
            className="cancel-modal__btn-danger"
            onClick={handleConfirmCancel}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="cancel-modal__spinner" /> Đang Xử Lý Hủy...
              </>
            ) : (
              "Xác Nhận Hủy Đơn"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
