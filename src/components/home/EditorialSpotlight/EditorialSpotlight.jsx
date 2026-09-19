import { useState } from 'react';
import { ShoppingBag, ArrowRight, Sparkles, Plus, Check } from 'lucide-react';
import { EDITORIAL_LOOKBOOK } from '../../../data/lumoraData';
import { Skeleton } from '../../common/Skeleton/Skeleton';
import './EditorialSpotlight.css';

export function EditorialSpotlight({ isLoading = false, onAddToCart }) {
  const [activeHotspotId, setActiveHotspotId] = useState('hs-1');
  const [addedItem, setAddedItem] = useState(null);

  if (isLoading) {
    return (
      <section className="section editorial-spotlight">
        <div className="container">
          <Skeleton height="500px" borderRadius="var(--radius-lg)" />
        </div>
      </section>
    );
  }

  const activeHotspot = EDITORIAL_LOOKBOOK.hotspots.find((h) => h.id === activeHotspotId) || EDITORIAL_LOOKBOOK.hotspots[0];

  const handleAddToCart = (hotspot) => {
    if (onAddToCart) {
      onAddToCart(hotspot);
    }
    setAddedItem(hotspot.id);
    setTimeout(() => {
      setAddedItem(null);
    }, 2000);
  };

  return (
    <section className="section editorial-spotlight" aria-label="Điểm nhấn lookbook được tuyển chọn">
      <div className="container">
        {/* Section Header */}
        <div className="editorial-spotlight__header">
          <span className="section-heading__badge">
            <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} />
            Mua theo Lookbook
          </span>
          <h2 className="editorial-spotlight__title">{EDITORIAL_LOOKBOOK.title}</h2>
          <p className="editorial-spotlight__subtitle">{EDITORIAL_LOOKBOOK.subtitle}</p>
        </div>

        {/* Split View Container */}
        <div className="editorial-spotlight__split">
          {/* Left: Large Interactive Room Image */}
          <div className="editorial-spotlight__image-box">
            <img
              src={EDITORIAL_LOOKBOOK.heroImage}
              alt="Phòng khách phong cách sống Kyoto Residence"
              className="editorial-spotlight__main-image"
              loading="lazy"
            />
            <div className="editorial-spotlight__overlay" />

            {/* Hotspot Pulse Pins */}
            {EDITORIAL_LOOKBOOK.hotspots.map((spot) => {
              const isActive = spot.id === activeHotspotId;
              return (
                <button
                  key={spot.id}
                  className={`hotspot-pin ${isActive ? 'hotspot-pin--active' : ''}`}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  onClick={() => setActiveHotspotId(spot.id)}
                  aria-label={`Điểm nhấn cho ${spot.name}`}
                  type="button"
                >
                  <span className="hotspot-pin__ripple" />
                  <span className="hotspot-pin__core">
                    <Plus size={14} />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Active Item Details & Hotspot Items List */}
          <div className="editorial-spotlight__sidebar">
            <span className="editorial-spotlight__spot-tag">Sản phẩm nổi bật</span>

            {/* Active Highlighted Product Card */}
            <div className="hotspot-featured-card">
              <div className="hotspot-featured-card__image-wrap">
                <img src={activeHotspot.image} alt={activeHotspot.name} />
              </div>
              <div className="hotspot-featured-card__details">
                <span className="hotspot-featured-card__category">{activeHotspot.category}</span>
                <h3 className="hotspot-featured-card__name">{activeHotspot.name}</h3>
                <p className="hotspot-featured-card__material">{activeHotspot.material}</p>
                <div className="hotspot-featured-card__footer">
                  <span className="hotspot-featured-card__price">{activeHotspot.price}</span>
                  <button
                    className={`hotspot-featured-card__btn ${
                      addedItem === activeHotspot.id ? 'hotspot-featured-card__btn--added' : ''
                    }`}
                    onClick={() => handleAddToCart(activeHotspot)}
                    type="button"
                  >
                    {addedItem === activeHotspot.id ? (
                      <>
                        <Check size={16} />
                        <span>Trong giỏ</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={16} />
                        <span>Thêm vào giỏ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* All Room Items List */}
            <div className="hotspot-list-section">
              <h4 className="hotspot-list-title">Tất cả sản phẩm trong phòng ({EDITORIAL_LOOKBOOK.hotspots.length})</h4>
              <ul className="hotspot-list">
                {EDITORIAL_LOOKBOOK.hotspots.map((spot) => {
                  const isActive = spot.id === activeHotspotId;
                  return (
                    <li key={spot.id}>
                      <button
                        className={`hotspot-list-item ${isActive ? 'hotspot-list-item--active' : ''}`}
                        onClick={() => setActiveHotspotId(spot.id)}
                        type="button"
                      >
                        <img src={spot.image} alt={spot.name} className="hotspot-list-thumb" />
                        <div className="hotspot-list-info">
                          <span className="hotspot-list-name">{spot.name}</span>
                          <span className="hotspot-list-material">{spot.material}</span>
                        </div>
                        <span className="hotspot-list-price">{spot.price}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <a href="/lookbook" className="editorial-spotlight__full-link">
              <span>Xem toàn bộ Lookbook Kyoto Residency</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EditorialSpotlight;
