import { monitoringReferenceDate, monitoringStatuses, monitoringWarehouses, monitoringMaterials, monitoringOrders } from '../../data/mock/admin/monitoring.mock.js';

export async function getMonitoring({ period = 'all', status = '' } = {}) {
  if (!['all', 'today', '7d', '30d'].includes(period) || (status && !monitoringStatuses.some(item => item.id === status))) throw new Error('Bộ lọc giám sát không hợp lệ.');
  const days = { today: 1, '7d': 7, '30d': 30 }[period];
  const startDate = days ? new Date(Date.parse(`${monitoringReferenceDate}T00:00:00Z`) - (days - 1) * 86400000).toISOString().slice(0, 10) : null;
  // Fixture dùng +07:00; lấy ngày địa phương, bao gồm cả hai ngày biên.
  const inPeriod = monitoringOrders.filter(order => {
    const day = order.createdAt.slice(0, 10);
    return day <= monitoringReferenceDate && (!startDate || day >= startDate);
  });
  const orders = inPeriod.filter(order => !status || order.status === status).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(order => ({ ...order, warehouse: monitoringWarehouses.find(warehouse => warehouse.id === order.warehouseId) }));
  const lowStock = monitoringMaterials.filter(material => material.quantity <= material.threshold).map(material => ({ ...material, warehouse: monitoringWarehouses.find(warehouse => warehouse.id === material.warehouseId) }));
  const warehouses = monitoringWarehouses.map(warehouse => ({ ...warehouse, usagePercent: warehouse.occupiedM3 / warehouse.capacityM3 * 100, lowStockCount: lowStock.filter(material => material.warehouseId === warehouse.id).length }));
  const occupiedM3 = warehouses.reduce((sum, warehouse) => sum + warehouse.occupiedM3, 0);
  const capacityM3 = warehouses.reduce((sum, warehouse) => sum + warehouse.capacityM3, 0);
  return structuredClone({
    referenceDate: monitoringReferenceDate, startDate, period, status, orders,
    // Badge tab tính theo kỳ trước khi lọc trạng thái, tổng luôn gồm cả đơn hoàn tất.
    statuses: monitoringStatuses.map(item => ({ ...item, count: inPeriod.filter(order => order.status === item.id).length })),
    totalOrders: inPeriod.length,
    runningValue: inPeriod.filter(order => order.status !== 'completed').reduce((sum, order) => sum + order.total, 0),
    filteredValue: orders.reduce((sum, order) => sum + order.total, 0),
    warehouses, lowStock, occupiedM3, capacityM3, usagePercent: capacityM3 ? occupiedM3 / capacityM3 * 100 : 0,
  });
}
