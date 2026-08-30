import axios from 'axios';

// Guaranteed clean base URL resolution with /api path suffix
const getApiBaseUrl = () => {
  let url = '';
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim() !== '') {
    url = process.env.NEXT_PUBLIC_API_URL.trim().replace(/\/+$/, '');
    if (!url.endsWith('/api')) {
      url += '/api';
    }
    return url;
  }
  
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // If NEXT_PUBLIC_API_URL is missing in production build, fall back to relative /api or log clear warning
    console.warn('⚠️ NEXT_PUBLIC_API_URL is not configured in environment variables. Defaulting to domain origin.');
    return `${window.location.origin.replace(/\/+$/, '')}/api`;
  }
  
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000, // 90 seconds timeout to handle Render free tier cold-start spin ups
});

api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('agentflow_token');
        localStorage.removeItem('agentflow_user');
      }
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      if (error.response?.data) {
        error.response.data.message = 'Backend server cold start took longer than expected. Please wait a moment and try again.';
      } else {
        error.message = 'Backend server cold start took longer than expected. Please wait a moment and try again.';
      }
    } else if (error.message === 'Network Error' && !error.response) {
      error.message = 'Unable to reach backend server. Please verify backend URL and CORS settings on Render.';
    }

    return Promise.reject(error);
  }
);

export default api;

