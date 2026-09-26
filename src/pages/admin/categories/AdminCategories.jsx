import { useEffect, useRef, useState } from 'react';
import { Folder, Package, Eye, Pencil, Plus, X, Save, Image, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCategories, saveCategory } from '../../../services/admin/categories.service.js';
import './AdminCategories.css';

const defaults = { search: '', status: '', page: 1, pageSize: 5 };

function CategoryDialog({ category, readOnly, onClose, onSaved }) {
  const dialog = useRef(null);
  const [form, setForm] = useState({ name: category?.name ?? '', description: category?.description ?? '', isActive: category?.isActive ?? true });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    element.showModal();
    return () => { element.close(); previous?.focus(); };
  }, []);
  async function submit(event) {
    event.preventDefault();
    if (saving || readOnly) return;
    if (!form.name.trim()) { setError('Tên danh mục không được để trống.'); return; }
    setError(''); setSaving(true);
    try { const saved = await saveCategory({ id: category?._id, ...form }); onSaved(saved); }
    catch (failure) { setError(failure.message); setSaving(false); }
  }
  return <dialog ref={dialog} className="lcat-dialog" aria-labelledby="lcat-dialog-title" onCancel={event => { event.preventDefault(); if (!saving) onClose(); }}>
    <header><div><span className="lcat-eyebrow">ATELIER STRUCTURE ENGINE</span><h2 id="lcat-dialog-title">{readOnly ? 'Xem Danh Mục Nội Thất' : category ? 'Chỉnh Sửa Danh Mục Nội Thất' : 'Thêm Mới Danh Mục Nội Thất'}</h2></div><button type="button" aria-label="Đóng modal" disabled={saving} onClick={onClose}><X size={19} /></button></header>
    <form onSubmit={submit}><div className="lcat-dialog-body"><p className="lcat-demo">Demo trong bộ nhớ, dùng chung với Catalog. Tải lại trình duyệt sẽ khôi phục dữ liệu ban đầu.</p>
      <div className="lcat-form-grid"><label>Tên Danh Mục *<input autoFocus required readOnly={readOnly} value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} aria-describedby="lcat-name-help" /><small id="lcat-name-help">Bắt buộc nhập tên; chưa kiểm tra trùng tên trên server.</small></label><label>Mã Slug Hiển Thị URL<input disabled placeholder="Chưa hỗ trợ slug" /><small>Schema chưa có slug; không tạo URL danh mục.</small></label><label>Danh Mục Cha<select disabled><option>Không có (danh mục phẳng)</option></select><small>Schema chưa hỗ trợ danh mục cha/con.</small></label><label>Thứ Tự Hiển Thị Menu<input disabled placeholder="Chưa hỗ trợ" /><small>Schema chưa có thứ tự menu.</small></label></div>
      <label>Mô Tả Định Hướng Thẩm Mỹ<textarea rows={4} readOnly={readOnly} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} /></label>
      <label>Ảnh Banner Nghệ Thuật Đại Diện (1200×400px)<div className="lcat-banner" role="img" aria-label="Placeholder banner, chưa có asset gốc"><Image size={30} /><span>Chờ asset gốc</span></div><button type="button" disabled>Upload chưa tích hợp</button><small>Schema chưa có banner; không tải lên hoặc lưu ảnh.</small></label>
      <label className="lcat-toggle"><span><strong>Trạng Thái Kích Hoạt Trưng Bày</strong><small>Chỉ cập nhật isActive trong mock; chưa xác nhận hành vi trên Storefront.</small></span><input type="checkbox" role="switch" disabled={readOnly || saving} checked={form.isActive} onChange={event => setForm({ ...form, isActive: event.target.checked })} /></label>
      <div className="lcat-policy-row"><ShieldCheck size={18} /><div><strong>Hành Động Trạng Thái & Xác Nhận Ngừng Sử Dụng</strong><p>Đổi trạng thái bằng công tắc phía trên. Không xóa danh mục, không thay đổi sản phẩm liên quan.</p></div></div>
      {error && <p className="lcat-error" role="alert">{error}</p>}
    </div><footer><button type="button" disabled={saving} onClick={onClose}>{readOnly ? 'Đóng' : 'Hủy bỏ'}</button>{!readOnly && <button className="lcat-primary" disabled={saving}><Save size={15} />{saving ? 'Đang lưu…' : 'Lưu Danh Mục'}</button>}</footer></form>
  </dialog>;
}

