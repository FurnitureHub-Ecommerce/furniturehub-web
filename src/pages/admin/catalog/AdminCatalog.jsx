import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, RefreshCw, Plus, Download, Package, Layers, Building, Banknote, Image, CircleAlert } from "lucide-react";
import { deactivateProduct, getCatalog, reactivateProduct } from "../../../services/admin/catalog.service.js";
import ProductDialog from "./ProductDialog.jsx";
import ProductReactivateDialog from "./ProductReactivateDialog.jsx";
import DeactivateDialog from "../DeactivateDialog.jsx";
import "./AdminCatalog.css";

const display = value => typeof value === "string" && value.trim() ? value : "Chưa có dữ liệu";
const money = value => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "EUR" }).format(value);
function Thumbnail({ src }) {
  const [failed, setFailed] = useState(false);
  return <span className="lc-thumbnail">{src && !failed ? <img src={src} alt="" onError={() => setFailed(true)} /> : <Image size={22} aria-label="Chưa có ảnh sản phẩm" />}</span>;
}
export default function AdminCatalog() {
  const [query, setQuery] = useState({ search: "", categoryId: "", brandId: "", material: "", status: "" });
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  const [editor, setEditor] = useState(null);
  const [confirmProduct, setConfirmProduct] = useState(null);
  const [reactivateTarget, setReactivateTarget] = useState(null);
  const [workingId, setWorkingId] = useState(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  useEffect(() => {
    let cancelled = false;
    getCatalog(query).then(data => { if (!cancelled) setState({ data, loading: false, error: "" }); })
      .catch(error => { if (!cancelled) setState({ data: null, loading: false, error: error.message || "Không thể tải Catalog." }); });
    return () => { cancelled = true; };
  }, [query, revision]);
  function update(values) { setState(current => ({ ...current, loading: true, error: "" })); setQuery(current => ({ ...current, ...values })); }
  function reload() { setState(current => ({ ...current, loading: true, error: "" })); setRevision(value => value + 1); }
  function saved(message) { setEditor(null); setNotice(message); setActionError(""); reload(); }
  async function deactivate(product) {
    if (!/^[0-9a-fA-F]{24}$/.test(product._id ?? "") || workingId) return;
    setWorkingId(product._id); setNotice(""); setActionError("");
    try { await deactivateProduct(product._id); setNotice("Đã vô hiệu hóa sản phẩm."); reload(); }
    finally { setWorkingId(null); }
  }
  async function reactivate(product) {
    if (!/^[0-9a-fA-F]{24}$/.test(product._id ?? "") || workingId) return;
    setWorkingId(product._id); setNotice(""); setActionError("");
    try { await reactivateProduct(product._id); setNotice("Đã kích hoạt lại sản phẩm."); reload(); }
    finally { setWorkingId(null); }
  }
  const data = state.data;
  const selects = [["categoryId", "Danh mục", data?.categories], ["brandId", "Thương hiệu", data?.brands]];
  return <div className="lc-page">
    <div className="lc-intro"><p className="lc-eyebrow">QUẢN TRỊ DANH MỤC / SẢN PHẨM</p>
    <header className="lc-heading"><div><h1>Quản Trị Sản Phẩm, Biến Thể & Danh Mục Thương Hiệu</h1><p>Quản lý danh mục nội thất LUMORA, thương hiệu và các biến thể sản phẩm.</p></div><div className="lc-toolbar"><button disabled title="Xuất Catalog chưa tích hợp"><Download size={15} aria-hidden="true" />Xuất Catalog PDF</button><Link to="/admin/brands">Quản Lý Thương Hiệu</Link><Link to="/admin/categories">Quản Lý Danh Mục</Link><button className="lc-primary" onClick={() => setEditor({ id: null })} disabled={state.loading || Boolean(state.error) || !state.data?.categories.length || !state.data?.brands.length}><Plus size={15} aria-hidden="true" />Thêm Sản Phẩm Mới</button></div></header></div>
    {notice && <p className="lc-product-notice" role="status">{notice}</p>}{actionError && <p className="lc-product-error" role="alert">{actionError}</p>}
    <section className="lc-kpis" aria-label="Chỉ số toàn hệ thống">{[["TỔNG SẢN PHẨM", Package], ["TỔNG BIẾN THỂ SKU", Layers], ["THƯƠNG HIỆU", Building], ["GIÁ TRUNG BÌNH", Banknote]].map(([label, Icon]) => <article key={label}><div><h2>{label}</h2><strong>Chưa có dữ liệu</strong></div><Icon size={21} /></article>)}</section>
    <nav className="lc-navigation" aria-label="Phân hệ Catalog"><span aria-current="page">Tất cả sản phẩm</span><Link to="/admin/variants">Quản lý Biến thể & SKU</Link><a href="#lc-categories">Danh mục & Không gian</a><a href="#lc-brands">Thương hiệu & Xưởng chế tác</a></nav>
    <section className="lc-filters" aria-label="Lọc sản phẩm"><div className="lc-filter-heading"><div><strong>Bộ lọc danh mục</strong><span>Thu hẹp sản phẩm theo cấu trúc Catalog</span></div></div><label className="lc-search"><Search size={17} aria-hidden="true" /><input type="search" aria-label="Tìm sản phẩm" placeholder="Tên sản phẩm, mô tả hoặc SKU…" value={query.search} onChange={e => update({ search: e.target.value })} /></label>{selects.map(([field, label, options]) => <label key={field}>{label}<select value={query[field]} onChange={e => update({ [field]: e.target.value })}><option value="">Tất cả</option>{options?.filter(item => item._id != null).map(item => <option key={item._id} value={item._id}>{display(item.name)}</option>)}</select></label>)}<label>Chất liệu<select value={query.material} onChange={e => update({ material: e.target.value })}><option value="">Tất cả</option>{data?.materials.map(value => <option key={value}>{value}</option>)}</select></label><label>Trạng thái<select value={query.status} onChange={e => update({ status: e.target.value })}><option value="">Tất cả</option><option value="active">Đang hoạt động</option><option value="inactive">Tạm ngừng</option></select></label><button onClick={reload} disabled={state.loading}><RefreshCw size={16} aria-hidden="true" />Tải lại</button></section>
    <p className="lc-source">Dữ liệu Backend. Bộ lọc áp dụng trên tập đã tải; tổng hệ thống và phân trang chưa được xác minh.</p>
    <section className="lc-table-box"><div className="lc-table-title"><span>DANH SÁCH SẢN PHẨM</span>{!state.loading && !state.error && <small>{data?.rows.length ?? 0} mục đang hiển thị</small>}</div>{state.loading ? <div className="lc-state" role="status"><RefreshCw size={22} className="lc-spin" aria-hidden="true" /><strong>Đang tải Catalog…</strong><span>Đang đồng bộ sản phẩm và biến thể</span></div> : state.error ? <div className="lc-state lc-state-error" role="alert"><CircleAlert size={24} aria-hidden="true" /><strong>Không thể tải Catalog</strong><p>{state.error}</p><button onClick={reload}>Thử lại</button></div> : !data?.rows.length ? <div className="lc-state"><Package size={25} aria-hidden="true" /><strong>Không có sản phẩm phù hợp</strong><span>Hãy điều chỉnh từ khóa hoặc bộ lọc đang chọn.</span></div> : <div className="lc-table-scroll" tabIndex={0} aria-label="Bảng sản phẩm, cuộn ngang để xem đủ cột"><table><thead><tr><th scope="col">SẢN PHẨM & HÌNH ẢNH</th><th scope="col">DANH MỤC</th><th scope="col">THƯƠNG HIỆU</th><th scope="col">GIÁ VARIANT (EUR)</th><th scope="col">BIẾN THỂ</th><th scope="col">TRẠNG THÁI</th><th scope="col">THAO TÁC</th></tr></thead><tbody>{data.rows.map((product, index) => {
      const src = Array.isArray(product.images) && typeof product.images[0] === "string" ? product.images[0] : null;
      return <tr className={product.isActive === false ? "lc-row-inactive" : undefined} key={product._id ?? index}><td><div className="lc-product"><Thumbnail key={src || "empty"} src={src} /><div><strong>{display(product.name)}</strong><small>ID: {product._id ?? "Chưa có dữ liệu"}</small></div></div></td><td>{display(product.category?.name)}</td><td>{display(product.brand?.name)}</td><td>{product.priceRange ? product.priceRange.min === product.priceRange.max ? money(product.priceRange.min) : `${money(product.priceRange.min)} – ${money(product.priceRange.max)}` : "Chưa có dữ liệu"}</td><td><span className="lc-badge">{product.variants.length} đã tải</span><small>{product.variants.map(variant => variant.material).filter(Boolean).join(", ")}</small></td><td><span className="lc-badge">{product.isActive === true ? "Đang hoạt động" : product.isActive === false ? "Tạm ngưng" : "Chưa có dữ liệu"}</span></td><td><div className="lc-row-actions"><button type="button" disabled={!/^[0-9a-fA-F]{24}$/.test(product._id ?? "") || Boolean(workingId)} onClick={() => setEditor({ id: product._id, inactive: product.isActive === false })}>Sửa</button>{product.isActive === true ? <button type="button" disabled={!/^[0-9a-fA-F]{24}$/.test(product._id ?? "") || Boolean(workingId)} onClick={() => setConfirmProduct(product)}>Vô hiệu hóa</button> : product.isActive === false ? <button type="button" disabled={!/^[0-9a-fA-F]{24}$/.test(product._id ?? "") || Boolean(workingId)} onClick={() => setReactivateTarget(product)}>Kích hoạt lại</button> : null}</div></td></tr>;
    })}</tbody></table></div>}{!state.loading && !state.error && <footer>Hiển thị {data.rows.length} / {data.loaded} sản phẩm đã tải <span>Phân trang: Chưa tích hợp</span></footer>}</section>
    <div className="lc-directories">{[["lc-categories", "Không Gian & Danh Mục", data?.categories, "/admin/categories"], ["lc-brands", "Mạng Lưới Thương Hiệu", data?.brands, "/admin/brands"]].map(([id, title, rows, to]) => <section id={id} className="lc-directory" key={id}><header><h2>{title}</h2><Link to={to}>Quản lý →</Link></header>{state.loading ? <p>Đang tải…</p> : state.error ? <p>Chưa tải được dữ liệu</p> : !rows?.length ? <p>Chưa có dữ liệu</p> : <ul>{rows.map((item, index) => <li key={item._id ?? index}><strong>{display(item.name)}</strong><p>{display(item.description)}</p></li>)}</ul>}</section>)}</div>
    {editor && <ProductDialog id={editor.id} inactive={editor.inactive} categories={data?.categories ?? []} brands={data?.brands ?? []} onClose={() => setEditor(null)} onSaved={saved} />}
    {confirmProduct && <DeactivateDialog kind="sản phẩm" name={display(confirmProduct.name)} consequence="Sản phẩm sẽ chuyển sang trạng thái tạm ngừng nếu Backend hỗ trợ. Danh sách sẽ được tải lại sau khi thao tác thành công." onClose={() => setConfirmProduct(null)} onConfirm={() => deactivate(confirmProduct)} />}
    {reactivateTarget && <ProductReactivateDialog name={display(reactivateTarget.name)} onClose={() => setReactivateTarget(null)} onConfirm={() => reactivate(reactivateTarget)} />}
  </div>;
}
