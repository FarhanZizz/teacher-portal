import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost/teacher-api/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  logout:   ()     => api.post('/auth/logout'),
  me:       ()     => api.get('/auth/me'),
};

// ── Teachers ─────────────────────────────────────────────────
export const teachersAPI = {
  getAll:  ()         => api.get('/teachers'),
  getOne:  (id)       => api.get(`/teachers/${id}`),
  create:  (data)     => api.post('/teachers', data),
  update:  (id, data) => api.put(`/teachers/${id}`, data),
  delete:  (id)       => api.delete(`/teachers/${id}`),
};

// ── Users ─────────────────────────────────────────────────────
export const usersAPI = {
  getAll: () => api.get('/users'),
  getOne: (id) => api.get(`/users/${id}`),
};

export default api;
