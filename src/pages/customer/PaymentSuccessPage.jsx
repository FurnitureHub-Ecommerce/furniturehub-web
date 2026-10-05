import React, { useState, useEffect } from "react";
import { Link, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  ArrowRight,
  ShoppingBag,
  Clock,
  ShieldCheck,
  PhoneCall,
  QrCode,
  Copy,
  Check,
} from "lucide-react";
import { orderAPI, paymentAPI, getApiErrorMessage } from "../../services/api";
import { formatCurrency } from "../../utils/formatters";
import "./PaymentResult.css";

const formatVND = (price) => formatCurrency(price);

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const queryOrderId = searchParams.get("orderId");
  const queryMethod = searchParams.get("method");

  const [order, setOrder] = useState(location.state?.order || null);
  const [payment, setPayment] = useState(location.state?.payment || null);
  const [isLoading, setIsLoading] = useState(!location.state?.order && Boolean(queryOrderId));
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const orderId = order?._id || order?.id || queryOrderId;
  const paymentMethod = payment?.paymentMethod || queryMethod || order?.paymentMethod || "COD";

  useEffect(() => {
    let isMounted = true;

    async function loadOrderAndPayment() {
      if (!queryOrderId) return;
      setIsLoading(true);

      try {
        const [orderRes, payRes] = await Promise.allSettled([
          orderAPI.getMyOrderById(queryOrderId),
          paymentAPI.getPaymentByOrder(queryOrderId),
        ]);

        if (!isMounted) return;

        if (orderRes.status === "fulfilled" && orderRes.value?.data) {
          const ord = orderRes.value.data.order || orderRes.value.data;
          setOrder(ord);
        }

        if (payRes.status === "fulfilled" && payRes.value?.data) {
          const pay = payRes.value.data.payment || payRes.value.data;
          setPayment(pay);
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Could not fetch order/payment details:", err.message);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (!order && queryOrderId) {
      loadOrderAndPayment();
    }
  }, [queryOrderId, order]);

  const handleCopy = (text, fieldName) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const shipping = order?.shippingAddress || {};
  const items = order?.items || [];
  const totalAmount = order?.totalAmount ?? order?.subtotal ?? 0;

  return (
    <div className="section container payment-result-page">
      <div className="payment-result-card payment-result-card--success">
        {/* Animated Check Icon */}
        <div className="payment-result__icon-wrap payment-result__icon-wrap--success">
          <div className="payment-result__icon-ring" />
          <CheckCircle2 size={54} className="payment-result__icon" />
        </div>

        {/* Heading */}
        <span className="payment-result__badge">GIAO DỊCH THÀNH CÔNG</span>
        <h1 className="payment-result__title">Cảm Ơn Quý Khách Đã Đặt Hàng!</h1>
        <p className="payment-result__subtitle">
          Đơn hàng của quý khách đã được chuyển tới bộ phận xử lý và chế tác. Chuyên viên dịch vụ White-Glove của LUMORA sẽ liên hệ để xác nhận thời gian giao lắp thuận tiện nhất.
        </p>

        {/* Order Identifier Box */}
        {orderId && (
          <div className="payment-result__order-code-box">
            <span className="payment-result__order-code-label">MÃ ĐƠN HÀNG:</span>
            <strong className="payment-result__order-code-val">
              #{orderId}
            </strong>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="payment-result__loading">
            Đang đồng bộ dữ liệu đơn hàng từ máy chủ...
          </div>
        )}

        {/* Order Details Breakdown */}
        {order && (
          <div className="payment-result__details-grid">
            {/* Left Card: Customer & Shipping Info */}
            <div className="payment-result__info-box">
              <h3 className="payment-result__info-title">
                <MapPin size={17} /> Thông Tin Giao Hàng
              </h3>
              <div className="payment-result__info-content">
                <p>
                  <strong>Người nhận:</strong> {shipping.receiverName || "Khách hàng"}
                </p>
                <p>
                  <strong>Số điện thoại:</strong> {shipping.phone || "---"}
                </p>
                <p>
                  <strong>Địa chỉ:</strong>{" "}
                  {[shipping.addressLine, shipping.ward, shipping.city]
                    .filter(Boolean)
                    .join(", ") || "---"}
                </p>
                <div className="payment-result__delivery-tag">
                  <Truck size={14} /> Giao hàng & lắp đặt miễn phí (White-Glove)
                </div>
              </div>
            </div>

            {/* Right Card: Payment Summary */}
            <div className="payment-result__info-box">
              <h3 className="payment-result__info-title">
                <CreditCard size={17} /> Trạng Thái Thanh Toán
              </h3>
              <div className="payment-result__info-content">
                <p>
                  <strong>Hình thức:</strong>{" "}
                  {paymentMethod === "BANK_TRANSFER"
                    ? "Chuyển khoản Ngân hàng (VietQR / VNPAY)"
                    : "Thanh toán khi nhận hàng (COD)"}
                </p>
                <p>
                  <strong>Trạng thái:</strong>{" "}
                  <span className="payment-result__status-pill">
                    {payment?.status === "paid"
                      ? "Đã thanh toán"
                      : paymentMethod === "BANK_TRANSFER"
                      ? "Chờ xác nhận chuyển khoản"
                      : "Thanh toán khi nhận hàng"}
                  </span>
                </p>
                <p>
                  <strong>Tổng thanh toán:</strong>{" "}
                  <span className="payment-result__total-highlight">
                    {formatVND(totalAmount)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VietQR Bank Details Box (If Bank Transfer) */}
        {paymentMethod === "BANK_TRANSFER" && totalAmount > 0 && (
          <div className="payment-result__bank-box">
            <div className="payment-result__bank-header">
              <QrCode size={20} />
              <h4>Mã VietQR Chuyển Khoản Đơn Hàng</h4>
            </div>
            <p className="payment-result__bank-desc">
              Nếu quý khách chưa kịp quét mã, vui lòng mở App ngân hàng quét mã bên dưới hoặc chuyển theo thông tin:
            </p>

            <div className="payment-result__bank-content">
              <div className="payment-result__qr-wrap">
                <img
                  src={`https://img.vietqr.io/image/MB-0912345678-compact2.png?amount=${totalAmount}&addInfo=DH${(
                    orderId || ""
                  )
                    .slice(-6)
                    .toUpperCase()}&accountName=CONG%20TY%20NOI%20THAT%20LUMORA`}
                  alt="VietQR Re-pay"
                  className="payment-result__qr-img"
                />
              </div>

              <div className="payment-result__bank-rows">
                <div className="payment-result__bank-row">
                  <span>Ngân hàng:</span>
                  <strong>MB Bank (Ngân hàng Quân Đội)</strong>
                </div>
                <div className="payment-result__bank-row">
                  <span>Số tài khoản:</span>
                  <div className="payment-result__copyable">
                    <strong>0912 345 678</strong>
                    <button
                      type="button"
                      className="payment-result__copy-btn"
                      onClick={() => handleCopy("0912345678", "acc")}
                    >
                      {copiedField === "acc" ? (
                        <Check size={13} className="text-emerald-600" />
                      ) : (
                        <Copy size={13} />
                      )}
                      {copiedField === "acc" ? "Đã chép" : "Sao chép"}
                    </button>
                  </div>
                </div>
                <div className="payment-result__bank-row">
                  <span>Chủ tài khoản:</span>
                  <strong>CONG TY TNHH NOI THAT LUMORA</strong>
                </div>
                <div className="payment-result__bank-row">
                  <span>Số tiền:</span>
                  <strong className="text-amber-900 font-bold">
                    {formatVND(totalAmount)}
                  </strong>
                </div>
                <div className="payment-result__bank-row">
                  <span>Cú pháp:</span>
                  <div className="payment-result__copyable">
                    <strong className="text-amber-800">
                      DH{(orderId || "").slice(-6).toUpperCase()}
                    </strong>
                    <button
                      type="button"
                      className="payment-result__copy-btn"
                      onClick={() =>
                        handleCopy(
                          `DH${(orderId || "").slice(-6).toUpperCase()}`,
                          "syntax",
                        )
                      }
                    >
                      {copiedField === "syntax" ? (
                        <Check size={13} className="text-emerald-600" />
                      ) : (
                        <Copy size={13} />
                      )}
                      {copiedField === "syntax" ? "Đã chép" : "Sao chép"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="payment-result__actions">
          <Link to="/orders" className="payment-result__btn-primary">
            <Package size={17} /> Xem Đơn Hàng Của Tôi
          </Link>
          <Link to="/products" className="payment-result__btn-secondary">
            <ShoppingBag size={17} /> Tiếp Tục Mua Sắm
          </Link>
        </div>

        {/* Customer Care Guarantee Footer */}
        <div className="payment-result__footer">
          <div className="payment-result__footer-item">
            <ShieldCheck size={18} />
            <span>Bảo hành kết cấu 5 năm & Bảo trì định kỳ trọn đời</span>
          </div>
          <div className="payment-result__footer-item">
            <PhoneCall size={18} />
            <span>Hotline hỗ trợ CSKH 24/7: 1900 8888 (Miễn phí)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
