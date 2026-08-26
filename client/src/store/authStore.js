import { create } from 'zustand';
import api from '../utils/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initAuth: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('agentflow_token');
    const storedUser = localStorage.getItem('agentflow_user');

    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      if (storedUser) {
        set({ user: JSON.parse(storedUser), token, isAuthenticated: true });
      }
      const response = await api.get('/auth/me');
      if (response.data?.success) {
        const user = response.data.data;
        localStorage.setItem('agentflow_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        get().logout();
      }
    } catch (err) {
      console.warn('Auth check failed:', err.message);
      get().logout();
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;

      localStorage.setItem('agentflow_token', token);
      localStorage.setItem('agentflow_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      return { success: true };
    } catch (err) {
      const apiHost = process.env.NEXT_PUBLIC_API_URL || 'https://agentic-ai-platform-w1b0.onrender.com/api';
      const errorMessage = err.response?.data?.message || `${err.message} (Target URL: ${apiHost}/auth/login)`;
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  register: async (name, email, password, role = 'operator') => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { user, token } = response.data.data;

      localStorage.setItem('agentflow_token', token);
      localStorage.setItem('agentflow_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      return { success: true };
    } catch (err) {
      const apiHost = process.env.NEXT_PUBLIC_API_URL || 'https://agentic-ai-platform-w1b0.onrender.com/api';
      const errorMessage = err.response?.data?.message || `${err.message} (Target URL: ${apiHost}/auth/register)`;
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agentflow_token');
      localStorage.removeItem('agentflow_user');
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
