import { create } from 'zustand';
import { User } from '../types';
import { authService } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<User>;
  register: (payload: any) => Promise<User>;
  logout: () => void;
  loadProfile: () => Promise<User | null>;
  clearError: () => void;
}

// Helper to safely fetch initial cached states
const getInitialUser = (): User | null => {
  try {
    const raw = localStorage.getItem('prep_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getInitialUser(),
  token: localStorage.getItem('prep_token'),
  isAuthenticated: !!localStorage.getItem('prep_token'),
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(credentials);
      localStorage.setItem('prep_token', data.access_token);
      localStorage.setItem('prep_user', JSON.stringify(data.user));
      
      set({ 
        token: data.access_token, 
        user: data.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return data.user;
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Login attempt failed. Please check your credentials.';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.register(payload);
      localStorage.setItem('prep_token', data.access_token);
      localStorage.setItem('prep_user', JSON.stringify(data.user));

      set({
        token: data.access_token,
        user: data.user,
        isAuthenticated: true,
        isLoading: false
      });
      return data.user;
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to complete registration.';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  logout: () => {
    localStorage.removeItem('prep_token');
    localStorage.removeItem('prep_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null
    });
  },

  loadProfile: async () => {
    if (!get().token) return null;
    try {
      const data = await authService.getProfile();
      localStorage.setItem('prep_user', JSON.stringify(data.user));
      set({ user: data.user, isAuthenticated: true });
      return data.user;
    } catch (err) {
      // Token is likely invalid or expired
      get().logout();
      return null;
    }
  },

  clearError: () => set({ error: null })
}));
