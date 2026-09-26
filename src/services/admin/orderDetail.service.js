import { getMonitoring } from './monitoring.service.js';

export async function getOrderDetail(orderId) {
  if (typeof orderId !== 'string' || !orderId) return null;
  const data = await getMonitoring({ period: 'all' });
  const order = data.orders.find(item => item.id === orderId);
  // Không thay mã không tồn tại bằng đơn mẫu hoặc suy diễn dữ liệu dòng hàng.
  if (!order) return null;
  return { ...order, statusLabel: data.statuses.find(item => item.id === order.status)?.label ?? order.status };
}
