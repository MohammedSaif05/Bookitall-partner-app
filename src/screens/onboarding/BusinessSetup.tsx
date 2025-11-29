/**
 * BusinessSetup Screen
 * First screen in onboarding flow for collecting business basics
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthStackScreenProps } from '../../navigation/types';
import {
  PageIndicators,
  OnboardingField,
  OnboardingCTAButton,
  OnboardingDropdownField,
} from '../../components/onboarding';
import InfoIcon from '../../assets/svg/icons/info.svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs, ms } from '../../theme/scaling';
import { vendorService, type CustomAxiosError } from '../../services/api';
import { showError } from '../../utils/flashMessage';
import { userStorage } from '../../utils/storage';

type BusinessSetupProps = AuthStackScreenProps<'BusinessSetup'>;

/**
 * BusinessSetup - Onboarding Page 1
 */
const BusinessSetup: React.FC<BusinessSetupProps> = ({ navigation }) => {
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState<string>();
  const [businessType, setBusinessType] = useState<string>();
  const [openSelector, setOpenSelector] = useState<'category' | 'type' | null>(null);
  const [showBusinessNameTooltip, setShowBusinessNameTooltip] = useState(false);
  const [activeInfoOption, setActiveInfoOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    businessName?: string;
    businessCategory?: string;
    businessType?: string;
  }>({});

  // Get userId on component mount
  useEffect(() => {
    const loadUserId = async () => {
      const id = await userStorage.getUserId();
      setUserId(id);
    };
    loadUserId();
  }, []);

  const isFormComplete =
    businessName.trim().length > 0 && Boolean(businessCategory) && Boolean(businessType);

  const businessCategories = ['Turf', 'Swimming pool', 'Saloon', 'Beauty parlor', 'Spa'];
  const businessTypes = ['Individual', 'Storefront', 'Franchise'];
  const businessTypeInfo: Record<string, string> = {
    Individual: 'You work alone (no shop)',
    Storefront: 'A physical shop customers visit',
    Franchise: 'You run multiple branches',
  };

  const selectorOptions =
    openSelector === 'category'
      ? businessCategories
      : openSelector === 'type'
      ? businessTypes
      : [];
  const selectorTitle =
    openSelector === 'category'
      ? 'Select business category'
      : openSelector === 'type'
      ? 'Select business type'
      : '';

  const handleBusinessNameChange = (value: string) => {
    setBusinessName(value);
    if (errors.businessName) {
      setErrors((prev) => ({ ...prev, businessName: undefined }));
    }
  };

  const ensureBusinessNameFilled = () => {
    if (!businessName.trim()) {
      setErrors((prev) => ({
        ...prev,
        businessName: 'Please enter your business name.',
      }));
      setShowBusinessNameTooltip(false);
      return false;
    }
    return true;
  };

  const handleCategoryPress = () => {
    if (!ensureBusinessNameFilled()) {
      return;
    }
    setOpenSelector('category');
  };

  const handleTypePress = () => {
    if (!ensureBusinessNameFilled()) {
      return;
    }
    if (!businessCategory) {
      setErrors((prev) => ({
        ...prev,
        businessCategory: 'Please select a category.',
      }));
      return;
    }
    setOpenSelector('type');
  };

  const handleSelectOption = (value: string) => {
    if (openSelector === 'category') {
      setBusinessCategory(value);
      if (errors.businessCategory) {
        setErrors((prev) => ({ ...prev, businessCategory: undefined }));
      }
    } else if (openSelector === 'type') {
      setBusinessType(value);
      if (errors.businessType) {
        setErrors((prev) => ({ ...prev, businessType: undefined }));
      }
    }
    setActiveInfoOption(null);
    setOpenSelector(null);
  };

  const handleContinue = async () => {
    const validationErrors: typeof errors = {};
    if (!businessName.trim()) {
      validationErrors.businessName = 'Please enter your business name.';
    }
    if (!businessCategory) {
      validationErrors.businessCategory = 'Please select a category.';
    }
    if (!businessType) {
      validationErrors.businessType = 'Select how your business operates.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!userId) {
      showError('User ID not found. Please try logging in again.');
      return;
    }

    setLoading(true);
    try {
      const response = await vendorService.updateBusinessSetup({
        userId,
        step: 1,
        businessName: businessName.trim(),
        businessCategory: businessCategory!,
        businessType: businessType!,
      });

      if (response.success) {
        // Navigate to next onboarding step
        navigation.navigate('BusinessLocation');
      } else {
        showError(
          response.message || 'Failed to save business details. Please try again.'
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <TouchableWithoutFeedback onPress={() => {
        Keyboard.dismiss();
        setShowBusinessNameTooltip(false);
      }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <PageIndicators totalSteps={4} currentStep={0} />
          </View>

          <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => {
            Keyboard.dismiss();
            setShowBusinessNameTooltip(false);
          }}
        >
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>Let's setup your business</Text>
              <Text style={styles.subtitle}>
                Tell us a few details so customers can find{'\n'}you easily.
              </Text>
            </View>

            <View style={styles.fieldsWrapper}>
            <OnboardingField
              label="Business name"
              placeholder="Enter your shop or service name"
              required
              showInfoIcon
              value={businessName}
              onChangeText={handleBusinessNameChange}
              onInfoPress={() => setShowBusinessNameTooltip((prev) => !prev)}
              showTooltip={showBusinessNameTooltip}
              tooltipText="This will appear to customers"
              errorText={errors.businessName}
              marginBottom={vs(4)}
            />
            <OnboardingDropdownField
              label="Business category"
              placeholder="Select your category"
              required
              value={businessCategory}
              onPress={handleCategoryPress}
              errorText={errors.businessCategory}
              marginBottom={vs(4)}
            />
            <OnboardingDropdownField
              label="Business type"
              placeholder="Select your business type"
              required
              value={businessType}
              onPress={handleTypePress}
              errorText={errors.businessType}
              marginBottom={vs(4)}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <OnboardingCTAButton
            label="Continue"
            onPress={handleContinue}
            disabled={!isFormComplete || loading}
          />
        </View>
        </View>
      </TouchableWithoutFeedback>

      <Modal
        visible={openSelector !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setOpenSelector(null);
          setActiveInfoOption(null);
        }}
      >
        <TouchableWithoutFeedback onPress={() => {
          setOpenSelector(null);
          setActiveInfoOption(null);
        }}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{selectorTitle}</Text>
                {selectorOptions.map((option) => {
                  const optionInfoText =
                    openSelector === 'type' ? businessTypeInfo[option] : undefined;
                  return (
                    <View key={option} style={styles.optionWrapper}>
                      <TouchableOpacity
                        style={styles.optionRow}
                        onPress={() => {
                          handleSelectOption(option);
                          setActiveInfoOption(null);
                        }}
                      >
                        <Text style={styles.optionText}>{option}</Text>
                        {optionInfoText && (
                          <TouchableOpacity
                            onPress={() =>
                              setActiveInfoOption((prev) => (prev === option ? null : option))
                            }
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <InfoIcon
                              width={ms(16)}
                              height={ms(16)}
                              stroke={colors.text.primary}
                              opacity={0.8}
                            />
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
                      {optionInfoText && activeInfoOption === option && (
                        <View style={styles.optionTooltipWrapper}>
                          <View style={styles.optionTooltipBubble}>
                            <Text style={styles.tooltipText}>{optionInfoText}</Text>
                            <View style={styles.optionTooltipArrow} />
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    alignItems: 'flex-end',
    paddingTop: vs(16),
    paddingBottom: vs(12),
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
    gap: vs(8),
  },
  footer: {
    paddingBottom: vs(32),
    paddingTop: vs(12),
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.white,
    borderTopLeftRadius: ms(24),
    borderTopRightRadius: ms(24),
    paddingHorizontal: hs(24),
    paddingTop: vs(24),
    paddingBottom: vs(32),
    gap: vs(4),
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: vs(8),
  },
  optionWrapper: {
    position: 'relative',
    marginBottom: vs(4),
  },
  optionRow: {
    paddingVertical: vs(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionTooltipWrapper: {
    position: 'absolute',
    top: vs(28),
    right: 0,
    alignItems: 'flex-end',
    zIndex: 1000,
    elevation: 10,
  },
  optionTooltipBubble: {
    paddingVertical: vs(8),
    paddingHorizontal: ms(12),
    backgroundColor: colors.button.primary,
    borderRadius: ms(12),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  optionTooltipArrow: {
    position: 'absolute',
    top: -ms(6),
    right: ms(10),
    width: ms(12),
    height: ms(12),
    backgroundColor: colors.button.primary,
    transform: [{ rotate: '45deg' }],
    borderRadius: ms(2),
  },
  optionText: {
    ...typography.body,
    color: colors.text.primary,
  },
  tooltipText: {
    ...typography.bodySmall,
    color: colors.text.white,
  },
});

export default BusinessSetup;



