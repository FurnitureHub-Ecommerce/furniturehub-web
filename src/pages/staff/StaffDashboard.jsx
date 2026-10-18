import React, { useState, useEffect } from "react";
import { Package, CheckCircle2, Clock, DollarSign, TrendingUp, ShieldCheck } from "lucide-react";
import { orderAPI } from "../../services/api";

const StaffDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        setLoading(true);
        const res = await orderAPI.getOrders({ limit: 100 });
        setOrders(res.data?.orders || []);
      } catch (err) {
        console.error("Lỗi tải dữ liệu thống kê từ API:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllOrders();
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  
  // Đã xử lý thành công: tính các đơn đã xác nhận (confirmed) hoặc đã giao (delivered)
  const confirmedOrders = orders.filter(o => o.status === "confirmed" || o.status === "delivered").length;
  
  // Tổng doanh thu: Chỉ tính các đơn đã hoàn thành/giao hàng thành công (delivered) chuẩn thực tế nghiệp vụ
  const totalRevenue = orders
    .filter(o => o.status === "delivered")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const formatVND = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const monthsData = [
    { key: 0, name: "Tháng 1" },
    { key: 1, name: "Tháng 2" },
    { key: 2, name: "Tháng 3" },
    { key: 3, name: "Tháng 4" },
    { key: 4, name: "Tháng 5" },
    { key: 5, name: "Tháng 6" },
    { key: 6, name: "Tháng 7" },
    { key: 7, name: "Tháng 8" },
    { key: 8, name: "Tháng 9" },
    { key: 9, name: "Tháng 10" },
    { key: 10, name: "Tháng 11" },
    { key: 11, name: "Tháng 12" },
  ];

  const filteredByYearOrders = orders.filter(o => {
    if (!o.createdAt) return false;
    const orderYear = new Date(o.createdAt).getFullYear().toString();
    return orderYear === selectedYear;
  });

  const monthlyCounts = monthsData.map((m) => {
    return filteredByYearOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getMonth() === m.key;
    }).length;
  });

  const maxMonthlyCount = Math.max(...monthlyCounts, 1);

  if (loading) {
    return <div style={{ padding: "80px", textAlign: "center", color: "#6B7280", fontWeight: 500, fontFamily: "math" }}>Đang tổng hợp báo cáo từ API...</div>;
  }

  return (
    <div style={{ fontFamily: "math", maxWidth: "1280px", margin: "0 auto", paddingBottom: "40px", color: "#1F2937" }}>
      
      {/* Header Section */}
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.5px", fontFamily: "math" }}>
            Bảng Thống Kê Tổng Quan
          </h1>
          <p style={{ color: "#6B7280", fontSize: "13px", marginTop: "4px", fontFamily: "math" }}>
            Theo dõi số liệu thời gian thực từ hệ thống vận hành Lumora Atelier.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "28px" }}>
        
        <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "22px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontFamily: "math" }}>Tổng Đơn Hàng</span>
            <div style={{ padding: "10px", background: "#F3F4F6", borderRadius: "10px", color: "#111827" }}><Package size={18} /></div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#111827", marginBottom: "6px", fontFamily: "math" }}>{totalOrders}</div>
          <span style={{ fontSize: "12px", color: "#059669", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", fontFamily: "math" }}>
            <TrendingUp size={14} /> Dữ liệu toàn hệ thống
          </span>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "22px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontFamily: "math" }}>Đã Xử Lý Thành Công</span>
            <div style={{ padding: "10px", background: "#D1FAE5", borderRadius: "10px", color: "#059669" }}><CheckCircle2 size={18} /></div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#059669", marginBottom: "6px", fontFamily: "math" }}>{confirmedOrders}</div>
          <span style={{ fontSize: "12px", color: "#6B7280", fontFamily: "math" }}>Đơn đã duyệt / chuẩn bị kho</span>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "22px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontFamily: "math" }}>Đang Chờ Duyệt</span>
            <div style={{ padding: "10px", background: "#FEF3C7", borderRadius: "10px", color: "#D97706" }}><Clock size={18} /></div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#D97706", marginBottom: "6px", fontFamily: "math" }}>{pendingOrders}</div>
          <span style={{ fontSize: "12px", color: "#D97706", fontWeight: 600, fontFamily: "math" }}>Cần nhân viên kiểm tra</span>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "22px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontFamily: "math" }}>Tổng Doanh Thu</span>
            <div style={{ padding: "10px", background: "#EDE9FE", borderRadius: "10px", color: "#7C3AED" }}><DollarSign size={18} /></div>
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#111827", marginBottom: "6px", fontFamily: "math" }}>{formatVND(totalRevenue)}</div>
          <span style={{ fontSize: "12px", color: "#6B7280", fontFamily: "math" }}>Từ đơn đã giao thành công</span>
        </div>

      </div>

      {/* Bar Chart Section */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        
        <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: "0 0 4px 0", fontFamily: "math" }}>Biểu Đồ Lượng Đơn Hàng Theo Tháng</h3>
              <span style={{ fontSize: "12px", color: "#6B7280", fontFamily: "math" }}>Tháng nào có đơn cột sẽ tự động dâng cao, tháng không có sẽ ẩn</span>
            </div>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #D1D5DB", background: "#F9FAFB", fontSize: "13px", fontWeight: 600, outline: "none", cursor: "pointer", fontFamily: "math" }}
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <div style={{ height: "240px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "10px", paddingBottom: "10px", borderBottom: "1px solid #E5E7EB", position: "relative" }}>
            
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none", opacity: 0.3 }}>
              <div style={{ borderBottom: "1px dashed #E5E7EB", width: "100%" }}></div>
              <div style={{ borderBottom: "1px dashed #E5E7EB", width: "100%" }}></div>
              <div style={{ borderBottom: "1px dashed #E5E7EB", width: "100%" }}></div>
            </div>

            {monthsData.map((m, idx) => {
              const count = monthlyCounts[idx];
              const heightPercent = count > 0 ? Math.max(Math.round((count / maxMonthlyCount) * 85), 15) : 0;

              return (
                <div key={m.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, zIndex: 1, height: "100%", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#4B5563", marginBottom: "4px", fontFamily: "math" }}>{count > 0 ? count : ""}</span>
                  <div 
                    title={`${m.name}: ${count} đơn hàng`}
                    style={{ 
                      width: "100%", 
                      maxWidth: "26px", 
                      height: `${heightPercent}%`, 
                      background: count > 0 ? "linear-gradient(180deg, #111827 0%, #374151 100%)" : "transparent", 
                      borderRadius: "6px 6px 0 0",
                      transition: "height 0.4s ease, background 0.2s ease",
                      cursor: "pointer"
                    }}
                    onMouseOver={(e) => { if (count > 0) e.currentTarget.style.background = "linear-gradient(180deg, #059669 0%, #10B981 100%)"; }}
                    onMouseOut={(e) => { if (count > 0) e.currentTarget.style.background = "linear-gradient(180deg, #111827 0%, #374151 100%)"; }}
                  ></div>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", marginTop: "8px", fontFamily: "math" }}>{m.name.replace("Tháng ", "T")}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", fontSize: "12px", color: "#6B7280", fontFamily: "math" }}>
            <span>📊 Tháng không có đơn sẽ tự động thu gọn về 0</span>
            <span style={{ fontWeight: 600, color: "#111827", fontFamily: "math" }}>Năm {selectedYear}: {filteredByYearOrders.length} đơn</span>
          </div>
        </div>

        {/* Cột phải: Đơn gần đây */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111827", margin: 0, fontFamily: "math" }}>Đơn Hàng Gần Đây</h3>
              <span style={{ fontSize: "12px", color: "#059669", fontWeight: 600, fontFamily: "math" }}>Mới nhất</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {orders.slice(0, 4).map((ord) => (
                <div key={ord._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#F9FAFB", borderRadius: "10px", border: "1px solid #F3F4F6" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827", fontFamily: "monospace" }}>
                      #{ord._id.slice(-8).toUpperCase()}
                    </div>
                    <div style={{ fontSize: "11px", color: "#6B7280", fontFamily: "math" }}>
                      {ord.shippingAddress?.receiverName || "Khách hàng"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827", fontFamily: "math" }}>
                      {formatVND(ord.totalAmount)}
                    </div>
                    <span style={{ 
                      fontSize: "10px", 
                      fontWeight: 700, 
                      color: ord.status === 'confirmed' || ord.status === 'delivered' ? '#059669' : ord.status === 'pending' ? '#D97706' : '#DC2626',
                      fontFamily: "math"
                    }}>
                      {ord.status === 'confirmed' ? 'ĐÃ DUYỆT' :
                       ord.status === 'pending' ? 'CHỜ DUYỆT' :
                       ord.status === 'shipping' ? 'ĐANG GIAO' :
                       ord.status === 'delivered' ? 'ĐÃ GIAO' :
                       ord.status === 'rejected' ? 'ĐÃ TỪ CHỐI' : 'ĐÃ HỦY'}
                    </span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div style={{ textAlign: "center", color: "#6B7280", padding: "20px", fontSize: "13px", fontFamily: "math" }}>Chưa có đơn hàng nào từ API.</div>
              )}
            </div>
          </div>

          <div style={{ marginTop: "20px", background: "linear-gradient(135deg, #111827 0%, #1F2937 100%)", color: "#fff", padding: "16px", borderRadius: "12px" }}>
            <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "4px", fontFamily: "math" }}>Trạng thái đồng bộ</div>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px", fontFamily: "math" }}>Hoạt động mượt mà 🚀</div>
            <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0, lineHeight: "1.4", fontFamily: "math" }}>
              Biểu đồ tự động phân tích và hiển thị trực quan theo dữ liệu thực tế từ API.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default StaffDashboard;