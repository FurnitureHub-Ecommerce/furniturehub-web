import { useState, useEffect } from 'react';
import HeroBanner from '../../components/home/HeroBanner/HeroBanner';
import FeaturedCategories from '../../components/home/FeaturedCategories/FeaturedCategories';
import ProductShowcase from '../../components/home/ProductShowcase/ProductShowcase';
import EditorialSpotlight from '../../components/home/EditorialSpotlight/EditorialSpotlight';
import ValueProps from '../../components/home/ValueProps/ValueProps';
import Testimonials from '../../components/home/Testimonials/Testimonials';
import { ShoppingBag, Heart, X } from 'lucide-react';
import './Home.css';

export function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState(['prod-2', 'prod-6']);
  const [cart, setCart] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Simulate initial network loading skeleton
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleWishlist = (productId) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      showToast(exists ? 'Removed item from Wishlist' : 'Added item to Wishlist', 'heart');
      return updated;
    });
  };

  const handleAddToCart = (product) => {
    setCart((prev) => [...prev, product]);
    showToast(`Added "${product.name}" to your shopping bag`, 'bag');
  };

  const showToast = (message, type = 'bag') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <main className="home-page" id="main-content">
      {/* Dev Demo Skeleton Loading Toggle */}
      <div className="demo-state-bar">
        <span>Demo State Controls:</span>
        <button
          className="demo-state-btn"
          onClick={() => setIsLoading((prev) => !prev)}
          type="button"
        >
          {isLoading ? 'Show Rendered Home Page' : 'Simulate Loading Skeleton State'}
        </button>
      </div>

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

      {/* 1. Hero Section */}
      <HeroBanner isLoading={isLoading} />

      {/* 2. Featured Categories */}
      <FeaturedCategories isLoading={isLoading} />

      {/* 3. Featured & New Arrivals Product Showcase */}
      <ProductShowcase
        isLoading={isLoading}
        wishlist={wishlist}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
      />

      {/* 4. Editorial / Lookbook Spotlight */}
      <EditorialSpotlight isLoading={isLoading} onAddToCart={handleAddToCart} />

      {/* 5. Value Propositions */}
      <ValueProps />

      {/* 6. Customer Testimonials */}
      <Testimonials />
    </main>
  );
}

export default Home;
