import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (__DEV__) {
    // 10.0.2.2 is the IP address of the host machine for the Android emulator
    return Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/v1' : 'http://localhost:3000/api/v1';
  }
  return 'https://api.mistypay.com/api/v1';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error reading access token from SecureStore:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (refreshToken) {
          const refreshResponse = await axios.post(`${getBaseUrl()}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, newRefreshToken } = refreshResponse.data;

          await SecureStore.setItemAsync('accessToken', accessToken);
          if (newRefreshToken) {
            await SecureStore.setItemAsync('refreshToken', newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        console.warn('Session expired, logging out user...');
      }
    }

    const customError = {
      message: error.response?.data?.message || 'Network or Server Error',
      statusCode: error.response?.status || 500,
      errorCode: error.response?.data?.errorCode || 'NETWORK_ERROR',
      success: false,
    };

    return Promise.reject(customError);
  },
);
