import { productAPI, storageAPI } from "../api.js";
import { recordsFrom } from "./variants.service.js";

const validId = (value) => typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);

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

function requiredInventoryInteger(value, fieldName) {
  const parsed = optionalNumber(value, fieldName);
  if (parsed === null || !Number.isSafeInteger(parsed)) {
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
    "lowStockThreshold",
  ].some((field) => Object.prototype.hasOwnProperty.call(rawInventory, field));

  if (!hasInventoryField) {
    throw new Error("Phản hồi Inventory thiếu dữ liệu nhận diện.");
  }

  return {
    ...rawInventory,
    _id: readId(rawInventory),
    variantId: readId(rawInventory.variantId),
    quantity: requiredInventoryInteger(rawInventory.quantity, "Inventory.quantity"),
    lowStockThreshold: requiredInventoryInteger(
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
    if (error && typeof error === "object") error.inventoryDetailSource = "Inventory";
    throw error;
  }
}

async function getRequiredVariant(variantId, productId) {
  try {
    const response = await storageAPI.getVariantById(variantId);
    return { variant: normalizeVariant(unwrapVariant(response.data)), adminFallback: false };
  } catch (error) {
    if (isNotFound(error)) return null;
    if (error?.response?.status === 400 && error?.response?.data?.message === "Product is inactive") {
      if (!validId(productId)) {
        const missingId = new Error("Product đang tạm ngừng; thiếu Product ID hợp lệ để tải Variant qua API Admin.");
        missingId.inventoryDetailSource = "Variant";
        throw missingId;
      }
      try {
        const response = await productAPI.getProductVariantsAdmin(productId);
        const matches = recordsFrom(response.data, "variants").filter(row => readId(row) === variantId);
        if (matches.length !== 1 || readId(matches[0].productId) !== productId) {
          throw new Error("Không xác minh được Variant và Product liên kết từ API Admin.", { cause: error });
        }
        const raw = matches[0];
        if (typeof raw.sku !== "string" || !raw.sku.trim()
          || !["price", "color", "size", "material", "isActive", "availableStock"]
            .every(field => Object.prototype.hasOwnProperty.call(raw, field))
          || typeof raw.isActive !== "boolean") {
          throw new Error("Phản hồi Variant từ API Admin thiếu dữ liệu cần thiết.", { cause: error });
        }
        const variant = normalizeVariant(raw);
        if (variant.price === null || (variant.availableStock !== null
          && !Number.isSafeInteger(variant.availableStock))) {
          throw new Error("Phản hồi giá hoặc tồn khả dụng của Variant không hợp lệ.", { cause: error });
        }
        return { variant, adminFallback: true };
      } catch (fallbackError) {
        if (fallbackError && typeof fallbackError === "object") fallbackError.inventoryDetailSource = "Variant";
        throw fallbackError;
      }
    }
    if (error && typeof error === "object") error.inventoryDetailSource = "Variant";
    throw error;
  }
}

async function getAdminProduct(productId) {
  try {
    const response = await productAPI.getProductsAdmin();
    const matches = recordsFrom(response.data, "products").filter(row => readId(row) === productId);
    if (matches.length !== 1 || typeof matches[0].name !== "string" || !matches[0].name.trim()) {
      throw new Error("Không xác minh được thông tin Product từ API Admin.");
    }
    return normalizeProduct(matches[0]);
  } catch (error) {
    if (error && typeof error === "object") error.inventoryDetailSource = "Product";
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
    if (error && typeof error === "object") error.inventoryDetailSource = "Product";
    throw error;
  }
}

export async function getInventoryDetail(variantId, productId = null) {
  if (!validId(variantId)) {
    throw new Error("Variant ID không hợp lệ.");
  }

  const normalizedId = variantId;
  const detail = await getRequiredVariant(normalizedId, productId);

  if (!detail) return null;

  const inventory = await getOptionalInventory(normalizedId);
  const product = detail.adminFallback
    ? await getAdminProduct(detail.variant.productId)
    : await getOptionalProduct(detail.variant.productId);
  return { inventory, variant: detail.variant, product };
}
