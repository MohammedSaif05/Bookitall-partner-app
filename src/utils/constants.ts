/**
 * Application constants
 * Centralized constants for production use
 */

export const APP_CONFIG = {
  NAME: 'Bookitallpartner',
  VERSION: '0.0.1',
} as const;

export const ENV = {
  DEVELOPMENT: __DEV__,
  PRODUCTION: !__DEV__,
} as const;

/**
 * API Configuration
 * Centralized API endpoints and configuration
 */
export const API_CONFIG = {
  BASE_URL: 'https://bookitall-user-service.onrender.com',
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

/**
 * API Endpoints
 * Centralized endpoint definitions
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SEND_OTP: '/api/auth/send-otp',
    VERIFY_OTP: '/api/auth/verify-otp',
    RESEND_OTP: '/api/auth/resend-otp',
  },
  // Vendor endpoints
  VENDOR: {
    ONBOARDING: '/api/vendor', // For PATCH requests (onboarding updates)
    GET_VENDOR: '/api/vendors', // For GET requests (fetch vendor data)
    ADD_SERVICE: '/api/vendor', // For PATCH requests (add service)
  },
} as const;

