import { brandAPI, categoryAPI, productAPI } from "../api.js";
import {
  recordsFrom,
  entityId,
  activeState,
  loadProductVariants,
} from "./variants.service.js";

const normalize = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();

// Hàm chỉ gọi API một lần duy nhất để lấy toàn bộ dữ liệu thô và biến thể
export async function loadAllCatalogData() {
  const [productsResponse, categoriesResponse, brandsResponse] =
    await Promise.all([
      productAPI.getProductsAdmin(),
      categoryAPI.getCategoriesAdmin(),
      brandAPI.getBrandsAdmin(),
    ]);
  const categories = recordsFrom(categoriesResponse.data, "categories").map(
    (category) => ({ ...category, _id: entityId(category) }),
  );
  const brands = recordsFrom(brandsResponse.data, "brands").map((brand) => ({
    ...brand,
    _id: entityId(brand),
  }));
  const records = recordsFrom(productsResponse.data, "products").map(
    (product) => ({
      ...product,
      _id: entityId(product),
      categoryId: entityId(product.categoryId ?? product.category),
      brandId: entityId(product.brandId ?? product.brand),
      isActive: activeState(product),
    }),
  );
  const groups = await loadProductVariants(records);
  const products = records.map((product, index) => {
    const variants = groups[index];
    const prices = variants
      .map((variant) => variant.price)
      .filter((value) => value !== null);
    return {
      ...product,
      variants,
      category:
        categories.find((category) => category._id === product.categoryId) ??
        (typeof product.category === "object" ? product.category : null),
      brand:
        brands.find((brand) => brand._id === product.brandId) ??
        (typeof product.brand === "object" ? product.brand : null),
      // Không trình bày khoảng giá hoàn chỉnh khi một Variant còn thiếu giá.
      priceRange:
        prices.length && prices.length === variants.length
          ? { min: Math.min(...prices), max: Math.max(...prices) }
          : null,
    };
  });

  const materials = [
    ...new Set(
      products
        .flatMap((product) =>
          product.variants.map((variant) => variant.material),
        )
        .filter((value) => typeof value === "string" && value.trim()),
    ),
  ].sort((a, b) => a.localeCompare(b, "vi"));

  return { products, categories, brands, materials };
}

// Hàm lọc thuần túy chạy trực tiếp trên RAM (cực kỳ nhanh, không gọi lại API)
export function filterProducts(
  products,
  categories,
  brands,
  materials,
  { search = "", categoryId = "", brandId = "", material = "", status = "" } = {},
) {
  const query = normalize(search);
  const rows = products.filter((product) => {
    // 1. Kiểm tra tìm kiếm từ khóa (search)
    const matchesSearch =
      !query ||
      normalize(
        [
          product.name,
          product.description,
          product.category?.name,
          product.brand?.name,
          ...(product.variants || []).map((v) => v.sku),
        ].join(" "),
      ).includes(query);

    // 2. Kiểm tra danh mục (so sánh chuỗi an toàn cho ID)
    const matchesCategory =
      !categoryId || String(product.categoryId) === String(categoryId);

    // 3. Kiểm tra thương hiệu (so sánh chuỗi an toàn cho ID)
    const matchesBrand =
      !brandId || String(product.brandId) === String(brandId);

    // 4. Kiểm tra chất liệu
    const matchesMaterial =
      !material ||
      (product.variants || []).some((v) => v.material === material);

    // 5. Kiểm tra trạng thái hoạt động
    const matchesStatus = !status || product.isActive === (status === "active");

    return (
      matchesSearch &&
      matchesCategory &&
      matchesBrand &&
      matchesMaterial &&
      matchesStatus
    );
  });

  return {
    rows,
    loaded: products.length,
    categories,
    brands,
    materials,
    totals: {
      products: null,
      variants: null,
      brands: null,
      averagePrice: null,
    },
  };
}

export async function saveProduct({ id, ...productData }) {
  const response = id
    ? await productAPI.updateProduct(id, productData)
    : await productAPI.createProduct(productData);
  return response.data?.product ?? response.data?.data ?? response.data;
}

export async function getProductForEdit(id) {
  const response = await productAPI.getProductById(id);
  const body = response.data;
  const product = body?.product ?? body?.data?.product ?? body?.data ?? body;
  if (
    !product ||
    typeof product !== "object" ||
    Array.isArray(product) ||
    entityId(product) !== id
  ) {
    throw new Error("Phản hồi chi tiết Product không đúng định dạng.");
  }
  return product;
}

export async function deactivateProduct(id) {
  const response = await productAPI.deactivateProduct(id);
  return response.data;
}

export async function reactivateProduct(id) {
  await productAPI.updateProduct(id, { isActive: true });
} 
// Hàm bổ sung tương thích ngược cho AdminDashboard.jsx
export async function getCatalog(query = {}) {
  const data = await loadAllCatalogData();
  return filterProducts(
    data.products,
    data.categories,
    data.brands,
    data.materials,
    query
  );
}