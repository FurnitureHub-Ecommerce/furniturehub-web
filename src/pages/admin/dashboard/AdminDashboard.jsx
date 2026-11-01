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
    : "0 đ";

export default function AdminDashboard() {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [revision, setRevision] = useState(0);

  // State quản lý Modal xem nhanh & danh sách sản phẩm chi tiết
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

  // Gọi API lấy danh sách tất cả sản phẩm khi mở modal sản phẩm
  useEffect(() => {
    if (activeModalType === "products") {
      setProductsLoading(true);
      getCatalog()
        .then((res) => {
          // getCatalog trả về object dạng { rows: [...], loaded: ... }
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

  // Gọi API lấy danh sách người dùng và lọc tài khoản customer khi mở modal customers
  useEffect(() => {
    if (activeModalType === "customers") {
      setCustomersLoading(true);
      getUsers()
        .then((rows) => {
          // Lọc những tài khoản có role là CUSTOMER (không phân biệt hoa thường)
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

  const totalRev = data?.totalRevenue || 0;

  const currentMonthIndex = 9;
  const monthlyRevenueData = Array.from({ length: 12 }, (_, index) => {
    const monthNum = index + 1;
    const rev = index === currentMonthIndex ? totalRev : 0;

    let heightPercent = "0%";
    if (totalRev > 0) {
      heightPercent = index === currentMonthIndex ? "100%" : "4px";
    }

    return {
      m: `Tháng ${monthNum}`,
      short: `T${monthNum}`,
      revenue: rev,
      h: heightPercent,
      highlight: index === currentMonthIndex,
    };
  });

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
      {/* Banner Hero Đặc Trưng Lumora Atelier */}
      <div className="la-dashboard-hero">
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
        <div className="la-data-state" role="status">
          <RefreshCw size={20} className="la-spin" />
          <div>
            <strong>Đang tải thống kê hệ thống</strong>
            <p>Dữ liệu điều hành đang được đồng bộ…</p>
          </div>
        </div>
      ) : state.error ? (
        <div className="la-data-state la-data-error" role="alert">
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
          <div className="la-metrics-top-grid">
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
                  <TrendingUp size={12} /> Cập nhật thực tế tháng 10/2026
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

          {/* 2. Biểu đồ Doanh Thu & Lịch */}
          <div className="la-mid-section-grid">
            <div className="la-chart-card">
              <div className="la-card-header-between">
                <h3>Biểu Đồ Doanh Thu Theo Tháng ({money(totalRev)})</h3>
                <TrendingUp size={16} color="#71717a" />
              </div>
              <div className="la-bar-chart-mock" style={{ overflowX: "auto" }}>
                {monthlyRevenueData.map((item) => (
                  <div
                    className="la-bar-item"
                    key={item.m}
                    title={`${item.m} 2026: ${money(item.revenue)}`}
                  >
                    <div
                      className={`la-bar-column ${item.highlight ? "highlight" : ""}`}
                      style={{ height: item.h }}
                    />
                    <span className="la-bar-label">{item.short}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="la-calendar-card">
              <div className="la-calendar-header">
                <span>&lt;</span>
                <span>Tháng Mười 2026</span>
                <span>&gt;</span>
              </div>

              <div className="la-calendar-days-row">
                {[
                  { d: "Th 3", n: "24" },
                  { d: "Th 4", n: "25" },
                  { d: "Th 5", n: "26", active: true },
                  { d: "Th 6", n: "27" },
                  { d: "Th 7", n: "28" },
                ].map((c) => (
                  <div
                    key={c.n}
                    className={`la-cal-day-box ${c.active ? "active" : ""}`}
                  >
                    <span>{c.d}</span>
                    <span className="la-cal-date">{c.n}</span>
                  </div>
                ))}
              </div>

              <div className="la-community-growth">
                <div className="la-growth-info">
                  <h4>Tăng trưởng cộng đồng</h4>
                  <span>↗ Cập nhật tháng 10/2026</span>
                </div>
                <div className="la-circular-progress">
                  <span>65%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Phân Bổ Trạng Thái Đơn Hàng */}
          <div className="la-analytics">
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
                  {activeModalType === "revenue" &&
                    "Chi tiết Doanh Thu theo tháng (Năm 2026)"}
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
                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#475569",
                      marginBottom: "16px",
                    }}
                  >
                    Thống kê doanh thu thực tế phát sinh trong năm 2026 (Tính
                    đến tháng 10/2026):
                  </p>
                  <ul
                    style={{
                      display: "grid",
                      gap: "8px",
                      padding: 0,
                      listStyle: "none",
                      maxHeight: "250px",
                      overflowY: "auto",
                    }}
                  >
                    {monthlyRevenueData.map((item) => (
                      <li
                        key={item.m}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          background: item.highlight ? "#f1f5f9" : "#f8fafc",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            color: item.highlight ? "#0f172a" : "#334155",
                          }}
                        >
                          {item.m} 2026
                        </span>
                        <strong
                          style={{
                            color: item.highlight ? "#2E5A88" : "#64748b",
                          }}
                        >
                          {money(item.revenue)}
                        </strong>
                      </li>
                    ))}
                  </ul>
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

                            {/* Hiển thị danh sách các variant và mã SKU tương ứng */}
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
                    <div style={{ textAlign: "center", padding: "30px 0", color: "#64748b" }}>
                      <RefreshCw size={24} className="la-spin" style={{ marginBottom: "8px" }} />
                      <p>Đang tải danh sách khách hàng từ hệ thống…</p>
                    </div>
                  ) : adminCustomers.length > 0 ? (
                    <ul style={{ display: "grid", gap: "10px", padding: 0, listStyle: "none", maxHeight: "350px", overflowY: "auto" }}>
                      {adminCustomers.map((c, idx) => (
                        <li key={c._id || c.id || idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                          <div>
                            <strong style={{ display: "block", color: "#0f172a", fontSize: "14px" }}>
                              {c.fullName || c.name || `Khách hàng #${idx + 1}`}
                            </strong>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>
                              Email: {c.email || "Chưa có email"} 
                            </span>
                            <br />
                            <span style={{ fontSize: "12px", color: "#64748b" }}>
                              SĐT: {c.phone || "Chưa có số diện thoại"}
                            </span>
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: 700, background: "#fdf8f0", color: "#B98436", border: "1px solid #f3e8d2", padding: "3px 8px", borderRadius: "20px" }}>
                            Khách hàng
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ textAlign: "center", padding: "30px 0", color: "#64748b" }}>
                      <Users size={36} color="#B98436" style={{ marginBottom: "8px" }} />
                      <p>Chưa có tài khoản khách hàng nào trong hệ thống.</p>
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
