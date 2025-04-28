import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ApiConfig extends AxiosRequestConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  withCredentials?: boolean;
  language?: string;
}

export interface ApiHeaders {
  [key: string]: string;
}

export interface ApiErrorResponse {
  message: string;
  code: string;
  details?: unknown;
}

export interface ApiInterceptors {
  request?: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
  response?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
  error?: (error: AxiosError<ApiErrorResponse>) => Promise<never>;
}

export interface ApiClient {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
}