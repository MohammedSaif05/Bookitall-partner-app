/**
 * OTP Screen
 * OTP verification screen with 6-digit input
 * 
 * @format
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthStackScreenProps } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { ms, vs, hs } from '../../theme/scaling';
import PrimaryButton from '../../components/auth/PrimaryButton';
import { authService, type CustomAxiosError } from '../../services/api';
import { showError } from '../../utils/flashMessage';
import { userStorage } from '../../utils/storage';

// Illustration image (temporary - same as PhoneNumber)
const ILLUSTRATION = require('../../assets/webp/illustration_phoneno.webp');

type OTPProps = AuthStackScreenProps<'OTP'>;

/**
 * OTP - OTP verification screen component
 */
const OTP: React.FC<OTPProps> = ({ navigation, route }) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(45); // Countdown in seconds
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Get phone number from route params
  const phoneNumber = route.params?.phoneNumber || '';
  // Extract mobile number (remove +91 prefix if present)
  const mobileNo = phoneNumber.replace(/^\+91/, '');

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [timeLeft]);

  /**
   * Format time as MM:SS
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  /**
   * Handle OTP input change
   */
  const handleOtpChange = (text: string, index: number) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, '');
    
    // Handle paste (when text length > 1)
    if (numericText.length > 1) {
      handlePaste(numericText);
      return;
    }
    
    const newOtp = [...otp];
    const previousValue = newOtp[index];
    newOtp[index] = numericText;
    setOtp(newOtp);

    // Handle backspace - if field becomes empty and had a value before, focus previous
    if (numericText === '' && previousValue !== '' && index > 0) {
      // Clear current and focus previous
      setTimeout(() => {
        inputRefs.current[index - 1]?.focus();
      }, 0);
    }
    // Auto-focus next input when typing
    else if (numericText && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Handle backspace on empty field
   */
  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /**
   * Handle paste
   */
  const handlePaste = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = numericText[i] || '';
    }
    setOtp(newOtp);
    // Focus last filled input or first empty
    const lastFilledIndex = Math.min(numericText.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  /**
   * Check if OTP is complete
   */
  const isOtpComplete = otp.every((digit) => digit !== '');

  /**
   * Handle Verify button press
   */
  const handleVerify = async () => {
    if (!isOtpComplete || loading || !mobileNo) {
      return;
    }

    const otpCode = otp.join('');
    setLoading(true);

    try {
      const response = await authService.verifyOTP({
        mobileNo,
        otp: otpCode,
      });

      // Only navigate if success is true
      if (response.success && response.data?.userId) {
        // Store userId for use in onboarding screens
        await userStorage.setUserId(response.data.userId);
        // Navigate to next screen (BusinessSetup)
        navigation.navigate('BusinessSetup');
      } else {
        // Show error message if success is false
        showError(
          response.message || 'Invalid OTP. Please try again.'
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
   * Handle Edit number button press
   */
  const handleEditNumber = () => {
    navigation.goBack();
  };

  /**
   * Handle Resend OTP
   */
  const handleResend = () => {
    if (timeLeft === 0) {
      setTimeLeft(45);
      // TODO: Resend OTP
      // Example: resendOTP();
    }
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
            <Text style={styles.title}>Enter the 6-digit OTP sent to your phone</Text>
            <TouchableOpacity onPress={handleResend} disabled={timeLeft > 0}>
              <Text style={[styles.resendText, timeLeft === 0 && styles.resendTextActive]}>
                Resend OTP{timeLeft > 0 ? ` in ${formatTime(timeLeft)}` : ''}
              </Text>
            </TouchableOpacity>
          </View>

          {/* OTP Input Section */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[styles.otpInput, digit && styles.otpInputFilled]}
                value={digit}
                onChangeText={(text) => {
                  if (isOtpComplete && text) {
                    return;
                  }
                  handleOtpChange(text, index);
                }}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={6}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <View style={styles.buttonRow}>
              {/* Edit Number Button */}
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditNumber}
                activeOpacity={0.8}
              >
                <Text style={styles.editButtonText}>Edit number</Text>
              </TouchableOpacity>

              {/* Verify Button */}
              <View style={styles.verifyButtonWrapper}>
                <PrimaryButton
                  label="Verify"
                  onPress={handleVerify}
                  disabled={!isOtpComplete || loading}
                  loading={loading}
                  height={vs(44)}
                  fullWidth={true}
                  containerStyle={styles.verifyButton}
                />
              </View>
            </View>
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
    marginBottom: vs(16),
    paddingHorizontal: hs(8),
  },
  title: {
    ...typography.display,
    color: colors.text.primary,
    marginBottom: vs(8),
    textAlign: 'left',
  },
  resendText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'left',
  },
  resendTextActive: {
    color: colors.button.primary,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: hs(12),
    marginBottom: vs(32),
    paddingHorizontal: hs(8),
  },
  otpInput: {
    width: hs(40),
    height: vs(56),
    borderBottomWidth: 2,
    borderBottomColor: colors.border.medium,
    ...typography.display,
    color: colors.text.primary,
    textAlign: 'center',
    fontSize: ms(24),
    fontWeight: '600',
    paddingVertical: 0,
  },
  otpInputFilled: {
    borderBottomColor: colors.button.primary,
  },
  buttonContainer: {
    marginBottom: vs(32),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: hs(12),
  },
  editButton: {
    flex: 1,
    height: vs(44),
    borderRadius: ms(12),
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.button.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    ...typography.button,
    color: colors.button.primary,
  },
  verifyButtonWrapper: {
    flex: 1,
  },
  verifyButton: {
    width: '100%',
  },
});

export default OTP;

