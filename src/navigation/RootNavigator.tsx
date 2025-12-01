/**
 * Root Navigator
 * Main navigation container for the entire app
 * 
 * @format
 */

import React from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import type { AuthStackParamList } from './types';
import AuthNavigator from './AuthNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  ref?: React.RefObject<NavigationContainerRef<RootStackParamList>>;
  onReady?: () => void;
  initialAuthRoute?: keyof AuthStackParamList;
}

/**
 * RootNavigator Component
 * Top-level navigation container
 */
const RootNavigator = React.forwardRef<NavigationContainerRef<RootStackParamList>, RootNavigatorProps>(
  ({ onReady, initialAuthRoute }, ref) => {
    return (
      <NavigationContainer ref={ref} onReady={onReady}>
        <Stack.Navigator
          initialRouteName="Auth"
          screenOptions={{
            headerShown: false,
            animation: 'default',
          }}
        >
          <Stack.Screen name="Auth">
            {() => <AuthNavigator initialRouteName={initialAuthRoute} />}
          </Stack.Screen>
          {/* Add other navigators here:
          <Stack.Screen
            name="Main"
            component={MainNavigator}
          />
          */}
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
);

RootNavigator.displayName = 'RootNavigator';

export default RootNavigator;

