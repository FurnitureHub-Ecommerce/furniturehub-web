import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ShoppingBag,
  Heart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Compass,
} from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { categoryAPI, productAPI } from "../../services/api";
import Rating from "../../components/common/Rating/Rating";
import { 
  formatCurrency, 
  formatCategoryName, 
  PRODUCT_IMAGE_OVERRIDES, 
  getProductMetrics 
} from "../../utils/formatters";
import { EditorialSpotlight } from "../../components/home/EditorialSpotlight/EditorialSpotlight";
import "./Wishlist.css";

const formatVND = (price) => formatCurrency(price);

const PRESET_CATEGORIES = {
  'living-room': {
    name: 'Phòng khách',
    description: 'Tuyển tập các thiết kế phòng khách sang trọng, phong cách tối giản và tinh tế từ LUMORA.',
  },
  'dining-room': {
    name: 'Phòng ăn',
    description: 'Không gian ẩm thực ấm cúng với bàn ăn và ghế chế tác thủ công đạt chuẩn bền vững.',
  },
  'bedroom': {
    name: 'Phòng ngủ',
    description: 'Không gian nghỉ ngơi thư thái với giường ngủ và tủ lưu trữ cao cấp.',
  },
  'lighting-decor': {
    name: 'Đèn & Trang trí',
    description: 'Ánh sáng kiến trúc và phụ kiện trang trí tạo điểm nhấn thẩm mỹ hoàn mỹ.',
  },
  'studio-office': {
    name: 'Phòng làm việc',
    description: 'Không gian làm việc sáng tạo với bàn ghế công thái học cao cấp.',
  },
  'outdoor-living': {
    name: 'Ngoại thất & Sân vườn',
    description: 'Bộ sưu tập nội ngoại thất bền bỉ với thời gian và hòa quyện cùng thiên nhiên.',
  },
};

