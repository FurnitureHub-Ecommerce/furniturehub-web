import api from "../api.js";

export async function getUsers(params = {}) {
  const response = await api.get("/api/users", { params });
  const body = response.data;
  // Chuẩn hóa các envelope mà trang hiện tại đã hỗ trợ; không biến phản hồi lỗi thành danh sách rỗng.
  const rows = Array.isArray(body) ? body : body?.rows ?? body?.users ?? body?.data;
  if (!Array.isArray(rows) || rows.some(user => !user || typeof user !== "object" || Array.isArray(user))) {
    throw new Error("Phản hồi danh sách người dùng không đúng định dạng.");
  }
  return rows;
}

export async function createAdminUser(payload) {
  const response = await api.post("/api/users", payload);
  return response.data;
}
