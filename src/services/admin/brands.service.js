import { brandAPI } from "../api.js";
const normalize = value => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase().trim();
function entity(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error("Phản hồi dữ liệu không đúng định dạng.");
  const raw = item.productCount ?? item.productsCount;
  const count = typeof raw === "number" || (typeof raw === "string" && raw.trim()) ? Number(raw) : null;
  return { ...item, _id: item._id ?? item.id ?? item.brandId, isActive: typeof item.isActive === "boolean" ? item.isActive : null, productCount: count !== null && Number.isInteger(count) && count >= 0 ? count : null };
}
export async function getBrands({ search = "", status = "" } = {}) {
  const response = await brandAPI.getBrandsAdmin();
  const data = response.data;
  const rows = [data, data?.brands, data?.items, data?.data, data?.data?.brands, data?.data?.items].find(Array.isArray);
  if (!rows) throw new Error("Phản hồi danh sách không đúng định dạng.");
  const all = rows.map(entity);
  const query = normalize(search);
  // Chưa xác minh tập đầy đủ; không cắt trang local hoặc coi số đã tải là tổng hệ thống.
  return { rows: all.filter(item => normalize([item.name, item.description].join(" ")).includes(query) && (!status || item.isActive === (status === "active"))), loaded: all.length };
}
export async function saveBrand({ id, name, description = "" }) {
  if (typeof name !== "string" || !name.trim()) throw new Error("Tên không được để trống.");
  if (typeof description !== "string") throw new Error("Mô tả phải là văn bản.");
  // Chỉ gửi hai field đã xác nhận, không gửi status hoặc field thuộc thiết kế chưa có contract.
  const payload = { name: name.trim(), description: description.trim() };
  const response = id != null ? await brandAPI.updateBrand(id, payload) : await brandAPI.createBrand(payload);
  return response.data;
}
export async function getBrandById(id) {
  const response = await brandAPI.getBrandById(id);
  return entity(response.data?.brand ?? response.data?.data ?? response.data);
}
// Giữ endpoint hiện có; UI chưa kích hoạt khi nghiệp vụ ngừng sử dụng chưa được xác nhận.
export async function deactivateBrand(id) {
  const response = await brandAPI.deactivateBrand(id);
  return response.data;
}
