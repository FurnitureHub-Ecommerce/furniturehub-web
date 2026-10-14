import { storageAPI } from "../api.js";

export async function getInventory(params = {}) {
  const response = await storageAPI.getInventory(params);
  return response.data;
}

export async function getLowStock(params = {}) {
  const response = await storageAPI.getLowStock(params);
  return response.data;
}

export async function getInventoryTransactions(params = {}) {
  const response = await storageAPI.getInventoryTransactions(params);
  return response.data;
}

const objectId = /^[0-9a-fA-F]{24}$/;
const transactionTypes = new Set(["IMPORT", "EXPORT", "ADJUSTMENT", "DEDUCTION", "RESTORE"]);

function pageQuery({ page = 1, limit = 10, variantId = "" } = {}) {
  if (!Number.isInteger(page) || page < 1 || page > 1000000) throw new Error("Trang phải từ 1 đến 1000000.");
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("Số dòng mỗi trang phải từ 1 đến 100.");
  if (variantId && !objectId.test(variantId)) throw new Error("Variant ID phải gồm 24 ký tự hex.");
  return { page, limit, ...(variantId ? { variantId } : {}) };
}

function pagination(body, key) {
  if (!body || typeof body !== "object" || !Array.isArray(body[key]) || !body.pagination) {
    throw new Error("Phản hồi Inventory thiếu danh sách hoặc pagination.");
  }
  const meta = body.pagination;
  for (const field of ["page", "limit", "totalItems", "totalPages"]) {
    if (!Number.isInteger(meta[field]) || meta[field] < (field === "page" || field === "limit" ? 1 : 0)) {
      throw new Error(`Phản hồi Inventory thiếu pagination.${field} hợp lệ.`);
    }
  }
  return meta;
}

export async function getAdminLowStock({ sku = "", ...query } = {}) {
  const params = pageQuery(query);
  const trimmedSku = sku.trim();
  if (trimmedSku.length > 200) throw new Error("SKU không được vượt quá 200 ký tự.");
  if (trimmedSku) params.sku = trimmedSku;
  const body = await getLowStock(params);
  const meta = pagination(body, "inventories");
  for (const row of body.inventories) {
    if (!row || typeof row !== "object" || !Number.isInteger(row.quantity) || row.quantity < 0
      || !Number.isInteger(row.lowStockThreshold) || row.lowStockThreshold < 0) {
      throw new Error("Phản hồi Low Stock có bản ghi không hợp lệ.");
    }
  }
  return { rows: body.inventories, pagination: meta };
}

function dateTime(value, name) {
  if (!value) return "";
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/i.test(value)
    || !Number.isFinite(Date.parse(value))) throw new Error(`${name} phải là thời gian ISO 8601 có múi giờ.`);
  return value;
}

export async function getAdminTransactions({ type = "", from = "", to = "", ...query } = {}) {
  const params = pageQuery(query);
  if (type && !transactionTypes.has(type)) throw new Error("Loại biến động không hợp lệ.");
  if (type) params.type = type;
  const fromValue = dateTime(from, "Mốc bắt đầu");
  const toValue = dateTime(to, "Mốc kết thúc");
  if (fromValue && toValue && Date.parse(fromValue) > Date.parse(toValue)) throw new Error("Mốc bắt đầu phải trước hoặc bằng mốc kết thúc.");
  if (fromValue) params.from = fromValue;
  if (toValue) params.to = toValue;
  const body = await getInventoryTransactions(params);
  const meta = pagination(body, "transactions");
  for (const row of body.transactions) {
    if (!row || typeof row !== "object" || !transactionTypes.has(row.type)
      || !Number.isInteger(row.quantity) || row.quantity < 0
      || !Number.isInteger(row.beforeQuantity) || row.beforeQuantity < 0
      || !Number.isInteger(row.afterQuantity) || row.afterQuantity < 0
      || typeof row.createdAt !== "string" || !Number.isFinite(Date.parse(row.createdAt))) {
      throw new Error("Phản hồi lịch sử kho có bản ghi không hợp lệ.");
    }
  }
  return { rows: body.transactions, pagination: meta };
}

