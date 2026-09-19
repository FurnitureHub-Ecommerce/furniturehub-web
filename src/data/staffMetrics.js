/**
 * src/data/staffMetrics.js
 * Dashboard KPI data and recent activity feed for the Staff section.
 * Replace with API calls later.
 */

export const staffDashboardMetrics = [
  {
    label: 'TỔNG NHÂN VIÊN ĐANG LÀM',
    value: '7',
    sub: '5 đang làm ca hôm nay',
    icon: 'users',
  },
  {
    label: 'ĐANG LÀM CA NÀY',
    value: '05',
    sub: '3 Sáng · 2 Chiều',
    icon: 'clock',
  },
  {
    label: 'SLA THỰC THI TB',
    value: '98.7%',
    sub: 'Mục tiêu 98% — Đang ổn',
    icon: 'target',
    highlight: 'green',
  },
  {
    label: 'THỜI GIAN XỬ LÝ ĐƠN TB',
    value: '2.4h',
    sub: '↓ 12% so với tuần trước',
    icon: 'zap',
  },
];

export const recentActivity = [
  {
    id: 1,
    staffName: 'Elena Vasquez',
    action: 'Đã duyệt đơn hàng #LM-8921 để giao đi',
    timestamp: 'Hôm nay, 09:32',
    type: 'order',
  },
  {
    id: 2,
    staffName: 'Marcus Chen',
    action: 'Hoàn tất kiểm tra chất lượng lô #BTH-0044 (12 món)',
    timestamp: 'Hôm nay, 09:14',
    type: 'fulfillment',
  },
  {
    id: 3,
    staffName: 'Sophia Andersson',
    action: 'Đánh dấu đơn #LM-8919 — không khớp mẫu vải',
    timestamp: 'Hôm nay, 08:55',
    type: 'alert',
  },
  {
    id: 4,
    staffName: 'Ingrid Halvorsen',
    action: 'Đã giao 3 đơn tới Rotterdam Hub',
    timestamp: 'Hôm nay, 08:40',
    type: 'dispatch',
  },
  {
    id: 5,
    staffName: 'Anh Nguyen',
    action: 'Cập nhật hồ sơ khách hàng Lady Genevieve V.',
    timestamp: 'Hôm qua, 17:20',
    type: 'client',
  },
  {
    id: 6,
    staffName: 'Marcus Chen',
    action: 'Nhận lô hàng nhập #INB-2281 (8 pallet)',
    timestamp: 'Hôm qua, 16:05',
    type: 'fulfillment',
  },
];
