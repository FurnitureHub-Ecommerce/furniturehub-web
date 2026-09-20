import axios from 'axios';

const api = axios.create({
  baseURL: 'https://furniturehub-server-production-30b6.up.railway.app/api-docs/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động đính kèm Token cho các request tiếp theo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export default api;