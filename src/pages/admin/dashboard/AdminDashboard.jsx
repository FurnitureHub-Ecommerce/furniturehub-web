import { useEffect, useState } from "react";
import {
  Landmark,
  DraftingCompass,
  Award,
  Truck,
  Hammer,
  Building,
  ShieldCheck,
  Package,
  ShoppingBag,
  Users,
  RefreshCw,
  Layers,
  DollarSign,
} from "lucide-react";
import { getDashboard } from "../../../services/admin/dashboard.service.js";
import api from "../../../services/api.js";
import "./AdminDashboard.css";

const euros = (value) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const money = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value || 0);

const number = (value) => new Intl.NumberFormat("en-US").format(value || 0);

const icons = {
  truck: Truck,
  hammer: Hammer,
  building: Building,
  shield: ShieldCheck,
};

const STATUS_COLORS = {
  pending: "#ca8a04",
  confirmed: "#15803d",
  rejected: "#dc2626",
  cancelled: "#78716c",
};

const STATUS_LABELS = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  rejected: "Đã từ chối",
  cancelled: "Đã hủy",
};

export default function AdminDashboard() {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [stats, setStats] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getDashboard(),
      api
        .get("/api/dashboard/statistics")
        .then((res) => res?.data?.data ?? res?.data),
    ])
      .then(([dashboardData, statisticsData]) => {
        if (!cancelled) {
          setState({ data: dashboardData, loading: false, error: "" });
          setStats(statisticsData);
        }
      })
      .catch((error) => {
        if (!cancelled)
          setState({ data: null, loading: false, error: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (state.error)
    return (
      <div className="la-data-state" role="alert">
        <h1>Không thể tải báo cáo từ cơ sở dữ liệu</h1>
        <p>{state.error}</p>
      </div>
    );

  if (state.loading || !state.data)
    return (
      <div className="la-data-state" role="status">
        Đang đồng bộ dữ liệu từ hệ thống…
      </div>
    );

  const data = state.data;
  const s = data.summary || {};
  const totalOrdersCount = stats?.totalOrders || 1;

  let cumulativePercent = 0;
  const gradientStops = stats?.ordersByStatus ? Object.entries(stats.ordersByStatus).map(([key, value]) => {
    const percent = (value / totalOrdersCount) * 100;
    const start = cumulativePercent;
    cumulativePercent += percent;
    return `${STATUS_COLORS[key] || '#1c1c1c'} ${start}% ${cumulativePercent}%`;
  }).join(", ") : "#ccc 0% 100%";

  return (
    <div
      className="la-dashboard"
      style={{
        fontFamily: "'Inter', sans-serif",
        width: "100%",
        margin: 0,
        padding: 0,
      }}
    >
      {/* HEADER */}
      <section
        className="la-page-heading"
        style={{
          marginTop: 0,
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          borderBottom: "1px solid #eae6df",
          paddingBottom: "16px",
          width: "100%",
        }}
      >
        <div>
          <span
            className="subtitle"
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              color: "#78716c",
            }}
          >
            QUẢN TRỊ HỆ THỐNG
          </span>
          <h1
            style={{
              fontFamily: "Bodoni Moda",
              fontSize: "2.4rem",
              color: "#1a1a1a",
              fontWeight: 600,
              margin: "4px 0 6px 0",
            }}
          >
            Tổng Quan Điều Hành & Thống Kê
          </h1>
          <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>
            Giám sát doanh thu, phân bổ Hub quốc tế và toàn bộ hệ sinh thái nội
            thất cao cấp từ Database.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((prev) => prev + 1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #dcd6cd",
            background: "#fff",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
            color: "#444",
          }}
        >
          <RefreshCw size={14} /> Làm mới số liệu
        </button>
      </section>

      {/* KPIS GRID */}
      <section
        className="la-kpis"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "24px",
          width: "100%",
        }}
      >
        <article
          className="la-kpi"
          style={{
            background: "#fff",
            padding: "18px",
            borderRadius: "10px",
            border: "1px solid #eae6df",
          }}
        >
          <div
            className="la-kpi-label"
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#78716c",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            DOANH THU GỘP (GMV) <Landmark size={16} />
          </div>
          <strong
            className="la-kpi-value"
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#1c1c1c",
              display: "block",
              margin: "8px 0 4px 0",
            }}
          >
            {euros(s.revenue)}
          </strong>
          <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>
            Biên lợi nhuận gộp: <strong>{s.margin || 0}%</strong>
          </p>
        </article>

        <article
          className="la-kpi"
          style={{
            background: "#fff",
            padding: "18px",
            borderRadius: "10px",
            border: "1px solid #eae6df",
          }}
        >
          <div
            className="la-kpi-label"
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#78716c",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            TỒN KHO TOÀN CẦU <Package size={16} />
          </div>
          <strong
            className="la-kpi-value"
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#1c1c1c",
              display: "block",
              margin: "8px 0 4px 0",
            }}
          >
            {euros(s.inventoryValue)}
          </strong>
          <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>
            Ủy thác giám tuyển & kho
          </p>
        </article>

        <article
          className="la-kpi"
          style={{
            background: "#fff",
            padding: "18px",
            borderRadius: "10px",
            border: "1px solid #eae6df",
          }}
        >
          <div
            className="la-kpi-label"
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#78716c",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            COMMISSIONS ĐANG CHẾ TÁC <DraftingCompass size={16} />
          </div>
          <strong
            className="la-kpi-value"
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#1c1c1c",
              display: "block",
              margin: "8px 0 4px 0",
            }}
          >
            {s.commissions || 0}{" "}
            <small style={{ fontSize: "11px" }}>tác phẩm</small>
          </strong>
          <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>
            Chuẩn giờ SLA: <strong>{s.sla || 0}%</strong>
          </p>
        </article>

        <article
          className="la-kpi"
          style={{
            background: "#fff",
            padding: "18px",
            borderRadius: "10px",
            border: "1px solid #eae6df",
          }}
        >
          <div
            className="la-kpi-label"
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#78716c",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            THÀNH VIÊN VIP <Award size={16} />
          </div>
          <strong
            className="la-kpi-value"
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#1c1c1c",
              display: "block",
              margin: "8px 0 4px 0",
            }}
          >
            {number(s.members)}
          </strong>
          <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>
            Tỷ lệ mua lại: <strong>{s.repeatRate || 0}%</strong>
          </p>
        </article>
      </section>

      {/* THỐNG KÊ TỪ ENDPOINT /api/dashboard/statistics */}
      {stats && (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "24px",
            width: "100%",
          }}
        >
          <article
            style={{
              background: "#fff",
              padding: "18px",
              borderRadius: "10px",
              border: "1px solid #eae6df",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#78716c",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              TỔNG DOANH THU THẬT <DollarSign size={16} />
            </div>
            <strong
              style={{
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "#1c1c1c",
                display: "block",
                margin: "8px 0 4px 0",
              }}
            >
              {money(stats.totalRevenue)}
            </strong>
            <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>
              Từ Database hệ thống
            </p>
          </article>

          <article
            style={{
              background: "#fff",
              padding: "18px",
              borderRadius: "10px",
              border: "1px solid #eae6df",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#78716c",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              TỔNG ĐƠN HÀNG <ShoppingBag size={16} />
            </div>
            <strong
              style={{
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "#1c1c1c",
                display: "block",
                margin: "8px 0 4px 0",
              }}
            >
              {stats.totalOrders || 0} đơn
            </strong>
            <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>
              Đơn hàng phát sinh
            </p>
          </article>

          <article
            style={{
              background: "#fff",
              padding: "18px",
              borderRadius: "10px",
              border: "1px solid #eae6df",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#78716c",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              TỔNG SẢN PHẨM <Layers size={16} />
            </div>
            <strong
              style={{
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "#1c1c1c",
                display: "block",
                margin: "8px 0 4px 0",
              }}
            >
              {stats.totalProducts || 0} mẫu
            </strong>
            <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>
              Sản phẩm trong danh mục
            </p>
          </article>

          <article
            style={{
              background: "#fff",
              padding: "18px",
              borderRadius: "10px",
              border: "1px solid #eae6df",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#78716c",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              KHÁCH HÀNG & USER <Users size={16} />
            </div>
            <strong
              style={{
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "#1c1c1c",
                display: "block",
                margin: "8px 0 4px 0",
              }}
            >
              {stats.totalCustomers || 0} khách
            </strong>
            <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>
              Tổng {stats.totalUsers || 0} tài khoản
            </p>
          </article>
        </section>
      )}

      {/* KHỐI GỘP CHUNG CHUẨN MẪU (CHÚ THÍCH TRÁI + DONUT CHART PHẢI) */}
      {stats?.ordersByStatus && (
        <section
          style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #eae6df",
            marginBottom: "24px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              fontFamily: "Bodoni Moda",
              color: "#1a1a1a",
              marginBottom: "20px",
            }}
          >
            Tỷ Trọng Trạng Thái Đơn Hàng
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              alignItems: "center",
            }}
          >
            {/* Cột trái: Danh sách chú thích tỷ lệ % giống mẫu */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {Object.entries(stats.ordersByStatus).map(([key, value]) => {
                const percent = Math.round((value / totalOrdersCount) * 100) || 0;
                return (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: STATUS_COLORS[key] || "#1c1c1c",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "#1c1c1c" }}>
                        {STATUS_LABELS[key] || key}
                      </span>
                    </div>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "#1c1c1c" }}>
                      {percent}% <small style={{ fontWeight: 400, color: "#666", fontSize: "12px" }}>({value} đơn)</small>
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Cột phải: Biểu đồ vòng tròn (Donut Chart) */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div style={{ position: "relative", width: "170px", height: "170px" }}>
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: `conic-gradient(${gradientStops})`,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "24px",
                    left: "24px",
                    width: "122px",
                    height: "122px",
                    borderRadius: "50%",
                    background: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
                  }}
                >
                  <span style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1c1c1c" }}>
                    {stats.totalOrders || 0}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#78716c",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    đơn hàng
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* HUBS LOGISTICS */}
      <section
        className="la-hubs"
        style={{
          background: "#fff",
          padding: "24px",
          borderRadius: "12px",
          border: "1px solid #eae6df",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div className="la-section-header" style={{ marginBottom: "16px" }}>
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "#1c1c1c",
              margin: 0,
            }}
          >
            Hiệu Suất Vận Hành 4 Trung Tâm Depository
          </h2>
          <p style={{ fontSize: "12px", color: "#666", margin: "2px 0 0 0" }}>
            Giám sát tải trọng lưu trữ và năng lực xuất xưởng tại các Hub quốc
            tế.
          </p>
        </div>
        <div
          className="la-hub-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
        >
          {(data.hubs || []).map((hub) => {
            const Icon = icons[hub.icon] || Building;
            return (
              <article
                key={hub.id}
                style={{
                  background: "#faf8f5",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #f2efeb",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#78716c",
                    }}
                  >
                    {hub.label}
                  </span>
                  <Icon size={15} color="#78716c" />
                </div>
                <h3
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    margin: "0 0 4px 0",
                    color: "#1c1c1c",
                  }}
                >
                  {hub.title}
                </h3>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#666",
                    margin: "0 0 12px 0",
                    lineHeight: 1.4,
                  }}
                >
                  {hub.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    fontWeight: 600,
                    marginBottom: "6px",
                  }}
                >
                  <span style={{ color: "#78716c" }}>Dung lượng:</span>
                  <span style={{ color: "#1c1c1c" }}>
                    {(hub.utilization || 0).toFixed(1)}%
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "5px",
                    background: "#e5e2db",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${hub.utilization || 0}%`,
                      height: "100%",
                      background: "#1c1c1c",
                    }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}