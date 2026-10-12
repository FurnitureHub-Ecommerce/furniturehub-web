import { brandAPI, categoryAPI, productAPI } from "../api.js";
import { recordsFrom, entityId, activeState, loadProductVariants } from "./variants.service.js";

const normalize = value => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase().trim();

export async function getCatalog({ search = "", categoryId = "", brandId = "", material = "", status = "" } = {}) {
  const [productsResponse, categoriesResponse, brandsResponse] = await Promise.all([
    productAPI.getProductsAdmin(), categoryAPI.getCategoriesAdmin(), brandAPI.getBrandsAdmin(),
  ]);
  const categories = recordsFrom(categoriesResponse.data, "categories").map(category => ({ ...category, _id: entityId(category) }));
  const brands = recordsFrom(brandsResponse.data, "brands").map(brand => ({ ...brand, _id: entityId(brand) }));
  const records = recordsFrom(productsResponse.data, "products").map(product => ({
    ...product, _id: entityId(product),
    categoryId: entityId(product.categoryId ?? product.category),
    brandId: entityId(product.brandId ?? product.brand),
    isActive: activeState(product),
  }));
  const groups = await loadProductVariants(records);
  const products = records.map((product, index) => {
    const variants = groups[index];
    const prices = variants.map(variant => variant.price).filter(value => value !== null);
    return {
      ...product, variants,
      category: categories.find(category => category._id === product.categoryId) ?? (typeof product.category === "object" ? product.category : null),
      brand: brands.find(brand => brand._id === product.brandId) ?? (typeof product.brand === "object" ? product.brand : null),
      // Không trình bày khoảng giá hoàn chỉnh khi một Variant còn thiếu giá.
      priceRange: prices.length && prices.length === variants.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null,
    };
  });
  const query = normalize(search);
  const rows = products.filter(product => normalize([product.name, product.description, product.category?.name, product.brand?.name, ...product.variants.map(variant => variant.sku)].join(" ")).includes(query)
    && (!categoryId || product.categoryId === categoryId)
    && (!brandId || product.brandId === brandId)
    && (!material || product.variants.some(variant => variant.material === material))
    && (!status || product.isActive === (status === "active")));
  return {
    rows, loaded: products.length, categories, brands,
    materials: [...new Set(products.flatMap(product => product.variants.map(variant => variant.material)).filter(value => typeof value === "string" && value.trim()))].sort((a, b) => a.localeCompare(b, "vi")),
    totals: { products: null, variants: null, brands: null, averagePrice: null },
  };
}

export async function saveProduct({ id, ...productData }) {
  const response = id ? await productAPI.updateProduct(id, productData) : await productAPI.createProduct(productData);
  return response.data?.product ?? response.data?.data ?? response.data;
}

export async function deactivateProduct(id) {
  const response = await productAPI.deactivateProduct(id);
  return response.data;
}
