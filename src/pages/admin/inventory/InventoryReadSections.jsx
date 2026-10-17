import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminLowStock, getAdminTransactions } from "../../../services/admin/inventory.service.js";
import { getApiErrorMessage } from "../../../services/api.js";
import "./InventoryReadSections.css";

const validId = value => typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);
const types = ["IMPORT", "EXPORT", "ADJUSTMENT", "DEDUCTION", "RESTORE"];
const text = value => typeof value === "string" && value.trim() ? value : "Chưa có dữ liệu";
const number = value => typeof value === "number" ? new Intl.NumberFormat("vi-VN").format(value) : "Chưa có dữ liệu";
const timestamp = value => typeof value === "string" && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "Chưa có dữ liệu";
const variantIdOf = value => typeof value === "string" ? value : value?._id;

function Pagination({ label, meta, count, page, limit, loading, onPage, onLimit }) {
  return <footer className="lir-pagination">
    <span aria-live="polite">{meta ? `Trang ${meta.page} / ${meta.totalPages} · Hiển thị ${count} / tổng ${meta.totalItems}` : "Chưa có metadata phân trang"}</span>
    <label>Dòng mỗi trang <select value={limit} disabled={loading} onChange={event => onLimit(Number(event.target.value))}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select></label>
    <nav aria-label={`Phân trang ${label}`}><button type="button" disabled={loading || !meta || page <= 1} onClick={() => onPage(page - 1)}>Trước</button><button type="button" disabled={loading || !meta || meta.totalPages === 0 || page >= meta.totalPages} onClick={() => onPage(page + 1)}>Sau</button></nav>
  </footer>;
}

function RequestState({ loading, error, empty, retry, children, emptyText }) {
  if (loading) return <div className="lir-state" role="status">Đang tải dữ liệu từ Backend…</div>;
  if (error) return <div className="lir-state" role="alert"><p>{error}</p><button type="button" onClick={retry}>Thử lại</button></div>;
  if (empty) return <div className="lir-state" role="status">{emptyText}</div>;
  return children;
}

export function LowStockPanel() {
  const [draft, setDraft] = useState({ variantId: "", sku: "" });
  const [query, setQuery] = useState({ page: 1, limit: 10, variantId: "", sku: "" });
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ loading: true, data: null, error: "" });
  useEffect(() => {
    let cancelled = false;
    getAdminLowStock(query).then(data => { if (!cancelled) setState({ loading: false, data, error: "" }); })
      .catch(error => { if (!cancelled) setState({ loading: false, data: null, error: getApiErrorMessage(error, "Không thể tải Low Stock.") }); });
    return () => { cancelled = true; };
  }, [query, revision]);
  function retry() { setState(current => ({ ...current, loading: true, error: "" })); setRevision(value => value + 1); }
  function apply(event) {
    event.preventDefault();
    const variantId = draft.variantId.trim();
    const sku = draft.sku.trim();
    if (variantId && !validId(variantId)) { setState(current => ({ ...current, error: "Variant ID phải gồm 24 ký tự hex." })); return; }
    if (sku.length > 200) { setState(current => ({ ...current, error: "SKU không được vượt quá 200 ký tự." })); return; }
    setState(current => ({ ...current, loading: true, error: "" }));
    setQuery(current => ({ ...current, page: 1, variantId, sku }));
  }
  const rows = state.data?.rows ?? [];
  return <section className="lir-panel" id="admin-low-stock" aria-labelledby="lir-low-title">
    <header><h2 id="lir-low-title">Tồn kho chạm ngưỡng thấp</h2><span>LOW STOCK · CHỈ ĐỌC</span></header>
    <form className="lir-filters" onSubmit={apply}><label>Variant ID<input value={draft.variantId} onChange={event => setDraft(current => ({ ...current, variantId: event.target.value }))} placeholder="24 ký tự hex" /></label><label>SKU chính xác<input value={draft.sku} onChange={event => setDraft(current => ({ ...current, sku: event.target.value }))} maxLength={200} /></label><button type="submit" disabled={state.loading}>Lọc</button></form>
    <RequestState loading={state.loading} error={state.error} empty={rows.length === 0} retry={retry} emptyText="Không có Inventory khớp bộ lọc Low Stock.">
      <div className="lir-scroll" tabIndex={0} aria-label="Bảng Low Stock, cuộn ngang khi cần"><table><thead><tr><th>SKU / VARIANT</th><th>SẢN PHẨM</th><th>SỐ LƯỢNG</th><th>NGƯỠNG</th><th>CHI TIẾT</th></tr></thead><tbody>{rows.map((row, index) => {
        const variant = row.variantId;
        const id = variantIdOf(variant);
        return <tr key={row._id ?? index}><td>{text(variant?.sku)}<small>{text(id)}</small></td><td>{text(variant?.productId?.name)}</td><td>{number(row.quantity)}</td><td>{number(row.lowStockThreshold)}</td><td>{validId(id) ? <Link to={`/admin/inventory/${encodeURIComponent(id)}${validId(variant?.productId?._id) ? `?productId=${encodeURIComponent(variant.productId._id)}` : ""}`}>Xem chi tiết</Link> : "Chưa có Variant ID hợp lệ"}</td></tr>;
      })}</tbody></table></div>
    </RequestState>
    <Pagination label="Low Stock" meta={state.data?.pagination} count={rows.length} page={query.page} limit={query.limit} loading={state.loading} onPage={page => { setState(current => ({ ...current, loading: true })); setQuery(current => ({ ...current, page })); }} onLimit={limit => { setState(current => ({ ...current, loading: true })); setQuery(current => ({ ...current, page: 1, limit })); }} />
  </section>;
}

function isoLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error("Thời gian không hợp lệ.");
  return date.toISOString();
}

export function TransactionHistoryPanel({ variantId = "", compact = false }) {
  const [draft, setDraft] = useState({ variantId: variantId || "", type: "", from: "", to: "" });
  const [query, setQuery] = useState({ page: 1, limit: 10, variantId: variantId || "", type: "", from: "", to: "" });
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ loading: true, data: null, error: "" });
  useEffect(() => {
    let cancelled = false;
    getAdminTransactions(query).then(data => { if (!cancelled) setState({ loading: false, data, error: "" }); })
      .catch(error => { if (!cancelled) setState({ loading: false, data: null, error: getApiErrorMessage(error, "Không thể tải lịch sử kho.") }); });
    return () => { cancelled = true; };
  }, [query, revision]);
  function retry() { setState(current => ({ ...current, loading: true, error: "" })); setRevision(value => value + 1); }
  function apply(event) {
    event.preventDefault();
    const selectedId = variantId || draft.variantId.trim();
    if (selectedId && !validId(selectedId)) { setState(current => ({ ...current, error: "Variant ID phải gồm 24 ký tự hex." })); return; }
    try {
      const from = isoLocal(draft.from);
      const to = isoLocal(draft.to);
      if (from && to && Date.parse(from) > Date.parse(to)) throw new Error("Mốc bắt đầu phải trước hoặc bằng mốc kết thúc.");
      setState(current => ({ ...current, loading: true, error: "" }));
      setQuery(current => ({ ...current, page: 1, variantId: selectedId, type: draft.type, from, to }));
    } catch (error) { setState(current => ({ ...current, error: error.message })); }
  }
  const rows = state.data?.rows ?? [];
  return <section className={`lir-panel ${compact ? "lir-compact" : ""}`} id={compact ? "inventory-detail-history" : "admin-inventory-history"} aria-labelledby={compact ? "lir-detail-title" : "lir-history-title"}>
    <header><h2 id={compact ? "lir-detail-title" : "lir-history-title"}>Lịch sử biến động tồn kho</h2><span>TRANSACTIONS · CHỈ ĐỌC</span></header>
    <form className="lir-filters" onSubmit={apply}>{!variantId && <label>Variant ID<input value={draft.variantId} onChange={event => setDraft(current => ({ ...current, variantId: event.target.value }))} placeholder="24 ký tự hex" /></label>}
      <label>Loại biến động<select value={draft.type} onChange={event => setDraft(current => ({ ...current, type: event.target.value }))}><option value="">Tất cả</option>{types.map(type => <option key={type} value={type}>{type}</option>)}</select></label>
      <label>Từ<input type="datetime-local" value={draft.from} onChange={event => setDraft(current => ({ ...current, from: event.target.value }))} /></label>
      <label>Đến<input type="datetime-local" value={draft.to} onChange={event => setDraft(current => ({ ...current, to: event.target.value }))} /></label>
      <button type="submit" disabled={state.loading}>Lọc</button></form>
    <RequestState loading={state.loading} error={state.error} empty={rows.length === 0} retry={retry} emptyText="Không có giao dịch kho khớp bộ lọc.">
      <div className="lir-scroll" tabIndex={0} aria-label="Bảng lịch sử kho, cuộn ngang khi cần"><table><thead><tr><th>THỜI GIAN</th><th>SKU / VARIANT</th><th>LOẠI</th><th>SỐ LƯỢNG</th><th>TRƯỚC → SAU</th><th>THAM CHIẾU / NGƯỜI THAO TÁC</th></tr></thead><tbody>{rows.map(row => {
        const variant = row.variantId;
        const id = variantIdOf(variant);
        return <tr key={row._id}><td>{timestamp(row.createdAt)}{row.updatedAt && <small>Cập nhật: {timestamp(row.updatedAt)}</small>}</td><td>{text(variant?.sku)}<small>{text(id)}</small>{variant?.productId?.name && <small>{variant.productId.name}</small>}{validId(id) && <Link to={`/admin/inventory/${encodeURIComponent(id)}${validId(variant?.productId?._id) ? `?productId=${encodeURIComponent(variant.productId._id)}` : ""}`}>Xem Variant</Link>}</td><td>{row.type}</td><td>{number(row.quantity)}</td><td>{number(row.beforeQuantity)} → {number(row.afterQuantity)}</td><td><small>Transaction: {text(row._id)}</small><small>Inventory: {text(row.inventoryId)}</small>{row.orderId && <small>Order: {row.orderId}</small>}{row.createdBy && <small>Người thao tác: {typeof row.createdBy === "string" ? row.createdBy : text(row.createdBy.fullName)}</small>}{row.note && <small>Ghi chú: {row.note}</small>}</td></tr>;
      })}</tbody></table></div>
    </RequestState>
    <Pagination label="lịch sử kho" meta={state.data?.pagination} count={rows.length} page={query.page} limit={query.limit} loading={state.loading} onPage={page => { setState(current => ({ ...current, loading: true })); setQuery(current => ({ ...current, page })); }} onLimit={limit => { setState(current => ({ ...current, loading: true })); setQuery(current => ({ ...current, page: 1, limit })); }} />
  </section>;
}
