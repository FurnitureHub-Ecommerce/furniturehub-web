import { useState } from "react";
import {
  Search,
  Truck,
  X,
  AlertCircle,
  Calendar,
  Eye,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { orderAPI, getApiErrorMessage } from "../../services/api";
import OrderTrackingTimeline from "./OrderTrackingTimeline";
import OrderStatusBadge from "../order/OrderStatusbadge/OrderStatusBadge";

export default function QuickOrderTrack({
  onViewOrderDetail,
  className = "",
  initialOrderId = "",
}) {
  const [searchCode, setSearchCode] = useState(initialOrderId);
  const [isSearching, setIsSearching] = useState(false);
  const [trackResult, setTrackResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    const trimmed = searchCode.trim();

    if (!trimmed) {
      setErrorMsg("Vui lòng nhập mã đơn hàng cần tra cứu.");
      return;
    }

    setIsSearching(true);
    setErrorMsg(null);
    setTrackResult(null);

    try {
      // Gọi API Tracking chính thức từ backend
      const res = await orderAPI.getOrderTracking(trimmed);
      const data = res.data?.tracking || res.data;

      if (!data) {
        throw new Error("Không tìm thấy thông tin tiến trình cho đơn hàng này.");
      }

      setTrackResult(data);
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        "Không tìm thấy đơn hàng hoặc mã đơn không thuộc quyền sở hữu của quý khách."
      );
      setErrorMsg(msg);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSearchCode("");
    setTrackResult(null);
    setErrorMsg(null);
  };

  return (
    <div
      className={`bg-gradient-to-br from-[#FAF8F5] via-[#F7F4EE] to-[#EFE9DF] rounded-2xl p-5 sm:p-7 border border-[#E2DBD0] shadow-sm mb-8 transition-all ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#E2D5C3] text-[#705437]">
              <Sparkles size={11} />
              Quick Tracking
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#252525]">
            Tra Cứu Lịch Trình Đơn Hàng Nhanh
          </h2>
          <p className="text-xs text-[#6E6860] mt-0.5">
            Nhập mã định danh đơn hàng để cập nhật trạng thái vận chuyển White-Glove theo thời gian thực.
          </p>
        </div>
      </div>

      {/* Form Input */}
      <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A6A48]">
            <Search size={18} />
          </div>

          <input
            type="text"
            value={searchCode}
            onChange={(e) => {
              setSearchCode(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="Nhập mã đơn hàng (ví dụ: 6512abcd34ef56...)"
            className="w-full pl-11 pr-10 py-3 bg-white border border-[#DED5C8] rounded-xl text-xs sm:text-sm text-[#252525] placeholder:text-[#A8A096] focus:outline-none focus:ring-2 focus:ring-[#8A6A48]/30 focus:border-[#8A6A48] transition-all shadow-inner"
          />

          {searchCode && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
              title="Xóa mã"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isSearching || !searchCode.trim()}
          className="px-6 py-3 bg-[#252525] hover:bg-[#8A6A48] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg shrink-0"
        >
          {isSearching ? (
            <>
              <RefreshCw size={16} className="animate-spin text-[#C5A880]" />
              <span>Đang kiểm tra...</span>
            </>
          ) : (
            <>
              <Truck size={16} />
              <span>Tra Cứu Tiến Độ</span>
            </>
          )}
        </button>
      </form>

      {/* Alert Error */}
      {errorMsg && (
        <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200/90 rounded-xl text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <AlertCircle size={16} className="shrink-0 text-rose-600" />
          <span className="flex-1 leading-relaxed">{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-500 hover:text-rose-800 text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tra cứu thành công: Hiển thị Timeline & Card kết quả */}
      {trackResult && (
        <div className="mt-5 bg-white rounded-xl border border-[#E2DBD0] p-4 sm:p-6 shadow-sm animate-in fade-in zoom-in-98 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#F0EAE1] gap-3">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-bold text-[#8A6A48] bg-[#F7F4EE] px-2.5 py-1 rounded-md border border-[#E9E1D5]">
                  Mã: #{trackResult.orderId?.slice(-8).toUpperCase() || trackResult.orderId}
                </span>
                <OrderStatusBadge status={trackResult.status} />
              </div>
              <p className="text-[11px] text-[#6E6860] mt-1.5 flex items-center gap-1">
                <Calendar size={12} />
                <span>
                  Khởi tạo:{" "}
                  {trackResult.createdAt
                    ? new Date(trackResult.createdAt).toLocaleString("vi-VN")
                    : "---"}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onViewOrderDetail && (
                <button
                  type="button"
                  onClick={() => onViewOrderDetail(trackResult.orderId)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#8A6A48] bg-[#F7F4EE] hover:bg-[#E9E1D5] border border-[#E2DBD0] rounded-lg transition-colors cursor-pointer"
                >
                  <Eye size={14} />
                  <span>Xem Chi Tiết Đơn</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setTrackResult(null)}
                className="px-2.5 py-2 text-xs text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                title="Đóng kết quả"
              >
                ✕ Đóng
              </button>
            </div>
          </div>

          {/* Stepper Timeline trực quan */}
          <OrderTrackingTimeline
            trackingData={trackResult}
            status={trackResult.status}
            createdAt={trackResult.createdAt}
            updatedAt={trackResult.updatedAt}
            variant="full"
          />
        </div>
      )}
    </div>
  );
}
