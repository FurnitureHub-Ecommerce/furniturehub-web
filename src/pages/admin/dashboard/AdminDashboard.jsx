import { useEffect, useState } from "react";
import {
  Landmark,
  ChevronRight,
  DraftingCompass,
  Award,
  Download,
  RefreshCw,
  TrendingUp,
  Truck,
  Hammer,
  Building,
  ShieldCheck,
  TriangleAlert,
  Package,
} from "lucide-react";
import { getDashboard } from "../../../services/admin/dashboard.service.js";
import "./AdminDashboard.css";

const euros = (value) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
const number = (value) => new Intl.NumberFormat("en-US").format(value);
const shortDate = (value) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
const icons = {
  truck: Truck,
  hammer: Hammer,
  building: Building,
  shield: ShieldCheck,
};

function Unavailable({
  children,
  reason = "Chưa tích hợp Backend hoặc quy trình nghiệp vụ",
  dark = false,
}) {
  return (
    <span className="la-unavailable" tabIndex={0} aria-label={reason}>
      <button disabled className={`la-button ${dark ? "la-button-dark" : ""}`}>
        {children}
      </button>
      <span role="tooltip">{reason}</span>
    </span>
  );
}

function RevenueChart({ data }) {
  const [selected, setSelected] = useState(null);
  const series = data.series;
  const maximum = Math.max(...series.map((point) => point.value), 1) * 1.15;
  const x = (index) => 16 + (index / Math.max(series.length - 1, 1)) * 648;
  const y = (value) => 250 - (value / maximum) * 210;
  const path = series
    .map((point, i) => `${i ? "L" : "M"} ${x(i)} ${y(point.value)}`)
    .join(" ");
  const peakIndex = series.findIndex((point) => point.date === data.peak.date);
  const index = selected ?? peakIndex;
  const point = series[index];
  const ticks = Array.from({ length: 6 }, (_, i) =>
    Math.round((i * (series.length - 1)) / 5),
  );
  return (
    <div className="la-chart-surface">
      <div className="la-chart-meta">
        <span>
          {shortDate(data.start)} - {shortDate(data.end)} /{" "}
          {data.end.slice(0, 4)}
        </span>
        <span>
          PEAK: {euros(data.peak.value)} ({shortDate(data.peak.date)})
        </span>
      </div>
      <div className="la-chart-interactive">
        <svg
          viewBox="0 0 680 280"
          role="img"
          aria-label={`Doanh thu demo từ ${data.start} đến ${data.end}`}
        >
          <defs>
            <linearGradient id="la-revenue-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#92764e" stopOpacity=".3" />
              <stop offset="100%" stopColor="#92764e" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[65, 145, 225].map((height) => (
            <line
              key={height}
              x1="16"
              x2="664"
              y1={height}
              y2={height}
              stroke="#e6ddd0"
              strokeDasharray="3 6"
            />
          ))}
          <path
            d={`${path} L 664 265 L 16 265 Z`}
            fill="url(#la-revenue-fill)"
          />
          <path d={path} fill="none" stroke="#80603c" strokeWidth="2.5" />
          <circle
            cx={x(index)}
            cy={y(point.value)}
            r="4"
            fill="#faf7f1"
            stroke="#80603c"
            strokeWidth="2"
          />
        </svg>
        <input
          className="la-chart-input"
          type="range"
          min="0"
          max={series.length - 1}
          value={index}
          aria-label="Chọn ngày để xem doanh thu demo"
          aria-valuetext={`${shortDate(point.date)}: ${euros(point.value)}`}
          onChange={(e) => setSelected(Number(e.target.value))}
          onPointerMove={(e) => {
            if (e.pointerType === "mouse") {
              const rect = e.currentTarget.getBoundingClientRect();
              setSelected(
                Math.max(
                  0,
                  Math.min(
                    series.length - 1,
                    Math.round(
                      ((e.clientX - rect.left) / rect.width) *
                        (series.length - 1),
                    ),
                  ),
                ),
              );
            }
          }}
        />
        <div
          className="la-chart-tooltip"
          style={{
            left: `${Math.min(77, Math.max(2, (index / Math.max(series.length - 1, 1)) * 100))}%`,
          }}
        >
          <small>DOANH THU DEMO</small>
          <strong>{euros(point.value)}</strong>
          <span>
            {shortDate(point.date)}/{point.date.slice(0, 4)}
          </span>
        </div>
      </div>
      <div className="la-chart-ticks">
        {ticks.map((i) => (
          <span key={i}>{shortDate(series[i].date)}</span>
        ))}
      </div>
      <p className="la-chart-help">
        Di chuột, chạm hoặc dùng phím mũi tên để xem từng ngày.
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState("2025-Q4");
  const [range, setRange] = useState("30d");
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    getDashboard({ period, range })
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: "" });
      })
      .catch((error) => {
        if (!cancelled)
          setState({ data: null, loading: false, error: error.message });
      });
    return () => {
      cancelled = true;
    };
  }, [period, range, retry]);
  function changePeriod(value) {
    setState((previous) => ({ ...previous, loading: true, error: "" }));
    setPeriod(value);
  }
  function changeRange(value) {
    if (value !== range) {
      setState((previous) => ({ ...previous, loading: true, error: "" }));
      setRange(value);
    }
  }
  if (state.error)
    return (
      <div className="la-data-state" role="alert">
        <h1>Không thể tải báo cáo</h1>
        <p>{state.error}</p>
        <button
          className="la-button"
          onClick={() => {
            setState({ data: null, loading: true, error: "" });
            setRetry(retry + 1);
          }}
        >
          Thử lại
        </button>
      </div>
    );
  if (!state.data)
    return (
      <div className="la-data-state" role="status">
        Đang tải báo cáo demo…
        <div className="la-loading-block" />
      </div>
    );
  const data = state.data;
  const s = data.summary;
  const segments = data.materials
    .map((material, index) => {
      const offset = data.materials
        .slice(0, index)
        .reduce((sum, item) => sum + item.percentage, 0);
      return `${material.color} ${offset}% ${offset + material.percentage}%`;
    })
    .join(", ");
  return (
    <div className="la-dashboard" aria-busy={state.loading}>
      <div className="la-context">
        <span>● TỔNG QUAN ĐIỀU HÀNH</span>
        <span>METRICS VẬN HÀNH</span>
        <strong>DỮ LIỆU DEMO</strong>
        <span className="la-clearance">SECURITY TIER: CHƯA TÍCH HỢP</span>
      </div>
      <section className="la-page-heading">
        <div>
          <h1>
            Tổng Quan Điều Hành Doanh Nghiệp <em>&</em> Phân Tích Thống Kê
          </h1>
          <p>
            Executive Dashboard & Performance Intelligence - Quản trị doanh thu
            Atelier, giám sát 4 Hub ủy thác quốc tế và toàn hệ sinh thái
            bespoke.
          </p>
        </div>
        <div className="la-report-controls">
          <Unavailable reason="Xuất báo cáo chưa triển khai">
            <Download size={15} /> Xuất Báo Cáo (PDF/Excel)
          </Unavailable>
          <label className="la-period">
            Kỳ Báo Cáo:
            <select
              aria-label="Kỳ báo cáo"
              value={period}
              onChange={(e) => changePeriod(e.target.value)}
            >
              {data.periods.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <Unavailable dark reason="Đồng bộ Backend chưa triển khai">
            <RefreshCw size={15} /> Đồng Bộ Số Liệu
          </Unavailable>
        </div>
      </section>
      <p className="la-demo-notice" role="status">
        {state.loading
          ? "Đang tải báo cáo demo…"
          : "Số liệu trình diễn, không phản ánh hoạt động thực tế. KPI và cơ cấu theo kỳ chọn; tab chỉ thay đổi khoảng thời gian của biểu đồ doanh thu. Hub và cảnh báo là tình huống demo cố định."}
      </p>
      <section className="la-kpis" aria-label="Chỉ số điều hành">
        <article className="la-kpi">
          <div className="la-kpi-label">
            DOANH THU GỘP (GMV)
            <Landmark size={19} />
          </div>
          <strong className="la-kpi-value">{euros(s.revenue)}</strong>
          <p>So với quý trước: {euros(s.previousRevenue)}</p>
          <div className="la-kpi-detail">
            <span>BIÊN LỢI NHUẬN GỘP</span>
            <b>{s.margin}%</b>
          </div>
        </article>
        <article className="la-kpi">
          <div className="la-kpi-label">
            TỒN KHO NGHỆ THUẬT TOÀN CẦU
            <ChevronRight size={23} aria-hidden="true" />
          </div>
          <strong className="la-kpi-value">{euros(s.inventoryValue)}</strong>
          <p>Ủy thác giám tuyển & phôi đá quý</p>
          <div className="la-kpi-detail">
            <span>PHÂN PHỐI HUB</span>
            <b className="la-hub-names">{data.distribution}</b>
          </div>
        </article>
        <article className="la-kpi">
          <div className="la-kpi-label">
            COMMISSIONS ĐANG CHẾ TÁC
            <DraftingCompass size={19} />
          </div>
          <div className="la-commission">
            <strong className="la-kpi-value">
              {s.commissions} <small>tác phẩm</small>
            </strong>
            <span>
              TB
              <br />
              {euros(s.averageCommission)}/đơn
            </span>
          </div>
          <p>Đơn hàng Bespoke & Kiến trúc sư</p>
          <div className="la-kpi-detail">
            <span>WHITE-GLOVE SLA</span>
            <b>
              {s.sla}%<br />
              Chuẩn Giờ
            </b>
          </div>
        </article>
        <article className="la-kpi">
          <div className="la-kpi-label">
            SOVEREIGN PRIVATE VIP
            <Award size={19} />
          </div>
          <div className="la-commission">
            <strong className="la-kpi-value">{number(s.members)}</strong>
            <span>Thành viên định danh</span>
          </div>
          <p>Nhà sưu tập tư nhân & Family Offices</p>
          <div className="la-kpi-detail">
            <span>TỶ LỆ MUA LẠI NĂM</span>
            <b>
              {s.repeatRate}%<br />
              Lũy Kế
            </b>
          </div>
        </article>
      </section>
      <div className="la-analytics">
        <section className="la-panel la-revenue">
          <div className="la-section-header">
            <div>
              <p className="la-eyebrow">TRAJECTORY & CASH FLOW</p>
              <h2>Dòng Chảy Doanh Thu & Giá Trị Hợp Đồng Chế Tác</h2>
              <p>
                Tổng trong khoảng chọn: {euros(data.seriesTotal)} (dữ liệu
                demo).
              </p>
            </div>
            <div
              className="la-chart-tabs"
              role="group"
              aria-label="Khoảng thời gian biểu đồ"
            >
              {[
                ["30d", "30 Ngày"],
                ["quarter", "Theo Quý"],
                ["ytd", `YTD ${data.end.slice(0, 4)}`],
              ].map(([id, label]) => (
                <button
                  key={id}
                  aria-pressed={range === id}
                  className={range === id ? "la-selected" : ""}
                  onClick={() => changeRange(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {data.series.length ? (
            <RevenueChart key={`${period}-${range}`} data={data} />
          ) : (
            <p className="la-data-state">
              Không có dữ liệu trong khoảng thời gian này.
            </p>
          )}
          <div className="la-channels">
            {data.channels.map((channel) => (
              <article key={channel.name}>
                <h3>{channel.name}</h3>
                <strong>{euros(channel.value)}</strong>
                <p>
                  {((channel.value / s.revenue) * 100).toFixed(1)}%{" "}
                  {channel.description}
                </p>
              </article>
            ))}
          </div>
        </section>
        <section className="la-panel la-portfolio">
          <p className="la-eyebrow">PORTFOLIO INTELLIGENCE</p>
          <h2>Cơ Cấu Bộ Sưu Tập</h2>
          <p>Tỷ phần giá trị theo chủng loại vật liệu & chế tác thủ công</p>
          <div
            className="la-donut"
            role="img"
            aria-label={data.materials
              .map((item) => `${item.name}: ${item.percentage}%`)
              .join(", ")}
            style={{ background: `conic-gradient(${segments})` }}
          >
            <div>
              <small>TOP VẬT LIỆU</small>
              <strong>Travertine</strong>
              <b>{data.materials[0].percentage}% GMV</b>
            </div>
          </div>
          <ul className="la-materials">
            {data.materials.map((item) => (
              <li key={item.name}>
                <div>
                  <i style={{ background: item.color }} />
                  <span>{item.name}</span>
                  <b>{item.percentage}%</b>
                </div>
                <div className="la-progress">
                  <span
                    style={{
                      width: `${item.percentage}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="la-growth">
            <TrendingUp size={19} />
            <div>
              <small>CHỈ SỐ TĂNG TRƯỞNG</small>
              <p>
                Tác phẩm chế tác thủ công tăng trưởng mạnh nhất (+{s.growth}%
                YoY)
              </p>
            </div>
          </div>
        </section>
      </div>
      <section className="la-stories" aria-label="Vật liệu, chế tác và lưu trữ">
        {data.stories.map((story) => (
          <article key={story.id}>
            <div
              className="la-story-image"
              role="img"
              aria-label={`Vùng chờ ảnh gốc: ${story.title}`}
            />
            <div className="la-story-caption">
              <p>{story.eyebrow}</p>
              <h2>{story.title}</h2>
            </div>
          </article>
        ))}
      </section>
      <section className="la-hubs">
        <div className="la-section-header">
          <div>
            <p className="la-eyebrow">GLOBAL LOGISTICS ARCHITECTURE</p>
            <h2>Hiệu Suất Vận Hành 4 Trung Tâm Depository</h2>
            <p>
              Giám sát tải trọng lưu trữ, năng lực xuất xưởng và điều phối bàn
              giao White-Glove lục địa
            </p>
          </div>
          <small>Cảm biến môi trường: Chưa tích hợp</small>
        </div>
        <div className="la-hub-grid">
          {data.hubs.map((hub) => {
            const Icon = icons[hub.icon];
            return (
              <article className="la-panel" key={hub.id}>
                <div className="la-hub-label">
                  <span>{hub.label}</span>
                  <Icon size={18} />
                </div>
                <h3>{hub.title}</h3>
                <p>{hub.description}</p>
                <div className="la-utilization">
                  <span>DUNG LƯỢNG SỬ DỤNG</span>
                  <b>{hub.utilization.toFixed(1)}%</b>
                </div>
                <div
                  className="la-progress"
                  role="meter"
                  aria-label={`Dung lượng ${hub.title}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={hub.utilization}
                >
                  <span style={{ width: `${hub.utilization}%` }} />
                </div>
                <small className="la-hub-note">{hub.note}</small>
                <div className="la-hub-activity">
                  <span>{hub.activity}</span>
                  <b>{hub.amount}</b>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section className="la-panel la-alerts">
        <div className="la-section-header">
          <div>
            <p className="la-eyebrow">PRIORITY AUDIT & ACTIONS</p>
            <h2>Cảnh Báo Điều Hành & Luồng Giám Sát Hệ Thống</h2>
          </div>
          <span className="la-demo-pill">
            {data.alerts.length} tình huống demo
          </span>
        </div>
        <div>
          {data.alerts.map((alert) => {
            const Icon =
              alert.type === "danger"
                ? TriangleAlert
                : alert.type === "access"
                  ? ShieldCheck
                  : Package;
            return (
              <article
                className={`la-alert la-alert-${alert.type}`}
                key={alert.id}
              >
                <div className="la-alert-icon">
                  <Icon size={20} />
                </div>
                <div className="la-alert-copy">
                  <div className="la-alert-meta">
                    <b>{alert.label}</b>
                    <span>{alert.time}</span>
                  </div>
                  <h3>{alert.title}</h3>
                  <p>{alert.description}</p>
                </div>
                <div className="la-alert-actions">
                  {alert.actions.map((action, i) => (
                    <Unavailable key={action} dark={i === 1}>
                      {action}
                    </Unavailable>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
