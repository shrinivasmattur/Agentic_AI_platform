import axios from 'axios';

// Guaranteed clean base URL resolution without trailing slashes
const getApiBaseUrl = () => {
  let url = '';
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim() !== '') {
    url = process.env.NEXT_PUBLIC_API_URL.trim();
  } else if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    url = 'https://agentic-ai-platform-w1b0.onrender.com/api';
  } else {
    url = 'http://localhost:5000/api';
  }
  return url.replace(/\/+$/, '');
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
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
    return Promise.reject(error);
  }
);

export default api;
