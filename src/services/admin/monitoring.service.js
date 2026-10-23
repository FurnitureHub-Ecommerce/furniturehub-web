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

function optionalText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeOrderItem(item, orderIndex, itemIndex) {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return {
      itemId: `item-${itemIndex}`,
      variantId: null,
      productName: "Sản phẩm",
      sku: null,
      color: null,
      size: null,
      material: null,
      quantity: 1,
      unitPrice: 0,
      itemSubtotal: 0,
    };
  }

  return {
    itemId: readId(item) || `item-${itemIndex}`,
    variantId: readId(item.variantId) || readId(item.variant),
    productName: optionalText(item.productName) || optionalText(item.name) || "Sản phẩm",
    sku: optionalText(item.sku),
    color: optionalText(item.color),
    size: optionalText(item.size),
    material: optionalText(item.material),
    quantity: Number(item.quantity) || 1,
    unitPrice: Number(item.unitPrice) || 0,
    itemSubtotal: Number(item.itemSubtotal) || Number(item.subtotal) || 0,
  };
}

function normalizeOrder(order, index) {
  if (!order || typeof order !== "object" || Array.isArray(order)) {
    return null;
  }

  const orderId = readId(order);
  if (!orderId) {
    return null; // Bỏ qua đơn hàng thiếu ID thay vì làm văng lỗi cả trang
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const shippingAddress = order.shippingAddress && typeof order.shippingAddress === "object" ? order.shippingAddress : {};

  return {
    orderId,
    userId: readId(order.userId),
    status: order.status || "pending",
    items: items.map((item, itemIndex) => normalizeOrderItem(item, index, itemIndex)),
    subtotal: Number(order.subtotal) || 0,
    totalAmount: Number(order.totalAmount) || Number(order.total) || 0,
    shippingAddress: {
      receiverName: optionalText(shippingAddress.receiverName) || optionalText(order.receiverName) || "Khách hàng",
      phone: optionalText(shippingAddress.phone) || optionalText(order.phone) || "",
      addressLine: optionalText(shippingAddress.addressLine) || optionalText(order.address) || "",
      ward: optionalText(shippingAddress.ward) || "",
      city: optionalText(shippingAddress.city) || "",
    },
    createdAt: order.createdAt || new Date().toISOString(),
    updatedAt: order.updatedAt || new Date().toISOString(),
  };
}

function normalizeOrderResponse(body) {
  let rawOrders = [];
  let paginationData = { page: 1, limit: 10, totalItems: 0, totalPages: 1 };

  if (Array.isArray(body)) {
    rawOrders = body;
    paginationData.totalItems = body.length;
  } else if (body && typeof body === "object") {
    if (Array.isArray(body.orders)) {
      rawOrders = body.orders;
    } else if (Array.isArray(body.data)) {
      rawOrders = body.data;
    }

    if (body.pagination && typeof body.pagination === "object") {
      paginationData = {
        page: Number(body.pagination.page) || 1,
        limit: Number(body.pagination.limit) || 10,
        totalItems: Number(body.pagination.totalItems) || rawOrders.length,
        totalPages: Number(body.pagination.totalPages) || 1,
      };
    }
  }

  const orders = rawOrders
    .map((order, index) => normalizeOrder(order, index))
    .filter(Boolean);

  return {
    orders,
    pagination: {
      ...paginationData,
      totalItems: paginationData.totalItems || orders.length,
    },
  };
}

export async function getOrderMonitoring({ page = 1, limit = 10, status = "" }) {
  const safePage = Number(page) || 1;
  const safeLimit = Number(limit) || 10;

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
  
  const rawInventories = Array.isArray(body.inventories) 
    ? body.inventories 
    : Array.isArray(body.data) 
      ? body.data 
      : [];

  const pagination = {
    page: Number(body.pagination?.page) || 1,
    limit: Number(body.pagination?.limit) || 10,
    totalItems: Number(body.pagination?.totalItems) || rawInventories.length,
    totalPages: Number(body.pagination?.totalPages) || 1,
  };

  return {
    rows: rawInventories.map((row, index) => normalizeInventoryRow(row, index)),
    pagination,
  };
}

function normalizeInventoryRow(row, index) {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    return {
      inventoryId: `inv-${index}`,
      variantId: null,
      productId: null,
      sku: null,
      productName: "Sản phẩm",
      material: null,
      color: null,
      size: null,
      quantity: 0,
      lowStockThreshold: 0,
      isLowStock: false,
      createdAt: null,
      updatedAt: null,
    };
  }

  const inventoryId = readId(row) || `inv-${index}`;
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
      
  const quantity = Number(row.quantity) || 0;
  const lowStockThreshold = Number(row.lowStockThreshold) || 0;

  return {
    inventoryId,
    variantId,
    productId: readId(populatedVariant?.productId),
    sku: populatedVariant?.sku ?? null,
    productName: product?.name ?? null,
    material: populatedVariant?.material ?? null,
    color: populatedVariant?.color ?? null,
    size: populatedVariant?.size ?? null,
    quantity,
    lowStockThreshold,
    isLowStock: quantity <= lowStockThreshold,
    createdAt: row.createdAt ?? null,
    updatedAt: row.updatedAt ?? null,
  };
}

export async function getInventoryMonitoring({ page = 1, limit = 10 } = {}) {
  const safePage = Number(page) || 1;
  const safeLimit = Number(limit) || 10;

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
  throw new Error(
    "Chưa tích hợp dữ liệu đơn hàng cho Admin. Inventory API không cung cấp Order.",
  );
}