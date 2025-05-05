import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';
import { ApiConfig, ApiClient, ApiErrorResponse, ApiInterceptors } from '../../types/api';

const DEFAULT_TIMEOUT = 10000;
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;

export function createApiClient(config: ApiConfig): ApiClient {
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout || DEFAULT_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': config.language || 'en',
      ...config.headers,
    },
    withCredentials: config.withCredentials,
  });

  // Configure retry behavior
  axiosRetry(instance, {
    retries: config.retries || DEFAULT_RETRIES,
    retryDelay: () => config.retryDelay || DEFAULT_RETRY_DELAY,
    retryCondition: (error: AxiosError) => {
      return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
        (error.response?.status === 429); // Retry on rate limit
    },
  });

  // Add default interceptors
  setupDefaultInterceptors(instance);

  // Return wrapped instance with type-safe methods
  return {
    get: <T>(url: string, config?: AxiosRequestConfig) => 
      instance.get<T, AxiosResponse<T>>(url, config).then(response => response.data),
    
    post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
      instance.post<T, AxiosResponse<T>>(url, data, config).then(response => response.data),
    
    put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
      instance.put<T, AxiosResponse<T>>(url, data, config).then(response => response.data),
    
    delete: <T>(url: string, config?: AxiosRequestConfig) =>
      instance.delete<T, AxiosResponse<T>>(url, config).then(response => response.data),
    
    patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
      instance.patch<T, AxiosResponse<T>>(url, data, config).then(response => response.data),
  };
}

function setupDefaultInterceptors(instance: AxiosInstance) {
  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Add timestamp to prevent caching
      const url = new URL(config.url || '', config.baseURL);
      url.searchParams.set('_t', Date.now().toString());
      config.url = url.pathname + url.search;
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => {
      if (error.response) {
        // Handle specific error status codes
        switch (error.response.status) {
          case 401:
            // Handle unauthorized
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
            break;
          case 403:
            // Handle forbidden
            window.dispatchEvent(new CustomEvent('auth:forbidden'));
            break;
          case 429:
            // Handle rate limit
            console.warn('Rate limit exceeded');
            break;
        }

        // Enhance error message
        const message = error.response.data?.message || 'An unexpected error occurred';
        error.message = `[${error.response.status}] ${message}`;
      } else if (error.request) {
        // Handle network errors
        error.message = 'Network error: Please check your connection';
      }

      return Promise.reject(error);
    }
  );
}