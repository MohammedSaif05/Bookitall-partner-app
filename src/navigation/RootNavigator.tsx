/**
 * Root Navigator
 * Main navigation container for the entire app
 * 
 * @format
 */

import React from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList, AuthStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import StaffsScreen from '../screens/dashboard/StaffsScreen';
import AddStaffScreen from '../screens/dashboard/AddStaffScreen';
import ServicesScreen from '../screens/dashboard/ServicesScreen';
import AddServiceScreen from '../screens/dashboard/AddServiceScreen';
import AddBankDetailsScreen from '../screens/dashboard/AddBankDetailsScreen';
import VerifyBusinessScreen from '../screens/dashboard/VerifyBusinessScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  ref?: React.RefObject<NavigationContainerRef<RootStackParamList>>;
  onReady?: () => void;
  initialAuthRoute?: keyof AuthStackParamList;
  initialRouteName?: keyof RootStackParamList;
}

/**
 * RootNavigator Component
 * Top-level navigation container
 */
const RootNavigator = React.forwardRef<NavigationContainerRef<RootStackParamList>, RootNavigatorProps>(
  ({ onReady, initialAuthRoute, initialRouteName = 'Auth' }, ref) => {
    return (
      <NavigationContainer ref={ref} onReady={onReady}>
        <Stack.Navigator
          initialRouteName={initialRouteName}
          screenOptions={{
            headerShown: false,
            animation: 'default',
          }}
        >
          <Stack.Screen name="Auth">
            {() => <AuthNavigator initialRouteName={initialAuthRoute} />}
          </Stack.Screen>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="Staffs"
            component={StaffsScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="AddStaff"
            component={AddStaffScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="Services"
            component={ServicesScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="AddService"
            component={AddServiceScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="AddBankDetails"
            component={AddBankDetailsScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="VerifyBusiness"
            component={VerifyBusinessScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
);

RootNavigator.displayName = 'RootNavigator';

export default RootNavigator;

