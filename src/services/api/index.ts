/**
 * API Services Index
 * Centralized exports for all API services
 * 
 * @format
 */

// Export API client
export { default as apiClient, axiosInstance } from './client';

// Export services
export { default as authService } from './auth.service';
export { default as vendorService } from './vendor.service';

// Export types
export type { 
  BusinessSetupRequest, 
  BusinessSetupResponseData,
  BusinessLocationRequest,
  BusinessOwnerDetailsRequest,
  OperatingHoursRequest,
  OperatingHoursSameRequest,
  OperatingHoursDifferentRequest,
  BreakPeriod,
  DayTiming,
} from './vendor.service';
export * from './auth.service';

// Re-export types for convenience
export type {
  ApiResponse,
  ApiErrorResponse,
  PaginatedResponse,
  RequestConfig,
  CustomAxiosError,
} from '../../types/api';

