import { orderAPI, storageAPI } from "../api.js";

const ORDER_STATUSES = new Set([
  "pending",
  "confirmed",
  "rejected",
  "cancelled",
]);

function readId(value) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const candidate = value._id ?? value.id;
  return typeof candidate === "string" && candidate.trim()
    ? candidate.trim()
    : null;
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

function requiredNumber(value, fieldName) {
  const parsed = optionalNumber(value, fieldName);
  if (parsed === null) {
    throw new Error(`Trường ${fieldName} trong phản hồi API đang bị thiếu.`);
  }
  return parsed;
}

function requiredInteger(value, fieldName, minimum) {
  const parsed = requiredNumber(value, fieldName);
  if (!Number.isSafeInteger(parsed) || parsed < minimum) {
    throw new Error(`Trường ${fieldName} trong phản hồi API không hợp lệ.`);
  }
  return parsed;
}

function optionalText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function requiredDate(value, fieldName) {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    Number.isNaN(Date.parse(value))
  ) {
    throw new Error(`Trường ${fieldName} trong phản hồi API không hợp lệ.`);
  }
  return value;
}

function normalizeOrderItem(item, orderIndex, itemIndex) {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    throw new Error(
      `Item thứ ${itemIndex + 1} của Order thứ ${orderIndex + 1} không hợp lệ.`,
    );
  }

  const itemId = readId(item);
  const variantId = readId(item.variantId);
  if (!itemId || !variantId) {
    throw new Error(
      `Item thứ ${itemIndex + 1} của Order thứ ${orderIndex + 1} thiếu ID hợp lệ.`,
    );
  }

  return {
    itemId,
    variantId,
    productName: optionalText(item.productName),
    sku: optionalText(item.sku),
    color: optionalText(item.color),
    size: optionalText(item.size),
    material: optionalText(item.material),
    quantity: requiredInteger(
      item.quantity,
      `orders[${orderIndex}].items[${itemIndex}].quantity`,
      1,
    ),
    unitPrice: requiredNumber(
      item.unitPrice,
      `orders[${orderIndex}].items[${itemIndex}].unitPrice`,
    ),
    itemSubtotal: requiredNumber(
      item.itemSubtotal,
      `orders[${orderIndex}].items[${itemIndex}].itemSubtotal`,
    ),
  };
}

function normalizeOrder(order, index) {
  if (!order || typeof order !== "object" || Array.isArray(order)) {
    throw new Error(`Order thứ ${index + 1} không hợp lệ.`);
  }

  const orderId = readId(order);
  if (!orderId || !ORDER_STATUSES.has(order.status)) {
    throw new Error(`Order thứ ${index + 1} thiếu ID hoặc status hợp lệ.`);
  }
  if (!Array.isArray(order.items)) {
    throw new Error(`Trường orders[${index}].items không hợp lệ.`);
  }
  if (
    !order.shippingAddress ||
    typeof order.shippingAddress !== "object" ||
    Array.isArray(order.shippingAddress)
  ) {
    throw new Error(`Trường orders[${index}].shippingAddress không hợp lệ.`);
  }

  return {
    orderId,
    userId: readId(order.userId),
    status: order.status,
    items: order.items.map((item, itemIndex) =>
      normalizeOrderItem(item, index, itemIndex),
    ),
    subtotal: requiredNumber(order.subtotal, `orders[${index}].subtotal`),
    totalAmount: requiredNumber(
      order.totalAmount,
      `orders[${index}].totalAmount`,
    ),
    shippingAddress: {
      receiverName: optionalText(order.shippingAddress.receiverName),
      phone: optionalText(order.shippingAddress.phone),
      addressLine: optionalText(order.shippingAddress.addressLine),
      ward: optionalText(order.shippingAddress.ward),
      city: optionalText(order.shippingAddress.city),
    },
    createdAt: requiredDate(order.createdAt, `orders[${index}].createdAt`),
    updatedAt: requiredDate(order.updatedAt, `orders[${index}].updatedAt`),
  };
}

function normalizeOrderResponse(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Phản hồi danh sách Order không hợp lệ.");
  }
  if (!Array.isArray(body.orders)) {
    throw new Error("Không tìm thấy danh sách orders trong phản hồi API.");
  }
  if (
    !body.pagination ||
    typeof body.pagination !== "object" ||
    Array.isArray(body.pagination)
  ) {
    throw new Error("Pagination của Order API không hợp lệ.");
  }

  const pagination = {
    page: requiredInteger(body.pagination.page, "pagination.page", 1),
    limit: requiredInteger(body.pagination.limit, "pagination.limit", 1),
    totalItems: requiredInteger(
      body.pagination.totalItems,
      "pagination.totalItems",
      0,
    ),
    totalPages: requiredInteger(
      body.pagination.totalPages,
      "pagination.totalPages",
      0,
    ),
  };

  if (pagination.limit > 100) {
    throw new Error("Trường pagination.limit vượt quá giới hạn API.");
  }

  return {
    orders: body.orders.map(normalizeOrder),
    pagination,
  };
}

