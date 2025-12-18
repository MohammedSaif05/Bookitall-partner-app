/**
 * Axios API Client
 * Production-grade axios instance with interceptors
 * 
 * @format
 */

import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_CONFIG } from '../../utils/constants';
import type {
  ApiErrorResponse,
  ApiResponse,
  CustomAxiosError,
  RequestConfig,
  TokenStorage,
} from '../../types/api';

/**
 * Token Storage Implementation
 * Using AsyncStorage for React Native (can be replaced with SecureStore for sensitive data)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

class DefaultTokenStorage implements TokenStorage {
  private readonly TOKEN_KEY = 'auth_token';

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing auth token:', error);
    }
  }

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }
}

/**
 * API Client Class
 * Manages axios instance with interceptors and error handling
 */
class ApiClient {
  private axiosInstance: AxiosInstance;
  private tokenStorage: TokenStorage;

  constructor() {
    // Create axios instance with base configuration
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    // Initialize token storage
    this.tokenStorage = new DefaultTokenStorage();

    // Setup interceptors
    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request Interceptor
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Add request timestamp (stored in a custom property)
        const requestConfig = config as InternalAxiosRequestConfig & RequestConfig & { _metadata?: { startTime: number; requestId: string } };
        requestConfig._metadata = {
          startTime: Date.now(),
          requestId: this.generateRequestId(),
        };

        // Add auth token if available and not skipped
        if (!requestConfig.skipAuth) {
          const token = await this.tokenStorage.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        // Handle FormData: Remove Content-Type header to let axios set it automatically with boundary
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        }

        // Log request in development
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log(
            `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
            {
              params: config.params,
              data: config.data,
            }
          );
        }

        return config;
      },
      (error: AxiosError<ApiErrorResponse>) => {
        // Handle request error
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.error('[API Request Error]', error);
        }
        return Promise.reject(this.handleError(error));
      }
    );

    // Response Interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const requestConfig = response.config as InternalAxiosRequestConfig & RequestConfig & { _metadata?: { startTime: number; requestId: string } };
        const metadata = requestConfig._metadata;

        // Calculate request duration
        if (metadata?.startTime) {
          const duration = Date.now() - metadata.startTime;
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.log(
              `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
              {
                status: response.status,
                duration: `${duration}ms`,
                data: response.data,
              }
            );
          }
        }

        // Handle successful response
        return response;
      },
      async (error: AxiosError<ApiErrorResponse>) => {
        // Handle response error
        const customError = this.handleError(error);

        // Handle 401 Unauthorized - Token expired or invalid
        if (error.response?.status === 401) {
          await this.handleUnauthorized();
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
          // Handle forbidden access
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.warn('[API] Forbidden access');
          }
        }

        // Handle 500+ Server Errors
        if (error.response?.status && error.response.status >= 500) {
          // Log server errors for monitoring
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.error('[API] Server Error', error.response.data);
          }
        }

        return Promise.reject(customError);
      }
    );
  }

  /**
   * Handle errors and transform to custom error format
   */
  private handleError(error: AxiosError<ApiErrorResponse>): CustomAxiosError {
    const customError = error as CustomAxiosError;

    // Network error (no response)
    if (!error.response) {
      customError.response = {
        data: {
          success: false,
          message: 'Network error. Please check your internet connection.',
          error: 'NETWORK_ERROR',
        },
        status: 0,
        statusText: 'Network Error',
        headers: {},
        config: error.config,
      } as AxiosResponse<ApiErrorResponse>;
      return customError;
    }

    // API error response
    const errorData = error.response.data || {
      success: false,
      message: error.message || 'An unexpected error occurred',
      error: 'UNKNOWN_ERROR',
    };

    customError.response = {
      ...error.response,
      data: {
        ...errorData,
        statusCode: error.response.status,
      },
    };

    return customError;
  }

  /**
   * Handle 401 Unauthorized - Clear token and redirect to login
   */
  private async handleUnauthorized(): Promise<void> {
    // Clear stored token
    await this.tokenStorage.removeToken();

    // In production, you might want to:
    // - Navigate to login screen
    // - Show a toast notification
    // - Clear user data from storage
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[API] Unauthorized - Token cleared');
    }
  }

  /**
   * Generate unique request ID for tracking
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set authentication token
   */
  async setAuthToken(token: string): Promise<void> {
    await this.tokenStorage.setToken(token);
  }

  /**
   * Clear authentication token
   */
  async clearAuthToken(): Promise<void> {
    await this.tokenStorage.removeToken();
  }

  /**
   * Get current axios instance
   */
  getInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Make GET request
   */
  async get<T = unknown>(
    url: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * Make POST request
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.post<ApiResponse<T>>(
      url,
      data,
      config
    );
    return response.data;
  }

  /**
   * Make PUT request
   */
  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.put<ApiResponse<T>>(
      url,
      data,
      config
    );
    return response.data;
  }

  /**
   * Make PATCH request
   */
  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.patch<ApiResponse<T>>(
      url,
      data,
      config
    );
    return response.data;
  }

  /**
   * Make DELETE request
   */
  async delete<T = unknown>(
    url: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.delete<ApiResponse<T>>(
      url,
      config
    );
    return response.data;
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export axios instance for advanced usage
export const axiosInstance = apiClient.getInstance();

// Export default for convenience
export default apiClient;

