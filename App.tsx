/**
 * Bookitallpartner App
 * Production-grade React Native app with New Architecture support
 *
 * @format
 */

import { useLayoutEffect, useState, useEffect, useRef } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainerRef } from '@react-navigation/native';
import FlashMessage from 'react-native-flash-message';
import RNBootSplash from 'react-native-bootsplash';
import ErrorBoundary from './src/components/ErrorBoundary';
import SplashScreen from './src/components/SplashScreen';
import { RootNavigator } from './src/navigation';
import type { RootStackParamList, AuthStackParamList } from './src/navigation/types';
import { userStorage } from './src/utils/storage';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [shouldNavigateToSuccess, setShouldNavigateToSuccess] = useState(false);

  // Hide native splash IMMEDIATELY when App component mounts - before any rendering
  // useLayoutEffect runs synchronously before react-native paint
  useLayoutEffect(() => {
    // Hide immediately - this runs synchronously before any visual rendering
    const hide = () => RNBootSplash.hide({ fade: false }).catch(() => {});
    
    // Try hiding immediately
    hide();
    
    // Multiple backup attempts with increasing delays
    const timeouts = [
      setTimeout(hide, 0),
      setTimeout(hide, 1),
      setTimeout(hide, 10),
      setTimeout(hide, 50),
      setTimeout(hide, 100),
    ];
    
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  // Check storage in parallel while splash screen animation is playing
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const userId = await userStorage.getUserId();
        const isOnBoardCompleted = await userStorage.getIsOnBoardCompleted();

        // If both userId and isOnBoardCompleted are true, set flag to navigate to SuccessScreen
        if (userId && isOnBoardCompleted) {
          setShouldNavigateToSuccess(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    // Check immediately when component mounts (during splash animation)
    checkOnboardingStatus();
  }, []);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // In production, send to error reporting service
        // Example: Sentry.captureException(error, { extra: errorInfo });
        console.error('App Error:', error, errorInfo);
      }}
    >
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        {isSplashVisible ? (
          <SplashScreen
            onAnimationComplete={() => setIsSplashVisible(false)}
          />
        ) : (
          <AppContent shouldNavigateToSuccess={shouldNavigateToSuccess} />
        )}
        <FlashMessage 
          position="bottom" 
          floating={true}
          style={{ zIndex: 9999 }}
        />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

interface AppContentProps {
  shouldNavigateToSuccess: boolean;
}

function AppContent({ shouldNavigateToSuccess }: AppContentProps) {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  const initialRootRouteName: keyof RootStackParamList = shouldNavigateToSuccess ? 'Main' : 'Auth';
  const initialAuthRoute: keyof AuthStackParamList | undefined = shouldNavigateToSuccess
    ? undefined
    : 'GettingStarted';

  return (
    <RootNavigator
      ref={navigationRef}
      onReady={() => {}}
      initialRouteName={initialRootRouteName}
      initialAuthRoute={initialAuthRoute}
    />
  );
}

export default App;
