import { productAPI } from './api';

const getArrayFromResponse = (response, keys = []) => {
  if (Array.isArray(response)) return response;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
  }

  return [];
};

export const loadStorageVariants = async () => {
  const productsResponse = await productAPI.getProducts();
  const products = getArrayFromResponse(productsResponse, ['products', 'data', 'content']);

  const variantGroups = await Promise.all(
    products.map(async (product) => {
      const productId = product._id || product.id;
      if (!productId) return [];

      try {
        const variantsResponse = await productAPI.getProductVariants(productId);
        const variants = getArrayFromResponse(variantsResponse, ['variants', 'data', 'content']);

        return variants.map((variant) => ({
          id: variant.sku || variant._id || variant.id,
          name: product.name,
          specs: [variant.color, variant.size, variant.material].filter(Boolean).join(' - '),
          location: variant.location || null,
          stock: typeof variant.stock === 'number' ? variant.stock : null,
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