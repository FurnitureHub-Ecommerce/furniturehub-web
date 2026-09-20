import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS } from '../data/lumoraData';

const ShopContext = createContext();

const WISHLIST_STORAGE_KEY = 'furniturehub_wishlist';
const CART_STORAGE_KEY = 'furniturehub_cart';

export function ShopProvider({ children }) {
  // Load initial state from localStorage or default
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [
        { product: PRODUCTS[0], quantity: 1 },
        { product: PRODUCTS[1], quantity: 1 },
      ];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['prod-2', 'prod-6'];
    } catch {
      return ['prod-2', 'prod-6'];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist]);

  const showToast = (message, type = 'bag') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const addToCart = (product, qty = 1) => {
    const prodId = String(product.id || product._id);
    setCart((prev) => {
      const existing = prev.find((item) => String(item.product.id || item.product._id) === prodId);
      if (existing) {
        return prev.map((item) =>
          String(item.product.id || item.product._id) === prodId
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    showToast(`Đã thêm "${product.name}" vào giỏ hàng`, 'bag');
  };

  const removeFromCart = (productId) => {
    const targetId = String(productId);
    setCart((prev) => prev.filter((item) => String(item.product.id || item.product._id) !== targetId));
  };

  const updateCartQuantity = (productId, delta) => {
    const targetId = String(productId);
    setCart((prev) =>
      prev
        .map((item) => {
          if (String(item.product.id || item.product._id) === targetId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const toggleWishlist = (productId) => {
    const targetId = String(productId);
    setWishlist((prev) => {
      const exists = prev.includes(targetId);
      const updated = exists
        ? prev.filter((id) => id !== targetId)
        : [...prev, targetId];
      showToast(
        exists ? 'Đã xóa khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích',
        'heart'
      );
      return updated;
    });
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (total, item) => total + (item.product.price || 0) * item.quantity,
    0
  );
  const wishlistCount = wishlist.length;

  return (
    <ShopContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        toggleWishlist,
        wishlistCount,
        isSearchOpen,
        setIsSearchOpen,
        quickViewProduct,
        setQuickViewProduct,
        toastMessage,
        setToastMessage,
        showToast,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
