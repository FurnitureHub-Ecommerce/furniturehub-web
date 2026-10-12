import { productAPI } from "../api.js";

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
    loaded: variants.length,
    materials: [...new Set(variants.map(variant => variant.material).filter(value => typeof value === "string" && value.trim()))].sort((a, b) => a.localeCompare(b, "vi")),
    // Chưa xác minh pagination của Product/Variant API, không coi tập đã tải là toàn hệ thống.
    totals: { variants: null, products: null, active: null },
  };
}
