import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, RefreshCw, Plus, Download, Package, Layers, Building, Banknote, Image } from "lucide-react";
import { getCatalog } from "../../../services/admin/catalog.service.js";
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
  useEffect(() => {
    let cancelled = false;
    getCatalog(query).then(data => { if (!cancelled) setState({ data, loading: false, error: "" }); })
      .catch(error => { if (!cancelled) setState({ data: null, loading: false, error: error.message || "Không thể tải Catalog." }); });
    return () => { cancelled = true; };
  }, [query, revision]);
  function update(values) { setState(current => ({ ...current, loading: true, error: "" })); setQuery(current => ({ ...current, ...values })); }
  function reload() { setState(current => ({ ...current, loading: true, error: "" })); setRevision(value => value + 1); }
  const data = state.data;
  const selects = [["categoryId", "Danh mục", data?.categories], ["brandId", "Thương hiệu", data?.brands]];
  return <div className="lc-page">
    <p className="lc-eyebrow">QUẢN TRỊ DANH MỤC / SẢN PHẨM</p>
    <header className="lc-heading"><div><h1>Quản Trị Sản Phẩm, Biến Thể & Danh Mục Thương Hiệu</h1><p>Quản lý danh mục nội thất LUMORA, thương hiệu và các biến thể sản phẩm.</p></div><div className="lc-toolbar"><button disabled title="Xuất Catalog chưa tích hợp"><Download size={15} />Xuất Catalog PDF</button><Link to="/admin/brands">Quản Lý Thương Hiệu</Link><Link to="/admin/categories">Quản Lý Danh Mục</Link><button className="lc-primary" disabled title="Thêm sản phẩm chưa tích hợp"><Plus size={15} />Thêm Sản Phẩm Mới</button></div></header>
    <section className="lc-kpis" aria-label="Chỉ số toàn hệ thống">{[["TỔNG SẢN PHẨM", Package], ["TỔNG BIẾN THỂ SKU", Layers], ["THƯƠNG HIỆU", Building], ["GIÁ TRUNG BÌNH", Banknote]].map(([label, Icon]) => <article key={label}><div><h2>{label}</h2><strong>Chưa có dữ liệu</strong></div><Icon size={21} /></article>)}</section>
    <nav className="lc-navigation" aria-label="Phân hệ Catalog"><span aria-current="page">Tất cả sản phẩm</span><Link to="/admin/variants">Quản lý Biến thể & SKU</Link><a href="#lc-categories">Danh mục & Không gian</a><a href="#lc-brands">Thương hiệu & Xưởng chế tác</a></nav>
    <section className="lc-filters" aria-label="Lọc sản phẩm"><label className="lc-search"><Search size={17} /><input type="search" aria-label="Tìm sản phẩm" placeholder="Tên sản phẩm, mô tả hoặc SKU…" value={query.search} onChange={e => update({ search: e.target.value })} /></label>{selects.map(([field, label, options]) => <label key={field}>{label}<select value={query[field]} onChange={e => update({ [field]: e.target.value })}><option value="">Tất cả</option>{options?.filter(item => item._id != null).map(item => <option key={item._id} value={item._id}>{display(item.name)}</option>)}</select></label>)}<label>Chất liệu<select value={query.material} onChange={e => update({ material: e.target.value })}><option value="">Tất cả</option>{data?.materials.map(value => <option key={value}>{value}</option>)}</select></label><label>Trạng thái<select value={query.status} onChange={e => update({ status: e.target.value })}><option value="">Tất cả</option><option value="active">Đang hoạt động</option><option value="inactive">Tạm ngừng</option></select></label><button onClick={reload} disabled={state.loading}><RefreshCw size={16} />Tải lại</button></section>
    <p className="lc-source">Dữ liệu Backend. Bộ lọc áp dụng trên tập đã tải; tổng hệ thống và phân trang chưa được xác minh.</p>
    <section className="lc-table-box"><div className="lc-table-title">DANH SÁCH SẢN PHẨM</div>{state.loading ? <p className="lc-state" role="status">Đang tải Catalog…</p> : state.error ? <div className="lc-state" role="alert"><p>{state.error}</p><button onClick={reload}>Thử lại</button></div> : !data?.rows.length ? <p className="lc-state">Không có sản phẩm phù hợp.</p> : <div className="lc-table-scroll" tabIndex={0} aria-label="Bảng sản phẩm, cuộn ngang để xem đủ cột"><table><thead><tr><th scope="col">SẢN PHẨM & HÌNH ẢNH</th><th scope="col">DANH MỤC</th><th scope="col">THƯƠNG HIỆU</th><th scope="col">GIÁ VARIANT (EUR)</th><th scope="col">BIẾN THỂ</th><th scope="col">TRẠNG THÁI</th><th scope="col">THAO TÁC</th></tr></thead><tbody>{data.rows.map((product, index) => {
      const src = Array.isArray(product.images) && typeof product.images[0] === "string" ? product.images[0] : null;
      return <tr key={product._id ?? index}><td><div className="lc-product"><Thumbnail key={src || "empty"} src={src} /><div><strong>{display(product.name)}</strong><small>ID: {product._id ?? "Chưa có dữ liệu"}</small></div></div></td><td>{display(product.category?.name)}</td><td>{display(product.brand?.name)}</td><td>{product.priceRange ? product.priceRange.min === product.priceRange.max ? money(product.priceRange.min) : `${money(product.priceRange.min)} – ${money(product.priceRange.max)}` : "Chưa có dữ liệu"}</td><td><span className="lc-badge">{product.variants.length} đã tải</span><small>{product.variants.map(variant => variant.material).filter(Boolean).join(", ")}</small></td><td><span className="lc-badge">{product.isActive === true ? "Đang hoạt động" : product.isActive === false ? "Tạm ngừng" : "Chưa có dữ liệu"}</span></td><td><button disabled title="Chỉnh sửa sản phẩm chưa tích hợp">Sửa</button></td></tr>;
    })}</tbody></table></div>}{!state.loading && !state.error && <footer>Hiển thị {data.rows.length} / {data.loaded} sản phẩm đã tải <span>Phân trang: Chưa tích hợp</span></footer>}</section>
    <div className="lc-directories">{[["lc-categories", "Không Gian & Danh Mục", data?.categories, "/admin/categories"], ["lc-brands", "Mạng Lưới Thương Hiệu", data?.brands, "/admin/brands"]].map(([id, title, rows, to]) => <section id={id} className="lc-directory" key={id}><header><h2>{title}</h2><Link to={to}>Quản lý →</Link></header>{state.loading ? <p>Đang tải…</p> : state.error ? <p>Chưa tải được dữ liệu</p> : !rows?.length ? <p>Chưa có dữ liệu</p> : <ul>{rows.map((item, index) => <li key={item._id ?? index}><strong>{display(item.name)}</strong><p>{display(item.description)}</p></li>)}</ul>}</section>)}</div>
  </div>;
}
