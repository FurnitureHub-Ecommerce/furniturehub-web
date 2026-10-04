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

// =========== USER / ADMIN MANAGEMENT API ===========

export const userAPI = {
  // Admin lấy danh sách toàn bộ người dùng trong hệ thống
  getUsers: (params = {}) => api.get("/api/users", { params }),

  // Admin tạo tài khoản mới cho Staff hoặc Storage_Manager
  createUser: (userData) => api.post("/api/users", userData),

  getProfile: () => api.get("/api/users/profile"),

  updateProfile: (profileData) => api.patch("/api/users/profile", profileData),
};

// =========== PRODUCT API ===========

export const productAPI = {
  getProducts: (params = {}) => api.get("/api/products", { params }),

  getProductsAdmin: (params = {}) => api.get("/api/products/admin", { params }),

  createProduct: (productData) => api.post("/api/products", productData),

  getProductById: (id) => api.get(`/api/products/${id}`),

  updateProduct: (id, productData) => api.patch(`/api/products/${id}`, productData),

  deactivateProduct: (id) => api.delete(`/api/products/${id}`),

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

  getCategoriesAdmin: (params = {}) => api.get("/api/categories/admin", { params }),

  getCategoryById: (id) => api.get(`/api/categories/${id}`),

  createCategory: (categoryData) => api.post("/api/categories", categoryData),

  updateCategory: (id, categoryData) => api.patch(`/api/categories/${id}`, categoryData),

  deactivateCategory: (id) => api.delete(`/api/categories/${id}`),
};

// =========== BRAND API ===========

export const brandAPI = {
  getBrands: (params = {}) => api.get("/api/brands", { params }),

  getBrandsAdmin: (params = {}) => api.get("/api/brands/admin", { params }),

  getBrandById: (id) => api.get(`/api/brands/${id}`),

  createBrand: (brandData) => api.post("/api/brands", brandData),

  updateBrand: (id, brandData) => api.patch(`/api/brands/${id}`, brandData),

  deactivateBrand: (id) => api.delete(`/api/brands/${id}`),
};

// =========== STORAGE API ===========

export const storageAPI = {
  // Lấy danh sách tồn kho, SKU và biến thể chính thức từ Backend
  getInventory: (params = {}) => api.get("/api/inventory", { params }),

  // Xem tồn kho chi tiết của một biến thể
  getInventoryByVariantId: (variantId) => api.get(`/api/inventory/${variantId}`),

  getLowStock: (params = {}) => api.get("/api/inventory/low-stock", { params }),

  getProducts: () => api.get("/api/products"),

  getProductsAdmin: () => api.get("/api/products/admin"),

  getVariantsByProduct: (productId) =>
    api.get(`/api/products/${productId}/variants`),

  getVariantsAdmin: (productId) =>
    api.get(`/api/products/${productId}/variants/admin`),

  getVariantById: (id) => api.get(`/api/variants/${id}`),

  updateVariant: (id, data) => api.patch(`/api/variants/${id}`, data),

  deactivateVariant: (id) => api.delete(`/api/variants/${id}`),

  // Các hàm giao dịch kho hàng
  getInventoryTransactions: (params = {}) => api.get('/api/inventory/transactions', { params }),
  importInventory: (variantId, data) => api.post(`/api/inventory/${variantId}/import`, data),
  exportInventory: (variantId, data) => api.post(`/api/inventory/${variantId}/export`, data),
};

// =========== ORDER API ===========

export const orderAPI = {
  // Admin & Staff
  getOrders: (params = {}) => api.get("/api/orders", { params }),
  getOrdersById: (id) => api.get(`/api/orders/${id}`),
  updateOrderStatus: (id, status) =>
    api.patch(`/api/orders/${id}/status`, { status }),

  // Customer
  createOrder: (orderData) => api.post("/api/orders", orderData),
  getMyOrders: (params = {}) => api.get("/api/orders/my-orders", { params }),
  getMyOrderById: (id) => api.get(`/api/orders/${id}`),
  getOrderTracking: (id) => api.get(`/api/orders/${id}/tracking`),
  cancelOrder: (id) => api.patch(`/api/orders/${id}/cancel`),
};

// =========== CART API (CUSTOMER) ===========

export const cartAPI = {
  getCart: () => api.get("/api/cart"),
  addItem: ({ variantId, quantity }) =>
    api.post("/api/cart/items", { variantId, quantity }),
  updateItemQuantity: (itemId, quantity) =>
    api.patch(`/api/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/api/cart/items/${itemId}`),
  clearCart: () => api.delete("/api/cart"),
};

// =========== WISHLIST API (CUSTOMER) ===========

export const wishlistAPI = {
  getWishlist: () => api.get("/api/wishlist"),
  addToWishlist: (productId) => api.post("/api/wishlist", { productId }),
  removeFromWishlist: (productId) => api.delete(`/api/wishlist/${productId}`),
};

// =========== ADDRESS API (CUSTOMER) ===========

export const addressAPI = {
  getAddresses: () => api.get("/api/addresses"),
  getAddressById: (id) => api.get(`/api/addresses/${id}`),
  createAddress: (data) => api.post("/api/addresses", data),
  updateAddress: (id, data) => api.put(`/api/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/api/addresses/${id}`),
  setDefaultAddress: (id) => api.patch(`/api/addresses/${id}/default`),
};

// =========== CHECKOUT API (CUSTOMER) ===========

export const checkoutAPI = {
  validate: (data) => api.post("/api/checkout/validate", data),
};

// =========== REVIEW API (CUSTOMER & PUBLIC) ===========

export const reviewAPI = {
  getProductReviews: (productId) => api.get(`/api/reviews/product/${productId}`),
  createReview: (data) => api.post("/api/reviews", data),
  updateReview: (id, data) => api.patch(`/api/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/api/reviews/${id}`),
};

export default api;

