import api from "../api.js";

export async function getVariants(params = {}) {
  try {
    // Gọi API lấy danh sách variant theo cấu trúc hệ thống
    const response = await api.get("/api/products/admin"); // Hoặc endpoint variant tương ứng từ database
    const products = response.data?.products ?? response.data ?? [];
    
    // Tổng hợp tất cả variants từ danh sách sản phẩm trả về từ DB
    const allVariants = products.flatMap(p => (p.variants || []).map(v => ({
      ...v,
      productId: p._id || p.id,
      product: p
    })));

    return {
      rows: allVariants,
      total: allVariants.length,
      totals: {
        variants: allVariants.length,
        products: products.length,
        active: allVariants.filter(v => v.isActive !== false).length
      },
      materials: [...new Set(allVariants.map(v => v.material).filter(Boolean))]
    };
  } catch (error) {
    console.error("Lỗi khi tải danh sách SKU từ Database:", error);
    throw error;
  }
}