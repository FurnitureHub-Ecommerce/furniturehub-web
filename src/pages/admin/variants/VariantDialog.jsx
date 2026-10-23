import { useEffect, useRef, useState } from "react";
import { entityId, getVariantForEdit, saveVariant } from "../../../services/admin/variants.service.js";
import { getApiErrorMessage } from "../../../services/api.js";

const validId = value => typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);

export default function VariantDialog({ variant, products, onClose, onSaved }) {
  const id = variant?._id;
  const dialog = useRef(null);
  const submitting = useRef(false);
  const [form, setForm] = useState({ productId: "", sku: "", price: "", color: "", size: "", material: "" });
  const [loading, setLoading] = useState(Boolean(id));
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const options = products.filter(product => validId(entityId(product)));

  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    element.showModal();
    return () => { element.close(); if (previous?.isConnected) previous.focus(); };
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getVariantForEdit(id).then(data => {
      if (!cancelled) setForm({ ...data, price: String(data.price) });
    }).catch(failure => {
      if (!cancelled) { setLoadFailed(true); setError(getApiErrorMessage(failure, "Không thể tải Variant.")); }
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, revision]);

  function retry() { setLoading(true); setLoadFailed(false); setError(""); setRevision(value => value + 1); }
  function update(field, value) { setForm(current => ({ ...current, [field]: value })); }
  async function submit(event) {
    event.preventDefault();
    if (submitting.current || loading || loadFailed) return;
    if (!id && !options.some(product => entityId(product) === form.productId)) {
      setError("Vui lòng chọn sản phẩm trong danh sách đã tải."); return;
    }
    if (!form.sku.trim()) { setError("Vui lòng nhập SKU."); return; }
    if (!form.price.trim() || !Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
      setError("Giá phải là số không âm; có thể nhập 0."); return;
    }
    submitting.current = true; setSaving(true); setError("");
    try {
      await saveVariant({ id, productId: form.productId, sku: form.sku, price: Number(form.price),
        color: form.color, size: form.size, material: form.material });
      onSaved(id ? "Đã cập nhật Variant." : "Đã tạo Variant.");
    } catch (failure) {
      setError(getApiErrorMessage(failure, "Không thể lưu Variant."));
    } finally { submitting.current = false; setSaving(false); }
  }

  return <dialog ref={dialog} className="lv-variant-dialog" aria-labelledby="lv-dialog-title"
    onCancel={event => { event.preventDefault(); if (!submitting.current) onClose(); }}>
    <form onSubmit={submit} aria-busy={loading || saving}>
      <header><h2 id="lv-dialog-title">{id ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2><button type="button" disabled={saving} onClick={onClose}>X</button></header>
      {loading ? <p role="status">Đang tải chi tiết sản phẩm…</p> : loadFailed ? <div><p className="lv-action-error" role="alert">{error}</p><button type="button" onClick={retry}>Thử lại</button></div> : <>
        {id ? <p>Sản phẩm: <strong>{variant.product?.name || variant.productId}</strong></p> : <label>Sản phẩm *<select required disabled={saving} value={form.productId} onChange={event => update("productId", event.target.value)}><option value="">Chọn sản phẩm</option>{options.map(product => <option key={entityId(product)} value={entityId(product)}>{product.name || entityId(product)}{product.isActive === false ? " (tạm ngừng)" : ""}</option>)}</select></label>}
        <label>SKU *<input autoFocus required disabled={saving} value={form.sku} onChange={event => update("sku", event.target.value)} /></label>
        <label>Giá *<input type="number" min="0" step="any" required disabled={saving} value={form.price} onChange={event => update("price", event.target.value)} /></label>
        {[["color", "Màu sắc"], ["size", "Kích thước"], ["material", "Chất liệu"]].map(([field, label]) => <label key={field}>{label}<input disabled={saving} value={form[field]} onChange={event => update(field, event.target.value)} /></label>)}
        {error && <p className="lv-action-error" role="alert">{error}</p>}
        <footer><button type="button" disabled={saving} onClick={onClose}>Hủy</button><button type="submit" className="lv-primary" disabled={saving || (!id && !options.length)}>{saving ? "Đang lưu…" : "Lưu"}</button></footer>
      </>}
    </form>
  </dialog>;
}
