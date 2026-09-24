import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBag,
  Heart,
  Check,
  ShieldCheck,
  Truck,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
} from "lucide-react";
import { PRODUCTS, CATEGORIES } from "../../data/lumoraData";
import { useShop } from "../../context/ShopContext";
import Rating from "../../components/common/Rating/Rating";
import "./Wishlist.css";

export function CategoryPage() {
  const { id } = useParams();
  const { addToCart, wishlist, toggleWishlist } = useShop();

  const categoryInfo = CATEGORIES.find((c) => c.id === id) || {
    name: id ? id.replace("-", " ").toUpperCase() : "BỘ SƯU TẬP",
    description: "Khám phá các thiết kế nội thất cao cấp",
  };

  const categoryProducts = PRODUCTS.filter((p) => p.category === id || !id);

  return (
    <div
      className="section container"
      style={{ paddingTop: "40px", paddingBottom: "80px" }}
    >
      <div style={{ marginBottom: "40px", textAlign: "center" }}>
        <span
          className="section-heading__badge"
          style={{ fontFamily: '"Bodoni Moda", serif', fontSize: "0.8rem" }}
        >
          Bộ sưu tập LUMORA
        </span>
        <h1
          style={{
            fontFamily: '"Bodoni Moda", serif',
            fontSize: "3.8rem",
            textTransform: "capitalize",
          }}
        >
          {categoryInfo.name}
        </h1>
        <p style={{ color: "var(--lumora-text-muted)", marginTop: "8px" }}>
          {categoryInfo.description}
        </p>
      </div>

      <div className="product-showcase__grid">
        {categoryProducts.map((product) => {
          const isWishlisted = wishlist.includes(product.id);

          return (
            <article key={product.id} className="product-card">
              <div className="product-card__image-container">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-card__image product-card__image--primary"
                />
                <img
                  src={product.hoverImage || product.image}
                  alt={product.name}
                  className="product-card__image product-card__image--hover"
                />

                <button
                  className={`product-card__wishlist-btn ${isWishlisted ? "product-card__wishlist-btn--active" : ""}`}
                  onClick={() => toggleWishlist(product.id)}
                  type="button"
                >
                  <Heart size={18} fill={isWishlisted ? "#8A6A48" : "none"} />
                </button>
              </div>

              <div className="product-card__details">
                <div className="product-card__meta">
                  <span className="product-card__variant">
                    {product.variantLabel}
                  </span>
                  <Rating
                    score={product.rating}
                    reviewCount={product.reviewCount}
                  />
                </div>

                <h3 className="product-card__title">
                  <Link to={`/product/${product.slug}`}>{product.name}</Link>
                </h3>

                <div className="product-card__footer">
                  <div className="product-card__pricing">
                    <span className="product-card__price">
                      ${product.price.toLocaleString()}
                    </span>
                  </div>

                  <button
                    className="product-card__cart-btn"
                    onClick={() => addToCart(product)}
                    type="button"
                  >
                    <ShoppingBag size={16} />
                    <span>Thêm vào giỏ</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart, wishlist, toggleWishlist, setIsCartOpen } = useShop();

  const product = PRODUCTS.find((p) => p.slug === slug) || PRODUCTS[0];
  const isWishlisted = wishlist.includes(product.id);

  return (
    <div
      className="section container"
      style={{ paddingTop: "40px", paddingBottom: "80px" }}
    >
      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          color: "var(--lumora-text-muted)",
          marginBottom: "24px",
        }}
      >
        <ArrowLeft size={18} />
        <span>Quay lại trang chủ</span>
      </Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "48px",
          alignItems: "start",
        }}
      >
        <div
          style={{
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            border: "1px solid var(--lumora-border)",
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>

        <div>
          <span
            className="section-heading__badge"
            style={{ fontFamily: '"Bodoni Moda", serif', fontSize: "14px" }}
          >
            Chế tác độc quyền
          </span>
          <h1
            style={{
              fontFamily: '"Bodoni Moda", serif',
              fontSize: "2.6rem",
              marginBottom: "8px",
            }}
          >
            {product.name}
          </h1>
          <p
            style={{
              color: "var(--lumora-text-muted)",
              marginBottom: "16px",
              fontFamily: '"Bodoni Moda", serif',
            }}
          >
            {product.variantLabel}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                fontFamily: '"Bodoni Moda", serif',
                fontSize: "2rem",
                fontWeight: "700",
                color: "var(--lumora-accent-wood)",
              }}
            >
              ${product.price.toLocaleString()}
            </span>
            <Rating score={product.rating} reviewCount={product.reviewCount} />
          </div>

          <p
            style={{
              lineHeight: "1.7",
              color: "var(--lumora-text-muted)",
              marginBottom: "32px",
            }}
          >
            {product.name} mang lại nét đẹp tối giản đương đại với kết cấu từ gỗ
            sồi tự nhiên đạt chứng nhận FSC®, kết hợp chi tiết làm thủ công tinh
            xảo bởi các nghệ nhân giàu kinh nghiệm.
          </p>

          <div style={{ display: "flex", gap: "16px", marginBottom: "40px" }}>
            <button
              onClick={() => {
                addToCart(product);
                setIsCartOpen(true);
              }}
              style={{
                flex: 1,
                padding: "16px",
                backgroundColor: "var(--lumora-text-main)",
                color: "#FFFFFF",
                borderRadius: "var(--radius-md)",
                fontWeight: "600",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <ShoppingBag size={20} />
              <span>Thêm Vào Giỏ Hàng</span>
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              style={{
                width: "56px",
                height: "56px",
                border: "1px solid var(--lumora-border)",
                borderRadius: "var(--radius-md)",
                justifyContent: "center",
                backgroundColor: isWishlisted
                  ? "var(--lumora-bg-secondary)"
                  : "#FFFFFF",
              }}
            >
              <Heart
                size={22}
                fill={isWishlisted ? "#8A6A48" : "none"}
                color={isWishlisted ? "#8A6A48" : "currentColor"}
              />
            </button>
          </div>

          <div
            style={{
              borderTop: "1px solid var(--lumora-border)",
              paddingTop: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "0.9rem",
                color: "var(--lumora-text-muted)",
              }}
            >
              <Truck size={18} color="var(--lumora-accent-wood)" />
              <span>Miễn phí giao hàng White Glove cho đơn trên $2,000</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "0.9rem",
                color: "var(--lumora-text-muted)",
              }}
            >
              <ShieldCheck size={18} color="var(--lumora-accent-wood)" />
              <span>Bảo hành khung kết cấu 10 năm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartPage() {
  const { cart, cartCount, cartSubtotal, updateCartQuantity, removeFromCart } =
    useShop();

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
          gap: "12px",
          marginBottom: "32px",
        }}
      >
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
          <span
            style={{ fontSize: "1.4rem", color: "var(--lumora-text-muted)" }}
          >
            ({cartCount} sản phẩm)
          </span>
        </h1>
      </div>

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
              fontFamily: '"Bodoni Moda", serif'
            }}
          >
            Chưa có sản phẩm nội thất nào trong giỏ hàng của bạn.
          </p>
          <Link
            to="/"
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
              transition: "all 0.2s ease",
            }}
          >
            Khám phá bộ sưu tập <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        /* Chia lưới 2 cột: Danh sách sản phẩm (chiếm không gian lớn) và Tóm tắt đơn hàng */
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
            {cart.map(({ product, quantity }) => (
              <div
                key={product.id}
                style={{
                  display: "flex",
                  gap: "20px",
                  paddingBlock: "20px",
                  borderBottom: "1px solid var(--lumora-border)",
                  alignItems: "center",
                }}
              >
                <img
                  src={product.image}
                  alt={product.name}
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
                    {product.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--lumora-text-muted)",
                      marginBottom: "8px",
                    }}
                  >
                    {product.variantLabel}
                  </p>
                  <p
                    style={{
                      fontWeight: "600",
                      color: "var(--lumora-accent-wood)",
                      fontSize: "1.05rem",
                    }}
                  >
                    ${product.price.toLocaleString()}
                  </p>
                </div>

                {/* Điều chỉnh số lượng & Xóa */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "12px",
                  }}
                >
                  <button
                    onClick={() => removeFromCart(product.id)}
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
                      onClick={() => updateCartQuantity(product.id, -1)}
                      style={{
                        padding: "6px 10px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
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
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(product.id, 1)}
                      style={{
                        padding: "6px 10px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cột phải: Thẻ tóm tắt đơn hàng thanh toán */}
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
              <span
                style={{ fontWeight: "600", color: "var(--lumora-text-main)" }}
              >
                ${cartSubtotal.toLocaleString()}
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
              <span
                style={{
                  color: "var(--lumora-accent-wood)",
                  fontWeight: "600",
                }}
              >
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
                ${cartSubtotal.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => alert("Đơn hàng đã được ghi nhận thành công!")}
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
                transition: "background-color 0.2s ease",
              }}
            >
              TẠO ĐƠN HÀNG & THANH TOÁN <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function WishlistPage() {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const [selectedIds, setSelectedIds] = useState(() => new Set(wishlist));
  const wishlistProducts = PRODUCTS.filter((product) => wishlist.includes(product.id));
  const selectedProducts = wishlistProducts.filter((product) => selectedIds.has(product.id));
  const selectedTotal = selectedProducts.reduce((total, product) => total + product.price, 0);

  const toggleSelected = (productId) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const handleCheckout = () => {
    selectedProducts.forEach((product) => addToCart(product));
    navigate("/checkout");
  };

  return (
    <div className="section container wishlist-page">
      <div className="wishlist-page__header">
        <span className="section-heading__badge">LUMORA CURATED</span>
        <h1 style={{fontFamily: '"Bodoni Moda", serif'}}>Danh Sách Yêu Thích</h1>
        <p>Lưu lại những thiết kế bạn yêu thích và chọn món muốn mua.</p>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="wishlist-empty">
          <Heart size={42} strokeWidth={1.4} />
          <h2 style={{fontFamily: '"Bodoni Moda", serif'}}>Danh sách yêu thích đang trống</h2>
          <p>Hãy bấm biểu tượng trái tim trên sản phẩm để lưu lại thiết kế yêu thích.</p>
          <Link to="/collections" className="wishlist-page__primary-btn">
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
                  onClick={() => setSelectedIds(new Set(wishlistProducts.map((product) => product.id)))}
                >
                  Chọn tất cả
                </button>
                <button type="button" onClick={() => setSelectedIds(new Set())}>
                  Bỏ chọn
                </button>
              </div>
            </div>

            {wishlistProducts.map((product) => (
              <article className="wishlist-item" key={product.id}>
                <label className="wishlist-item__check">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(product.id)}
                    onChange={() => toggleSelected(product.id)}
                    aria-label={`Chọn ${product.name} để mua`}
                  />
                  <span />
                </label>
                <img src={product.image} alt={product.name} />
                <div className="wishlist-item__details">
                  <span>{product.variantLabel}</span>
                  <h2 style={{fontFamily: '"Bodoni Moda", serif'}}><Link to={`/product/${product.slug}`}>{product.name}</Link></h2>
                  <strong>${product.price.toLocaleString()}</strong>
                </div>
                <button
                  type="button"
                  className="wishlist-item__remove"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={`Xóa ${product.name} khỏi danh sách yêu thích`}
                >
                  <Trash2 size={17} />
                </button>
              </article>
            ))}
          </div>

          <aside className="wishlist-summary">
            <h2 style={{fontFamily: '"Bodoni Moda", serif'}}>Tóm Tắt Lựa Chọn</h2>
            <div><span>Sản phẩm đã chọn</span><strong>{selectedProducts.length}</strong></div>
            <div><span>Tạm tính</span><strong>${selectedTotal.toLocaleString()}</strong></div>
            <p>Phí giao hàng White-Glove miễn phí cho đơn từ $2,000.</p>
            <button
              type="button"
              className="wishlist-page__primary-btn"
              disabled={selectedProducts.length === 0}
              onClick={handleCheckout}
            >
              Thanh toán <ArrowRight size={17} />
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}

export function CheckoutPage() {
  const { cart, cartSubtotal } = useShop();

  return (
    <div className="section container checkout-page">
      <div className="wishlist-page__header">
        <span className="section-heading__badge">SECURE CHECKOUT</span>
        <h1>Thanh Toán</h1>
        <p>Hoàn tất thông tin để chúng tôi chuẩn bị đơn hàng cho bạn.</p>
      </div>
      <div className="checkout-layout">
        <form
          className="checkout-form"
          onSubmit={(event) => {
            event.preventDefault();
            alert("Đơn hàng đã được ghi nhận thành công!");
          }}
        >
          <h2>Thông tin giao hàng</h2>
          <label>Họ và tên<input required name="name" placeholder="Nguyễn Văn A" /></label>
          <label>Email<input required type="email" name="email" placeholder="you@example.com" /></label>
          <label>Số điện thoại<input required name="phone" placeholder="090 123 4567" /></label>
          <label>Địa chỉ giao hàng<textarea required name="address" rows="4" placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố" /></label>
          <button className="wishlist-page__primary-btn" type="submit">Xác nhận đặt hàng <Check size={17} /></button>
        </form>
        <aside className="wishlist-summary checkout-summary">
          <h2>Đơn hàng của bạn</h2>
          {cart.map(({ product, quantity }) => (
            <div className="checkout-summary__item" key={product.id}>
              <span>{product.name} <small>x{quantity}</small></span>
              <strong>${(product.price * quantity).toLocaleString()}</strong>
            </div>
          ))}
          <div className="checkout-summary__total"><span>Tổng cộng</span><strong>${cartSubtotal.toLocaleString()}</strong></div>
        </aside>
      </div>
    </div>
  );
}

export function CollectionsPage() {
  return <CategoryPage />;
}

export function LookbookPage() {
  return <CategoryPage />;
}
