import { variantsMock, productsMock, categoriesMock } from '../../data/mock/admin/catalog.mock.js';

const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();

export async function getVariants({ search = '', material = '', minPrice = '', maxPrice = '', status = '', page = 1, pageSize = 10 } = {}) {
  const materials = [...new Set(variantsMock.map(item => item.material))].sort((a, b) => a.localeCompare(b, 'vi'));
  const lower = minPrice === '' ? null : Number(minPrice);
  const upper = maxPrice === '' ? null : Number(maxPrice);
  if ([lower, upper].some(value => value !== null && (!Number.isFinite(value) || value < 0)) || (lower !== null && upper !== null && lower > upper)) throw new Error('Giá phải là số không âm; giá tối thiểu không được lớn hơn giá tối đa.');
  if (![5, 10, 20].includes(Number(pageSize)) || (status && !['active', 'inactive'].includes(status)) || (material && !materials.includes(material))) throw new Error('Bộ lọc Variant không hợp lệ.');
  const query = normalize(search);
  // Thông tin sản phẩm và danh mục chỉ được ghép cho hiển thị, không ghi thêm vào schema.
  const rows = variantsMock.map(variant => {
    const product = productsMock.find(item => item._id === variant.productId);
    return { ...variant, product, category: categoriesMock.find(item => item._id === product?.categoryId) };
  }).filter(item => normalize([item.sku, item.product?.name ?? '', item.material].join(' ')).includes(query)
    && (!material || item.material === material)
    && (lower === null || item.price >= lower) && (upper === null || item.price <= upper)
    && (!status || item.isActive === (status === 'active')));
  const size = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(rows.length / size));
  const currentPage = Math.min(totalPages, Math.max(1, Number.isFinite(Number(page)) ? Math.floor(Number(page)) : 1));
  return structuredClone({
    rows: rows.slice((currentPage - 1) * size, currentPage * size), total: rows.length, page: currentPage, pageSize: size, totalPages, materials,
    // KPI toàn danh sách không thay đổi khi người dùng lọc hoặc phân trang.
    totals: { variants: variantsMock.length, active: variantsMock.filter(item => item.isActive).length, products: new Set(variantsMock.map(item => item.productId)).size },
  });
}
