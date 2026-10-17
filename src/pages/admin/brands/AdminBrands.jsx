import { useEffect, useRef, useState } from "react";
import { Building, Pencil, Eye, EyeOff, Plus, X, Save, RefreshCw, CircleAlert, CircleCheck } from "lucide-react";
import { deactivateBrand, getBrands, saveBrand } from "../../../services/admin/brands.service.js";
import DeactivateDialog from "../DeactivateDialog.jsx";
import "./AdminBrands.css";

const isBrand = true;
const label = "Thương Hiệu";
const c = name => "lb-" + name;
const display = value => typeof value === "string" && value.trim() ? value : "Chưa có dữ liệu";
const statusText = value => value === true ? "Đang hoạt động" : value === false ? "Tạm ngưng" : "Chưa có dữ liệu";
function IdentityIcon() {
  return <span className={c("api-icon")}><Building size={23} /></span>;
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
  return <dialog ref={dialog} className={`${c("dialog")} ${c(readOnly ? "view-dialog" : item ? "edit-dialog" : "create-dialog")}`} aria-labelledby={c("dialog-title")} onCancel={event => { event.preventDefault(); if (!saving) onClose(); }}>
    <header><div><span className={c("eyebrow")}>{isBrand ? "HỒ SƠ NHÃN HIỆU" : "ATELIER STRUCTURE ENGINE"}</span><h2 id={c("dialog-title")}>{readOnly ? "Xem " : item ? "Chỉnh Sửa " : "Thêm Mới "}{label} Nội Thất</h2></div><button type="button" className={c("dialog-close")} disabled={saving} onClick={onClose} aria-label="Đóng modal"><X size={19} aria-hidden="true" /></button></header>
    {readOnly ? <><div className={c("view-body")}><section className={c("detail-block")}><h3>Tên thương hiệu</h3><p>{display(item?.name)}</p></section><section className={c("detail-block")}><h3>Mô tả</h3><p>{display(item?.description)}</p></section></div><footer><button type="button" onClick={onClose}>Đóng</button></footer></> : <form onSubmit={submit}><div className={c("dialog-body")}>
      <div className={c("form-grid")}><label>Tên {label} *<input autoFocus required disabled={saving} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label></div>
      <label>Mô Tả<textarea rows={3} disabled={saving} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
      {error && <p className={c("error")} role="alert"><CircleAlert size={17} aria-hidden="true" />{error}</p>}
    </div><footer><button type="button" disabled={saving} onClick={onClose}>{item ? "Hủy" : "Hủy Bỏ"}</button><button type="submit" className={c("primary")} disabled={saving}><Save size={15} aria-hidden="true" />{saving ? "Đang lưu…" : item ? "Lưu thay đổi" : "Lưu " + label}</button></footer></form>}
  </dialog>;
}
export default function AdminBrands() {
  const [query, setQuery] = useState({ search: "", status: "" });
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  const [modal, setModal] = useState(null);
  const [confirmItem, setConfirmItem] = useState(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [workingId, setWorkingId] = useState(null);
  const deactivating = useRef(false);
  useEffect(() => {
    let cancelled = false;
    getBrands(query).then(data => { if (!cancelled) setState({ data, loading: false, error: "" }); }).catch(error => { if (!cancelled) setState({ data: null, loading: false, error: error.message || "Không thể tải dữ liệu." }); });
    return () => { cancelled = true; };
  }, [query, revision]);
  function update(values) { setState(current => ({ ...current, loading: true, error: "" })); setQuery(current => ({ ...current, ...values })); }
  function reload() { setState(current => ({ ...current, loading: true, error: "" })); setRevision(value => value + 1); }
  function saved() { setModal(null); setNotice("Đã lưu " + label.toLowerCase() + "."); reload(); }
  function deactivate(item) {
    if (deactivating.current || item.isActive !== true || !/^[0-9a-fA-F]{24}$/.test(item._id ?? "")) return;
    setConfirmItem(item);
  }
  async function confirmDeactivate(item) {
    deactivating.current = true; setWorkingId(item._id); setNotice(""); setActionError("");
    try {
      await deactivateBrand(item._id);
      setNotice(`Đã vô hiệu hóa thương hiệu "${display(item.name)}".`);
      reload();
    } finally { deactivating.current = false; setWorkingId(null); }
  }
  const data = state.data;
  return <div className={c("page")}>
    <div className={c("hero")}><p className={c("eyebrow")}>QUẢN TRỊ DANH MỤC / {label.toUpperCase()}</p>
    <header className={c("intro")}><div><h1>{isBrand ? "Thương Hiệu & Xưởng Atelier" : "Danh Mục & Bộ Sưu Tập"}</h1><p>Quản lý hồ sơ nhận diện và mạng lưới thương hiệu nội thất của LUMORA.</p></div><div className={c("api-actions")}><button className={c("primary")} onClick={() => setModal({ item: null, readOnly: false })}><Plus size={17} aria-hidden="true" />Thêm {label} Mới</button></div></header></div>
    {notice && <p className={c("notice")} role="status"><CircleCheck size={17} aria-hidden="true" />{notice}</p>}
    {actionError && <p className={c("action-error")} role="alert"><CircleAlert size={17} aria-hidden="true" />{actionError}</p>}
    <section className={c("filters")} aria-label="Bộ lọc"><div className={c("filter-heading")}><strong>Hồ sơ thương hiệu</strong><span>Tìm theo tên, mô tả hoặc trạng thái hợp tác</span></div><label>Tìm kiếm<input type="search" aria-label="Tìm kiếm thương hiệu" placeholder="Tên hoặc mô tả…" value={query.search} onChange={e => update({ search: e.target.value })} /></label><label>Trạng thái<select value={query.status} onChange={e => update({ status: e.target.value })}><option value="">Tất cả trạng thái</option><option value="active">Đang hoạt động</option><option value="inactive">Tạm ngừng</option></select></label><button disabled={state.loading} onClick={reload}><RefreshCw size={16} aria-hidden="true" />Tải lại</button></section>
    <section className={c("table-box")}><header className={c("table-heading")}><div><span>MẠNG LƯỚI ĐỐI TÁC</span><strong>Hồ sơ thương hiệu</strong></div>{!state.loading && !state.error && <small>{data?.rows.length ?? 0} thương hiệu đang hiển thị</small>}</header>{state.loading ? <div className={c("state")} role="status"><RefreshCw className={c("spin")} size={22} aria-hidden="true" /><strong>Đang tải thương hiệu…</strong><span>Vui lòng chờ trong giây lát</span></div> : state.error ? <div className={`${c("state")} ${c("state-error")}`} role="alert"><CircleAlert size={24} aria-hidden="true" /><strong>Không thể tải thương hiệu</strong><p>{state.error}</p><button onClick={reload}>Thử lại</button></div> : !data?.rows.length ? <div className={c("state")}><Building size={25} aria-hidden="true" /><strong>Không có thương hiệu phù hợp</strong><span>Hãy điều chỉnh từ khóa hoặc trạng thái đang chọn.</span></div> : <div className={c("table-scroll")} tabIndex={0} aria-label="Bảng dữ liệu, cuộn ngang để xem đủ cột"><table><thead><tr>{[label.toUpperCase(), "MÔ TẢ", "TRẠNG THÁI", "THAO TÁC"].map(title => <th scope="col" key={title}>{title}</th>)}</tr></thead><tbody>{data.rows.map((item, index) => <tr className={item.isActive === false ? c("row-inactive") : undefined} style={{ "--row-index": Math.min(index, 7) }} key={item._id ?? index}><th scope="row"><div className={c("api-identity")}><IdentityIcon /><div><strong>{display(item.name)}</strong><small className={c("brand-id")} title={item._id ?? undefined}>ID: {item._id ?? "Chưa có dữ liệu"}</small></div></div></th><td className={c("description")}><span title={typeof item.description === "string" && item.description.trim() ? item.description : undefined}>{display(item.description)}</span></td><td><span className={`${c("badge")} ${item.isActive === true ? c("active") : item.isActive === false ? c("inactive") : ""}`}>{statusText(item.isActive)}</span></td><td><div className={c("row-actions")}><button type="button" title="Xem thông tin thương hiệu" onClick={() => setModal({ item, readOnly: true })} aria-label={"Xem thông tin thương hiệu " + display(item.name)}><Eye size={17} aria-hidden="true" /></button><button type="button" disabled={item._id == null} title={item._id == null ? "Thiếu ID để cập nhật" : "Chỉnh sửa thương hiệu"} onClick={() => setModal({ item, readOnly: false })} aria-label={"Chỉnh sửa thương hiệu " + display(item.name)}><Pencil size={17} aria-hidden="true" /></button>{item.isActive === true && <button type="button" className={c("deactivate")} disabled={workingId !== null || !/^[0-9a-fA-F]{24}$/.test(item._id ?? "")} title={workingId === item._id ? "Đang vô hiệu hóa…" : "Vô hiệu hóa thương hiệu"} aria-label={"Vô hiệu hóa thương hiệu " + display(item.name)} onClick={() => deactivate(item)}>{workingId === item._id ? <RefreshCw className={c("spin")} size={17} aria-hidden="true" /> : <EyeOff size={17} aria-hidden="true" />}</button>}</div></td></tr>)}</tbody></table></div>}
    {!state.loading && !state.error && <footer className={c("pagination")}><span>Hiển thị {data.rows.length} / {data.loaded} {label.toLowerCase()} đã tải</span></footer>}</section>
    {modal && <EntityDialog item={modal.item} readOnly={modal.readOnly} onClose={() => setModal(null)} onSaved={saved} />}
    {confirmItem && <DeactivateDialog kind="thương hiệu" name={display(confirmItem.name)} consequence="Thương hiệu sẽ chuyển sang trạng thái tạm ngừng. Danh sách được tải lại sau khi hoàn tất." onClose={() => setConfirmItem(null)} onConfirm={() => confirmDeactivate(confirmItem)} />}
  </div>;
}
