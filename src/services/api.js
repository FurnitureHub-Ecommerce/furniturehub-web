import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Tự động đính kèm Bearer Token nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Giữ nguyên Axios response để tránh phá contract của các service hiện tại
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config;

    const authorization =
      config?.headers?.get?.("Authorization") ?? config?.headers?.Authorization;

    // Không xóa phiên vì Login thất bại hoặc request cũ
    // trả về sau một lần đăng nhập mới.
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
        // Giữ nguyên HTTP error nếu localStorage bị chặn.
      }
    }

    return Promise.reject(error);
  },
);

export function parseLoginResponse(data) {
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

  return {
    token: data.token,
    user: data.user,
  };
}

export function getApiErrorMessage(error, fallback) {
  const data = error.response?.data;
  const validationMessage = data?.errors?.[0]?.message;

  if (typeof validationMessage === "string" && validationMessage) {
    return validationMessage;
  }

  if (typeof data?.message === "string" && data.message) {
    return data.message;
  }

  if (error.response?.status === 401) {
    return "Xác thực thất bại. Vui lòng kiểm tra thông tin đăng nhập hoặc phiên đăng nhập.";
  }

  if (error.response?.status === 403) {
    return "Bạn không có quyền thực hiện yêu cầu này.";
  }

  if (error.response?.status >= 500) {
    return "Backend đang gặp lỗi. Vui lòng thử lại sau.";
  }

  if (!error.response && (error.request || error.code === "ERR_NETWORK")) {
    return "Không thể kết nối Backend. Vui lòng kiểm tra kết nối và thử lại.";
  }

  return error.message || fallback;
}

// =========== AUTH API ===========

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

// =========== PRODUCT API ===========

export const productAPI = {
  getProducts: (params = {}) => api.get("/api/products", { params }),

  getProductsAdmin: (params = {}) => api.get("/api/products/admin", { params }),

  getProductById: (id) => api.get(`/api/products/${id}`),

  getProductVariants: (productId) =>
    api.get(`/api/products/${productId}/variants`),

  getProductVariantsAdmin: (productId) =>
    api.get(`/api/products/${productId}/variants/admin`),

  createVariant: (productId, data) =>
    api.post(`/api/products/${productId}/variants`, data),
};

// =========== CATEGORY API ===========

export const categoryAPI = {
  getCategories: (params = {}) => api.get("/api/categories", { params }),

  getCategoryById: (id) => api.get(`/api/categories/${id}`),
};

// =========== BRAND API ===========

export const brandAPI = {
  getBrands: () => api.get("/api/brands"),
};

// =========== STORAGE API ===========

export const storageAPI = {
  getProducts: () => api.get("/api/products"),

  getProductsAdmin: () => api.get("/api/products/admin"),

  getVariantsByProduct: (productId) =>
    api.get(`/api/products/${productId}/variants`),

  getVariantsAdmin: (productId) =>
    api.get(`/api/products/${productId}/variants/admin`),

  getVariantById: (id) => api.get(`/api/variants/${id}`),

  updateVariant: (id, data) => api.patch(`/api/variants/${id}`, data),
};

// =========== ORDER API ===========

export const orderAPI = {
  getOrdersById: (id) => api.get(`/api/orders/${id}`),

  updateOrderStatus: (id, status) =>
    api.patch(`/api/orders/${id}/status`, { status }),
};

export default api;
