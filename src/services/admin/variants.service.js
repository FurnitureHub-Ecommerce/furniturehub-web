import { productAPI } from "../api.js";

function recordsFrom(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.variants)) return data.variants;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.variants)) return data.data.variants;
  return [];
}

export async function getVariants(params = {}) {
  try {
    // 1. Lấy danh sách sản phẩm admin
    const productsRes = await productAPI.getProductsAdmin();
    const productsData = productsRes?.data?.products ?? productsRes?.data ?? productsRes ?? [];
    const products = Array.isArray(productsData) ? productsData : [];

    // 2. Gọi API /api/products/{productId}/variants/admin cho từng sản phẩm để lấy đúng variant và giá
    const allVariantsPromises = products.map(async (product) => {
      const productId = product._id || product.id;
      if (!productId) return [];

      try {
        const variantRes = await productAPI.getProductVariantsAdmin(productId);
        const variantList = recordsFrom(variantRes?.data);
        
        return variantList.map((v) => ({
          ...v,
          _id: v._id || v.id || v.variantId,
          sku: v.sku || `SKU-${Math.random().toString(36).substring(2, 7)}`,
          // Lấy giá ưu tiên từ variant, nếu không có thì lấy giá của sản phẩm cha
          price: Number(v.price ?? v.salePrice ?? v.unitPrice ?? product.price ?? 0),
          size: v.size || "Standard",
          material: v.material || product.material || "Gỗ/Kim loại",
          color: v.color || "Tiêu chuẩn",
          isActive: v.isActive ?? product.isActive ?? true,
          productId: productId,
          product: product,
        }));
      } catch (err) {
        console.error(`Lỗi tải variant cho sản phẩm ${productId}:`, err);
        // Fallback nếu sản phẩm đã chứa sẵn mảng variants bên trong
        if (Array.isArray(product.variants)) {
          return product.variants.map((v) => ({
            ...v,
            _id: v._id || v.id || v.variantId,
            sku: v.sku || `SKU-${Math.random().toString(36).substring(2, 7)}`,
            price: Number(v.price ?? v.salePrice ?? v.unitPrice ?? product.price ?? 0),
            size: v.size || "Standard",
            material: v.material || product.material || "Gỗ/Kim loại",
            color: v.color || "Tiêu chuẩn",
            isActive: v.isActive ?? product.isActive ?? true,
            productId: productId,
            product: product,
          }));
        }
        return [];
      }
    });

    const nestedVariants = await Promise.all(allVariantsPromises);
    const allVariants = nestedVariants.flat();

    // 3. Lọc dữ liệu theo các tiêu chí (search, material, status)
    const search = (params.search || "").toLowerCase();
    const materialFilter = params.material || "";
    const statusFilter = params.status || "";

    const filtered = allVariants.filter((v) => {
      const matchSearch =
        !search ||
        (v.sku && v.sku.toLowerCase().includes(search)) ||
        (v.product?.name && v.product.name.toLowerCase().includes(search)) ||
        (v.material && v.material.toLowerCase().includes(search));

      const matchMaterial = !materialFilter || v.material === materialFilter;
      const matchStatus =
        !statusFilter || (statusFilter === "active" ? v.isActive !== false : v.isActive === false);

      return matchSearch && matchMaterial && matchStatus;
    });

    return {
      rows: filtered,
      total: filtered.length,
      totals: {
        variants: allVariants.length,
        products: products.length,
        active: allVariants.filter((v) => v.isActive !== false).length,
      },
      materials: [...new Set(allVariants.map((v) => v.material).filter(Boolean))].sort((a, b) => a.localeCompare(b, "vi")),
    };
  } catch (error) {
    console.error("Lỗi khi tải danh sách SKU:", error);
    return { rows: [], total: 0, totals: { variants: 0, products: 0, active: 0 }, materials: [] };
  }
}