/**
 * PhoneNumber Screen
 * Phone number entry screen with OTP verification
 * 
 * @format
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthStackScreenProps } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { ms, vs, hs } from '../../theme/scaling';
import PrimaryButton from '../../components/auth/PrimaryButton';
import PhoneIcon from '../../assets/svg/icons/Phone.svg';
import { authService, type CustomAxiosError } from '../../services/api';
import { showError } from '../../utils/flashMessage';

// Illustration image
const ILLUSTRATION = require('../../assets/webp/illustration_phone.webp');

type PhoneNumberProps = AuthStackScreenProps<'PhoneNumber'>;

/**
 * PhoneNumber - Phone number entry screen component
 */
const PhoneNumber: React.FC<PhoneNumberProps> = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Phone number should be exactly 10 digits
  const isValidPhoneNumber = phoneNumber.length === 10 && /^\d+$/.test(phoneNumber);
  const hasInput = phoneNumber.length > 0;

  /**
   * Handle phone number input change
   * Only allow numeric input and limit to 10 digits
   */
  const handlePhoneNumberChange = (text: string) => {
    // Remove non-numeric characters
    const numericText = text.replace(/[^0-9]/g, '');
    // Limit to 10 digits
    if (numericText.length <= 10) {
      setPhoneNumber(numericText);
    }
  };

  /**
   * Handle Send OTP button press
   */
  const handleSendOTP = async () => {
    if (!isValidPhoneNumber || loading) {
      return;
    }

    setLoading(true);
    try {
      const response = await authService.sendOTP({
        mobileNo: phoneNumber,
      });

      // Only navigate if success is true
      if (response.success) {
        // Navigate to OTP screen with phone number
        navigation.navigate('OTP', { phoneNumber: `+91${phoneNumber}` });
      } else {
        // Show error message if success is false
        showError(
          response.message || 'Failed to send OTP. Please try again.'
        );
      }
    } catch (error) {
      // Handle API errors
      const apiError = error as CustomAxiosError;
      const errorMessage =
        apiError.response?.data?.message ||
        apiError.response?.data?.error ||
        'Network error. Please check your internet connection and try again.';
      
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Terms and Conditions press
   */
  const handleTermsPress = () => {
    // TODO: Navigate to Terms and Conditions screen
    // For now, this is a placeholder
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.content}>
          {/* Header with Logo */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/webp/header_logo.webp')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <Image
              source={ILLUSTRATION}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Enter your{'\n'}phone number</Text>
            <Text style={styles.description}>We'll send you an OTP to continue</Text>
          </View>

          {/* Phone Input Section */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              {/* Country Code */}
              <View style={styles.countryCodeContainer}>
                <Text style={styles.countryCode}>+91</Text>
                <View style={styles.divider} />
              </View>

              {/* Phone Number Input */}
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.text.tertiary}
                value={phoneNumber}
                onChangeText={handlePhoneNumberChange}
                keyboardType="phone-pad"
                maxLength={10}
                autoFocus={false}
              />

              {/* Phone Icon */}
              <View style={styles.iconContainer}>
                <PhoneIcon
                  width={ms(24)}
                  height={ms(24)}
                  stroke={colors.text.black}
                  strokeWidth={2.5}
                  opacity={hasInput ? 1 : 0.6}
                />
              </View>
            </View>
          </View>

          {/* Send OTP Button */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              label="Send OTP"
              onPress={handleSendOTP}
              disabled={!isValidPhoneNumber || loading}
              loading={loading}
              height={vs(44)}
            />
          </View>

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink} onPress={handleTermsPress}>
                Terms and Conditions
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
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
  illustration: {
    width: '100%',
    height: '100%',
    maxHeight: vs(280),
  },
  titleSection: {
    marginTop: vs(24),
    marginBottom: vs(32),
    paddingHorizontal: hs(8),
  },
  title: {
    ...typography.display,
    color: colors.text.primary,
    marginBottom: vs(8),
    textAlign: 'left',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.96,
  },
  description: {
    ...typography.body,
    color: colors.text.primary,
    textAlign: 'left',
  },
  inputContainer: {
    marginBottom: vs(32),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: ms(12),
    borderWidth: 0,
    paddingHorizontal: hs(16),
    paddingVertical: vs(12),
    minHeight: vs(56),
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: hs(12),
  },
  countryCode: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: vs(24),
    backgroundColor: colors.border.medium,
    marginLeft: hs(12),
  },
  phoneInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    paddingVertical: 0,
    paddingHorizontal: hs(12),
  },
  iconContainer: {
    marginLeft: hs(8),
  },
  buttonContainer: {
    marginBottom: vs(12),
  },
  termsContainer: {
    alignItems: 'center',
    paddingBottom: vs(20),
  },
  termsText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    textAlign: 'center',
  },
  termsLink: {
    ...typography.bodySmall,
    color: colors.status.info,
    fontWeight: '600',
  },
});

export default PhoneNumber;

