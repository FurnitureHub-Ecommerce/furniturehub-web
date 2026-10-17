import { useEffect, useRef, useState } from "react";
import { getProductForEdit, saveProduct } from "../../../services/admin/catalog.service.js";
import { getApiErrorMessage } from "../../../services/api.js";

const objectId = /^[0-9a-fA-F]{24}$/;
const blankProduct = { name: "", description: "", categoryId: "", brandId: "", images: "" };

export default function ProductDialog({ id, inactive = false, categories, brands, onClose, onSaved }) {
  const dialog = useRef(null);
  const [form, setForm] = useState(blankProduct);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    element.showModal();
    return () => { element.close(); previous?.focus(); };
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getProductForEdit(id).then(product => {
      const category = product.categoryId ?? product.category;
      const brand = product.brandId ?? product.brand;
      const categoryId = category?._id ?? category?.id ?? category;
      const brandId = brand?._id ?? brand?.id ?? brand;
      if (typeof product.name !== "string" || !objectId.test(categoryId ?? "")
        || !objectId.test(brandId ?? "") || (product.images != null && !Array.isArray(product.images))
        || (product.images ?? []).some(image => typeof image !== "string")) {
        throw new Error("Chi tiết Product thiếu trường cần thiết để chỉnh sửa.");
      }
      if (!cancelled) setForm({ name: product.name, description: product.description ?? "",
        categoryId, brandId, images: (product.images ?? []).join("\n") });
    }).catch(failure => {
      if (!cancelled) { setError(inactive && failure.response?.status === 404
        ? "Backend trả 404 khi tải chi tiết sản phẩm tạm ngừng. Chưa thể chỉnh sửa bản ghi này; có thể thử kích hoạt lại từ danh sách."
        : getApiErrorMessage(failure, "Không thể tải Product.")); setLoadFailed(true); }
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, inactive]);

  const update = (field, value) => setForm(current => ({ ...current, [field]: value }));
  async function submit(event) {
    event.preventDefault();
    if (loading || saving || loadFailed) return;
    const name = form.name.trim();
    const description = form.description.trim();
    const images = form.images.split(/\r?\n/).map(value => value.trim()).filter(Boolean);
    if (!name || !objectId.test(form.categoryId) || !objectId.test(form.brandId)) {
      setError("Nhập tên và chọn Danh mục, Thương hiệu hợp lệ."); return;
    }
    setSaving(true); setError("");
    try {
      await saveProduct({ id, name, description, categoryId: form.categoryId, brandId: form.brandId, images });
      onSaved(id ? "Đã cập nhật sản phẩm." : "Đã tạo sản phẩm.");
    } catch (failure) {
      setError(getApiErrorMessage(failure, "Không thể lưu sản phẩm."));
      setSaving(false);
    }
  }

  return <dialog ref={dialog} className="lc-product-dialog" aria-labelledby="lc-product-dialog-title"
    onCancel={event => { event.preventDefault(); if (!saving) onClose(); }}>
    <form onSubmit={submit}>
      <header><h2 id="lc-product-dialog-title">{id ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
        <button type="button" onClick={onClose} disabled={saving}>Đóng</button></header>
      {loading ? <p role="status">Đang tải chi tiết sản phẩm…</p> : loadFailed ? <p className="lc-product-error" role="alert">{error}</p> : <>
        <label>Tên sản phẩm *<input autoFocus required value={form.name} onChange={event => update("name", event.target.value)} disabled={saving} /></label>
        <label>Danh mục *<select required value={form.categoryId} onChange={event => update("categoryId", event.target.value)} disabled={saving}>
          <option value="">Chọn danh mục</option>{categories.filter(item => item.isActive !== false || item._id === form.categoryId).map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
        </select></label>
        <label>Thương hiệu *<select required value={form.brandId} onChange={event => update("brandId", event.target.value)} disabled={saving}>
          <option value="">Chọn thương hiệu</option>{brands.filter(item => item.isActive !== false || item._id === form.brandId).map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
        </select></label>
        <label>Mô tả<textarea rows={4} value={form.description} onChange={event => update("description", event.target.value)} disabled={saving} /></label>
        <label>URL ảnh, mỗi dòng một URL<textarea rows={3} value={form.images} onChange={event => update("images", event.target.value)} disabled={saving} /></label>
        {error && <p className="lc-product-error" role="alert">{error}</p>}
        <footer><button type="button" onClick={onClose} disabled={saving}>Hủy</button><button className="lc-primary" type="submit" disabled={saving}>{saving ? "Đang lưu…" : "Lưu sản phẩm"}</button></footer>
      </>}
    </form>
  </dialog>;
}
