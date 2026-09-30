import { productAPI, storageAPI } from "../api.js";

export async function getInventoryDetail(variantId) {
  const inventoryResponse = await storageAPI.getInventoryByVariantId(variantId);
  const inventory = inventoryResponse.data?.inventory ?? inventoryResponse.data;
  let variant = inventory?.variant ?? inventory?.variantDetails ?? null;

  if (!variant?._id && !variant?.id && !variant?.sku) {
    const variantResponse = await storageAPI.getVariantById(variantId);
    variant = variantResponse.data?.variant ?? variantResponse.data?.data ?? variantResponse.data;
  }

  if (!variant) return null;
  const productId = typeof variant.productId === "object"
    ? variant.productId._id ?? variant.productId.id
    : variant.productId ?? variant.product?._id ?? variant.product?.id;
  let product = variant.product && typeof variant.product === "object" ? variant.product : null;

  if (!product && productId) {
    const productResponse = await productAPI.getProductById(productId);
    product = productResponse.data?.product ?? productResponse.data?.data ?? productResponse.data;
  }

  return { variant: { ...variant, _id: variant._id ?? variant.id ?? variantId, productId }, product, inventory };
}