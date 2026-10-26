import { useEffect, useRef, useState } from "react";
import { getProductForEdit, saveProduct } from "../../../services/admin/catalog.service.js";
import { productAPI, storageAPI, getApiErrorMessage } from "../../../services/api.js";
import { loadProductVariants } from "../../../services/admin/variants.service.js";

const objectId = /^[0-9a-fA-F]{24}$/;
const blankProduct = { 
  name: "", 
  description: "", 
  categoryId: "", 
  brandId: "", 
  images: "",
  isActive: true,
  variants: [
    { sku: "", color: "", size: "", material: "", price: "", isActive: true }
  ]
};

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
    async function fetchEditData() {
      try {
        const product = await getProductForEdit(id);
        const category = product.categoryId ?? product.category;
        const brand = product.brandId ?? product.brand;
        const categoryId = category?._id ?? category?.id ?? category;
        const brandId = brand?._id ?? brand?.id ?? brand;

        if (typeof product.name !== "string" || !objectId.test(categoryId ?? "")
          || !objectId.test(brandId ?? "") || (product.images != null && !Array.isArray(product.images))
          || (product.images ?? []).some(image => typeof image !== "string")) {
          throw new Error("Chi tiết Product thiếu trường cần thiết để chỉnh sửa.");
        }

        // Tải danh sách biến thể hiện tại của sản phẩm để hiển thị lên form chỉnh sửa
        const variantGroups = await loadProductVariants([{ _id: id }]);
        const variants = (variantGroups[0] || []).map(v => ({
          id: v._id || v.id,
          sku: v.sku || "",
          color: v.color || "",
          size: v.size || "",
          material: v.material || "",
          price: v.price ?? "",
          isActive: v.isActive !== false
        }));

        if (!cancelled) {
          setForm({
            name: product.name,
            description: product.description ?? "",
            categoryId,
            brandId,
            images: (product.images ?? []).join("\n"),
            isActive: product.isActive !== false,
            variants: variants.length > 0 ? variants : [{ sku: "", color: "", size: "", material: "", price: "", isActive: true }]
          });
        }
      } catch (failure) {
        if (!cancelled) {
          setError(inactive && failure.response?.status === 404
            ? "Backend trả 404 khi tải chi tiết sản phẩm tạm ngừng. Chưa thể chỉnh sửa bản ghi này; có thể thử kích hoạt lại từ danh sách."
            : getApiErrorMessage(failure, "Không thể tải Product."));
          setLoadFailed(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchEditData();
    return () => { cancelled = true; };
  }, [id, inactive]);

  const update = (field, value) => setForm(current => ({ ...current, [field]: value }));

  const updateVariant = (index, field, value) => {
    setForm(current => {
      const variants = [...current.variants];
      variants[index] = { ...variants[index], [field]: value };
      return { ...current, variants };
    });
  };

  const addVariantRow = () => {
    setForm(current => ({
      ...current,
      variants: [...current.variants, { sku: "", color: "", size: "", material: "", price: "", isActive: true }]
    }));
  };

  const removeVariantRow = (index) => {
    setForm(current => ({
      ...current,
      variants: current.variants.filter((_, i) => i !== index)
    }));
  };

 async function submit(event) {
    event.preventDefault();
    if (loading || saving || loadFailed) return;
    const name = form.name.trim();
    const description = form.description.trim();
    const images = form.images.split(/\r?\n/).map(value => value.trim()).filter(Boolean);
    
    if (!name || !objectId.test(form.categoryId) || !objectId.test(form.brandId)) {
      setError("Nhập tên và chọn Danh mục, Thương hiệu hợp lệ."); return;
    }

    for (const v of form.variants) {
      if (!v.sku.trim() || v.price === "") {
        setError("Vui lòng điền đầy đủ SKU và Giá cho tất cả các biến thể.");
        return;
      }
    }

    setSaving(true); setError("");
    try {
      // 1. Cập nhật hoặc Tạo thông tin chung Product (Bỏ trường isActive gây lỗi validation)
      const savedProd = await saveProduct({ 
        id, 
        name, 
        description, 
        categoryId: form.categoryId, 
        brandId: form.brandId, 
        images
      });
      const productId = id || savedProd?._id || savedProd?.id;

      // 2. Xử lý đồng bộ các biến thể (Variant) - Chỉ gửi các trường hợp lệ
      if (productId && objectId.test(productId)) {
        for (const v of form.variants) {
          const variantPayload = {
            sku: v.sku.trim(),
            price: Number(v.price),
            color: v.color.trim() || undefined,
            size: v.size.trim() || undefined,
            material: v.material.trim() || undefined,
          };

          if (v.id) {
            await storageAPI.updateVariant(v.id, variantPayload);
          } else {
            await productAPI.createVariant(productId, variantPayload);
          }
        }
      }

      onSaved(id ? "Đã cập nhật sản phẩm và biến thể." : "Đã tạo sản phẩm và biến thể mới.");
    } catch (failure) {
      setError(getApiErrorMessage(failure, "Không thể lưu sản phẩm."));
      setSaving(false);
    }
  }

  return <dialog ref={dialog} className="lc-product-dialog" aria-labelledby="lc-product-dialog-title"
    onCancel={event => { event.preventDefault(); if (!saving) onClose(); }}>
    <form onSubmit={submit}>
      <header>
        <h2 id="lc-product-dialog-title">{id ? "Chỉnh sửa sản phẩm & Biến thể" : "Thêm sản phẩm mới kèm Biến thể"}</h2>
        <button type="button" onClick={onClose} disabled={saving}>Đóng</button>
      </header>

      {loading ? <p role="status">Đang tải chi tiết sản phẩm…</p> : loadFailed ? <p className="lc-product-error" role="alert">{error}</p> : <>
        <label>Tên sản phẩm *<input autoFocus required value={form.name} onChange={event => update("name", event.target.value)} disabled={saving} /></label>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <label>Danh mục *<select required value={form.categoryId} onChange={event => update("categoryId", event.target.value)} disabled={saving}>
            <option value="">Chọn danh mục</option>{categories.filter(item => item.isActive !== false || item._id === form.categoryId).map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
          </select></label>
          
          <label>Thương hiệu *<select required value={form.brandId} onChange={event => update("brandId", event.target.value)} disabled={saving}>
            <option value="">Chọn thương hiệu</option>{brands.filter(item => item.isActive !== false || item._id === form.brandId).map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
          </select></label>
        </div>

        <label>Mô tả<textarea rows={3} value={form.description} onChange={event => update("description", event.target.value)} disabled={saving} /></label>
        <label>URL ảnh, mỗi dòng một URL<textarea rows={2} value={form.images} onChange={event => update("images", event.target.value)} disabled={saving} /></label>

        {id && (
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginTop: "4px" }}>
            <input type="checkbox" checked={form.isActive} onChange={e => update("isActive", e.target.checked)} disabled={saving} />
            <span>Sản phẩm đang hoạt động (isActive)</span>
          </label>
        )}

        {/* PHẦN QUẢN LÝ BIẾN THỂ (DÙNG CHUNG CHO CẢ THÊM MỚI VÀ CHỈNH SỬA) */}
        <div className="lc-modal-variants-section" style={{ borderTop: "1px solid #e2e8f0", paddingTop: "12px", marginTop: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <strong>Thuộc tính & Biến thể (Variants) *</strong>
            <button type="button" onClick={addVariantRow} disabled={saving} style={{ fontSize: "12px", padding: "4px 8px" }}>+ Thêm biến thể</button>
          </div>
          
          {form.variants.map((v, index) => (
            <div key={v.id || index} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto auto", gap: "6px", marginBottom: "8px", alignItems: "center" }}>
              <input placeholder="SKU *" required value={v.sku} onChange={e => updateVariant(index, "sku", e.target.value)} disabled={saving} />
              <input placeholder="Màu" value={v.color} onChange={e => updateVariant(index, "color", e.target.value)} disabled={saving} />
              <input placeholder="Size" value={v.size} onChange={e => updateVariant(index, "size", e.target.value)} disabled={saving} />
              <input placeholder="Chất liệu" value={v.material} onChange={e => updateVariant(index, "material", e.target.value)} disabled={saving} />
              <input type="number" placeholder="Giá *" required value={v.price} onChange={e => updateVariant(index, "price", e.target.value)} disabled={saving} />
              
              {id && (
                <label title="Trạng thái variant" style={{ display: "flex", alignItems: "center", fontSize: "11px" }}>
                  <input type="checkbox" checked={v.isActive} onChange={e => updateVariant(index, "isActive", e.target.checked)} disabled={saving} />
                </label>
              )}

              {form.variants.length > 1 && (
                <button type="button" onClick={() => removeVariantRow(index)} disabled={saving} style={{ color: "red", border: "none", background: "transparent", cursor: "pointer", fontSize: "16px" }}>×</button>
              )}
            </div>
          ))}
        </div>

        {error && <p className="lc-product-error" role="alert">{error}</p>}
        <footer>
          <button type="button" onClick={onClose} disabled={saving}>Hủy</button>
          <button className="lc-primary" type="submit" disabled={saving}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
        </footer>
      </>}
    </form>
  </dialog>;
}