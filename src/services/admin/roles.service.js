import api from "../api.js";

const roleLabels = {
  ADMIN: { name: "Quản trị viên", description: "Vai trò ứng dụng dành cho khu vực quản trị", caption: "ADMINISTRATION" },
  MANAGER: { name: "Quản lý", description: "Vai trò quản lý được ứng dụng nhận diện", caption: "MANAGEMENT" },
  STAFF: { name: "Nhân viên", description: "Vai trò ứng dụng dành cho khu vực vận hành", caption: "OPERATIONS" },
  STORAGE: { name: "Nhân viên kho", description: "Vai trò ứng dụng dành cho khu vực kho", caption: "STORAGE" },
  STORAGE_MANAGER: { name: "Quản lý kho", description: "Vai trò ứng dụng dành cho quản lý kho", caption: "VAULT & LOGISTICS" },
  CUSTOMER: { name: "Khách hàng", description: "Vai trò ứng dụng dành cho khách hàng", caption: "CUSTOMER" },
};

function userRows(body) {
  const rows = [body, body?.rows, body?.users, body?.data].find(Array.isArray);
  if (!rows || rows.some(user => !user || typeof user !== "object" || Array.isArray(user))) {
    throw new Error("Phản hồi danh sách người dùng không đúng định dạng.");
  }
  return rows;
}

function normalizedRole(value) {
  if (typeof value !== "string" || !value.trim()) throw new Error("Tài khoản thiếu vai trò hợp lệ.");
  const role = value.trim().replace(/[\s-]+/g, "_").toUpperCase();
  if (!roleLabels[role]) throw new Error(`Vai trò "${value}" chưa được ứng dụng nhận diện.`);
  return role;
}

export async function getRoles() {
  const response = await api.get("/api/users");
  const users = userRows(response.data).map(user => ({ ...user, normalizedRole: normalizedRole(user.role) }));
  const loadedUsers = users.length;
  const presentRoles = [...new Set(users.map(user => user.normalizedRole))];

  // Đây là nhãn vai trò của ứng dụng, không phải Role Entity hoặc permission từ Backend.
  const roles = presentRoles.map(id => {
    const count = users.filter(user => user.normalizedRole === id).length;
    return { id, ...roleLabels[id], count, percentage: loadedUsers ? (count / loadedUsers) * 100 : null };
  });

  return { roles, loadedUsers, permissionMatrix: null };
}
