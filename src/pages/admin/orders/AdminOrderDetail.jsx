import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Printer, Clock, Package, Truck, ShieldCheck, User, MapPin, Building, Banknote, LockKeyhole } from 'lucide-react';
import { getOrderDetail } from '../../../services/admin/orderDetail.service.js';
import './AdminOrderDetail.css';

const money = value => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
const dateTime = value => new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'medium' }).format(new Date(value));

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const [state, setState] = useState({ loading: true, order: null, error: '', id: null });
  const [revision, setRevision] = useState(0);
  const [clipboard, setClipboard] = useState({ busy: false, message: '' });
  const copyRequest = useRef(0);
  useEffect(() => {
    let cancelled = false;
    getOrderDetail(orderId).then(order => {
      if (!cancelled) setState({ loading: false, order, error: '', id: orderId });
    }).catch(() => {
      if (!cancelled) setState({ loading: false, order: null, error: 'Không thể tải chi tiết đơn hàng. Vui lòng thử lại.', id: orderId });
    });
    return () => { cancelled = true; copyRequest.current += 1; };
  }, [orderId, revision]);
  async function copyCode() {
    const request = ++copyRequest.current;
    setClipboard({ busy: true, message: '', id: orderId });
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      // Chỉ xác nhận sau khi trình duyệt thực sự hoàn tất thao tác ghi Clipboard.
      await navigator.clipboard.writeText(orderId);
      if (request === copyRequest.current) setClipboard({ busy: false, message: `Đã sao chép mã ${orderId}.`, id: orderId });
    } catch {
      if (request === copyRequest.current) setClipboard({ busy: false, message: `Không thể sao chép. Bạn có thể chọn và sao chép mã ${orderId} thủ công.`, id: orderId });
    }
  }
  function retry() { setState(current => ({ ...current, loading: true })); setRevision(value => value + 1); }
  const loading = state.loading || state.id !== orderId;
  const order = state.order;
  return <div className="lod-page">
    <p className="lod-eyebrow">GIÁM SÁT HỆ THỐNG / ĐƠN HÀNG / CHI TIẾT ĐƠN</p>
    <span className="lod-readonly"><ShieldCheck size={13} />CHẾ ĐỘ GIÁM SÁT (READ-ONLY)</span>
    <Link className="lod-back" to="/admin/monitoring"><ArrowLeft size={15} />Quay lại danh sách đơn hàng</Link>
    {loading ? <div className="lod-state" role="status">Đang tải chi tiết đơn hàng…</div> : state.error ? <div className="lod-state" role="alert"><p>{state.error}</p><button onClick={retry}>Thử lại</button></div> : !order ? <div className="lod-state" role="status"><Package size={30} /><h1>Không tìm thấy đơn hàng</h1><p>Không có mã “{orderId}” trong dữ liệu Monitoring.</p><Link to="/admin/monitoring">Về Monitoring</Link></div> : <>
      <div className="lod-intro"><div><h1>Đơn Hàng #{order.id}</h1><span className="lod-status">{order.statusLabel}</span><p><Clock size={14} />Khởi tạo: {dateTime(order.createdAt)} (GMT+7)</p><p><Building size={14} />Kho điều phối: {order.warehouse?.name ?? 'Chưa tích hợp'}</p><p>Nhân viên phụ trách / Vault Hash: Chưa tích hợp</p></div><div className="lod-actions"><button disabled={clipboard.busy && clipboard.id === orderId} onClick={copyCode}><Copy size={15} />Sao chép mã đơn</button><span className="lod-disabled"><button disabled aria-describedby="lod-print-help"><Printer size={15} />In bản ghi đơn hàng (PDF)</button><small id="lod-print-help">Chưa tích hợp chức năng in PDF.</small></span></div></div>
      {clipboard.id === orderId && clipboard.message && <p role="status" className="lod-copy-status">{clipboard.message}</p>}
      <p className="lod-demo"><strong>Dữ liệu demo từ Monitoring</strong> · Thông tin tổng hợp, chưa có dòng hàng hoặc lịch sử thanh toán. Trang này không ghi dữ liệu.</p>
      <div className="lod-kpis"><article><span>TỔNG GIÁ TRỊ ĐƠN<Banknote size={18} /></span><strong>{money(order.total)}</strong><p>Thanh toán: Chưa tích hợp</p></article><article><span>QUY CÁCH KIỆN HÀNG<Package size={18} /></span><strong className="lod-unknown">Chưa tích hợp</strong><p>Số kiện và số sản phẩm chưa có nguồn</p></article><article><span>HẠN GIAO WHITE-GLOVE<Truck size={18} /></span><strong className="lod-unknown">Chưa tích hợp</strong><p>Chưa có lịch giao dự kiến</p></article><article><span>TÌNH TRẠNG NIÊM PHONG<ShieldCheck size={18} /></span><strong className="lod-unknown">Chưa tích hợp</strong><p>Mã niêm phong: Chưa tích hợp</p></article></div>
      <div className="lod-content-grid"><div className="lod-main-column"><section className="lod-card"><h2>Danh Mục Vật Phẩm Hợp Đồng</h2><p className="lod-muted">Mô tả tổng hợp từ Monitoring; không phải dòng hàng hoặc snapshot giá giao dịch.</p><div className="lod-table-scroll" tabIndex={0} aria-label="Thông tin vật phẩm tổng hợp, cuộn ngang khi cần"><table><thead><tr><th scope="col">VẬT PHẨM & THÔNG SỐ</th><th scope="col">SỐ LƯỢNG</th><th scope="col">ĐƠN GIÁ LỊCH SỬ</th><th scope="col">THÀNH TIỀN DÒNG HÀNG</th></tr></thead><tbody><tr><td><div className="lod-item"><span className="lod-placeholder" role="img" aria-label="Chưa có ảnh sản phẩm gốc"><Package size={26} /></span><div><h3>{order.itemName}</h3><p>{order.materials}</p><div className="lod-specs">SKU: Chưa tích hợp<br />Kích thước: Chưa tích hợp<br />Thông số tùy chỉnh: Chưa tích hợp</div><small>Không tự tách mô tả thành các sản phẩm riêng.</small></div></div></td><td>Chưa tích hợp</td><td>Chưa tích hợp</td><td>Chưa tích hợp</td></tr></tbody></table></div>
      <div className="lod-payment"><div><h3><Banknote size={19} />Phương Thức Tất Toán Hợp Đồng</h3><p>Chưa tích hợp</p><p>Ngân hàng, mã tham chiếu và thời điểm xác nhận: Chưa tích hợp.</p></div><dl>{['Tạm tính hàng hóa', 'Chiết khấu', 'Phí vận chuyển & lắp đặt', 'Thuế GTGT'].map(label => <div key={label}><dt>{label}</dt><dd>Chưa tích hợp</dd></div>)}<div className="lod-total"><dt>GIÁ TRỊ ĐƠN</dt><dd>{money(order.total)}</dd></div><div><dt>Đã thanh toán</dt><dd>Chưa tích hợp</dd></div><div><dt>Số tiền còn lại</dt><dd>Chưa tích hợp</dd></div></dl></div></section>
      <section className="lod-card lod-timeline"><h2>Nhật Ký Biến Động & Tiến Độ</h2><p className="lod-muted">Dữ liệu demo · Chỉ có mốc tạo đơn; chưa tích hợp Audit Log.</p><ol><li><strong>Ngày tạo đơn trong Monitoring</strong><time dateTime={order.createdAt}>{dateTime(order.createdAt)} (GMT+7)</time><p>Đơn #{order.id} · Khách hàng {order.customer}.</p></li></ol><p className="lod-note">Lịch sử chuyển trạng thái, xác nhận thanh toán và giao hàng: Chưa tích hợp. Không có xác nhận lưu trữ bất biến.</p></section></div>
      <aside className="lod-side-column" aria-label="Khách hàng và thông tin giám sát"><section className="lod-card"><h2>Chủ Thể Đơn Hàng</h2><div className="lod-customer"><span className="lod-avatar" role="img" aria-label="Chưa có avatar gốc"><User size={23} /></span><div><strong>{order.customer}</strong><small>Mã khách hàng: Chưa tích hợp</small></div></div><p className="lod-muted">Phân hạng VIP: Chưa tích hợp<br />Điện thoại / Email: Chưa tích hợp</p><h3><MapPin size={16} />Địa Chỉ Nhận Hàng</h3><div className="lod-note">Chưa tích hợp</div><h3>Ghi Chú Kỹ Thuật</h3><div className="lod-note">{order.note}</div><h3>Nhân Viên Phụ Trách</h3><div className="lod-note">Chưa tích hợp</div></section>
      <section className="lod-card lod-policy"><h3><ShieldCheck size={20} />Chính Sách Phân Quyền (PoLP)</h3><p>Trang Admin chỉ giám sát. Không cung cấp thao tác xác nhận/hủy đơn, hoàn tiền hoặc thay đổi trạng thái.</p><p>Chính sách thực thi Backend và Security Token: Chưa tích hợp.</p></section><section className="lod-card"><h3><LockKeyhole size={17} />Siêu Dữ Liệu Lưu Trữ</h3><dl className="lod-logs">{['Database Node', 'Snapshot Revision', 'Sync Latency', 'Audit Log bất biến'].map(label => <div key={label}><dt>{label}</dt><dd>Chưa tích hợp</dd></div>)}</dl></section></aside></div>
    </>}
  </div>;
}