// ==========================================
// 1. CATEGORY PAGE
// ==========================================
export function CategoryPage() {
  const { id } = useParams();
  const { addToCart, wishlist, toggleWishlist } = useShop();

  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [categoryInfo, setCategoryInfo] = useState(() => {
    if (id && PRESET_CATEGORIES[id]) {
      return PRESET_CATEGORIES[id];
    }
    const name = formatCategoryName(id);
    return {
      name: name || 'Bộ Sưu Tập Nội Thất',
      description: 'Tuyển tập các thiết kế kiến trúc đương đại được tuyển chọn từ LUMORA.',
    };
  });
  const [products, setProducts] = useState([]);

  // Cập nhật ngay khi ID param thay đổi trên URL để không bao giờ bị giật route
  useEffect(() => {
    if (id && PRESET_CATEGORIES[id]) {
      setCategoryInfo(PRESET_CATEGORIES[id]);
    } else if (id) {
      setCategoryInfo({
        name: formatCategoryName(id) || id.replace(/-/g, ' ').toUpperCase(),
        description: 'Tuyển tập các thiết kế kiến trúc đương đại được tuyển chọn từ LUMORA.',
      });
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    async function loadCategoryData() {
      setIsLoading(true);
      setApiError(null);

      try {
        const [catRes, prodRes] = await Promise.allSettled([
          categoryAPI.getCategories(),
          productAPI.getProducts(),
        ]);

        if (!isMounted) return;

        const allCats = catRes.status === 'fulfilled' && catRes.value?.data
          ? (Array.isArray(catRes.value.data) ? catRes.value.data : catRes.value.data.categories || [])
          : [];

        const allProds = prodRes.status === 'fulfilled' && prodRes.value?.data
          ? (Array.isArray(prodRes.value.data) ? prodRes.value.data : prodRes.value.data.products || [])
          : [];

        // Find current category
        const matchedCat = allCats.find((c) => c._id === id || c.id === id || c.name?.toLowerCase().includes(id?.toLowerCase())) || (
          PRESET_CATEGORIES[id] ? { _id: id, ...PRESET_CATEGORIES[id] } : {
            _id: id,
            name: id ? (formatCategoryName(id) || id.replace(/-/g, ' ').toUpperCase()) : 'BỘ SƯU TẬP NỘI THẤT',
            description: 'Tuyển tập các thiết kế kiến trúc đương đại được tuyển chọn từ LUMORA.',
          }
        );
        setCategoryInfo(matchedCat);

        // Filter products for this category
        const filtered = allProds.filter((p) => {
          if (!id) return true;
          const pCatId = typeof p.categoryId === 'object' ? p.categoryId?._id : p.categoryId;
          return pCatId === id || pCatId === matchedCat._id;
        });

        setProducts(filtered.length > 0 ? filtered : allProds);
      } catch (err) {
        if (isMounted) setApiError(err.message || 'Lỗi khi tải danh mục');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadCategoryData();
  }, [id]);

  return (
    <div className="section container" style={{ paddingTop: "40px", paddingBottom: "80px" }}>
      <div style={{ marginBottom: "40px", textAlign: "center" }}>
        <span className="section-heading__badge" style={{ fontFamily: 'var(--font-serif)', fontSize: "0.8rem" }}>
          Bộ Sưu Tập LUMORA
        </span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: "3rem", textTransform: "capitalize", margin: "12px 0" }}>
          {categoryInfo?.name || formatCategoryName(id) || 'Danh Mục Sản Phẩm'}
        </h1>
        <p style={{ color: "var(--lumora-text-muted)", marginTop: "8px", maxWidth: "600px", marginInline: "auto" }}>
          {categoryInfo?.description || 'Khám phá các thiết kế nội thất cao cấp chế tác tinh xảo.'}
        </p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--lumora-text-muted)" }}>
          Đang tải sản phẩm từ hệ thống LUMORA...
        </div>
      ) : apiError ? (
        <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#fff5f5", borderRadius: "12px", border: "1px solid #feb2b2" }}>
          <p style={{ color: "#c53030", fontWeight: "600" }}>{apiError}</p>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "1.1rem", color: "var(--lumora-text-muted)" }}>Chưa có sản phẩm nào trong danh mục này.</p>
          <Link to="/products" className="wishlist-page__primary-btn" style={{ marginTop: "16px", display: "inline-flex" }}>
            Khám phá tất cả sản phẩm
          </Link>
        </div>
      ) : (
        <div className="product-showcase__grid">
          {products.map((product) => {
            const prodId = String(product._id || product.id);
            const isWishlisted = wishlist.includes(prodId);
            const price = product.minPrice ?? product.price ?? 0;
            const overrideImages = PRODUCT_IMAGE_OVERRIDES[product.name];
            const img = overrideImages?.[0] || product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';
            const metrics = getProductMetrics(product.name, product.rating, product.reviewCount);

            return (
              <article key={prodId} className="product-card">
                <div className="product-card__image-container">
                  <img 
                    src={img} 
                    alt={product.name} 
                    className="product-card__image product-card__image--primary"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <button
                    className={`product-card__wishlist-btn ${isWishlisted ? "product-card__wishlist-btn--active" : ""}`}
                    onClick={() => toggleWishlist(prodId)}
                    type="button"
                    title={isWishlisted ? "Xóa khỏi yêu thích" : "Lưu yêu thích"}
                  >
                    <Heart size={18} fill={isWishlisted ? "#8A6A48" : "none"} color={isWishlisted ? "#8A6A48" : "currentColor"} />
                  </button>
                </div>

                <div className="product-card__details">
                  <div className="product-card__meta">
                    <span className="product-card__variant">
                      {product.brandId?.name || "LUMORA"}
                    </span>
                    <Rating score={metrics.rating} reviewCount={metrics.reviewCount} />
                  </div>

                  <h3 className="product-card__title">
                    <Link to={`/product/${product.slug || prodId}`}>{product.name}</Link>
                  </h3>

                  <div className="product-card__footer">
                    <div className="product-card__pricing">
                      <span className="product-card__price">{formatVND(price)}</span>
                    </div>

                    <button
                      className="product-card__add-btn"
                      onClick={() => addToCart(product)}
                      type="button"
                      aria-label={`Thêm ${product.name} vào giỏ`}
                    >
                      <ShoppingBag size={18} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. CART PAGE
// ==========================================
export function CartPage() {
  const { 
    cart, 
    cartCount, 
    cartSubtotal, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    isCartLoading,
    cartError,
    fetchCart
  } = useShop();

  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <div
      className="section container"
      style={{
        paddingTop: "40px",
        paddingBottom: "80px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <ShoppingBag size={28} color="var(--lumora-accent-wood)" />
          <h1
            style={{
              fontFamily: '"Bodoni Moda", serif',
              fontSize: "2.2rem",
              margin: 0,
              color: "var(--lumora-text-main)",
            }}
          >
            Giỏ Hàng Của Bạn{" "}
            <span style={{ fontSize: "1.3rem", color: "var(--lumora-text-muted)" }}>
              ({cartCount} sản phẩm)
            </span>
          </h1>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            type="button"
            style={{
              background: "none",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "0.85rem",
              color: "#6B7280",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Trash2 size={15} /> Xóa toàn bộ giỏ
          </button>
        )}
      </div>

      {/* Loading Indicator */}
      {isCartLoading && (
        <div style={{ padding: "12px 16px", backgroundColor: "#F3F4F6", borderRadius: "8px", marginBottom: "20px", fontSize: "0.85rem", color: "#4B5563" }}>
          Đang đồng bộ với hệ thống giỏ hàng Backend...
        </div>
      )}

      {/* Cart Error */}
      {cartError && (
        <div style={{ padding: "12px 16px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", marginBottom: "20px", fontSize: "0.85rem", color: "#991B1B" }}>
          {cartError}
        </div>
      )}

      {cart.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            backgroundColor: "var(--lumora-bg-secondary)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <p
            style={{
              fontSize: "1.2rem",
              color: "var(--lumora-text-muted)",
              marginBottom: "24px",
              fontFamily: '"Bodoni Moda", serif',
            }}
          >
            Chưa có sản phẩm nội thất nào trong giỏ hàng của bạn.
          </p>
          <Link
            to="/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "14px 32px",
              backgroundColor: "var(--lumora-accent-wood)",
              color: "#FFFFFF",
              borderRadius: "var(--radius-md)",
              fontWeight: "600",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(128, 96, 60, 0.2)",
            }}
          >
            Khám phá bộ sưu tập <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: "40px",
            alignItems: "start",
          }}
        >
          {/* Cột trái: Danh sách sản phẩm trong giỏ */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
              border: "1px solid var(--lumora-border)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            {cart.map((item) => {
              const prod = item.product || {};
              const itemPrice = item.unitPrice || prod.price || 0;

              return (
                <div
                  key={item.itemId || prod.id}
                  style={{
                    display: "flex",
                    gap: "20px",
                    paddingBlock: "20px",
                    borderBottom: "1px solid var(--lumora-border)",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={prod.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80'}
                    alt={prod.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80';
                    }}
                    style={{
                      width: "90px",
                      height: "90px",
                      objectFit: "cover",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--lumora-border)",
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontFamily: '"Bodoni Moda", serif',
                        fontSize: "1.1rem",
                        marginBottom: "4px",
                        color: "var(--lumora-text-main)",
                      }}
                    >
                      <Link to={`/product/${prod.slug || prod.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        {prod.name}
                      </Link>
                    </h3>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--lumora-text-muted)",
                        marginBottom: "8px",
                      }}
                    >
                      {prod.variantLabel || "Tiêu chuẩn"}
                    </p>
                    <p
                      style={{
                        fontWeight: "700",
                        color: "var(--lumora-accent-wood)",
                        fontSize: "1.05rem",
                      }}
                    >
                      {formatVND(itemPrice)}
                    </p>
                  </div>

                  {/* Quantity & Remove Buttons */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "12px",
                    }}
                  >
                    <button
                      onClick={() => removeFromCart(item.itemId || prod.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#D93838",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.85rem",
                        padding: "4px",
                      }}
                      title="Xóa sản phẩm"
                      type="button"
                    >
                      <Trash2 size={16} /> Xóa
                    </button>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid var(--lumora-border)",
                        borderRadius: "var(--radius-sm)",
                        overflow: "hidden",
                        backgroundColor: "#fdfbf7",
                      }}
                    >
                      <button
                        onClick={() => updateCartQuantity(item.itemId || prod.id, -1)}
                        style={{
                          padding: "6px 10px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                        type="button"
                      >
                        <Minus size={14} />
                      </button>
                      <span
                        style={{
                          padding: "0 12px",
                          fontSize: "0.95rem",
                          fontWeight: "600",
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.itemId || prod.id, 1)}
                        style={{
                          padding: "6px 10px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                        type="button"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cột phải: Tóm tắt đơn hàng thanh toán */}
          <div
            style={{
              padding: "28px",
              backgroundColor: "var(--lumora-bg-secondary)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--lumora-border)",
              position: "sticky",
              top: "24px",
            }}
          >
            <h2
              style={{
                fontFamily: '"Bodoni Moda", serif',
                fontSize: "1.4rem",
                marginBottom: "20px",
                paddingBottom: "12px",
                borderBottom: "1px solid var(--lumora-border)",
              }}
            >
              Tóm Tắt Đơn Hàng
            </h2>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "14px",
                fontSize: "1rem",
                color: "#555",
              }}
            >
              <span>Tạm tính</span>
              <span style={{ fontWeight: "700", color: "var(--lumora-text-main)" }}>
                {formatVND(cartSubtotal)}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
                fontSize: "1rem",
                color: "#555",
              }}
            >
              <span>Vận chuyển (White-Glove)</span>
              <span style={{ color: "var(--lumora-accent-wood)", fontWeight: "600" }}>
                Miễn phí
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "24px",
                paddingTop: "16px",
                borderTop: "1px dashed var(--lumora-border)",
                fontSize: "1.15rem",
                fontWeight: "700",
              }}
            >
              <span>Tổng cộng</span>
              <span style={{ color: "var(--lumora-accent-wood)" }}>
                {formatVND(cartSubtotal)}
              </span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              style={{
                width: "100%",
                padding: "16px",
                backgroundColor: "var(--lumora-text-main)",
                color: "#FFFFFF",
                borderRadius: "var(--radius-md)",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              type="button"
            >
              TIẾN HÀNH THANH TOÁN <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. WISHLIST PAGE
// ==========================================
export function WishlistPage() {
  const navigate = useNavigate();
  const { wishlistProducts, toggleWishlist, addToCart, isWishlistLoading, wishlistError, fetchWishlist } = useShop();
  
  const [unselectedIds, setUnselectedIds] = useState(() => new Set());

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleSelected = (productId) => {
    const target = String(productId);
    setUnselectedIds((current) => {
      const next = new Set(current);
      if (next.has(target)) next.delete(target);
      else next.add(target);
      return next;
    });
  };

  const selectedProducts = wishlistProducts.filter((p) => !unselectedIds.has(String(p.id || p._id)));
  const selectedTotal = selectedProducts.reduce((sum, p) => {
    const price = p.product?.price || p.product?.minPrice || p.price || p.minPrice || 0;
    return sum + (Number(price) || 0);
  }, 0);

  const handleCheckout = () => {
    selectedProducts.forEach((p) => addToCart(p));
    navigate("/checkout");
  };

  return (
    <div className="section container wishlist-page">
      <div className="wishlist-page__header">
        <span className="section-heading__badge" style={{ fontFamily: 'var(--font-serif)' }}>LUMORA CURATED</span>
        <h1 style={{ fontFamily: 'var(--font-serif)' }}>Danh Sách Yêu Thích</h1>
        <p>Lưu lại những thiết kế bạn yêu thích và đồng bộ trực tiếp với tài khoản LUMORA.</p>
      </div>

      {isWishlistLoading && (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--lumora-text-muted)" }}>
          Đang tải danh sách yêu thích...
        </div>
      )}

      {wishlistError && (
        <div style={{ padding: "12px", backgroundColor: "#FEF2F2", color: "#991B1B", borderRadius: "8px", marginBottom: "16px" }}>
          {wishlistError}
        </div>
      )}

      {!isWishlistLoading && wishlistProducts.length === 0 ? (
        <div className="wishlist-empty">
          <Heart size={42} strokeWidth={1.4} />
          <h2 style={{ fontFamily: 'var(--font-serif)' }}>Danh sách yêu thích đang trống</h2>
          <p>Hãy bấm biểu tượng trái tim trên sản phẩm để lưu lại thiết kế yêu thích.</p>
          <Link to="/products" className="wishlist-page__primary-btn">
            Khám phá bộ sưu tập <ArrowRight size={17} />
          </Link>
        </div>
      ) : (
        <div className="wishlist-layout">
          <div className="wishlist-products">
            <div className="wishlist-products__toolbar">
              <span>{wishlistProducts.length} sản phẩm đã lưu</span>
              <div className="wishlist-products__selection-actions">
                <button
                  type="button"
                  onClick={() => setUnselectedIds(new Set())}
                >
                  Chọn tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setUnselectedIds(new Set(wishlistProducts.map((p) => String(p.id || p._id))))}
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            {wishlistProducts.map((product) => {
              const prodId = String(product.id || product._id);
              const isChecked = !unselectedIds.has(prodId);
              const price = product.product?.price || product.product?.minPrice || product.price || product.minPrice || 0;
              const imgUrl = product.image || product.product?.images?.[0] || product.product?.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';

              return (
                <article className="wishlist-item" key={prodId}>
                  <label className="wishlist-item__check">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelected(prodId)}
                      aria-label={`Chọn ${product.name} để mua`}
                    />
                    <span />
                  </label>
                  <img
                    src={imgUrl}
                    alt={product.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="wishlist-item__details">
                    <span>{product.variantLabel || "Phiên bản thủ công"}</span>
                    <h2 style={{ fontFamily: 'var(--font-serif)' }}>
                      <Link to={`/product/${product.slug || prodId}`}>{product.name}</Link>
                    </h2>
                    <strong>{formatVND(price)}</strong>
                  </div>
                  <button
                    type="button"
                    className="wishlist-item__remove"
                    onClick={() => toggleWishlist(prodId)}
                    aria-label={`Xóa ${product.name} khỏi danh sách yêu thích`}
                  >
                    <Trash2 size={17} />
                  </button>
                </article>
              );
            })}
          </div>

          <aside className="wishlist-summary">
            <h2 style={{ fontFamily: 'var(--font-serif)' }}>Tóm Tắt Lựa Chọn</h2>
            <div><span>Sản phẩm đã chọn</span><strong>{selectedProducts.length}</strong></div>
            <div><span>Tạm tính</span><strong>{formatVND(selectedTotal)}</strong></div>
            <p>Phí giao hàng White-Glove miễn phí cho mọi đơn hàng.</p>
            <button
              type="button"
              className="wishlist-page__primary-btn"
              disabled={selectedProducts.length === 0}
              onClick={handleCheckout}
            >
              Thanh toán ({selectedProducts.length}) <ArrowRight size={17} />
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. CHECKOUT PAGE (Tasks 6, 7, 8)
// ==========================================
export { default as CheckoutPage } from "./CheckoutPage";
export { default as PaymentSuccessPage } from "./PaymentSuccessPage";
export { default as PaymentFailedPage } from "./PaymentFailedPage";
export { default as CustomerProfilePage } from "./CustomerProfilePage";
export { default as AddressManagementPage } from "./AddressManagementPage";
export { default as CustomerOrdersPage } from "./CustomerOrdersPage";
export { default as OrderTrackingTimeline } from "./OrderTrackingTimeline";
export { default as QuickOrderTrack } from "./QuickOrderTrack";

export function CollectionsPage() {
  return <CategoryPage />;
}

export function LookbookPage() {
  return (
    <div className="lookbook-page" style={{ paddingTop: "20px", paddingBottom: "80px" }}>
      <div className="container" style={{ textAlign: "center", marginBottom: "40px" }}>
        <span
          className="section-heading__badge"
          style={{ fontFamily: "var(--font-serif)", fontSize: "0.85rem", letterSpacing: "0.14em" }}
        >
          TRIỂN LÃM KHÔNG GIAN SỐNG 2026
        </span>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.4rem, 4vw, 3.5rem)",
            margin: "12px 0 16px",
            color: "var(--lumora-text-main)",
            fontWeight: 600,
          }}
        >
          Lookbook Kyoto Residency
        </h1>
        <p
          style={{
            color: "var(--lumora-text-muted)",
            maxWidth: "680px",
            marginInline: "auto",
            fontSize: "1rem",
            lineHeight: 1.6,
          }}
        >
          Khám phá không gian sống đương đại Kyoto Residency của LUMORA. Chạm vào các điểm tương tác để khám phá các tuyệt tác nội thất thủ công được hòa quyện hoàn mỹ cùng thiên nhiên.
        </p>
      </div>

      <EditorialSpotlight />

      {/* Curated Living Spaces Gallery */}
      <div className="container" style={{ marginTop: "70px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="section-heading__badge" style={{ fontFamily: "var(--font-serif)" }}>
            BỘ SƯU TẬP THEO PHÒNG
          </span>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.2rem", marginTop: "8px" }}>
            Khám Phá Các Không Gian Độc Bản
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {[
            {
              title: "Phòng Khách Wabi-Sabi",
              desc: "Gỗ sồi mộc nguyên tấm kết hợp sofa module vải lanh cao cấp.",
              link: "/category/living-room",
              img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
            },
            {
              title: "Phòng Ăn Solace",
              desc: "Bàn ăn gỗ óc chó tự nhiên đạt chuẩn bảo tồn FSC®.",
              link: "/category/dining-room",
              img: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
            },
            {
              title: "Thiền Viện Nordic Sanctuary",
              desc: "Giường ngủ bọc da bò Ý nhập khẩu và nệm cao su hữu cơ.",
              link: "/category/bedroom",
              img: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80",
            },
            {
              title: "Ánh Sáng Kiến Trúc",
              desc: "Hệ đèn trần pha lê và đồng mạ thủ công tạo điểm nhấn sang trọng.",
              link: "/category/lighting-decor",
              img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
            },
          ].map((room) => (
            <Link
              key={room.title}
              to={room.link}
              style={{
                textDecoration: "none",
                color: "inherit",
                borderRadius: "14px",
                overflow: "hidden",
                border: "1px solid var(--lumora-border)",
                backgroundColor: "#fff",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              className="group"
            >
              <div style={{ height: "220px", overflow: "hidden", position: "relative" }}>
                <img
                  src={room.img}
                  alt={room.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80";
                  }}
                />
              </div>
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", margin: 0 }}>
                  {room.title}
                </h3>
                <p style={{ color: "var(--lumora-text-muted)", fontSize: "0.88rem", margin: 0, lineHeight: 1.5 }}>
                  {room.desc}
                </p>
                <span
                  style={{
                    color: "var(--lumora-accent-wood)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    marginTop: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Khám phá không gian <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
