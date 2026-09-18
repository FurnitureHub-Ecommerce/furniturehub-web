// Role giữ tên nghiệp vụ; nhãn giao diện không cấp thêm quyền hoặc phân hạng VIP.
export const userRoleOptions = [
  { value: 'Admin', label: 'Super Admin', description: 'Quản trị hệ thống' },
  { value: 'Staff', label: 'Staff Curator', description: 'Nhân viên vận hành' },
  { value: 'Storage Manager', label: 'Storage Manager', description: 'Thủ kho' },
  { value: 'Customer', label: 'Customer', description: 'Khách hàng, chưa phân hạng VIP' },
];

export const userStatusOptions = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
];

const records = [
  ['USR-9901-SA', 'Sophia De Vigney', 'Admin', 'active', 'Global'],
  ['USR-4412-SM', 'Elena Van Der Bilt', 'Storage Manager', 'active', 'Rotterdam'],
  ['USR-8120-SC', 'Julien Delacroix', 'Staff', 'active', 'Paris'],
  ['USR-0008-CU', 'Alistair Sterling', 'Customer', 'active', 'Zurich'],
  ['USR-5188-LG', 'Marcus Kowalski', 'Storage Manager', 'active', 'Rotterdam'],
  ['USR-9902-SA', 'Clara Moreau', 'Admin', 'active', 'Global'],
  ['USR-8121-SC', 'Matteo Ricci', 'Staff', 'active', 'Milan'],
  ['USR-8122-SC', 'Amélie Laurent', 'Staff', 'inactive', 'Paris'],
  ['USR-4413-SM', 'Lukas Weber', 'Storage Manager', 'inactive', 'Zurich'],
  ['USR-0009-CU', 'Nguyễn Minh Anh', 'Customer', 'active', 'Paris'],
  ['USR-0010-CU', 'Trần Hoàng Nam', 'Customer', 'inactive', 'Milan'],
  ['USR-0011-CU', 'Isabella Conti', 'Customer', 'active', 'Milan'],
  ['USR-0012-CU', 'Oliver Bennett', 'Customer', 'active', 'Zurich'],
  ['USR-8123-SC', 'Đỗ Thu Hà', 'Staff', 'active', 'Rotterdam'],
  ['USR-0013-CU', 'Camille Dubois', 'Customer', 'active', 'Paris'],
  ['USR-4414-SM', 'Henrik Larsen', 'Storage Manager', 'active', 'Milan'],
  ['USR-9903-SA', 'Gabriel Martin', 'Admin', 'inactive', 'Global'],
  ['USR-0014-CU', 'Sofia Rossi', 'Customer', 'inactive', 'Zurich'],
];

export const usersMock = records.map(([displayCode, name, role, status, hub], index) => ({
  id: `lumora-user-${index + 1}`,
  displayCode,
  name,
  email: `atelier.user${index + 1}@example.com`,
  role,
  status,
  hub,
}));

// null biểu thị chưa có nguồn quyền, không đồng nghĩa được phép hoặc bị từ chối.
export const userAccessPresentation = {
  actions: ['Xem', 'Tạo', 'Duyệt', 'Xuất', 'Hủy'],
  modules: ['Sản phẩm & BST', 'Đơn hàng Bespoke', 'Tồn kho & Vaults', 'Quản lý người dùng', 'Tài chính & Escrow', 'Audit Logs & Security'].map(name => ({ name, permissions: [null, null, null, null, null] })),
  policies: ['Buộc FIDO2 cùng khi đăng nhập', 'Thời gian chờ phiên nhàn rỗi (Timeout)', 'Giới hạn dải IP Subnet (Atelier LAN)'],
};
