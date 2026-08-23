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
          // Token might have expired
          if (e.response?.status === 401) {
            get().logout();
          }
        }
      } else {
        set({ isLoading: false, isAuthenticated: false, user: null, token: null });
      }
    } catch (err) {
      console.error('Failed to initialize auth state:', err);
      set({ isLoading: false });
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
      const message = err.response?.data?.error || err.message || 'Authentication error';
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
      const message = err.response?.data?.error || err.message || 'Demo login error';
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
