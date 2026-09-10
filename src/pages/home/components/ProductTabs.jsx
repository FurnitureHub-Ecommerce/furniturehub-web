import { useState } from 'react';
import ProductCard from '../../../components/ui/ProductCard';
import { PRODUCTS } from '../../../data/homeData';
import './ProductTabs.css';

const TABS = [
  { id: 'featured',    label: 'Featured' },
  { id: 'latest',      label: 'Latest' },
  { id: 'best-seller', label: 'Best Seller' },
];

function ProductTabs() {
  const [activeTab, setActiveTab] = useState('featured');

  const visibleProducts = PRODUCTS.filter((p) => p.tab === activeTab);

  return (
    <section className="product-tabs" aria-label="Product catalogue tabs">
      {/* ---- Heading ---- */}
      <h2 className="product-tabs__heading">Our Products</h2>
      <p className="product-tabs__subline">
        Handpicked furniture for your home
      </p>

      {/* ---- Tab Bar ---- */}
      <div className="product-tabs__tabs" role="tablist" aria-label="Product categories">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            className={`product-tabs__tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ---- Product Grid ---- */}
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="product-tabs__grid"
      >
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default ProductTabs;
