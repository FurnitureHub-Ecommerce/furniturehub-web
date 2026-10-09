import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Barcode, Layers, BadgeCheck, Monitor, Download, Plus, RefreshCw, Image, ShieldCheck } from "lucide-react";
import { getVariants } from "../../../services/admin/variants.service.js";
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
  useEffect(() => {
    let cancelled = false;
    getVariants(query).then(data => { if (!cancelled) setState({ data, loading: false, error: "" }); })
      .catch(error => { if (!cancelled) setState({ data: null, loading: false, error: error.message || "Không thể tải Variant." }); });
    return () => { cancelled = true; };
  }, [query, revision]);
  function update(values) { setState(current => ({ ...current, loading: true, error: "" })); setQuery(current => ({ ...current, ...values })); }
  function reload() { setState(current => ({ ...current, loading: true, error: "" })); setRevision(value => value + 1); }
  const data = state.data;
  return <div className="lv-page">
    <p className="lv-eyebrow">QUẢN TRỊ DANH MỤC / BIẾN THỂ & SKU</p>
    <header className="lv-intro"><div><h1>Quản Lý Biến Thể & Danh Mục SKU</h1><p>Theo dõi kích thước, chất liệu, màu sắc và giá niêm yết của từng biến thể sản phẩm LUMORA.</p></div><div className="lv-actions"><button disabled title="Xuất báo cáo chưa tích hợp"><Download size={16} />Xuất Báo Cáo SKU</button><button className="lv-primary" disabled title="Tạo Variant chưa được xác nhận"><Plus size={16} />Thêm Biến Thể Mới</button></div></header>
    <section className="lv-kpis" aria-label="Chỉ số toàn hệ thống">{[["TỔNG MÃ BIẾN THỂ (SKU)", Barcode, "Chưa có dữ liệu"], ["QUY CHUẨN HOÀN THIỆN", Layers, "Chưa tích hợp"], ["VARIANT ĐANG HOẠT ĐỘNG", BadgeCheck, "Chưa có dữ liệu"], ["ĐỒNG BỘ DỮ LIỆU KHO", Monitor, "Chưa tích hợp"]].map(([label, Icon, value]) => <article key={label}><span>{label}<Icon size={20} /></span><strong className="lv-pending">{value}</strong></article>)}</section>
    <section className="lv-filters" aria-label="Lọc danh sách SKU"><label className="lv-search">Tìm kiếm<input type="search" placeholder="SKU, tên sản phẩm hoặc chất liệu…" value={query.search} onChange={e => update({ search: e.target.value })} /></label><label>Chất liệu<select value={query.material} onChange={e => update({ material: e.target.value })}><option value="">Tất cả chất liệu</option>{data?.materials.map(material => <option key={material}>{material}</option>)}</select></label><label>Trạng thái<select value={query.status} onChange={e => update({ status: e.target.value })}><option value="">Tất cả trạng thái</option><option value="active">Đang hoạt động</option><option value="inactive">Tạm ngừng</option></select></label><button onClick={reload} disabled={state.loading}><RefreshCw size={16} />Tải lại</button></section>
    <p className="lv-api-note">Dữ liệu Backend. Bộ lọc áp dụng trên tập đã tải; tổng hệ thống và phân trang chưa được xác minh.</p>
    <section className="lv-table-box" aria-label="Danh sách Variant">
      {state.loading ? <p className="lv-state" role="status">Đang tải Variant…</p> : state.error ? <div className="lv-state" role="alert"><p>{state.error}</p><button onClick={reload}>Thử lại</button></div> : !data?.rows.length ? <p className="lv-state">Không có Variant phù hợp.</p> : <div className="lv-table-scroll" tabIndex={0} aria-label="Bảng SKU, cuộn ngang để xem đủ cột"><table><thead><tr><th scope="col">MÃ SKU</th><th scope="col">SẢN PHẨM GỐC</th><th scope="col">THUỘC TÍNH BIẾN THỂ</th><th scope="col">GIÁ NIÊM YẾT (EUR)</th><th scope="col">TỒN KHẢ DỤNG</th><th scope="col">TRẠNG THÁI</th></tr></thead><tbody>{data.rows.map((variant, index) => {
        const src = Array.isArray(variant.product?.images) && typeof variant.product.images[0] === "string" ? variant.product.images[0] : null;
        return <tr key={variant._id ?? `${variant.productId}-${index}`}><td>{variant._id ? <Link className="lv-sku" to={`/admin/inventory/${encodeURIComponent(variant._id)}`}>{display(variant.sku)}</Link> : <span className="lv-sku">{display(variant.sku)}</span>}<small>ID: {variant._id ?? "Chưa có dữ liệu"}</small></td><td><div className="lv-api-product"><Thumbnail key={src || "empty"} src={src} /><div><strong>{display(variant.product?.name)}</strong><small>ID: {variant.productId}</small></div></div></td><td><dl className="lv-api-attributes"><div><dt>Kích thước</dt><dd>{display(variant.size)}</dd></div><div><dt>Chất liệu</dt><dd>{display(variant.material)}</dd></div><div><dt>Màu sắc</dt><dd>{display(variant.color)}</dd></div></dl></td><td className="lv-api-price">{money(variant.price)}</td><td><span className={`lv-stock ${variant.availableStock === 0 ? "lv-api-out" : ""}`}>{variant.availableStock === null ? "Chưa có dữ liệu" : variant.availableStock === 0 ? "Hết hàng" : variant.availableStock}</span></td><td><span className="lv-stock">{variant.isActive === true ? "Đang hoạt động" : variant.isActive === false ? "Tạm ngừng" : "Chưa có dữ liệu"}</span></td></tr>;
      })}</tbody></table></div>}
      {!state.loading && !state.error && <footer className="lv-api-footer"><span>Hiển thị {data.rows.length} / {data.loaded} Variant đã tải</span><span>Phân trang: Chưa tích hợp</span></footer>}
    </section>
    <section className="lv-api-policy"><ShieldCheck size={22} /><div><h2>Giám Sát Danh Mục Biến Thể</h2><p>Danh sách chỉ đọc. Thêm, sửa và xóa Variant đang chờ xác nhận nghiệp vụ. Không thực hiện nhập, xuất hoặc điều chỉnh tồn kho.</p></div></section>
  </div>;
}
