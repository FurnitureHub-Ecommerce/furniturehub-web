import {
  analyticsPeriods,
  analyticsProducts,
  analyticsOrders,
  analyticsStatuses,
  analyticsChannels,
} from "../../data/mock/admin/analytics.mock.js";

const dayMs = 86400000;
const shiftDate = (date, days) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + days * dayMs)
    .toISOString()
    .slice(0, 10);
const validDate = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;

export async function getAnalytics({
  period = "2025-Q4",
  range = "30d",
  start: customStart,
  end: customEnd,
} = {}) {
  const selected = analyticsPeriods.find((item) => item.id === period);
  if (!selected || !["today", "7d", "30d", "custom"].includes(range))
    throw new Error("Kỳ hoặc khoảng báo cáo không hợp lệ.");
  const end = range === "custom" ? customEnd : selected.end;
  const start =
    range === "custom"
      ? customStart
      : shiftDate(end, -{ today: 0, "7d": 6, "30d": 29 }[range]);
  if (
    !validDate(start) ||
    !validDate(end) ||
    start > end ||
    start < selected.start ||
    end > selected.end
  )
    throw new Error("Chọn ngày bắt đầu và kết thúc hợp lệ trong kỳ báo cáo.");
  const orders = analyticsOrders.filter(
    (order) => order.date >= start && order.date <= end,
  );
  const total = orders.reduce((sum, order) => sum + order.value, 0);
  const percent = (value) => (total ? (value / total) * 100 : 0);
  const series = [];
  for (let date = start; date <= end; date = shiftDate(date, 1)) {
    series.push({
      date,
      value: orders
        .filter((order) => order.date === date)
        .reduce((sum, order) => sum + order.value, 0),
    });
  }
  const products = analyticsProducts
    .map((product) => {
      const rows = orders.filter((order) => order.productId === product.id);
      return {
        ...product,
        quantity: rows.reduce((sum, row) => sum + row.quantity, 0),
        value: rows.reduce((sum, row) => sum + row.value, 0),
      };
    })
    .sort((a, b) => b.value - a.value);
  const categories = [
    ...new Set(analyticsProducts.map((product) => product.category)),
  ]
    .map((name) => {
      const value = products
        .filter((product) => product.category === name)
        .reduce((sum, product) => sum + product.value, 0);
      return { name, value, percent: percent(value) };
    })
    .sort((a, b) => b.value - a.value);
  const customers = new Set(orders.map((order) => order.customerId)).size;
  const frequencies = [1, 2, 3].map((count) => ({
    label:
      count === 3
        ? "Từ 3 đơn trong khoảng chọn"
        : `${count} đơn trong khoảng chọn`,
    count: [...new Set(orders.map((order) => order.customerId))].filter(
      (id) => {
        const size = orders.filter((order) => order.customerId === id).length;
        return count === 3 ? size >= 3 : size === count;
      },
    ).length,
  }));
  // GMV demo là tổng giá trị đơn tạo trong khoảng chọn, chưa phải doanh thu kế toán.
  return structuredClone({
    periods: analyticsPeriods,
    period: selected,
    start,
    end,
    series,
    total,
    orderCount: orders.length,
    customers,
    aov: orders.length ? total / orders.length : 0,
    productCount: products.filter((product) => product.quantity > 0).length,
    products: products.filter((product) => product.quantity > 0),
    categories,
    peak: series.reduce(
      (best, point) => (point.value > best.value ? point : best),
      series[0],
    ),
    statuses: analyticsStatuses.map((status) => ({
      ...status,
      count: orders.filter((order) => order.status === status.id).length,
    })),
    channels: analyticsChannels.map((name) => ({
      name,
      value: orders
        .filter((order) => order.channel === name)
        .reduce((sum, order) => sum + order.value, 0),
    })),
    frequencies,
  });
}
