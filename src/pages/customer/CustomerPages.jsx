import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Heart, Star, Check, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../../data/lumoraData';
import { useShop } from '../../context/ShopContext';
import Rating from '../../components/common/Rating/Rating';

export function CategoryPage() {
  const { id } = useParams();
  const { setQuickViewProduct, addToCart, wishlist, toggleWishlist } = useShop();

  const categoryInfo = CATEGORIES.find((c) => c.id === id) || {
    name: id ? id.replace('-', ' ').toUpperCase() : 'BỘ SƯU TẬP',
    description: 'Khám phá các thiết kế nội thất cao cấp',
  };

  const categoryProducts = PRODUCTS.filter((p) => p.category === id || !id);

  return (
    <div className="section container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <span className="section-heading__badge">Bộ sưu tập LUMORA</span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.8rem', textTransform: 'capitalize' }}>
          {categoryInfo.name}
        </h1>
        <p style={{ color: 'var(--lumora-text-muted)', marginTop: '8px' }}>
          {categoryInfo.description}
        </p>
      </div>

      <div className="product-showcase__grid">
        {categoryProducts.map((product) => {
          const isWishlisted = wishlist.includes(product.id);

          return (
            <article key={product.id} className="product-card">
              <div className="product-card__image-container">
                <img src={product.image} alt={product.name} className="product-card__image product-card__image--primary" />
                <img src={product.hoverImage || product.image} alt={product.name} className="product-card__image product-card__image--hover" />
                
                <button
                  className={`product-card__wishlist-btn ${isWishlisted ? 'product-card__wishlist-btn--active' : ''}`}
                  onClick={() => toggleWishlist(product.id)}
                  type="button"
                >
                  <Heart size={18} fill={isWishlisted ? '#8A6A48' : 'none'} />
                </button>
              </div>

              <div className="product-card__details">
                <div className="product-card__meta">
                  <span className="product-card__variant">{product.variantLabel}</span>
                  <Rating score={product.rating} reviewCount={product.reviewCount} />
                </div>

                <h3 className="product-card__title">
                  <Link to={`/product/${product.slug}`}>{product.name}</Link>
                </h3>

                <div className="product-card__footer">
                  <div className="product-card__pricing">
                    <span className="product-card__price">${product.price.toLocaleString()}</span>
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
    <div className="section container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--lumora-text-muted)', marginBottom: '24px' }}>
        <ArrowLeft size={18} />
        <span>Quay lại trang chủ</span>
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'start' }}>
        <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--lumora-border)' }}>
          <img src={product.image} alt={product.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        <div>
          <span className="section-heading__badge">Chế tác độc quyền</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.6rem', marginBottom: '8px' }}>{product.name}</h1>
          <p style={{ color: 'var(--lumora-text-muted)', marginBottom: '16px' }}>{product.variantLabel}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: '700', color: 'var(--lumora-accent-wood)' }}>
              ${product.price.toLocaleString()}
            </span>
            <Rating score={product.rating} reviewCount={product.reviewCount} />
          </div>

          <p style={{ lineHeight: '1.7', color: 'var(--lumora-text-muted)', marginBottom: '32px' }}>
            {product.name} mang lại nét đẹp tối giản đương đại với kết cấu từ gỗ sồi tự nhiên đạt chứng nhận FSC®, kết hợp chi tiết làm thủ công tinh xảo bởi các nghệ nhân giàu kinh nghiệm.
          </p>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
            <button
              onClick={() => {
                addToCart(product);
                setIsCartOpen(true);
              }}
              style={{
                flex: 1,
                padding: '16px',
                backgroundColor: 'var(--lumora-text-main)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                fontWeight: '600',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <ShoppingBag size={20} />
              <span>Thêm Vào Giỏ Hàng</span>
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              style={{
                width: '56px',
                height: '56px',
                border: '1px solid var(--lumora-border)',
                borderRadius: 'var(--radius-md)',
                justifyContent: 'center',
                backgroundColor: isWishlisted ? 'var(--lumora-bg-secondary)' : '#FFFFFF'
              }}
            >
              <Heart size={22} fill={isWishlisted ? '#8A6A48' : 'none'} color={isWishlisted ? '#8A6A48' : 'currentColor'} />
            </button>
          </div>

          <div style={{ borderTop: '1px solid var(--lumora-border)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: 'var(--lumora-text-muted)' }}>
              <Truck size={18} color="var(--lumora-accent-wood)" />
              <span>Miễn phí giao hàng White Glove cho đơn trên $2,000</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: 'var(--lumora-text-muted)' }}>
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
  const { cart, cartCount, cartSubtotal, updateCartQuantity, removeFromCart } = useShop();

  return (
    <div className="section container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '32px' }}>
        Giỏ Hàng Của Bạn ({cartCount} sản phẩm)
      </h1>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--lumora-text-muted)', marginBottom: '24px' }}>
            Chưa có sản phẩm nào trong giỏ hàng.
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              padding: '14px 28px',
              backgroundColor: 'var(--lumora-accent-wood)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              fontWeight: '600'
            }}
          >
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
          <div>
            {cart.map(({ product, quantity }) => (
              <div key={product.id} style={{ display: 'flex', gap: '20px', paddingBlock: '20px', borderBottom: '1px solid var(--lumora-border)' }}>
                <img src={product.image} alt={product.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }}>{product.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--lumora-text-muted)' }}>{product.variantLabel}</p>
                  <p style={{ fontWeight: '600', color: 'var(--lumora-accent-wood)', marginTop: '4px' }}>
                    ${product.price.toLocaleString()}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '12px' }}>
                    <button onClick={() => updateCartQuantity(product.id, -1)} style={{ padding: '4px 8px', border: '1px solid var(--lumora-border)' }}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => updateCartQuantity(product.id, 1)} style={{ padding: '4px 8px', border: '1px solid var(--lumora-border)' }}>+</button>
                    <button onClick={() => removeFromCart(product.id)} style={{ color: '#D93838', marginLeft: 'auto', fontSize: '0.85rem' }}>Xóa</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '28px', backgroundColor: 'var(--lumora-bg-secondary)', borderRadius: 'var(--radius-lg)', height: 'fit-content' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '20px' }}>Tóm Tắt Đơn Hàng</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '1.05rem' }}>
              <span>Tạm tính</span>
              <span style={{ fontWeight: '600' }}>${cartSubtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '1.05rem' }}>
              <span>Giao hàng</span>
              <span style={{ color: 'var(--lumora-accent-wood)', fontWeight: '600' }}>Miễn phí</span>
            </div>
            <button
              onClick={() => alert('Đơn hàng đã được ghi nhận thành công!')}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: 'var(--lumora-text-main)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                fontWeight: '600',
                justifyContent: 'center'
              }}
            >
              TẠO ĐƠN HÀNG & THANH TOÁN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function CollectionsPage() {
  return <CategoryPage />;
}

export function LookbookPage() {
  return <CategoryPage />;
}
