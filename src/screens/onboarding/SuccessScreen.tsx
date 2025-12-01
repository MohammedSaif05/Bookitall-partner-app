/**
 * SuccessScreen
 * Final screen in onboarding flow showing completion
 *
 * @format
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import type { AuthStackScreenProps } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs, ms } from '../../theme/scaling';

type SuccessScreenProps = AuthStackScreenProps<'SuccessScreen'>;

/**
 * SuccessScreen - Onboarding Completion
 */
const SuccessScreen: React.FC<SuccessScreenProps> = ({ navigation: _navigation }) => {
  const handleGoToDashboard = () => {
    // TODO: Navigate to dashboard
    // _navigation.navigate('Dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Lottie Animation */}
          <View style={styles.illustrationContainer}>
            <LottieView
              source={require('../../assets/lottie/confitte.json')}
              autoPlay
              loop={false}
              style={styles.lottieAnimation}
            />
          </View>

          {/* Title and Subtitle */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Your business setup is complete!</Text>
            <Text style={styles.subtitle}>
              Setup complete! Everything looks good.
            </Text>
          </View>
        </View>

        {/* Go to Dashboard Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.dashboardButton}
            onPress={handleGoToDashboard}
            activeOpacity={0.8}
          >
            <Text style={styles.dashboardButtonText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
    paddingHorizontal: hs(24),
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationContainer: {
    width: '100%',
    aspectRatio: 1.2,
    maxHeight: vs(300),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(40),
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: hs(24),
  },
  title: {
    ...typography.display,
    color: colors.text.primary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: vs(12),
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.96,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.primary,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: vs(32),
    paddingTop: vs(12),
  },
  dashboardButton: {
    backgroundColor: colors.text.primary,
    borderRadius: ms(12),
    paddingVertical: vs(16),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: vs(52),
  },
  dashboardButtonText: {
    ...typography.button,
    color: colors.text.white,
    fontWeight: '600',
  },
});

export default SuccessScreen;

