import api from "../api.js";

export async function getRoles() {
  try {
    const response = await api.get("/api/users");
    const users = response.data?.users ?? response.data ?? [];
    const totalUsers = users.length;
    
    // Xây dựng danh sách roles dựa trên dữ liệu thực tế từ database
    const roleDefinitions = [
      { id: "Admin", name: "Quản trị viên", description: "Toàn quyền quản trị hệ thống", caption: "Full access" },
      { id: "STAFF", name: "Nhân viên", description: "Vận hành cửa hàng và đơn hàng", caption: "Operational" },
      { id: "STORAGE_MANAGER", name: "Quản lý kho", description: "Quản lý tồn kho và kho bãi", caption: "Inventory" },
      { id: "CUSTOMER", name: "Khách hàng", description: "Người mua hàng", caption: "End-user" }
    ];

    const roles = roleDefinitions.map(role => {
      const count = users.filter(u => u.role === role.id).length;
      return {
        ...role,
        count,
        percentage: totalUsers ? (count / totalUsers) * 100 : 0
      };
    });

    return {
      roles,
      totalUsers,
      actions: [
        { id: "read", name: "Xem", code: "READ" },
        { id: "create", name: "Tạo mới", code: "CREATE" },
        { id: "update", name: "Cập nhật", code: "UPDATE" },
        { id: "delete", name: "Xóa", code: "DELETE" }
      ],
      matrices: {},
      moduleCount: 5,
      cellCount: 20
    };
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu phân quyền:", error);
    throw error;
  }
}