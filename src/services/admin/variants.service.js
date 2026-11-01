import { productAPI, storageAPI } from "../api.js";

export function recordsFrom(data, key) {
  const candidates = [data, data?.[key], data?.data?.[key], data?.items, data?.data];
  const rows = candidates.find(Array.isArray);
  if (!rows || rows.some(row => !row || typeof row !== "object" || Array.isArray(row))) {
    throw new Error("Phản hồi danh sách không đúng định dạng.");
  }
  return rows;
}

export const entityId = entity => typeof entity === "object" && entity !== null
  ? entity._id ?? entity.id ?? entity.productId ?? entity.categoryId ?? entity.brandId : entity;

export function realNumber(value) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function activeState(record) {
  if (typeof record.isActive === "boolean") return record.isActive;
  if (record.status === "active") return true;
  if (record.status === "inactive") return false;
  return null;
}

// TỐI ƯU CỰC TỐC: Chạy song song toàn bộ sản phẩm cùng một lúc để lấy variants
export async function loadProductVariants(products) {
  const list = Array.isArray(products) ? products : [];
  
  const promises = list.map(async product => {
    const productId = entityId(product);
    if (!productId || typeof productId !== "string" || !/^[0-9a-fA-F]{24}$/.test(productId)) {
      return { productId, variants: [] };
    }
    try {
      const response = await productAPI.getProductVariantsAdmin(productId);
      const variants = recordsFrom(response.data, "variants").map(variant => {
        const stock = realNumber(variant.availableStock);
        return {
          ...variant,
          _id: variant._id ?? variant.id ?? variant.variantId,
          productId,
          product,
          price: realNumber(variant.price),
          availableStock: stock !== null && Number.isInteger(stock) ? stock : null,
          isActive: activeState(variant),
        };
      });
      return { productId, variants };
    } catch {
      return { productId, variants: [] };
    }
  });

  const results = await Promise.all(promises);
  const variantMap = new Map(results.map(r => [r.productId, r.variants]));
  return list.map(product => variantMap.get(entityId(product)) || []);
}

// Bộ nhớ đệm (Cache) giúp chuyển qua lại tab Biến thể load tức thì (0 giây)
let variantsCache = null;
let variantsCacheTimestamp = 0;
const CACHE_DURATION = 60000; // Cache 1 phút

export async function loadAllVariantsData() {
  const now = Date.now();
  if (variantsCache && (now - variantsCacheTimestamp < CACHE_DURATION)) {
    return variantsCache;
  }

  const [productRes] = await Promise.all([
    productAPI.getProductsAdmin()
  ]);
  const products = recordsFrom(productRes.data, "products");
  const groups = await loadProductVariants(products);
  const variants = groups.flat();
  const materials = [...new Set(variants.map(variant => variant.material).filter(value => typeof value === "string" && value.trim()))].sort((a, b) => a.localeCompare(b, "vi"));
  
  variantsCache = { variants, products, materials };
  variantsCacheTimestamp = Date.now();
  return variantsCache;
}

// Hàm lọc thuần túy chạy trực tiếp trên RAM (cực kỳ nhanh)
export function filterVariants(variants, products, materials, { search = "", material = "", status = "" } = {}) {
  const query = search.trim().toLocaleLowerCase("vi");
  const rows = variants.filter(variant => {
    const matchSearch = [variant.sku, variant.product?.name, variant.material]
      .some(value => typeof value === "string" && value.toLocaleLowerCase("vi").includes(query));
    return (!query || matchSearch) && (!material || variant.material === material)
      && (!status || variant.isActive === (status === "active"));
  });

  return {
    rows,
    products,
    loaded: variants.length,
    materials,
    totals: { variants: null, products: null, active: null },
  };
}

function requireId(id) {
  if (typeof id !== "string" || !/^[0-9a-fA-F]{24}$/.test(id)) throw new Error("ID không hợp lệ.");
}

export async function getVariantForEdit(id) {
  requireId(id);
  const response = await storageAPI.getVariantById(id);
  const body = response.data;
  const variant = body?.variant ?? body?.data ?? body;
  if (!variant || typeof variant !== "object" || Array.isArray(variant)
    || (variant._id ?? variant.id) !== id || typeof variant.sku !== "string" || !variant.sku.trim()
    || realNumber(variant.price) === null
    || ["color", "size", "material"].some(field => variant[field] != null && typeof variant[field] !== "string")) {
    throw new Error("Chi tiết Variant không đủ hoặc không đúng định dạng để chỉnh sửa.");
  }
  return { sku: variant.sku, price: realNumber(variant.price), color: variant.color ?? "", size: variant.size ?? "", material: variant.material ?? "" };
}

export async function saveVariant({ id, productId, sku, price, color, size, material }) {
  variantsCache = null; // Xóa cache khi thêm/sửa biến thể để cập nhật mới ngay
  requireId(id ?? productId);
  if (typeof sku !== "string" || !sku.trim()) throw new Error("Vui lòng nhập SKU.");
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) throw new Error("Giá phải là số không âm.");
  const payload = { sku, price };
  for (const [field, value] of Object.entries({ color, size, material })) {
    if (value !== undefined) {
      if (typeof value !== "string") throw new Error("Thuộc tính Variant phải là văn bản.");
      payload[field] = value;
    }
  }
  if (id) await storageAPI.updateVariant(id, payload);
  else await productAPI.createVariant(productId, payload);
}

export async function deactivateVariant(id) {
  variantsCache = null; // Xóa cache khi vô hiệu hóa biến thể
  requireId(id);
  await storageAPI.deactivateVariant(id);
}