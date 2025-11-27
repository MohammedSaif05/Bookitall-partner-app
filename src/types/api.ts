/**
 * API Type Definitions
 * Centralized TypeScript types for API requests and responses
 * 
 * @format
 */

import type { AxiosError, AxiosRequestConfig } from 'axios';

/**
 * Standard API Response Wrapper
 * Generic type for API responses
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Paginated API Response
 * For endpoints that return paginated data
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API Error Response
 * Standard error response structure
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

/**
 * Request Configuration
 * Extended Axios request config with custom options
 */
export interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean; // Skip adding auth token
  skipErrorHandler?: boolean; // Skip global error handler
  retry?: boolean; // Enable retry on failure
  retryCount?: number; // Number of retries
}

/**
 * Custom Axios Error
 * Extended error with API-specific information
 */
export interface CustomAxiosError extends Omit<AxiosError<ApiErrorResponse>, 'config'> {
  config: RequestConfig;
}

/**
 * Auth Token Storage Interface
 * For managing authentication tokens
 */
export interface TokenStorage {
  getToken: () => Promise<string | null>;
  setToken: (token: string) => Promise<void>;
  removeToken: () => Promise<void>;
}

/**
 * Request Interceptor Context
 * Additional context passed to request interceptors
 */
export interface RequestContext {
  skipAuth?: boolean;
  timestamp?: number;
  requestId?: string;
}

/**
 * Response Interceptor Context
 * Additional context passed to response interceptors
 */
export interface ResponseContext {
  requestId?: string;
  timestamp?: number;
  duration?: number;
}

