import { brandAPI, categoryAPI, productAPI } from "../api.js";

const normalize = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();

function recordsFrom(data, keys) {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) return data.data[key];
  }
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

const entityId = (entity) =>
  typeof entity === "object" && entity !== null
    ? entity._id ?? entity.id ?? entity.productId ?? entity.categoryId ?? entity.brandId
    : entity;

function normalizeVariant(variant, productId) {
  return {
    ...variant,
    _id: variant._id ?? variant.id ?? variant.variantId,
    productId: entityId(variant.productId ?? variant.product) ?? productId,
    isActive: variant.isActive ?? variant.status === "active",
    price: Number(variant.price ?? variant.salePrice ?? 0),
  };
}

async function variantsForProduct(product) {
  if (Array.isArray(product.variants)) {
    return product.variants.map((variant) => normalizeVariant(variant, product._id));
  }
  if (!product._id) return [];
  const response = await productAPI.getProductVariantsAdmin(product._id);
  return recordsFrom(response.data, ["variants"]).map((variant) =>
    normalizeVariant(variant, product._id),
  );
}

export async function getCatalog({ search = "", categoryId = "", brandId = "", material = "", status = "", page = 1, pageSize = 5 } = {}) {
  const [productsResponse, categoriesResponse, brandsResponse] = await Promise.all([
    productAPI.getProductsAdmin(),
    categoryAPI.getCategoriesAdmin(),
    brandAPI.getBrandsAdmin(),
  ]);
  const categories = recordsFrom(categoriesResponse.data, ["categories"]).map((category) => ({
    ...category,
    _id: category._id ?? category.id ?? category.categoryId,
    isActive: category.isActive ?? category.status === "active",
  }));
  const brands = recordsFrom(brandsResponse.data, ["brands"]).map((brand) => ({
    ...brand,
    _id: brand._id ?? brand.id ?? brand.brandId,
    isActive: brand.isActive ?? brand.status === "active",
  }));
  const productRecords = recordsFrom(productsResponse.data, ["products"]).map((product) => ({
    ...product,
    _id: product._id ?? product.id ?? product.productId,
    categoryId: entityId(product.categoryId ?? product.category),
    brandId: entityId(product.brandId ?? product.brand),
    isActive: product.isActive ?? product.status === "active",
  }));
  const productsWithVariants = await Promise.all(
    productRecords.map(async (product) => ({
      ...product,
      variants: await variantsForProduct(product),
    })),
  );
  const products = productsWithVariants.map((product) => {
    const category = categories.find((item) => item._id === product.categoryId)
      ?? (typeof product.category === "object" ? product.category : { name: "Chưa phân loại" });
    const brand = brands.find((item) => item._id === product.brandId)
      ?? (typeof product.brand === "object" ? product.brand : { name: "Chưa có thương hiệu" });
    const prices = product.variants.map((variant) => variant.price).filter(Number.isFinite);
    return {
      ...product,
      category,
      brand,
      priceRange: prices.length
        ? { min: Math.min(...prices), max: Math.max(...prices) }
        : null,
    };
  });
  const materials = [...new Set(products.flatMap((product) => product.variants.map((variant) => variant.material).filter(Boolean)))].sort((a, b) => a.localeCompare(b, "vi"));
  const query = normalize(search);
  const filtered = products.filter((product) => {
    const text = normalize([
      product.name,
      product.description,
      product.brand.name,
      product.category.name,
      ...product.variants.map((variant) => variant.sku),
    ].join(" "));
    return text.includes(query)
      && (!categoryId || product.categoryId === categoryId)
      && (!brandId || product.brandId === brandId)
      && (!material || product.variants.some((variant) => variant.material === material))
      && (!status || product.isActive === (status === "active"));
  });
  const size = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const currentPage = Math.max(1, Math.min(totalPages, Number.isFinite(Number(page)) ? Math.floor(Number(page)) : 1));
  const variants = products.flatMap((product) => product.variants);

  return {
    rows: filtered.slice((currentPage - 1) * size, currentPage * size),
    total: filtered.length,
    page: currentPage,
    pageSize: size,
    totalPages,
    categories,
    brands,
    materials,
    totals: {
      products: products.length,
      variants: variants.length,
      activeVariants: variants.filter((variant) => variant.isActive).length,
      brands: brands.length,
    },
  };
}

export async function getProductById(id) {
  const response = await productAPI.getProductById(id);
  return response.data?.product ?? response.data?.data ?? response.data;
}

export async function saveProduct({ id, ...productData }) {
  const response = id
    ? await productAPI.updateProduct(id, productData)
    : await productAPI.createProduct(productData);
  return response.data?.product ?? response.data?.data ?? response.data;
}

export async function deactivateProduct(id) {
  const response = await productAPI.deactivateProduct(id);
  return response.data;
}