export default function AdminCategories() {
  const [query, setQuery] = useState(defaults);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    let cancelled = false;
    getCategories(query).then(data => { if (!cancelled) setState({ data, loading: false, error: '' }); }).catch(error => { if (!cancelled) setState({ data: null, loading: false, error: error.message }); });
    return () => { cancelled = true; };
  }, [query, revision]);
  function update(changes) { setState(current => ({ ...current, loading: true, error: '' })); setQuery(current => ({ ...current, page: 1, ...changes })); }
  function reload() { setState(current => ({ ...current, loading: true, error: '' })); setRevision(value => value + 1); }
  function saved(category) { setModal(null); setNotice(`Đã lưu “${category.name}” trong mock dùng chung với Catalog. Thay đổi mất khi tải lại trình duyệt.`); update({ page: 1 }); }
  const data = state.data;
  return <div className="lcat-page"><p className="lcat-eyebrow">QUẢN TRỊ DANH MỤC / DANH MỤC NỘI THẤT</p><div className="lcat-intro"><div><h1>Quản Lý Danh Mục & Không Gian Nội Thất</h1><p>Tổ chức danh mục sản phẩm trong hệ sinh thái nội thất LUMORA.</p></div><button className="lcat-primary" onClick={() => setModal({ category: null, readOnly: false })}><Plus size={18} />Thêm Danh Mục Mới</button></div>
    <p className="lcat-demo"><strong>Dữ liệu demo dùng chung với Catalog</strong> · Lưu tạm trong bộ nhớ, không gọi Backend. Tải lại trình duyệt sẽ khôi phục dữ liệu ban đầu.</p>{notice && <p className="lcat-notice" role="status">{notice}</p>}
    <div className="lcat-kpis"><article><span>TỔNG DANH MỤC<Folder size={20} /></span><strong>{data?.totals.categories ?? '…'}</strong><p>Danh mục phẳng trong mock</p></article><article><span>SẢN PHẨM THUỘC DANH MỤC<Package size={20} /></span><strong>{data?.totals.products ?? '…'}</strong><p>Tính từ Product mock thực tế</p></article><article><span>DANH MỤC ĐANG HOẠT ĐỘNG<Eye size={20} /></span><strong>{data?.totals.active ?? '…'}</strong><p>{data ? `${data.totals.categories ? (data.totals.active / data.totals.categories * 100).toFixed(1) : 0}% trong mock` : 'Đang tải…'}</p></article><article><span>GIÁ TRỊ DANH MỤC</span><strong className="lcat-unknown">Chưa tích hợp</strong><p>Chưa có định nghĩa và nguồn dữ liệu</p></article></div>
    <section className="lcat-filters" aria-label="Bộ lọc danh mục"><label>Tìm danh mục<input type="search" placeholder="Tên hoặc mô tả…" value={query.search} onChange={event => update({ search: event.target.value })} /></label><label>Trạng thái<select value={query.status} onChange={event => update({ status: event.target.value })}><option value="">Tất cả trạng thái</option><option value="active">Đang hoạt động</option><option value="inactive">Ngừng hoạt động</option></select></label><button onClick={reload} disabled={state.loading}>Tải lại mock</button></section>
    <section className="lcat-table-box">{state.loading ? <div className="lcat-state" role="status">Đang tải danh mục…</div> : state.error ? <div className="lcat-state" role="alert"><p>{state.error}</p><button onClick={reload}>Thử lại</button></div> : !data?.rows.length ? <div className="lcat-state" role="status"><h2>Không có danh mục phù hợp</h2><button onClick={() => update(defaults)}>Xóa bộ lọc</button></div> : <div className="lcat-table-scroll" tabIndex={0} aria-label="Bảng danh mục, cuộn ngang khi cần"><table><thead><tr>{['DANH MỤC', 'URL / SLUG', 'MÔ TẢ', 'SẢN PHẨM', 'GIÁ TRỊ DANH MỤC', 'TRẠNG THÁI', 'THAO TÁC'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{data.rows.map(category => <tr key={category._id}><th scope="row"><div className="lcat-category-name"><Folder size={22} /><div>{category.name}<small>ID: {category._id}</small></div></div></th><td><span className="lcat-badge">Chưa hỗ trợ</span></td><td className="lcat-description">{category.description || 'Chưa có mô tả'}</td><td><strong>{category.productCount}</strong><small>sản phẩm</small></td><td>Chưa tích hợp</td><td><span className="lcat-badge">{category.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}</span></td><td><div className="lcat-row-actions"><button aria-label={`Xem ${category.name}`} onClick={() => setModal({ category, readOnly: true })}><Eye size={16} /></button><button aria-label={`Sửa ${category.name}`} onClick={() => setModal({ category, readOnly: false })}><Pencil size={16} /></button></div></td></tr>)}</tbody></table></div>}
    <footer className="lcat-pagination"><label>Dòng mỗi trang <select value={query.pageSize} onChange={event => update({ pageSize: Number(event.target.value) })}>{[5, 10, 20].map(size => <option key={size}>{size}</option>)}</select></label>{data && !state.loading && !state.error && <><span>{data.total} kết quả · Trang {data.page}/{data.totalPages}</span><nav aria-label="Phân trang danh mục"><button aria-label="Trang trước" disabled={data.page === 1} onClick={() => update({ page: data.page - 1 })}><ChevronLeft size={16} /></button><span>{data.page}</span><button aria-label="Trang sau" disabled={data.page === data.totalPages} onClick={() => update({ page: data.page + 1 })}><ChevronRight size={16} /></button></nav></>}</footer></section>
    <div className="lcat-principles"><article><span className="lcat-eyebrow">NGUYÊN TẮC TRƯNG BÀY 01</span><h2>Đồng Bản Sắc Vật Liệu</h2><p>Hình ảnh định hướng danh mục đang chờ asset gốc. Chưa tích hợp quy trình giám tuyển.</p><div className="lcat-banner" role="img" aria-label="Chờ ảnh không gian nội thất"><Image size={28} />Chờ asset gốc</div></article><article><span className="lcat-eyebrow">NGUYÊN TẮC TRƯNG BÀY 02</span><h2>Tối Ưu SEO & Cấu Trúc URL</h2><p>Schema hiện chưa hỗ trợ slug hoặc URL danh mục. Không tự tạo đường dẫn Storefront.</p><div className="lcat-banner" role="img" aria-label="Chờ ảnh vật liệu nội thất"><Image size={28} />Chờ asset gốc</div></article><article><span className="lcat-eyebrow">NGUYÊN TẮC TRƯNG BÀY 03</span><h2>Cân Bằng Tải Không Gian</h2><p>Chưa có quy định giới hạn sản phẩm mỗi danh mục. Số đếm lấy từ Product mock hiện có.</p><div className="lcat-banner" role="img" aria-label="Chờ ảnh chiếu sáng nội thất"><Image size={28} />Chờ asset gốc</div></article></div>
    {modal && <CategoryDialog category={modal.category} readOnly={modal.readOnly} onClose={() => setModal(null)} onSaved={saved} />}
  </div>;
}
