import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  Filter, SlidersHorizontal, Grid3X3, List, X, 
  RotateCcw, Search, AlertTriangle, RefreshCw,
  Heart, ShoppingBag, Eye, Star, ChevronRight, Home
} from 'lucide-react';
import { productAPI, categoryAPI, brandAPI } from '../../services/api';
import { useShop } from '../../context/ShopContext';
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
  const { wishlist, toggleWishlist, addToCart, setQuickViewProduct } = useShop();
  
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

    // Check media overrides
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
    };
  };

  // Fetch Data 100% from Backend API
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
    window.scrollTo({ top: 0, behavior: 'instant' });
    loadData();
  }, [loadData, categoryIdFromUrl]);

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
    <div className="w-full min-h-screen bg-[#FAF8F5] pt-6 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <nav 
            aria-label="Đường dẫn trang"
            className="flex items-center gap-2 text-xs sm:text-sm text-stone-600 font-medium"
          >
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-stone-500 hover:text-amber-800 transition-colors shrink-0"
            >
              <Home size={14} className="text-stone-400 shrink-0" />
              <span>Trang Chủ</span>
            </Link>
            <ChevronRight size={13} className="text-stone-400 shrink-0" />
            <span className="text-stone-900 font-semibold tracking-tight">
              {currentCategoryName}
            </span>
          </nav>

          <div className="text-xs text-stone-500 font-medium bg-white/60 backdrop-blur-xs px-3 py-1 rounded-full border border-stone-200/60 shadow-xs">
            Hiển thị <span className="font-bold text-stone-900">{filteredProducts.length}</span> sản phẩm
          </div>
        </div>

        {/* Khối Banner (Trên cùng): Tràn toàn bộ chiều ngang */}
        <div className="w-full bg-[#2A1810] text-white rounded-2xl p-6 sm:p-8 lg:p-10 mb-8 shadow-sm overflow-hidden">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-2 block">
              BỘ SƯU TẬP ĐỘC QUYỀN LUMORA
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight leading-snug">
              {currentCategoryName}
            </h1>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Khám phá không gian sống sang trọng với nghệ thuật thiết kế tối giản, chất liệu gỗ đạt chuẩn bảo tồn bền vững và hoàn thiện thủ công tinh xảo.
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
              onClick={loadData}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Thử lại</span>
            </button>
          </div>
        )}

        {/* Thanh Toolbar & Search */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          {/* Ô Tìm kiếm: Căn giữa icon kính lúp 100% theo chiều dọc bằng absolute inset-y-0 flex items-center */}
          <div className="relative w-full md:w-96">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Search className="w-5 h-5 text-stone-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm, chất liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full h-11 rounded-xl border border-stone-200 bg-white pl-11 pr-10 text-sm text-stone-800 placeholder-stone-400 outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Cụm Sắp xếp & Chế độ xem */}
          <div className="flex items-center gap-3 flex-wrap justify-end w-full md:w-auto">
            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Bộ lọc ({selectedCategories.length + selectedBrands.length})</span>
            </button>

            {/* Chỉ còn hàng toggle */}
            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer select-none bg-stone-50 px-3.5 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 transition-colors">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-amber-800 focus:ring-amber-800 cursor-pointer"
              />
              <span>Chỉ còn hàng</span>
            </label>

            {/* Sắp xếp */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 hidden sm:inline">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-amber-800 cursor-pointer"
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
                <option value="rating">Đánh giá cao nhất</option>
              </select>
            </div>

            {/* Chế độ xem Grid / List */}
            <div className="border border-stone-200 rounded-xl p-1 flex items-center shrink-0 gap-1 bg-stone-50">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-white'
                }`}
                title="Chế độ xem lưới (Grid)"
                aria-label="Chế độ xem lưới"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-white'
                }`}
                title="Chế độ xem danh sách (List)"
                aria-label="Chế độ xem danh sách"
              >
                <List className="w-4 h-4" />
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

        {/* Bố cục Thân trang (Sidebar + Product Grid): Bọc 2 cột trong flex flex-col lg:flex-row gap-8 items-start */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Bộ lọc (Bên trái): w-full lg:w-64 shrink-0 bg-white p-5 rounded-xl border border-gray-100 */}
          <aside 
            className={`w-full lg:w-64 shrink-0 bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-6 ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}`}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #F3F4F6',
              padding: '20px',
              boxSizing: 'border-box'
            }}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3" style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
              <h2 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2" style={{ margin: 0 }}>
                <Filter className="w-4 h-4 text-amber-800" />
                <span>Bộ Lọc</span>
              </h2>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-stone-500 hover:text-amber-800 flex items-center gap-1 transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại</span>
              </button>
            </div>

            {/* Category Filter Group: Mỗi dòng danh mục dùng flex items-center justify-between py-1.5 */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-2.5" style={{ margin: '0 0 8px 0', fontSize: '12px' }}>
                Danh Mục
              </h3>
              <div className="space-y-1">
                {categoriesData.map((cat) => {
                  const isChecked = selectedCategories.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className="flex items-center justify-between py-1.5 text-sm text-stone-700 cursor-pointer hover:text-amber-800 transition-colors"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategory(cat.id)}
                          className="w-4 h-4 rounded border-gray-300 text-amber-800 focus:ring-amber-800 cursor-pointer shrink-0"
                        />
                        <span className={`truncate ${isChecked ? 'font-bold text-amber-900' : ''}`} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {formatCategoryName(cat.name)}
                        </span>
                      </div>
                      {cat.count > 0 && (
                        <span 
                          className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full shrink-0"
                          style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#F3F4F6', color: '#6B7280', flexShrink: 0 }}
                        >
                          {cat.count}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Brand Filter Group: Mỗi dòng brand dùng flex items-center justify-between py-1.5 */}
            <div className="border-t border-gray-100 pt-4" style={{ borderTop: '1px solid #F3F4F6', paddingTop: '16px' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-2.5" style={{ margin: '0 0 8px 0', fontSize: '12px' }}>
                Thương Hiệu
              </h3>
              <div className="space-y-1">
                {brandsData.map((b) => {
                  const isChecked = selectedBrands.includes(b.id);
                  return (
                    <label
                      key={b.id}
                      className="flex items-center justify-between py-1.5 text-sm text-stone-700 cursor-pointer hover:text-amber-800 transition-colors"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBrand(b.id)}
                          className="w-4 h-4 rounded border-gray-300 text-amber-800 focus:ring-amber-800 cursor-pointer shrink-0"
                        />
                        <span className={`truncate ${isChecked ? 'font-bold text-amber-900' : ''}`} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.name}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Range Filter Group */}
            <div className="border-t border-gray-100 pt-4 space-y-3" style={{ borderTop: '1px solid #F3F4F6', paddingTop: '16px' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800" style={{ margin: '0 0 8px 0', fontSize: '12px' }}>
                Khoảng Giá
              </h3>
              <input
                type="range"
                min="0"
                max="50000000"
                step="500000"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                className="w-full accent-amber-800 cursor-pointer"
                style={{ width: '100%' }}
              />
              <div className="grid grid-cols-2 gap-2 text-xs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div>
                  <span className="text-stone-400 block mb-1" style={{ display: 'block', marginBottom: '4px', color: '#9CA3AF' }}>Từ (Min)</span>
                  <div className="p-2 bg-stone-50 border border-gray-200 rounded text-stone-800 font-medium" style={{ padding: '6px 8px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '4px' }}>
                    0 ₫
                  </div>
                </div>
                <div>
                  <span className="text-stone-400 block mb-1" style={{ display: 'block', marginBottom: '4px', color: '#9CA3AF' }}>Đến (Max)</span>
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-900 font-bold truncate" style={{ padding: '6px 8px', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '4px', color: '#78350F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {formatCurrency(priceRange.max)}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Lưới Sản phẩm (Bên phải): flex-1 w-full */}
          <div className="flex-1 w-full min-w-0">
            {isLoading ? (
              /* Loading Skeleton thuần Tailwind */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse space-y-4">
                    <div className="aspect-[4/3] w-full bg-gray-200 rounded-lg"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-9 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center shadow-sm" style={{ backgroundColor: '#FFFFFF', padding: '48px', borderRadius: '16px', border: '1px solid #F3F4F6', textAlign: 'center' }}>
                <p className="font-serif text-xl font-bold text-stone-900 mb-2 leading-snug" style={{ margin: '0 0 8px 0', fontSize: '20px' }}>
                  Không tìm thấy sản phẩm nào
                </p>
                <p className="text-xs text-stone-500 max-w-md mx-auto mb-6 leading-relaxed" style={{ margin: '0 auto 24px auto', fontSize: '13px', color: '#6B7280', maxWidth: '400px' }}>
                  Vui lòng thử điều chỉnh bộ lọc, khoảng giá hoặc từ khóa tìm kiếm để khám phá các sản phẩm khác.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
                  style={{ padding: '8px 16px', backgroundColor: '#92400E', color: '#FFFFFF', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Xóa bộ lọc</span>
                </button>
              </div>
            ) : viewMode === 'list' ? (
              /* Danh sách sản phẩm dạng List thuần Tailwind */
              <div className="flex flex-col gap-4">
                {filteredProducts.map((product) => {
                  const isWishlisted = wishlist.includes(String(product.id || product._id));
                  return (
                    <article 
                      key={product.id}
                      className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col sm:flex-row"
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                        overflow: 'hidden',
                        display: 'flex',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div className="w-full sm:w-64 h-56 bg-gray-50 relative shrink-0" style={{ position: 'relative' }}>
                        <Link to={`/product/${product.slug || product._id || product.id}`} className="block w-full h-full">
                          <img
                            src={product.image}
                            alt={product.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            loading="lazy"
                          />
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(String(product.id || product._id));
                          }}
                          className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-colors ${
                            isWishlisted 
                              ? 'bg-amber-800 text-white' 
                              : 'bg-white/90 text-stone-700 hover:bg-white hover:text-amber-800'
                          }`}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            padding: '8px',
                            borderRadius: '50%',
                            backgroundColor: isWishlisted ? '#92400E' : 'rgba(255,255,255,0.9)',
                            color: isWishlisted ? '#FFFFFF' : '#374151',
                            border: 'none',
                            cursor: 'pointer',
                            zIndex: 2
                          }}
                          aria-label={isWishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                        >
                          <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      <div className="p-5 flex flex-col flex-1 justify-between gap-3" style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                        <div>
                          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span className="font-semibold uppercase tracking-wider text-amber-800" style={{ color: '#92400E', fontWeight: 600 }}>
                              {product.categoryName}
                            </span>
                            <div className="flex items-center gap-1 text-amber-600 font-semibold text-xs" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706' }}>
                              <Star size={13} fill="currentColor" />
                              <span>{product.rating}</span>
                              <span className="text-stone-400 font-normal" style={{ color: '#9CA3AF' }}>({product.reviewCount})</span>
                            </div>
                          </div>

                          <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors leading-snug mb-2" style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1C1917' }}>
                            <Link to={`/product/${product.slug || product._id || product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              {product.name}
                            </Link>
                          </h3>

                          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3" style={{ margin: '0 0 12px 0', color: '#6B7280', fontSize: '13px' }}>
                            {product.shortDescription}
                          </p>

                          <div className="flex items-baseline gap-2" style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span className="font-bold text-amber-900 text-xl" style={{ color: '#78350F', fontWeight: 700, fontSize: '20px' }}>
                              {formatCurrency(product.basePrice)}
                            </span>
                            {product.oldPrice && (
                              <span className="text-xs text-stone-400 line-through" style={{ textDecoration: 'line-through', color: '#9CA3AF', fontSize: '13px' }}>
                                {formatCurrency(product.oldPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-3 border-t border-gray-100" style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '12px', borderTop: '1px solid #F3F4F6' }}>
                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            disabled={!product.inStock}
                            className="flex-1 py-2.5 px-4 bg-stone-900 hover:bg-amber-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                            style={{
                              flex: 1,
                              padding: '10px 16px',
                              backgroundColor: product.inStock ? '#1C1917' : '#9CA3AF',
                              color: '#FFFFFF',
                              borderRadius: '8px',
                              border: 'none',
                              cursor: product.inStock ? 'pointer' : 'not-allowed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              fontSize: '13px'
                            }}
                          >
                            <ShoppingBag size={14} />
                            <span>{product.inStock ? 'Thêm giỏ hàng' : 'Hết hàng'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickViewProduct(product)}
                            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
                            style={{ padding: '10px', backgroundColor: '#F3F4F6', color: '#374151', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                            title="Xem nhanh"
                            aria-label="Xem nhanh"
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
              /* Danh sách sản phẩm dạng Grid thuần Tailwind */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const isWishlisted = wishlist.includes(String(product.id || product._id));
                  return (
                    <article 
                      key={product.id}
                      className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        boxSizing: 'border-box'
                      }}
                    >
                      {/* Image Box */}
                      <div 
                        className="aspect-[4/3] w-full overflow-hidden bg-gray-50 relative shrink-0 block"
                        style={{ width: '100%', aspectRatio: '4/3', position: 'relative', overflow: 'hidden', backgroundColor: '#F9FAFB' }}
                      >
                        <Link to={`/product/${product.slug || product._id || product.id}`} className="block w-full h-full">
                          <img
                            src={product.image}
                            alt={product.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            loading="lazy"
                          />
                        </Link>

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none" style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 2 }}>
                          {product.isNew && (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-stone-900 text-white rounded" style={{ padding: '2px 8px', fontSize: '10px', backgroundColor: '#1C1917', color: '#FFFFFF', borderRadius: '4px' }}>
                              Mới
                            </span>
                          )}
                          {!product.inStock && (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white rounded" style={{ padding: '2px 8px', fontSize: '10px', backgroundColor: '#E11D48', color: '#FFFFFF', borderRadius: '4px' }}>
                              Hết Hàng
                            </span>
                          )}
                        </div>

                        {/* Wishlist Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(String(product.id || product._id));
                          }}
                          className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-colors ${
                            isWishlisted 
                              ? 'bg-amber-800 text-white' 
                              : 'bg-white/90 text-stone-700 hover:bg-white hover:text-amber-800'
                          }`}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            padding: '8px',
                            borderRadius: '50%',
                            backgroundColor: isWishlisted ? '#92400E' : 'rgba(255,255,255,0.9)',
                            color: isWishlisted ? '#FFFFFF' : '#374151',
                            border: 'none',
                            cursor: 'pointer',
                            zIndex: 2,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                          aria-label={isWishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                        >
                          <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      {/* Content Box */}
                      <div className="p-4 flex flex-col flex-1 justify-between gap-3" style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                        <div>
                          {/* Brand & Category & Rating */}
                          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '12px' }}>
                            <span className="font-semibold uppercase tracking-wider text-[11px] text-amber-800 truncate pr-2" style={{ color: '#92400E', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {product.categoryName}
                            </span>
                            <div className="flex items-center gap-1 text-amber-600 font-semibold text-xs shrink-0" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706', flexShrink: 0 }}>
                              <Star size={13} fill="currentColor" />
                              <span>{product.rating}</span>
                              <span className="text-stone-400 font-normal" style={{ color: '#9CA3AF' }}>({product.reviewCount})</span>
                            </div>
                          </div>

                          {/* Product Title */}
                          <h3 
                            className="font-serif text-base font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2 min-h-[3rem] leading-snug mb-2"
                            style={{
                              fontFamily: '"Cormorant Garamond", serif',
                              fontSize: '16px',
                              fontWeight: 700,
                              color: '#1C1917',
                              margin: '0 0 8px 0',
                              lineHeight: '1.35',
                              minHeight: '2.7rem',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            <Link to={`/product/${product.slug || product._id || product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              {product.name}
                            </Link>
                          </h3>

                          {/* Price */}
                          <div className="flex items-baseline gap-2 mb-2" style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                            <span className="font-bold text-amber-900 text-lg" style={{ color: '#78350F', fontWeight: 700, fontSize: '18px' }}>
                              {formatCurrency(product.basePrice)}
                            </span>
                            {product.oldPrice && (
                              <span className="text-xs text-stone-400 line-through" style={{ textDecoration: 'line-through', color: '#9CA3AF', fontSize: '12px' }}>
                                {formatCurrency(product.oldPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid #F3F4F6' }}>
                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            disabled={!product.inStock}
                            className="flex-1 py-2 px-3 bg-stone-900 hover:bg-amber-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              backgroundColor: product.inStock ? '#1C1917' : '#9CA3AF',
                              color: '#FFFFFF',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 600,
                              border: 'none',
                              cursor: product.inStock ? 'pointer' : 'not-allowed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            <ShoppingBag size={14} />
                            <span>{product.inStock ? 'Thêm giỏ' : 'Hết hàng'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickViewProduct(product)}
                            className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
                            style={{
                              padding: '8px',
                              backgroundColor: '#F3F4F6',
                              color: '#374151',
                              borderRadius: '8px',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Xem nhanh"
                            aria-label="Xem nhanh"
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
  );
}

export default ProductListPage;
