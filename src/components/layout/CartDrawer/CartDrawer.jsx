import React from "react";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { useShop } from "../../../context/ShopContext";
import { Link } from "react-router-dom";
import "./CartDrawer.css";

import { formatCurrency } from '../../../utils/formatters';

const formatVND = (price) => formatCurrency(price);

export function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartCount,
    cartSubtotal,
    updateCartQuantity,
    removeFromCart,
  } = useShop();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 5000000; // 5,000,000 VND
  const progress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);
  const remaining = Math.max(0, freeShippingThreshold - cartSubtotal);

  return (
    <>
      <div
        className="cart-drawer-overlay"
        onClick={() => setIsCartOpen(false)}
      />
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Giỏ hàng của bạn"
      >
        <div className="cart-drawer-header">
          <h2
            className="cart-drawer-title"
            style={{ fontFamily: '"Bodoni Moda", serif', fontSize: "1.8rem" }}
          >
            <span>Giỏ Hàng</span>
            <span className="cart-drawer-badge">{cartCount}</span>
          </h2>
          <button
            className="cart-drawer-close"
            onClick={() => setIsCartOpen(false)}
            aria-label="Đóng giỏ hàng"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Tracker */}
        <div className="cart-drawer-shipping">
          {remaining > 0 ? (
            <p>
              Mua thêm <strong>{formatVND(remaining)}</strong> để nhận{" "}
              <strong>Miễn phí Giao hàng & Lắp ráp</strong>
            </p>
          ) : (
            <p>
              🎉 Bạn đã đủ điều kiện nhận{" "}
              <strong>Miễn phí Giao hàng White-Glove!</strong>
            </p>
          )}
          <div className="cart-shipping-bar">
            <div
              className="cart-shipping-progress"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Cart Body */}
        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="cart-drawer-empty">
              <ShoppingBag size={48} className="cart-empty-icon" />
              <p style={{ fontFamily: '"Bodoni Moda", serif' }}>
                Giỏ hàng của bạn đang trống
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const product = item.product || {};
              const itemPrice = item.unitPrice || product.price || 0;
              const itemId = item.itemId || product.id;

              return (
                <div key={itemId} className="cart-item">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="cart-item-image"
                  />
                  <div className="cart-item-details">
                    <div className="cart-item-top">
                      <div>
                        <h3
                          className="cart-item-title"
                          style={{ fontFamily: '"Bodoni Moda", serif' }}
                        >
                          <Link 
                            to={`/product/${product.slug || product.id}`}
                            onClick={() => setIsCartOpen(false)}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            {product.name}
                          </Link>
                        </h3>
                        <span className="cart-item-variant">
                          {product.variantLabel || "Tiêu chuẩn"}
                        </span>
                      </div>
                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(itemId)}
                        aria-label={`Xóa ${product.name}`}
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="cart-item-bottom">
                      <div className="cart-item-qty">
                        <button
                          className="cart-qty-btn"
                          onClick={() => updateCartQuantity(itemId, -1)}
                          aria-label="Giảm số lượng"
                          type="button"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="cart-qty-val">{item.quantity}</span>
                        <button
                          className="cart-qty-btn"
                          onClick={() => updateCartQuantity(itemId, 1)}
                          aria-label="Tăng số lượng"
                          type="button"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <span className="cart-item-price">
                        {formatVND(itemPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-row">
              <span
                style={{
                  fontFamily: '"Bodoni Moda", serif',
                  fontSize: "1.3rem",
                }}
              >
                Tạm tính
              </span>
              <span
                className="cart-total-price"
                style={{ fontFamily: '"Bodoni Moda", serif' }}
              >
                {formatVND(cartSubtotal)}
              </span>
            </div>
            <div className="cart-actions-row">
              <Link
                to="/cart"
                className="cart-checkout-btn"
                onClick={() => setIsCartOpen(false)}
              >
                <span>Xem Giỏ Hàng & Thanh Toán</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;
