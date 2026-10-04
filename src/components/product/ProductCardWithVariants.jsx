import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { 
  formatCurrency, 
  formatCategoryName, 
  PRODUCT_IMAGE_OVERRIDES, 
  getProductMetrics 
} from '../../utils/formatters';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80';

export function ProductCardWithVariants({ product, isListView = false }) {
  const { wishlist, toggleWishlist, addToCart, setQuickViewProduct } = useShop();

  // Check image overrides for verified luxury media
  const overrideImages = PRODUCT_IMAGE_OVERRIDES[product.name];
  const gallery = overrideImages || product.gallery || (product.images?.length > 0 ? product.images : [product.image || DEFAULT_FALLBACK_IMAGE]);
  
  // Selected variant color state for card image preview
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0] : null
  );

  const isWishlisted = wishlist.includes(String(product.id || product._id));
  const currentImage = selectedColor?.image || gallery[0] || DEFAULT_FALLBACK_IMAGE;
  const hoverImage = gallery[1] || product.hoverImage || currentImage;
  const [isHovered, setIsHovered] = useState(false);

  // Metrics distribution for natural luxury review display
  const metrics = getProductMetrics(product.name, product.rating, product.reviewCount);

  return (
    <article 
      className={`group relative bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex ${
        isListView ? 'flex-col sm:flex-row h-auto sm:h-56' : 'flex-col h-full'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className={`relative overflow-hidden bg-stone-100 ${
        isListView ? 'w-full sm:w-64 h-52 sm:h-full shrink-0' : 'aspect-[4/3] w-full'
      }`}>
        <Link to={`/product/${product.slug || product._id || product.id}`} className="block w-full h-full">
          <img
            src={isHovered && hoverImage !== currentImage ? hoverImage : currentImage}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Badge 'MỚI': cố định absolute top-3 left-3 z-10 */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.isNew && (
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-stone-900 text-white rounded-md shadow-sm">
              Mới
            </span>
          )}
          {product.oldPrice && (
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-amber-700 text-white rounded-md shadow-sm">
              -{Math.round(((product.oldPrice - product.basePrice) / product.oldPrice) * 100)}%
            </span>
          )}
          {!product.inStock && (
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-rose-600 text-white rounded-md shadow-sm">
              Hết Hàng
            </span>
          )}
        </div>

        {/* Nút 'Trái tim / Wishlist': cố định absolute top-3 right-3 z-10 bg-white/90 p-2 rounded-full */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(String(product.id || product._id));
          }}
          className={`absolute top-3 right-3 z-10 bg-white/90 p-2 rounded-full shadow-md transition-all duration-200 ${
            isWishlisted 
              ? 'bg-amber-800 text-white scale-110 shadow-lg' 
              : 'text-stone-700 hover:bg-white hover:text-amber-800'
          }`}
          title={isWishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
          aria-label={isWishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
        >
          <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Quick Action Overlay Bar (Quick View fade-in nổi bật) */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            type="button"
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className="flex-1 py-2.5 px-3 bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={14} />
            <span>Thêm giỏ hàng</span>
          </button>
          
          <button
            type="button"
            onClick={() => setQuickViewProduct(product)}
            className="p-2.5 bg-white text-stone-800 hover:text-amber-800 rounded-lg shadow-lg transition-colors hover:scale-105"
            title="Xem nhanh"
            aria-label="Xem nhanh sản phẩm"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-medium tracking-wide uppercase text-[11px] text-amber-800">
              {formatCategoryName(product.categoryName)}
            </span>
            <div className="flex items-center gap-1 text-amber-600 font-semibold text-xs">
              <Star size={13} fill="currentColor" />
              <span>{metrics.rating}</span>
              <span className="text-stone-400 font-normal">({metrics.reviewCount})</span>
            </div>
          </div>

          {/* Product Name (line-clamp-2 min-h-[2.5rem]) */}
          <h3 className="font-serif text-base font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2 min-h-[2.5rem] mb-1">
            <Link to={`/product/${product.slug || product._id || product.id}`}>{product.name}</Link>
          </h3>

          {/* Short description for list view */}
          {isListView && product.shortDescription && (
            <p className="text-xs text-stone-500 line-clamp-2 mb-2">
              {product.shortDescription}
            </p>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-bold text-amber-900 text-lg">
              {formatCurrency(product.basePrice || product.minPrice || product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-xs text-stone-400 line-through">
                {formatCurrency(product.oldPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Nút chọn màu (Color Swatches): Chuyển xuống phần chân thông tin card (cùng hàng với chữ '... biến thể') */}
        {product.colors && product.colors.length > 0 && (
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {product.colors.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setSelectedColor(col)}
                  onMouseEnter={() => setSelectedColor(col)}
                  className={`relative w-4 h-4 rounded-full transition-transform duration-200 border border-stone-300 ${
                    selectedColor?.id === col.id ? 'ring-2 ring-amber-700 ring-offset-1 scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                  aria-label={`Màu ${col.name}`}
                />
              ))}
            </div>
            <span className="text-[11px] text-stone-400 font-medium">
              {product.colors.length} biến thể
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

export default ProductCardWithVariants;
