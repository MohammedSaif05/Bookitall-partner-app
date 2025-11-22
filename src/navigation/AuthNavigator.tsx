/**
 * Auth Navigator
 * Handles all authentication-related screens
 * 
 * @format
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';
import { GettingStarted } from '../screens/auth';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * AuthNavigator Component
 * Stack navigator for authentication flow
 */
const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="GettingStarted"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen
        name="GettingStarted"
        component={GettingStarted}
        options={{
          gestureEnabled: false, // Prevent swipe back on onboarding
        }}
      />
      {/* Add more auth screens here:
      <Stack.Screen
        name="OTP"
        component={OTPScreen}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />
      */}
    </Stack.Navigator>
  );
};

export default AuthNavigator;

