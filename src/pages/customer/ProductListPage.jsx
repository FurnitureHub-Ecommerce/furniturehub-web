import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  Filter, SlidersHorizontal, Grid3X3, List, X, 
  RotateCcw, Search, AlertTriangle, RefreshCw
} from 'lucide-react';
import { productAPI, categoryAPI, brandAPI } from '../../services/api';
import ProductCardWithVariants from '../../components/product/ProductCardWithVariants';
import { ProductGridSkeleton } from '../../components/common/ProductSkeleton';
import { 
  formatCurrency, 
  formatCategoryName, 
  PRODUCT_IMAGE_OVERRIDES, 
  getProductMetrics 
} from '../../utils/formatters';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80';

export function ProductListPage() {
  const { id: categoryIdFromUrl } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Loading & API States
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [productsData, setProductsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [brandsData, setBrandsData] = useState([]);

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000000 });
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Toolbar & View States
  const [sortBy, setSortBy] = useState('newest'); // newest | price-asc | price-desc | rating
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Normalize product helper for real backend product objects
  const normalizeProduct = (p, idx = 0) => {
    const categoryObj = typeof p.categoryId === 'object' && p.categoryId !== null ? p.categoryId : null;
    const brandObj = typeof p.brandId === 'object' && p.brandId !== null ? p.brandId : null;
    const price = p.minPrice ?? p.price ?? p.basePrice ?? 0;

    // Check media mismatch overrides (Luna, Aura, Ergonomic, Koster)
    const overrideImages = PRODUCT_IMAGE_OVERRIDES[p.name];
    let images = overrideImages || (Array.isArray(p.images) && p.images.length > 0 
      ? [...p.images] 
      : [p.image || DEFAULT_FALLBACK_IMAGE]);

    const metrics = getProductMetrics(p.name, p.rating, p.reviewCount);

    return {
      id: p._id || p.id || `prod-${idx}`,
      _id: p._id || p.id,
      name: p.name || 'Sản phẩm nội thất',
      slug: p.slug || p._id || `product-${idx}`,
      categoryId: categoryObj?._id || p.categoryId || '',
      categoryName: formatCategoryName(categoryObj?.name || 'Nội thất'),
      brandId: brandObj?._id || p.brandId || '',
      brandName: brandObj?.name || 'LUMORA Studio',
      basePrice: price,
      oldPrice: p.oldPrice || null,
      rating: metrics.rating,
      reviewCount: metrics.reviewCount,
      isNew: p.isNew !== undefined ? p.isNew : true,
      isBestSeller: p.isBestSeller || false,
      inStock: p.availableStock !== undefined ? p.availableStock > 0 : (p.inStock !== undefined ? p.inStock : true),
      shortDescription: p.shortDescription || p.description || 'Chế tác từ chất liệu cao cấp, đường nét tối giản tinh tế.',
      description: p.description || 'Chế tác từ chất liệu cao cấp, đường nét tối giản tinh tế.',
      images,
      image: images[0],
      gallery: images,
      colors: p.colors || [
        { id: 'c-nat', name: 'Tiêu chuẩn', hex: '#8B5A2B', image: images[0] }
      ],
      sizes: p.sizes || [
        { id: 's-std', name: 'Tiêu chuẩn', priceAdjustment: 0 }
      ],
      materials: p.materials || [
        { id: 'm-std', name: 'Chất liệu cao cấp', priceAdjustment: 0 }
      ],
    };
  };

  // Fetch Data 100% from Backend API via src/services/api.js
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

      // 1. Process Products
      if (prodRes.status === 'fulfilled' && prodRes.value?.data) {
        const data = prodRes.value.data;
        const rawProds = Array.isArray(data) ? data : data.products || data.data || [];
        realProds = rawProds.map(normalizeProduct);
      } else if (prodRes.status === 'rejected') {
        fetchErrors.push('Không thể tải danh sách sản phẩm từ máy chủ.');
      }

      // 2. Process Categories
      if (catRes.status === 'fulfilled' && catRes.value?.data) {
        const data = catRes.value.data;
        const rawCats = Array.isArray(data) ? data : data.categories || data.data || [];
        realCats = rawCats.map((c) => ({
          id: c._id || c.id,
          name: c.name,
          count: realProds.filter((p) => p.categoryId === (c._id || c.id)).length,
        }));
      }

      // 3. Process Brands
      if (brandRes.status === 'fulfilled' && brandRes.value?.data) {
        const data = brandRes.value.data;
        const rawBrands = Array.isArray(data) ? data : data.brands || data.data || [];
        realBrands = rawBrands.map((b) => ({
          id: b._id || b.id,
          name: b.name,
        }));
      }

      if (fetchErrors.length > 0 && realProds.length === 0) {
        setApiError(fetchErrors.join(' '));
      }

      setProductsData(realProds);
      setCategoriesData(realCats);
      setBrandsData(realBrands);
    } catch (err) {
      console.error('ProductListPage API load error:', err);
      setApiError('Lỗi kết nối máy chủ Backend. Vui lòng thử lại.');
      setProductsData([]);
      setCategoriesData([]);
      setBrandsData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync Category from URL Params
  useEffect(() => {
    if (categoryIdFromUrl) {
      setSelectedCategories([categoryIdFromUrl]);
    } else {
      const catParam = searchParams.get('category');
      if (catParam) {
        setSelectedCategories([catParam]);
      }
    }
  }, [categoryIdFromUrl, searchParams]);

  // Active Category Name for Breadcrumb & Banner Header
  const currentCategoryName = useMemo(() => {
    if (selectedCategories.length === 1) {
      const match = categoriesData.find((c) => c.id === selectedCategories[0]);
      return match ? formatCategoryName(match.name) : 'Tất Cả Sản Phẩm';
    }
    return 'Tất Cả Sản Phẩm';
  }, [selectedCategories, categoriesData]);

  // Toggle Selection Helper
  const toggleCategory = (catId) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const toggleBrand = (brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange({ min: 0, max: 50000000 });
    setOnlyInStock(false);
    setSearchQuery('');
    setSearchParams({});
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return productsData.filter((product) => {
      // Search
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = (product.shortDescription || '').toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.categoryId)) {
        return false;
      }

      // Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brandId)) {
        return false;
      }

      // Price filter (only applies if max was explicitly changed by user)
      if (priceRange.max < 50000000) {
        if (product.basePrice < priceRange.min || product.basePrice > priceRange.max) {
          return false;
        }
      }

      // Stock filter
      if (onlyInStock && !product.inStock) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
      if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0; // newest
    });
  }, [productsData, searchQuery, selectedCategories, selectedBrands, priceRange, onlyInStock, sortBy]);

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation (No debug badge) */}
        <div className="mb-6 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs text-stone-500">
            <Link to="/" className="hover:text-amber-800 transition-colors">Trang Chủ</Link>
            <span>/</span>
            <span className="text-stone-900 font-medium">{currentCategoryName}</span>
          </nav>
        </div>

        {/* Page Banner Header (text-white & text-gray-200 with high contrast on dark banner) */}
        <div className="mb-8 p-8 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 block">
              BỘ SƯU TẬP ĐỘC QUYỀN LUMORA
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
              {currentCategoryName}
            </h1>
            <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
              Khám phá không gian sống sang trọng với nghệ thuật thiết kế tối giản, chất liệu gỗ đạt chuẩn bảo tồn bền vững và hoàn thiện thủ công tinh xảo.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Error Alert Banner */}
        {apiError && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-rose-800 text-sm">
              <AlertTriangle size={20} className="text-rose-600 shrink-0" />
              <span>{apiError}</span>
            </div>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <RefreshCw size={14} />
              <span>Thử lại</span>
            </button>
          </div>
        )}

        {/* Toolbar & Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm, chất liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Filters, Sorting & View Toggle */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden inline-flex items-center gap-2 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg transition-colors"
            >
              <SlidersHorizontal size={14} />
              <span>Bộ lọc ({selectedCategories.length + selectedBrands.length})</span>
            </button>

            {/* In-Stock Toggle */}
            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-amber-800 focus:ring-amber-700 cursor-pointer"
              />
              <span>Chỉ còn hàng</span>
            </label>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2 px-3 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
              <option value="rating">Đánh giá cao nhất</option>
            </select>

            {/* Container Icon Toggle Grid / List: border border-gray-200 rounded-lg p-1 flex items-center shrink-0 */}
            <div className="border border-gray-200 rounded-lg p-1 flex items-center shrink-0 gap-1 bg-white">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-amber-800 text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                }`}
                title="Chế độ xem lưới (Grid)"
                aria-label="Chế độ xem lưới"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-amber-800 text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                }`}
                title="Chế độ xem danh sách (List)"
                aria-label="Chế độ xem danh sách"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Selected Filter Tags */}
        {(selectedCategories.length > 0 || selectedBrands.length > 0 || onlyInStock) && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <span className="text-xs text-stone-500 font-medium">Đang lọc:</span>
            {selectedCategories.map((catId) => {
              const cat = categoriesData.find((c) => c.id === catId);
              return (
                <span key={catId} className="inline-flex items-center gap-1 py-1 px-2.5 bg-amber-100 text-amber-900 text-xs font-medium rounded-full">
                  {cat?.name || catId}
                  <button type="button" onClick={() => toggleCategory(catId)}><X size={12} /></button>
                </span>
              );
            })}

            {selectedBrands.map((brandId) => {
              const brand = brandsData.find((b) => b.id === brandId);
              return (
                <span key={brandId} className="inline-flex items-center gap-1 py-1 px-2.5 bg-stone-200 text-stone-900 text-xs font-medium rounded-full">
                  {brand?.name || brandId}
                  <button type="button" onClick={() => toggleBrand(brandId)}><X size={12} /></button>
                </span>
              );
            })}

            {onlyInStock && (
              <span className="inline-flex items-center gap-1 py-1 px-2.5 bg-emerald-100 text-emerald-900 text-xs font-medium rounded-full">
                Chỉ còn hàng
                <button type="button" onClick={() => setOnlyInStock(false)}><X size={12} /></button>
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

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                <Filter size={18} className="text-amber-800" />
                <span>Bộ Lọc Sản Phẩm</span>
              </h2>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-stone-500 hover:text-amber-800 flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={12} />
                <span>Đặt lại</span>
              </button>
            </div>

            {/* Category Filter Group */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3">
                Danh Mục (Categories)
              </h3>
              <div className="space-y-2">
                {categoriesData.map((cat) => {
                  const isChecked = selectedCategories.includes(cat.id);
                  return (
                    <label key={cat.id} className="flex items-center justify-between text-xs text-stone-700 cursor-pointer hover:text-amber-800 transition-colors py-1">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategory(cat.id)}
                          className="w-4 h-4 rounded border-stone-300 text-amber-800 focus:ring-amber-700 cursor-pointer"
                        />
                        <span className={isChecked ? 'font-bold text-amber-900' : ''}>{formatCategoryName(cat.name)}</span>
                      </div>
                      {cat.count > 0 && <span className="text-[11px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{cat.count}</span>}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Brand Filter Group */}
            <div className="border-t border-stone-100 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3">
                Thương Hiệu (Brands)
              </h3>
              <div className="space-y-2">
                {brandsData.map((b) => {
                  const isChecked = selectedBrands.includes(b.id);
                  return (
                    <label key={b.id} className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer hover:text-amber-800 transition-colors py-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleBrand(b.id)}
                        className="w-4 h-4 rounded border-stone-300 text-amber-800 focus:ring-amber-700 cursor-pointer"
                      />
                      <span className={isChecked ? 'font-bold text-amber-900' : ''}>{b.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Range Filter Group */}
            <div className="border-t border-stone-100 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3">
                Khoảng Giá (VND)
              </h3>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="50000000"
                  step="500000"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  className="w-full accent-amber-800 cursor-pointer"
                />
                <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
                  <span>0 ₫</span>
                  <span className="text-amber-900 font-bold bg-amber-50 px-2 py-1 rounded">
                    {formatCurrency(priceRange.max)}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid / List Area */}
          <div className="lg:col-span-9">
            {isLoading ? (
              <ProductGridSkeleton count={viewMode === 'list' ? 4 : 6} />
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-stone-200/80 text-center shadow-sm">
                <p className="font-serif text-xl font-bold text-stone-900 mb-2">
                  Không tìm thấy sản phẩm nào
                </p>
                <p className="text-xs text-stone-500 max-w-md mx-auto mb-6">
                  Vui lòng thử điều chỉnh bộ lọc, khoảng giá hoặc từ khóa tìm kiếm để khám phá các sản phẩm khác.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <RotateCcw size={14} />
                  <span>Xóa bộ lọc</span>
                </button>
              </div>
            ) : viewMode === 'list' ? (
              <div className="flex flex-col gap-4">
                {filteredProducts.map((product) => (
                  <ProductCardWithVariants key={product.id} product={product} isListView={true} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCardWithVariants key={product.id} product={product} isListView={false} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductListPage;
