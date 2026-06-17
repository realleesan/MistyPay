import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const USE_STAGING = false; // Set to true to test with Staging Cloud Backend
const STAGING_URL = 'https://your-koyeb-app.koyeb.app/api/v1';

const getBaseUrl = () => {
  if (USE_STAGING) {
    return STAGING_URL;
  }
  if (__DEV__) {
    // Dynamically extract the Metro bundler host IP address to connect to NestJS API
    const hostUri = Constants.expoConfig?.hostUri;
    const hostIp = hostUri ? hostUri.split(':').shift() : '192.168.0.100';
    return `http://${hostIp}:3000/api/v1`;
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

          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

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
