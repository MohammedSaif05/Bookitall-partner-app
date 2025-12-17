/**
 * DashboardStackNavigator
 * Stack navigator for dashboard-related screens
 *
 * @format
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from './types';
import DashboardHome from '../screens/dashboard/DashboardHome';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

const DashboardStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="DashboardHome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen
        name="DashboardHome"
        component={DashboardHome}
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default DashboardStackNavigator;

