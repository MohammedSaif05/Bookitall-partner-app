/**
 * Bookitallpartner App
 * Production-grade React Native app with New Architecture support
 *
 * @format
 */

import { useLayoutEffect, useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RNBootSplash from 'react-native-bootsplash';
import ErrorBoundary from './src/components/ErrorBoundary';
import SplashScreen from './src/components/SplashScreen';
import GettingStarted from './src/screens/auth/GettingStarted';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isSplashVisible, setIsSplashVisible] = useState(true);

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
          <AppContent />
        )}
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const handleGetStarted = () => {
    // TODO: Navigate to next screen (e.g., OTP screen)
    console.log('Navigate to OTP screen');
  };

  return (
    <View style={styles.container}>
      <GettingStarted onGetStarted={handleGetStarted} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
