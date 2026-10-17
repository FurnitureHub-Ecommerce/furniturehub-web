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
  rejected: "Đã từ chối",
  cancelled: "Đã hủy",
};
const statusColors = {
  pending: "#B98436",
  confirmed: "#487C59",
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
        currency: "EUR",
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
  // Chỉ dùng các field đã được implementation hiện tại đọc; thiếu dữ liệu không đồng nghĩa bằng 0.
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
      <div className="la-dashboard-hero">
        <div className="la-context">
          <span>TỔNG QUAN ĐIỀU HÀNH</span>
        </div>
        <section className="la-page-heading">
          <div>
            <h1>
              Tổng Quan <em>Điều Hành</em>
            </h1>
            <p>
              Theo dõi doanh thu, đơn hàng, sản phẩm và khách hàng trong hệ
              thống LUMORA.
            </p>
          </div>
          <div className="la-report-controls">
            <button
              className="la-button la-button-dark"
              onClick={reload}
              disabled={state.loading}
            >
              <RefreshCw size={16} aria-hidden="true" />
              {state.loading ? "Đang tải…" : "Làm Mới Dữ Liệu"}
            </button>
          </div>
        </section>
      </div>
      {state.loading ? (
        <div className="la-data-state" role="status">
          <Landmark size={27} aria-hidden="true" />
          <div>
            <strong>Đang tải thống kê</strong>
            <p>Dữ liệu điều hành đang được cập nhật…</p>
          </div>
        </div>
      ) : state.error ? (
        <div className="la-data-state la-data-error" role="alert">
          <CircleAlert size={27} aria-hidden="true" />
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
              <span className="la-eyebrow">BỨC TRANH TOÀN CẢNH</span>
              <h2>Chỉ Số Cốt Lõi</h2>
            </div>
            <p>Số liệu hiện có từ hệ thống LUMORA</p>
          </div>
          <section className="la-kpis" aria-label="Chỉ số tổng quan">
            {metrics.map(([label, value, Icon, format], index) => (
              <article className="la-kpi" key={label}>
                <div className="la-kpi-top">
                  <span className="la-kpi-icon">
                    <Icon size={21} aria-hidden="true" />
                  </span>
                  <span className="la-kpi-index" aria-hidden="true">
                    0{index + 1} / 05
                  </span>
                </div>
                <div className="la-kpi-metric">
                  <span className="la-kpi-label">{label}</span>
                  <strong
                    className={`la-kpi-value ${numeric(value) ? "" : "la-api-missing"}`}
                  >
                    {format(value)}
                  </strong>
                </div>
              </article>
            ))}
          </section>
          <div className="la-analytics">
            <section className="la-panel">
              <div className="la-panel-heading">
                <div>
                  <p className="la-eyebrow">TÌNH HÌNH ĐƠN HÀNG</p>
                  <h2>Đơn Hàng Theo Trạng Thái</h2>
                </div>
                <span className="la-panel-index" aria-hidden="true">
                  01
                </span>
              </div>
              {statuses.length ? (
                <ul className="la-api-statuses">
                  {statuses.map(([key, value]) => {
                    const percentage = numeric(total) && total > 0 ? value / total * 100 : 0;
                    return (
                      <li key={key} style={{ "--status-color": statusColors[key] ?? "#806E68" }}>
                        <div>
                          <span>{labels[key] ?? "Trạng thái khác"}</span>
                          <strong>{count(value)}{numeric(total) && <small>{new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(percentage)}%</small>}</strong>
                        </div>
                        {numeric(total) && (
                          <progress
                            value={total > 0 ? Math.min(value, total) : 0}
                            max={total > 0 ? total : 1}
                            aria-label={`${labels[key] ?? "Trạng thái khác"}: ${count(value)} trên ${count(total)} đơn`}
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="la-api-empty">Chưa có dữ liệu</p>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
