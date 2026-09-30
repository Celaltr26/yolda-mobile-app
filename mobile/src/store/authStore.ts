import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  LoginPayload,
  RegisterPayload,
  loginUser,
  registerUser,
  fetchMe,
} from '../api/auth.api';
import { STORAGE_KEYS } from '../config/constants';
import { initMobileSocket, disconnectMobileSocket } from '../socket/socket';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;

  // Eylemler
  loadStoredAuth: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitializing: true,
  error: null,

  loadStoredAuth: async () => {
    try {
      set({ isInitializing: true });
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

      if (storedToken && storedUser) {
        const user: User = JSON.parse(storedUser);
        set({ token: storedToken, user, isInitializing: false });

        // Socket bağlantısını kur
        initMobileSocket(user.id, user.role === 'DRIVER');

        // Arka planda profil verisini güncelle
        try {
          const profile = await fetchMe();
          if (profile.user) {
            set({ user: profile.user });
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(profile.user));
          }
        } catch {}
      } else {
        set({ isInitializing: false });
      }
    } catch (e) {
      console.warn('loadStoredAuth hatası:', e);
      set({ isInitializing: false });
    }
  },

  login: async (payload: LoginPayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await loginUser(payload);
      const { user, token } = response;

      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      set({ user, token, isLoading: false, error: null });

      // Socket.io bağla
      initMobileSocket(user.id, user.role === 'DRIVER');
      return true;
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Giriş yapılırken bir hata oluştu.';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  register: async (payload: RegisterPayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await registerUser(payload);
      const { user, token } = response;

      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      set({ user, token, isLoading: false, error: null });

      // Socket.io bağla
      initMobileSocket(user.id, user.role === 'DRIVER');
      return true;
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Kayıt olunurken bir hata oluştu.';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch {}
    disconnectMobileSocket();
    set({ user: null, token: null, error: null });
  },

  clearError: () => set({ error: null }),
  setUser: (user) => set({ user }),
}));
