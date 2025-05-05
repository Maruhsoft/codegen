import { useCallback, useMemo } from 'react';
import { useGenerator } from '../context/GeneratorContext';
import { createApiClient } from '../services/api/createApiClient';
import { ApiConfig, ApiClient } from '../types/api';

export function useApi(): ApiClient {
  const { config } = useGenerator();
  
  const apiConfig: ApiConfig = useMemo(() => ({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    timeout: 10000,
    retries: 3,
    retryDelay: 1000,
    withCredentials: true,
    headers: {
      'X-API-Style': config.apiStyle,
      'X-API-Version': '1.0',
    },
  }), [config.apiStyle]);

  return useMemo(() => createApiClient(apiConfig), [apiConfig]);
}