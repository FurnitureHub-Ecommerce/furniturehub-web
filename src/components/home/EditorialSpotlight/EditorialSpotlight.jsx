import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Sparkles, Plus, Check, AlertCircle, RefreshCw, FolderX } from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import { Skeleton } from '../../common/Skeleton/Skeleton';
import { formatCurrency } from '../../../utils/formatters';
import { productAPI, getApiErrorMessage } from '../../../services/api';
import './EditorialSpotlight.css';
import lookbookImage from '../../../assets/lookbook.png';

export function EditorialSpotlight() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeProductId, setActiveProductId] = useState(null);
  const [addedItem, setAddedItem] = useState(null);

  const { addToCart } = useShop();

  const fetchProductsForLookbook = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await productAPI.getProducts();
      
      // Bóc tách chính xác thuộc tính products từ Backend
      const actualData = response?.data?.products || response?.data || [];

      setProducts(actualData);
      
      if (actualData.length > 0) {
        setActiveProductId(actualData[0]._id || actualData[0].id);
      }
    } catch (err) {
      const errorMsg = getApiErrorMessage(err, 'Không thể tải dữ liệu lookbook từ máy chủ.');
      setError(errorMsg);
      console.error('Lỗi tải sản phẩm lookbook:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsForLookbook();
  }, []);

  const hotspotCoordinates = [
    { x: 90, y: 60 },
    { x: 15, y: 39 },
 
    { x: 36, y: 32 },
    { x: 72, y: 48 },
  ];

  // Map dữ liệu thực từ thuộc tính Backend trong ảnh
  const lookbookItems = products.slice(0, 4).map((item, index) => {
    const coord = hotspotCoordinates[index] || { x: 50, y: 50 };
    return {
      ...item,
      id: item._id || item.id,
      x: coord.x,
      y: coord.y,
      name: item.name,
      price: item.minPrice ?? 0,
      material: item.description || 'Chất liệu cao cấp',
      image: Array.isArray(item.images) && item.images.length > 0 
        ? item.images[0] 
        : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
      category: item.categoryId?.name || 'Nội thất cao cấp'
    };
  });

  const activeItem = lookbookItems.find((item) => item.id === activeProductId) || lookbookItems[0];

  const handleAddToCart = (item) => {
    addToCart(item);
    setAddedItem(item.id);
    setTimeout(() => {
      setAddedItem(null);
    }, 2000);
  };

  return (
    <section className="section editorial-spotlight" aria-label="Điểm nhấn lookbook được tuyển chọn">
      <div className="container">
        <div className="editorial-spotlight__header">
          <span className="section-heading__badge">
            <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} />
            Mua theo Lookbook
          </span>
          <h2 className="editorial-spotlight__title">Điểm nhấn không gian sống được tuyển chọn</h2>
          <p className="editorial-spotlight__subtitle">
            Khám phá không gian Kyoto Residence của chúng tôi. Chạm vào các điểm nhấn tương tác để khám phá các món nội thất thủ công được hòa quyện với môi trường tự nhiên.
          </p>
        </div>

        {error ? (
          <div className="ui-state-card ui-state-card--error" style={{ textAlign: 'center', padding: '48px', backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #eae5e0' }}>
            <AlertCircle size={36} color="#D93838" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Không thể tải dữ liệu từ Backend</h3>
            <p style={{ color: '#666', marginBottom: '16px' }}>{error}</p>
            <button onClick={fetchProductsForLookbook} className="ui-state-retry-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#1a1a1a', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
              <RefreshCw size={16} />
              <span>Thử lại API</span>
            </button>
          </div>
        ) : lookbookItems.length === 0 && !isLoading ? (
          <div className="ui-state-card ui-state-card--empty" style={{ textAlign: 'center', padding: '48px', backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #eae5e0' }}>
            <FolderX size={36} color="#888" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Chưa có dữ liệu sản phẩm</h3>
            <p style={{ color: '#666' }}>Không tìm thấy sản phẩm nào từ máy chủ.</p>
          </div>
        ) : (
          <div className="editorial-spotlight__split">
            <div className="editorial-spotlight__image-box">
              <img
                src={lookbookImage}
                alt="Phòng khách phong cách sống Kyoto Residence"
                className="editorial-spotlight__main-image"
                loading="lazy"
              />
              <div className="editorial-spotlight__overlay" />

              {isLoading ? null : lookbookItems.map((spot) => {
                const isActive = spot.id === activeProductId;
                return (
                  <button
                    key={spot.id}
                    className={`hotspot-pin ${isActive ? 'hotspot-pin--active' : ''}`}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    onClick={() => setActiveProductId(spot.id)}
                    aria-label={`Xem sản phẩm ${spot.name}`}
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

            <div className="editorial-spotlight__sidebar">
              <span className="editorial-spotlight__spot-tag">Sản phẩm nổi bật</span>

              {isLoading ? (
                <Skeleton height="180px" borderRadius="14px" />
              ) : activeItem ? (
                <div className="hotspot-featured-card">
                  <div className="hotspot-featured-card__image-wrap">
                    <img
                      src={activeItem.image}
                      alt={activeItem.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>
                  <div className="hotspot-featured-card__details">
                    <span className="hotspot-featured-card__category">{activeItem.category}</span>
                    <h3 className="hotspot-featured-card__name">{activeItem.name}</h3>
                    <p className="hotspot-featured-card__material">{activeItem.material}</p>
                    <div className="hotspot-featured-card__footer">
                      <span className="hotspot-featured-card__price">{formatCurrency(activeItem.price)}</span>
                      <button
                        className={`hotspot-featured-card__btn ${
                          addedItem === activeItem.id ? 'hotspot-featured-card__btn--added' : ''
                        }`}
                        onClick={() => handleAddToCart(activeItem)}
                        type="button"
                      >
                        {addedItem === activeItem.id ? (
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
              ) : null}

              <div className="hotspot-list-section">
                <h4 className="hotspot-list-title">Tất cả sản phẩm trong phòng ({lookbookItems.length})</h4>
                <ul className="hotspot-list">
                  {isLoading
                    ? Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} height="60px" borderRadius="10px" />)
                    : lookbookItems.map((spot) => {
                        const isActive = spot.id === activeProductId;
                        return (
                          <li key={spot.id}>
                            <button
                              className={`hotspot-list-item ${isActive ? 'hotspot-list-item--active' : ''}`}
                              onClick={() => setActiveProductId(spot.id)}
                              type="button"
                            >
                              <img
                                src={spot.image}
                                alt={spot.name}
                                className="hotspot-list-thumb"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src =
                                    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80';
                                }}
                              />
                              <div className="hotspot-list-info">
                                <span className="hotspot-list-name">{spot.name}</span>
                                <span className="hotspot-list-material">{spot.material}</span>
                              </div>
                              <span className="hotspot-list-price">{formatCurrency(spot.price)}</span>
                            </button>
                          </li>
                        );
                      })}
                </ul>
              </div>

             
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default EditorialSpotlight;