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

// Service API Helpers
export const categoryAPI = {
  getCategories: () => api.get('/api/categories'),
  getCategoryById: (id) => api.get(`/api/categories/${id}`),
};

export const productAPI = {
  getProducts: (params = {}) => api.get('/api/products', { params }),
  getProductById: (id) => api.get(`/api/products/${id}`),
  getProductVariants: (productId) => api.get(`/api/products/${productId}/variants`),
};

export const brandAPI = {
  getBrands: () => api.get('/api/brands'),
};

export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
};

export default api;