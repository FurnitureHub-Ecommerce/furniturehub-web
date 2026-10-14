import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Barcode, Layers, BadgeCheck, Monitor, Download, Plus, RefreshCw, Image, ShieldCheck, CircleAlert } from "lucide-react";
import { deactivateVariant, getVariants } from "../../../services/admin/variants.service.js";
import VariantDialog from "./VariantDialog.jsx";
import DeactivateDialog from "../DeactivateDialog.jsx";
import "./AdminVariants.css";

const display = value => typeof value === "string" && value.trim() ? value : "Chưa có dữ liệu";
const money = value => value === null ? "Chưa có dữ liệu" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "EUR" }).format(value);
function Thumbnail({ src }) {
  const [failed, setFailed] = useState(false);
  return <span className="lv-api-thumbnail">{src && !failed ? <img src={src} alt="" onError={() => setFailed(true)} /> : <Image size={22} aria-label="Chưa có ảnh sản phẩm" />}</span>;
}
export default function AdminVariants() {
  const [query, setQuery] = useState({ search: "", material: "", status: "" });
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  const [editor, setEditor] = useState(null);
  const [confirmVariant, setConfirmVariant] = useState(null);
  const [workingId, setWorkingId] = useState(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  useEffect(() => {
    let cancelled = false;
    getVariants(query).then(data => { if (!cancelled) setState({ data, loading: false, error: "" }); })
      .catch(error => { if (!cancelled) setState({ data: null, loading: false, error: error.message || "Không thể tải Variant." }); });
    return () => { cancelled = true; };
  }, [query, revision]);
  function update(values) { setState(current => ({ ...current, loading: true, error: "" })); setQuery(current => ({ ...current, ...values })); }
  function reload() { setState(current => ({ ...current, loading: true, error: "" })); setRevision(value => value + 1); }
  function saved(message) { setEditor(null); setNotice(message); setActionError(""); reload(); }
  function deactivate(variant) {
    if (workingId || !/^[0-9a-fA-F]{24}$/.test(variant._id ?? "")) return;
    setConfirmVariant(variant);
  }
  async function confirmDeactivate(variant) {
    setWorkingId(variant._id); setNotice(""); setActionError("");
    try { await deactivateVariant(variant._id); setNotice("Đã vô hiệu hóa Variant."); reload(); }
    finally { setWorkingId(null); }
  }
  const data = state.data;
  return <div className="lv-page">
    <div className="lv-hero"><p className="lv-eyebrow">QUẢN TRỊ DANH MỤC / BIẾN THỂ & SKU</p>
    <header className="lv-intro"><div><h1>Quản Lý Biến Thể & Danh Mục SKU</h1><p>Theo dõi kích thước, chất liệu, màu sắc và giá niêm yết của từng biến thể sản phẩm LUMORA.</p></div><div className="lv-actions"><button disabled title="Xuất báo cáo chưa tích hợp"><Download size={16} />Xuất Báo Cáo SKU</button><button className="lv-primary" onClick={() => setEditor({ variant: null })} disabled={state.loading || Boolean(state.error) || Boolean(workingId) || !data?.products?.length}><Plus size={16} />Thêm Biến Thể Mới</button></div></header></div>
    {notice && <p className="lv-action-notice" role="status">{notice}</p>}{actionError && <p className="lv-action-error" role="alert">{actionError}</p>}
    <section className="lv-kpis" aria-label="Chỉ số toàn hệ thống">{[["TỔNG MÃ BIẾN THỂ (SKU)", Barcode, "Chưa có dữ liệu"], ["QUY CHUẨN HOÀN THIỆN", Layers, "Chưa tích hợp"], ["VARIANT ĐANG HOẠT ĐỘNG", BadgeCheck, "Chưa có dữ liệu"], ["ĐỒNG BỘ DỮ LIỆU KHO", Monitor, "Chưa tích hợp"]].map(([label, Icon, value]) => <article key={label}><span>{label}<Icon size={20} /></span><strong className="lv-pending">{value}</strong></article>)}</section>
    <section className="lv-filters" aria-label="Lọc danh sách SKU"><div className="lv-filter-heading"><div><strong>Bộ lọc biến thể</strong><span>Tra cứu nhanh từng SKU trong danh mục</span></div></div><label className="lv-search">Tìm kiếm<input type="search" aria-label="Tìm kiếm SKU" placeholder="SKU, tên sản phẩm hoặc chất liệu…" value={query.search} onChange={e => update({ search: e.target.value })} /></label><label>Chất liệu<select value={query.material} onChange={e => update({ material: e.target.value })}><option value="">Tất cả chất liệu</option>{data?.materials.map(material => <option key={material}>{material}</option>)}</select></label><label>Trạng thái<select value={query.status} onChange={e => update({ status: e.target.value })}><option value="">Tất cả trạng thái</option><option value="active">Đang hoạt động</option><option value="inactive">Tạm ngừng</option></select></label><button onClick={reload} disabled={state.loading}><RefreshCw size={16} aria-hidden="true" />Tải lại</button></section>
    <p className="lv-api-note">Dữ liệu Backend. Bộ lọc áp dụng trên tập đã tải; tổng hệ thống và phân trang chưa được xác minh.</p>
    <section className="lv-table-box" aria-label="Danh sách Variant">
      <div className="lv-table-title"><span>DANH SÁCH SKU</span>{!state.loading && !state.error && <small>{data?.rows.length ?? 0} biến thể đang hiển thị</small>}</div>
      {state.loading ? <div className="lv-state" role="status"><RefreshCw size={22} className="lv-spin" aria-hidden="true" /><strong>Đang tải Variant…</strong><span>Đang đồng bộ dữ liệu SKU</span></div> : state.error ? <div className="lv-state lv-state-error" role="alert"><CircleAlert size={24} aria-hidden="true" /><strong>Không thể tải Variant</strong><p>{state.error}</p><button onClick={reload}>Thử lại</button></div> : !data?.rows.length ? <div className="lv-state"><Barcode size={25} aria-hidden="true" /><strong>Không có Variant phù hợp</strong><span>Hãy điều chỉnh từ khóa hoặc bộ lọc đang chọn.</span></div> : <div className="lv-table-scroll" tabIndex={0} aria-label="Bảng SKU, cuộn ngang để xem đủ cột"><table><thead><tr><th scope="col">MÃ SKU</th><th scope="col">SẢN PHẨM GỐC</th><th scope="col">THUỘC TÍNH BIẾN THỂ</th><th scope="col">GIÁ NIÊM YẾT (EUR)</th><th scope="col">TỒN KHẢ DỤNG</th><th scope="col">TRẠNG THÁI</th><th scope="col">THAO TÁC</th></tr></thead><tbody>{data.rows.map((variant, index) => {
        const src = Array.isArray(variant.product?.images) && typeof variant.product.images[0] === "string" ? variant.product.images[0] : null;
        return <tr key={variant._id ?? `${variant.productId}-${index}`}><td>{variant._id ? <Link className="lv-sku" to={`/admin/inventory/${encodeURIComponent(variant._id)}`}>{display(variant.sku)}</Link> : <span className="lv-sku">{display(variant.sku)}</span>}<small>ID: {variant._id ?? "Chưa có dữ liệu"}</small></td><td><div className="lv-api-product"><Thumbnail key={src || "empty"} src={src} /><div><strong>{display(variant.product?.name)}</strong><small>ID: {variant.productId}</small></div></div></td><td><dl className="lv-api-attributes"><div><dt>Kích thước</dt><dd>{display(variant.size)}</dd></div><div><dt>Chất liệu</dt><dd>{display(variant.material)}</dd></div><div><dt>Màu sắc</dt><dd>{display(variant.color)}</dd></div></dl></td><td className="lv-api-price">{money(variant.price)}</td><td><span className={`lv-stock ${variant.availableStock === 0 ? "lv-api-out" : ""}`}>{variant.availableStock === null ? "Chưa có dữ liệu" : variant.availableStock === 0 ? "Hết hàng" : variant.availableStock}</span></td><td><span className={`lv-stock ${variant.isActive === true ? "lv-active" : variant.isActive === false ? "lv-inactive" : ""}`}>{variant.isActive === true ? "Đang hoạt động" : variant.isActive === false ? "Tạm ngừng" : "Chưa có dữ liệu"}</span></td><td><div className="lv-row-actions"><button type="button" disabled={!/^[0-9a-fA-F]{24}$/.test(variant._id ?? "") || Boolean(workingId)} onClick={() => setEditor({ variant })}>Sửa</button><button type="button" disabled={!/^[0-9a-fA-F]{24}$/.test(variant._id ?? "") || variant.isActive === false || Boolean(workingId)} onClick={() => deactivate(variant)}>{workingId === variant._id ? "Đang xử lý…" : "Vô hiệu hóa"}</button></div></td></tr>;
      })}</tbody></table></div>}
      {!state.loading && !state.error && <footer className="lv-api-footer"><span>Hiển thị {data.rows.length} / {data.loaded} Variant đã tải</span><span>Phân trang: Chưa tích hợp</span></footer>}
    </section>
    <section className="lv-api-policy"><ShieldCheck size={22} /><div><h2>Giám Sát Danh Mục Biến Thể</h2><p>Quản lý SKU, thuộc tính và giá của Variant. Tồn kho chỉ đọc; nhập, xuất và điều chỉnh tồn kho thuộc nghiệp vụ kho.</p></div></section>
    {editor && <VariantDialog variant={editor.variant} products={data?.products ?? []} onClose={() => setEditor(null)} onSaved={saved} />}
    {confirmVariant && <DeactivateDialog kind="biến thể" name={display(confirmVariant.sku)} consequence="Biến thể sẽ chuyển sang trạng thái tạm ngừng nếu Backend hỗ trợ. Dữ liệu tồn kho không được thay đổi trực tiếp từ màn hình này." onClose={() => setConfirmVariant(null)} onConfirm={() => confirmDeactivate(confirmVariant)} />}
  </div>;
}
