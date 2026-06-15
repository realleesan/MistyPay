import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  country?: string;
  avatar?: string;
  hasPin: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, country: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setHasPin: (hasPin: boolean) => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    try {
      const response = (await api.post('/auth/login', {
        email,
        password,
        deviceId: 'mobile-app',
        deviceName: 'Mobile App Device',
      })) as any;

      if (response.accessToken && response.refreshToken) {
        await SecureStore.setItemAsync('accessToken', response.accessToken);
        await SecureStore.setItemAsync('refreshToken', response.refreshToken);
      }

      set({
        user: response.user,
        isAuthenticated: true,
      });
    } catch (error) {
      throw error;
    }
  },

  register: async (email, password, displayName, country) => {
    try {
      await api.post('/auth/register', {
        email,
        password,
        displayName,
        country,
      });
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.warn('Logout request failed on server', error);
    } finally {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');

      if (!accessToken || !refreshToken) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const userProfile = (await api.get('/users/me')) as any;
      set({
        user: {
          id: userProfile.id,
          email: userProfile.email,
          displayName: userProfile.displayName,
          country: userProfile.country,
          avatar: userProfile.avatar,
          hasPin: userProfile.hasPin,
        },
        isAuthenticated: true,
      });
    } catch (error) {
      console.warn('Failed to restore session:', error);
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  setHasPin: (hasPin) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, hasPin } });
    }
  },

  setUser: (user) => {
    set({ user });
  },
}));
