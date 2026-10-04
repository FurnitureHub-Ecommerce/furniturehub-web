/**
 * src/utils/formatters.js
 * Utility formatters for Currency and Vietnamese Category localization
 */

export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0 ₫';
  }
  const num = Math.round(Number(amount));
  return `${num.toLocaleString('vi-VN')} ₫`;
}

export const CATEGORY_MAP = {
  'Coffee & Side Tables': 'Bàn trà & Bàn góc',
  'Wardrobes & Cabinets': 'Tủ quần áo & Tủ lưu trữ',
  'Office Desks & Chairs': 'Bàn làm việc & Ghế văn phòng',
  'TV Units & Media': 'Kệ tivi & Đa phương tiện',
  'Home Decor & Lighting': 'Đèn & Trang trí',
  'Bookshelves & Shelving': 'Kệ sách & Giá lưu trữ',
  'Dining Tables & Chairs': 'Bàn ăn & Ghế ăn',
  'Beds & Mattresses': 'Giường ngủ & Nệm',
  'Sofa & Armchair': 'Sofa & Ghế bành',
  'Living Room': 'Phòng khách',
  'Dining Room': 'Phòng ăn',
  'Bedroom': 'Phòng ngủ',
  'Lighting & Decor': 'Đèn & Trang trí',
};

export function formatCategoryName(name) {
  if (!name) return 'Nội thất';
  return CATEGORY_MAP[name] || name;
}

// Media mapping to ensure accurate product imagery
export const PRODUCT_IMAGE_OVERRIDES = {
  'Bàn Trà Đôi Mặt Đá Marble Luna': [
    'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1533090161767-e6ffed986b88?auto=format&fit=crop&w=1000&q=85'
  ],
  'Tủ Quần Áo 4 Cánh Kính Cường Lực Aura': [
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=85'
  ],
  'Ghế Công Thái Học Ergonomic Master V2': [
    'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1580481077195-c3a82104e30b?auto=format&fit=crop&w=1000&q=85'
  ],
  'Ghế Ăn Bọc Nệm Chân Thép Koster': [
    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1000&q=85'
  ],
};

// Natural ratings and review distribution for luxury catalogue
export const PRODUCT_METRICS_MAP = {
  'Sofa Băng Da Bò Milano Luxury': { rating: 5.0, reviewCount: 48 },
  'Giường Ngủ Queen Size Gỗ Sồi Oslor': { rating: 4.9, reviewCount: 36 },
  'Ghế Công Thái Học Ergonomic Master V2': { rating: 4.8, reviewCount: 52 },
  'Bàn Trà Đôi Mặt Đá Marble Luna': { rating: 4.9, reviewCount: 29 },
  'Bàn Ăn Mở Rộng Thông Minh Twist': { rating: 4.7, reviewCount: 18 },
  'Kệ Tivi Treo Tường Hiện Đại Horizon': { rating: 4.8, reviewCount: 31 },
  'Đèn Cây Đứng Phòng Khách Lucciola': { rating: 4.9, reviewCount: 42 },
  'Kệ Sách Đứng 5 Tầng Khung Sắt Vesta': { rating: 4.6, reviewCount: 19 },
  'Tủ Quần Áo 4 Cánh Kính Cường Lực Aura': { rating: 5.0, reviewCount: 15 },
  'Ghế Ăn Bọc Nệm Chân Thép Koster': { rating: 4.7, reviewCount: 26 },
  'Bàn Làm Việc Nâng Hạ Điện Tử ErgoDesk': { rating: 4.8, reviewCount: 38 },
  'Sofa Góc L Nordic Fabric': { rating: 4.9, reviewCount: 45 },
};

export function getProductMetrics(productName, defaultRating = 4.8, defaultReviews = 25) {
  if (PRODUCT_METRICS_MAP[productName]) {
    return PRODUCT_METRICS_MAP[productName];
  }
  // Deterministic fallback based on name length
  const hash = (productName || '').length;
  const rating = Number((4.6 + (hash % 5) * 0.1).toFixed(1));
  const reviewCount = 15 + (hash * 7) % 40;
  return { rating, reviewCount };
}
