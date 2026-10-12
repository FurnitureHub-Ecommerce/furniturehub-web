import { productAPI, storageAPI } from "../api.js";

function isNotFound(error) {
  return error?.response?.status === 404;
}

function requireEntity(value, entityName) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Phản hồi ${entityName} không hợp lệ.`);
  }
  return value;
}

function optionalNumber(value, fieldName) {
  if (value === undefined || value === null || value === "") return null;

  if (typeof value !== "number" && typeof value !== "string") {
    throw new Error(`Trường ${fieldName} trong phản hồi API không hợp lệ.`);
  }

  const normalized = typeof value === "string" ? value.trim() : value;
  const parsed = Number(normalized);

  if (normalized === "" || !Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Trường ${fieldName} trong phản hồi API không hợp lệ.`);
  }
  return parsed;
}

function readId(value) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (!value || typeof value !== "object") return null;

  const candidate = value._id ?? value.id;
  return typeof candidate === "string" && candidate.trim()
    ? candidate.trim()
    : null;
}

function unwrapInventory(body) {
  return requireEntity(body?.inventory ?? body, "Inventory");
}

function unwrapVariant(body) {
  return requireEntity(body?.variant ?? body?.data ?? body, "Variant");
}

function unwrapProduct(body) {
  return requireEntity(body?.product ?? body?.data ?? body, "Product");
}

function normalizeInventory(rawInventory) {
  const hasInventoryField = [
    "_id",
    "id",
    "variantId",
    "quantity",
    "availableStock",
    "lowStockThreshold",
  ].some((field) => Object.prototype.hasOwnProperty.call(rawInventory, field));

  if (!hasInventoryField) {
    throw new Error("Phản hồi Inventory thiếu dữ liệu nhận diện.");
  }

  return {
    ...rawInventory,
    _id: readId(rawInventory),
    variantId: readId(rawInventory.variantId),
    quantity: optionalNumber(rawInventory.quantity, "Inventory.quantity"),
    availableStock: optionalNumber(rawInventory.availableStock, "Inventory.availableStock"),
    lowStockThreshold: optionalNumber(
      rawInventory.lowStockThreshold,
      "Inventory.lowStockThreshold",
    ),
  };
}

function normalizeVariant(rawVariant) {
  const id = readId(rawVariant);
  if (!id) throw new Error("Phản hồi Variant thiếu ID hợp lệ.");

  return {
    ...rawVariant,
    _id: id,
    productId: readId(rawVariant.productId) ?? readId(rawVariant.product),
    price: optionalNumber(rawVariant.price, "Variant.price"),
    availableStock: optionalNumber(rawVariant.availableStock, "Variant.availableStock"),
  };
}

function normalizeProduct(rawProduct) {
  const id = readId(rawProduct);
  if (!id) throw new Error("Phản hồi Product thiếu ID hợp lệ.");
  return { ...rawProduct, _id: id };
}

async function getOptionalInventory(variantId) {
  try {
    const response = await storageAPI.getInventoryByVariantId(variantId);
    return normalizeInventory(unwrapInventory(response.data));
  } catch (error) {
    // Inventory chưa được tạo không làm mất khả năng xem thông tin Variant.
    if (isNotFound(error)) return null;
    throw error;
  }
}

async function getRequiredVariant(variantId) {
  try {
    const response = await storageAPI.getVariantById(variantId);
    return normalizeVariant(unwrapVariant(response.data));
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

async function getOptionalProduct(productId) {
  if (!productId) return null;

  try {
    const response = await productAPI.getProductById(productId);
    return normalizeProduct(unwrapProduct(response.data));
  } catch (error) {
    // Product bị xóa không biến một Variant hợp lệ thành trạng thái không tìm thấy.
    if (isNotFound(error)) return null;
    throw error;
  }
}

export async function getInventoryDetail(variantId) {
  if (typeof variantId !== "string" || !variantId.trim()) {
    throw new Error("Variant ID không hợp lệ.");
  }

  const normalizedId = variantId.trim();
  const inventory = await getOptionalInventory(normalizedId);
  const variant = await getRequiredVariant(normalizedId);

  if (!variant) return null;

  const product = await getOptionalProduct(variant.productId);
  return { inventory, variant, product };
}
