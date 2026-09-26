import { productsMock, variantsMock, categoriesMock, brandsMock } from '../../data/mock/admin/catalog.mock.js';

const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();

export async function getCatalog({ search = '', categoryId = '', brandId = '', material = '', status = '', page = 1, pageSize = 5 } = {}) {
  if (![5, 10, 15].includes(Number(pageSize))) throw new Error('Số sản phẩm mỗi trang không hợp lệ.');
  if (status && !['active', 'inactive'].includes(status)) throw new Error('Trạng thái sản phẩm không hợp lệ.');
  const categories = categoriesMock.map(category => ({ ...category, productCount: productsMock.filter(product => product.categoryId === category._id).length }));
  const brands = brandsMock.map(brand => ({ ...brand, productCount: productsMock.filter(product => product.brandId === brand._id).length }));
  const materials = [...new Set(variantsMock.map(variant => variant.material))].sort((a, b) => a.localeCompare(b, 'vi'));
  if ((categoryId && !categories.some(item => item._id === categoryId)) || (brandId && !brands.some(item => item._id === brandId)) || (material && !materials.includes(material))) throw new Error('Danh mục, thương hiệu hoặc chất liệu không hợp lệ.');
  // Giá và số Variant là dữ liệu tổng hợp cho giao diện, không ghi vào Product mock.
  const products = productsMock.map(product => {
    const variants = variantsMock.filter(variant => variant.productId === product._id);
    const category = categories.find(item => item._id === product.categoryId);
    const brand = brands.find(item => item._id === product.brandId);
    const prices = variants.map(variant => variant.price);
    return { ...product, category, brand, variants, priceRange: prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null };
  });
  const query = normalize(search);
  const filtered = products.filter(product => {
    const text = normalize([product.name, product.description, product.brand.name, product.category.name, ...product.variants.map(variant => variant.sku)].join(' '));
    return text.includes(query) && (!categoryId || product.categoryId === categoryId) && (!brandId || product.brandId === brandId) && (!material || product.variants.some(variant => variant.material === material)) && (!status || product.isActive === (status === 'active'));
  });
  const size = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const currentPage = Math.max(1, Math.min(totalPages, Number.isFinite(Number(page)) ? Math.floor(Number(page)) : 1));
  return structuredClone({
    rows: filtered.slice((currentPage - 1) * size, currentPage * size), total: filtered.length, page: currentPage, pageSize: size, totalPages,
    categories, brands, materials,
    totals: { products: productsMock.length, variants: variantsMock.length, activeVariants: variantsMock.filter(variant => variant.isActive).length, brands: brandsMock.length },
  });
}
