import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import { productAPI } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, PRODUCT_IMAGE_OVERRIDES } from '../../../utils/formatters';
import './SearchModal.css';

const formatVND = (price) => formatCurrency(price);

export function SearchModal() {
  const { isSearchOpen, setIsSearchOpen, setQuickViewProduct } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  // Load initial suggestions or perform debounced search
  useEffect(() => {
    if (!isSearchOpen) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const queryParams = searchTerm.trim() ? { search: searchTerm.trim() } : {};
        const res = await productAPI.getProducts(queryParams);
        const data = res.data;
        const rawProds = Array.isArray(data) ? data : data?.products || [];

        const formatted = rawProds.slice(0, 6).map((p) => {
          const price = p.minPrice ?? p.price ?? 0;
          const overrideImages = PRODUCT_IMAGE_OVERRIDES[p.name];
          const image = overrideImages?.[0] || p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80';
          const brandName = typeof p.brandId === 'object' && p.brandId?.name ? p.brandId.name : 'LUMORA';
          return {
            id: p._id || p.id,
            name: p.name,
            price,
            image,
            variantLabel: brandName,
            slug: p.slug || p._id || p.id,
          };
        });

        setResults(formatted);
      } catch (err) {
        console.warn('Search query error:', err.message);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, isSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={() => setIsSearchOpen(false)}>
      <div
        className="search-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Tìm kiếm sản phẩm"
      >
        <div className="search-modal-header">
          {isLoading ? (
            <Loader2 size={20} className="animate-spin text-amber-800" />
          ) : (
            <Search size={22} className="search-modal-icon" />
          )}
          <input
            type="text"
            className="search-modal-input"
            placeholder="Tìm theo sản phẩm, bàn, ghế, sofa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <button
            className="search-modal-close"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Đóng tìm kiếm"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="search-modal-body">
          <p className="search-modal-subtitle">
            {searchTerm.trim()
              ? `Kết quả tìm kiếm (${results.length})`
              : 'Gợi ý từ danh mục LUMORA'}
          </p>

          {results.length === 0 && !isLoading ? (
            <div className="search-empty">
              Không tìm thấy sản phẩm phù hợp với "{searchTerm}"
            </div>
          ) : (
            <div className="search-results-list">
              {results.map((product) => (
                <div
                  key={product.id}
                  className="search-result-item"
                  onClick={() => {
                    navigate(`/product/${product.slug || product.id}`);
                    setIsSearchOpen(false);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="search-result-thumb"
                  />
                  <div className="search-result-info">
                    <span className="search-result-name">{product.name}</span>
                    <span className="search-result-variant">{product.variantLabel}</span>
                  </div>
                  <span className="search-result-price">
                    {formatVND(product.price)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