export async function getOrderMonitoring({ page = 1, limit = 10, status = "" }) {
  const safePage = requiredInteger(page, "query.page", 1);
  const safeLimit = requiredInteger(limit, "query.limit", 1);

  if (safeLimit > 100) {
    throw new Error("Query limit vượt quá giới hạn API.");
  }
  if (status && !ORDER_STATUSES.has(status)) {
    throw new Error("Query status không được Order API hỗ trợ.");
  }

  const response = await orderAPI.getOrders({
    page: safePage,
    limit: safeLimit,
    ...(status ? { status } : {}),
  });
  return normalizeOrderResponse(response.data);
}

function normalizeInventoryResponse(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Phản hồi danh sách Inventory không hợp lệ.");
  }
  if (!Array.isArray(body.inventories)) {
    throw new Error("Không tìm thấy danh sách inventories trong phản hồi API.");
  }
  if (
    !body.pagination ||
    typeof body.pagination !== "object" ||
    Array.isArray(body.pagination)
  ) {
    throw new Error("Pagination của Inventory API không hợp lệ.");
  }

  const pagination = {
    page: requiredInteger(body.pagination.page, "pagination.page", 1),
    limit: requiredInteger(body.pagination.limit, "pagination.limit", 1),
    totalItems: requiredInteger(
      body.pagination.totalItems,
      "pagination.totalItems",
      0,
    ),
    totalPages: requiredInteger(
      body.pagination.totalPages,
      "pagination.totalPages",
      0,
    ),
  };

  if (pagination.limit > 100) {
    throw new Error("Trường pagination.limit vượt quá giới hạn API.");
  }

  return {
    rows: body.inventories.map(normalizeInventoryRow),
    pagination,
  };
}

function normalizeInventoryRow(row, index) {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    throw new Error(`Bản ghi Inventory thứ ${index + 1} không hợp lệ.`);
  }

  const inventoryId = readId(row);
  if (!inventoryId) {
    throw new Error(`Bản ghi Inventory thứ ${index + 1} thiếu ID hợp lệ.`);
  }

  const populatedVariant =
    row.variantId && typeof row.variantId === "object"
      ? row.variantId
      : row.variant && typeof row.variant === "object"
        ? row.variant
        : null;
  const variantId = readId(row.variantId) ?? readId(row.variant);
  const product =
    populatedVariant?.productId &&
    typeof populatedVariant.productId === "object"
      ? populatedVariant.productId
      : null;
  const quantity = optionalNumber(row.quantity, `Inventory[${index}].quantity`);
  const lowStockThreshold = optionalNumber(
    row.lowStockThreshold,
    `Inventory[${index}].lowStockThreshold`,
  );

  return {
    inventoryId,
    variantId,
    sku: populatedVariant?.sku ?? null,
    productName: product?.name ?? null,
    material: populatedVariant?.material ?? null,
    color: populatedVariant?.color ?? null,
    size: populatedVariant?.size ?? null,
    quantity,
    inventoryAvailableStock: optionalNumber(
      row.availableStock,
      `Inventory[${index}].availableStock`,
    ),
    variantAvailableStock: optionalNumber(
      populatedVariant?.availableStock,
      `Inventory[${index}].variant.availableStock`,
    ),
    lowStockThreshold,
    isLowStock:
      typeof quantity === "number" && typeof lowStockThreshold === "number"
        ? quantity <= lowStockThreshold
        : null,
    createdAt: row.createdAt ?? null,
    updatedAt: row.updatedAt ?? null,
  };
}

export async function getInventoryMonitoring({ page = 1, limit = 10 } = {}) {
  const safePage = requiredInteger(page, "query.page", 1);
  const safeLimit = requiredInteger(limit, "query.limit", 1);

  if (safeLimit > 100) {
    throw new Error("Query limit vượt quá giới hạn API.");
  }

  const response = await storageAPI.getInventory({
    page: safePage,
    limit: safeLimit,
  });
  const normalized = normalizeInventoryResponse(response.data);

  return {
    ...normalized,
    source: "inventory-api",
  };
}

export async function getMonitoring() {
  // Giữ compatibility cho consumer cũ nhưng không chuyển Inventory thành Order.
  throw new Error(
    "Chưa tích hợp dữ liệu đơn hàng cho Admin. Inventory API không cung cấp Order.",
  );
}
