/**
 * Navigation Type Definitions
 * Centralized TypeScript types for React Navigation
 * 
 * @format
 */

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Root Navigator Param List
 * Defines all possible routes in the app
 */
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  // Add other navigators here (e.g., Main, Onboarding, etc.)
};

/**
 * Auth Stack Param List
 * Defines routes in the authentication flow
 */
export type AuthStackParamList = {
  GettingStarted: undefined;
  PhoneNumber: undefined;
  OTP: { phoneNumber?: string };
  BusinessSetup: undefined;
  BusinessLocation: undefined;
  BusinessOwnerDetails: undefined;
  // Add other auth screens here:
  // Login: undefined;
  // Register: undefined;
};

/**
 * Root Stack Screen Props
 * Helper type for screens in RootStack
 */
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

/**
 * Auth Stack Screen Props
 * Helper type for screens in AuthStack
 */
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

/**
 * Navigation Props
 * Generic navigation props for any screen
 */
export type NavigationProps<T extends keyof RootStackParamList> =
  RootStackScreenProps<T>['navigation'];

/**
 * Route Props
 * Generic route props for any screen
 */
export type RouteProps<T extends keyof RootStackParamList> =
  RootStackScreenProps<T>['route'];

// Declare global types for React Navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

