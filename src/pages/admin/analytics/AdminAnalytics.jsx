import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Banknote, ClipboardList, Users, Sparkles, Download, RefreshCw, Package, Truck } from 'lucide-react';
import { getAnalytics } from '../../../services/admin/analytics.service.js';
import './AdminAnalytics.css';

const money = value => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
const percent = value => `${value.toFixed(1)}%`;
const dateLabel = value => value.split('-').reverse().join('/');
const colors = ['#705333', '#94724e', '#b9a38d', '#5f5c52'];

function Heading({ eyebrow, title, children }) {
  return <header className="lan-section-heading"><span className="lan-eyebrow">{eyebrow}</span><h2>{title}</h2>{children && <p>{children}</p>}</header>;
}

function RevenueChart({ series, peak }) {
  const [active, setActive] = useState(null);
  const max = Math.max(1, peak.value);
  const points = series.map((point, index) => ({ ...point, x: series.length === 1 ? 300 : 20 + index / (series.length - 1) * 560, y: 220 - point.value / max * 190 }));
  const selected = points.find(point => point.date === active);
  const line = points.map(point => `${point.x},${point.y}`).join(' ');
  return <div className="lan-chart">
    <div className="lan-chart-summary">Cao nhất: {money(peak.value)} · {dateLabel(peak.date)}</div>
    <svg viewBox="0 0 600 260" role="group" aria-label="Biểu đồ GMV demo theo ngày. Dùng Tab để xem từng điểm.">
      {[30, 125, 220].map(y => <line key={y} x1="20" x2="580" y1={y} y2={y} stroke="#e9e3d9" strokeDasharray="3 4" />)}
      <polygon points={`20,220 ${line} 580,220`} fill="#94724e" opacity=".1" />
      <polyline points={line} fill="none" stroke="#94724e" strokeWidth="2" />
      {points.map((point, index) => <g key={point.date}>
        <circle cx={point.x} cy={point.y} r={active === point.date ? 6 : 4} fill="white" stroke="#94724e" />
        <circle cx={point.x} cy={point.y} r="9" fill="transparent" tabIndex={0} role="img" aria-label={`${dateLabel(point.date)}: ${money(point.value)}`} onFocus={() => setActive(point.date)} onBlur={() => setActive(null)} onMouseEnter={() => setActive(point.date)} onMouseLeave={() => setActive(null)} onClick={() => setActive(point.date)} onKeyDown={event => { if (event.key === 'Escape') setActive(null); }} />
        {(index === 0 || index === points.length - 1 || (points.length > 5 && index % Math.ceil(points.length / 5) === 0)) && <text x={point.x} y="250" textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}>{point.date.slice(5).split('-').reverse().join('/')}</text>}
      </g>)}
    </svg>
    <div className="lan-tooltip" role="status">{selected ? <>{dateLabel(selected.date)} <strong>{money(selected.value)}</strong></> : 'Di chuột, chạm hoặc dùng Tab trên điểm dữ liệu để xem giá trị.'}</div>
  </div>;
}

