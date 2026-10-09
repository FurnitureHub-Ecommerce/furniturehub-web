import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ArrowRight,
  MapPin,
  Calendar,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { orderAPI, paymentAPI, getApiErrorMessage } from "../../services/api";
import { formatCurrency } from "../../utils/formatters";
import "./CustomerOrders.css";

const formatVND = (price) => formatCurrency(price);

const STATUS_CONFIG = {
  pending: {
    label: "Chờ xác nhận",
    className: "order-status--pending",
    desc: "Đơn hàng đang chờ nhân viên kiểm tra tồn kho & liên hệ.",
  },
  confirmed: {
    label: "Đã xác nhận",
    className: "order-status--confirmed",
    desc: "Đơn hàng đã được duyệt và đang chuẩn bị xuất kho.",
  },
  rejected: {
    label: "Đã từ chối",
    className: "order-status--rejected",
    desc: "Đơn hàng bị từ chối do hết hàng hoặc thông tin chưa chính xác.",
  },
  cancelled: {
    label: "Đã hủy",
    className: "order-status--cancelled",
    desc: "Đơn hàng đã được hủy thành công.",
  },
};

export default function CustomerOrdersPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await orderAPI.getMyOrders();
      const list = res.data?.orders || res.data || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        "Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.",
      );
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/login?redirect=/orders");
      return;
    }
    fetchOrders();
  }, [token, fetchOrders, navigate]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Quý khách có chắc chắn muốn hủy đơn hàng này không?")) {
      return;
    }

    setCancellingId(orderId);
    try {
      await orderAPI.cancelOrder(orderId);
      await fetchOrders();
    } catch (err) {
      alert("Lỗi khi hủy đơn hàng: " + getApiErrorMessage(err, "Không thể hủy đơn."));
    } finally {
      setCancellingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "all") return true;
    return o.status === activeTab;
  });

  return (
    <div className="section container customer-orders-page">
      {/* Header */}
      <div className="orders-header">
        <span className="orders-header__badge">THEO DÕI ĐƠN HÀNG</span>
        <h1 className="orders-header__title">Đơn Hàng Của Tôi</h1>
        <p className="orders-header__subtitle">
          Theo dõi tiến độ chế tác, đóng gói và dịch vụ giao hàng White-Glove dành cho đơn hàng của bạn.
        </p>
      </div>

      {/* Tabs */}
      <div className="orders-tabs">
        <button
          type="button"
          className={`orders-tab ${activeTab === "all" ? "orders-tab--active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          Tất cả ({orders.length})
        </button>
        <button
          type="button"
          className={`orders-tab ${
            activeTab === "pending" ? "orders-tab--active" : ""
          }`}
          onClick={() => setActiveTab("pending")}
        >
          Chờ xác nhận ({orders.filter((o) => o.status === "pending").length})
        </button>
        <button
          type="button"
          className={`orders-tab ${
            activeTab === "confirmed" ? "orders-tab--active" : ""
          }`}
          onClick={() => setActiveTab("confirmed")}
        >
          Đã xác nhận ({orders.filter((o) => o.status === "confirmed").length})
        </button>
        <button
          type="button"
          className={`orders-tab ${
            activeTab === "cancelled" ? "orders-tab--active" : ""
          }`}
          onClick={() => setActiveTab("cancelled")}
        >
          Đã hủy ({orders.filter((o) => o.status === "cancelled").length})
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="orders-error">
          <AlertCircle size={20} className="shrink-0" />
          <span>{error}</span>
          <button type="button" onClick={fetchOrders} className="orders-retry-btn">
            <RefreshCw size={14} /> Thử lại
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="orders-loading">
          Đang tải thông tin đơn hàng từ máy chủ...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="orders-empty">
          <Package size={48} className="orders-empty__icon" />
          <h3 className="orders-empty__title">Chưa có đơn hàng nào</h3>
          <p className="orders-empty__desc">
            Quý khách chưa có đơn hàng nào trong mục này. Hãy khám phá bộ sưu tập nội thất độc bản của LUMORA.
          </p>
          <Link to="/products" className="orders-btn-primary">
            Khám Phá Sản Phẩm <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((ord) => {
            const statusMeta =
              STATUS_CONFIG[ord.status] || STATUS_CONFIG.pending;
            const shipping = ord.shippingAddress || {};
            const items = ord.items || [];
            const canCancel = ord.status === "pending";

            return (
              <div key={ord._id} className="order-item-card">
                {/* Card Top */}
                <div className="order-item-card__top">
                  <div className="order-item-card__identifiers">
                    <span className="order-item-card__id">
                      Mã đơn: #{ord._id}
                    </span>
                    <span className="order-item-card__date">
                      <Calendar size={14} />{" "}
                      {ord.createdAt
                        ? new Date(ord.createdAt).toLocaleDateString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "---"}
                    </span>
                  </div>

                  <div className="order-item-card__status-group">
                    <span
                      className={`order-status-badge ${statusMeta.className}`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="order-item-card__items">
                  {items.map((it, idx) => (
                    <div key={it._id || idx} className="order-line-item">
                      <div className="order-line-item__info">
                        <span className="order-line-item__sku">
                          SKU: {it.sku || it.variantId || "Nội thất cao cấp"}
                        </span>
                        <span className="order-line-item__qty">
                          Số lượng: <strong>x{it.quantity}</strong>
                        </span>
                      </div>
                      <div className="order-line-item__price">
                        {formatVND(it.itemSubtotal || it.unitPrice * it.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Bottom / Summary */}
                <div className="order-item-card__bottom">
                  <div className="order-item-card__shipping-preview">
                    <MapPin size={15} className="shrink-0 text-amber-800" />
                    <span>
                      Giao tới: <strong>{shipping.receiverName}</strong> (
                      {shipping.phone}) - {shipping.addressLine},{" "}
                      {shipping.ward}, {shipping.city}
                    </span>
                  </div>

                  <div className="order-item-card__total-section">
                    <div className="order-item-card__total-group">
                      <span className="order-item-card__total-label">
                        Tổng thanh toán:
                      </span>
                      <strong className="order-item-card__total-val">
                        {formatVND(ord.totalAmount || ord.subtotal || 0)}
                      </strong>
                    </div>

                    <div className="order-item-card__actions">
                      {canCancel && (
                        <button
                          type="button"
                          className="order-btn-cancel"
                          onClick={() => handleCancelOrder(ord._id)}
                          disabled={cancellingId === ord._id}
                        >
                          {cancellingId === ord._id ? "Đang hủy..." : "Hủy Đơn"}
                        </button>
                      )}
                      <Link
                        to={`/checkout/success?orderId=${ord._id}`}
                        className="order-btn-view"
                      >
                        Chi Tiết Đơn <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
