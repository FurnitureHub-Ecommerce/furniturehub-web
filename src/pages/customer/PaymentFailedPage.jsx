import React from "react";
import { Link, useSearchParams, useLocation, useParams } from "react-router-dom";
import {
  AlertTriangle,
  RotateCcw,
  ShoppingBag,
  Headphones,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import "./PaymentResult.css";

export default function PaymentFailedPage() {
  const [searchParams] = useSearchParams();
  const { orderId: paramOrderId } = useParams();
  const location = useLocation();

  const queryReason = searchParams.get("reason");
  const queryOrderId = searchParams.get("orderId") || paramOrderId;

  const reason =
    location.state?.reason ||
    queryReason ||
    "Quá trình giao dịch bị gián đoạn hoặc ngân hàng phản hồi chậm.";

  const orderId = location.state?.orderId || queryOrderId;

  return (
    <div className="section container payment-result-page">
      <div className="payment-result-card payment-result-card--failed">
        {/* Warning Icon */}
        <div className="payment-result__icon-wrap payment-result__icon-wrap--failed">
          <div className="payment-result__icon-ring payment-result__icon-ring--failed" />
          <AlertTriangle size={52} className="payment-result__icon payment-result__icon--failed" />
        </div>

        {/* Heading */}
        <span className="payment-result__badge payment-result__badge--failed">
          GIAO DỊCH CHƯA HOÀN TẤT
        </span>
        <h1 className="payment-result__title">Thanh Toán Không Thành Công</h1>
        <p className="payment-result__subtitle">
          Rất tiếc, đơn hàng của quý khách chưa thể hoàn tất giao dịch. Quý khách vui lòng kiểm tra lại nguyên nhân bên dưới hoặc thử lại với phương thức thanh toán khác.
        </p>

        {/* Reason Box */}
        <div className="payment-result__reason-box">
          <div className="payment-result__reason-header">
            <ShieldAlert size={18} />
            <span>Chi tiết nguyên nhân gián đoạn:</span>
          </div>
          <p className="payment-result__reason-text">{reason}</p>
          {orderId && (
            <p className="payment-result__reason-order">
              Mã tham chiếu đơn hàng: <strong>#{orderId}</strong>
            </p>
          )}
        </div>

        {/* Suggested Troubleshooting Tips */}
        <div className="payment-result__tips-card">
          <h4 className="payment-result__tips-title">
            <HelpCircle size={17} /> Gợi ý xử lý nhanh:
          </h4>
          <ul className="payment-result__tips-list">
            <li>
              <strong>Đổi sang hình thức COD:</strong> Thanh toán tiền mặt hoặc quẹt thẻ trực tiếp khi chuyên viên giao hàng và kiểm tra sản phẩm tận nhà.
            </li>
            <li>
              <strong>Kiểm tra ứng dụng ngân hàng:</strong> Đảm bảo hạn mức giao dịch trực tuyến hoặc số dư tài khoản đủ để thanh toán đơn hàng.
            </li>
            <li>
              <strong>Giỏ hàng vẫn được lưu giữ an toàn:</strong> Toàn bộ sản phẩm quý khách đã chọn không bị xóa và sẵn sàng để đặt lại bất kỳ lúc nào.
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="payment-result__actions">
          <Link to="/checkout" className="payment-result__btn-primary">
            <RotateCcw size={17} /> Thử Lại Thanh Toán
          </Link>
          <Link to="/cart" className="payment-result__btn-secondary">
            <ShoppingBag size={17} /> Quay Lại Giỏ Hàng
          </Link>
        </div>

        {/* Concierge Support Footer */}
        <div className="payment-result__footer">
          <div className="payment-result__footer-item">
            <Headphones size={18} />
            <span>Tổng đài hỗ trợ thanh toán 24/7: 1900 8888 (Miễn cước)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
