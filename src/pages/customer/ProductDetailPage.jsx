import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Heart, ShoppingBag, Star, Check, ShieldCheck, Truck, 
  ChevronRight, ZoomIn, Info, AlertTriangle, Award, Wifi, Database 
} from 'lucide-react';
import { MOCK_PRODUCTS } from '../../data/mockProducts';
import { productAPI } from '../../services/api';
import { useShop } from '../../context/ShopContext';
import { ProductDetailSkeleton } from '../../components/common/ProductSkeleton';

export function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart, wishlist, toggleWishlist, setIsCartOpen } = useShop();

  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [isUsingRealApi, setIsUsingRealApi] = useState(false);

  // Gallery & Image State
  const [selectedImage, setSelectedImage] = useState('');
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  // Variant Selection State
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Tab State
  const [activeTab, setActiveTab] = useState('description');

  // Load product from API or Fallback Mock
  useEffect(() => {
    let isMounted = true;
    async function fetchProduct() {
      setIsLoading(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      try {
        // Try getting single product or searching products list from real API
        let realProd = null;
        if (slug) {
          try {
            const res = await productAPI.getProductById(slug);
            if (res && (res._id || res.id)) {
              realProd = res;
            }
          } catch {
            // Fallback try getProducts
            const listRes = await productAPI.getProducts();
            const list = Array.isArray(listRes) ? listRes : listRes?.products || [];
            realProd = list.find((p) => p.slug === slug || p._id === slug) || null;
          }
        }

        if (!isMounted) return;

        if (realProd) {
          const fallbackMock = MOCK_PRODUCTS[0];
          const formatted = {
            id: realProd._id || realProd.id,
            name: realProd.name || 'Sản phẩm nội thất',
            slug: realProd.slug || realProd._id,
            categoryId: typeof realProd.categoryId === 'object' ? realProd.categoryId?._id : realProd.categoryId,
            categoryName: typeof realProd.categoryId === 'object' ? realProd.categoryId?.name : 'Nội thất',
            brandId: typeof realProd.brandId === 'object' ? realProd.brandId?._id : realProd.brandId,
            brandName: typeof realProd.brandId === 'object' ? realProd.brandId?.name : 'FurnitureHub',
            basePrice: realProd.price || realProd.basePrice || 1200,
            oldPrice: realProd.oldPrice || null,
            rating: realProd.rating || 4.9,
            reviewCount: realProd.reviewCount || 28,
            isNew: realProd.isNew !== undefined ? realProd.isNew : true,
            inStock: realProd.inStock !== undefined ? realProd.inStock : (realProd.stock ? realProd.stock > 0 : true),
            shortDescription: realProd.description || 'Chế tác từ chất liệu cao cấp.',
            description: realProd.description || fallbackMock.description,
            colors: realProd.colors || fallbackMock.colors,
            sizes: realProd.sizes || fallbackMock.sizes,
            materials: realProd.materials || fallbackMock.materials,
            gallery: realProd.images || realProd.gallery || [realProd.image || fallbackMock.image],
            image: realProd.image || realProd.images?.[0] || fallbackMock.image,
            skuMatrix: realProd.skuMatrix || fallbackMock.skuMatrix,
            specifications: realProd.specifications || fallbackMock.specifications,
            reviews: realProd.reviews || fallbackMock.reviews,
          };

          setProduct(formatted);
          setIsUsingRealApi(true);
        } else {
          // Fallback to Mock Data by slug match or default
          const mockMatch = MOCK_PRODUCTS.find((p) => p.slug === slug) || MOCK_PRODUCTS[0];
          setProduct(mockMatch);
          setIsUsingRealApi(false);
        }
      } catch {
        if (isMounted) {
          const mockMatch = MOCK_PRODUCTS.find((p) => p.slug === slug) || MOCK_PRODUCTS[0];
          setProduct(mockMatch);
          setIsUsingRealApi(false);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  // Initialize selected variants when product changes
  useEffect(() => {
    if (product) {
      const defaultCol = product.colors?.[0] || null;
      const defaultSize = product.sizes?.[0] || null;
      const defaultMaterial = product.materials?.[0] || null;

      setSelectedColor(defaultCol);
      setSelectedSize(defaultSize);
      setSelectedMaterial(defaultMaterial);
      setSelectedImage(defaultCol?.image || product.gallery?.[0] || product.image);
      setQuantity(1);
    }
  }, [product]);

  // Handle Color Swatch Selection -> Automatically updates Gallery Main Image!
  const handleColorSelect = (colorObj) => {
    setSelectedColor(colorObj);
    if (colorObj.image) {
      setSelectedImage(colorObj.image);
    }
  };

  // Compute SKU Matrix Key & Real-time Variant Stock & Price
  const variantSKUKey = useMemo(() => {
    if (!selectedColor || !selectedSize || !selectedMaterial) return '';
    return `${selectedColor.id}_${selectedSize.id}_${selectedMaterial.id}`;
  }, [selectedColor, selectedSize, selectedMaterial]);

  const skuInfo = useMemo(() => {
    if (!product) return { stock: 0, price: 0 };
    if (!product.skuMatrix) {
      return {
        stock: product.inStock ? 10 : 0,
        price: product.basePrice,
      };
    }
    const match = product.skuMatrix[variantSKUKey];
    if (match) {
      return match;
    }
    const extraPrice = (selectedSize?.priceAdjustment || 0) + (selectedMaterial?.priceAdjustment || 0);
    return {
      stock: product.inStock ? 5 : 0,
      price: product.basePrice + extraPrice,
    };
  }, [product, variantSKUKey, selectedSize, selectedMaterial]);

  if (isLoading || !product) {
    return <ProductDetailSkeleton />;
  }

  const isWishlisted = wishlist.includes(product.id);
  const isOutOfStock = skuInfo.stock <= 0;

  // Add to Cart handler with full variant payload
  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const cartProductPayload = {
      ...product,
      price: skuInfo.price,
      selectedVariant: {
        color: selectedColor?.name,
        size: selectedSize?.name,
        material: selectedMaterial?.name,
      },
    };
    addToCart(cartProductPayload, quantity);
    setIsCartOpen(true);
  };

  return (
    <div className="bg-stone-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation & API Badge */}
        <div className="flex items-center justify-between mb-6">
          <nav className="flex items-center gap-2 text-xs text-stone-500">
            <Link to="/" className="hover:text-amber-800 transition-colors">Trang Chủ</Link>
            <ChevronRight size={12} />
            <Link to={`/category/${product.categoryId}`} className="hover:text-amber-800 transition-colors">
              {product.categoryName}
            </Link>
            <ChevronRight size={12} />
            <span className="text-stone-900 font-medium truncate max-w-xs">{product.name}</span>
          </nav>

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

        {/* Product Main Section (2 Columns) */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 lg:p-10 shadow-sm mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Product Image Gallery */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/60 group">
                <img
                  src={selectedImage || product.gallery?.[0] || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                
                <button
                  type="button"
                  onClick={() => setIsZoomModalOpen(true)}
                  className="absolute bottom-4 right-4 p-2.5 bg-white/90 hover:bg-white text-stone-800 rounded-full shadow-lg transition-all"
                  title="Phóng to ảnh"
                >
                  <ZoomIn size={18} />
                </button>

                <div className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-md text-amber-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                  <Award size={13} />
                  <span>Gỗ Chuẩn FSC® 100%</span>
                </div>
              </div>

              {/* Thumbnails Strip */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.gallery?.map((imgUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === imgUrl
                        ? 'border-amber-800 ring-2 ring-amber-800/30 scale-95'
                        : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Metadata & Variant Picker */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md">
                    {product.brandName}
                  </span>
                  <div className="flex items-center gap-1 text-amber-600 text-xs font-bold">
                    <Star size={14} fill="currentColor" />
                    <span>{product.rating}</span>
                    <span className="text-stone-400 font-normal">({product.reviewCount} đánh giá)</span>
                  </div>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-3 leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-serif text-3xl font-bold text-amber-900">
                    ${skuInfo.price.toLocaleString()}
                  </span>
                  {product.oldPrice && (
                    <span className="text-sm text-stone-400 line-through">
                      ${(product.oldPrice + (skuInfo.price - product.basePrice)).toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Bao gồm thuế VAT
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6 border-b border-stone-100 pb-4">
                  {product.shortDescription}
                </p>

                {/* VARIANT PICKER */}
                <div className="space-y-5 mb-6">
                  {/* 1. Colors */}
                  {product.colors && (
                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold mb-2">
                        <span className="text-stone-800">Màu Sắc (Color):</span>
                        <span className="text-amber-900 font-bold">{selectedColor?.name}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {product.colors.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleColorSelect(c)}
                            className={`relative w-8 h-8 rounded-full border border-stone-300 transition-all ${
                              selectedColor?.id === c.id
                                ? 'ring-2 ring-amber-800 ring-offset-2 scale-110'
                                : 'hover:scale-105 opacity-85 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Sizes */}
                  {product.sizes && (
                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold mb-2">
                        <span className="text-stone-800">Kích Thước (Size):</span>
                        <span className="text-amber-900 font-bold">{selectedSize?.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {product.sizes.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSelectedSize(s)}
                            className={`py-2 px-3 text-xs rounded-xl border text-center transition-all ${
                              selectedSize?.id === s.id
                                ? 'border-amber-800 bg-amber-900 text-white font-semibold shadow-sm'
                                : 'border-stone-200 text-stone-700 bg-stone-50 hover:bg-stone-100'
                            }`}
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Materials */}
                  {product.materials && (
                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold mb-2">
                        <span className="text-stone-800">Chất Liệu (Material):</span>
                        <span className="text-amber-900 font-bold">{selectedMaterial?.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.materials.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setSelectedMaterial(m)}
                            className={`py-2 px-3 text-xs rounded-xl border transition-all ${
                              selectedMaterial?.id === m.id
                                ? 'border-amber-800 bg-amber-900 text-white font-semibold shadow-sm'
                                : 'border-stone-200 text-stone-700 bg-stone-50 hover:bg-stone-100'
                            }`}
                          >
                            {m.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stock Status Badge */}
                <div className="mb-6">
                  {isOutOfStock ? (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                      <AlertTriangle size={16} />
                      <span className="font-bold">Hết hàng:</span> Tạm thời hết biến thể này trong kho.
                    </div>
                  ) : skuInfo.stock <= 3 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2">
                      <Info size={16} />
                      <span className="font-bold">Sắp hết hàng:</span> Chỉ còn {skuInfo.stock} chiếc sẵn sàng giao!
                    </div>
                  ) : (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2 font-semibold">
                      <Check size={16} className="text-emerald-600" />
                      <span>Còn hàng ({skuInfo.stock} sản phẩm sẵn có)</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 px-2 h-12 w-32 justify-between">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="p-1.5 text-stone-600 hover:text-stone-900 disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="font-bold text-stone-900 text-sm">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(skuInfo.stock, q + 1))}
                      disabled={quantity >= skuInfo.stock || isOutOfStock}
                      className="p-1.5 text-stone-600 hover:text-stone-900 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex-1 h-12 bg-stone-900 hover:bg-amber-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag size={18} />
                    <span>Thêm Vào Giỏ Hàng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className={`h-12 w-12 rounded-xl border flex items-center justify-center transition-all ${
                      isWishlisted
                        ? 'border-amber-800 bg-amber-800 text-white'
                        : 'border-stone-200 text-stone-700 hover:border-amber-800 hover:text-amber-800'
                    }`}
                    title={isWishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                  >
                    <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-amber-800" />
                    <span>Miễn phí giao White Glove</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-amber-800" />
                    <span>Bảo hành khung gỗ 10 năm</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Tabbed Info */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 lg:p-10 shadow-sm mb-12">
          <div className="flex border-b border-stone-200 gap-8 mb-8 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('description')}
              className={`pb-4 font-serif text-lg font-bold border-b-2 transition-all ${
                activeTab === 'description'
                  ? 'border-amber-800 text-amber-900'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Mô Tả Sản Phẩm
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`pb-4 font-serif text-lg font-bold border-b-2 transition-all ${
                activeTab === 'specs'
                  ? 'border-amber-800 text-amber-900'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Thông Số Kỹ Thuật
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 font-serif text-lg font-bold border-b-2 transition-all ${
                activeTab === 'reviews'
                  ? 'border-amber-800 text-amber-900'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Đánh Giá Khách Hàng ({product.reviewCount})
            </button>
          </div>

          {activeTab === 'description' && (
            <div className="prose max-w-none text-stone-700 text-sm leading-relaxed space-y-4">
              <p className="text-base text-stone-800 font-medium">{product.description}</p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-stone-700 border-collapse">
                <tbody>
                  {product.specifications?.map((spec, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-stone-50' : 'bg-white'}>
                      <td className="py-3 px-4 font-bold text-stone-900 w-1/3 border-b border-stone-100">{spec.label}</td>
                      <td className="py-3 px-4 border-b border-stone-100">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => (
                  <div key={rev.id} className="border-b border-stone-100 pb-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={rev.avatar} alt={rev.userName} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <h5 className="font-bold text-stone-900 text-xs">{rev.userName}</h5>
                          <span className="text-[11px] text-stone-400">{rev.date}</span>
                        </div>
                      </div>
                      <div className="flex text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-stone-600">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-500 italic">Chưa có đánh giá nào cho sản phẩm này.</p>
              )}
            </div>
          )}
        </div>

      </div>

      {isZoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setIsZoomModalOpen(false)}
            className="absolute top-6 right-6 text-white text-lg font-bold bg-stone-800 p-2 rounded-full"
          >
            ✕
          </button>
          <img
            src={selectedImage || product.image}
            alt={product.name}
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
          />
        </div>
      )}
    </div>
  );
}

export default ProductDetailPage;
