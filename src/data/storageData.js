// src/data/storageData.js

export const storageMetrics = [
  { label: 'TỔNG SỐ SKU', value: '128', sub: 'Đang quản lý trong hệ thống' },
  { label: 'HÀNG TỒN KHO (TỔNG)', value: '1,420', sub: 'Sản phẩm sẵn sàng lưu trữ' },
  { label: 'VỊ TRÍ LƯU TRỮ', value: '45 Vịnh', sub: 'Khu vực kho A & Kho B' },
  { label: 'CẢNH BÁO TỒN THẤP', value: '4 SKU', sub: 'Dưới mức tồn kho tối thiểu' }
];

export const skuProducts = [
  { id: 'SKU-8821', name: 'LUMORA Atelier Signature Vase', specs: 'Gốm thủ công - Màu Trà / Cao 30cm', location: 'Kho A - Vịnh 04', stock: 42 },
  { id: 'SKU-8822', name: 'LUMORA Minimalist Ceramic Plate', specs: 'Bộ 3 cái - Men mờ / Đường kính 20cm', location: 'Kho A - Vịnh 05', stock: 8 }, // Sắp hết
  { id: 'SKU-8823', name: 'LUMORA Artisan Aroma Diffuser', specs: 'Đất nung kết hợp gỗ sồi tự nhiên', location: 'Kho B - Vịnh 12', stock: 15 },
  { id: 'SKU-8824', name: 'LUMORA Linen Table Runner', specs: 'Vải lanh tự nhiên - 160x40cm', location: 'Kho B - Vịnh 14', stock: 0 }, // Hết hàng
];