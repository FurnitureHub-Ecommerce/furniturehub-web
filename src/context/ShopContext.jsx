import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI, wishlistAPI, productAPI } from '../services/api';

const ShopContext = createContext();

const WISHLIST_STORAGE_KEY = 'furniturehub_wishlist';
const CART_STORAGE_KEY = 'furniturehub_cart';

export function ShopProvider({ children }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Initial guest state from localStorage (starts empty if no saved data, NO MOCK DATA)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Detailed Wishlist Products from API
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [cartError, setCartError] = useState(null);
  const [wishlistError, setWishlistError] = useState(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((message, type = 'bag') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Helper to normalize Backend Cart Item into UI friendly structure
  const normalizeCartItem = (item) => {
    const variant = typeof item.variantId === 'object' && item.variantId !== null ? item.variantId : {};
    const prod = typeof variant.productId === 'object' && variant.productId !== null ? variant.productId : {};
    const prodId = prod._id || prod.id || variant.productId || item._id;
    const variantId = variant._id || item.variantId;
    const price = item.unitPrice || variant.price || prod.minPrice || 0;
    const image = prod.images?.[0] || prod.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';
    const variantLabel = [variant.color, variant.size, variant.material].filter(Boolean).join(' / ') || 'Tiêu chuẩn';

    return {
      itemId: item._id,
      variantId,
      quantity: item.quantity || 1,
      unitPrice: price,
      itemSubtotal: item.itemSubtotal || price * (item.quantity || 1),
      product: {
        id: prodId,
        _id: prodId,
        name: prod.name || 'Sản phẩm nội thất',
        price,
        image,
        variantLabel,
        slug: prod.slug || prodId,
      },
    };
  };

  // Fetch real Cart from Backend if logged in
  const fetchCart = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;

    setIsCartLoading(true);
    setCartError(null);
    try {
      const res = await cartAPI.getCart();
      const rawCart = res.data?.cart;
      if (rawCart && Array.isArray(rawCart.items)) {
        const normalized = rawCart.items.map(normalizeCartItem);
        setCart(normalized);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalized));
      }
    } catch (err) {
      console.warn('Could not sync cart with backend:', err.message);
      setCartError(err.message);
    } finally {
      setIsCartLoading(false);
    }
  }, []);

  // Fetch real Wishlist from Backend if logged in
  const fetchWishlist = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;

    setIsWishlistLoading(true);
    setWishlistError(null);
    try {
      const res = await wishlistAPI.getWishlist();
      const rawList = res.data?.wishlist || [];
      const ids = [];
      const detailed = [];

      rawList.forEach((item) => {
        const p = typeof item.productId === 'object' && item.productId !== null ? item.productId : null;
        const pId = p ? (p._id || p.id) : item.productId;
        if (pId) {
          ids.push(String(pId));
          if (p) {
            detailed.push({
              id: p._id || p.id,
              _id: p._id || p.id,
              name: p.name || 'Sản phẩm',
              price: p.minPrice || p.price || 0,
              image: p.images?.[0] || p.image || '',
              description: p.description || '',
              slug: p.slug || p._id || p.id,
              variantLabel: 'Bộ sưu tập độc bản',
              rating: 4.9,
              reviewCount: 18,
            });
          }
        }
      });

      setWishlist(ids);
      setWishlistProducts(detailed);
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
    } catch (err) {
      console.warn('Could not sync wishlist with backend:', err.message);
      setWishlistError(err.message);
    } finally {
      setIsWishlistLoading(false);
    }
  }, []);

  // Sync on mount or token changes
  useEffect(() => {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      fetchCart();
      fetchWishlist();
    }
  }, [fetchCart, fetchWishlist]);

  // Persist guest cart & wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist]);

  // Add to Cart
  const addToCart = async (productOrVariant, qty = 1) => {
    const currentToken = localStorage.getItem('token');
    
    // Find variantId if available
    let variantId = productOrVariant.variantId || productOrVariant.defaultVariantId;
    const prodId = String(productOrVariant.id || productOrVariant._id || productOrVariant.product?.id || productOrVariant.product?._id);

    // If authenticated, send to Backend API
    if (currentToken) {
      setIsCartLoading(true);
      try {
        // If variantId is not directly known, try to fetch first variant of product
        if (!variantId && prodId) {
          try {
            const varRes = await productAPI.getProductVariants(prodId);
            const varList = varRes.data?.variants || [];
            if (varList.length > 0) {
              variantId = varList[0]._id;
            }
          } catch {
            // ignore
          }
        }

        if (variantId) {
          const res = await cartAPI.addItem({ variantId, quantity: qty });
          const rawCart = res.data?.cart;
          if (rawCart && Array.isArray(rawCart.items)) {
            setCart(rawCart.items.map(normalizeCartItem));
            showToast(`Đã thêm vào giỏ hàng`, 'bag');
            setIsCartLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend cart add failed, falling back to local:', err.message);
      } finally {
        setIsCartLoading(false);
      }
    }

    // Guest / local fallback
    const targetProduct = productOrVariant.product || productOrVariant;
    const itemTargetId = String(targetProduct.id || targetProduct._id);

    setCart((prev) => {
      const existing = prev.find((item) => String(item.product.id || item.product._id) === itemTargetId);
      if (existing) {
        return prev.map((item) =>
          String(item.product.id || item.product._id) === itemTargetId
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [
        ...prev,
        {
          itemId: `local-${Date.now()}`,
          quantity: qty,
          unitPrice: targetProduct.price || targetProduct.basePrice || targetProduct.minPrice || 0,
          product: {
            id: itemTargetId,
            _id: itemTargetId,
            name: targetProduct.name || 'Sản phẩm nội thất',
            price: targetProduct.price || targetProduct.basePrice || targetProduct.minPrice || 0,
            image: targetProduct.image || targetProduct.images?.[0] || '',
            variantLabel: targetProduct.variantLabel || 'Tiêu chuẩn',
            slug: targetProduct.slug || itemTargetId,
          },
        },
      ];
    });

    showToast(`Đã thêm "${targetProduct.name || 'Sản phẩm'}" vào giỏ hàng`, 'bag');
  };

  // Remove from Cart
  const removeFromCart = async (itemIdOrProdId) => {
    const currentToken = localStorage.getItem('token');
    const targetKey = String(itemIdOrProdId);

    // Find the item
    const targetItem = cart.find(
      (item) => item.itemId === targetKey || String(item.product.id || item.product._id) === targetKey
    );

    if (currentToken && targetItem?.itemId && !targetItem.itemId.startsWith('local-')) {
      try {
        await cartAPI.removeItem(targetItem.itemId);
        await fetchCart();
        showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'bag');
        return;
      } catch (err) {
        console.warn('Backend remove item failed, falling back to local:', err.message);
      }
    }

    setCart((prev) =>
      prev.filter(
        (item) => item.itemId !== targetKey && String(item.product.id || item.product._id) !== targetKey
      )
    );
    showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'bag');
  };

  // Update Cart Quantity
  const updateCartQuantity = async (itemIdOrProdId, delta) => {
    const currentToken = localStorage.getItem('token');
    const targetKey = String(itemIdOrProdId);

    const targetItem = cart.find(
      (item) => item.itemId === targetKey || String(item.product.id || item.product._id) === targetKey
    );

    if (!targetItem) return;
    const newQty = targetItem.quantity + delta;

    if (newQty <= 0) {
      removeFromCart(itemIdOrProdId);
      return;
    }

    if (currentToken && targetItem.itemId && !targetItem.itemId.startsWith('local-')) {
      try {
        await cartAPI.updateItemQuantity(targetItem.itemId, newQty);
        await fetchCart();
        return;
      } catch (err) {
        console.warn('Backend update quantity failed, fallback local:', err.message);
      }
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.itemId === targetKey || String(item.product.id || item.product._id) === targetKey) {
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // Clear Cart
  const clearCart = async () => {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      try {
        await cartAPI.clearCart();
      } catch (err) {
        console.warn('Backend clear cart error:', err.message);
      }
    }
    setCart([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  // Toggle Wishlist
  const toggleWishlist = async (productId) => {
    const targetId = String(productId);
    const exists = wishlist.includes(targetId);
    const currentToken = localStorage.getItem('token');

    if (currentToken) {
      try {
        if (exists) {
          await wishlistAPI.removeFromWishlist(targetId);
          showToast('Đã xóa khỏi danh sách yêu thích', 'heart');
        } else {
          await wishlistAPI.addToWishlist(targetId);
          showToast('Đã lưu vào danh sách yêu thích', 'heart');
        }
        await fetchWishlist();
        return;
      } catch (err) {
        console.warn('Backend wishlist toggle failed, falling back to local:', err.message);
      }
    }

    // Guest fallback
    setWishlist((prev) => {
      const updated = exists ? prev.filter((id) => id !== targetId) : [...prev, targetId];
      showToast(exists ? 'Đã xóa khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích', 'heart');
      return updated;
    });
  };

  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  const cartSubtotal = cart.reduce(
    (total, item) => total + (item.unitPrice || item.product?.price || 0) * (item.quantity || 1),
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
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        isCartLoading,
        cartError,
        fetchCart,
        wishlist,
        wishlistProducts,
        toggleWishlist,
        wishlistCount,
        isWishlistLoading,
        wishlistError,
        fetchWishlist,
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
