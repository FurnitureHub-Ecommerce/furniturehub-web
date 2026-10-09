import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShoppingBag,
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Lock,
  QrCode,
  Banknote,
  Sparkles,
  Info,
  Clock,
  Copy,
  Check,
} from "lucide-react";
import { useShop } from "../../context/ShopContext";
import {
  addressAPI,
  checkoutAPI,
  orderAPI,
  paymentAPI,
  getApiErrorMessage,
} from "../../services/api";
import { formatCurrency } from "../../utils/formatters";
import AddressSelector from "../../components/customer/AddressSelector";
import "./Checkout.css";

const formatVND = (price) => formatCurrency(price);

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartSubtotal, clearCart, fetchCart, isCartLoading } = useShop();

  // Authentication check
  const token = localStorage.getItem("token");
  const currentUser = (() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  // State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddressLoading, setIsAddressLoading] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState("COD"); // COD | BANK_TRANSFER
  const [deliveryNote, setDeliveryNote] = useState("");

  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Bank Transfer Modal
  const [showBankModal, setShowBankModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // 1. Fetch addresses
  const loadAddresses = useCallback(async () => {
    if (!token) return;
    setIsAddressLoading(true);
    try {
      const res = await addressAPI.getAddresses();
      const list = res.data?.addresses || res.data || [];
      const safeList = Array.isArray(list) ? list : [];
      setAddresses(safeList);

      // Default selection
      if (safeList.length > 0) {
        const def = safeList.find((a) => a.isDefault);
        setSelectedAddressId((prev) => prev || (def ? def._id || def.id : safeList[0]._id || safeList[0].id));
      }
    } catch (err) {
      console.warn("Could not load addresses:", err.message);
    } finally {
      setIsAddressLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadAddresses();
      fetchCart();
    }
  }, [token, loadAddresses, fetchCart]);

  // 2. Validate Cart & Address via checkoutAPI.validate({ addressId })
  useEffect(() => {
    let isCancelled = false;

    async function runCheckoutValidation() {
      if (!token || !selectedAddressId || cart.length === 0) {
        setValidationResult(null);
        setValidationError(null);
        return;
      }

      setIsValidating(true);
      setValidationError(null);

      try {
        const res = await checkoutAPI.validate({ addressId: selectedAddressId });
        if (!isCancelled) {
          setValidationResult(res.data);
        }
      } catch (err) {
        if (!isCancelled) {
          const msg = getApiErrorMessage(
            err,
            "Một số sản phẩm trong giỏ hàng có thể đã thay đổi số lượng hoặc tồn kho.",
          );
          setValidationError(msg);
        }
      } finally {
        if (!isCancelled) {
          setIsValidating(false);
        }
      }
    }

    runCheckoutValidation();

    return () => {
      isCancelled = true;
    };
  }, [selectedAddressId, cart.length, token]);

  // Copy helper
  const handleCopy = (text, fieldName) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // 3. Handle Order & Payment Submission
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!token) {
      navigate("/login?redirect=/checkout");
      return;
    }

    if (!selectedAddressId) {
      setSubmitError("Vui lòng chọn hoặc thêm địa chỉ nhận hàng trước khi đặt.");
      return;
    }

    if (cart.length === 0) {
      setSubmitError("Giỏ hàng của bạn đang trống.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step A: Create Order (POST /api/orders { addressId })
      const orderRes = await orderAPI.createOrder({
        addressId: selectedAddressId,
      });

      const orderData = orderRes.data?.order || orderRes.data;
      const orderId = orderData?._id || orderData?.id;

      if (!orderId) {
        throw new Error("Không nhận được mã đơn hàng từ hệ thống.");
      }

      // Step B: Create Payment (POST /api/orders/{orderId}/payment { paymentMethod })
      let paymentRes = null;
      try {
        paymentRes = await paymentAPI.createPayment(orderId, {
          paymentMethod: paymentMethod === "BANK_TRANSFER" ? "BANK_TRANSFER" : "COD",
        });
      } catch (payErr) {
        console.warn("Payment record creation notice:", payErr.message);
        // If payment fails to create directly, we can still proceed to payment flow
      }

      // Step C: Clear cart upon successful order creation
      await clearCart();

      // Step D: Navigate according to payment method
      if (paymentMethod === "BANK_TRANSFER") {
        setCreatedOrder({
          ...orderData,
          payment: paymentRes?.data?.payment,
        });
        setShowBankModal(true);
      } else {
        // COD -> Directly navigate to payment success screen
        navigate(`/payment-success?orderId=${orderId}&method=COD`, {
          state: { order: orderData, payment: paymentRes?.data?.payment },
        });
      }
    } catch (err) {
      const errorMsg = getApiErrorMessage(
        err,
        "Không thể hoàn tất tạo đơn hàng. Vui lòng kiểm tra lại tồn kho hoặc giỏ hàng.",
      );
      setSubmitError(errorMsg);

      // Điều hướng sang /payment-failed theo quy trình kiểm tra thanh toán
      navigate(`/payment-failed?reason=${encodeURIComponent(errorMsg)}`, {
        state: { reason: errorMsg },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unauthenticated view
  if (!token) {
    return (
      <div className="section container checkout-page">
        <div className="checkout-auth-required">
          <div className="checkout-auth-required__icon">
            <Lock size={36} />
          </div>
          <h2 className="checkout-auth-required__title">
            Đăng Nhập Để Tiếp Tục Thanh Toán
          </h2>
          <p className="checkout-auth-required__desc">
            Để áp dụng sổ địa chỉ, bảo mật đơn hàng và nhận dịch vụ giao hàng White-Glove của LUMORA, vui lòng đăng nhập vào tài khoản của bạn.
          </p>
          <div className="checkout-auth-required__actions">
            <Link
              to="/login?redirect=/checkout"
              className="checkout-btn-primary"
            >
              Đăng Nhập Ngay <ArrowRight size={16} />
            </Link>
            <Link to="/register" className="checkout-btn-secondary">
              Đăng Ký Tài Khoản Mới
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart view
  if (cart.length === 0 && !isCartLoading) {
    return (
      <div className="section container checkout-page">
        <div className="checkout-empty">
          <ShoppingBag size={48} className="checkout-empty__icon" />
          <h2 className="checkout-empty__title">Giỏ Hàng Của Quý Khách Đang Trống</h2>
          <p className="checkout-empty__desc">
            Chưa có sản phẩm nào sẵn sàng thanh toán. Hãy khám phá các thiết kế nội thất mới nhất trong bộ sưu tập LUMORA.
          </p>
          <Link to="/products" className="checkout-btn-primary">
            Khám Phá Bộ Sưu Tập <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const finalAmount = validationResult?.totalAmount ?? cartSubtotal;

  return (
    <div className="section container checkout-page">
      {/* Header */}
      <div className="checkout-header">
        <div className="checkout-header__nav">
          <Link to="/cart" className="checkout-back-link">
            <ArrowLeft size={16} /> Quay lại Giỏ hàng
          </Link>
        </div>
        <div className="checkout-header__titles">
          <span className="checkout-badge">SECURE WHITE-GLOVE CHECKOUT</span>
          <h1 className="checkout-title">Xác Nhận & Thanh Toán Đơn Hàng</h1>
          <p className="checkout-subtitle">
            Hoàn tất các bước dưới đây để chúng tôi chuẩn bị chế tác và giao nhận sản phẩm tận nhà quý khách.
          </p>
        </div>
      </div>

      {/* Global Errors */}
      {submitError && (
        <div className="checkout-alert checkout-alert--error">
          <AlertTriangle size={20} className="shrink-0" />
          <div>
            <strong>Lỗi khi xử lý đơn hàng:</strong>
            <p>{submitError}</p>
          </div>
        </div>
      )}

      {validationError && (
        <div className="checkout-alert checkout-alert--warning">
          <Info size={20} className="shrink-0" />
          <div>
            <strong>Lưu ý về sản phẩm:</strong>
            <p>{validationError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="checkout-layout">
        {/* ================= LEFT COLUMN: DETAILS ================= */}
        <div className="checkout-main">
          {/* STEP 1: Address Selection (Task 6) */}
          <section className="checkout-section">
            <div className="checkout-section__header">
              <span className="checkout-step-number">1</span>
              <div>
                <h2 className="checkout-section__title">Địa Chỉ Nhận Hàng</h2>
                <p className="checkout-section__desc">
                  Chọn địa chỉ giao hàng White-Glove có sẵn hoặc tạo mới nhanh chóng.
                </p>
              </div>
            </div>

            <AddressSelector
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={(id) => setSelectedAddressId(id)}
              onRefresh={loadAddresses}
              loading={isAddressLoading}
            />
          </section>

          {/* STEP 2: Cart Items Review (Task 7) */}
          <section className="checkout-section">
            <div className="checkout-section__header">
              <span className="checkout-step-number">2</span>
              <div>
                <h2 className="checkout-section__title">Sản Phẩm Đặt Mua</h2>
                <p className="checkout-section__desc">
                  Kiểm tra lại danh sách các tác phẩm nội thất trong đơn hàng ({cart.length} món).
                </p>
              </div>
            </div>

            <div className="checkout-items-list">
              {cart.map((item) => {
                const prod = item.product || {};
                const itemPrice = item.unitPrice || prod.price || 0;
                const subtotal = item.itemSubtotal || itemPrice * item.quantity;

                return (
                  <div key={item.itemId || prod.id} className="checkout-item-card">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="checkout-item-card__img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80";
                      }}
                    />
                    <div className="checkout-item-card__details">
                      <h4 className="checkout-item-card__name">{prod.name}</h4>
                      <p className="checkout-item-card__variant">
                        Phiên bản: {prod.variantLabel || "Tiêu chuẩn nghệ nhân"}
                      </p>
                      <div className="checkout-item-card__meta">
                        <span className="checkout-item-card__unit-price">
                          {formatVND(itemPrice)}
                        </span>
                        <span className="checkout-item-card__qty">
                          Số lượng: <strong>x{item.quantity}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="checkout-item-card__subtotal">
                      {formatVND(subtotal)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery Note */}
            <div className="checkout-note-box">
              <label htmlFor="deliveryNote" className="checkout-note-label">
                Ghi chú cho đội ngũ vận chuyển & lắp đặt (Tùy chọn)
              </label>
              <textarea
                id="deliveryNote"
                rows={2}
                placeholder="Ví dụ: Giao giờ hành chính, gọi điện trước 30 phút, hỗ trợ đưa thang máy lên tầng 8..."
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                className="checkout-note-input"
              />
            </div>
          </section>

          {/* STEP 3: Payment Method Selection (Task 8) */}
          <section className="checkout-section">
            <div className="checkout-section__header">
              <span className="checkout-step-number">3</span>
              <div>
                <h2 className="checkout-section__title">Phương Thức Thanh Toán</h2>
                <p className="checkout-section__desc">
                  Lựa chọn hình thức thanh toán an toàn, phù hợp nhất với quý khách.
                </p>
              </div>
            </div>

            <div className="payment-options-grid">
              {/* Option 1: COD */}
              <label
                className={`payment-option-card ${
                  paymentMethod === "COD" ? "payment-option-card--active" : ""
                }`}
              >
                <div className="payment-option-card__radio">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                  />
                </div>
                <div className="payment-option-card__content">
                  <div className="payment-option-card__top">
                    <div className="payment-option-card__icon-wrap">
                      <Banknote size={22} />
                    </div>
                    <div>
                      <h4 className="payment-option-card__name">
                        Thanh Toán Khi Nhận Hàng (COD)
                      </h4>
                      <span className="payment-option-card__badge">Phổ biến</span>
                    </div>
                  </div>
                  <p className="payment-option-card__desc">
                    Quý khách nhận hàng, kiểm tra độ hoàn thiện cùng chuyên viên giao hàng và thanh toán bằng tiền mặt hoặc chuyển khoản tại chỗ.
                  </p>
                </div>
              </label>

              {/* Option 2: BANK_TRANSFER / VietQR / VNPAY */}
              <label
                className={`payment-option-card ${
                  paymentMethod === "BANK_TRANSFER"
                    ? "payment-option-card--active"
                    : ""
                }`}
              >
                <div className="payment-option-card__radio">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="BANK_TRANSFER"
                    checked={paymentMethod === "BANK_TRANSFER"}
                    onChange={() => setPaymentMethod("BANK_TRANSFER")}
                  />
                </div>
                <div className="payment-option-card__content">
                  <div className="payment-option-card__top">
                    <div className="payment-option-card__icon-wrap payment-option-card__icon-wrap--gold">
                      <QrCode size={22} />
                    </div>
                    <div>
                      <h4 className="payment-option-card__name">
                        Chuyển Khoản Ngân Hàng / VietQR / VNPAY
                      </h4>
                      <span className="payment-option-card__badge payment-option-card__badge--gold">
                        Nhanh & Tiện lợi
                      </span>
                    </div>
                  </div>
                  <p className="payment-option-card__desc">
                    Quét mã VietQR chuẩn NAPAS 24/7 tự động điền số tiền và nội dung đơn hàng. Nhân viên sẽ xác nhận đơn trong 15 phút.
                  </p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* ================= RIGHT COLUMN: SUMMARY (Task 7) ================= */}
        <aside className="checkout-sidebar">
          <div className="checkout-summary-card">
            <h3 className="checkout-summary-card__title">Tóm Tắt Đơn Hàng</h3>

            <div className="checkout-summary-breakdown">
              <div className="checkout-summary-row">
                <span>Tạm tính hàng hóa ({cart.length} món)</span>
                <span className="font-semibold">{formatVND(cartSubtotal)}</span>
              </div>

              <div className="checkout-summary-row">
                <span className="flex items-center gap-1">
                  Vận chuyển White-Glove
                  <span className="checkout-pill">VIP</span>
                </span>
                <span className="text-emerald-700 font-semibold">Miễn phí</span>
              </div>

              <div className="checkout-summary-row">
                <span>Lắp ráp hoàn thiện tại phòng</span>
                <span className="text-emerald-700 font-semibold">Miễn phí</span>
              </div>

              <div className="checkout-summary-divider" />

              <div className="checkout-summary-total-row">
                <div className="checkout-summary-total-label">
                  <strong>Tổng Thanh Toán</strong>
                  <small>Đã bao gồm thuế GTGT & chi phí phục vụ</small>
                </div>
                <div className="checkout-summary-total-amount">
                  {formatVND(finalAmount)}
                </div>
              </div>
            </div>

            {/* Validation Notice */}
            {isValidating && (
              <div className="checkout-validating-pill">
                Đang đối soát tồn kho thời gian thực...
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedAddressId || cart.length === 0}
              className="checkout-submit-btn"
            >
              {isSubmitting ? (
                "Đang khởi tạo đơn hàng..."
              ) : (
                <>
                  Xác Nhận Đặt Hàng <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Trust Assurances */}
            <div className="checkout-assurances">
              <div className="checkout-assurance-item">
                <ShieldCheck size={18} className="checkout-assurance-icon" />
                <span>Bảo hành kết cấu 5 năm chính hãng LUMORA</span>
              </div>
              <div className="checkout-assurance-item">
                <Truck size={18} className="checkout-assurance-icon" />
                <span>Giao hàng & bàn giao chuẩn 5 sao</span>
              </div>
              <div className="checkout-assurance-item">
                <Sparkles size={18} className="checkout-assurance-icon" />
                <span>100% Gỗ rừng trồng đạt chứng chỉ quốc tế FSC®</span>
              </div>
            </div>
          </div>
        </aside>
      </form>

      {/* ================= VIETQR / BANK TRANSFER MODAL (Task 8) ================= */}
      {showBankModal && createdOrder && (
        <div className="vietqr-modal-overlay">
          <div className="vietqr-modal">
            <div className="vietqr-modal__header">
              <div className="vietqr-modal__badge">THANH TOÁN VIETQR 24/7</div>
              <h2 className="vietqr-modal__title">Thông Tin Chuyển Khoản Ngân Hàng</h2>
              <p className="vietqr-modal__subtitle">
                Mở ứng dụng Mobile Banking hoặc ví VNPAY bất kỳ để quét mã QR bên dưới:
              </p>
            </div>

            <div className="vietqr-modal__body">
              {/* QR Image */}
              <div className="vietqr-card">
                <img
                  src={`https://img.vietqr.io/image/MB-0912345678-compact2.png?amount=${
                    createdOrder.totalAmount || finalAmount
                  }&addInfo=DH${(createdOrder._id || "").slice(-6).toUpperCase()}&accountName=CONG%20TY%20NOI%20THAT%20LUMORA`}
                  alt="VietQR Code"
                  className="vietqr-card__img"
                />
                <span className="vietqr-card__hint">
                  Quét bằng ứng dụng ngân hàng hoặc VNPAY
                </span>
              </div>

              {/* Transfer Details */}
              <div className="vietqr-details">
                <div className="vietqr-detail-row">
                  <span className="vietqr-detail-label">Ngân hàng thụ hưởng:</span>
                  <strong className="vietqr-detail-val">
                    MB Bank (Ngân hàng Quân Đội)
                  </strong>
                </div>

                <div className="vietqr-detail-row">
                  <span className="vietqr-detail-label">Chủ tài khoản:</span>
                  <strong className="vietqr-detail-val">
                    CONG TY TNHH NOI THAT LUMORA
                  </strong>
                </div>

                <div className="vietqr-detail-row">
                  <span className="vietqr-detail-label">Số tài khoản:</span>
                  <div className="vietqr-copy-group">
                    <strong className="vietqr-detail-val">0912 345 678</strong>
                    <button
                      type="button"
                      className="vietqr-copy-btn"
                      onClick={() => handleCopy("0912345678", "account")}
                    >
                      {copiedField === "account" ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                      {copiedField === "account" ? "Đã chép" : "Sao chép"}
                    </button>
                  </div>
                </div>

                <div className="vietqr-detail-row">
                  <span className="vietqr-detail-label">Số tiền:</span>
                  <div className="vietqr-copy-group">
                    <strong className="vietqr-detail-val text-amber-900 font-bold">
                      {formatVND(createdOrder.totalAmount || finalAmount)}
                    </strong>
                    <button
                      type="button"
                      className="vietqr-copy-btn"
                      onClick={() =>
                        handleCopy(
                          String(createdOrder.totalAmount || finalAmount),
                          "amount",
                        )
                      }
                    >
                      {copiedField === "amount" ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                      {copiedField === "amount" ? "Đã chép" : "Sao chép"}
                    </button>
                  </div>
                </div>

                <div className="vietqr-detail-row">
                  <span className="vietqr-detail-label">Nội dung chuyển khoản:</span>
                  <div className="vietqr-copy-group">
                    <strong className="vietqr-detail-val text-amber-800">
                      DH{(createdOrder._id || "").slice(-6).toUpperCase()}
                    </strong>
                    <button
                      type="button"
                      className="vietqr-copy-btn"
                      onClick={() =>
                        handleCopy(
                          `DH${(createdOrder._id || "").slice(-6).toUpperCase()}`,
                          "syntax",
                        )
                      }
                    >
                      {copiedField === "syntax" ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                      {copiedField === "syntax" ? "Đã chép" : "Sao chép"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="vietqr-modal__footer" style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="vietqr-btn-cancel"
                style={{
                  padding: "12px 20px",
                  borderRadius: "8px",
                  border: "1px solid #D1D5DB",
                  background: "#FFFFFF",
                  color: "#4B5563",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => {
                  setShowBankModal(false);
                  const orderId = createdOrder._id || createdOrder.id;
                  navigate(
                    `/payment-failed?orderId=${orderId}&reason=${encodeURIComponent(
                      "Quý khách đã hủy hoặc chưa hoàn tất thao tác chuyển khoản ngân hàng.",
                    )}`,
                    {
                      state: {
                        orderId,
                        reason: "Quý khách đã hủy hoặc chưa hoàn tất thao tác chuyển khoản ngân hàng.",
                      },
                    },
                  );
                }}
              >
                Hủy / Thanh Toán Sau
              </button>
              <button
                type="button"
                className="vietqr-btn-complete"
                onClick={() => {
                  setShowBankModal(false);
                  const orderId = createdOrder._id || createdOrder.id;
                  navigate(
                    `/payment-success?orderId=${orderId}&method=BANK_TRANSFER`,
                    {
                      state: { order: createdOrder },
                    },
                  );
                }}
              >
                <CheckCircle2 size={18} /> Tôi Đã Chuyển Khoản Xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
