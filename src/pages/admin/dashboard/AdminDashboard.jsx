import { useEffect, useState } from "react";
import {
  Landmark,
  ShoppingBag,
  Users,
  UserRound,
  Package,
  RefreshCw,
  CircleAlert,
  TrendingUp,
  PieChart as PieChartIcon,
  X,
  ChevronRight,
} from "lucide-react";
import { getDashboardStatistics } from "../../../services/admin/dashboard.service.js";
import "./AdminDashboard.css";

const labels = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Hoàn thành",
  rejected: "Đã từ chối",
  cancelled: "Đã hủy",
};

const statusColors = {
  pending: "#B98436",
  confirmed: "#487C59",
  shipping: "#3B7A9E",
  delivered: "#2E5A88",
  rejected: "#B9634B",
  cancelled: "#8D4848",
};

const numeric = (value) => typeof value === "number" && Number.isFinite(value);
const count = (value) =>
  numeric(value)
    ? new Intl.NumberFormat("vi-VN").format(value)
    : "Chưa có dữ liệu";
const money = (value) =>
  numeric(value)
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value)
    : "Chưa có dữ liệu";

export default function AdminDashboard() {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [revision, setRevision] = useState(0);

  // State quản lý Modal chi tiết khi click vào từng ô thống kê
  const [activeModalType, setActiveModalType] = useState(null); // 'orders', 'products', 'customers', 'users'

  useEffect(() => {
    let cancelled = false;
    getDashboardStatistics()
      .then((data) => {
        if (!data || typeof data !== "object" || Array.isArray(data))
          throw new Error("Phản hồi thống kê không đúng định dạng.");
        if (!cancelled) setState({ data, loading: false, error: "" });
      })
      .catch((error) => {
        if (!cancelled)
          setState({
            data: null,
            loading: false,
            error: error.message || "Không thể tải thống kê.",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [revision]);

  function reload() {
    setState({ data: null, loading: true, error: "" });
    setRevision((value) => value + 1);
  }

  const data = state.data;
  const totalOrdersCount = data?.totalOrders || 0;
  const deliveredCount = data?.ordersByStatus?.delivered || 0;
  const orderSuccessRate =
    totalOrdersCount > 0 ? (deliveredCount / totalOrdersCount) * 100 : 0;

  const statuses =
    data?.ordersByStatus &&
    typeof data.ordersByStatus === "object" &&
    !Array.isArray(data.ordersByStatus)
      ? Object.entries(data.ordersByStatus).filter(
          ([, value]) => numeric(value) && value >= 0,
        )
      : [];

  return (
    <div className="la-dashboard">
      {/* Banner Tổng Quan Điều Hành */}
      <div className="la-dashboard-hero">
        <div className="la-dashboard-hero-content">
          <div className="la-dashboard-titles">
            <span className="la-hero-badge">TỔNG QUAN ĐIỀU HÀNH</span>
            <h1>
              Tổng Quan <em>Điều Hành</em>
            </h1>
            <p>
              Theo dõi doanh thu, đơn hàng, sản phẩm và khách hàng trong hệ
              thống LUMORA Atelier. Bấm vào các thẻ để xem chi tiết nhanh.
            </p>
          </div>
          <button
            className="la-refresh-btn"
            onClick={reload}
            disabled={state.loading}
          >
            <RefreshCw
              size={15}
              className={state.loading ? "la-spin" : ""}
              aria-hidden="true"
            />
            <span>{state.loading ? "Đang tải…" : "Làm Mới Dữ Liệu"}</span>
          </button>
        </div>
      </div>

      {state.loading ? (
        <div className="la-data-state" role="status">
          <Landmark size={24} aria-hidden="true" />
          <div>
            <strong>Đang tải thống kê hệ thống</strong>
            <p>Dữ liệu điều hành đang được đồng bộ…</p>
          </div>
        </div>
      ) : state.error ? (
        <div className="la-data-state la-data-error" role="alert">
          <CircleAlert size={24} aria-hidden="true" />
          <div>
            <strong>Không thể tải thống kê</strong>
            <p>{state.error}</p>
          </div>
          <button className="la-button" onClick={reload}>
            Thử lại
          </button>
        </div>
      ) : (
        <>
          <div className="la-dashboard-section-heading">
            <div>
              <h1>Thống kê số liệu (Bấm vào thẻ để xem chi tiết)</h1>
            </div>
          </div>

          {/* Bố cục lưới chính gọn gàng, cân đối */}
          <div className="la-dashboard-grid-layout">
            {/* 1. Biểu đồ Doanh Thu */}
            <div className="la-card-box la-revenue-main-box">
              <div className="la-box-header">
                <div>
                  <span className="la-box-subtitle">Tổng Doanh Thu</span>
                  <div className="la-revenue-header-row">
                    <h2>{money(data?.totalRevenue)}</h2>
                    <span className="la-growth-pill">
                      <TrendingUp size={13} /> Đồng bộ dữ liệu
                    </span>
                  </div>
                </div>
              </div>

              <div className="la-line-chart-container">
                <svg
                  viewBox="0 0 500 140"
                  className="la-svg-chart"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#2E5A88" stopOpacity="0.4" />
                      <stop
                        offset="100%"
                        stopColor="#2E5A88"
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M 0,120 Q 250,${numeric(data?.totalRevenue) && data.totalRevenue > 0 ? Math.max(20, 120 - data.totalRevenue / 100000) : 110} 500,${numeric(data?.totalRevenue) && data.totalRevenue > 0 ? Math.max(10, 120 - data.totalRevenue / 80000) : 110} L 500,140 L 0,140 Z`}
                    fill="url(#revenueGradient)"
                  />
                  <path
                    d={`M 0,120 Q 250,${numeric(data?.totalRevenue) && data.totalRevenue > 0 ? Math.max(20, 120 - data.totalRevenue / 100000) : 110} 500,${numeric(data?.totalRevenue) && data.totalRevenue > 0 ? Math.max(10, 120 - data.totalRevenue / 80000) : 110}`}
                    fill="none"
                    stroke="#2E5A88"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="500"
                    cy={
                      numeric(data?.totalRevenue) && data.totalRevenue > 0
                        ? Math.max(10, 120 - data.totalRevenue / 80000)
                        : 110
                    }
                    r="5"
                    fill="#2E5A88"
                  />
                </svg>
                <div className="la-chart-x-labels">
                  <span>Bắt đầu</span>
                  <span>Quá trình</span>
                  <span>Hiện tại ({money(data?.totalRevenue)})</span>
                </div>
              </div>
            </div>

            {/* 2. Tổng Đơn Hàng (Click để xem nhanh) */}
            <div className="la-card-box la-clickable-card" onClick={() => setActiveModalType("orders")}>
              <div className="la-box-header">
                <div>
                  <span className="la-box-subtitle">Tổng Đơn Hàng <ChevronRight size={14} style={{display: "inline"}}/></span>
                  <h3>{count(data?.totalOrders)}</h3>
                </div>
                <div className="la-icon-wrap">
                  <ShoppingBag size={18} color="#2E5A88" />
                </div>
              </div>
              <div className="la-metric-desc">
                <span>Tỉ lệ thành công</span>
                <strong style={{ color: "#2E5A88" }}>
                  {new Intl.NumberFormat("vi-VN", {
                    maximumFractionDigits: 1,
                  }).format(orderSuccessRate)}
                  %
                </strong>
              </div>
              <div className="la-progress-bar-wrap">
                <div
                  className="la-progress-bar-fill"
                  style={{ width: `${Math.min(orderSuccessRate, 100)}%` }}
                />
              </div>
              <div className="la-box-footer">
                <span>Đã giao: {count(deliveredCount)}</span>
                <span className="la-quick-view-text">Xem nhanh ↗</span>
              </div>
            </div>

            {/* 3. Tổng Sản Phẩm (Click để xem nhanh) */}
            <div className="la-card-box la-clickable-card" onClick={() => setActiveModalType("products")}>
              <div className="la-box-header">
                <div>
                  <span className="la-box-subtitle">Tổng Sản Phẩm <ChevronRight size={14} style={{display: "inline"}}/></span>
                  <h3>{count(data?.totalProducts)}</h3>
                </div>
                <div className="la-icon-wrap">
                  <Package size={18} color="#487C59" />
                </div>
              </div>
              <div className="la-metric-desc">
                <span style={{ color: "#487C59" }}>Đang kinh doanh</span>
              </div>
              <div className="la-mini-dots-wrap">
                {[...Array(8)].map((_, i) => (
                  <span
                    key={i}
                    className={`la-mini-dot ${i < (data?.totalProducts || 0) ? "active" : ""}`}
                  />
                ))}
              </div>
              <div className="la-box-footer">
                <span>Kho hàng ổn định</span>
                <span className="la-quick-view-text">Xem nhanh ↗</span>
              </div>
            </div>

            {/* 4. Tổng Khách Hàng (Click để xem nhanh) */}
            <div className="la-card-box la-clickable-card" onClick={() => setActiveModalType("customers")}>
              <div className="la-box-header">
                <div>
                  <span className="la-box-subtitle">Tổng Khách Hàng <ChevronRight size={14} style={{display: "inline"}}/></span>
                  <h3>{count(data?.totalCustomers)}</h3>
                </div>
                <div className="la-icon-wrap">
                  <Users size={18} color="#B98436" />
                </div>
              </div>
              <div className="la-metric-desc">
                <span>Khách hàng đang hoạt động</span>
                <strong style={{ color: "#B98436" }}>Cao</strong>
              </div>
              <div className="la-mini-bars-wrap">
                <span style={{ height: "40%" }}></span>
                <span style={{ height: "70%" }}></span>
                <span style={{ height: "55%" }}></span>
                <span style={{ height: "90%" }}></span>
              </div>
              <div className="la-box-footer">
                <span>Tương tác tốt</span>
                <span className="la-quick-view-text">Xem nhanh ↗</span>
              </div>
            </div>

            {/* 5. Tổng Tài Khoản (Click để xem nhanh) */}
            <div className="la-card-box la-clickable-card" onClick={() => setActiveModalType("users")}>
              <div className="la-box-header">
                <div>
                  <span className="la-box-subtitle">Tổng Tài Khoản <ChevronRight size={14} style={{display: "inline"}}/></span>
                  <h3>{count(data?.totalUsers)}</h3>
                </div>
                <div className="la-icon-wrap">
                  <UserRound size={18} color="#3B7A9E" />
                </div>
              </div>
              <div className="la-metric-desc">
                <span style={{ color: "#3B7A9E" }}>Bao gồm Quản trị viên và khách</span>
              </div>
              <div className="la-progress-bar-wrap">
                <div
                  className="la-progress-bar-fill"
                  style={{ width: "85%", background: "#3B7A9E" }}
                />
              </div>
              <div className="la-box-footer">
                <span>Đã xác thực bảo mật</span>
                <span className="la-quick-view-text">Xem nhanh ↗</span>
              </div>
            </div>
          </div>

          {/* Khu vực Trạng thái đơn hàng */}
          <div className="la-analytics">
            <section className="la-panel">
              <div className="la-panel-heading">
                <div>
                  <h1>Phân Bổ Trạng Thái Đơn Hàng</h1>
                </div>
                <div className="la-panel-icon-badge">
                  <PieChartIcon size={18} /> Tổng đơn: {count(totalOrdersCount)}
                </div>
              </div>

              {statuses.length ? (
                <div className="la-status-grid">
                  {statuses.map(([key, value]) => {
                    const percentage =
                      numeric(totalOrdersCount) && totalOrdersCount > 0
                        ? (value / totalOrdersCount) * 100
                        : 0;
                    return (
                      <div
                        className="la-status-card"
                        key={key}
                        style={{
                          "--status-color": statusColors[key] ?? "#8a6a48",
                        }}
                      >
                        <div className="la-status-card-header">
                          <span className="la-status-dot" />
                          <span className="la-status-name">
                            {labels[key] ?? key}
                          </span>
                        </div>
                        <div className="la-status-card-metric">
                          <strong>{count(value)}</strong>
                          <span className="la-status-percent">
                            {numeric(totalOrdersCount) &&
                              `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(percentage)}%`}
                          </span>
                        </div>
                        {numeric(totalOrdersCount) && (
                          <div className="la-progress-track">
                            <div
                              className="la-progress-fill"
                              style={{
                                width: `${Math.min(percentage, 100)}%`,
                                background: statusColors[key] ?? "#8a6a48",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="la-api-empty">
                  Chưa có dữ liệu trạng thái đơn hàng
                </p>
              )}
            </section>
          </div>
        </>
      )}

      {/* --- POPUP MODAL HIỂN THỊ THÔNG TIN NHANH KHI CLICK VÀO THẺ --- */}
      {activeModalType && (
        <div className="la-quick-modal-overlay" onClick={() => setActiveModalType(null)}>
          <div className="la-quick-modal-content" onClick={(e) => e.stopPropagation()}>
            <header className="la-quick-modal-header">
              <div>
                <span className="la-quick-modal-tag">XEM NHANH DỮ LIỆU HỆ THỐNG</span>
                <h3>
                  {activeModalType === "orders" && "Chi tiết tổng quan Đơn hàng"}
                  {activeModalType === "products" && "Chi tiết tổng quan Sản phẩm"}
                  {activeModalType === "customers" && "Chi tiết tổng quan Khách hàng"}
                  {activeModalType === "users" && "Chi tiết tổng quan Tài khoản hệ thống"}
                </h3>
              </div>
              <button type="button" className="la-quick-close-btn" onClick={() => setActiveModalType(null)}>
                <X size={18} />
              </button>
            </header>

            <div className="la-quick-modal-body">
              {activeModalType === "orders" && (
                <div>
                  <p style={{fontSize: "14px", color: "#475569", marginBottom: "16px"}}>
                    Hệ thống hiện đang ghi nhận tổng cộng <strong>{count(data?.totalOrders)}</strong> đơn hàng được khởi tạo. Dưới đây là phân bổ trạng thái chi tiết:
                  </p>
                  <ul style={{display: "grid", gap: "10px", padding: 0, listStyle: "none"}}>
                    {statuses.map(([key, val]) => (
                      <li key={key} style={{display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0"}}>
                        <span style={{fontWeight: 600, color: "#334155"}}>{labels[key] || key}</span>
                        <strong style={{color: "#0f172a"}}>{count(val)} đơn</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeModalType === "products" && (
                <div style={{textAlign: "center", padding: "20px 0"}}>
                  <Package size={48} color="#487C59" style={{marginBottom: "12px"}} />
                  <h4 style={{fontSize: "20px", color: "#0f172a", margin: "0 0 8px 0"}}>{count(data?.totalProducts)} Sản phẩm</h4>
                  <p style={{color: "#64748b", fontSize: "14px", margin: 0}}>
                    Toàn bộ danh mục sản phẩm và biến thể SKU đang hoạt động ổn định trong kho hàng LUMORA Atelier.
                  </p>
                </div>
              )}

              {activeModalType === "customers" && (
                <div style={{textAlign: "center", padding: "20px 0"}}>
                  <Users size={48} color="#B98436" style={{marginBottom: "12px"}} />
                  <h4 style={{fontSize: "20px", color: "#0f172a", margin: "0 0 8px 0"}}>{count(data?.totalCustomers)} Khách hàng</h4>
                  <p style={{color: "#64748b", fontSize: "14px", margin: 0}}>
                    Tổng số lượng khách hàng đã đăng ký tài khoản mua sắm và tương tác trên nền tảng.
                  </p>
                </div>
              )}

              {activeModalType === "users" && (
                <div style={{textAlign: "center", padding: "20px 0"}}>
                  <UserRound size={48} color="#3B7A9E" style={{marginBottom: "12px"}} />
                  <h4 style={{fontSize: "20px", color: "#0f172a", margin: "0 0 8px 0"}}>{count(data?.totalUsers)} Tài khoản nhân sự & hệ thống</h4>
                  <p style={{color: "#64748b", fontSize: "14px", margin: 0}}>
                    Bao gồm tài khoản quản trị viên (Admin), nhân viên vận hành (Staff) và người dùng toàn hệ thống.
                  </p>
                </div>
              )}
            </div>

            <footer className="la-quick-modal-footer">
              <button type="button" className="la-button" onClick={() => setActiveModalType(null)}>
                Đóng cửa sổ
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}