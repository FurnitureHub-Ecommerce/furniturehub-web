import React, { useState, useEffect, useCallback } from "react";
import { MapPin, Check, Shield, X, Package, TrendingUp, Clock, AlertTriangle, FileText, ArrowRight } from "lucide-react";
import { orderAPI } from "../../services/api";
import OrderTable from "../../components/order/OrderTable/OrderTable";

const StaffOrders = () => {
  const [orderList, setOrderList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  
  // State quản lý Modal xem chi tiết
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // State quản lý Modal nhập lý do từ chối (Reject Reason UI)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  // Thêm state để quản lý popup cảnh báo thiếu hàng (đặt cùng các state khác ở đầu component)
  const [stockErrorModal, setStockErrorModal] = useState(null);

  
  // Thống kê nhanh (Dashboard Cards)
  const stats = {
    total: pagination.totalItems || orderList.length,
    pending: orderList.filter(o => o.status === 'pending').length,
    confirmed: orderList.filter(o => o.status === 'confirmed').length,
    shipping: orderList.filter(o => o.status === 'shipping').length,
    delivered: orderList.filter(o => o.status === 'delivered').length,
  };

  // ── Fetch danh sách đơn hàng ──────────────────────────
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = { page: currentPage, limit: 10 };
      if (statusFilter) queryParams.status = statusFilter;

      const res = await orderAPI.getOrders(queryParams);
      const orders = res.data.orders || [];
      const meta = res.data.pagination || {};

      setOrderList(orders);
      setPagination({
        page: meta.page || currentPage,
        limit: meta.limit || 10,
        totalPages: meta.totalPages || 1,
        totalItems: meta.totalItems ?? orders.length,
      });
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

 const handleSelectOrder = async (orderId) => {
    try {
      setDetailLoading(true);
      setIsModalOpen(true);
      
      // Ưu tiên tìm ngay trong danh sách đơn hàng hiện tại (đã được cấp quyền lấy danh sách)
      const found = orderList.find(o => o._id === orderId);
      if (found) {
        setSelectedOrder(found);
      } else {
        // Nếu không có trong list thì mới gọi API lấy chi tiết
        const res = await orderAPI.getOrdersById(orderId);
        const ord = res.data?.order || res.data;
        setSelectedOrder(ord);
      }
    } catch (err) {
      console.warn("Không gọi được API chi tiết, dùng dữ liệu dự phòng từ danh sách:", err);
      const found = orderList.find(o => o._id === orderId);
      setSelectedOrder(found || null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const showToast = useCallback((title, sub, type = "confirm") => {
    setSuccessToast({ title, sub, type });
    setTimeout(() => setSuccessToast(null), 3500);
  }, []);

  // 1. Xác nhận đơn hàng (Duyệt)
 const handleConfirmOrder = async () => {
    if (!selectedOrder || confirming) return;
    try {
      setConfirming(true);
      await orderAPI.confirmOrderStatus(selectedOrder._id);
      setSelectedOrder(prev => prev ? { ...prev, status: "confirmed" } : null);
      fetchOrders();
      showToast("Thành công!", `Đơn hàng #${selectedOrder._id.slice(-8).toUpperCase()} đã được chấp nhận và chuyển sang trạng thái chuẩn bị hàng.`);
    } catch (err) {
      console.error("Confirm order failed:", err);
      const errorMsg = err?.response?.data?.message || "";
      
      // Kiểm tra nếu lỗi do không đủ tồn kho (Insufficient stock)
      if (errorMsg.includes("Insufficient stock")) {
        // Tách lấy variant ID từ thông báo lỗi của backend (Ví dụ: "Insufficient stock for variant 6ab13...")
        const matchVariant = errorMsg.match(/variant\s+([a-zA-Z0-9]+)/);
        const variantId = matchVariant ? matchVariant[1] : null;

        // Tìm sản phẩm trong đơn hàng khớp với variant đó hoặc lấy sản phẩm đầu tiên
        const matchedItem = selectedOrder.items?.find(item => item.variantId === variantId || item._id === variantId) || selectedOrder.items?.[0];
        
        // Tách lấy số lượng Available và Requested từ message của backend
        const matchAvailable = errorMsg.match(/Available:\s*(\d+)/);
        const matchRequested = errorMsg.match(/Requested:\s*(\d+)/);

        setStockErrorModal({
          productName: matchedItem?.productName || "Sản phẩm trong đơn",
          available: matchAvailable ? matchAvailable[1] : "Ít",
          requested: matchRequested ? matchRequested[1] : "Nhiều",
        });
      } else {
        alert(errorMsg || "Xác nhận thất bại.");
      }
    } finally {
      setConfirming(false);
    }
  };

  // 2. Thực hiện từ chối đơn hàng kèm lý do (Reject Order + Reject Reason UI)
  const handleSubmitReject = async () => {
    if (!selectedOrder || rejecting) return;
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối đơn hàng.");
      return;
    }
    try {
      setRejecting(true);
      // Gọi API từ chối đơn hàng
      await orderAPI.rejectOrderStatus(selectedOrder._id);
      
      setSelectedOrder(prev => prev ? { ...prev, status: "rejected", rejectReason } : null);
      setIsRejectModalOpen(false);
      setRejectReason("");
      fetchOrders();
      
      showToast("Đã từ chối đơn hàng", `Đơn hàng #${selectedOrder._id.slice(-8).toUpperCase()} đã bị hủy với lý do: "${rejectReason}".`, "reject");
    } catch (err) {
      alert(err?.response?.data?.message || "Từ chối thất bại.");
    } finally {
      setRejecting(false);
    }
  };

  const formatVND = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const statusLabel = (status) => {
    const map = {
      pending: "Chờ xác nhận",
      confirmed: "Đã chấp nhận / Đang chuẩn bị",
      shipping: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
      rejected: "Bị từ chối",
    };
    return map[status] || status;
  };

  // Component phụ: Render Order Status Timeline (Dòng thời gian trạng thái đơn hàng)
  const renderOrderStatusTimeline = (status) => {
    const steps = [
      { key: "pending", label: "Đặt hàng" },
      { key: "confirmed", label: "Chuẩn bị hàng" },
      { key: "shipping", label: "Đang giao" },
      { key: "delivered", label: "Hoàn thành" },
    ];

    const getStepIndex = (st) => {
      if (st === "pending") return 0;
      if (st === "confirmed") return 1;
      if (st === "shipping") return 2;
      if (st === "delivered") return 3;
      return -1; // Trường hợp bị hủy hoặc từ chối
    };

    const currentIndex = getStepIndex(status);

    if (status === "cancelled" || status === "rejected") {
      return (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '12px 16px', borderRadius: '8px', color: '#991B1B', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} />
          <span>Đơn hàng đã bị dừng xử lý (Trạng thái: <strong>{statusLabel(status)}</strong>)</span>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', position: 'relative' }}>
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: isCompleted ? '#059669' : '#E5E7EB',
                color: isCompleted ? '#fff' : '#9CA3AF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 700,
                boxShadow: isCurrent ? '0 0 0 4px rgba(5, 150, 105, 0.15)' : 'none'
              }}>
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span style={{ fontSize: '11px', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#059669' : '#6B7280', marginTop: '6px', textAlign: 'center' }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="staff-orders" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Toast thông báo */}
      {successToast && (
        <div className={`confirm-toast confirm-toast--enter ${successToast.type === "reject" ? "confirm-toast--reject" : ""}`}>
          <div className="confirm-toast__icon">{successToast.type === "reject" ? "✕" : "✓"}</div>
          <div className="confirm-toast__body">
            <span className="confirm-toast__title">{successToast.title}</span>
            <span className="confirm-toast__sub">{successToast.sub}</span>
          </div>
          <button className="confirm-toast__close" onClick={() => setSuccessToast(null)}>×</button>
        </div>
      )}

      {/* Header trang */}
      <div className="staff-page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: 0,  fontFamily: "math"}}>
            Quản Lý & Vận Hành Đơn Hàng
          </h1>
          <p style={{ color: '#6B7280', fontSize: '13px', marginTop: '4px' }}>
            Theo dõi danh sách, kiểm tra chi tiết, xem tiến trình timeline và cập nhật trạng thái đơn hàng.
          </p>
        </div>
        <span className="sla-badge">
          <Shield size={14} /> Hệ thống vận hành ổn định
        </span>
      </div>

      {/* 📊 Thống kê nhanh (Dashboard Statistics Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '24px', fontFamily: "math" }}>
        <div style={{ background: '#fff', padding: '14px 16px', borderRadius: '10px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
            <Package size={20} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600, fontFamily: "math" }}>Tổng Đơn</span>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0, fontFamily: "math" }}>{stats.total}</h3>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '14px 16px', borderRadius: '10px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
            <Clock size={20} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>Chờ Duyệt</span>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#D97706', margin: 0, fontFamily: "math" }}>{stats.pending}</h3>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '14px 16px', borderRadius: '10px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <Check size={20} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600, fontFamily: "math"}}>Chuẩn Bị Hàng</span>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#059669', margin: 0, fontFamily: "math" }}>{stats.confirmed}</h3>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '14px 16px', borderRadius: '10px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600, fontFamily: "math" }}>Đang Giao</span>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#4F46E5', margin: 0, fontFamily: "math" }}>{stats.shipping}</h3>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '14px 16px', borderRadius: '10px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#047857' }}>
            <Check size={20} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600, fontFamily: "math" }}>Đã Hoàn Thành</span>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#047857', margin: 0, fontFamily: "math" }}>{stats.delivered}</h3>
          </div>
        </div>
      </div>

      {/* 📋 Bảng Danh Sách Đơn Hàng Full Chiều Rộng */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <OrderTable
          orders={orderList}
          selectedOrderId={selectedOrder?._id}
          onSelectOrder={handleSelectOrder}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          onPageChange={handlePageChange}
          loading={loading}
          onSearchExactId={handleSelectOrder}
        />
      </div>

      {/* 🪟 MODAL CHI TIẾT ĐƠN HÀNG (Tích hợp Order Status Timeline) */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#fff', width: '680px', maxHeight: '90vh', borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#6D28D9',  letterSpacing: '0.5px', fontFamily: "math" }}>Chi Tiết & Tiến Trình Đơn Hàng</span>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '2px 0 0 0', fontFamily: 'monospace' }}>
                  #{selectedOrder?._id?.toUpperCase()}
                </h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {detailLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Đang tải thông tin chi tiết...</div>
              ) : selectedOrder ? (
                <>
                  {/* 🕒 Order Status Timeline (Dòng thời gian trạng thái đơn hàng) */}
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#5B21B6', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Tiến trình xử lý đơn hàng
                    </div>
                    {renderOrderStatusTimeline(selectedOrder.status)}
                  </div>

                  {/* Danh sách sản phẩm */}
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', fontFamily: "math" }}>
                      Sản Phẩm ({selectedOrder.items?.length || 0})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {selectedOrder.items?.map((item) => (
                        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{item.productName}</div>
                            <div style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'monospace' }}>
                              SKU: {item.sku} · SL: {item.quantity} {item.color ? `· ${item.color}` : ''}
                            </div>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                            {formatVND(item.unitPrice * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Thông tin giao hàng */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#F9FAFB', padding: '14px', borderRadius: '10px', border: '1px solid #F3F4F6' }}>
                    <MapPin size={18} style={{ color: '#4B5563', marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>
                      <div style={{ fontWeight: 700, color: '#111827', marginBottom: '2px' }}>
                        {selectedOrder.shippingAddress?.receiverName} ({selectedOrder.shippingAddress?.phone})
                      </div>
                      <div>
                        {selectedOrder.shippingAddress?.addressLine}, {selectedOrder.shippingAddress?.ward}, {selectedOrder.shippingAddress?.city}
                      </div>
                    </div>
                  </div>

                  {/* Tổng tiền */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#111827', color: '#fff', borderRadius: '10px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>Tổng Thanh Toán</span>
                    <span style={{ fontSize: '18px', fontWeight: 800 }}>{formatVND(selectedOrder.totalAmount)}</span>
                  </div>
                </>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#EF4444' }}>Không tìm thấy thông tin đơn hàng.</div>
              )}
            </div>

            {/* Modal Footer (Nút Duyệt / Từ chối) */}
            {selectedOrder && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid #F3F4F6', background: '#F9FAFB', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                {selectedOrder.status === "pending" && (
                  <button
                    onClick={handleConfirmOrder}
                    disabled={confirming || rejecting}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px',
                      background: '#059669', color: '#fff', border: 'none', borderRadius: '8px',
                      fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    <Check size={16} />
                    {confirming ? "Đang xử lý..." : "Chấp Nhận & Chuẩn Bị Hàng"}
                  </button>
                )}

                {["pending", "confirmed"].includes(selectedOrder.status) && (
                  <button
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={confirming || rejecting}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px',
                      background: 'transparent', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: '8px',
                      fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Từ Chối / Hủy Đơn
                  </button>
                )}

                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 20px', background: '#E5E7EB', color: '#374151', border: 'none',
                    borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Đóng
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🛑 REJECT REASON MODAL (Giao diện nhập lý do từ chối đơn hàng) */}
      {isRejectModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#fff', width: '450px', borderRadius: '12px', padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#DC2626' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#111827', fontFamily: "math" }}>Xác Nhận Từ Chối Đơn Hàng</h3>
            </div>
            
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, lineHeight: '1.5', fontFamily: "math" }}>
              Vui lòng nhập lý do từ chối đơn hàng <strong>#{selectedOrder?._id?.slice(-8).toUpperCase()}</strong>. Thông tin này sẽ được ghi nhận vào hệ thống vận hành:
            </p>

            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do cụ thể (Ví dụ: Hết hàng trong kho, Khách hàng yêu cầu hủy, Thông tin giao hàng không chính xác...)"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB',
                fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: "math"
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectReason("");
                }}
                style={{ padding: '8px 16px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmitReject}
                disabled={rejecting}
                style={{ padding: '8px 16px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                {rejecting ? "Đang xử lý..." : "Xác Nhận Từ Chối"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🛑 POPUP CẢNH BÁO THIẾU HÀNG (Mờ hậu cảnh, hiện giữa màn hình) */}
      {stockErrorModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 20000, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#fff', width: '460px', borderRadius: '16px', padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', gap: '16px',
            textAlign: 'center', animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%', background: '#FEE2E2', color: '#DC2626',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
            }}>
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0', fontFamily: "math" }}>
                Không Đủ Hàng Trong Kho
              </h3>
              <p style={{ fontSize: '14px', color: '#4B5563', margin: 0, lineHeight: '1.5', fontFamily: "math" }}>
                Sản phẩm <strong>{stockErrorModal.productName}</strong> không đủ số lượng theo yêu cầu.
                <br />
                Sản phẩm chỉ còn lại <strong>{stockErrorModal.available}</strong> cái (Khách đặt: {stockErrorModal.requested}).
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                onClick={() => setStockErrorModal(null)}
                style={{
                  flex: 1, padding: '10px 16px', background: '#F3F4F6', color: '#374151', border: 'none',
                  borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setStockErrorModal(null);
                  setIsModalOpen(false); // Đóng modal chi tiết đơn
                  setIsRejectModalOpen(true); // Mở form nhập lý do từ chối đơn hàng luôn
                }}
                style={{
                  flex: 1, padding: '10px 16px', background: '#DC2626', color: '#fff', border: 'none',
                  borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "math"
                }}
              >
                Từ Chối Đơn Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffOrders;