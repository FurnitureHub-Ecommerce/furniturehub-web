import { variantsMock, productsMock } from '../../data/mock/admin/catalog.mock.js';

export async function getInventoryDetail(variantId) {
  // Định danh bằng _id, không thay bằng SKU hoặc tự chọn bản ghi mẫu.
  const variant = variantsMock.find(item => item._id === variantId);
  if (!variant) return null;
  const product = productsMock.find(item => item._id === variant.productId);
  // Chỉ trả thông tin Catalog; chưa có nguồn tồn kho hay lịch sử biến động.
  return structuredClone({ variant, product: product ?? null });
}
