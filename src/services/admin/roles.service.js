import { getUsers } from './users.service.js';
import { rolesPresentation, roleActions, roleModules } from '../../data/mock/admin/roles.mock.js';

export async function getRoles() {
  const users = await getUsers();
  // Dùng tổng theo role từ service, không đếm trang User đang được phân trang.
  const roles = rolesPresentation.map(role => {
    const count = users.roles.find(item => item.value === role.id)?.count ?? 0;
    return { ...role, count, percentage: users.totalUsers ? count / users.totalUsers * 100 : 0 };
  });
  return structuredClone({
    roles, totalUsers: users.totalUsers, actions: roleActions,
    // null giữ trạng thái chưa xác định, tuyệt đối không chuyển thành false hoặc true.
    matrices: Object.fromEntries(roles.map(role => [role.id, roleModules.map(module => ({
      ...module, permissions: Object.fromEntries(roleActions.map(action => [action.id, null])),
    }))])),
    moduleCount: roleModules.length,
    cellCount: roleModules.length * roleActions.length,
  });
}
