/**
 * src/data/staffMetrics.js
 * Dashboard KPI data and recent activity feed for the Staff section.
 * Replace with API calls later.
 */

export const staffDashboardMetrics = [
  {
    label: 'TOTAL ACTIVE STAFF',
    value: '7',
    sub: '5 on-shift today',
    icon: 'users',
  },
  {
    label: 'ON SHIFT NOW',
    value: '05',
    sub: '3 Morning · 2 Afternoon',
    icon: 'clock',
  },
  {
    label: 'AVG. SLA COMPLIANCE',
    value: '98.7%',
    sub: 'Target 98% — On Track',
    icon: 'target',
    highlight: 'green',
  },
  {
    label: 'AVG. ORDER PROCESSING',
    value: '2.4h',
    sub: '↓ 12% vs last week',
    icon: 'zap',
  },
];

export const recentActivity = [
  {
    id: 1,
    staffName: 'Elena Vasquez',
    action: 'Approved order #LM-8921 for dispatch',
    timestamp: 'Today, 09:32',
    type: 'order',
  },
  {
    id: 2,
    staffName: 'Marcus Chen',
    action: 'Completed QA on batch #BTH-0044 (12 items)',
    timestamp: 'Today, 09:14',
    type: 'fulfillment',
  },
  {
    id: 3,
    staffName: 'Sophia Andersson',
    action: 'Flagged order #LM-8919 — swatch mismatch',
    timestamp: 'Today, 08:55',
    type: 'alert',
  },
  {
    id: 4,
    staffName: 'Ingrid Halvorsen',
    action: 'Dispatched 3 orders to Rotterdam Hub',
    timestamp: 'Today, 08:40',
    type: 'dispatch',
  },
  {
    id: 5,
    staffName: 'Anh Nguyen',
    action: 'Updated client profile for Lady Genevieve V.',
    timestamp: 'Yesterday, 17:20',
    type: 'client',
  },
  {
    id: 6,
    staffName: 'Marcus Chen',
    action: 'Received inbound shipment #INB-2281 (8 pallets)',
    timestamp: 'Yesterday, 16:05',
    type: 'fulfillment',
  },
];
