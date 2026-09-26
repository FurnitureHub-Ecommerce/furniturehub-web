import { brandsMock, productsMock } from '../../data/mock/admin/catalog.mock.js';

const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();

export async function getBrands({ search = '', status = '', page = 1, pageSize = 5 } = {}) {
  if (![5, 10, 20].includes(Number(pageSize)) || (status && !['active', 'inactive'].includes(status))) throw new Error('Bộ lọc thương hiệu không hợp lệ.');
  const all = brandsMock.map(brand => ({ ...brand, productCount: productsMock.filter(product => product.brandId === brand._id).length }));
  const query = normalize(search);
  const rows = all.filter(brand => normalize(`${brand.name} ${brand.description}`).includes(query) && (!status || brand.isActive === (status === 'active')));
  const size = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(rows.length / size));
  const currentPage = Math.min(totalPages, Math.max(1, Number.isFinite(Number(page)) ? Math.floor(Number(page)) : 1));
  return structuredClone({ rows: rows.slice((currentPage - 1) * size, currentPage * size), total: rows.length, page: currentPage, pageSize: size, totalPages,
    featured: all.find(brand => brand._id === 'brand-tuscany') ?? all[0] ?? null,
    totals: { brands: all.length, active: all.filter(brand => brand.isActive).length, products: all.reduce((sum, brand) => sum + brand.productCount, 0) },
  });
}

export async function saveBrand({ id, name, description, isActive }) {
  if (typeof name !== 'string' || !name.trim()) throw new Error('Tên thương hiệu không được để trống.');
  if (typeof description !== 'string' || typeof isActive !== 'boolean') throw new Error('Thông tin thương hiệu không hợp lệ.');
  const index = id ? brandsMock.findIndex(brand => brand._id === id) : -1;
  if (id && index < 0) throw new Error('Thương hiệu không còn tồn tại. Hãy tải lại danh sách.');
  const now = new Date().toISOString();
  // Dùng chính mảng Catalog đang đọc; giữ logo, ID và ngày tạo khi sửa.
  // Chỉ lưu trong bộ nhớ, không kiểm tra trùng trên Backend và không đổi Product liên quan.
  const record = { ...(index >= 0 ? brandsMock[index] : { _id: `brand-${globalThis.crypto.randomUUID()}`, logo: '', createdAt: now }), name: name.trim(), description: description.trim(), isActive, updatedAt: now };
  if (index >= 0) brandsMock[index] = record;
  else brandsMock.push(record);
  return structuredClone(record);
}
