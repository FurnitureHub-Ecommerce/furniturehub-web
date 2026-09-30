import { categoryAPI } from "../api.js";

const normalize = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();

function recordsFrom(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.categories)) return data.data.categories;
  return [];
}

function normalizeCategory(category) {
  return {
    ...category,
    _id: category._id ?? category.id ?? category.categoryId,
    isActive: category.isActive ?? category.status === "active",
    productCount: Number(category.productCount ?? category.productsCount ?? 0),
  };
}

export async function getCategories({ search = "", status = "", page = 1, pageSize = 5 } = {}) {
  const response = await categoryAPI.getCategoriesAdmin();
  const all = recordsFrom(response.data).map(normalizeCategory);
  const query = normalize(search);
  
  const rows = all.filter(
    (item) =>
      normalize(`${item.name ?? ""} ${item.description ?? ""}`).includes(query) &&
      (!status || item.isActive === (status === "active")),
  );
  
  const size = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(rows.length / size));
  const currentPage = Math.min(
    totalPages,
    Math.max(1, Number.isFinite(Number(page)) ? Math.floor(Number(page)) : 1),
  );

  return {
    rows: rows.slice((currentPage - 1) * size, currentPage * size),
    total: rows.length,
    page: currentPage,
    pageSize: size,
    totalPages,
    totals: {
      categories: all.length,
      active: all.filter((item) => item.isActive).length,
      products: all.reduce((sum, item) => sum + item.productCount, 0),
    },
  };
}

export async function saveCategory({ id, name, description = "", isActive = true }) {
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Tên danh mục không được để trống.");
  }
  const payload = { name: name.trim(), description: description.trim(), isActive };
  const response = id
    ? await categoryAPI.updateCategory(id, payload)
    : await categoryAPI.createCategory(payload);
  return normalizeCategory(response.data?.category ?? response.data?.data ?? response.data);
}

export async function getCategoryById(id) {
  const response = await categoryAPI.getCategoryById(id);
  return normalizeCategory(response.data?.category ?? response.data?.data ?? response.data);
}

export async function deactivateCategory(id) {
  const response = await categoryAPI.deactivateCategory(id);
  return response.data;
}