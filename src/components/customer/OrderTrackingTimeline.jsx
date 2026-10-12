import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ShoppingBag,
  CheckCircle2,
  Package,
  Truck,
  PackageCheck,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Calendar,
  Check,
} from "lucide-react";
import { orderAPI, getApiErrorMessage } from "../../services/api";
import "./OrderTrackingTimeline.css";

/**
 * 5 Mốc chuẩn quy trình giao nhận cao cấp LUMORA
 */
const TRACKING_STEPS = [
  {
    key: "pending",
    title: "Đặt hàng thành công",
    description: "Hệ thống LUMORA đã tiếp nhận đơn hàng",
    icon: ShoppingBag,
  },
  {
    key: "confirmed",
    title: "Đã xác nhận",
    description: "Xác thực thanh toán & duyệt lệnh xuất kho",
    icon: CheckCircle2,
  },
  {
    key: "processing",
    title: "Đang đóng gói",
    description: "Kiểm định nghệ nhân & đóng kiện an toàn",
    icon: Package,
  },
  {
    key: "shipping",
    title: "Đang giao hàng",
    description: "Chuyên xe dịch vụ White-Glove đang vận chuyển",
    icon: Truck,
  },
  {
    key: "delivered",
    title: "Giao hàng thành công",
    description: "Đã bàn giao không gian và nghiệm thu hoàn tất",
    icon: PackageCheck,
  },
];

// Thứ tự chỉ số trạng thái để tính tiến trình
const STATUS_INDEX_MAP = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipping: 3,
  delivered: 4,
};

