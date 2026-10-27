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
  Star,
} from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { categoryAPI, productAPI } from "../../services/api";
import "./Wishlist.css";

// ==========================================
// CÁC HÀM FORMATTER ĐỘC LẬP TẠI CHỖ
// ==========================================
const formatVND = (price) => {
  if (price == null || isNaN(price)) return "0 đ";
  return Number(price).toLocaleString("vi-VN") + " đ";
};

// Từ điển dịch chuẩn xác tên các danh mục từ Backend sang Tiếng Việt
const CATEGORY_TRANSLATIONS = {
  "Home Decor & Lighting": "Trang Trí & Đèn",
  "TV Units & Media": "Kệ Tivi & Giải Trí",
  "Bookshelves & Shelving": "Kệ Sách & Tủ Kệ",
  "Coffee & Side Tables": "Bàn Trà & Bàn Góc",
  "Wardrobes & Cabinets": "Tủ Quần Áo & Tủ Lớn",
  "Office Desks & Chairs": "Bàn Ghế Làm Việc",
  "Dining Tables & Chairs": "Bàn Ghế Ăn",
  "Beds & Mattresses": "Giường Ngủ & Nệm",
  "Sofa & Armchair": "Sofa & Ghế Thư Giãn",
};

const getProductMetrics = () => {
  return { rating: 5.0, reviewCount: 12 };
};

