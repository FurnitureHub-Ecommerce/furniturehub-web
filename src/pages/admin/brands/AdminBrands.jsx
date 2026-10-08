import { useEffect, useRef, useState } from "react";
import { Folder, Building, Image, Upload, Pencil, Eye, Plus, X, Save, RefreshCw, Download } from "lucide-react";
import { getBrands, saveBrand } from "../../../services/admin/brands.service.js";
import "./AdminBrands.css";

const isBrand = true;
const label = "Thương Hiệu";
const c = name => "lb-" + name;
const display = value => typeof value === "string" && value.trim() ? value : "Chưa có dữ liệu";
const statusText = value => value === true ? "Đang hoạt động" : value === false ? "Tạm ngừng" : "Chưa có dữ liệu";
function IdentityIcon({ src }) {
  const [failed, setFailed] = useState(false);
  return <span className={c("api-icon")}>{isBrand && typeof src === "string" && src.trim() && !failed ? <img src={src} alt="" onError={() => setFailed(true)} /> : isBrand ? <Building size={23} aria-label="Chưa có logo" /> : <Folder size={23} />}</span>;
}
function EntityDialog({ item, readOnly, onClose, onSaved }) {
  const dialog = useRef(null);
  const [form, setForm] = useState({ name: typeof item?.name === "string" ? item.name : "", description: typeof item?.description === "string" ? item.description : "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    return () => { element.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  async function submit(event) {
    event.preventDefault();
    if (saving || readOnly) return;
    if (!form.name.trim()) { setError("Tên không được để trống."); return; }
    if (item && item._id == null) { setError("Thiếu ID để cập nhật."); return; }
    setSaving(true); setError("");
    try {
      await saveBrand({ id: item?._id, ...form });
      onSaved();
    } catch (failure) { setError(failure.message || "Không thể lưu dữ liệu."); setSaving(false); }
  }
  return <dialog ref={dialog} className={c("dialog")} aria-labelledby={c("dialog-title")} onCancel={event => { event.preventDefault(); if (!saving) onClose(); }}>
    <header><div><span className={c("eyebrow")}>{isBrand ? "HỒ SƠ NHÃN HIỆU" : "ATELIER STRUCTURE ENGINE"}</span><h2 id={c("dialog-title")}>{readOnly ? "Xem " : item ? "Chỉnh Sửa " : "Thêm Mới "}{label} Nội Thất</h2></div><button type="button" disabled={saving} onClick={onClose} aria-label="Đóng modal"><X size={19} /></button></header>
    <form onSubmit={submit}><div className={c("dialog-body")}>
      <div className={c("form-grid")}><label>Tên {label} *<input autoFocus required disabled={saving} readOnly={readOnly} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label><label>{isBrand ? "Quốc gia xuất xứ" : "Mã Slug hiển thị URL"}<input disabled value="Chưa hỗ trợ qua API" /></label>{!isBrand && <><label>Danh mục cha<select disabled><option>Chưa hỗ trợ qua API</option></select></label><label>Thứ tự hiển thị menu<input disabled value="Chưa hỗ trợ qua API" /></label></>}</div>
      {isBrand && <section className="lb-logo-field"><h3>LOGO THƯƠNG HIỆU</h3><div><IdentityIcon src={item?.logo} /><div><button type="button" disabled><Upload size={14} />Tải Logo Lên</button><p>Chưa tích hợp tải logo</p></div></div></section>}
      <label>Mô Tả<textarea rows={3} disabled={saving} readOnly={readOnly} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
      {!isBrand && <section className="lcat-api-banner"><h3>ẢNH BANNER ĐẠI DIỆN</h3><div className="lcat-banner"><Image size={28} /><span>Chưa tích hợp tải banner</span><button type="button" disabled>Tải Banner Lên</button></div></section>}
      <fieldset className={c("api-status")} disabled><legend>TRẠNG THÁI HOẠT ĐỘNG</legend><label><input type="radio" name={c("status")} checked={item?.isActive === true} readOnly />Đang hoạt động</label><label><input type="radio" name={c("status")} checked={item?.isActive === false} readOnly />Tạm ngừng</label><small>{item?.isActive == null ? "Chưa có dữ liệu. " : ""}Chưa hỗ trợ cập nhật qua API</small></fieldset>
      {error && <p className={c("error")} role="alert">{error}</p>}
    </div><footer><button type="button" disabled={saving} onClick={onClose}>{readOnly ? "Đóng" : "Hủy Bỏ"}</button>{!readOnly && <button type="submit" className={c("primary")} disabled={saving}><Save size={15} />{saving ? "Đang lưu…" : "Lưu " + label}</button>}</footer></form>
  </dialog>;
}
export default function AdminBrands() {
  const [query, setQuery] = useState({ search: "", status: "" });
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let cancelled = false;
    getBrands(query).then(data => { if (!cancelled) setState({ data, loading: false, error: "" }); }).catch(error => { if (!cancelled) setState({ data: null, loading: false, error: error.message || "Không thể tải dữ liệu." }); });
    return () => { cancelled = true; };
  }, [query, revision]);
  function update(values) { setState(current => ({ ...current, loading: true, error: "" })); setQuery(current => ({ ...current, ...values })); }
  function reload() { setState(current => ({ ...current, loading: true, error: "" })); setRevision(value => value + 1); }
  function saved() { setModal(null); setNotice("Đã lưu " + label.toLowerCase() + " qua Backend."); reload(); }
  const data = state.data;
  return <div className={c("page")}>
    <p className={c("eyebrow")}>QUẢN TRỊ DANH MỤC / {label.toUpperCase()}</p>
    <header className={c("intro")}><div><h1>{isBrand ? "Thương Hiệu & Xưởng Atelier" : "Danh Mục & Bộ Sưu Tập"}</h1><p>Quản lý hồ sơ {label.toLowerCase()} nội thất trong hệ thống LUMORA.</p></div><div className={c("api-actions")}><button disabled title="Xuất báo cáo chưa tích hợp"><Download size={16} />Xuất Báo Cáo</button><button className={c("primary")} onClick={() => setModal({ item: null, readOnly: false })}><Plus size={17} />Thêm {label} Mới</button></div></header>
    <section className={c("kpis")} aria-label="Chỉ số tổng quan">{["TỔNG " + label.toUpperCase(), "ĐANG HOẠT ĐỘNG", isBrand ? "DOANH SỐ ĐÓNG GÓP" : "TỔNG SẢN PHẨM", isBrand ? "GIÁ TRỊ ĐƠN TRUNG BÌNH" : "GIÁ TRỊ DANH MỤC"].map(title => <article key={title}><span>{title}</span><strong className={c("unknown")}>Chưa có dữ liệu</strong></article>)}</section>
    {notice && <p className={c("notice")} role="status">{notice}</p>}
    <section className={c("filters")} aria-label="Bộ lọc"><label>Tìm kiếm<input type="search" placeholder="Tên hoặc mô tả…" value={query.search} onChange={e => update({ search: e.target.value })} /></label><label>Trạng thái<select value={query.status} onChange={e => update({ status: e.target.value })}><option value="">Tất cả trạng thái</option><option value="active">Đang hoạt động</option><option value="inactive">Tạm ngừng</option></select></label><button disabled={state.loading} onClick={reload}><RefreshCw size={16} />Tải lại</button></section>
    <p className={c("api-note")}>Bộ lọc áp dụng trên tập đã tải từ Backend. Tổng hệ thống và phân trang chưa được xác minh.</p>
    <section className={c("table-box")}>{state.loading ? <p className={c("state")} role="status">Đang tải dữ liệu…</p> : state.error ? <div className={c("state")} role="alert"><p>{state.error}</p><button onClick={reload}>Thử lại</button></div> : !data?.rows.length ? <p className={c("state")}>Không có kết quả phù hợp.</p> : <div className={c("table-scroll")} tabIndex={0} aria-label="Bảng dữ liệu, cuộn ngang để xem đủ cột"><table><thead><tr>{[label.toUpperCase(), isBrand ? "XUẤT XỨ" : "URL / SLUG", "MÔ TẢ", "SẢN PHẨM", isBrand ? "DOANH SỐ" : "GIÁ TRỊ DANH MỤC", "TRẠNG THÁI", "THAO TÁC"].map(title => <th scope="col" key={title}>{title}</th>)}</tr></thead><tbody>{data.rows.map((item, index) => <tr key={item._id ?? index}><th scope="row"><div className={c("api-identity")}><IdentityIcon key={item.logo || "empty"} src={item.logo} /><div>{display(item.name)}<small>ID: {item._id ?? "Chưa có dữ liệu"}</small></div></div></th><td>Chưa hỗ trợ qua API</td><td className={c("description")}>{display(item.description)}</td><td>{item.productCount ?? "Chưa có dữ liệu"}</td><td>Chưa có dữ liệu</td><td><span className={c("badge")}>{statusText(item.isActive)}</span></td><td><div className={c("row-actions")}><button type="button" onClick={() => setModal({ item, readOnly: true })} aria-label={"Xem " + display(item.name)}><Eye size={16} /></button><button type="button" disabled={item._id == null} title={item._id == null ? "Thiếu ID để cập nhật" : "Chỉnh sửa"} onClick={() => setModal({ item, readOnly: false })} aria-label={"Sửa " + display(item.name)}><Pencil size={16} /></button></div></td></tr>)}</tbody></table></div>}
    {!state.loading && !state.error && <footer className={c("pagination")}><span>Hiển thị {data.rows.length} / {data.loaded} {label.toLowerCase()} đã tải</span><span>Phân trang: Chưa tích hợp</span></footer>}</section>
    {isBrand ? <div className="lb-bottom-grid"><section><span className="lb-eyebrow">HỒ SƠ THƯƠNG HIỆU</span><h2>Nguồn Gốc & Chứng Nhận</h2><p>Chưa có dữ liệu</p></section><section><span className="lb-eyebrow">GIÁM TUYỂN LUMORA</span><h2>Tiêu Chí Định Danh Thương Hiệu</h2><p>Chưa xác nhận chính sách</p><button disabled title="Tài liệu chưa tích hợp">Xem Tiêu Chuẩn</button></section></div> : <div className="lcat-principles">{["Đồng Bản Sắc Vật Liệu", "Cấu Trúc URL", "Phân Bổ Không Gian"].map(title => <article key={title}><span className="lcat-eyebrow">THÔNG TIN DANH MỤC</span><h2>{title}</h2><p>Chưa có dữ liệu</p><div className="lcat-banner"><Image size={28} /><span>Chưa có ảnh</span></div></article>)}</div>}
    {modal && <EntityDialog item={modal.item} readOnly={modal.readOnly} onClose={() => setModal(null)} onSaved={saved} />}
  </div>;
}
