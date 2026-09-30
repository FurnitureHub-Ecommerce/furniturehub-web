import { brandAPI } from "../api.js";

const normalize = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();

function recordsFrom(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.brands)) return data.brands;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.brands)) return data.data.brands;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  return [];
}

function normalizeBrand(brand) {
  return {
    ...brand,
    _id: brand._id ?? brand.id ?? brand.brandId,
    isActive: brand.isActive ?? brand.status === "active",
    productCount: Number(brand.productCount ?? brand.productsCount ?? 0),
  };
}

export async function getBrands({ search = "", status = "", page = 1, pageSize = 5 } = {}) {
  const response = await brandAPI.getBrandsAdmin();
  const all = recordsFrom(response.data).map(normalizeBrand);
  const query = normalize(search);
  const rows = all.filter(
    (brand) =>
      normalize(`${brand.name ?? ""} ${brand.description ?? ""}`).includes(query) &&
      (!status || brand.isActive === (status === "active")),
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
    featured: all[0] ?? null,
    totals: {
      brands: all.length,
      active: all.filter((brand) => brand.isActive).length,
      products: all.reduce((sum, brand) => sum + brand.productCount, 0),
    },
  };
}

export async function saveBrand({ id, name, description = "", isActive = true }) {
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Tên thương hiệu không được để trống.");
  }
  const payload = { name: name.trim(), description: description.trim(), isActive };
  const response = id
    ? await brandAPI.updateBrand(id, payload)
    : await brandAPI.createBrand(payload);
  return normalizeBrand(response.data?.brand ?? response.data?.data ?? response.data);
}

export async function getBrandById(id) {
  const response = await brandAPI.getBrandById(id);
  return normalizeBrand(response.data?.brand ?? response.data?.data ?? response.data);
}

export async function deactivateBrand(id) {
  const response = await brandAPI.deactivateBrand(id);
  return response.data;
}