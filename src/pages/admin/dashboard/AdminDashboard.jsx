import { useEffect, useState } from "react";
import {
  Landmark,
  ShoppingBag,
  Users,
  UserRound,
  Package,
  RefreshCw,
  CircleAlert,
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
  const metrics = [
    ["TỔNG DOANH THU", data?.totalRevenue, Landmark, money],
    ["TỔNG ĐƠN HÀNG", data?.totalOrders, ShoppingBag, count],
    ["TỔNG SẢN PHẨM", data?.totalProducts, Package, count],
    ["TỔNG KHÁCH HÀNG", data?.totalCustomers, Users, count],
    ["TỔNG TÀI KHOẢN", data?.totalUsers, UserRound, count],
  ];

  const statuses =
    data?.ordersByStatus &&
    typeof data.ordersByStatus === "object" &&
    !Array.isArray(data.ordersByStatus)
      ? Object.entries(data.ordersByStatus).filter(
          ([, value]) => numeric(value) && value >= 0,
        )
      : [];
  const total = data?.totalOrders;

  return (
    <div className="la-dashboard">
      {/* Banner Tổng Quan Điều Hành */}
      <div className="la-dashboard-hero">
        <div className="la-dashboard-hero-content">
          <div className="la-dashboard-titles">
            <span className="la-hero-badge">TỔNG QUAN ĐIỀU HÀNH</span>
            <h1>Tổng Quan <em>Điều Hành</em></h1>
            <p>Theo dõi doanh thu, đơn hàng, sản phẩm và khách hàng trong hệ thống LUMORA Atelier.</p>
          </div>
          <button
            className="la-refresh-btn"
            onClick={reload}
            disabled={state.loading}
          >
            <RefreshCw size={15} className={state.loading ? "la-spin" : ""} aria-hidden="true" />
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
          <button className="la-button" onClick={reload}>Thử lại</button>
        </div>
      ) : (
        <>
          <div className="la-dashboard-section-heading">
            <div>
              <span className="la-eyebrow">BỨC TRANH TOÀN CẢNH</span>
              <h2>Chỉ Số Cốt Lõi</h2>
            </div>
            
          </div>

          {/* Các thẻ KPI thống kê (đã bỏ 01/05) */}
          <section className="la-kpis" aria-label="Chỉ số tổng quan">
            {metrics.map(([label, value, Icon, format]) => (
              <article className="la-kpi" key={label}>
                <div className="la-kpi-top">
                  <span className="la-kpi-icon">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                </div>
                <div className="la-kpi-metric">
                  <span className="la-kpi-label">{label}</span>
                  <strong className={`la-kpi-value ${numeric(value) ? "" : "la-api-missing"}`}>
                    {format(value)}
                  </strong>
                </div>
              </article>
            ))}
          </section>

          {/* Khu vực Trạng thái đơn hàng dạng Grid Cards */}
          <div className="la-analytics">
            <section className="la-panel">
              <div className="la-panel-heading">
                <div>
                  <span className="la-eyebrow">TÌNH HÌNH VẬN HÀNH</span>
                  <h2>Đơn Hàng Theo Trạng Thái</h2>
                </div>
              </div>
              {statuses.length ? (
                <div className="la-status-grid">
                  {statuses.map(([key, value]) => {
                    const percentage = numeric(total) && total > 0 ? (value / total) * 100 : 0;
                    return (
                      <div className="la-status-card" key={key} style={{ "--status-color": statusColors[key] ?? "#8a6a48" }}>
                        <div className="la-status-card-header">
                          <span className="la-status-dot" />
                          <span className="la-status-name">{labels[key] ?? key}</span>
                        </div>
                        <div className="la-status-card-metric">
                          <strong>{count(value)}</strong>
                          <span className="la-status-percent">
                            {numeric(total) && `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(percentage)}%`}
                          </span>
                        </div>
                        {numeric(total) && (
                          <div className="la-progress-track">
                            <div 
                              className="la-progress-fill" 
                              style={{ width: `${Math.min(percentage, 100)}%`, background: statusColors[key] ?? "#8a6a48" }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="la-api-empty">Chưa có dữ liệu trạng thái đơn hàng</p>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}