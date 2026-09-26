// Dữ liệu báo cáo độc lập, không mở rộng schema Catalog hoặc mô tả API Backend.
export const analyticsPeriods = [
  { id: '2025-Q4', label: 'Quý 4/2025', start: '2025-10-01', end: '2025-12-31' },
  { id: '2025-Q3', label: 'Quý 3/2025', start: '2025-07-01', end: '2025-09-30' },
];

export const analyticsProducts = [
  { id: 'report-table', name: 'Bàn Đá Travertine Navona', category: 'Dining', atelier: 'Atelier Tivoli', sku: 'DEMO-8419', price: 8400 },
  { id: 'report-chair', name: 'Ghế Atelier Walnut Sculptural', category: 'Living Sanctuary', atelier: 'Xưởng Milan', sku: 'DEMO-2201', price: 3250 },
  { id: 'report-light', name: 'Đèn Chùm Murano & Đúc Bronze', category: 'Lighting', atelier: 'Venetian Vault', sku: 'DEMO-6910', price: 5800 },
  { id: 'report-bed', name: 'Giường Monolith Walnut', category: 'Resting', atelier: 'Carrara Reserve', sku: 'DEMO-5542', price: 5500 },
];

export const analyticsStatuses = [
  { id: 'pending', label: 'Chờ xác nhận & Giữ cọc' },
  { id: 'crafting', label: 'Đang chế tác tại Atelier' },
  { id: 'packing', label: 'Đang kiểm định nghệ thuật & Đóng kiện' },
  { id: 'shipping', label: 'Vận chuyển White-Glove' },
  { id: 'completed', label: 'Hoàn tất bàn giao' },
];

export const analyticsChannels = ['Private Vault Salon', 'Công ty tư vấn kiến trúc', 'Direct Atelier Digital Concierge'];

// Công thức cố định giúp demo lặp lại được; ngày không phát sinh đơn vẫn hiện trên biểu đồ.
export const analyticsOrders = Array.from({ length: 184 }, (_, day) => {
  const date = new Date(Date.UTC(2025, 6, 1 + day)).toISOString().slice(0, 10);
  if (day % 13 === 0) return [];
  return Array.from({ length: 1 + day % 3 }, (_, index) => {
    const product = analyticsProducts[(day + index) % analyticsProducts.length];
    const quantity = 1 + (day + index) % 2;
    return {
      id: `report-${day}-${index}`, date, productId: product.id, quantity,
      value: product.price * quantity, customerId: `report-customer-${(day * 3 + index) % 36}`,
      status: analyticsStatuses[(day + index) % analyticsStatuses.length].id,
      channel: analyticsChannels[(day + index) % analyticsChannels.length],
    };
  });
}).flat();
