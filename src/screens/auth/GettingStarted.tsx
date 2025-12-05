/**
 * GettingStarted Screen
 * Onboarding screen with swipable illustrations and OTP information
 * 
 * @format
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthStackScreenProps } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { ms, vs, hs } from '../../theme/scaling';
import DotIndicator from '../../components/auth/DotIndicator';
import PrimaryButton from '../../components/auth/PrimaryButton';
import { userStorage } from '../../utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Illustration images
const ILLUSTRATIONS = [
  require('../../assets/webp/illustration_1.webp'),
  require('../../assets/webp/illustration_2.webp'),
  require('../../assets/webp/illustration_3.webp'),
];

// Onboarding content for each slide
const ONBOARDING_CONTENT = [
  {
    quote: "Welcome to the future of booking",
    title: "Your visit\nmade simple",
    description: "Reserve your spot, show up, and get what you came for. Easy.",
  },
  {
    quote: "Book appointments in seconds",
    title: "Quick and\nconvenient",
    description: "No more waiting in lines. Schedule your visit with just a few taps.",
  },
  {
    quote: "Stay updated in real-time",
    title: "Never miss\na thing",
    description: "Get instant notifications and reminders for all your bookings.",
  },
];

type GettingStartedProps = AuthStackScreenProps<'GettingStarted'>;

/**
 * GettingStarted - Onboarding screen component
 */
const GettingStarted: React.FC<GettingStartedProps> = ({ navigation }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Check if user has completed onboarding and redirect to SuccessScreen
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const userId = await userStorage.getUserId();
        const isOnBoardCompleted = await userStorage.getIsOnBoardCompleted();

        // If both userId and isOnBoardCompleted are true, navigate to SuccessScreen
        if (userId && isOnBoardCompleted) {
          navigation.replace('SuccessScreen');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, [navigation]);

  /**
   * Handle scroll event to update active dot indicator
   */
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  /**
   * Handle get started button press
   * Navigate to phone number entry screen
   */
  const handleGetStarted = () => {
    navigation.navigate('PhoneNumber');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/webp/header_logo.webp')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Illustration Carousel */}
        <View style={styles.illustrationContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {ILLUSTRATIONS.map((illustration, index) => (
              <View key={index} style={styles.illustrationWrapper}>
                <Image
                  source={illustration}
                  style={styles.illustration}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Quote Section */}
        <View style={styles.quoteSection}>
          <Text style={styles.quoteText}>
            {ONBOARDING_CONTENT[activeIndex].quote}
          </Text>
        </View>

        {/* Dot Indicator */}
        <View style={styles.indicatorContainer}>
          <DotIndicator
            totalDots={ILLUSTRATIONS.length}
            activeIndex={activeIndex}
            dotSize={ms(10)}
          />
        </View>

        {/* Marketing Section */}
        <View style={styles.marketingSection}>
          <Text style={styles.marketingTitle}>
            {ONBOARDING_CONTENT[activeIndex].title}
          </Text>
          <Text style={styles.marketingDescription}>
            {ONBOARDING_CONTENT[activeIndex].description}
          </Text>
        </View>

        {/* Get Started Button */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            label="Get started"
            onPress={handleGetStarted}
            disabled={false}
            height={vs(44)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: hs(20),
  },
  header: {
    paddingTop: vs(20),
    paddingBottom: vs(16),
    alignItems: 'flex-start',
  },
  logo: {
    width: hs(120),
    height: vs(40),
  },
  illustrationContainer: {
    flex: 1,
    maxHeight: vs(300),
    marginVertical: vs(20),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  illustrationWrapper: {
    width: SCREEN_WIDTH - hs(40),
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
    maxHeight: vs(280),
  },
  quoteSection: {
    alignItems: 'center',
    marginTop: vs(16),
    marginBottom: vs(8),
  },
  quoteText: {
    ...typography.body,
    color: colors.text.primary,
    textAlign: 'center',
  },
  indicatorContainer: {
    alignItems: 'center',
    marginVertical: vs(16),
  },
  marketingSection: {
    marginTop: vs(24),
    marginBottom: vs(32),
    paddingHorizontal: hs(8),
  },
  marketingTitle: {
    ...typography.display,
    color: colors.text.primary,
    marginBottom: vs(12),
    textAlign: 'left',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.96,
  },
  marketingDescription: {
    ...typography.body,
    color: colors.text.primary,
    textAlign: 'left',
  },
  buttonContainer: {
    marginBottom: vs(32),
  },
});

export default GettingStarted;

