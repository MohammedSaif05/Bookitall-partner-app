/**
 * Global type definitions
 * Centralized TypeScript types for the application
 */

// Example: Add your global types here
export interface AppConfig {
  name: string;
  version: string;
}

// Image asset types
export type ImageSource = ReturnType<typeof require>;

// Navigation types
export interface NavigationProps {
  navigation?: any;
  route?: any;
}

// Add more types as needed

