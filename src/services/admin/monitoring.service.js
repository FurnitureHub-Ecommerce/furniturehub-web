import api from "../api.js";

export async function getMonitoring({ period = 'all', status = '' } = {}) {
  try {
    const response = await api.get("/api/inventory", { params: { period, status } });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu giám sát hệ thống:", error);
    throw error;
  }
}