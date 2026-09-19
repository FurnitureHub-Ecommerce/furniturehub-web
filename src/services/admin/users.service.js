import {
  usersMock,
  userRoleOptions,
  userStatusOptions,
  userAccessPresentation,
} from "../../data/mock/admin/users.mock.js";

const normalize = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLocaleLowerCase("vi")
    .trim();

export async function getUsers({
  search = "",
  tab = "",
  role = "",
  status = "",
  hub = "",
  page = 1,
} = {}) {
  const roles = userRoleOptions.map((item) => item.value);
  if (
    (tab && !roles.includes(tab)) ||
    (role && !roles.includes(role)) ||
    (status && !userStatusOptions.some((item) => item.value === status))
  ) {
    throw new Error("Điều kiện lọc người dùng không hợp lệ.");
  }
  const query = normalize(search);
  // Các điều kiện kết hợp bằng AND; số trang luôn dựa trên kết quả đã lọc.
  const filtered = usersMock.filter((user) => {
    const label = userRoleOptions.find(
      (item) => item.value === user.role,
    ).label;
    const matchesText = normalize(
      [user.name, user.email, user.displayCode, user.role, label].join(" "),
    ).includes(query);
    return (
      matchesText &&
      (!tab || user.role === tab) &&
      (!role || user.role === role) &&
      (!status || user.status === status) &&
      (!hub || user.hub === hub)
    );
  });
  const pageSize = 7;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(
    totalPages,
    Math.max(1, Number.isFinite(Number(page)) ? Math.floor(Number(page)) : 1),
  );
  return structuredClone({
    rows: filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    total: filtered.length,
    totalUsers: usersMock.length,
    page: currentPage,
    pageSize,
    totalPages,
    roles: userRoleOptions.map((item) => ({
      ...item,
      count: usersMock.filter((user) => user.role === item.value).length,
    })),
    statuses: userStatusOptions,
    hubs: [...new Set(usersMock.map((user) => user.hub))].sort(),
    access: userAccessPresentation,
  });
}
