import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động đính kèm Token cho các request tiếp theo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config;
    const authorization =
      config?.headers?.get?.("Authorization") ?? config?.headers?.Authorization;
    // Không xóa phiên vì Login thất bại hoặc vì request cũ trả về sau lần đăng nhập mới.
    if (
      error.response?.status === 401 &&
      !config?.skipAuthSessionInvalidation
    ) {
      try {
        const token = localStorage.getItem("token");
        if (token && authorization === `Bearer ${token}`) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch {
        // Giữ nguyên lỗi HTTP để phía gọi vẫn xử lý được khi storage bị chặn.
      }
    }
    return Promise.reject(error);
  },
);

export function parseLoginResponse(data) {
  // Mapping cũ chưa được xác minh bằng tài khoản thật; chỉ thay tại đây khi chốt contract.
  if (
    !data ||
    typeof data.token !== "string" ||
    !data.token.trim() ||
    !data.user ||
    typeof data.user !== "object" ||
    Array.isArray(data.user)
  ) {
    throw new Error(
      "Phản hồi đăng nhập chưa đúng cấu trúc được hỗ trợ. Vui lòng xác nhận contract Backend.",
    );
  }
  return { token: data.token, user: data.user };
}

export function getApiErrorMessage(error, fallback) {
  const data = error.response?.data;
  const validationMessage = data?.errors?.[0]?.message;
  if (typeof validationMessage === "string" && validationMessage)
    return validationMessage;
  if (typeof data?.message === "string" && data.message) return data.message;
  // Chỉ dùng thông báo theo HTTP status khi Backend không cung cấp nội dung lỗi.
  if (error.response?.status === 401)
    return "Xác thực thất bại. Vui lòng kiểm tra thông tin đăng nhập hoặc phiên đăng nhập.";
  if (error.response?.status === 403)
    return "Bạn không có quyền thực hiện yêu cầu này.";
  if (error.response?.status >= 500)
    return "Backend đang gặp lỗi. Vui lòng thử lại sau.";
  if (!error.response && (error.request || error.code === "ERR_NETWORK"))
    return "Không thể kết nối Backend. Vui lòng kiểm tra kết nối và thử lại.";
  return error.message || fallback;
}

export const authAPI = {
  login: ({ email, password }) =>
    api.post(
      "/api/auth/login",
      { email, password },
      { skipAuthSessionInvalidation: true },
    ),
  register: ({ fullName, email, password, phone }) =>
    api.post(
      "/api/auth/register",
      {
        fullName,
        email,
        password,
        ...(phone ? { phone } : {}),
      },
      { skipAuthSessionInvalidation: true },
    ),
};

export default api;
