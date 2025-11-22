/**
 * Root Navigator
 * Main navigation container for the entire app
 * 
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * RootNavigator Component
 * Top-level navigation container
 */
const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{
          headerShown: false,
          animation: 'default',
        }}
      >
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
        />
        {/* Add other navigators here:
        <Stack.Screen
          name="Main"
          component={MainNavigator}
        />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

