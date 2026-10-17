import { productAPI } from "../api.js";

import { storageAPI } from "../api.js";

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
  // null, chuỗi rỗng và boolean không phải giá trị 0 từ Backend.
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

export async function loadProductVariants(products) {
  const result = [];
  // Chia lô hữu hạn để không đồng thời gửi request cho toàn bộ danh sách Product.
  for (let offset = 0; offset < products.length; offset += 4) {
    const batch = await Promise.all(products.slice(offset, offset + 4).map(async product => {
      const productId = entityId(product);
      if (!productId) throw new Error("Product thiếu ID để tải danh sách Variant.");
      const response = await productAPI.getProductVariantsAdmin(productId);
      return recordsFrom(response.data, "variants").map(variant => {
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
    }));
    result.push(...batch);
  }
  return result;
}

export async function getVariants({ search = "", material = "", status = "" } = {}) {
  const response = await productAPI.getProductsAdmin();
  const products = recordsFrom(response.data, "products");
  const groups = await loadProductVariants(products);
  const variants = groups.flat();
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
    materials: [...new Set(variants.map(variant => variant.material).filter(value => typeof value === "string" && value.trim()))].sort((a, b) => a.localeCompare(b, "vi")),
    // Chưa xác minh pagination của Product/Variant API, không coi tập đã tải là toàn hệ thống.
    totals: { variants: null, products: null, active: null },
  };
}

function requireId(id) {
  if (typeof id !== "string" || !/^[0-9a-fA-F]{24}$/.test(id)) throw new Error("ID không hợp lệ.");
}

export async function getVariantForEdit(id) {
  requireId(id);
  const response = await storageAPI.getVariantById(id);
  // Giữ các envelope đã được Inventory Detail hỗ trợ; không coi là contract Swagger.
  const body = response.data;
  const variant = body?.variant ?? body?.data ?? body;
  if (!variant || typeof variant !== "object" || Array.isArray(variant)
    || (variant._id ?? variant.id) !== id || typeof variant.sku !== "string" || !variant.sku.trim()
    || realNumber(variant.price) === null
    || ["color", "size", "material"].some(field => variant[field] != null && typeof variant[field] !== "string")) {
    throw new Error("Chi tiết Variant không đủ hoặc không đúng định dạng để chỉnh sửa. Vui lòng tải lại hoặc liên hệ quản trị.");
  }
  return { sku: variant.sku, price: realNumber(variant.price), color: variant.color ?? "", size: variant.size ?? "", material: variant.material ?? "" };
}

export async function saveVariant({ id, productId, sku, price, color, size, material }) {
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
  // Không đọc success envelope chưa được Swagger mô tả; danh sách sẽ được tải lại.
  if (id) await storageAPI.updateVariant(id, payload);
  else await productAPI.createVariant(productId, payload);
}

export async function deactivateVariant(id) {
  requireId(id);
  await storageAPI.deactivateVariant(id);
}
