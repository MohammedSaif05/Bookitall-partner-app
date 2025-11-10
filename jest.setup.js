/**
 * Jest setup file for production-grade testing
 * This file runs before each test file
 */

// Mock React Native modules if needed
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Silence console warnings in tests (optional - remove if you want to see warnings)
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

