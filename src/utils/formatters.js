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
  'Studio & Office': 'Phòng làm việc',
  'Outdoor Living': 'Ngoại thất & Sân vườn',
  // Slug mappings
  'living-room': 'Phòng khách',
  'dining-room': 'Phòng ăn',
  'bedroom': 'Phòng ngủ',
  'lighting-decor': 'Đèn & Trang trí',
  'studio-office': 'Phòng làm việc',
  'outdoor-living': 'Ngoại thất',
  'wabi-sabi': 'Phòng khách Wabi-Sabi',
};

export function formatCategoryName(name) {
  if (!name) return '';
  return CATEGORY_MAP[name] || CATEGORY_MAP[name.toLowerCase()] || name;
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
  'Kệ Sách Đứng 5 Tầng Khung Sắt Vesta': [
    'https://images.unsplash.com/photo-1594643156334-a28a2a0d9e79?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1000&q=85'
  ],
};

// Genuine ratings mapping (kept empty so only real reviews from database are displayed)
export const PRODUCT_METRICS_MAP = {};

export function getProductMetrics(productName, defaultRating, defaultReviews) {
  const rating =
    defaultRating !== undefined && defaultRating !== null
      ? Number(defaultRating)
      : 0;
  const reviewCount =
    defaultReviews !== undefined && defaultReviews !== null
      ? Number(defaultReviews)
      : 0;
  return { rating, reviewCount };
}
