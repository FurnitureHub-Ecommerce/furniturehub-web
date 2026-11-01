import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  Filter,
  SlidersHorizontal,
  Grid3X3,
  List,
  X,
  RotateCcw,
  Search,
  AlertTriangle,
  RefreshCw,
  Heart,
  ShoppingBag,
  Eye,
} from "lucide-react";
import { productAPI, categoryAPI, brandAPI } from "../../services/api";
import { useShop } from "../../context/ShopContext";

// Hàm định dạng tiền tệ trực tiếp tại file
const formatCurrency = (amount) => {
  if (typeof amount !== "number") amount = Number(amount) || 0;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Từ điển dịch tên danh mục sang tiếng Việt
const CATEGORY_TRANSLATIONS = {
  "home decor & lighting": "Trang trí nhà cửa & Đèn chiếu sáng",
  "tv units & media": "Kệ TV & Thiết bị truyền thông",
  "bookshelves & shelving": "Kệ sách & Hệ thống giá kệ",
  "coffee & side tables": "Bàn trà & Bàn phụ",
  "wardrobes & cabinets": "Tủ quần áo & Tủ lưu trữ",
  "office desks & chairs": "Bàn làm việc & Ghế văn phòng",
  "dining tables & chairs": "Bàn ăn & Ghế ăn",
  "beds & mattresses": "Giường & Nệm",
  "sofa & armchair": "Ghế sofa & Ghế bành",
};

// Hàm định dạng và dịch tên danh mục trực tiếp tại file
const formatCategoryName = (name) => {
  if (!name) return "Nội thất";
  const lowerName = name.trim().toLowerCase();
  if (CATEGORY_TRANSLATIONS[lowerName]) {
    return CATEGORY_TRANSLATIONS[lowerName];
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
};

export function ProductListPage() {
  const { id: categoryIdFromUrl } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlist, toggleWishlist, addToCart, setQuickViewProduct } =
    useShop();

  // Loading & API States
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [productsData, setProductsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [brandsData, setBrandsData] = useState([]);

  // Filter States
  const targetCategory =
    categoryIdFromUrl || searchParams.get("category") || null;
  const [prevCategoryParam, setPrevCategoryParam] = useState(targetCategory);
  const [selectedCategories, setSelectedCategories] = useState(() =>
    targetCategory ? [targetCategory] : [],
  );

  if (targetCategory !== prevCategoryParam) {
    setPrevCategoryParam(targetCategory);
    setSelectedCategories(targetCategory ? [targetCategory] : []);
  }
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000000 });
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Toolbar & View States
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Chuẩn hóa sản phẩm từ API thật (Lấy chính xác ảnh từ backend, không dùng ảnh giả)
  const normalizeProduct = (p, idx = 0) => {
    const categoryObj =
      typeof p.categoryId === "object" && p.categoryId !== null
        ? p.categoryId
        : null;
    const brandObj =
      typeof p.brandId === "object" && p.brandId !== null ? p.brandId : null;
    const price = p.minPrice ?? p.price ?? p.basePrice ?? 0;

    let images = [];
    if (Array.isArray(p.images) && p.images.length > 0) {
      images = [...p.images];
    } else if (p.image) {
      images = [p.image];
    }

    return {
      id: p._id || p.id || `prod-${idx}`,
      _id: p._id || p.id,
      name: p.name || "Sản phẩm nội thất",
      slug: p.slug || p._id || `product-${idx}`,
      categoryId: categoryObj?._id || p.categoryId || "",
      categoryName: formatCategoryName(categoryObj?.name || "Nội thất"),
      brandId: brandObj?._id || p.brandId || "",
      brandName: brandObj?.name || "LUMORA Studio",
      basePrice: price,
      oldPrice: p.oldPrice || null,
      isNew: p.isNew !== undefined ? p.isNew : true,
      isBestSeller: p.isBestSeller || false,
      inStock:
        p.availableStock !== undefined
          ? p.availableStock > 0
          : p.inStock !== undefined
            ? p.inStock
            : true,
      shortDescription:
        p.shortDescription ||
        p.description ||
        "Chế tác từ chất liệu cao cấp, đường nét tối giản tinh tế.",
      description:
        p.description ||
        "Chế tác từ chất liệu cao cấp, đường nét tối giản tinh tế.",
      images,
      image: images[0] || "",
      gallery: images,
    };
  };

  const [reloadKey, setReloadKey] = useState(0);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const [prodRes, catRes, brandRes] = await Promise.allSettled([
        productAPI.getProducts({ limit: 50 }),
        categoryAPI.getCategories(),
        brandAPI.getBrands(),
      ]);

      let realProds = [];
      let realCats = [];
      let realBrands = [];
      let fetchErrors = [];

      if (prodRes.status === "fulfilled" && prodRes.value?.data) {
        const data = prodRes.value.data;
        const rawProds = Array.isArray(data)
          ? data
          : data.products || data.data || [];
        realProds = rawProds.map(normalizeProduct);
      } else if (prodRes.status === "rejected") {
        fetchErrors.push("Không thể tải danh sách sản phẩm từ máy chủ.");
      }

      if (catRes.status === "fulfilled" && catRes.value?.data) {
        const data = catRes.value.data;
        const rawCats = Array.isArray(data)
          ? data
          : data.categories || data.data || [];
        realCats = rawCats.map((c) => ({
          id: c._id || c.id,
          name: c.name,
          count: realProds.filter((p) => p.categoryId === (c._id || c.id))
            .length,
        }));
      }

      if (brandRes.status === "fulfilled" && brandRes.value?.data) {
        const data = brandRes.value.data;
        const rawBrands = Array.isArray(data)
          ? data
          : data.brands || data.data || [];
        realBrands = rawBrands.map((b) => ({
          id: b._id || b.id,
          name: b.name,
        }));
      }

      if (fetchErrors.length > 0 && realProds.length === 0) {
        setApiError(fetchErrors.join(" "));
      }

      setProductsData(realProds);
      setCategoriesData(realCats);
      setBrandsData(realBrands);
    } catch (err) {
      console.error("ProductListPage API load error:", err);
      setApiError("Lỗi kết nối máy chủ Backend. Vui lòng thử lại.");
      setProductsData([]);
      setCategoriesData([]);
      setBrandsData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, reloadKey]);

  const handleRefresh = () => {
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (categoryIdFromUrl) {
      setSelectedCategories([categoryIdFromUrl]);
    } else {
      const catParam = searchParams.get("category");
      if (catParam) {
        setSelectedCategories([catParam]);
      }
    }
  }, [categoryIdFromUrl, searchParams]);

  const currentCategoryName = useMemo(() => {
    if (selectedCategories.length === 1) {
      const match = categoriesData.find((c) => c.id === selectedCategories[0]);
      return match ? formatCategoryName(match.name) : "Tất Cả Sản Phẩm";
    }
    return "Tất Cả Sản Phẩm";
  }, [selectedCategories, categoriesData]);

  const toggleCategory = (catId) => {
    setSelectedCategories((prev) =>
      prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId],
    );
  };

  const toggleBrand = (brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId],
    );
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange({ min: 0, max: 50000000 });
    setOnlyInStock(false);
    setSearchQuery("");
    setSearchParams({});
  };

  const filteredProducts = useMemo(() => {
    return productsData
      .filter((product) => {
        if (searchQuery.trim() !== "") {
          const query = searchQuery.toLowerCase();
          const matchesName = product.name.toLowerCase().includes(query);
          const matchesDesc = (product.shortDescription || "")
            .toLowerCase()
            .includes(query);
          if (!matchesName && !matchesDesc) return false;
        }

        if (
          selectedCategories.length > 0 &&
          !selectedCategories.includes(product.categoryId)
        ) {
          return false;
        }

        if (
          selectedBrands.length > 0 &&
          !selectedBrands.includes(product.brandId)
        ) {
          return false;
        }

        if (priceRange.max < 50000000) {
          if (
            product.basePrice < priceRange.min ||
            product.basePrice > priceRange.max
          ) {
            return false;
          }
        }

        if (onlyInStock && !product.inStock) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.basePrice - b.basePrice;
        if (sortBy === "price-desc") return b.basePrice - a.basePrice;
        return 0;
      });
  }, [
    productsData,
    searchQuery,
    selectedCategories,
    selectedBrands,
    priceRange,
    onlyInStock,
    sortBy,
  ]);

  return (
    <div
      className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-6 lg:px-8"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="max-w-360 mx-auto">
        {/* Banner */}
        <div
          className="w-full text-white rounded-2xl p-8 mb-8 shadow-sm overflow-hidden"
          style={{
            backgroundColor: "#5C4033",
            color: "#FFFFFF",
            borderRadius: "16px",
            padding: "36px 40px",
            marginBottom: "32px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(42, 24, 16, 0.12)",
          }}
        >
          <div className="max-w-6xl">
            <span
              className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-2 block"
              style={{
                color: "#D4AF37",
                letterSpacing: "0.12em",
                marginBottom: "8px",
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              BỘ SƯU TẬP ĐỘC QUYỀN LUMORA
            </span>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-3 tracking-tight leading-snug"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                color: "#FFFFFF",
                margin: "0 0 12px 0",
                lineHeight: 1.2,
              }}
            >
              {currentCategoryName}
            </h1>
            <p
              className="text-stone-300 text-sm sm:text-base leading-relaxed italic"
              style={{
                color: "#D1D5DB",
                margin: 0,
                lineHeight: 1.6,
                fontStyle: "italic",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Khám phá không gian sống sang trọng với nghệ thuật thiết kế tối
              giản, chất liệu gỗ đạt chuẩn bảo tồn bền vững và hoàn thiện thủ
              công tinh xảo.
            </p>
          </div>
        </div>

        {/* Error Alert Banner */}
        {apiError && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-rose-800 text-sm">
              <AlertTriangle size={20} className="text-rose-600 shrink-0" />
              <span className="leading-normal">{apiError}</span>
            </div>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <RefreshCw size={14} />
              <span>Thử lại</span>
            </button>
          </div>
        )}

        {/* Toolbar & Search */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
          style={{
            backgroundColor: "#FFFFFF",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid #EAE5E0",
            marginBottom: "32px",
          }}
        >
          <div className="relative w-full md:w-96">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên sản phẩm, chất liệu..."
              className="block w-full h-10 rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-stone-800 placeholder-gray-400 outline-none focus:border-amber-800"
              style={{
                width: "100%",
                height: "40px",
                paddingLeft: "38px",
                paddingRight: "16px",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                outline: "none",
                fontFamily: "'Montserrat', sans-serif",
              }}
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-end w-full md:w-auto">
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>
                Bộ lọc ({selectedCategories.length + selectedBrands.length})
              </span>
            </button>

            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer select-none bg-stone-50 px-3 py-2 rounded-lg border border-gray-200 hover:bg-stone-100 transition-colors">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-amber-800 focus:ring-amber-800 cursor-pointer"
              />
              <span>Chỉ còn hàng</span>
            </label>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 hidden sm:inline">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2 px-3 bg-stone-50 border border-gray-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:border-amber-800 cursor-pointer"
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #E5E7EB",
                  backgroundColor: "#F9FAFB",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">
                  Giá: Thấp đến Cao (Nhỏ đến Lớn)
                </option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
              </select>
            </div>

            <div className="border border-gray-200 rounded-lg p-1 flex items-center shrink-0 gap-1 bg-stone-50">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-amber-800 text-white shadow-xs"
                    : "text-stone-500 hover:text-stone-800 hover:bg-white"
                }`}
                title="Chế độ xem lưới"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-amber-800 text-white shadow-xs"
                    : "text-stone-500 hover:text-stone-800 hover:bg-white"
                }`}
                title="Chế độ xem danh sách"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Selected Filter Tags */}
        {(selectedCategories.length > 0 ||
          selectedBrands.length > 0 ||
          onlyInStock) && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <span className="text-xs text-stone-500 font-medium">
              Đang lọc:
            </span>
            {selectedCategories.map((catId) => {
              const cat = categoriesData.find((c) => c.id === catId);
              return (
                <span
                  key={catId}
                  className="inline-flex items-center gap-1 py-1 px-2.5 bg-amber-100 text-amber-900 text-xs font-medium rounded-full"
                >
                  {cat ? formatCategoryName(cat.name) : catId}
                  <button type="button" onClick={() => toggleCategory(catId)}>
                    <X size={12} />
                  </button>
                </span>
              );
            })}

            {selectedBrands.map((brandId) => {
              const brand = brandsData.find((b) => b.id === brandId);
              return (
                <span
                  key={brandId}
                  className="inline-flex items-center gap-1 py-1 px-2.5 bg-stone-200 text-stone-900 text-xs font-medium rounded-full"
                >
                  {brand?.name || brandId}
                  <button type="button" onClick={() => toggleBrand(brandId)}>
                    <X size={12} />
                  </button>
                </span>
              );
            })}

            {onlyInStock && (
              <span className="inline-flex items-center gap-1 py-1 px-2.5 bg-emerald-100 text-emerald-900 text-xs font-medium rounded-full">
                Chỉ còn hàng
                <button type="button" onClick={() => setOnlyInStock(false)}>
                  <X size={12} />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-rose-700 underline font-medium hover:text-rose-900 ml-2"
            >
              Xóa tất cả
            </button>
          </div>
        )}

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <aside
            className={`w-full lg:w-64 shrink-0 bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-6 ${isMobileFilterOpen ? "block" : "hidden lg:block"}`}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid #EAE5E0",
              padding: "20px",
              boxSizing: "border-box",
            }}
          >
            <div
              className="flex items-center justify-between border-b border-gray-100 pb-3"
              style={{
                borderBottom: "1px solid #F3F4F6",
                paddingBottom: "12px",
              }}
            >
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "16px",
                  fontWeight: 700,
                  margin: 0,
                  color: "#1C1917",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Filter className="w-4 h-4 text-amber-800" />
                <span>Bộ Lọc</span>
              </h2>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-stone-500 hover:text-amber-800 flex items-center gap-1 transition-colors"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại</span>
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <h3
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "14px",
                  fontWeight: 700,
                  margin: "0 0 10px 0",
                  color: "#1C1917",
                }}
              >
                Danh Mục
              </h3>
              <div className="space-y-1.5">
                {categoriesData.map((cat) => {
                  const isChecked = selectedCategories.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 0",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          minWidth: 0,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategory(cat.id)}
                          className="w-4 h-4 rounded border-gray-300 text-amber-800 focus:ring-amber-800 cursor-pointer shrink-0"
                        />
                        <span
                          className={`truncate ${isChecked ? "font-bold text-amber-900" : "text-stone-700"}`}
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatCategoryName(cat.name)}
                        </span>
                      </div>
                      {cat.count > 0 && (
                        <span
                          style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "9999px",
                            backgroundColor: "#F3F4F6",
                            color: "#6B7280",
                            flexShrink: 0,
                          }}
                        >
                          {cat.count}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Brand Filter */}
            <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "16px" }}>
              <h3
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "14px",
                  fontWeight: 700,
                  margin: "0 0 10px 0",
                  color: "#1C1917",
                }}
              >
                Thương Hiệu
              </h3>
              <div className="space-y-1.5">
                {brandsData.map((b) => {
                  const isChecked = selectedBrands.includes(b.id);
                  return (
                    <label
                      key={b.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 0",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          minWidth: 0,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBrand(b.id)}
                          className="w-4 h-4 rounded border-gray-300 text-amber-800 focus:ring-amber-800 cursor-pointer shrink-0"
                        />
                        <span
                          className={`truncate ${isChecked ? "font-bold text-amber-900" : "text-stone-700"}`}
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {b.name}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Range Filter */}
            <div
              style={{ borderTop: "1px solid #F3F4F6", paddingTop: "16px" }}
              className="space-y-3"
            >
              <h3
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "14px",
                  fontWeight: 700,
                  margin: "0 0 8px 0",
                  color: "#1C1917",
                }}
              >
                Khoảng Giá (Từ nhỏ đến lớn)
              </h3>
              <input
                type="range"
                min="0"
                max="50000000"
                step="500000"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, max: Number(e.target.value) })
                }
                className="w-full accent-amber-800 cursor-pointer"
                style={{ width: "100%" }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "12px",
                  color: "#6B7280",
                }}
              >
                <span>{formatCurrency(priceRange.min)}</span>
                <span style={{ fontWeight: 600, color: "#92400E" }}>
                  Đến: {formatCurrency(priceRange.max)}
                </span>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div
            className="flex-1 w-full"
            style={{ flex: 1, width: "100%", minWidth: 0 }}
          >
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse space-y-4"
                  >
                    <div className="aspect-4/3 w-full bg-gray-200 rounded-lg"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-9 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "48px",
                  borderRadius: "16px",
                  border: "1px solid #EAE5E0",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    margin: "0 0 8px 0",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#1C1917",
                  }}
                >
                  Không tìm thấy sản phẩm nào
                </p>
                <p
                  style={{
                    margin: "0 auto 24px auto",
                    fontSize: "13px",
                    color: "#6B7280",
                    maxWidth: "400px",
                  }}
                >
                  Vui lòng thử điều chỉnh bộ lọc, khoảng giá hoặc từ khóa tìm
                  kiếm để khám phá các sản phẩm khác.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#92400E",
                    color: "#FFFFFF",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Xóa bộ lọc</span>
                </button>
              </div>
            ) : viewMode === "list" ? (
              <div className="flex flex-col gap-4">
                {filteredProducts.map((product) => {
                  const isWishlisted = wishlist.includes(
                    String(product.id || product._id),
                  );
                  return (
                    <article
                      key={product.id}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "12px",
                        border: "1px solid #EAE5E0",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "row",
                        boxSizing: "border-box",
                      }}
                    >
                      <div
                        style={{
                          width: "250px",
                          height: "200px",
                          backgroundColor: "#F9FAFB",
                          position: "relative",
                          flexShrink: 0,
                        }}
                      >
                        <Link
                          to={`/product/${product.slug || product._id || product.id}`}
                          className="block w-full h-full"
                        >
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                              loading="lazy"
                            />
                          ) : null}
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(String(product.id || product._id));
                          }}
                          style={{
                            position: "absolute",
                            top: "12px",
                            right: "12px",
                            padding: "8px",
                            borderRadius: "50%",
                            backgroundColor: isWishlisted
                              ? "#92400E"
                              : "rgba(255,255,255,0.9)",
                            color: isWishlisted ? "#FFFFFF" : "#374151",
                            border: "none",
                            cursor: "pointer",
                            zIndex: 2,
                          }}
                        >
                          <Heart
                            size={16}
                            fill={isWishlisted ? "currentColor" : "none"}
                          />
                        </button>
                      </div>

                      <div
                        style={{
                          padding: "20px",
                          display: "flex",
                          flexDirection: "column",
                          flex: 1,
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "6px",
                              fontSize: "12px",
                            }}
                          >
                            <span style={{ color: "#92400E", fontWeight: 600 }}>
                              {product.categoryName}
                            </span>
                          </div>

                          <h3
                            style={{
                              fontFamily: "'Montserrat', sans-serif",
                              margin: "0 0 8px 0",
                              fontSize: "16px",
                              fontWeight: 700,
                              color: "#1C1917",
                            }}
                          >
                            <Link
                              to={`/product/${product.slug || product._id || product.id}`}
                              style={{
                                textDecoration: "none",
                                color: "inherit",
                              }}
                            >
                              {product.name}
                            </Link>
                          </h3>

                          <p
                            style={{
                              margin: "0 0 12px 0",
                              color: "#6B7280",
                              fontSize: "13px",
                            }}
                          >
                            {product.shortDescription}
                          </p>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "baseline",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                color: "#78350F",
                                fontWeight: 700,
                                fontSize: "18px",
                              }}
                            >
                              {formatCurrency(product.basePrice)}
                            </span>
                            {product.oldPrice && (
                              <span
                                style={{
                                  textDecoration: "line-through",
                                  color: "#9CA3AF",
                                  fontSize: "13px",
                                }}
                              >
                                {formatCurrency(product.oldPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            paddingTop: "12px",
                            borderTop: "1px solid #F3F4F6",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            disabled={!product.inStock}
                            style={{
                              flex: 1,
                              padding: "10px 16px",
                              backgroundColor: product.inStock
                                ? "#1C1917"
                                : "#9CA3AF",
                              color: "#FFFFFF",
                              borderRadius: "8px",
                              border: "none",
                              cursor: product.inStock
                                ? "pointer"
                                : "not-allowed",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              fontSize: "13px",
                              fontFamily: "'Montserrat', sans-serif",
                            }}
                          >
                            <ShoppingBag size={14} />
                            <span>
                              {product.inStock ? "Thêm giỏ hàng" : "Hết hàng"}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickViewProduct(product)}
                            style={{
                              padding: "10px",
                              backgroundColor: "#F3F4F6",
                              color: "#374151",
                              borderRadius: "8px",
                              border: "none",
                              cursor: "pointer",
                            }}
                            title="Xem nhanh"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const isWishlisted = wishlist.includes(
                    String(product.id || product._id),
                  );
                  return (
                    <article
                      key={product.id}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "12px",
                        border: "1px solid #EAE5E0",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: "4/3",
                          position: "relative",
                          overflow: "hidden",
                          backgroundColor: "#F9FAFB",
                        }}
                      >
                        <Link
                          to={`/product/${product.slug || product._id || product.id}`}
                          className="block w-full h-full"
                        >
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                              loading="lazy"
                            />
                          ) : null}
                        </Link>

                        <div
                          style={{
                            position: "absolute",
                            top: "12px",
                            left: "12px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            zIndex: 2,
                          }}
                        >
                          {product.isNew && (
                            <span
                              style={{
                                padding: "2px 8px",
                                fontSize: "10px",
                                backgroundColor: "#1C1917",
                                color: "#FFFFFF",
                                borderRadius: "4px",
                              }}
                            >
                              Mới
                            </span>
                          )}
                          {!product.inStock && (
                            <span
                              style={{
                                padding: "2px 8px",
                                fontSize: "10px",
                                backgroundColor: "#E11D48",
                                color: "#FFFFFF",
                                borderRadius: "4px",
                              }}
                            >
                              Hết Hàng
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(String(product.id || product._id));
                          }}
                          style={{
                            position: "absolute",
                            top: "12px",
                            right: "12px",
                            padding: "8px",
                            borderRadius: "50%",
                            backgroundColor: isWishlisted
                              ? "#92400E"
                              : "rgba(255,255,255,0.9)",
                            color: isWishlisted ? "#FFFFFF" : "#374151",
                            border: "none",
                            cursor: "pointer",
                            zIndex: 2,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          }}
                        >
                          <Heart
                            size={16}
                            fill={isWishlisted ? "currentColor" : "none"}
                          />
                        </button>
                      </div>

                      <div
                        style={{
                          padding: "16px",
                          display: "flex",
                          flexDirection: "column",
                          flex: 1,
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "6px",
                              fontSize: "12px",
                            }}
                          >
                            <span
                              style={{
                                color: "#92400E",
                                fontWeight: 600,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {product.categoryName}
                            </span>
                          </div>

                          <h3
                            style={{
                              fontFamily: "'Montserrat', sans-serif",
                              fontSize: "15px",
                              fontWeight: 700,
                              color: "#1C1917",
                              margin: "0 0 8px 0",
                              lineHeight: "1.35",
                              minHeight: "2.7rem",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            <Link
                              to={`/product/${product.slug || product._id || product.id}`}
                              style={{
                                textDecoration: "none",
                                color: "inherit",
                              }}
                            >
                              {product.name}
                            </Link>
                          </h3>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "baseline",
                              gap: "8px",
                              marginBottom: "8px",
                            }}
                          >
                            <span
                              style={{
                                color: "#78350F",
                                fontWeight: 700,
                                fontSize: "18px",
                              }}
                            >
                              {formatCurrency(product.basePrice)}
                            </span>
                            {product.oldPrice && (
                              <span
                                style={{
                                  textDecoration: "line-through",
                                  color: "#9CA3AF",
                                  fontSize: "12px",
                                }}
                              >
                                {formatCurrency(product.oldPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            paddingTop: "12px",
                            borderTop: "1px solid #F3F4F6",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            disabled={!product.inStock}
                            style={{
                              flex: 1,
                              padding: "8px 12px",
                              backgroundColor: product.inStock
                                ? "#1C1917"
                                : "#9CA3AF",
                              color: "#FFFFFF",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: 600,
                              border: "none",
                              cursor: product.inStock
                                ? "pointer"
                                : "not-allowed",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              fontFamily: "'Montserrat', sans-serif",
                            }}
                          >
                            <ShoppingBag size={14} />
                            <span>
                              {product.inStock ? "Thêm giỏ" : "Hết hàng"}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickViewProduct(product)}
                            style={{
                              padding: "8px",
                              backgroundColor: "#F9FAFB",
                              color: "#374151",
                              borderRadius: "8px",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title="Xem nhanh"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductListPage;