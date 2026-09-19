import axios from 'axios';

const api = axios.create({
  baseURL: 'https://changes-pike-comparing-incoming.trycloudflare.com/api/',
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