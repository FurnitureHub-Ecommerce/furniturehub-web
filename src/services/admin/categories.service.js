import { categoriesMock, productsMock } from '../../data/mock/admin/catalog.mock.js';

const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();

export async function getCategories({ search = '', status = '', page = 1, pageSize = 5 } = {}) {
  if (![5, 10, 20].includes(Number(pageSize)) || (status && !['active', 'inactive'].includes(status))) throw new Error('Bộ lọc danh mục không hợp lệ.');
  const query = normalize(search);
  const rows = categoriesMock.filter(item => normalize(`${item.name} ${item.description}`).includes(query) && (!status || item.isActive === (status === 'active'))).map(item => ({ ...item, productCount: productsMock.filter(product => product.categoryId === item._id).length }));
  const totalPages = Math.max(1, Math.ceil(rows.length / Number(pageSize)));
  const currentPage = Math.min(totalPages, Math.max(1, Number.isFinite(Number(page)) ? Math.floor(Number(page)) : 1));
  return structuredClone({ rows: rows.slice((currentPage - 1) * pageSize, currentPage * pageSize), total: rows.length, page: currentPage, pageSize: Number(pageSize), totalPages,
    totals: { categories: categoriesMock.length, active: categoriesMock.filter(item => item.isActive).length, products: productsMock.filter(product => categoriesMock.some(category => category._id === product.categoryId)).length },
  });
}

export async function saveCategory({ id, name, description, isActive }) {
  if (typeof name !== 'string' || !name.trim()) throw new Error('Tên danh mục không được để trống.');
  if (typeof description !== 'string' || typeof isActive !== 'boolean') throw new Error('Thông tin danh mục không hợp lệ.');
  const index = id ? categoriesMock.findIndex(item => item._id === id) : -1;
  if (id && index === -1) throw new Error('Danh mục không còn tồn tại. Hãy tải lại danh sách.');
  const now = new Date().toISOString();
  // Cập nhật chính nguồn mà Catalog đọc; chỉ tồn tại trong bộ nhớ của phiên trình duyệt.
  // Không kiểm tra trùng trên server, không lưu slug/banner và không đổi Product liên quan.
  const record = { ...(index >= 0 ? categoriesMock[index] : { _id: `category-${globalThis.crypto.randomUUID()}`, createdAt: now }), name: name.trim(), description: description.trim(), isActive, updatedAt: now };
  if (index >= 0) categoriesMock[index] = record;
  else categoriesMock.push(record);
  return structuredClone(record);
}
