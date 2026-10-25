import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Heart, Plus, Minus, Check } from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import { productAPI } from '../../../services/api';
import Rating from '../Rating/Rating';
import './QuickViewModal.css';

// Hàm định dạng tiền tệ VND độc lập
const formatVND = (price) => {
  if (price == null || isNaN(price)) return "0 đ";
  return Number(price).toLocaleString("vi-VN") + " đ";
};

export function QuickViewModal() {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    wishlist,
    toggleWishlist,
    setIsCartOpen,
  } = useShop();

  const [productDetail, setProductDetail] = useState(null);
  const [variantsList, setVariantsList] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const rawId = quickViewProduct?.id || quickViewProduct?._id;
  const prodId = rawId ? String(rawId) : null;
  const isWishlisted = prodId ? wishlist.includes(prodId) : false;

  // Gọi đồng thời API chi tiết sản phẩm và API Variants từ Backend
  useEffect(() => {
    let isMounted = true;
    async function fetchBackendData() {
      if (!prodId) return;
      setIsLoading(true);
      try {
        // Gọi song song lấy thông tin sản phẩm và danh sách variants chứa giá thật
        const [prodRes, variantsRes] = await Promise.all([
          productAPI.getProductById(prodId).catch(() => null),
          productAPI.getProductVariants 
            ? productAPI.getProductVariants(prodId).catch(() => null)
            : fetch(`/api/products/${prodId}/variants`).then(res => res.json()).catch(() => null)
        ]);

        if (!isMounted) return;

        const prodData = prodRes?.data?.product || prodRes?.data || prodRes;
        if (prodData) {
          setProductDetail(prodData);
        }

        const variants = variantsRes?.data?.variants || variantsRes?.data || variantsRes || [];
        if (Array.isArray(variants) && variants.length > 0) {
          setVariantsList(variants);
          setSelectedVariant(variants[0]); // Mặc định chọn biến thể đầu tiên
        }
      } catch (err) {
        console.error("Lỗi đồng bộ dữ liệu từ Backend:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (quickViewProduct) {
      setProductDetail(quickViewProduct);
      setVariantsList([]);
      setSelectedVariant(null);
      fetchBackendData();
      setQty(1);
    } else {
      setProductDetail(null);
    }

    return () => {
      isMounted = false;
    };
  }, [quickViewProduct, prodId]);

  if (!quickViewProduct) return null;

  const displayProduct = productDetail || quickViewProduct;
  const mainImage = displayProduct.image || displayProduct.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80';

  // Lấy giá tiền ưu tiên từ biến thể đang chọn, nếu không có lấy giá gốc sản phẩm
  const currentPrice = selectedVariant?.price ?? selectedVariant?.unitPrice ?? displayProduct.price ?? displayProduct.basePrice ?? displayProduct.minPrice ?? 0;
  const oldPrice = displayProduct.oldPrice || displayProduct.comparePrice;

  const handleAddToCart = () => {
    // Đính kèm thông tin biến thể thực tế vào sản phẩm khi thêm vào giỏ hàng
    const productToAdd = {
      ...displayProduct,
      price: currentPrice,
      variantId: selectedVariant?._id || selectedVariant?.id,
      variantLabel: selectedVariant ? `${selectedVariant.color || ''} - ${selectedVariant.size || ''} - ${selectedVariant.material || ''}`.trim() : displayProduct.variantLabel,
      color: selectedVariant?.color || displayProduct.color,
      size: selectedVariant?.size || displayProduct.size,
      material: selectedVariant?.material || displayProduct.material,
      sku: selectedVariant?.sku || displayProduct.sku,
    };

    addToCart(productToAdd, qty);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setQuickViewProduct(null);
      setIsCartOpen(true);
    }, 800);
  };

  return (
    <div
      className="quickview-overlay"
      onClick={() => setQuickViewProduct(null)}
    >
      <div
        className="quickview-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Xem nhanh ${displayProduct.name}`}
      >
        <button
          className="quickview-close"
          onClick={() => setQuickViewProduct(null)}
          aria-label="Đóng xem nhanh"
          type="button"
        >
          <X size={18} />
        </button>

        <div className="quickview-gallery">
          <img
            src={mainImage}
            alt={displayProduct.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80';
            }}
            className="quickview-main-img"
          />
        </div>

        <div className="quickview-details">
          <div>
            <div className="quickview-meta">
              <span className="quickview-badge">
                {typeof displayProduct.brandId === 'object' ? displayProduct.brandId?.name : "Chế tác thủ công"}
              </span>
              <Rating
                score={displayProduct.rating || 5.0}
                reviewCount={displayProduct.reviewCount || 12}
              />
            </div>

            <h2 className="quickview-title">{displayProduct.name}</h2>
            

            {/* HIỂN THỊ DANH SÁCH VARIANTS ĐỂ CHỌN */}
            {/* {variantsList.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--lumora-text-muted)", display: "block", marginBottom: "6px", fontWeight: "600" }}>
                  Chọn phiên bản / SKU:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {variantsList.map((v) => {
                    const vId = v._id || v.id;
                    const isSelected = (selectedVariant?._id || selectedVariant?.id) === vId;
                    const label = [v.color, v.size, v.material].filter(Boolean).join(" / ") || v.sku || "Tiêu chuẩn";

                    return (
                      <button
                        key={vId}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        style={{
                          padding: "6px 12px",
                          fontSize: "0.8rem",
                          borderRadius: "6px",
                          border: isSelected ? "1.5px solid var(--lumora-accent-wood, #8A6A48)" : "1px solid var(--lumora-border, #E2DBD0)",
                          backgroundColor: isSelected ? "#FFFDF9" : "#FFFFFF",
                          color: isSelected ? "var(--lumora-accent-wood, #8A6A48)" : "var(--lumora-text-main, #252525)",
                          fontWeight: isSelected ? "600" : "400",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {label} ({formatVND(v.price || v.unitPrice || 0)})
                      </button>
                    );
                  })}
                </div>
              </div>
            )} */}

            <div className="quickview-price-box">
              <span className="quickview-price">
               Giá: {formatVND(currentPrice)}
              </span>
              {oldPrice && (
                <span className="quickview-old-price">
                  {formatVND(oldPrice)}
                </span>
              )}
            </div>

            <p className="quickview-desc">
              {displayProduct.description || "Được sản xuất từ gỗ đạt chứng nhận FSC®, kết hợp với các kỹ thuật thủ công nguyên bản cho không gian sống hiện đại tối giản."}
            </p>
          </div>

          <div className="quickview-actions">
            <div className="quickview-qty">
              <button
                className="quickview-qty-btn"
                onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                type="button"
              >
                <Minus size={14} />
              </button>
              <span className="quickview-qty-val">{qty}</span>
              <button
                className="quickview-qty-btn"
                onClick={() => setQty((prev) => prev + 1)}
                type="button"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              className="quickview-add-btn"
              onClick={handleAddToCart}
              disabled={isLoading}
              type="button"
            >
              {isAdded ? (
                <>
                  <Check size={18} />
                  <span>Đã Thêm Vào Giỏ</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  <span>{isLoading ? "Đang đồng bộ..." : "Thêm Vào Giỏ Hàng"}</span>
                </>
              )}
            </button>

            {prodId && (
              <button
                className="quickview-wishlist-btn"
                onClick={() => toggleWishlist(prodId)}
                type="button"
                aria-label="Yêu thích"
              >
                <Heart
                  size={20}
                  fill={isWishlisted ? '#E53E3E' : 'none'}
                  color={isWishlisted ? '#E53E3E' : 'currentColor'}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickViewModal;