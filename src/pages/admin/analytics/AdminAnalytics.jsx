import {
  Banknote,
  ClipboardList,
  Download,
  RefreshCw,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getAnalyticsAvailability } from "../../../services/admin/analytics.service.js";
import "./AdminAnalytics.css";

function Heading({ eyebrow, title, children }) {
  return (
    <header className="lan-section-heading">
      <span className="lan-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </header>
  );
}

function UnavailableMetric({ label, icon }) {
  return (
    <article>
      <span>
        {label}
        {icon}
      </span>
      <strong>Chưa tích hợp</strong>
      <p>Chưa có nguồn dữ liệu Analytics từ Backend.</p>
    </article>
  );
}

function UnavailablePanel() {
  return (
    <div className="lan-state" role="status">
      Chưa có nguồn dữ liệu Analytics từ Backend
    </div>
  );
}

export default function AdminAnalytics() {
  const availability = getAnalyticsAvailability();

  return (
    <div className="lan-page">
      <p className="lan-eyebrow">
        DASHBOARD & GOVERNANCE / THỐNG KÊ & PHÂN TÍCH
      </p>
      <div className="lan-intro">
        <div>
          <h1>
            Thống Kê & Phân Tích
            <br />
            Doanh Nghiệp
          </h1>
          <p>
            Không gian báo cáo hoạt động kinh doanh của LUMORA.
            <br />
            Dữ liệu sẽ hiển thị khi Backend cung cấp Analytics API được xác minh.
          </p>
        </div>
        <div className="lan-controls">
          <div className="lan-control-row">
            <div className="lan-range" aria-label="Khoảng báo cáo chưa hỗ trợ">
              {["Hôm nay", "7 ngày", "30 ngày", "Tùy chỉnh…"].map((label) => (
                <button key={label} type="button" disabled title="Chưa hỗ trợ">
                  {label}
                </button>
              ))}
            </div>
            <label title="Chưa hỗ trợ">
              Kỳ:
              <select disabled aria-label="Kỳ báo cáo chưa hỗ trợ">
                <option>Chưa hỗ trợ</option>
              </select>
            </label>
          </div>
          <div className="lan-control-row">
            <span className="lan-unavailable" tabIndex={0}>
              <button type="button" disabled>
                <Download size={14} />
                Xuất Báo Cáo (Excel/PDF)
              </button>
              <small>Chưa hỗ trợ</small>
            </span>
            <button className="lan-primary" type="button" disabled title="Chưa hỗ trợ">
              <RefreshCw size={14} />
              Làm Mới Dữ Liệu
            </button>
          </div>
        </div>
      </div>
      <div className="lan-demo" role="status">
        <strong>{availability.title}</strong>
        <span>{availability.message}</span>
      </div>
      <div className="lan-kpis">
        <UnavailableMetric label="TỔNG DOANH THU (GMV)" icon={<Banknote size={19} />} />
        <UnavailableMetric label="TỔNG ĐƠN HÀNG" icon={<ClipboardList size={19} />} />
        <UnavailableMetric label="TỔNG KHÁCH HÀNG" icon={<Users size={19} />} />
        <UnavailableMetric label="SẢN PHẨM ĐANG CHẾ TÁC" icon={<Sparkles size={19} />} />
      </div>
      <div className="lan-chart-grid">
        <section className="lan-card">
          <Heading eyebrow="TRAJECTORY & CASH FLOW" title="Dòng Chảy Doanh Thu & Điểm Rơi Bán Hàng">
            Biểu đồ sẽ được kết nối sau khi có contract Analytics.
          </Heading>
          <UnavailablePanel />
          <div className="lan-channel-summary">
            {["Bán lẻ Living", "Penthouse & Villa", "Dịch vụ White-Glove"].map((label) => (
              <div key={label}>
                <span>{label}</span>
                <strong>Chưa tích hợp</strong>
              </div>
            ))}
          </div>
        </section>
        <section className="lan-card">
          <Heading eyebrow="PORTFOLIO INTELLIGENCE" title="Cơ Cấu Doanh Thu Theo Danh Mục">
            Chưa có dữ liệu phân bổ danh mục từ Backend.
          </Heading>
          <UnavailablePanel />
        </section>
      </div>
      <div className="lan-detail-grid">
        <section className="lan-card">
          <div className="lan-heading-link">
            <Heading eyebrow="CURATED RANKING" title="Top Sản Phẩm Bán Chạy Nhất">
              Chưa có dữ liệu xếp hạng sản phẩm từ Backend.
            </Heading>
            <Link to="/admin/catalog">TOÀN BỘ CATALOG →</Link>
          </div>
          <UnavailablePanel />
        </section>
        <section className="lan-card">
          <Heading eyebrow="LIFECYCLE INTELLIGENCE" title="Đơn Hàng Theo Trạng Thái & Tiến Độ">
            Không suy diễn thống kê toàn hệ thống từ một trang Order.
          </Heading>
          <UnavailablePanel />
          <p className="lan-note">
            <Truck size={18} />
            SLA và tiến độ: Chưa tích hợp
          </p>
        </section>
      </div>
      <section className="lan-card lan-customers">
        <div className="lan-heading-link">
          <Heading eyebrow="SOVEREIGN PATRONAGE" title="Khách Hàng & Hành Vi Mua Sắm Bespoke">
            Chưa có contract thống kê khách hàng và hành vi mua sắm.
          </Heading>
          <span className="lan-note">Đồng bộ CRM: Chưa tích hợp</span>
        </div>
        <UnavailablePanel />
      </section>
    </div>
  );
}