export default function AdminAnalytics() {
  const [query, setQuery] = useState({ period: '2025-Q4', range: '30d' });
  const [draft, setDraft] = useState({ start: '2025-12-02', end: '2025-12-31' });
  const [customOpen, setCustomOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  useEffect(() => {
    let cancelled = false;
    getAnalytics(query).then(data => {
      if (!cancelled) setState({ loading: false, data, error: '' });
    }).catch(error => {
      if (!cancelled) setState({ loading: false, data: null, error: error.message });
    });
    return () => { cancelled = true; };
  }, [query, revision]);
  function update(next) {
    setState(current => ({ ...current, loading: true, error: '' }));
    setQuery(next);
  }
  function reload() {
    setState(current => ({ ...current, loading: true, error: '' }));
    setRevision(value => value + 1);
  }
  const data = state.data;
  const segments = data?.categories.map((category, index) => {
    const start = data.categories.slice(0, index).reduce((sum, item) => sum + item.percent, 0);
    return `${colors[index % colors.length]} ${start}% ${start + category.percent}%`;
  }).join(', ');
  return <div className="lan-page">
    <p className="lan-eyebrow">DASHBOARD & GOVERNANCE / THỐNG KÊ & PHÂN TÍCH</p>
    <div className="lan-intro"><div><h1>Thống Kê & Phân Tích<br />Doanh Nghiệp</h1><p>Phân tích hoạt động kinh doanh, giá trị đơn hàng<br />và phân bổ danh mục nội thất LUMORA.</p></div>
      <div className="lan-controls">
        <div className="lan-control-row"><div className="lan-range" aria-label="Khoảng báo cáo">{[['today', 'Hôm nay'], ['7d', '7 ngày'], ['30d', '30 ngày']].map(([value, label]) => <button key={value} aria-pressed={!customOpen && query.range === value} onClick={() => { setCustomOpen(false); update({ period: query.period, range: value }); }}>{label}</button>)}<button aria-expanded={customOpen} aria-pressed={customOpen} onClick={() => { if (!customOpen && data) setDraft({ start: data.start, end: data.end }); setCustomOpen(value => !value); }}>Tùy chỉnh…</button></div>
          <label>Kỳ: <select aria-label="Kỳ báo cáo" value={query.period} onChange={event => { setCustomOpen(false); update({ period: event.target.value, range: '30d' }); }}><option value="2025-Q4">Quý 4/2025</option><option value="2025-Q3">Quý 3/2025</option></select></label></div>
        <div className="lan-control-row"><span className="lan-unavailable" tabIndex={0} aria-label="Xuất Excel/PDF chưa triển khai"><button disabled><Download size={14} />Xuất Báo Cáo (Excel/PDF)</button><small>Chưa khả dụng: chức năng xuất chưa triển khai.</small></span><button className="lan-primary" disabled={state.loading} onClick={reload}><RefreshCw size={14} />Làm Mới Dữ Liệu</button></div>
      </div>
    </div>
    <div className="lan-demo"><strong>Dữ liệu demo độc lập</strong><span>Mốc “Hôm nay”: {query.period === '2025-Q4' ? '31/12/2025' : '30/09/2025'}. Làm mới chỉ đọc lại fixture, không đồng bộ Backend.</span></div>
    {customOpen && <form className="lan-custom" onSubmit={event => { event.preventDefault(); update({ period: query.period, range: 'custom', ...draft }); }}><label>Từ ngày<input required type="date" min={query.period === '2025-Q4' ? '2025-10-01' : '2025-07-01'} max={query.period === '2025-Q4' ? '2025-12-31' : '2025-09-30'} value={draft.start} onChange={event => setDraft({ ...draft, start: event.target.value })} /></label><label>Đến ngày<input required type="date" min={draft.start} max={query.period === '2025-Q4' ? '2025-12-31' : '2025-09-30'} value={draft.end} onChange={event => setDraft({ ...draft, end: event.target.value })} /></label><button className="lan-primary">Áp dụng</button></form>}
    {state.loading ? <div className="lan-state" role="status">Đang tải báo cáo demo…</div> : state.error ? <div className="lan-state" role="alert"><p>{state.error}</p><button onClick={reload}>Thử lại</button></div> : data && <>
      <p className="lan-period" aria-live="polite">Khoảng báo cáo: {dateLabel(data.start)} đến {dateLabel(data.end)} · GMV = tổng giá trị đơn tạo trong khoảng chọn, chưa phải doanh thu kế toán.</p>
      {!data.orderCount && <div className="lan-state" role="status">Không có đơn hàng demo trong khoảng này. Hãy chọn khoảng ngày khác.</div>}
      <div className="lan-kpis">
        <article><span>TỔNG GIÁ TRỊ ĐƠN (GMV)<Banknote size={19} /></span><strong>{money(data.total)}</strong><p>Tăng trưởng: Chưa tích hợp</p><small>Biên lợi nhuận: Chưa tích hợp</small></article>
        <article><span>TỔNG ĐƠN HÀNG<ClipboardList size={19} /></span><strong>{data.orderCount}<em> đơn</em></strong><p>AOV: {money(data.aov)} / đơn</p><small>Hoàn tất: {percent(data.orderCount ? data.statuses.find(item => item.id === 'completed').count / data.orderCount * 100 : 0)}</small></article>
        <article><span>KHÁCH HÀNG TRONG KỲ<Users size={19} /></span><strong>{data.customers}<em> khách</em></strong><p>Khách có đơn trong khoảng chọn</p><small>VIP & tăng trưởng: Chưa tích hợp</small></article>
        <article><span>SẢN PHẨM CÓ ĐƠN<Sparkles size={19} /></span><strong>{data.productCount}<em> sản phẩm demo</em></strong><p>Đang chế tác: Chưa tích hợp</p><small>SKU hoạt động: Chưa tích hợp</small></article>
      </div>
      <div className="lan-chart-grid">
        <section className="lan-card"><Heading eyebrow="TRAJECTORY & CASH FLOW" title="Dòng Chảy Doanh Thu & Điểm Rơi Bán Hàng">Giá trị đơn demo theo ngày tạo đơn, bao gồm ngày không phát sinh.</Heading><RevenueChart key={`${data.start}-${data.end}`} series={data.series} peak={data.peak} /><div className="lan-channel-summary">{data.channels.map(channel => <div key={channel.name}><span>{channel.name}</span><strong>{money(channel.value)}</strong><small>{percent(data.total ? channel.value / data.total * 100 : 0)} tỷ trọng GMV demo</small></div>)}</div></section>
        <section className="lan-card"><Heading eyebrow="PORTFOLIO INTELLIGENCE" title="Cơ Cấu Doanh Thu Theo Danh Mục">Tỷ trọng giá trị đơn trong fixture báo cáo.</Heading><div className="lan-donut" style={{ background: data.total ? `conic-gradient(${segments})` : '#e9e3d9' }} role="img" aria-label="Cơ cấu danh mục, số liệu chi tiết bên dưới"><div><small>DANH MỤC TOP</small><strong>{data.total ? data.categories[0].name : 'Không có dữ liệu'}</strong><b>{data.total ? percent(data.categories[0].percent) : '0%'}</b></div></div><div className="lan-category-list">{data.categories.map((category, index) => <div key={category.name}><span><i style={{ background: colors[index] }} />{category.name}</span><strong>{percent(category.percent)}</strong></div>)}</div><p className="lan-note">Tăng trưởng danh mục: Chưa tích hợp</p></section>
      </div>
      <div className="lan-detail-grid">
        <section className="lan-card"><div className="lan-heading-link"><Heading eyebrow="CURATED RANKING" title="Top Sản Phẩm Bán Chạy Nhất">Xếp hạng theo giá trị đơn demo trong khoảng chọn.</Heading><Link to="/admin/catalog">TOÀN BỘ CATALOG →</Link></div><div className="lan-table-scroll" tabIndex={0} aria-label="Bảng top sản phẩm, cuộn ngang khi cần"><table><thead><tr><th>#</th><th>TÁC PHẨM & ATELIER</th><th>DANH MỤC</th><th>SỐ LƯỢNG</th><th>GIÁ TRỊ ĐƠN</th></tr></thead><tbody>{data.products.map((product, index) => <tr key={product.id}><td>{String(index + 1).padStart(2, '0')}</td><td><div className="lan-product"><span className="lan-placeholder" role="img" aria-label="Chưa có ảnh sản phẩm gốc"><Package size={23} /></span><div><strong>{product.name}</strong><small>{product.atelier} / {product.sku}</small></div></div></td><td>{product.category}</td><td>{product.quantity} chiếc</td><td>{money(product.value)}</td></tr>)}</tbody></table></div>{!data.products.length && <p>Không có sản phẩm có đơn trong khoảng chọn.</p>}<p className="lan-note">Tổng {data.products.length} sản phẩm có đơn: <strong>{money(data.total)}</strong></p></section>
        <section className="lan-card"><Heading eyebrow="LIFECYCLE INTELLIGENCE" title="Đơn Hàng Theo Trạng Thái & Tiến Độ">Phân bố {data.orderCount} đơn demo theo trạng thái snapshot, không phải lịch sử chuyển trạng thái.</Heading><div className="lan-status-list">{data.statuses.map((status, index) => { const value = data.orderCount ? status.count / data.orderCount * 100 : 0; return <div key={status.id}><div><span>{status.label}</span><strong>{status.count} đơn <small>({percent(value)})</small></strong></div><div className="lan-bar"><span style={{ width: `${value}%`, background: index === 4 ? '#14765d' : colors[index % colors.length] }} /></div></div>; })}</div><p className="lan-note"><Truck size={18} />Thời gian chế tác & bàn giao: Chưa tích hợp</p><p className="lan-note">Chuẩn SLA: Chưa tích hợp</p></section>
      </div>
      <section className="lan-card lan-customers"><div className="lan-heading-link"><Heading eyebrow="SOVEREIGN PATRONAGE" title="Khách Hàng & Hành Vi Mua Sắm Bespoke">Phân tích {data.customers} khách có đơn trong fixture được chọn.</Heading><span className="lan-note">Đồng bộ CRM: Chưa tích hợp</span></div><div className="lan-customer-grid"><article><h3>PHÂN HẠNG CHI TIÊU</h3>{['Private Collectors (VIP)', 'Đối tác kiến trúc sư & Trade', 'Hội viên mới', 'Chi tiêu trung bình VIP'].map(label => <p key={label}>{label}<strong>Chưa tích hợp</strong></p>)}</article><article><h3>TẦN SUẤT ĐẶT TRONG KỲ</h3>{data.frequencies.map(item => <p key={item.label}>{item.label}<strong>{item.count} khách ({percent(data.customers ? item.count / data.customers * 100 : 0)})</strong></p>)}<p>Chu kỳ tái đặt hàng<strong>Chưa tích hợp</strong></p></article><article><h3>KÊNH TƯƠNG TÁC DEMO</h3>{data.channels.map(channel => <p key={channel.name}>{channel.name}<strong>{percent(data.total ? channel.value / data.total * 100 : 0)} GMV</strong></p>)}<p>Tỷ lệ chốt hợp đồng<strong>Chưa tích hợp</strong></p></article></div></section>
    </>}
  </div>;
}
