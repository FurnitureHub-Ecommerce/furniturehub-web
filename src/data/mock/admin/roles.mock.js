// Cấu trúc trình bày, không phải chính sách cấp quyền hoặc API contract.
export const rolesPresentation = [
  { id: 'Admin', name: 'Quản Trị Viên', description: 'Không gian quản trị và giám sát hệ thống.', caption: 'ADMINISTRATION' },
  { id: 'Storage Manager', name: 'Quản Lý Kho', description: 'Không gian nghiệp vụ kho và theo dõi tồn kho.', caption: 'VAULT & LOGISTICS' },
  { id: 'Staff', name: 'Nhân Viên', description: 'Không gian nghiệp vụ đơn hàng và hỗ trợ khách hàng.', caption: 'OPERATIONS' },
  { id: 'Customer', name: 'Khách Hàng', description: 'Không gian khách hàng; chưa xác định phân hạng thành viên.', caption: 'CUSTOMER' },
];

export const roleActions = [
  { id: 'read', name: 'Xem', code: 'READ' },
  { id: 'create', name: 'Tạo', code: 'CREATE' },
  { id: 'update', name: 'Sửa', code: 'UPDATE' },
  { id: 'delete', name: 'Xóa', code: 'DELETE' },
];

export const roleModules = [
  { id: 'MOD_USERS', name: 'Quản Lý Người Dùng', icon: 'users', note: 'Phạm vi thao tác tài khoản và quy trình cấp vai trò chưa được xác nhận.' },
  { id: 'MOD_RBAC', name: 'Phân Quyền & Vai Trò', icon: 'shield', note: 'Chưa xác nhận quyền quản lý vai trò, quyền mặc định và cơ chế phê duyệt.' },
  { id: 'MOD_PRODUCTS', name: 'Quản Lý Sản Phẩm', icon: 'sofa', note: 'Ma trận CRUD chính thức chưa được cung cấp.' },
  { id: 'MOD_SKU', name: 'Biến Thể & SKU', icon: 'sliders', note: 'Phân chia quyền giữa Admin và Storage Manager chưa được xác nhận.' },
  { id: 'MOD_COLLECTIONS', name: 'Danh Mục & Bộ Sưu Tập', icon: 'folder', note: 'Nhãn module theo thiết kế; không bổ sung model Bộ Sưu Tập.' },
  { id: 'MOD_ATELIERS', name: 'Thương Hiệu & Xưởng Atelier', icon: 'atelier', note: 'Nhãn module theo thiết kế; không bổ sung model Xưởng Atelier.' },
  { id: 'MOD_ORDERS', name: 'Giám Sát Đơn Hàng', icon: 'orders', note: 'Màn hình Admin hiện chỉ giám sát. Đây không phải bằng chứng quyền đã được cấp tại Backend.' },
  { id: 'MOD_INVENTORY', name: 'Giám Sát Tồn Kho', icon: 'warehouse', note: 'Màn hình Admin hiện chỉ giám sát; không thực hiện nhập, xuất hoặc điều chỉnh kho.' },
  { id: 'MOD_ANALYTICS', name: 'Thống Kê & Báo Cáo', icon: 'chart', note: 'Báo cáo hiện dùng fixture demo; quyền truy cập và xuất báo cáo chưa được xác nhận.' },
];
