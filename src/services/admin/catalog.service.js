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

// Bộ nhớ đệm (Cache) giúp chuyển tab qua lại load tức thì (0 giây chờ)
let catalogCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60000; // Cache trong 1 phút

export async function loadAllCatalogData() {
  const now = Date.now();
  if (catalogCache && (now - cacheTimestamp < CACHE_DURATION)) {
    return catalogCache;
  }

  // 1. Tải song song danh mục, thương hiệu và sản phẩm cùng lúc
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
    (product) => {
      const categoryId = entityId(product.categoryId ?? product.category);
      const brandId = entityId(product.brandId ?? product.brand);
      return {
        ...product,
        _id: entityId(product),
        categoryId,
        brandId,
        isActive: activeState(product),
      };
    },
  );

  // 2. Lấy biến thể cực nhanh cho toàn bộ danh sách sản phẩm
  let groups = [];
  try {
    groups = await loadProductVariants(records);
  } catch {
    groups = records.map(() => []);
  }

  // 3. Xây dựng danh sách sản phẩm đầy đủ thuộc tính và tính toán khoảng giá (priceRange) chuẩn xác
  const products = records.map((product, index) => {
    const variants = groups[index] || product.variants || [];
    const prices = variants
      .map((variant) => (typeof variant.price === "number" ? variant.price : Number(variant.price)))
      .filter((value) => !isNaN(value) && value !== null);

    const priceRange =
      prices.length && prices.length === variants.length
        ? { min: Math.min(...prices), max: Math.max(...prices) }
        : product.priceRange || (prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null);

    return {
      ...product,
      variants,
      category:
        categories.find((category) => category._id === product.categoryId) ??
        (typeof product.category === "object" ? product.category : null),
      brand:
        brands.find((brand) => brand._id === product.brandId) ??
        (typeof product.brand === "object" ? product.brand : null),
      priceRange,
    };
  });

  const materials = [
    ...new Set(
      products
        .flatMap((product) =>
          (product.variants || []).map((variant) => variant.material),
        )
        .filter((value) => typeof value === "string" && value.trim()),
    ),
  ].sort((a, b) => a.localeCompare(b, "vi"));

  catalogCache = { products, categories, brands, materials };
  cacheTimestamp = Date.now();
  return catalogCache;
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
    const matchesSearch =
      !query || normalize(product.name ?? "").includes(query);

    const matchesCategory =
      !categoryId || String(product.categoryId) === String(categoryId);

    const matchesBrand =
      !brandId || String(product.brandId) === String(brandId);

    const matchesMaterial =
      !material ||
      (product.variants || []).some((v) => v.material === material);

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
  catalogCache = null; // Xóa cache khi cập nhật dữ liệu mới
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
  catalogCache = null;
  const response = await productAPI.deactivateProduct(id);
  return response.data;
}

export async function reactivateProduct(id) {
  catalogCache = null;
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