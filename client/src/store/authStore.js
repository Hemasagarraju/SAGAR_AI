import { create } from 'zustand';
import api from '../services/api';
import { joinUserRoom } from '../services/socket';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initializeAuth: async () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    try {
      const storedToken = localStorage.getItem('sagaragent_token');
      const storedUser = localStorage.getItem('sagaragent_user');

      if (storedToken && storedUser) {
        const userObj = JSON.parse(storedUser);
        set({
          token: storedToken,
          user: userObj,
          isAuthenticated: true,
          isLoading: false
        });

        joinUserRoom(userObj.id || userObj._id);

        // Refresh user profile from server in background
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data?.user) {
            set({ user: res.data.user });
            localStorage.setItem('sagaragent_user', JSON.stringify(res.data.user));
          }
        } catch (e) {
          // If token expired, auto-refresh demo operator session seamlessly
          if (e.response?.status === 401) {
            await get().demoLogin();
          }
        }
      } else {
        // Auto-initialize demo operator session seamlessly without prompting for login
        await get().demoLogin();
      }
    } catch (err) {
      console.error('Failed to initialize auth state:', err);
      try {
        await get().demoLogin();
      } catch (demoErr) {
        set({
          isLoading: false,
          isAuthenticated: true,
          user: { name: 'Demo Operator', role: 'operator', email: 'operator@sagar.ai' }
        });
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { token, user } = res.data.data || res.data;
        localStorage.setItem('sagaragent_token', token);
        localStorage.setItem('sagaragent_user', JSON.stringify(user));

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });

        joinUserRoom(user.id || user._id);
        return { success: true, user };
      }
      throw new Error(res.data?.error || 'Login failed');
    } catch (err) {
      let message = err.response?.data?.error || err.message || 'Authentication error';
      if (message === 'Network Error') {
        message = 'Cannot connect to backend server at http://localhost:5000. Please ensure the backend is running.';
      }
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  demoLogin: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/demo');
      if (res.data?.success) {
        const { token, user } = res.data.data || res.data;
        localStorage.setItem('sagaragent_token', token);
        localStorage.setItem('sagaragent_user', JSON.stringify(user));

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });

        joinUserRoom(user.id || user._id);
        return { success: true, user };
      }
      throw new Error(res.data?.error || 'Demo login failed');
    } catch (err) {
      let message = err.response?.data?.error || err.message || 'Demo login error';
      if (message === 'Network Error') {
        message = 'Cannot connect to backend server at http://localhost:5000. Please ensure the backend is running.';
      }
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  register: async ({ name, email, password, role = 'operator' }) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      if (res.data?.success) {
        const { token, user } = res.data.data || res.data;
        localStorage.setItem('sagaragent_token', token);
        localStorage.setItem('sagaragent_user', JSON.stringify(user));

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });

        joinUserRoom(user.id || user._id);
        return { success: true, user };
      }
      throw new Error(res.data?.error || 'Registration failed');
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Registration error';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sagaragent_token');
      localStorage.removeItem('sagaragent_user');
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  },

  clearError: () => set({ error: null })
}));
