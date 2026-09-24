import { productAPI } from './api';

const getArrayFromResponse = (response, keys = []) => {
  if (Array.isArray(response)) return response;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
  }

  return [];
};

const getNumberOrNull = (...values) => {
  const value = values.find((item) => typeof item === 'number');
  return value ?? null;
};

const getVariantLabel = (variant) =>
  [variant.color, variant.size, variant.material].filter(Boolean).join(' - ') || 'Chưa cập nhật';

export const loadStorageVariants = async () => {
  let productsResponse;
  try {
    productsResponse = await productAPI.getProductsAdmin();
  } catch (error) {
    productsResponse = await productAPI.getProducts();
  }

  const products = getArrayFromResponse(productsResponse, ['products', 'data', 'content']);

  const variantGroups = await Promise.all(
    products.map(async (product) => {
      const productId = product._id || product.id;
      if (!productId) return [];

      try {
        let variantsResponse;
        try {
          variantsResponse = await productAPI.getProductVariantsAdmin(productId);
        } catch (error) {
          variantsResponse = await productAPI.getProductVariants(productId);
        }

        const variants = getArrayFromResponse(variantsResponse, ['variants', 'data', 'content']);

        return variants.map((variant) => ({
          id: variant.sku || variant._id || variant.id,
          productId,
          name: product.name || 'Sản phẩm chưa đặt tên',
          specs: getVariantLabel(variant),
          location: variant.location || variant.inventory?.location || null,
          stock: getNumberOrNull(
            variant.stock,
            variant.stockQuantity,
            variant.quantity,
            variant.inventory?.quantity,
            variant.inventory?.stock,
            variant.inventory?.availableStock
          ),
          price: variant.price,
        }));
      } catch (error) {
        console.error(`Lỗi lấy biến thể của sản phẩm ${product.name}:`, error);
        return [];
      }
    })
  );

  return variantGroups.flat();
};