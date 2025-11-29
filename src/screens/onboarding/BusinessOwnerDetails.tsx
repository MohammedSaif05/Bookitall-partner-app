/**
 * BusinessOwnerDetails Screen
 * Third screen in onboarding flow for collecting business owner information
 *
 * @format
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthStackScreenProps } from '../../navigation/types';
import {
  PageIndicators,
  OnboardingField,
  OnboardingCTAButton,
} from '../../components/onboarding';
import BackIcon from '../../assets/svg/icons/back.svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs, ms } from '../../theme/scaling';
import { vendorService } from '../../services/api';
import { userStorage } from '../../utils/storage';
import { showError, showSuccess } from '../../utils/flashMessage';

type BusinessOwnerDetailsProps = AuthStackScreenProps<'BusinessOwnerDetails'>;

/**
 * BusinessOwnerDetails - Onboarding Page 3
 */
const BusinessOwnerDetails: React.FC<BusinessOwnerDetailsProps> = ({ navigation }) => {
  const [ownerName, setOwnerName] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [showOwnerNameTooltip, setShowOwnerNameTooltip] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    ownerName?: string;
    alternatePhone?: string;
    businessEmail?: string;
  }>({});

  // Validate phone number (10 digits)
  const isValidPhoneNumber = alternatePhone.length === 10 && /^\d+$/.test(alternatePhone);
  // Validate email format
  const isValidEmail = businessEmail.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail);

  const isFormComplete =
    ownerName.trim().length > 0 &&
    (alternatePhone.length === 0 || isValidPhoneNumber) &&
    isValidEmail;

  const handleOwnerNameChange = (value: string) => {
    setOwnerName(value);
    if (errors.ownerName) {
      setErrors((prev) => ({ ...prev, ownerName: undefined }));
    }
  };

  const handleAlternatePhoneChange = (text: string) => {
    // Remove non-numeric characters
    const numericText = text.replace(/[^0-9]/g, '');
    // Limit to 10 digits
    if (numericText.length <= 10) {
      setAlternatePhone(numericText);
      if (errors.alternatePhone) {
        setErrors((prev) => ({ ...prev, alternatePhone: undefined }));
      }
    }
  };

  const handleBusinessEmailChange = (value: string) => {
    setBusinessEmail(value);
    if (errors.businessEmail) {
      setErrors((prev) => ({ ...prev, businessEmail: undefined }));
    }
  };

  const handleNext = async () => {
    if (isSubmitting) {
      return;
    }

    const validationErrors: typeof errors = {};
    
    if (!ownerName.trim()) {
      validationErrors.ownerName = 'Please enter the owner name.';
    }
    if (alternatePhone.length > 0 && !isValidPhoneNumber) {
      validationErrors.alternatePhone = 'Please enter a valid 10-digit phone number.';
    }
    if (businessEmail.length > 0 && !isValidEmail) {
      validationErrors.businessEmail = 'Please enter a valid email address.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Get userId from storage
    const userId = await userStorage.getUserId();
    if (!userId) {
      showError('User ID not found. Please login again.');
      return;
    }

    setIsSubmitting(true);
    try {
      await vendorService.updateBusinessOwnerDetails({
        userId,
        step: 3,
        ownerName: ownerName.trim(),
        businessEmail: businessEmail.trim() || undefined,
        alternatePhoneNumber: alternatePhone.trim() || undefined,
      });

      showSuccess('Owner details saved successfully!');
      // Navigate to next onboarding step (OperatingHours)
      navigation.navigate('OperatingHours');
    } catch (error) {
      // Error is already handled by the API interceptor and flash message
      console.error('Error updating business owner details:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <TouchableWithoutFeedback onPress={() => {
        Keyboard.dismiss();
        setShowOwnerNameTooltip(false);
      }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <BackIcon
                width={ms(18)}
                height={ms(18)}
                stroke={colors.text.primary}
              />
            </TouchableOpacity>
            <PageIndicators totalSteps={4} currentStep={2} />
          </View>

          <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => {
            Keyboard.dismiss();
            setShowOwnerNameTooltip(false);
          }}
        >
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>Tell us about you{'\n'}and your business</Text>
              <Text style={styles.subtitle}>
                These details help us verify your business{'\n'}and contact you when needed.
              </Text>
            </View>

            <View style={styles.fieldsWrapper}>
            <OnboardingField
              label="Owner Name"
              placeholder="Full Name of Business Owner"
              required
              showInfoIcon
              value={ownerName}
              onChangeText={handleOwnerNameChange}
              onInfoPress={() => setShowOwnerNameTooltip((prev) => !prev)}
              showTooltip={showOwnerNameTooltip}
              tooltipText="must match your legal ID"
              errorText={errors.ownerName}
              marginBottom={vs(4)}
            />

            {/* Alternate Phone Number with Country Code */}
            <View style={[styles.fieldContainer, { marginBottom: vs(4) }]}>
              <View style={styles.labelRowContainer}>
                <Text style={styles.label}>Alternate Phone Number</Text>
              </View>
              <View style={styles.phoneInputContainer}>
                <View style={styles.countryCodeContainer}>
                  <Text style={styles.countryCode}>+91</Text>
                  <View style={styles.divider} />
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Alternate phone number (optional)"
                  placeholderTextColor={colors.text.secondary}
                  value={alternatePhone}
                  onChangeText={handleAlternatePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              {errors.alternatePhone ? (
                <Text style={styles.errorText}>{errors.alternatePhone}</Text>
              ) : null}
            </View>

            <OnboardingField
              label="Business Email"
              placeholder="Business email (optional)"
              value={businessEmail}
              onChangeText={handleBusinessEmailChange}
              keyboardType="email-address"
              errorText={errors.businessEmail}
              marginBottom={vs(4)}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <OnboardingCTAButton
            label={isSubmitting ? 'Saving...' : 'Next'}
            onPress={handleNext}
            disabled={!isFormComplete || isSubmitting}
          />
        </View>
        </View>
      </TouchableWithoutFeedback>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: vs(16),
    paddingBottom: vs(12),
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
  },
  titleWrapper: {
    paddingTop: vs(12),
    paddingBottom: vs(24),
  },
  title: {
    ...typography.display,
    color: colors.text.primary,
    marginBottom: vs(12),
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  fieldsWrapper: {
    paddingBottom: vs(24),
  },
  fieldContainer: {
    width: '100%',
  },
  labelRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(8),
  },
  label: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: ms(12),
    minHeight: vs(48),
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: hs(1),
    paddingRight: hs(12),
  },
  countryCode: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: vs(20),
    backgroundColor: colors.text.secondary,
    marginLeft: hs(12),
  },
  phoneInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    paddingHorizontal: hs(1),
    paddingVertical: vs(12),
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.status.error,
    marginTop: vs(4),
    marginLeft: hs(4),
  },
  footer: {
    paddingBottom: vs(32),
    paddingTop: vs(12),
  },
});

export default BusinessOwnerDetails;

