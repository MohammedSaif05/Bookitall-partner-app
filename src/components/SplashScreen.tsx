/**
 * Animated Splash Screen Component
 * Handles the custom animation before hiding the native splash screen
 * 
 * @format
 */

import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet, View } from 'react-native';
import RNBootSplash from 'react-native-bootsplash';

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const circleScaleAnim = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Small delay to ensure native splash is visible first
    const timer = setTimeout(() => {
      // Animation sequence:
      // 1. Rotate 220 degrees clockwise (0 -> 220)
      // 2. Small delay at 220 degrees
      // 3. Continue rotating clockwise (220 -> 440) while shrinking (1 -> 0)
      // 4. White circle explodes/grows very fast to fill the screen
      const animation = Animated.sequence([
        // First: Rotate 220 degrees clockwise
        Animated.timing(rotateAnim, {
          toValue: 220,
          duration: 700,
          useNativeDriver: true,
        }),
        // Small delay at 220 degrees
        Animated.delay(200),
        // Second: Continue rotating clockwise (220 -> 440) while shrinking
        Animated.parallel([
          Animated.timing(rotateAnim, {
            toValue: 440,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        // Third: White circle explodes/grows very fast
        Animated.timing(circleScaleAnim, {
          toValue: 1,
          duration: 300, // Very fast explosion
          useNativeDriver: true,
        }),
      ]);

      animation.start(() => {
        setIsVisible(false);
        // Hide native splash screen after animation completes
        RNBootSplash.hide({ fade: false });
        onAnimationComplete?.();
      });
    }, 300); // Small delay to show native splash first

    return () => clearTimeout(timer);
  }, [rotateAnim, scaleAnim, circleScaleAnim, onAnimationComplete]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 220, 440],
    outputRange: ['0deg', '220deg', '440deg'],
  });

  if (!isVisible) {
    return null;
  }

  // Calculate screen dimensions for the circle explosion
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  // Calculate the diagonal to ensure the circle covers the entire screen
  const diagonal = Math.sqrt(
    Math.pow(screenWidth, 2) + Math.pow(screenHeight, 2)
  );
  // Scale factor to make circle cover entire screen (starting from 50px radius)
  const maxScale = diagonal / 50;

  const circleScale = circleScaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, maxScale], // Scale from 0 to cover entire screen
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [
              { rotate: rotateInterpolate },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Image
          source={require('../../assets/bootsplash/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      
      {/* White circle that explodes after shrink */}
      <Animated.View
        style={[
          styles.explosionCircle,
          {
            transform: [{ scale: circleScale }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    overflow: 'hidden',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  logo: {
    width: 150,
    height: 171,
  },
  explosionCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    zIndex: 2,
  },
});

export default SplashScreen;

