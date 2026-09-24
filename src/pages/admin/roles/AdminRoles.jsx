import { useEffect, useState } from 'react';
import { Users, ShieldCheck, Sofa, SlidersHorizontal, Folder, DraftingCompass, ClipboardList, Warehouse, ChartNoAxesCombined, RotateCcw, Save, KeyRound, Network, History, CircleHelp } from 'lucide-react';
import { getRoles } from '../../../services/admin/roles.service.js';
import './AdminRoles.css';

const icons = { users: Users, shield: ShieldCheck, sofa: Sofa, sliders: SlidersHorizontal, folder: Folder, atelier: DraftingCompass, orders: ClipboardList, warehouse: Warehouse, chart: ChartNoAxesCombined };
const percent = value => `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(value)}%`;

function Unavailable({ children, reason, primary = false }) {
  return <span className="lr-unavailable" tabIndex={0} aria-label={reason}>
    <button type="button" disabled className={primary ? 'lr-primary' : ''}>{children}</button>
    <span className="lr-reason" role="tooltip">{reason}</span>
  </span>;
}

export default function AdminRoles() {
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  const [selected, setSelected] = useState('Admin');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let cancelled = false;
    getRoles().then(data => {
      if (!cancelled) setState({ loading: false, data, error: '' });
    }).catch(() => {
      if (!cancelled) setState({ loading: false, data: null, error: 'Không thể tải dữ liệu vai trò. Vui lòng thử lại.' });
    });
    return () => { cancelled = true; };
  }, [revision]);
  const data = state.data;
  const role = data?.roles.find(item => item.id === selected) ?? data?.roles[0];
  const modules = role ? data.matrices[role.id] : [];
  return <div className="lr-page">
    <p className="lr-eyebrow"><ShieldCheck size={14} />BẢO MẬT & QUẢN TRỊ TRUY CẬP / MA TRẬN PHÂN QUYỀN & VAI TRÒ</p>
    <div className="lr-intro"><div><h1>Ma Trận Phân Quyền & Quản Lý Vai Trò</h1><p>Cấu trúc ma trận RBAC cho bốn vai trò nghiệp vụ LUMORA.<br />Chỉ xem thông tin; chưa tích hợp cơ chế thực thi phân quyền.</p></div><div className="lr-actions"><Unavailable reason="Chưa có chính sách quyền mặc định; màn hình chỉ đọc."><RotateCcw size={15} />Đặt Lại Mặc Định</Unavailable><Unavailable primary reason="Chưa tích hợp lưu cấu hình phân quyền; màn hình chỉ đọc."><Save size={15} />Lưu Cấu Hình Phân Quyền</Unavailable></div></div>
    <p className="lr-demo"><strong>Dữ liệu User mock</strong> · Các ô quyền chưa xác định không biểu thị cho phép hoặc từ chối. Không đồng bộ sang ma trận trong Users.</p>
    {state.loading ? <div className="lr-state" role="status">Đang tải vai trò và số tài khoản…</div> : state.error ? <div className="lr-state" role="alert"><p>{state.error}</p><button onClick={() => { setState({ loading: true, data: null, error: '' }); setRevision(value => value + 1); }}>Thử lại</button></div> : !role ? <div className="lr-state" role="status">Chưa có dữ liệu vai trò để hiển thị.</div> : <>
      <div className="lr-kpis">
        <article><span>VAI TRÒ HỆ THỐNG <small>CORE</small></span><strong>{data.roles.length}<em> vai trò nghiệp vụ</em></strong><p>Admin, Staff, Storage Manager, Customer</p></article>
        <article><span>THỰC THỂ MODULE <small>CHỈ XEM</small></span><strong>{data.moduleCount}<em> module hiển thị</em></strong><p>{data.cellCount} ô mỗi role, chưa xác định quyền</p></article>
        <article><span>CHÍNH SÁCH KIỂM SOÁT</span><strong>SoD</strong><p>Chưa xác nhận chính sách</p><small>Thực thi: Chưa tích hợp</small></article>
        <article><span>PHIÊN LÀM VIỆC</span><strong className="lr-pending-value">Chưa tích hợp</strong><p>{data.totalUsers} tài khoản trong User mock</p><small>Không có dữ liệu phiên online</small></article>
      </div>
      <div className="lr-content-grid">
        <aside className="lr-role-column" aria-label="Vai trò và phân bố tài khoản">
          <section className="lr-card"><h2 className="lr-small-heading"><Users size={19} />Danh Sách Vai Trò <span>{data.roles.length}</span></h2><div className="lr-role-list">{data.roles.map(item => <button key={item.id} className={`lr-role ${role.id === item.id ? 'lr-role-selected' : ''}`} aria-pressed={role.id === item.id} onClick={() => setSelected(item.id)}><span className="lr-role-title"><strong>{item.name}<br />({item.id})</strong><b>{item.count}<small> tài khoản</small></b></span><span className="lr-role-description">{item.description}</span><small className="lr-role-caption">{item.caption}</small></button>)}</div></section>
          <section className="lr-policy"><h3><ShieldCheck size={18} />NGUYÊN TẮC ĐẶC QUYỀN TỐI THIỂU (PoLP)</h3><p>Chưa xác nhận chính sách. Nội dung mô tả vai trò không thay thế quyết định cấp quyền.</p><p>Chứng nhận ISO/NIST và Audit Log bất biến: <strong>Chưa tích hợp</strong>.</p><p>Chu kỳ tái chứng nhận: <strong>Chưa xác nhận chính sách</strong>.</p></section>
          <section className="lr-card"><h3>TỔNG HỢP PHÂN CẤP TÀI KHOẢN</h3><p className="lr-muted">Tính trên toàn bộ {data.totalUsers} tài khoản mock, gồm đang hoạt động và ngừng hoạt động.</p>{!data.totalUsers && <p role="status">Chưa có tài khoản mock.</p>}{data.roles.map(item => <div className="lr-distribution" key={item.id}><div><span>{item.id}</span><strong>{percent(item.percentage)}</strong></div><div className="lr-track" aria-hidden="true"><span style={{ width: `${item.percentage}%` }} /></div></div>)}</section>
        </aside>
        <div className="lr-matrix-column">
          <section className="lr-selection lr-card" aria-live="polite"><div className="lr-role-icon"><ShieldCheck size={25} /></div><div><h2>{role.name} ({role.id})</h2><p>{data.moduleCount} module · {data.cellCount} ô chưa xác định · Chỉ đọc</p></div><div className="lr-actions"><Unavailable reason="Chưa có quy tắc xác định quyền hợp lệ; không thể chọn quyền.">Chọn Hợp Lệ</Unavailable><Unavailable reason="Màn hình chỉ đọc; không thực hiện thu hồi quyền.">Hủy Tất Cả</Unavailable></div></section>
          <section className="lr-matrix-box" aria-label={`Ma trận quyền của ${role.id}`}>
            <div className="lr-table-scroll" tabIndex={0} aria-label="Bảng quyền chỉ đọc, cuộn ngang để xem đủ cột"><table><caption>Ma trận {role.id}: tất cả quyền đang chờ xác nhận chính sách.</caption><thead><tr><th scope="col">PHÂN HỆ NGHIỆP VỤ<br />(MODULE)</th>{data.actions.map(action => <th scope="col" key={action.id}>{action.name}<br />({action.code})</th>)}<th scope="col">GHI CHÚ GIỚI HẠN THẨM QUYỀN</th></tr></thead><tbody>{modules.map(module => { const Icon = icons[module.icon]; return <tr key={module.id}><th scope="row"><div className="lr-module"><Icon size={20} /><div>{module.name}<small>{module.id}</small></div></div></th>{data.actions.map(action => <td key={action.id}><span className="lr-unknown" aria-label={`${role.id}, ${module.name}, ${action.name}: Chưa xác định`}><CircleHelp size={15} aria-hidden="true" />Chưa xác định</span></td>)}<td className="lr-module-note">{module.note}</td></tr>; })}</tbody></table></div>
            <footer className="lr-governance"><ShieldCheck size={23} /><p>Quy trình cấp và thu hồi vai trò Admin: <strong>Chưa xác nhận chính sách</strong>. Trang này không cấp quyền, không thu hồi quyền và không thay đổi tài khoản.</p><Unavailable reason="Audit Log chưa tích hợp; chưa có dữ liệu lịch sử thay đổi."><History size={15} />Xem Lịch Sử Thay Đổi</Unavailable></footer>
          </section>
          <div className="lr-security-grid"><section className="lr-card"><h2><Network size={21} />Cơ Chế Phân Tách Trách Nhiệm (SoD)</h2><p>Ranh giới nghiệp vụ kho và đơn hàng cần được thống nhất trong chính sách quyền chính thức.</p><span className="lr-status">Chưa xác nhận chính sách</span><p className="lr-muted">Chưa tích hợp cơ chế kiểm soát SoD.</p></section><section className="lr-card"><h2><KeyRound size={21} />Xác Thực Hai Yếu Tố</h2><p>Chưa có nguồn dữ liệu xác thực FIDO2/WebAuthn hoặc quy định bắt buộc 2FA cho từng vai trò.</p><span className="lr-status">Chưa tích hợp</span><p className="lr-muted">Không xác nhận tài khoản đã được bảo vệ.</p></section></div>
        </div>
      </div>
    </>}
  </div>;
}
