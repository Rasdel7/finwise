import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('finwise_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 || error.response?.status === 401) {
      localStorage.removeItem('finwise_token');
      localStorage.removeItem('finwise_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
