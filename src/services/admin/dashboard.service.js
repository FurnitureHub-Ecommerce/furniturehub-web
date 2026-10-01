import api from "../api";

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
  return response?.data?.data ?? response?.data;
}