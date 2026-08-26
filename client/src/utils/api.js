import axios from 'axios';

// Default directly to your live production Render backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agentic-ai-platform-w1b0.onrender.com/api';

console.log('📡 Initializing API Client with Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('agentflow_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('agentflow_token');
        localStorage.removeItem('agentflow_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
