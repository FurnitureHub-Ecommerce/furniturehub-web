import { useState, useEffect, useCallback } from 'react';
import HeroBanner from '../../components/home/HeroBanner/HeroBanner';
import FeaturedCategories from '../../components/home/FeaturedCategories/FeaturedCategories';
import ProductShowcase from '../../components/home/ProductShowcase/ProductShowcase';
import EditorialSpotlight from '../../components/home/EditorialSpotlight/EditorialSpotlight';
import ValueProps from '../../components/home/ValueProps/ValueProps';
import Testimonials from '../../components/home/Testimonials/Testimonials';
import { categoryAPI, productAPI } from '../../services/api';
import { useShop } from '../../context/ShopContext';
import { ShoppingBag, Heart, X, WifiOff, RefreshCw, Layers } from 'lucide-react';
import './Home.css';

export function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [categories, setCategories] = useState(null);
  const [products, setProducts] = useState(null);
  const { toastMessage, setToastMessage, addToCart } = useShop();

  const fetchHomeData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);

    try {
      const [catResult, prodResult] = await Promise.allSettled([
        categoryAPI.getCategories(),
        productAPI.getProducts(),
      ]);

      let hasError = false;
      let errorMsg = '';

      if (catResult.status === 'fulfilled') {
        const catData = catResult.value;
        setCategories(Array.isArray(catData) ? catData : catData?.categories || []);
      } else {
        hasError = true;
        errorMsg = catResult.reason?.message || 'Lỗi khi tải danh mục API';
      }

      if (prodResult.status === 'fulfilled') {
        const prodData = prodResult.value;
        setProducts(Array.isArray(prodData) ? prodData : prodData?.products || []);
      } else {
        hasError = true;
        errorMsg = prodResult.reason?.message || 'Lỗi khi tải sản phẩm API';
      }

      if (hasError && catResult.status === 'rejected' && prodResult.status === 'rejected') {
        setApiError(errorMsg || 'Không thể kết nối đến máy chủ Backend.');
      }
    } catch (err) {
      setApiError(err.message || 'Đã xảy ra lỗi không xác định.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  return (
    <main className="home-page" id="main-content">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification" role="status" aria-live="polite">
          {toastMessage.type === 'heart' ? (
            <Heart size={18} fill="var(--lumora-accent-wood)" color="var(--lumora-accent-wood)" />
          ) : (
            <ShoppingBag size={18} />
          )}
          <span>{toastMessage.message}</span>
          <button
            className="toast-close"
            onClick={() => setToastMessage(null)}
            aria-label="Close notification"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Global API Error Alert Banner if fetch fails completely */}
      {apiError && (
        <div className="container" style={{ paddingTop: '20px' }}>
          <div style={{ padding: '16px 24px', backgroundColor: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <WifiOff size={22} color="#E53E3E" />
              <div>
                <strong style={{ color: '#9B2C2C', fontSize: '0.95rem' }}>Kết nối Backend API: </strong>
                <span style={{ color: '#742A2A', fontSize: '0.9rem' }}>{apiError}</span>
              </div>
            </div>
            <button
              onClick={fetchHomeData}
              style={{ padding: '8px 16px', backgroundColor: '#E53E3E', color: '#FFF', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <RefreshCw size={14} />
              <span>Thử lại</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Hero Section */}
      <HeroBanner isLoading={isLoading} />

      {/* 2. Featured Categories */}
      <FeaturedCategories
        isLoading={isLoading}
        error={categories === null && apiError ? apiError : null}
        categories={categories}
        onRetry={fetchHomeData}
      />

      {/* 3. Featured & New Arrivals Product Showcase */}
      <ProductShowcase
        isLoading={isLoading}
        error={products === null && apiError ? apiError : null}
        products={products}
        onRetry={fetchHomeData}
      />

      {/* 4. Editorial / Lookbook Spotlight */}
      <EditorialSpotlight isLoading={isLoading} onAddToCart={addToCart} />

      {/* 5. Value Propositions */}
      <ValueProps />

      {/* 6. Customer Testimonials */}
      <Testimonials />
    </main>
  );
}

export default Home;