function formatStepTime(isoString) {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

export default function OrderTrackingTimeline({
  orderId,
  trackingData: initialTracking,
  status: propStatus,
  createdAt: propCreatedAt,
  updatedAt: propUpdatedAt,
  cancelReason: propCancelReason,
  variant = "full", // "full" | "compact" | "vertical"
  showCard = false,
  className = "",
  onRefresh,
}) {
  const [tracking, setTracking] = useState(initialTracking || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Đồng bộ props tracking nếu component cha cập nhật
  useEffect(() => {
    if (initialTracking) {
      setTracking(initialTracking);
    }
  }, [initialTracking]);

  // Tự động fetch API tracking nếu có orderId và chưa có data
  const fetchTracking = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await orderAPI.getOrderTracking(orderId);
      const data = res.data?.tracking || res.data || null;
      setTracking(data);
      if (onRefresh) onRefresh(data);
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        "Không thể tải tiến trình theo dõi đơn hàng."
      );
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, onRefresh]);

  useEffect(() => {
    if (orderId && !initialTracking) {
      fetchTracking();
    }
  }, [orderId, initialTracking, fetchTracking]);

  // Trích xuất thông tin trạng thái & thời gian thực tế
  const activeStatus = String(
    tracking?.status || propStatus || "pending"
  ).toLowerCase().trim();

  const isCancelled = activeStatus === "cancelled";
  const isRejected = activeStatus === "rejected";
  const isTerminated = isCancelled || isRejected;

  const createdAt = tracking?.createdAt || propCreatedAt;
  const updatedAt = tracking?.updatedAt || propUpdatedAt;
  const cancelReason =
    tracking?.cancelReason || propCancelReason || "Khách hàng yêu cầu hủy đơn";

  // Xác định mốc hiện tại (index: 0..4)
  const currentIndex = isTerminated
    ? -1
    : STATUS_INDEX_MAP[activeStatus] ?? 0;

  // Tính phần trăm thanh tiến trình connector bar
  const progressPercent = useMemo(() => {
    if (isTerminated) return 0;
    if (currentIndex <= 0) return 0;
    if (currentIndex >= 4) return 100;
    return (currentIndex / (TRACKING_STEPS.length - 1)) * 100;
  }, [currentIndex, isTerminated]);

  // Gắn thời gian cho từng bước
  const getStepTimestamp = (stepKey, stepIdx) => {
    // Bước 0: Đặt hàng thành công luôn là createdAt
    if (stepIdx === 0) {
      return formatStepTime(createdAt);
    }

    // Nếu có logs/timeline từ backend
    if (Array.isArray(tracking?.timeline)) {
      const matched = tracking.timeline.find(
        (t) => String(t.status).toLowerCase() === stepKey
      );
      if (matched?.timestamp) return formatStepTime(matched.timestamp);
    }

    // Nếu là bước hiện tại thì dùng updatedAt
    if (stepIdx === currentIndex) {
      return formatStepTime(updatedAt) || "Đang xử lý";
    }

    // Nếu bước đã qua
    if (stepIdx < currentIndex) {
      return "Đã hoàn thành";
    }

    // Bước tương lai
    return null;
  };

  // ================= RENDER DẠNG THU GỌN (COMPACT) =================
  if (variant === "compact") {
    if (isTerminated) {
      return (
        <div className={`lumora-tracking-compact lumora-tracking--cancelled ${className}`}>
          <div className="lumora-tracking-compact__bar">
            <div className="lumora-tracking-compact__dot lumora-tracking-compact__dot--completed" />
            <div className="lumora-tracking-compact__line lumora-tracking-compact__line--active" />
            <div
              className="lumora-tracking-compact__dot"
              style={{ backgroundColor: "#ef4444" }}
            />
          </div>
          <div className="lumora-tracking-compact__info">
            <span className="lumora-tracking-compact__status" style={{ color: "#dc2626" }}>
              {isCancelled ? "Đã hủy đơn" : "Bị từ chối"}
            </span>
            <span className="lumora-tracking-compact__time">
              {formatStepTime(updatedAt)}
            </span>
          </div>
        </div>
      );
    }

    const currentStepObj = TRACKING_STEPS[currentIndex] || TRACKING_STEPS[0];

    return (
      <div className={`lumora-tracking-compact ${className}`}>
        <div className="lumora-tracking-compact__bar">
          {TRACKING_STEPS.map((s, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <React.Fragment key={s.key}>
                <div
                  className={`lumora-tracking-compact__dot ${
                    isCompleted
                      ? "lumora-tracking-compact__dot--completed"
                      : isCurrent
                      ? "lumora-tracking-compact__dot--current"
                      : ""
                  }`}
                  title={s.title}
                />
                {idx < TRACKING_STEPS.length - 1 && (
                  <div
                    className={`lumora-tracking-compact__line ${
                      idx < currentIndex
                        ? "lumora-tracking-compact__line--active"
                        : ""
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="lumora-tracking-compact__info">
          <span className="lumora-tracking-compact__status">
            {currentStepObj.title}
          </span>
          <span className="lumora-tracking-compact__time">
            {formatStepTime(updatedAt || createdAt)}
          </span>
        </div>
      </div>
    );
  }

  // ================= NỘI DUNG CHÍNH (FULL HOẶC VERTICAL) =================
  const renderContent = () => {
    if (isLoading && !tracking) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-stone-500 gap-3">
          <RefreshCw size={24} className="animate-spin text-amber-800" />
          <p className="text-xs font-serif tracking-wider">Đang cập nhật tiến trình đơn hàng LUMORA...</p>
        </div>
      );
    }

    if (error && !tracking) {
      return (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          {orderId && (
            <button
              type="button"
              onClick={fetchTracking}
              className="px-3 py-1 bg-white border border-rose-300 rounded-lg text-rose-800 font-bold hover:bg-rose-100 transition-colors"
            >
              Thử lại
            </button>
          )}
        </div>
      );
    }

    // TRƯỜNG HỢP ĐƠN HÀNG ĐÃ BỊ HỦY HOẶC TỪ CHỐI
    if (isTerminated) {
      return (
        <div className="lumora-tracking-timeline lumora-tracking--cancelled">
          <div className="lumora-tracking-vertical">
            {/* Bước 1: Đặt hàng thành công */}
            <div className="lumora-tracking-vstep lumora-tracking-vstep--completed">
              <div className="lumora-tracking-vstep__node">
                <ShoppingBag size={18} />
              </div>
              <div className="lumora-tracking-vstep__content">
                <div className="lumora-tracking-vstep__head">
                  <h4 className="lumora-tracking-vstep__title">Đặt hàng thành công</h4>
                  <span className="lumora-tracking-vstep__time">
                    {formatStepTime(createdAt) || "---"}
                  </span>
                </div>
                <p className="lumora-tracking-vstep__desc">
                  Đơn hàng được gửi lên hệ thống LUMORA.
                </p>
              </div>
            </div>

            {/* Bước 2: Đã hủy đơn hàng */}
            <div className="lumora-tracking-vstep lumora-tracking-vstep--cancelled">
              <div className="lumora-tracking-vstep__node">
                <XCircle size={18} />
              </div>
              <div className="lumora-tracking-vstep__content">
                <div className="lumora-tracking-vstep__head">
                  <h4 className="lumora-tracking-vstep__title">
                    {isCancelled ? "Đơn hàng đã được hủy" : "Đơn hàng bị từ chối"}
                  </h4>
                  <span className="lumora-tracking-vstep__time" style={{ color: "#dc2626" }}>
                    {formatStepTime(updatedAt) || "---"}
                  </span>
                </div>
                <p className="lumora-tracking-vstep__desc">
                  Quy trình xử lý đơn hàng đã dừng lại.
                </p>
              </div>
            </div>
          </div>

          <div className="lumora-tracking-cancelled-banner">
            <AlertCircle size={20} className="shrink-0 text-red-600 mt-0.5" />
            <div className="lumora-tracking-cancelled-banner__text">
              <strong className="block font-semibold mb-1">
                Lý do: {cancelReason}
              </strong>
              <span>
                Nếu quý khách cần tư vấn hoặc đặt lại đơn hàng, vui lòng liên hệ bộ phận hỗ trợ khách hàng LUMORA để được phục vụ.
              </span>
            </div>
          </div>
        </div>
      );
    }

    // NẾU LÀ VARIANT VERTICAL
    if (variant === "vertical") {
      return (
        <div className="lumora-tracking-timeline">
          <div className="lumora-tracking-vertical">
            {TRACKING_STEPS.map((s, idx) => {
              const isCompleted = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const isUpcoming = idx > currentIndex;
              const StepIcon = s.icon;
              const timeStr = getStepTimestamp(s.key, idx);

              return (
                <div
                  key={s.key}
                  className={`lumora-tracking-vstep ${
                    isCompleted
                      ? "lumora-tracking-vstep--completed"
                      : isCurrent
                      ? "lumora-tracking-vstep--current"
                      : "lumora-tracking-vstep--upcoming"
                  }`}
                >
                  <div className="lumora-tracking-vstep__node">
                    {isCompleted ? <Check size={18} /> : <StepIcon size={18} />}
                  </div>

                  <div className="lumora-tracking-vstep__content">
                    <div className="lumora-tracking-vstep__head">
                      <div className="flex items-center gap-2">
                        <h4 className="lumora-tracking-vstep__title">{s.title}</h4>
                        {isCurrent && (
                          <span className="lumora-tracking-step__badge-current">
                            Hiện tại
                          </span>
                        )}
                      </div>
                      {timeStr && (
                        <span className="lumora-tracking-vstep__time">
                          {timeStr}
                        </span>
                      )}
                    </div>
                    <p className="lumora-tracking-vstep__desc">{s.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // MẶC ĐỊNH VARIANT "FULL": HORIZONTAL STEPPER TRÊN DESKTOP + VERTICAL FALLBACK CHO MOBILE
    return (
      <div className="lumora-tracking-timeline">
        {/* Horizontal View (Desktop & Tablet) */}
        <div className="lumora-tracking-horizontal">
          {/* Connector Line Track */}
          <div className="lumora-tracking-horizontal__track">
            <div
              className="lumora-tracking-horizontal__progress"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Stepper Nodes */}
          {TRACKING_STEPS.map((s, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isUpcoming = idx > currentIndex;
            const StepIcon = s.icon;
            const timeStr = getStepTimestamp(s.key, idx);

            return (
              <div
                key={s.key}
                className={`lumora-tracking-step ${
                  isCompleted
                    ? "lumora-tracking-step--completed"
                    : isCurrent
                    ? "lumora-tracking-step--current"
                    : "lumora-tracking-step--upcoming"
                }`}
              >
                <div className="lumora-tracking-step__node">
                  {isCompleted ? <Check size={18} strokeWidth={2.5} /> : <StepIcon size={18} />}
                </div>

                {isCurrent && (
                  <span className="lumora-tracking-step__badge-current">
                    Đang xử lý
                  </span>
                )}

                <h4 className="lumora-tracking-step__title">{s.title}</h4>
                <p className="lumora-tracking-step__desc">{s.description}</p>

                {timeStr && (
                  <span className="lumora-tracking-step__time">
                    <Clock size={11} className="shrink-0" />
                    <span>{timeStr}</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Vertical Fallback View (Tự động hiển thị trên Mobile qua media query CSS) */}
        <div className="lumora-tracking-vertical lumora-tracking-horizontal-responsive-fallback hidden">
          {TRACKING_STEPS.map((s, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const StepIcon = s.icon;
            const timeStr = getStepTimestamp(s.key, idx);

            return (
              <div
                key={s.key}
                className={`lumora-tracking-vstep ${
                  isCompleted
                    ? "lumora-tracking-vstep--completed"
                    : isCurrent
                    ? "lumora-tracking-vstep--current"
                    : "lumora-tracking-vstep--upcoming"
                }`}
              >
                <div className="lumora-tracking-vstep__node">
                  {isCompleted ? <Check size={18} /> : <StepIcon size={18} />}
                </div>
                <div className="lumora-tracking-vstep__content">
                  <div className="lumora-tracking-vstep__head">
                    <div className="flex items-center gap-2">
                      <h4 className="lumora-tracking-vstep__title">{s.title}</h4>
                      {isCurrent && (
                        <span className="lumora-tracking-step__badge-current">
                          Đang xử lý
                        </span>
                      )}
                    </div>
                    {timeStr && (
                      <span className="lumora-tracking-vstep__time">
                        {timeStr}
                      </span>
                    )}
                  </div>
                  <p className="lumora-tracking-vstep__desc">{s.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // NẾU CÓ PROP showCard: Bọc toàn bộ trong Card sang trọng phong cách Modern Luxury
  if (showCard) {
    return (
      <div
        className={`bg-white rounded-2xl border border-stone-200/90 shadow-sm p-5 sm:p-6 transition-all ${className}`}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest uppercase font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Live Timeline
              </span>
              <h3 className="text-base font-serif font-bold text-stone-900">
                Tiến Trình Đơn Hàng #{orderId ? orderId.slice(-8).toUpperCase() : ""}
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Dịch vụ giao nhận White-Glove tiêu chuẩn Châu Âu
            </p>
          </div>

          {orderId && (
            <button
              type="button"
              onClick={fetchTracking}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Làm mới tiến trình"
            >
              <RefreshCw
                size={13}
                className={isLoading ? "animate-spin text-amber-800" : ""}
              />
              <span>Cập nhật</span>
            </button>
          )}
        </div>

        {renderContent()}
      </div>
    );
  }

  return <div className={className}>{renderContent()}</div>;
}
