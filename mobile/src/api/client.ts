import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_API_URL, STORAGE_KEYS } from '../config/constants';

let currentBaseUrl = DEFAULT_API_URL;

export const apiClient = axios.create({
  baseURL: `${DEFAULT_API_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dinamik olarak backend URL'sini güncellemek için yardımcı fonksiyon
export const setApiBaseUrl = (url: string) => {
  currentBaseUrl = url;
  apiClient.defaults.baseURL = `${url.replace(/\/$/, '')}/api`;
};

export const getApiBaseUrl = () => currentBaseUrl;

// Request Interceptor: Token ekle
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('AsyncStorage token okuma hatası:', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: 401 kontrolü
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token geçersiz veya süresi dolmuşsa saklanan token'ı temizle
      try {
        await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      } catch {}
    }
    return Promise.reject(error);
  }
);

export default apiClient;
