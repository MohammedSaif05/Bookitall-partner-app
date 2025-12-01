/**
 * Auth Navigator
 * Handles all authentication-related screens
 * 
 * @format
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';
import { GettingStarted, PhoneNumber, OTP } from '../screens/auth';
import { BusinessSetup, BusinessLocation, BusinessOwnerDetails, OperatingHours, SuccessScreen } from '../screens/onboarding';

const Stack = createNativeStackNavigator<AuthStackParamList>();

interface AuthNavigatorProps {
  initialRouteName?: keyof AuthStackParamList;
}

/**
 * AuthNavigator Component
 * Stack navigator for authentication flow
 */
const AuthNavigator: React.FC<AuthNavigatorProps> = ({ 
  initialRouteName = 'GettingStarted' 
}) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
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
      <Stack.Screen
        name="PhoneNumber"
        component={PhoneNumber}
        options={{
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="OTP"
        component={OTP}
        options={{
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="BusinessSetup"
        component={BusinessSetup}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="BusinessLocation"
        component={BusinessLocation}
        options={{
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="BusinessOwnerDetails"
        component={BusinessOwnerDetails}
        options={{
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="OperatingHours"
        component={OperatingHours}
        options={{
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="SuccessScreen"
        component={SuccessScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      {/* Add more auth screens here:
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />
      */}
    </Stack.Navigator>
  );
};

export default AuthNavigator;

