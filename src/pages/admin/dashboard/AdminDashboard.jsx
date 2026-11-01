import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Users,
  Package,
  RefreshCw,
  CircleAlert,
  TrendingUp,
  PieChart as PieChartIcon,
  X,
  ChevronRight,
} from "lucide-react";
import { getDashboardStatistics } from "../../../services/admin/dashboard.service.js";
import { getCatalog } from "../../../services/admin/catalog.service.js";
import "./AdminDashboard.css";
import { getUsers } from "../../../services/admin/users.service.js";

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

  const [activeModalType, setActiveModalType] = useState(null);
  const [adminProducts, setAdminProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [adminCustomers, setAdminCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);

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

  useEffect(() => {
    if (activeModalType === "products") {
      setProductsLoading(true);
      getCatalog()
        .then((res) => {
          const list = Array.isArray(res?.rows) ? res.rows : [];
          setAdminProducts(list);
        })
        .catch((err) => {
          console.error("Không thể tải danh sách sản phẩm:", err);
          setAdminProducts([]);
        })
        .finally(() => {
          setProductsLoading(false);
        });
    }
  }, [activeModalType]);

  useEffect(() => {
    if (activeModalType === "customers") {
      setCustomersLoading(true);
      getUsers()
        .then((rows) => {
          const customerList = rows.filter(
            (u) => String(u.role || "").toUpperCase() === "CUSTOMER",
          );
          setAdminCustomers(customerList);
        })
        .catch((err) => {
          console.error("Không thể tải danh sách khách hàng:", err);
          setAdminCustomers([]);
        })
        .finally(() => {
          setCustomersLoading(false);
        });
    }
  }, [activeModalType]);

  function reload() {
    setState({ data: null, loading: true, error: "" });
    setRevision((value) => value + 1);
  }

  const data = state.data;
  const totalOrdersCount = data?.totalOrders || 0;
  const deliveredCount = data?.ordersByStatus?.delivered || 0;
  const orderSuccessRate =
    totalOrdersCount > 0 ? (deliveredCount / totalOrdersCount) * 100 : 0;

  const totalRev = numeric(data?.totalRevenue) ? data.totalRevenue : 0;

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
      <style>{`
        @keyframes fadeInUpSmooth {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .la-anim-1 { animation: fadeInUpSmooth 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both; }
        .la-anim-2 { animation: fadeInUpSmooth 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both; }
        .la-anim-3 { animation: fadeInUpSmooth 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.20s both; }
        .la-anim-4 { animation: fadeInUpSmooth 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.28s both; }
      `}</style>

      {/* Banner Hero Đặc Trưng Lumora Atelier */}
      <div className="la-dashboard-hero la-anim-1">
        <div className="la-dashboard-hero-content">
          <div className="la-dashboard-titles">
            <span className="la-hero-badge">QUẢN LÝ HỆ THỐNG</span>
            <h1>
              Bảng <em>Điều Khiển</em>
            </h1>
            <p>
              Theo dõi toàn diện doanh thu, đơn hàng, sản phẩm và trạng thái
              hoạt động của hệ thống LUMORA Atelier.
            </p>
          </div>
          <button
            className="la-refresh-btn"
            onClick={reload}
            disabled={state.loading}
            type="button"
          >
            <RefreshCw
              size={15}
              className={state.loading ? "la-spin" : ""}
              aria-hidden="true"
            />
            <span>{state.loading ? "Đang đồng bộ…" : "Tải Lại"}</span>
          </button>
        </div>
      </div>

      {state.loading ? (
        <div className="la-data-state la-anim-2" role="status">
          <RefreshCw size={20} className="la-spin" />
          <div>
            <strong>Đang tải thống kê hệ thống</strong>
            <p>Dữ liệu điều hành đang được đồng bộ…</p>
          </div>
        </div>
      ) : state.error ? (
        <div className="la-data-state la-data-error la-anim-2" role="alert">
          <CircleAlert size={20} />
          <div>
            <strong>Không thể tải thống kê</strong>
            <p>{state.error}</p>
          </div>
          <button className="la-button" onClick={reload} type="button">
            Thử lại
          </button>
        </div>
      ) : (
        <>
          {/* 1. Bốn Thẻ Thống Kê Tổng Quan Hàng Trên */}
          <div className="la-metrics-top-grid la-anim-2">
            {/* Thẻ 1: Tổng Doanh Thu */}
            <div
              className="la-card-box dark-theme"
              onClick={() => setActiveModalType("revenue")}
            >
              <div className="la-box-header">
                <div>
                  <span className="la-box-subtitle">
                    Tổng Doanh Thu{" "}
                    <ChevronRight size={14} style={{ display: "inline" }} />
                  </span>
                  <div className="la-revenue-header-row">
                    <h2>{money(totalRev)}</h2>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: "12px" }}>
                <span className="la-growth-pill">
                  <TrendingUp size={12} /> Cập nhật thực tế
                </span>
              </div>
            </div>

            {/* Thẻ 2: Tổng Đơn Hàng */}
            <div
              className="la-card-box"
              onClick={() => setActiveModalType("orders")}
            >
              <div className="la-box-header">
                <div>
                  <span className="la-box-subtitle">
                    Tổng Đơn Hàng{" "}
                    <ChevronRight size={14} style={{ display: "inline" }} />
                  </span>
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

            {/* Thẻ 3: Tổng Sản Phẩm */}
            <div
              className="la-card-box"
              onClick={() => setActiveModalType("products")}
            >
              <div className="la-box-header">
                <div>
                  <span className="la-box-subtitle">
                    Tổng Sản Phẩm{" "}
                    <ChevronRight size={14} style={{ display: "inline" }} />
                  </span>
                  <h3>{count(data?.totalProducts)}</h3>
                </div>
                <div className="la-icon-wrap">
                  <Package size={18} color="#487C59" />
                </div>
              </div>
              <div className="la-metric-desc">
                <span style={{ color: "#487C59" }}>Đang kinh doanh</span>
              </div>
              <div
                className="la-progress-bar-wrap"
                style={{ background: "#e8f5e9" }}
              >
                <div
                  className="la-progress-bar-fill"
                  style={{ width: "80%", background: "#487C59" }}
                />
              </div>
              <div className="la-box-footer">
                <span>Kho hàng ổn định</span>
                <span className="la-quick-view-text">Xem nhanh ↗</span>
              </div>
            </div>

            {/* Thẻ 4: Tổng Khách Hàng */}
            <div
              className="la-card-box"
              onClick={() => setActiveModalType("customers")}
            >
              <div className="la-box-header">
                <div>
                  <span className="la-box-subtitle">
                    Tổng Khách Hàng{" "}
                    <ChevronRight size={14} style={{ display: "inline" }} />
                  </span>
                  <h3>{count(data?.totalCustomers)}</h3>
                </div>
                <div className="la-icon-wrap">
                  <Users size={18} color="#B98436" />
                </div>
              </div>
              <div className="la-metric-desc">
                <span>Khách hàng hoạt động</span>
                <strong style={{ color: "#B98436" }}>Cao</strong>
              </div>
              <div
                className="la-progress-bar-wrap"
                style={{ background: "#fdf8f0" }}
              >
                <div
                  className="la-progress-bar-fill"
                  style={{ width: "90%", background: "#B98436" }}
                />
              </div>
              <div className="la-box-footer">
                <span>Tương tác tốt</span>
                <span className="la-quick-view-text">Xem nhanh ↗</span>
              </div>
            </div>
          </div>

          {/* 2. Biểu đồ Line Chart Doanh Thu (Hiển thị to ở ngoài, không nằm trong khung card trắng) */}
          <div
            className="la-anim-3"
            style={{
              background: "linear-gradient(135deg, #272522 0%, #3e3833 100%)",
              borderRadius: "16px",
              padding: "32px 36px",
              color: "#ffffff",
              boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
              marginTop: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "#d4b595",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                  }}
                >
                  BIỂU ĐỒ TÀI CHÍNH
                </span>
                <h2
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: "750",
                    color: "#fff",
                    margin: "2px 0 0 0",
                  }}
                >
                  Biểu Đồ Tăng Trưởng Doanh Thu
                </h2>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "12px", color: "#dcd6cd" }}>
                  Tổng tích lũy thực tế:
                </span>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "800",
                    color: "#4ade80",
                    margin: 0,
                  }}
                >
                  {money(totalRev)}
                </h3>
              </div>
            </div>

            {/* SVG Line Chart to và xịn sò */}
            <div
              style={{ width: "100%", height: "220px", position: "relative" }}
            >
              <svg
                viewBox="0 0 800 200"
                width="100%"
                height="100%"
                style={{ overflow: "visible" }}
              >
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#4ade80" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                <line
                  x1="0"
                  y1="40"
                  x2="800"
                  y2="40"
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="4 4"
                />
                <line
                  x1="0"
                  y1="100"
                  x2="800"
                  y2="100"
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="4 4"
                />
                <line
                  x1="0"
                  y1="160"
                  x2="800"
                  y2="160"
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="4 4"
                />

                {/* Area under line */}
                <path
                  d="M 0,160 Q 200,80 400,100 T 800,30 L 800,180 L 0,180 Z"
                  fill="url(#lineGrad)"
                />

                {/* Smooth Line */}
                <path
                  d="M 0,160 Q 200,80 400,100 T 800,30"
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Interactive Points */}
                <circle
                  cx="0"
                  cy="160"
                  r="5"
                  fill="#18181b"
                  stroke="#4ade80"
                  strokeWidth="3"
                />
                <circle
                  cx="200"
                  cy="90"
                  r="5"
                  fill="#18181b"
                  stroke="#4ade80"
                  strokeWidth="3"
                />
                <circle
                  cx="400"
                  cy="100"
                  r="5"
                  fill="#18181b"
                  stroke="#4ade80"
                  strokeWidth="3"
                />
                <circle
                  cx="600"
                  cy="65"
                  r="5"
                  fill="#18181b"
                  stroke="#4ade80"
                  strokeWidth="3"
                />
                <circle
                  cx="800"
                  cy="30"
                  r="6"
                  fill="#4ade80"
                  stroke="#fff"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11.5px",
                color: "#a1a1aa",
                marginTop: "12px",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                paddingTop: "10px",
              }}
            >
              <span>Tháng 9 </span>
              <span>Tháng 10</span>

              <span style={{ color: "#4ade80", fontWeight: "700" }}>
                Tháng 11 (Hiện tại)
              </span>
            </div>
          </div>

          {/* 3. Phân Bổ Trạng Thái Đơn Hàng */}
          <div className="la-analytics la-anim-4">
            <section
              className="la-panel"
              onClick={() => setActiveModalType("orders")}
              style={{ cursor: "pointer" }}
            >
              <div className="la-panel-heading">
                <div>
                  <h1>Phân Bổ Trạng Thái Đơn Hàng</h1>
                </div>
                <div className="la-panel-icon-badge">
                  <PieChartIcon size={18} /> Tổng đơn: {count(totalOrdersCount)}{" "}
                  ↗ Xem chi tiết
                </div>
              </div>

              {statuses.length ? (
                <div className="la-status-chart-container">
                  <div className="la-stacked-bar">
                    {statuses.map(([key, value]) => {
                      const percentage =
                        numeric(totalOrdersCount) && totalOrdersCount > 0
                          ? (value / totalOrdersCount) * 100
                          : 0;
                      return (
                        <div
                          key={key}
                          className="la-stacked-segment"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: statusColors[key] ?? "#8a6a48",
                          }}
                          title={`${labels[key] ?? key}: ${value} đơn (${percentage.toFixed(1)}%)`}
                        />
                      );
                    })}
                  </div>

                  <div className="la-status-legend-grid">
                    {statuses.map(([key, value]) => {
                      const percentage =
                        numeric(totalOrdersCount) && totalOrdersCount > 0
                          ? (value / totalOrdersCount) * 100
                          : 0;
                      return (
                        <div
                          className="la-legend-item"
                          key={key}
                          style={{
                            "--status-color": statusColors[key] ?? "#8a6a48",
                          }}
                        >
                          <div className="la-legend-left">
                            <span className="la-legend-dot" />
                            <span className="la-legend-name">
                              {labels[key] ?? key}
                            </span>
                          </div>
                          <div className="la-legend-right">
                            <span className="la-legend-count">
                              {count(value)}
                            </span>
                            <span className="la-legend-percent">
                              {numeric(totalOrdersCount) &&
                                `(${percentage.toFixed(0)}%)`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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

      {/* --- POPUP MODAL XEM NHANH --- */}
      {activeModalType && (
        <div
          className="la-quick-modal-overlay"
          onClick={() => setActiveModalType(null)}
        >
          <div
            className="la-quick-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="la-quick-modal-header">
              <div>
                <span className="la-quick-modal-tag">
                  XEM NHANH DỮ LIỆU HỆ THỐNG
                </span>
                <h3>
                  {activeModalType === "revenue" && "Chi tiết Tổng Doanh Thu"}
                  {activeModalType === "orders" &&
                    "Chi tiết tổng quan Đơn hàng"}
                  {activeModalType === "products" &&
                    "Danh sách Sản phẩm trong hệ thống"}
                  {activeModalType === "customers" &&
                    "Chi tiết tổng quan Khách hàng"}
                </h3>
              </div>
              <button
                type="button"
                className="la-quick-close-btn"
                onClick={() => setActiveModalType(null)}
              >
                <X size={18} />
              </button>
            </header>

            <div className="la-quick-modal-body">
              {activeModalType === "revenue" && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#475569",
                      marginBottom: "12px",
                    }}
                  >
                    Tổng doanh thu toàn hệ thống ghi nhận được:
                  </p>
                  <h3 style={{ fontSize: "24px", color: "#8a6a48", margin: 0 }}>
                    {money(totalRev)}
                  </h3>
                </div>
              )}

              {activeModalType === "orders" && (
                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#475569",
                      marginBottom: "16px",
                    }}
                  >
                    Hệ thống ghi nhận tổng cộng{" "}
                    <strong>{count(data?.totalOrders)}</strong> đơn hàng. Phân
                    bổ trạng thái:
                  </p>
                  <ul
                    style={{
                      display: "grid",
                      gap: "10px",
                      padding: 0,
                      listStyle: "none",
                    }}
                  >
                    {statuses.map(([key, val]) => (
                      <li
                        key={key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          background: "#f8fafc",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <span style={{ fontWeight: 600, color: "#334155" }}>
                          {labels[key] || key}
                        </span>
                        <strong style={{ color: "#0f172a" }}>
                          {count(val)} đơn
                        </strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeModalType === "products" && (
                <div>
                  {productsLoading ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "30px 0",
                        color: "#64748b",
                      }}
                    >
                      <RefreshCw
                        size={24}
                        className="la-spin"
                        style={{ marginBottom: "8px" }}
                      />
                      <p>Đang tải danh sách sản phẩm từ hệ thống…</p>
                    </div>
                  ) : adminProducts.length > 0 ? (
                    <ul
                      style={{
                        display: "grid",
                        gap: "10px",
                        padding: 0,
                        listStyle: "none",
                        maxHeight: "350px",
                        overflowY: "auto",
                      }}
                    >
                      {adminProducts.map((p, idx) => {
                        const variants = Array.isArray(p.variants)
                          ? p.variants
                          : [];
                        return (
                          <li
                            key={p._id || idx}
                            style={{
                              padding: "12px 16px",
                              background: "#f8fafc",
                              borderRadius: "10px",
                              border: "1px solid #e2e8f0",
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <strong
                                style={{ color: "#0f172a", fontSize: "14px" }}
                              >
                                {p.name || `Sản phẩm #${idx + 1}`}
                              </strong>
                            </div>

                            {variants.length > 0 ? (
                              <div
                                style={{
                                  display: "grid",
                                  gap: "6px",
                                  paddingLeft: "8px",
                                  borderLeft: "2px solid #cbd5e1",
                                }}
                              >
                                {variants.map((v, vIdx) => (
                                  <div
                                    key={v._id || vIdx}
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      fontSize: "12px",
                                    }}
                                  >
                                    <div>
                                      <span
                                        style={{
                                          fontFamily: "monospace",
                                          fontWeight: 700,
                                          color: "#1e293b",
                                          background: "#e2e8f0",
                                          padding: "1px 6px",
                                          borderRadius: "4px",
                                        }}
                                      >
                                        {v.sku || "N/A"}
                                      </span>
                                      <span
                                        style={{
                                          color: "#64748b",
                                          marginLeft: "8px",
                                        }}
                                      >
                                        {[v.color, v.size, v.material]
                                          .filter(Boolean)
                                          .join(" / ")}
                                      </span>
                                    </div>
                                    <strong style={{ color: "#2E5A88" }}>
                                      {money(v.price)}
                                    </strong>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: "#94a3b8",
                                  fontStyle: "italic",
                                }}
                              >
                                Chưa có biến thể SKU nào
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "30px 0",
                        color: "#64748b",
                      }}
                    >
                      <Package
                        size={36}
                        color="#94a3b8"
                        style={{ marginBottom: "8px" }}
                      />
                      <p>Không tìm thấy sản phẩm nào trong hệ thống.</p>
                    </div>
                  )}
                </div>
              )}

              {activeModalType === "customers" && (
                <div>
                  {customersLoading ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "30px 0",
                        color: "#64748b",
                      }}
                    >
                      <RefreshCw
                        size={24}
                        className="la-spin"
                        style={{ marginBottom: "8px" }}
                      />
                      <p>Đang tải danh sách khách hàng từ hệ thống…</p>
                    </div>
                  ) : adminCustomers.length > 0 ? (
                    <ul
                      style={{
                        display: "grid",
                        gap: "10px",
                        padding: 0,
                        listStyle: "none",
                        maxHeight: "350px",
                        overflowY: "auto",
                      }}
                    >
                      {adminCustomers.map((c, idx) => (
                        <li
                          key={c._id || c.id || idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px 16px",
                            background: "#f8fafc",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <div>
                            <strong
                              style={{
                                display: "block",
                                color: "#0f172a",
                                fontSize: "14px",
                              }}
                            >
                              {c.fullName || c.name || `Khách hàng #${idx + 1}`}
                            </strong>
                            <span
                              style={{ fontSize: "12px", color: "#64748b" }}
                            >
                              Email: {c.email || "Chưa có email"}
                            </span>
                            <br />
                            <span
                              style={{ fontSize: "12px", color: "#64748b" }}
                            >
                              SĐT: {c.phone || "Chưa có số điện thoại"}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              background: "#fdf8f0",
                              color: "#B98436",
                              border: "1px solid #f3e8d2",
                              padding: "3px 8px",
                              borderRadius: "20px",
                            }}
                          >
                            Khách hàng
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "30px 0",
                        color: "#64748b",
                      }}
                    >
                      <Users
                        size={36}
                        color="#B98436"
                        style={{ marginBottom: "8px" }}
                      />
                      <p>Không có tài khoản khách hàng nào.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <footer className="la-quick-modal-footer">
              <button
                type="button"
                className="la-button"
                onClick={() => setActiveModalType(null)}
              >
                Đóng
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
