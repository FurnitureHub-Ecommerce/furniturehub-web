import api from "../api.js";

export function buildMonthlyRevenueSeries(rows, year, currentMonth) {
  const values = Array.isArray(rows)
    ? rows.filter((item) => item.year === year)
    : [];
  const maximum = Math.max(0, ...values.map((item) => item.revenue));

  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const matched = values.find((item) => item.month === month);
    const revenue = matched ? matched.revenue : null;
    return {
      m: `Tháng ${month}`,
      short: `T${month}`,
      revenue,
      h:
        revenue === null
          ? "0%"
          : revenue === 0
            ? "4px"
            : `${Math.max(10, (revenue / maximum) * 100)}%`,
      current: month === currentMonth,
      state: revenue === null ? "missing" : revenue === 0 ? "zero" : "value",
    };
  });
}

export async function getDashboard() {
  try {
    const response = await api.get("/api/dashboard/statistics");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu thống kê dashboard:", error);
    throw error;
  }
}

export async function getDashboardStatistics() {
  const response = await api.get("/api/dashboard/statistics");
  const data = response?.data?.data ?? response?.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Phản hồi thống kê không đúng định dạng.");
  }

  // Contract hiện chỉ có tổng doanh thu, nên không phân bổ giá trị này vào tháng bất kỳ.
  return {
    ...data,
    monthlyRevenue: null,
  };
}
