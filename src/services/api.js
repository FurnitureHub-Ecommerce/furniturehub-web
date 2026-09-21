import axios from 'axios';

// Lấy Base URL từ .env theo chuẩn Vite
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://api-furniturehub-minhdevops.up.railway.app';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Đính kèm Bearer Token nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý lỗi hệ thống trung tâm
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
      status: error.response?.status || 500,
    };
    return Promise.reject(customError);
  }
);

export const productAPI = {
  getProducts: (params = {}) => api.get('/api/products', { params }),
  // Dùng api/products/admin nếu bạn cần xem tất cả sản phẩm hệ thống kho
  getProductsAdmin: (params = {}) => api.get('/api/products/admin', { params }),
  getProductById: (id) => api.get(`/api/products/${id}`),
  
  // Lấy variant theo productId (dùng /admin để lấy cả các variant đã vô hiệu hóa nếu cần)
  getProductVariants: (productId) => api.get(`/api/products/${productId}/variants`),
  getProductVariantsAdmin: (productId) => api.get(`/api/products/${productId}/variants/admin`),
  
  createVariant: (productId, data) => api.post(`/api/products/${productId}/variants`, data),
};

export const categoryAPI = {
  getCategories: (params = {}) => api.get('/api/categories', { params }),
  getCategoryById: (id) => api.get(`/api/categories/${id}`),
};

export const brandAPI = {
  getBrands: () => api.get('/api/brands'),
};


export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
};


export const storageAPI = {
  // Lấy danh sách tất cả sản phẩm đang hoạt động
  getProducts: () => api.get('/api/products'),

  // Lấy tất cả sản phẩm dành cho admin (nếu cần xem chi tiết hơn)
  getProductsAdmin: () => api.get('/api/products/admin'),

  // Lấy danh sách Variant (biến thể / SKU) theo productId
  getVariantsByProduct: (productId) => api.get(`/api/products/${productId}/variants`),

  // Lấy toàn bộ variant của sản phẩm dành cho admin (bao gồm cả đã vô hiệu hóa)
  getVariantsAdmin: (productId) => api.get(`/api/products/${productId}/variants/admin`),

  // Lấy chi tiết 1 Variant theo ID
  getVariantById: (id) => api.get(`/api/variants/${id}`),

  // Cập nhật thông tin Variant / SKU
  updateVariant: (id, data) => api.patch(`/api/variants/${id}`, data),


};

export default api;