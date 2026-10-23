import { storageAPI } from './api';

export const loadStorageVariants = async () => {
  try {
    const response = await storageAPI.getInventory();
    
    let rawList = [];
    const actualData = response?.data !== undefined ? response.data : response;
    
    if (Array.isArray(actualData)) {
      rawList = actualData;
    } else if (actualData && typeof actualData === 'object') {
      if (Array.isArray(actualData.inventories)) rawList = actualData.inventories;
      else if (Array.isArray(actualData.data)) rawList = actualData.data;
      else if (Array.isArray(actualData.inventory)) rawList = actualData.inventory;
      else if (Array.isArray(actualData.items)) rawList = actualData.items;
      else if (Array.isArray(actualData.variants)) rawList = actualData.variants;
    }

    return rawList.map((item, index) => {
      const stockVal = item.stock ?? item.quantity ?? item.inventoryCount ?? item.qty ?? 0;
      const vInfo = item.variantId || {};
      const pInfo = vInfo.productId || item.product || {};

      const name = pInfo.name || vInfo.name || item.productName || item.name || 'Sản phẩm nội thất';
      const skuCode = vInfo.sku || item.sku || (item._id ? String(item._id).slice(-6) : `SKU-${index + 1}`);

      const color = vInfo.color || item.color;
      const material = vInfo.material || item.material;
      const specs = (color || material) ? `${color ? color : ''} ${material ? `- ${material}` : ''}`.trim() : 'Tiêu chuẩn - Gỗ/Kim loại';

      return {
        // Giữ lại toàn bộ dữ liệu gốc của item để các trang cần chi tiết có thể truy cập trực tiếp
        ...item,
        id: skuCode,
        sku: skuCode,
        variantId: vInfo,
        name: name,
        specs: specs,
        stock: Number(stockVal),
        quantity: Number(stockVal),
      };
    });
  } catch (error) {
    console.error('Lỗi tải dữ liệu tồn kho từ API /api/inventory:', error);
    return [];
  }
};

export const loadInventoryTransactionsFromBE = async () => {
  try {
    const response = await storageAPI.getInventoryTransactions();
    const actualData = response?.data !== undefined ? response.data : response;
    
    if (Array.isArray(actualData)) return actualData;
    if (Array.isArray(actualData?.transactions)) return actualData.transactions;
    if (Array.isArray(actualData?.data)) return actualData.data;
    
    return [];
  } catch (error) {
    console.error('Lỗi tải lịch sử biến động kho từ BE:', error);
    return [];
  }
};