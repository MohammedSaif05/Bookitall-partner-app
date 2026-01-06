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
    ADD_SERVICE_JSON: '/api/vendor', // For PATCH requests (add service JSON)
    GET_SERVICES: '/api/vendors', // For GET requests (fetch services)
    BUSINESS_DOCUMENT: '/api/vendor', // For PATCH requests (upload business documents - deprecated)
    BUSINESS_IMAGES: '/api/vendor', // For POST requests (upload business images - deprecated)
    UPLOAD_BUSINESS_IMAGES: '/api/vendor', // For POST requests (upload business images files)
    SAVE_BUSINESS_IMAGES: '/api/vendor', // For PATCH requests (save business images metadata)
    UPLOAD_BUSINESS_DOCUMENT: '/api/vendor', // For POST requests (upload business document file)
    SAVE_BUSINESS_DOCUMENT: '/api/vendor', // For PATCH requests (save business document metadata)
    UPLOAD_SERVICE_IMAGE: '/api/vendor', // For POST requests (upload service image file)
    SAVE_SERVICE_IMAGE: '/api/vendor', // For PATCH requests (save service image metadata)
  },
} as const;

