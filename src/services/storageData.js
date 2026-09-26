import { storageAPI } from './api';

const getArrayFromResponse = (response, keys = []) => {
  if (Array.isArray(response)) return response;
  const actualData = response?.data !== undefined ? response.data : response;
  if (Array.isArray(actualData)) return actualData;

  for (const key of keys) {
    if (Array.isArray(actualData?.[key])) return actualData[key];
    if (Array.isArray(actualData?.data?.[key])) return actualData.data[key];
  }

  return [];
};

const getVariantLabel = (variant) =>
  [variant?.color, variant?.size, variant?.material].filter(Boolean).join(' - ') || 'Tiêu chuẩn';

export const loadStorageVariants = async () => {
  let productsResponse;
  try {
    // 1. Đảo ngược lại: Ưu tiên gọi api thông thường trước để tránh dính lỗi 403 của tài khoản STORAGE
    productsResponse = await storageAPI.getProducts();
  } catch (error) {
    try {
      productsResponse = await storageAPI.getProductsAdmin();
    } catch (err) {
      productsResponse = [];
    }
  }

  const products = getArrayFromResponse(productsResponse, ['products', 'data', 'content']);

  const variantGroups = await Promise.all(
    products.map(async (product) => {
      const productId = product._id || product.id;
      if (!productId) return [];

      try {
        let variantsResponse;
        try {
          // 2. Ưu tiên gọi biến thể thông thường trước
          variantsResponse = await storageAPI.getVariantsByProduct(productId);
        } catch (error) {
          variantsResponse = await storageAPI.getVariantsAdmin(productId);
        }

        const variants = getArrayFromResponse(variantsResponse, ['variants', 'data', 'content']);

        return variants.map((variant) => ({
          id: variant.sku || variant._id || variant.id,
          productId,
          name: product.name || 'Sản phẩm chưa đặt tên',
          specs: getVariantLabel(variant),
          location: variant.location || variant.inventory?.location || 'Kho chính',
          stock: Number(
            variant.stock ??
            variant.stockQuantity ??
            variant.quantity ??
            variant.inventory?.quantity ??
            variant.inventory?.stock ??
            variant.inventory?.availableStock ??
            0
          ),
          price: variant.price || 0,
        }));
      } catch (error) {
        console.error(`Lỗi lấy biến thể của sản phẩm ${product.name}:`, error);
        return [];
      }
    })
  );

  return variantGroups.flat();
};