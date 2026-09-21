import React, { useState } from 'react';
import { X, ShoppingBag, Heart, Plus, Minus, Check } from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import Rating from '../Rating/Rating';
import './QuickViewModal.css';

export function QuickViewModal() {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    wishlist,
    toggleWishlist,
    setIsCartOpen,
  } = useShop();

  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!quickViewProduct) return null;

  const prodId = String(quickViewProduct.id || quickViewProduct._id);
  const isWishlisted = wishlist.includes(prodId);

  const handleAddToCart = () => {
    addToCart(quickViewProduct, qty);
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
        aria-label={`Xem nhanh ${quickViewProduct.name}`}
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
            src={quickViewProduct.image}
            alt={quickViewProduct.name}
            className="quickview-main-img"
          />
        </div>

        <div className="quickview-details">
          <div>
            <div className="quickview-meta">
              <span className="quickview-badge">Chế tác thủ công</span>
              <Rating
                score={quickViewProduct.rating}
                reviewCount={quickViewProduct.reviewCount}
              />
            </div>

            <h2 className="quickview-title">{quickViewProduct.name}</h2>
            <p className="quickview-variant">{quickViewProduct.variantLabel}</p>

            <div className="quickview-price-box">
              <span className="quickview-price">
                ${quickViewProduct.price.toLocaleString()}
              </span>
              {quickViewProduct.oldPrice && (
                <span className="quickview-old-price">
                  ${quickViewProduct.oldPrice.toLocaleString()}
                </span>
              )}
            </div>

            <p className="quickview-desc">
              Được sản xuất từ gỗ đạt chứng nhận FSC®, kết hợp với các kỹ thuật thủ công nguyên bản cho không gian sống hiện đại tối giản.
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
                  <span>Thêm Vào Giỏ Hàng</span>
                </>
              )}
            </button>

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
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickViewModal;
