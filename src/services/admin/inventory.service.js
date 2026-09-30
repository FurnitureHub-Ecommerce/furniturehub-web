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

