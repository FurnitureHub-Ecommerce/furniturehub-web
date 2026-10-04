import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Heart, ShoppingBag, Star, Check, ShieldCheck, Truck, 
  ChevronRight, ZoomIn, Info, AlertTriangle, Award, Wifi, RefreshCw, ArrowLeft
} from 'lucide-react';
import { productAPI, reviewAPI } from '../../services/api';
import { useShop } from '../../context/ShopContext';
import { ProductDetailSkeleton } from '../../components/common/ProductSkeleton';
import { 
  formatCurrency, 
  formatCategoryName, 
  PRODUCT_IMAGE_OVERRIDES, 
  getProductMetrics 
} from '../../utils/formatters';

export function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart, wishlist, toggleWishlist, setIsCartOpen } = useShop();

  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [apiError, setApiError] = useState(null);

  // Gallery & Image State
  const [selectedImage, setSelectedImage] = useState('');
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Tab State
  const [activeTab, setActiveTab] = useState('description');

  // Load product & variants from API
  useEffect(() => {
    let isMounted = true;
    async function fetchProduct() {
      setIsLoading(true);
      setApiError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      try {
        let realProd = null;
        if (slug) {
          try {
            const res = await productAPI.getProductById(slug);
            const found = res.data?.product || (res.data?._id ? res.data : null);
            if (found) realProd = found;
          } catch {
            // Fallback: search products list by slug or ID
            const listRes = await productAPI.getProducts();
            const list = listRes.data?.products || [];
            realProd = list.find((p) => p.slug === slug || p._id === slug) || null;
          }
        }

        if (!isMounted) return;

        if (realProd) {
          const prodId = realProd._id || realProd.id;
          
          // Fetch variants for this product
          let loadedVariants = [];
          try {
            const varRes = await productAPI.getProductVariants(prodId);
            loadedVariants = varRes.data?.variants || [];
          } catch (vErr) {
            console.warn('Could not load variants:', vErr.message);
          }

          // Fetch reviews
          let loadedReviews = [];
          try {
            const revRes = await reviewAPI.getProductReviews(prodId);
            loadedReviews = revRes.data?.reviews || [];
          } catch (rErr) {
            console.warn('Could not load reviews:', rErr.message);
          }

          const categoryObj = typeof realProd.categoryId === 'object' && realProd.categoryId !== null ? realProd.categoryId : null;
          const brandObj = typeof realProd.brandId === 'object' && realProd.brandId !== null ? realProd.brandId : null;
          const overrideImages = PRODUCT_IMAGE_OVERRIDES[realProd.name];
          const images = overrideImages || (Array.isArray(realProd.images) && realProd.images.length > 0 
            ? realProd.images 
            : [realProd.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80']);
          const metrics = getProductMetrics(realProd.name, realProd.rating, realProd.reviewCount);

          const formatted = {
            id: prodId,
            _id: prodId,
            name: realProd.name || 'Sản phẩm nội thất cao cấp',
            slug: realProd.slug || prodId,
            categoryId: categoryObj?._id || realProd.categoryId || '',
            categoryName: formatCategoryName(categoryObj?.name || 'Nội thất'),
            brandId: brandObj?._id || realProd.brandId || '',
            brandName: brandObj?.name || 'LUMORA Studio',
            basePrice: realProd.minPrice ?? realProd.price ?? 0,
            oldPrice: realProd.oldPrice || null,
            rating: metrics.rating,
            reviewCount: metrics.reviewCount,
            isNew: realProd.isNew !== undefined ? realProd.isNew : true,
            inStock: realProd.availableStock !== undefined ? realProd.availableStock > 0 : true,
            stockCount: realProd.availableStock ?? 15,
            shortDescription: realProd.description || 'Chế tác từ chất liệu thượng hạng, tối ưu công năng và thẩm mỹ.',
            description: realProd.description || 'Sản phẩm nội thất thiết kế theo phong cách tối giản cao cấp, tinh xảo từng đường nét mối nối, đảm bảo sự bền bỉ trường tồn cùng năm tháng.',
            gallery: images,
            image: images[0],
            specifications: realProd.specifications || {
              'Xuất xứ': 'Sản xuất thủ công tại xưởng LUMORA',
              'Vật liệu': 'Gỗ sồi Bắc Mỹ, Nỉ dệt chống xước, Thép sơn tĩnh điện',
              'Bảo hành': '10 năm kết cấu khung & 2 năm bề mặt',
              'Chứng nhận': 'FSC® 100% Gỗ rừng trồng bền vững',
              'Vận chuyển': 'Giao hàng và lắp ráp miễn phí toàn quốc',
            },
            reviews: loadedReviews,
          };

          setProduct(formatted);
          setVariants(loadedVariants);
          if (loadedVariants.length > 0) {
            setSelectedVariant(loadedVariants[0]);
          }
          setSelectedImage(images[0]);
          setReviews(loadedReviews);
        } else {
          setApiError('Không tìm thấy thông tin sản phẩm này trên hệ thống.');
        }
      } catch (err) {
        console.error('Fetch product detail failed:', err);
        if (isMounted) {
          setApiError(err.message || 'Lỗi khi tải thông tin sản phẩm.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (apiError || !product) {
    return (
      <div className="bg-stone-50 min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-stone-200/80 text-center shadow-sm">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} />
          </div>
          <h2 className="font-serif text-xl font-bold text-stone-900 mb-2">
            Không tìm thấy sản phẩm
          </h2>
          <p className="text-xs text-stone-500 mb-6">
            {apiError || 'Sản phẩm có thể đã ngừng kinh doanh hoặc đường dẫn không đúng.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Quay lại sản phẩm</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(String(product.id || product._id));
  const currentPrice = selectedVariant?.price ?? product.basePrice;
  const currentStock = selectedVariant?.availableStock ?? product.stockCount;
  const isOutOfStock = currentStock <= 0;

  // Add to Cart handler
  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const cartPayload = {
      ...product,
      variantId: selectedVariant?._id,
      price: currentPrice,
      variantLabel: selectedVariant ? [selectedVariant.color, selectedVariant.size, selectedVariant.material].filter(Boolean).join(' / ') : 'Tiêu chuẩn',
    };
    addToCart(cartPayload, quantity);
    setIsCartOpen(true);
  };

  const formatPrice = (p) => formatCurrency(p);

  return (
    <div className="bg-stone-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation & API Badge */}
        <div className="flex items-center justify-between mb-6">
          <nav className="flex items-center gap-2 text-xs text-stone-500">
            <Link to="/" className="hover:text-amber-800 transition-colors">Trang Chủ</Link>
            <ChevronRight size={12} />
            <Link to="/products" className="hover:text-amber-800 transition-colors">Sản phẩm</Link>
            <ChevronRight size={12} />
            <span className="text-stone-900 font-medium truncate max-w-xs">{product.name}</span>
          </nav>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-200 rounded-full shadow-xs text-[11px] font-medium text-emerald-800 bg-emerald-50">
            <Wifi size={13} className="text-emerald-600" />
            <span>Đồng bộ API Live</span>
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
                  <span>Chứng nhận FSC® 100%</span>
                </div>
              </div>

              {/* Thumbnails Strip */}
              {product.gallery?.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {product.gallery.map((imgUrl, index) => (
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
              )}
            </div>

            {/* Right Column: Details & Variant Selection */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                  <span className="font-semibold uppercase tracking-wider text-amber-800">
                    {product.brandName}
                  </span>
                  <div className="flex items-center gap-1.5 text-amber-600 font-semibold">
                    <Star size={14} fill="currentColor" />
                    <span>{product.rating}</span>
                    <span className="text-stone-400 font-normal">({product.reviewCount} đánh giá)</span>
                  </div>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight mb-3">
                  {product.name}
                </h1>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-bold text-amber-900 text-3xl font-serif">
                    {formatPrice(currentPrice)}
                  </span>
                  {product.oldPrice && (
                    <span className="text-sm text-stone-400 line-through">
                      {formatPrice(product.oldPrice)}
                    </span>
                  )}
                  {selectedVariant && (
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-50 text-amber-800 rounded">
                      SKU: {selectedVariant.sku}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {product.shortDescription}
                </p>
              </div>

              {/* Variants Selector (Backend Variants) */}
              {variants.length > 0 && (
                <div className="border-t border-stone-100 pt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-800">
                      Chọn Biến Thể / Phiên Bản:
                    </label>
                    <span className="text-xs text-stone-500">
                      Tồn kho: <strong className="text-emerald-700">{currentStock} cái</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {variants.map((v) => {
                      const isSelected = selectedVariant?._id === v._id;
                      const label = [v.color, v.size, v.material].filter(Boolean).join(' • ') || v.sku;
                      return (
                        <button
                          key={v._id}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-amber-800 bg-amber-50/60 ring-2 ring-amber-800/20'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <div>
                            <p className={`text-xs font-bold ${isSelected ? 'text-amber-900' : 'text-stone-800'}`}>
                              {label}
                            </p>
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              SKU: {v.sku}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-amber-900">
                              {formatPrice(v.price)}
                            </span>
                            <span className="block text-[10px] text-stone-400">
                              Còn {v.availableStock}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity & CTA Buttons */}
              <div className="border-t border-stone-100 pt-5 space-y-4">
                <div className="flex items-center gap-4">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-xs text-stone-800">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                      disabled={quantity >= currentStock || isOutOfStock}
                      className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex-1 py-3.5 px-6 bg-stone-900 hover:bg-amber-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag size={16} />
                    <span>{isOutOfStock ? 'Hết Hàng' : 'Thêm Vào Giỏ Hàng'}</span>
                  </button>

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isWishlisted 
                        ? 'border-rose-300 bg-rose-50 text-rose-600' 
                        : 'border-stone-200 text-stone-600 hover:text-rose-600 hover:bg-stone-50'
                    }`}
                    title={isWishlisted ? 'Xóa khỏi yêu thích' : 'Lưu vào yêu thích'}
                  >
                    <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Assurance Perks */}
                <div className="grid grid-cols-2 gap-3 pt-3 text-[11px] text-stone-500">
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-amber-800 shrink-0" />
                    <span>Miễn phí vận chuyển toàn quốc</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-amber-800 shrink-0" />
                    <span>Bảo hành 10 năm khung sườn</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Info Section (Description, Specs, Reviews) */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 lg:p-10 shadow-sm mb-12">
          <div className="flex items-center gap-8 border-b border-stone-100 pb-4 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('description')}
              className={`text-sm font-serif font-bold pb-2 transition-all relative ${
                activeTab === 'description' ? 'text-amber-900' : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              Mô Tả Chi Tiết
              {activeTab === 'description' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-800" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('specifications')}
              className={`text-sm font-serif font-bold pb-2 transition-all relative ${
                activeTab === 'specifications' ? 'text-amber-900' : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              Thông Số Kỹ Thuật
              {activeTab === 'specifications' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-800" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`text-sm font-serif font-bold pb-2 transition-all relative ${
                activeTab === 'reviews' ? 'text-amber-900' : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              Đánh Giá Khách Hàng ({product.reviewCount})
              {activeTab === 'reviews' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-800" />
              )}
            </button>
          </div>

          {activeTab === 'description' && (
            <div className="prose max-w-none text-xs sm:text-sm text-stone-600 leading-relaxed">
              <p>{product.description}</p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex justify-between text-xs">
                  <span className="font-semibold text-stone-500">{key}:</span>
                  <span className="font-medium text-stone-800">{value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-500">
                  Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên trải nghiệm!
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-stone-800">{rev.userId?.fullName || 'Khách hàng'}</span>
                      <div className="flex items-center gap-1 text-amber-600">
                        <Star size={12} fill="currentColor" />
                        <span className="text-xs font-bold">{rev.rating}/5</span>
                      </div>
                    </div>
                    <p className="text-xs text-stone-600">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Zoom Modal */}
      {isZoomModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img 
              src={selectedImage} 
              alt="Zoomed view" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" 
            />
            <button
              onClick={() => setIsZoomModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-stone-900/80 text-white rounded-full hover:bg-stone-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetailPage;
