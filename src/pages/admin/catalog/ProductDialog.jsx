import { useEffect, useRef, useState } from "react";
import {
  getProductForEdit,
  saveProduct,
} from "../../../services/admin/catalog.service.js";
import {
  productAPI,
  storageAPI,
  getApiErrorMessage,
} from "../../../services/api.js";
import { loadProductVariants } from "../../../services/admin/variants.service.js";
import { X, Plus, Trash2, PackagePlus, Layers } from "lucide-react";

const objectId = /^[0-9a-fA-F]{24}$/;
const blankProduct = {
  name: "",
  description: "",
  categoryId: "",
  brandId: "",
  images: "",
  isActive: true,
  variants: [
    { sku: "", color: "", size: "", material: "", price: "", isActive: true },
  ],
};

export default function ProductDialog({
  id,
  inactive = false,
  categories,
  brands,
  onClose,
  onSaved,
}) {
  const dialog = useRef(null);
  const [form, setForm] = useState(blankProduct);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);

  // Bảng dịch nghĩa tiếng Việt cho các danh mục nội thất
  const categoryTranslations = {
    "Home Decor & Lighting": "Trang trí nhà cửa & Đèn",
    "TV Units & Media": "Kệ TV & Kệ thiết bị giải trí",
    "Bookshelves & Shelving": "Kệ sách & Hệ thống giá kệ",
    "Coffee & Side Tables": "Bàn trà & Bàn góc",
    "Wardrobes & Cabinets": "Tủ quần áo & Tủ lưu trữ",
    "Office Desks & Chairs": "Bàn ghế làm việc văn phòng",
    "Dining Tables & Chairs": "Bộ bàn ghế ăn phòng bếp",
    "Beds & Mattresses": "Giường ngủ & Đệm",
    "Sofa & Armchair": "Ghế Sofa & Ghế bành thư giãn",
  };

  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    if (element && !element.open) element.showModal();
    return () => {
      if (element && element.open) element.close();
      previous?.focus();
    };
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

        if (
          typeof product.name !== "string" ||
          !objectId.test(categoryId ?? "") ||
          !objectId.test(brandId ?? "") ||
          (product.images != null && !Array.isArray(product.images)) ||
          (product.images ?? []).some((image) => typeof image !== "string")
        ) {
          throw new Error(
            "Chi tiết Product thiếu trường cần thiết để chỉnh sửa.",
          );
        }

        const variantGroups = await loadProductVariants([{ _id: id }]);
        const variants = (variantGroups[0] || []).map((v) => ({
          id: v._id || v.id,
          sku: v.sku || "",
          color: v.color || "",
          size: v.size || "",
          material: v.material || "",
          price: v.price ?? "",
          isActive: v.isActive !== false,
        }));

        if (!cancelled) {
          setForm({
            name: product.name,
            description: product.description ?? "",
            categoryId,
            brandId,
            images: (product.images ?? []).join("\n"),
            isActive: product.isActive !== false,
            variants:
              variants.length > 0
                ? variants
                : [
                    {
                      sku: "",
                      color: "",
                      size: "",
                      material: "",
                      price: "",
                      isActive: true,
                    },
                  ],
          });
        }
      } catch (failure) {
        if (!cancelled) {
          setError(
            inactive && failure.response?.status === 404
              ? "Lỗi tải chi tiết sản phẩm tạm ngừng."
              : getApiErrorMessage(failure, "Không thể tải Product."),
          );
          setLoadFailed(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchEditData();
    return () => {
      cancelled = true;
    };
  }, [id, inactive]);

  const update = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const updateVariant = (index, field, value) => {
    setForm((current) => {
      const variants = [...current.variants];
      variants[index] = { ...variants[index], [field]: value };
      return { ...current, variants };
    });
  };

  const addVariantRow = () => {
    setForm((current) => ({
      ...current,
      variants: [
        ...current.variants,
        {
          sku: "",
          color: "",
          size: "",
          material: "",
          price: "",
          isActive: true,
        },
      ],
    }));
  };

  const removeVariantRow = (index) => {
    setForm((current) => ({
      ...current,
      variants: current.variants.filter((_, i) => i !== index),
    }));
  };

  async function submit(event) {
    event.preventDefault();
    if (loading || saving || loadFailed) return;
    const name = form.name.trim();
    const description = form.description.trim();
    const images = form.images
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);

    if (
      !name ||
      !objectId.test(form.categoryId) ||
      !objectId.test(form.brandId)
    ) {
      setError("Nhập tên và chọn Danh mục, Thương hiệu hợp lệ.");
      return;
    }

    for (const v of form.variants) {
      if (!v.sku.trim() || v.price === "") {
        setError("Vui lòng điền đầy đủ SKU và Giá cho tất cả các biến thể.");
        return;
      }
    }

    setSaving(true);
    setError("");
    try {
      const savedProd = await saveProduct({
        id,
        name,
        description,
        categoryId: form.categoryId,
        brandId: form.brandId,
        images,
        isActive: form.isActive,
      });
      const productId = id || savedProd?._id || savedProd?.id;

      if (productId && objectId.test(productId)) {
        const variantPromises = form.variants.map((v) => {
          const variantPayload = {
            sku: v.sku.trim(),
            price: Number(v.price),
            color: v.color.trim() || undefined,
            size: v.size.trim() || undefined,
            material: v.material.trim() || undefined,
          };

          if (v.id) {
            return storageAPI.updateVariant(v.id, variantPayload);
          } else {
            return productAPI.createVariant(productId, variantPayload);
          }
        });

        await Promise.all(variantPromises);
      }

      const categoryObj = categories.find((c) => c._id === form.categoryId);
      const brandObj = brands.find((b) => b._id === form.brandId);
      const prices = form.variants
        .map((v) => Number(v.price))
        .filter((p) => !isNaN(p));
      const minPrice = prices.length ? Math.min(...prices) : 0;
      const maxPrice = prices.length ? Math.max(...prices) : 0;

      const optimisticProduct = {
        _id: productId,
        name,
        description,
        images,
        isActive: form.isActive,
        category: categoryObj
          ? { _id: categoryObj._id, name: categoryObj.name }
          : null,
        brand: brandObj ? { _id: brandObj._id, name: brandObj.name } : null,
        priceRange: { min: minPrice, max: maxPrice },
        variants: form.variants,
      };

      onSaved(
        id
          ? "Đã cập nhật sản phẩm và biến thể."
          : "Đã tạo sản phẩm và biến thể mới.",
        optimisticProduct,
      );
    } catch (failure) {
      setError(getApiErrorMessage(failure, "Không thể lưu sản phẩm."));
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      className="lc-product-dialog"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
      style={{
        padding: 0,
        border: "none",
        borderRadius: "16px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        width: "100%",
        maxWidth: "750px",
        background: "#ffffff",
        overflow: "hidden",
        position: "fixed",
        margin: "auto",
      }}
    >
      <style>{`
        .lc-product-dialog::backdrop {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
        }
      `}</style>

      <form
        onSubmit={submit}
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 24px",
            borderBottom: "1px solid #f1f5f9",
            background: "#fafaf9",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: "700",
              color: "#1c1917",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <PackagePlus size={20} color="#8a6a48" />
            {id
              ? "Chỉnh sửa sản phẩm & Biến thể"
              : "Thêm sản phẩm mới kèm Biến thể"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              background: "transparent",
              border: "none",
              color: "#78716c",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "8px",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body cuộn */}
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#78716c",
              }}
            >
              <p role="status">Đang tải chi tiết sản phẩm…</p>
            </div>
          ) : loadFailed ? (
            <p role="alert" style={{ color: "#dc2626", padding: "10px" }}>
              {error}
            </p>
          ) : (
            <>
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#44403c",
                }}
              >
                Tên sản phẩm *
                <input
                  autoFocus
                  required
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                  disabled={saving}
                  placeholder="Nhập tên sản phẩm..."
                  style={{
                    padding: "10px 14px",
                    border: "1px solid #d6d3d1",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#44403c",
                  }}
                >
                  Danh mục *
                  <select
                    required
                    value={form.categoryId}
                    onChange={(event) =>
                      update("categoryId", event.target.value)
                    }
                    disabled={saving}
                    style={{
                      padding: "10px 14px",
                      border: "1px solid #d6d3d1",
                      borderRadius: "8px",
                      fontSize: "14px",
                      background: "#fff",
                      outline: "none",
                    }}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories
                      .filter(
                        (item) =>
                          item.isActive !== false ||
                          item._id === form.categoryId,
                      )
                      .map((item) => (
                        <option key={item._id} value={item._id}>
                          {categoryTranslations[item.name] || item.name}
                        </option>
                      ))}
                  </select>
                </label>

                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#44403c",
                  }}
                >
                  Thương hiệu *
                  <select
                    required
                    value={form.brandId}
                    onChange={(event) => update("brandId", event.target.value)}
                    disabled={saving}
                    style={{
                      padding: "10px 14px",
                      border: "1px solid #d6d3d1",
                      borderRadius: "8px",
                      fontSize: "14px",
                      background: "#fff",
                      outline: "none",
                    }}
                  >
                    <option value="">Chọn thương hiệu</option>
                    {brands
                      .filter(
                        (item) =>
                          item.isActive !== false || item._id === form.brandId,
                      )
                      .map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </label>
              </div>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#44403c",
                }}
              >
                Mô tả sản phẩm
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    update("description", event.target.value)
                  }
                  disabled={saving}
                  placeholder="Nhập mô tả chi tiết..."
                  style={{
                    padding: "10px 14px",
                    border: "1px solid #d6d3d1",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </label>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#44403c",
                }}
              >
                URL ảnh (Mỗi dòng một URL)
                <textarea
                  rows={2}
                  value={form.images}
                  onChange={(event) => update("images", event.target.value)}
                  disabled={saving}
                  placeholder="https://..."
                  style={{
                    padding: "10px 14px",
                    border: "1px solid #d6d3d1",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </label>

              {id && (
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#272522",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => update("isActive", e.target.checked)}
                    disabled={saving}
                    style={{
                      width: "16px",
                      height: "16px",
                      accentColor: "#8a6a48",
                    }}
                  />
                  <span>Sản phẩm đang hoạt động</span>
                </label>
              )}

              {/* Phần quản lý biến thể */}
              <div
                style={{
                  borderTop: "1px solid #e7e5e4",
                  paddingTop: "16px",
                  marginTop: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <strong
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "14px",
                      color: "#1c1917",
                    }}
                  >
                    <Layers size={16} color="#8a6a48" /> Thuộc tính & Biến thể
                    SKU *
                  </strong>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    disabled={saving}
                    style={{
                      fontSize: "12px",
                      padding: "6px 12px",
                      background: "#f5f5f4",
                      border: "1px solid #d6d3d1",
                      borderRadius: "6px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      color: "#272522",
                    }}
                  >
                    <Plus size={14} /> Thêm biến thể
                  </button>
                </div>

                {form.variants.map((v, index) => (
                  <div
                    key={v.id || index}
                    style={{
                      background: "#fcfcfb",
                      border: "1px solid #e7e5e4",
                      borderRadius: "10px",
                      padding: "12px",
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr 1fr 1.2fr auto",
                      gap: "8px",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <input
                      placeholder="SKU *"
                      required
                      value={v.sku}
                      onChange={(e) =>
                        updateVariant(index, "sku", e.target.value)
                      }
                      disabled={saving}
                      style={{
                        padding: "8px 10px",
                        border: "1px solid #d6d3d1",
                        borderRadius: "6px",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />
                    <input
                      placeholder="Màu"
                      value={v.color}
                      onChange={(e) =>
                        updateVariant(index, "color", e.target.value)
                      }
                      disabled={saving}
                      style={{
                        padding: "8px 10px",
                        border: "1px solid #d6d3d1",
                        borderRadius: "6px",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />
                    <input
                      placeholder="Size"
                      value={v.size}
                      onChange={(e) =>
                        updateVariant(index, "size", e.target.value)
                      }
                      disabled={saving}
                      style={{
                        padding: "8px 10px",
                        border: "1px solid #d6d3d1",
                        borderRadius: "6px",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />
                    <input
                      placeholder="Chất liệu"
                      value={v.material}
                      onChange={(e) =>
                        updateVariant(index, "material", e.target.value)
                      }
                      disabled={saving}
                      style={{
                        padding: "8px 10px",
                        border: "1px solid #d6d3d1",
                        borderRadius: "6px",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Giá *"
                      required
                      value={v.price}
                      onChange={(e) =>
                        updateVariant(index, "price", e.target.value)
                      }
                      disabled={saving}
                      style={{
                        padding: "8px 10px",
                        border: "1px solid #d6d3d1",
                        borderRadius: "6px",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />

                    {form.variants.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeVariantRow(index)}
                        disabled={saving}
                        style={{
                          color: "#dc2626",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          display: "flex",
                          padding: "6px",
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                ))}
              </div>

              {error && (
                <p
                  role="alert"
                  style={{ color: "#dc2626", fontSize: "13px", margin: 0 }}
                >
                  {error}
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer cố định chứa nút Hủy bỏ và Lưu thay đổi */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #f1f5f9",
            background: "#fafaf9",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "auto",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: "1px solid #d6d3d1",
              background: "#fff",
              color: "#44403c",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={saving || loading || loadFailed}
            style={{
              padding: "10px 22px",
              borderRadius: "8px",
              border: "none",
              background: "#272522",
              color: "#fff",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {saving ? "Đang lưu..." : id ? "Cập nhật thay đổi" : "Tạo sản phẩm"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
