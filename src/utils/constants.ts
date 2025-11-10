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

// Add your API endpoints, feature flags, etc. here