// ==========================================
// 1. CATEGORY PAGE (Tối ưu hóa UI gọn gàng, chuyển trang tức thì)
// ==========================================
export function CategoryPage() {
  const { id } = useParams();
  const { addToCart, wishlist, toggleWishlist } = useShop();

  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [categoryInfo, setCategoryInfo] = useState({
    name: 'Danh Mục Sản Phẩm',
    description: 'Tuyển tập các thiết kế kiến trúc đương đại được tuyển chọn từ LUMORA.',
  });
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsLoading(true);
    setApiError(null);

    async function fetchCategoryDataFast() {
      try {
        // Tăng limit lên 500 để lấy trọn vẹn toàn bộ sản phẩm từ cũ đến mới
        const [categoriesRes, productsRes] = await Promise.all([
          categoryAPI.getCategories(),
          productAPI.getProducts({ limit: 100 })
        ]);

        if (!isMounted) return;

        const categoriesList = categoriesRes?.data?.categories || categoriesRes?.data || [];
        const productsList = productsRes?.data?.products || productsRes?.data || [];

        // Tìm chính xác danh mục đang được chọn trên URL
        const matchedCategory = categoriesList.find((cat) => {
          const catId = String(cat._id || cat.id || "").trim();
          const catSlug = (cat.slug || "").toLowerCase().trim();
          const catName = (cat.name || "").toLowerCase().trim();
          const targetId = String(id || "").toLowerCase().trim();

          return (
            catId === String(id).trim() ||
            catSlug === targetId ||
            catName === targetId ||
            Object.keys(CATEGORY_TRANSLATIONS).some(
              (key) => key.toLowerCase() === catName && CATEGORY_TRANSLATIONS[key].toLowerCase() === targetId
            )
          );
        });

        if (matchedCategory) {
          const rawName = matchedCategory.name || '';
          const translatedName = CATEGORY_TRANSLATIONS[rawName] || rawName;

          setCategoryInfo({
            name: translatedName,
            description: matchedCategory.description || 'Tuyển tập các thiết kế kiến trúc đương đại được tuyển chọn từ LUMORA.',
          });
        } else {
          setCategoryInfo({
            name: "Bộ Sưu Tập Nội Thất",
            description: 'Tuyển tập các thiết kế kiến trúc đương đại được tuyển chọn từ LUMORA.',
          });
        }

        const matchedCatId = String(matchedCategory?._id || matchedCategory?.id || "").trim();
        const targetSlug = String(id || "").toLowerCase().trim();
        const matchedCatName = String(matchedCategory?.name || "").toLowerCase().trim();

        // Lọc chuẩn xác tuyệt đối: Chỉ lấy sản phẩm thuộc đúng ID danh mục hoặc đúng tên/slug danh mục đó
        const filteredProducts = productsList.filter((product) => {
          if (!id) return true;
          
          const rawProdCat = product.categoryId;
          
          // Lấy ID danh mục của sản phẩm
          const productCatId = typeof rawProdCat === 'object' && rawProdCat !== null
            ? String(rawProdCat._id || rawProdCat.id || "").trim() 
            : String(rawProdCat || "").trim();
            
          // Lấy tên danh mục của sản phẩm
          const productCategoryName = typeof rawProdCat === 'object' && rawProdCat !== null
            ? String(rawProdCat.name || "").toLowerCase().trim()
            : String(product.categoryName || "").toLowerCase().trim();

          // Lấy slug danh mục của sản phẩm
          const productCategorySlug = String(product.categorySlug || "").toLowerCase().trim();

          // So sánh khít sao cho không bị lẫn lộn giữa các danh mục khác nhau
          const isIdMatch = (matchedCatId && productCatId === matchedCatId) || productCatId === targetSlug;
          const isSlugMatch = productCategorySlug === targetSlug;
          const isNameMatch = productCategoryName === targetSlug || (matchedCatName && productCategoryName === matchedCatName);

          return isIdMatch || isSlugMatch || isNameMatch;
        });

        // Sắp xếp sản phẩm từ cũ đến mới (hoặc từ mới đến cũ tùy ý, ở đây xếp từ cũ đến mới theo createdAt)
        filteredProducts.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

        setProducts(filteredProducts);
      } catch (err) {
        console.error("Lỗi tải dữ liệu danh mục:", err);
        if (isMounted) {
          setApiError('Không thể tải dữ liệu sản phẩm từ hệ thống.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchCategoryDataFast();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="section container" style={{ paddingTop: "32px", paddingBottom: "64px", maxWidth: "1280px" }}>
      {/* Tiêu đề danh mục gọn gàng */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <span className="section-heading__badge" style={{ fontSize: "0.75rem", letterSpacing: "0.15em" }}>
          BỘ SƯU TẬP LUMORA
        </span>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.4rem", margin: "8px 0 10px" }}>
          {categoryInfo?.name}
        </h1>
        <p style={{ color: "var(--lumora-text-muted)", fontSize: "0.9rem", maxWidth: "550px", marginInline: "auto", lineHeight: 1.5 }}>
          {categoryInfo?.description}
        </p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--lumora-text-muted)", fontSize: "0.95rem" }}>
          Đang tải sản phẩm...
        </div>
      ) : apiError ? (
        <div style={{ textAlign: "center", padding: "30px", backgroundColor: "#fff5f5", borderRadius: "10px", border: "1px solid #feb2b2" }}>
          <p style={{ color: "#c53030", fontWeight: "600", fontSize: "0.9rem" }}>{apiError}</p>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 20px" }}>
          <p style={{ fontSize: "1rem", color: "var(--lumora-text-muted)" }}>Chưa có sản phẩm nào trong danh mục này.</p>
          <Link to="/products" className="wishlist-page__primary-btn" style={{ marginTop: "14px", display: "inline-flex", fontSize: "0.85rem" }}>
            Khám phá tất cả sản phẩm
          </Link>
        </div>
      ) : (
        /* Grid sản phẩm tối ưu cân đối 4 cột, không bị bự chảng */
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "24px",
        }}>
          {products.map((product) => {
            const prodId = String(product._id || product.id);
            const isWishlisted = wishlist.includes(prodId);
            const price = product.minPrice ?? product.price ?? product.unitPrice ?? 0;
            const img = product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';
            const metrics = getProductMetrics();

            return (
              <article key={prodId} className="product-card" style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid var(--lumora-border, #E2DBD0)", backgroundColor: "#fff", display: "flex", flexDirection: "column" }}>
                {/* Phần ảnh card gọn gàng vừa mắt */}
                <div className="product-card__image-container" style={{ position: "relative", height: "220px", overflow: "hidden", backgroundColor: "#f9f8f6" }}>
                  <img 
                    src={img} 
                    alt={product.name} 
                    className="product-card__image product-card__image--primary"
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
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
                    style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(255,255,255,0.85)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                  >
                    <Heart size={16} fill={isWishlisted ? "#8A6A48" : "none"} color={isWishlisted ? "#8A6A48" : "currentColor"} />
                  </button>
                </div>

                {/* Chi tiết thông tin sản phẩm */}
                <div className="product-card__details" style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                  <div>
                    <div className="product-card__meta" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span className="product-card__variant" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#888" }}>
                        {typeof product.brandId === 'object' ? product.brandId?.name : "LUMORA"}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.78rem', color: '#666' }}>
                        <Star size={12} fill="#8A6A48" color="#8A6A48" /> {metrics.rating}
                      </div>
                    </div>

                    <h3 className="product-card__title" style={{ fontSize: "0.92rem", fontWeight: "600", margin: "0 0 10px 0", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      <Link to={`/product/${product.slug || prodId}`} style={{ textDecoration: "none", color: "inherit" }}>{product.name}</Link>
                    </h3>
                  </div>

                  <div className="product-card__footer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid #f0eee9" }}>
                    <div className="product-card__pricing">
                      <span className="product-card__price" style={{ fontSize: "0.95rem", fontWeight: "700", color: "#8A6A48" }}>{formatVND(price)}</span>
                    </div>

                    <button
                      className="product-card__add-btn"
                      onClick={() => addToCart(product)}
                      type="button"
                      aria-label={`Thêm ${product.name} vào giỏ`}
                      style={{ background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "6px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }}
                    >
                      <ShoppingBag size={15} />
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
              fontFamily: "'Playfair Display', serif",
              fontSize: "2.2rem",
              margin: 0,
              color: "var(--lumora-text-main)",
            }}
          >
            Giỏ Hàng Của Bạn{" "}
            <span style={{ fontSize: "1.3rem", fontFamily: "'Montserrat', sans-serif"}}>
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

      {isCartLoading && (
        <div style={{ padding: "12px 16px", backgroundColor: "#F3F4F6", borderRadius: "8px", marginBottom: "20px", fontSize: "0.85rem", color: "#4B5563" }}>
          Đang đồng bộ với hệ thống giỏ hàng ...
        </div>
      )}

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
              const itemPrice = item.unitPrice || prod.price || prod.minPrice || 0;

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
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "1.1rem",
                        marginBottom: "4px",
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
                fontFamily: "'Playfair Display', serif",
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
  const [variantPricesMap, setVariantPricesMap] = useState({});

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  useEffect(() => {
    let isMounted = true;
    async function fetchVariantPrices() {
      if (!wishlistProducts || wishlistProducts.length === 0) return;

      const newPricesMap = {};

      await Promise.all(
        wishlistProducts.map(async (item) => {
          const prodId = String(item.id || item._id || item.productId || item.product?._id);
          if (!prodId) return;

          const directPrice = Number(item.price ?? item.minPrice ?? item.unitPrice ?? item.product?.price ?? item.product?.minPrice ?? 0);
          if (directPrice > 0) {
            newPricesMap[prodId] = directPrice;
            return;
          }

          try {
            const response = productAPI.getProductVariants 
              ? await productAPI.getProductVariants(prodId) 
              : await fetch(`/api/products/${prodId}/variants`).then(res => res.json());

            const variantsList = response?.data?.variants || response?.data || response || [];
            
            if (Array.isArray(variantsList) && variantsList.length > 0) {
              const firstVariantPrice = Number(variantsList[0].price || variantsList[0].unitPrice || 0);
              newPricesMap[prodId] = firstVariantPrice;
            }
          } catch (err) {
            console.warn(`Không thể lấy variants cho sản phẩm ${prodId}:`, err);
          }
        })
      );

      if (isMounted) {
        setVariantPricesMap(newPricesMap);
      }
    }

    fetchVariantPrices();
  }, [wishlistProducts]);

  const toggleSelected = (productId) => {
    const target = String(productId);
    setUnselectedIds((current) => {
      const next = new Set(current);
      if (next.has(target)) next.delete(target);
      else next.add(target);
      return next;
    });
  };

  const getProductPrice = (item) => {
    const prodId = String(item.id || item._id || item.productId || item.product?._id);
    const directPrice = Number(
      item.price ?? 
      item.minPrice ?? 
      item.unitPrice ?? 
      item.product?.price ?? 
      item.product?.minPrice ?? 
      item.product?.basePrice ?? 
      0
    );

    if (directPrice > 0) return directPrice;
    return variantPricesMap[prodId] || 0;
  };

  const selectedProducts = wishlistProducts.filter((p) => !unselectedIds.has(String(p.id || p._id || p.product?._id || p.productId)));
  
  const selectedTotal = selectedProducts.reduce((sum, p) => {
    return sum + getProductPrice(p);
  }, 0);

  const handleCheckout = () => {
    selectedProducts.forEach((p) => addToCart(p));
    navigate("/checkout");
  };

  return (
    <div className="section container wishlist-page">
      <div className="wishlist-page__header">
        <span className="section-heading__badge" style={{ fontFamily: "'Playfair Display', serif" }}>LUMORA CURATED</span>
        <h1 style={{ fontFamily: "'Playfair Display', serif" }}>Danh Sách Yêu Thích</h1>
        <p style={{fontStyle: "italic", fontSize: "15px"}}>Lưu lại những thiết kế bạn yêu thích và đồng bộ trực tiếp với tài khoản LUMORA.</p>
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
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem" }}>Danh sách yêu thích đang trống</h2>
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
                  onClick={() => setUnselectedIds(new Set(wishlistProducts.map((p) => String(p.id || p._id || p.product?._id || p.productId))))}
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            {wishlistProducts.map((item) => {
              const prodId = String(item.id || item._id || item.product?._id || item.productId);
              const isChecked = !unselectedIds.has(prodId);
              const price = getProductPrice(item);
              const productName = item.name || item.product?.name || "Sản phẩm cao cấp";
              const productSlug = item.slug || item.product?.slug || prodId;
              const imgUrl = item.image || item.product?.images?.[0] || item.product?.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';

              return (
                <article className="wishlist-item" key={prodId}>
                  <label className="wishlist-item__check">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelected(prodId)}
                      aria-label={`Chọn ${productName} để mua`}
                    />
                    <span />
                  </label>
                  <img
                    src={imgUrl}
                    alt={productName}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="wishlist-item__details">
                    <span>{item.variantLabel || item.product?.categoryName || "Phiên bản thủ công"}</span>
                    <h2 style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      <Link to={`/product/${productSlug}`}>{productName}</Link>
                    </h2>
                    <strong>{formatVND(price)}</strong>
                  </div>
                  <button
                    type="button"
                    className="wishlist-item__remove"
                    onClick={() => toggleWishlist(prodId)}
                    aria-label={`Xóa ${productName} khỏi danh sách yêu thích`}
                  >
                    <Trash2 size={17} />
                  </button>
                </article>
              );
            })}
          </div>

          <aside className="wishlist-summary">
            <h2 style={{ fontFamily: "'Playfair Display', serif" }}>Tóm Tắt Lựa Chọn</h2>
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
// 4. CHECKOUT PAGE & OTHER ROUTES EXPORTS
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