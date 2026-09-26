import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  Filter, SlidersHorizontal, Grid3X3, Grid2X2, X, 
  RotateCcw, Search, Wifi, Database 
} from 'lucide-react';
import { MOCK_PRODUCTS, CATEGORIES as MOCK_CATEGORIES, BRANDS as MOCK_BRANDS } from '../../data/mockProducts';
import { productAPI, categoryAPI, brandAPI } from '../../services/api';
import ProductCardWithVariants from '../../components/product/ProductCardWithVariants';
import { ProductGridSkeleton } from '../../components/common/ProductSkeleton';

export function ProductListPage() {
  const { id: categoryIdFromUrl } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Loading & API Status State
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingRealApi, setIsUsingRealApi] = useState(false);
  const [productsData, setProductsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [brandsData, setBrandsData] = useState([]);

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Toolbar & View States
  const [sortBy, setSortBy] = useState('newest'); // newest | price-asc | price-desc | bestseller | rating
  const [viewMode, setViewMode] = useState('grid3'); // grid3 | grid4 | list
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Fetch Data (Try Real Backend API First, Fallback to Mock)
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [prodRes, catRes, brandRes] = await Promise.allSettled([
          productAPI.getProducts(),
          categoryAPI.getCategories(),
          brandAPI.getBrands(),
        ]);

        if (!isMounted) return;

        let realProds = [];
        let realCats = [];
        let realBrands = [];

        if (prodRes.status === 'fulfilled' && prodRes.value) {
          const res = prodRes.value;
          const rawProds = Array.isArray(res) ? res : res.products || res.data || [];
          if (rawProds.length > 0) {
            // Map real API schema to component schema
            realProds = rawProds.map((p, idx) => ({
              id: p._id || p.id || `real-${idx}`,
              name: p.name || 'Sản phẩm nội thất',
              slug: p.slug || p._id || `product-${idx}`,
              categoryId: typeof p.categoryId === 'object' ? p.categoryId?._id : (p.categoryId || 'living-room'),
              categoryName: typeof p.categoryId === 'object' ? p.categoryId?.name : 'Nội thất',
              brandId: typeof p.brandId === 'object' ? p.brandId?._id : (p.brandId || 'lumora-atelier'),
              brandName: typeof p.brandId === 'object' ? p.brandId?.name : 'FurnitureHub',
              basePrice: p.price || p.basePrice || 1200,
              oldPrice: p.oldPrice || null,
              rating: p.rating || 4.8,
              reviewCount: p.reviewCount || 15,
              isNew: p.isNew !== undefined ? p.isNew : true,
              isBestSeller: p.isBestSeller || false,
              inStock: p.inStock !== undefined ? p.inStock : (p.stock ? p.stock > 0 : true),
              shortDescription: p.description || p.shortDescription || 'Sản phẩm chế tác cao cấp.',
              description: p.description || 'Nội thất cao cấp từ thương hiệu FurnitureHub.',
              colors: p.colors || MOCK_PRODUCTS[idx % MOCK_PRODUCTS.length].colors,
              sizes: p.sizes || MOCK_PRODUCTS[idx % MOCK_PRODUCTS.length].sizes,
              materials: p.materials || MOCK_PRODUCTS[idx % MOCK_PRODUCTS.length].materials,
              gallery: p.images || p.gallery || [p.image || MOCK_PRODUCTS[idx % MOCK_PRODUCTS.length].image],
              image: p.image || p.images?.[0] || MOCK_PRODUCTS[idx % MOCK_PRODUCTS.length].image,
            }));
          }
        }

        if (catRes.status === 'fulfilled' && catRes.value) {
          const res = catRes.value;
          const rawCats = Array.isArray(res) ? res : res.categories || res.data || [];
          if (rawCats.length > 0) {
            realCats = rawCats.map((c) => ({
              id: c._id || c.id,
              name: c.name,
              count: c.productCount || 12,
            }));
          }
        }

        if (brandRes.status === 'fulfilled' && brandRes.value) {
          const res = brandRes.value;
          const rawBrands = Array.isArray(res) ? res : res.brands || res.data || [];
          if (rawBrands.length > 0) {
            realBrands = rawBrands.map((b) => ({
              id: b._id || b.id,
              name: b.name,
            }));
          }
        }

        if (realProds.length > 0) {
          setProductsData(realProds);
          setCategoriesData(realCats.length > 0 ? realCats : MOCK_CATEGORIES);
          setBrandsData(realBrands.length > 0 ? realBrands : MOCK_BRANDS);
          setIsUsingRealApi(true);
        } else {
          // Fallback to Mock Data
          setProductsData(MOCK_PRODUCTS);
          setCategoriesData(MOCK_CATEGORIES);
          setBrandsData(MOCK_BRANDS);
          setIsUsingRealApi(false);
        }
      } catch (err) {
        if (isMounted) {
          setProductsData(MOCK_PRODUCTS);
          setCategoriesData(MOCK_CATEGORIES);
          setBrandsData(MOCK_BRANDS);
          setIsUsingRealApi(false);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
  }, []);

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
    setPriceRange({ min: 0, max: 5000 });
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

      // Price filter
      if (product.basePrice < priceRange.min || product.basePrice > priceRange.max) {
        return false;
      }

      // Stock filter
      if (onlyInStock && !product.inStock) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
      if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'bestseller') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    });
  }, [productsData, selectedCategories, selectedBrands, priceRange, onlyInStock, searchQuery, sortBy]);

  // Active Category Name for Breadcrumb
  const currentCategoryName = useMemo(() => {
    if (selectedCategories.length === 1) {
      const match = categoriesData.find((c) => c.id === selectedCategories[0]);
      return match ? match.name : 'Tất Cả Sản Phẩm';
    }
    return 'Tất Cả Sản Phẩm';
  }, [selectedCategories, categoriesData]);

  return (
    <div className="bg-stone-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Header */}
        <div className="mb-6 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs text-stone-500">
            <Link to="/" className="hover:text-amber-800 transition-colors">Trang Chủ</Link>
            <span>/</span>
            <span className="text-stone-900 font-medium">{currentCategoryName}</span>
          </nav>

          {/* API Data Source Indicator Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-200 rounded-full shadow-xs text-[11px] font-medium text-stone-600">
            {isUsingRealApi ? (
              <>
                <Wifi size={13} className="text-emerald-600 animate-pulse" />
                <span className="text-emerald-800 font-bold">API Server Railway</span>
              </>
            ) : (
              <>
                <Database size={13} className="text-amber-600" />
                <span className="text-amber-900">Data Mock Standard</span>
              </>
            )}
          </div>
        </div>

        {/* Page Banner Header */}
        <div className="mb-8 p-8 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 block">
              Bộ Sưu Tập Độc Quyền FurnitureHub
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
              {currentCategoryName}
            </h1>
            <p className="text-stone-300 text-sm leading-relaxed">
              Khám phá không gian sống sang trọng với nghệ thuật thiết kế tối giản, chất liệu gỗ đạt chuẩn bảo tồn bền vững và hoàn thiện thủ công tinh xảo.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Toolbar Header */}
        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-2"
            >
              <SlidersHorizontal size={15} />
              <span>Bộ lọc ({selectedCategories.length + selectedBrands.length})</span>
            </button>

            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              Hiển thị <span className="font-bold text-stone-900">{filteredProducts.length}</span> sản phẩm
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-1.5 pl-8 pr-3 bg-stone-100 border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-700 w-44 lg:w-56"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-stone-400" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 hidden sm:inline">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-1.5 px-3 bg-stone-100 border border-stone-200 text-stone-800 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-700 cursor-pointer"
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
                <option value="bestseller">Bán chạy nhất</option>
                <option value="rating">Đánh giá cao nhất</option>
              </select>
            </div>

            <div className="hidden sm:flex items-center border border-stone-200 rounded-lg p-0.5 bg-stone-50">
              <button
                type="button"
                onClick={() => setViewMode('grid3')}
                className={`p-1.5 rounded ${viewMode === 'grid3' ? 'bg-white shadow text-amber-900' : 'text-stone-400 hover:text-stone-700'}`}
                title="Lưới 3 cột"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid4')}
                className={`p-1.5 rounded ${viewMode === 'grid4' ? 'bg-white shadow text-amber-900' : 'text-stone-400 hover:text-stone-700'}`}
                title="Lưới 4 cột"
              >
                <Grid2X2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(selectedCategories.length > 0 || selectedBrands.length > 0 || onlyInStock || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
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
                Danh Mục (Category)
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
                        <span className={isChecked ? 'font-bold text-amber-900' : ''}>{cat.name}</span>
                      </div>
                      {cat.count && <span className="text-[11px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{cat.count}</span>}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Brand Filter Group */}
            <div className="border-t border-stone-100 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3">
                Thương Hiệu (Brand)
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
                Khoảng Giá (Price Range)
              </h3>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  className="w-full accent-amber-800 cursor-pointer"
                />
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>${priceRange.min}</span>
                  <span className="font-bold text-amber-900">${priceRange.max.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Stock Filter Group */}
            <div className="border-t border-stone-100 pt-5">
              <label className="flex items-center gap-2.5 text-xs text-stone-800 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-amber-800 focus:ring-amber-700 cursor-pointer"
                />
                <span>Chỉ hiển thị sản phẩm còn hàng</span>
              </label>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-9">
            {isLoading ? (
              <ProductGridSkeleton count={6} />
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center my-4">
                <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={28} />
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
                  Không tìm thấy sản phẩm phù hợp
                </h3>
                <p className="text-sm text-stone-500 max-w-md mx-auto mb-6">
                  Rất tiếc, không có món nội thất nào khớp với bộ lọc hoặc từ khóa tìm kiếm của bạn. Hãy thử thay đổi khoảng giá hoặc danh mục.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="py-2.5 px-6 bg-stone-900 hover:bg-amber-900 text-white font-semibold text-xs rounded-xl shadow-md transition-colors inline-flex items-center gap-2"
                >
                  <RotateCcw size={14} />
                  <span>Xóa tất cả bộ lọc</span>
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid4' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}>
                {filteredProducts.map((product) => (
                  <ProductCardWithVariants key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Drawer Filter Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <h2 className="font-serif text-lg font-bold">Bộ Lọc</h2>
                <button onClick={() => setIsMobileFilterOpen(false)}><X size={20} /></button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase text-stone-800 mb-3">Danh Mục</h3>
                  {categoriesData.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 py-1 text-xs">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase text-stone-800 mb-3">Thương Hiệu</h3>
                  {brandsData.map((b) => (
                    <label key={b.id} className="flex items-center gap-2 py-1 text-xs">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(b.id)}
                        onChange={() => toggleBrand(b.id)}
                      />
                      <span>{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-3 bg-stone-900 text-white font-bold rounded-xl mt-6"
            >
              Áp dụng bộ lọc ({filteredProducts.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductListPage;
