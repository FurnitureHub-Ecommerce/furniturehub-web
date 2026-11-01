/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI, wishlistAPI, productAPI } from '../services/api';
import { useAuth } from './AuthContext';

const ShopContext = createContext();

const WISHLIST_STORAGE_KEY = 'furniturehub_wishlist';
const CART_STORAGE_KEY = 'furniturehub_cart';

function pickDefinedStock(...values) {
  for (const val of values) {
    if (val !== undefined && val !== null && val !== '' && !Number.isNaN(Number(val))) {
      return Number(val);
    }
  }
  return undefined;
}

export function getCartItemStock(item) {
  if (!item) return undefined;
  const prod = item.product || {};
  return pickDefinedStock(
    item.stock,
    item.inventoryQuantity,
    item.availableStock,
    prod.stock,
    prod.inventoryQuantity,
    prod.availableStock,
    prod.stockCount,
  );
}

export function ShopProvider({ children }) {
  const { token } = useAuth();

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
  const normalizeCartItem = useCallback((item, fallbackStockMap = {}) => {
    const variant = typeof item.variantId === 'object' && item.variantId !== null ? item.variantId : {};
    const prod = typeof variant.productId === 'object' && variant.productId !== null ? variant.productId : {};
    const prodId = prod._id || prod.id || variant.productId || item._id;
    const variantId = variant._id || item.variantId;
    const price = item.unitPrice || variant.price || prod.minPrice || 0;
    const image = prod.images?.[0] || prod.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';
    const variantLabel = [variant.color, variant.size, variant.material].filter(Boolean).join(' / ') || 'Tiêu chuẩn';

    const stock = pickDefinedStock(
      item.stock,
      item.inventoryQuantity,
      item.availableStock,
      variant.stock,
      variant.inventoryQuantity,
      variant.availableStock,
      prod.stock,
      prod.inventoryQuantity,
      prod.availableStock,
      variantId ? fallbackStockMap[String(variantId)] : undefined,
      prodId ? fallbackStockMap[String(prodId)] : undefined,
    );

    return {
      itemId: item._id,
      variantId,
      quantity: item.quantity || 1,
      unitPrice: price,
      itemSubtotal: item.itemSubtotal || price * (item.quantity || 1),
      ...(stock !== undefined
        ? {
            stock,
            inventoryQuantity: stock,
            availableStock: stock,
          }
        : {}),
      product: {
        id: prodId,
        _id: prodId,
        name: prod.name || 'Sản phẩm nội thất',
        price,
        image,
        variantLabel,
        slug: prod.slug || prodId,
        ...(stock !== undefined
          ? {
              stock,
              inventoryQuantity: stock,
              availableStock: stock,
              stockCount: stock,
            }
          : {}),
      },
    };
  }, []);

  // Enrich cart items with real-time variant stock from Backend
  const enrichCartItemsWithStock = useCallback(async (items) => {
    if (!Array.isArray(items) || items.length === 0) return items;

    const prodIdsToFetch = [
      ...new Set(
        items
          .map((it) => String(it.product?.id || it.product?._id || ''))
          .filter(Boolean)
      ),
    ];

    if (prodIdsToFetch.length === 0) return items;

    const variantStockByKey = {};
    await Promise.all(
      prodIdsToFetch.map(async (pId) => {
        try {
          const res = await productAPI.getProductVariants(pId);
          const variants = res.data?.variants || res.data || [];
          if (Array.isArray(variants)) {
            variants.forEach((v) => {
              const vId = String(v._id || v.id || '');
              const vStock = pickDefinedStock(v.stock, v.inventoryQuantity, v.availableStock);
              if (vId && vStock !== undefined) {
                variantStockByKey[vId] = vStock;
              }
            });
            if (variants.length > 0 && variantStockByKey[pId] === undefined) {
              const firstStock = pickDefinedStock(
                variants[0].stock,
                variants[0].inventoryQuantity,
                variants[0].availableStock,
              );
              if (firstStock !== undefined) {
                variantStockByKey[pId] = firstStock;
              }
            }
          }
        } catch {
          // ignore error for individual product
        }
      })
    );

    return items.map((it) => {
      const vKey = it.variantId ? String(it.variantId) : '';
      const pKey = String(it.product?.id || it.product?._id || '');
      const resolvedStock = pickDefinedStock(
        vKey ? variantStockByKey[vKey] : undefined,
        getCartItemStock(it),
        pKey ? variantStockByKey[pKey] : undefined,
      );

      if (resolvedStock === undefined) return it;

      return {
        ...it,
        stock: resolvedStock,
        inventoryQuantity: resolvedStock,
        availableStock: resolvedStock,
        product: {
          ...(it.product || {}),
          stock: resolvedStock,
          inventoryQuantity: resolvedStock,
          availableStock: resolvedStock,
          stockCount: resolvedStock,
        },
      };
    });
  }, []);

  // Fetch real Cart from Backend if logged in
  const fetchCart = useCallback(async (showSpinner = false) => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;

    if (showSpinner) setIsCartLoading(true);
    setCartError(null);
    try {
      const res = await cartAPI.getCart();
      const rawCart = res.data?.cart;
      if (rawCart && Array.isArray(rawCart.items)) {
        const normalized = rawCart.items.map((it) => normalizeCartItem(it));
        const enriched = await enrichCartItemsWithStock(normalized);
        setCart(enriched);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(enriched));
      }
    } catch (err) {
      console.warn('Không thể đồng bộ giỏ hàng với máy chủ, tự động dùng dữ liệu đã lưu:', err.message);
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCart(parsed);
          }
        }
      } catch {
        // bỏ qua lỗi đọc bộ nhớ đệm
      }
      setCartError(null);
    } finally {
      if (showSpinner) setIsCartLoading(false);
    }
  }, [normalizeCartItem, enrichCartItemsWithStock]);

  // Fetch real Wishlist from Backend if logged in
  const fetchWishlist = useCallback(async (showSpinner = false) => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;

    if (showSpinner) setIsWishlistLoading(true);
    setWishlistError(null);
    try {
      const res = await wishlistAPI.getWishlist();
      const rawList = res.data?.wishlist || [];
      const ids = [];
      const detailed = [];

      rawList.forEach((item) => {
        const p =
          typeof item.productId === 'object' && item.productId !== null
            ? item.productId
            : typeof item.product === 'object' && item.product !== null
            ? item.product
            : typeof item === 'object' && item !== null && (item.name || item._id)
            ? item
            : null;

        const pId = p ? (p._id || p.id) : (item.productId || item.product || item._id || item.id);
        const price =
          item.product?.price ||
          item.product?.minPrice ||
          item.productId?.price ||
          item.productId?.minPrice ||
          item.price ||
          item.minPrice ||
          p?.price ||
          p?.minPrice ||
          0;

        const name = p?.name || item.product?.name || item.productId?.name || item.name || 'Sản phẩm nội thất';
        const image =
          p?.images?.[0] ||
          p?.image ||
          item.product?.images?.[0] ||
          item.product?.image ||
          item.images?.[0] ||
          item.image ||
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';

        if (pId) {
          ids.push(String(pId));
          detailed.push({
            id: String(pId),
            _id: String(pId),
            name,
            price: Number(price) || 0,
            image,
            description: p?.description || item.description || '',
            slug: p?.slug || item.slug || String(pId),
            variantLabel: 'Bộ sưu tập độc bản',
            rating: 4.9,
            reviewCount: 18,
          });
        }
      });

      setWishlist(ids);
      setWishlistProducts(detailed);
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
    } catch (err) {
      console.warn('Không thể đồng bộ danh sách yêu thích với máy chủ, tự động dùng dữ liệu đã lưu:', err.message);
      try {
        const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWishlist(parsed);
          }
        }
      } catch {
        // bỏ qua lỗi đọc bộ nhớ đệm
      }
      setWishlistError(null);
    } finally {
      if (showSpinner) setIsWishlistLoading(false);
    }
  }, []);

  // Sync on mount or token changes reactively
  useEffect(() => {
    let isCancelled = false;

    const performSync = async () => {
      await Promise.resolve();
      if (isCancelled) return;

      if (token) {
        fetchCart(false);
        fetchWishlist(false);
      } else {
        try {
          const savedCart = localStorage.getItem(CART_STORAGE_KEY);
          const parsedCart = savedCart ? JSON.parse(savedCart) : [];
          if (Array.isArray(parsedCart) && parsedCart.length > 0) {
            const enriched = await enrichCartItemsWithStock(parsedCart);
            if (!isCancelled) setCart(enriched);
          } else {
            setCart([]);
          }
          const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
          setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
        } catch {
          setCart([]);
          setWishlist([]);
        }
        setWishlistProducts([]);
      }
    };

    performSync();

    return () => {
      isCancelled = true;
    };
  }, [token, fetchCart, fetchWishlist, enrichCartItemsWithStock]);

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
    const targetProduct = productOrVariant.product || productOrVariant;
    let variantId = productOrVariant.variantId || productOrVariant.defaultVariantId || targetProduct.variantId;
    const prodId = String(productOrVariant.id || productOrVariant._id || targetProduct.id || targetProduct._id);

    let knownStock = pickDefinedStock(
      productOrVariant.stock,
      productOrVariant.inventoryQuantity,
      productOrVariant.availableStock,
      productOrVariant.stockCount,
      targetProduct.stock,
      targetProduct.inventoryQuantity,
      targetProduct.availableStock,
      targetProduct.stockCount,
    );

    if ((!variantId || knownStock === undefined) && prodId) {
      try {
        const varRes = await productAPI.getProductVariants(prodId);
        const varList = varRes.data?.variants || [];
        if (varList.length > 0) {
          const matchedVar = variantId
            ? varList.find((v) => String(v._id || v.id) === String(variantId)) || varList[0]
            : varList.find((v) => (v.availableStock ?? v.stock ?? 0) > 0) || varList[0];
          if (!variantId && matchedVar) {
            variantId = matchedVar._id || matchedVar.id;
          }
          if (knownStock === undefined && matchedVar) {
            knownStock = pickDefinedStock(
              matchedVar.stock,
              matchedVar.inventoryQuantity,
              matchedVar.availableStock,
            );
          }
        }
      } catch {
        // ignore
      }
    }

    // Kiểm tra số lượng cộng dồn so với tồn kho
    const existingCartItem = cart.find((item) => {
      if (variantId && item.variantId) {
        return String(item.variantId) === String(variantId);
      }
      return String(item.product?.id || item.product?._id) === prodId;
    });
    const currentInCartQty = existingCartItem?.quantity || 0;
    const effectiveStock = pickDefinedStock(knownStock, getCartItemStock(existingCartItem));

    if (effectiveStock !== undefined && currentInCartQty + qty > effectiveStock) {
      const prodName = targetProduct.name || productOrVariant.name || 'Sản phẩm';
      window.alert(`Sản phẩm ${prodName} chỉ còn ${effectiveStock} cái trong kho`);
      return;
    }

    // If authenticated, send to Backend API
    if (currentToken && variantId) {
      setIsCartLoading(true);
      try {
        const res = await cartAPI.addItem({ variantId, quantity: qty });
        const rawCart = res.data?.cart;
        if (rawCart && Array.isArray(rawCart.items)) {
          const fallbackStockMap = {};
          if (effectiveStock !== undefined) {
            fallbackStockMap[String(variantId)] = effectiveStock;
            fallbackStockMap[prodId] = effectiveStock;
          }
          const normalized = rawCart.items.map((it) => normalizeCartItem(it, fallbackStockMap));
          const enriched = await enrichCartItemsWithStock(normalized);
          setCart(enriched);
          showToast(`Đã thêm vào giỏ hàng`, 'bag');
          setIsCartLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Backend cart add failed, falling back to local:', err.message);
      } finally {
        setIsCartLoading(false);
      }
    }

    // Guest / local fallback
    const itemTargetId = String(targetProduct.id || targetProduct._id);
    const itemTargetVariant = variantId;

    setCart((prev) => {
      const existing = prev.find((item) => {
        if (itemTargetVariant && item.variantId) {
          return String(item.variantId) === String(itemTargetVariant);
        }
        return String(item.product.id || item.product._id) === itemTargetId;
      });
      if (existing) {
        return prev.map((item) => {
          const match = itemTargetVariant && item.variantId
            ? String(item.variantId) === String(itemTargetVariant)
            : String(item.product.id || item.product._id) === itemTargetId;
          if (!match) return item;
          const nextStock = pickDefinedStock(effectiveStock, getCartItemStock(item));
          const nextQty = nextStock !== undefined ? Math.min(nextStock, item.quantity + qty) : item.quantity + qty;
          return {
            ...item,
            quantity: nextQty,
            ...(nextStock !== undefined
              ? { stock: nextStock, inventoryQuantity: nextStock, availableStock: nextStock }
              : {}),
            product: {
              ...item.product,
              ...(nextStock !== undefined
                ? { stock: nextStock, inventoryQuantity: nextStock, availableStock: nextStock, stockCount: nextStock }
                : {}),
            },
          };
        });
      }
      return [
        ...prev,
        {
          itemId: `local-${Date.now()}`,
          variantId: itemTargetVariant,
          quantity: qty,
          unitPrice: targetProduct.price || targetProduct.basePrice || targetProduct.minPrice || 0,
          ...(effectiveStock !== undefined
            ? {
                stock: effectiveStock,
                inventoryQuantity: effectiveStock,
                availableStock: effectiveStock,
              }
            : {}),
          product: {
            id: itemTargetId,
            _id: itemTargetId,
            name: targetProduct.name || 'Sản phẩm nội thất',
            price: targetProduct.price || targetProduct.basePrice || targetProduct.minPrice || 0,
            image: targetProduct.image || targetProduct.images?.[0] || '',
            variantLabel: targetProduct.variantLabel || 'Tiêu chuẩn',
            slug: targetProduct.slug || itemTargetId,
            ...(effectiveStock !== undefined
              ? {
                  stock: effectiveStock,
                  inventoryQuantity: effectiveStock,
                  availableStock: effectiveStock,
                  stockCount: effectiveStock,
                }
              : {}),
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

    const itemStock = getCartItemStock(targetItem);
    if (delta > 0 && itemStock !== undefined && newQty > itemStock) {
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

  const cartCount = cart.length;
  const totalQuantity = cart.reduce((total, item) => total + (item.quantity || 1), 0);
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
        totalQuantity,
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
