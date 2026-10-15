import React from "react";
import {
  ShoppingBag,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import "./OrderStatusStepper.css";

// 4 mốc tiêu chuẩn của quy trình đơn hàng LUMORA
const STANDARD_STEPS = [
  {
    key: "pending",
    title: "Đặt hàng",
    subtitle: "Đơn hàng đã tiếp nhận",
    icon: ShoppingBag,
  },
  {
    key: "confirmed",
    title: "Đã xác nhận",
    subtitle: "Kho kiểm tra & đóng gói",
    icon: CheckCircle2,
  },
  {
    key: "shipping",
    title: "Đang vận chuyển",
    subtitle: "Dịch vụ giao White-Glove",
    icon: Truck,
  },
  {
    key: "delivered",
    title: "Đã giao hàng",
    subtitle: "Hoàn tất bàn giao",
    icon: PackageCheck,
  },
];

// Mapping thứ tự mốc
const STEP_INDEX = {
  pending: 0,
  confirmed: 1,
  shipping: 2,
  delivered: 3,
};

export default function OrderStatusStepper({
  status = "pending",
  variant = "full",
  createdAt,
  updatedAt,
}) {
  const normStatus = String(status).toLowerCase().trim();
  const isCancelled = normStatus === "cancelled";
  const isRejected = normStatus === "rejected";
  const isTerminated = isCancelled || isRejected;

  const currentIdx = STEP_INDEX[normStatus] ?? (isTerminated ? -1 : 0);

  // Nếu là đơn đã hủy / từ chối
  if (isTerminated) {
    if (variant === "compact") {
      return (
        <div className="order-stepper-compact order-stepper-compact--cancelled">
          <div className="order-stepper-compact__bar">
            <span className="order-stepper-compact__node order-stepper-compact__node--completed">
              <ShoppingBag size={12} />
            </span>
            <div className="order-stepper-compact__line order-stepper-compact__line--cancelled" />
            <span className="order-stepper-compact__node order-stepper-compact__node--cancelled">
              <XCircle size={12} />
            </span>
          </div>
          <div className="order-stepper-compact__label-wrap">
            <span className="order-stepper-compact__label">Đặt hàng</span>
            <span className="order-stepper-compact__label order-stepper-compact__label--cancelled">
              {isCancelled ? "Đã hủy đơn" : "Đã từ chối"}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="order-stepper-full order-stepper-full--cancelled">
        <div className="order-stepper-full__track">
          {/* Bước 1: Đặt hàng */}
          <div className="order-step-item order-step-item--completed">
            <div className="order-step-item__icon-wrap">
              <ShoppingBag size={18} />
            </div>
            <div className="order-step-item__content">
              <span className="order-step-item__title">Đặt hàng</span>
              <span className="order-step-item__desc">
                {createdAt
                  ? new Date(createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Đã tiếp nhận"}
              </span>
            </div>
          </div>

          {/* Đường nối */}
          <div className="order-step-divider order-step-divider--cancelled" />

          {/* Bước 2: Đã hủy */}
          <div className="order-step-item order-step-item--cancelled">
            <div className="order-step-item__icon-wrap order-step-item__icon-wrap--cancelled">
              <XCircle size={18} />
            </div>
            <div className="order-step-item__content">
              <span className="order-step-item__title order-step-item__title--cancelled">
                {isCancelled ? "Đơn hàng đã hủy" : "Đơn hàng bị từ chối"}
              </span>
              <span className="order-step-item__desc">
                {isCancelled
                  ? "Đã xác nhận hủy giao dịch"
                  : "Hết hàng hoặc thông tin không hợp lệ"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chế độ Compact
  if (variant === "compact") {
    return (
      <div className="order-stepper-compact">
        <div className="order-stepper-compact__bar">
          {STANDARD_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <React.Fragment key={step.key}>
                <span
                  className={`order-stepper-compact__node ${
                    isCompleted
                      ? "order-stepper-compact__node--completed"
                      : isCurrent
                      ? "order-stepper-compact__node--current"
                      : "order-stepper-compact__node--upcoming"
                  }`}
                  title={`${step.title} (${
                    isCompleted
                      ? "Đã xong"
                      : isCurrent
                      ? "Đang xử lý"
                      : "Chờ tiến trình"
                  })`}
                >
                  <Icon size={12} />
                </span>
                {idx < STANDARD_STEPS.length - 1 && (
                  <div
                    className={`order-stepper-compact__line ${
                      idx < currentIdx
                        ? "order-stepper-compact__line--completed"
                        : "order-stepper-compact__line--upcoming"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="order-stepper-compact__label-wrap">
          {STANDARD_STEPS.map((step, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <span
                key={step.key}
                className={`order-stepper-compact__label ${
                  isCurrent
                    ? "order-stepper-compact__label--current"
                    : isCompleted
                    ? "order-stepper-compact__label--completed"
                    : "order-stepper-compact__label--upcoming"
                }`}
              >
                {step.title}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  // Chế độ Full (Timeline trực quan cho Modal chi tiết & trang chi tiết)
  return (
    <div className="order-stepper-full">
      <div className="order-stepper-full__track">
        {STANDARD_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isUpcoming = idx > currentIdx;

          return (
            <React.Fragment key={step.key}>
              <div
                className={`order-step-item ${
                  isCompleted
                    ? "order-step-item--completed"
                    : isCurrent
                    ? "order-step-item--current"
                    : "order-step-item--upcoming"
                }`}
              >
                <div className="order-step-item__icon-wrap">
                  <Icon size={18} />
                  {isCurrent && (
                    <span className="order-step-item__pulse-ring" />
                  )}
                </div>
                <div className="order-step-item__content">
                  <span className="order-step-item__title">{step.title}</span>
                  <span className="order-step-item__desc">
                    {isCurrent
                      ? "Đang tiến hành"
                      : isCompleted
                      ? "Đã hoàn thành"
                      : step.subtitle}
                  </span>
                </div>
              </div>

              {idx < STANDARD_STEPS.length - 1 && (
                <div
                  className={`order-step-divider ${
                    idx < currentIdx
                      ? "order-step-divider--completed"
                      : "order-step-divider--upcoming"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
