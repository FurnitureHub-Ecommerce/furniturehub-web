import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import { PRODUCTS } from '../../../data/lumoraData';
import { Link } from 'react-router-dom';
import './SearchModal.css';

export function SearchModal() {
  const { isSearchOpen, setIsSearchOpen, setQuickViewProduct } = useShop();
  const [searchTerm, setSearchTerm] = useState('');

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

  if (!isSearchOpen) return null;

  const results = searchTerm.trim()
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.variantLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : PRODUCTS.slice(0, 4);

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
          <Search size={22} className="search-modal-icon" />
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
              : 'Sản phẩm gợi ý nổi bật'}
          </p>

          {results.length === 0 ? (
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
                    setQuickViewProduct(product);
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
                    ${product.price.toLocaleString()}
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
