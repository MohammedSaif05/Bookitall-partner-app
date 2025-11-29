/**
 * BusinessLocation Screen
 * Second screen in onboarding flow for collecting business address
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
import { getCurrentLocationAddress } from '../../utils/location';
import { showError, showSuccess } from '../../utils/flashMessage';

type BusinessLocationProps = AuthStackScreenProps<'BusinessLocation'>;

/**
 * BusinessLocation - Onboarding Page 2
 */
const BusinessLocation: React.FC<BusinessLocationProps> = ({ navigation }) => {
  const [addressLine, setAddressLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [errors, setErrors] = useState<{
    addressLine?: string;
    landmark?: string;
    city?: string;
    pincode?: string;
    googleMapsLink?: string;
  }>({});

  const isFormComplete =
    addressLine.trim().length > 0 &&
    landmark.trim().length > 0 &&
    city.trim().length > 0 &&
    pincode.trim().length === 6 &&
    /^\d+$/.test(pincode);

  const handleAddressLineChange = (value: string) => {
    setAddressLine(value);
    if (errors.addressLine) {
      setErrors((prev) => ({ ...prev, addressLine: undefined }));
    }
  };

  const handleLandmarkChange = (value: string) => {
    setLandmark(value);
    if (errors.landmark) {
      setErrors((prev) => ({ ...prev, landmark: undefined }));
    }
  };

  const handleGoogleMapsLinkChange = (value: string) => {
    setGoogleMapsLink(value);
    if (errors.googleMapsLink) {
      setErrors((prev) => ({ ...prev, googleMapsLink: undefined }));
    }
  };

  const handleCityChange = (value: string) => {
    setCity(value);
    if (errors.city) {
      setErrors((prev) => ({ ...prev, city: undefined }));
    }
  };

  const handlePincodeChange = (value: string) => {
    // Only allow numeric input and limit to 6 digits
    const numericText = value.replace(/[^0-9]/g, '').slice(0, 6);
    setPincode(numericText);
    if (errors.pincode) {
      setErrors((prev) => ({ ...prev, pincode: undefined }));
    }
  };

  const handleUseCurrentLocation = async () => {
    if (isLoadingLocation) {
      return;
    }

    setIsLoadingLocation(true);
    try {
      const addressDetails = await getCurrentLocationAddress();
      
      // Auto-fill the form fields
      if (addressDetails.addressLine) {
        setAddressLine(addressDetails.addressLine);
        if (errors.addressLine) {
          setErrors((prev) => ({ ...prev, addressLine: undefined }));
        }
      }
      
      if (addressDetails.city) {
        setCity(addressDetails.city);
        if (errors.city) {
          setErrors((prev) => ({ ...prev, city: undefined }));
        }
      }
      
      if (addressDetails.pincode) {
        setPincode(addressDetails.pincode);
        if (errors.pincode) {
          setErrors((prev) => ({ ...prev, pincode: undefined }));
        }
      }
      
      if (addressDetails.landmark) {
        setLandmark(addressDetails.landmark);
        if (errors.landmark) {
          setErrors((prev) => ({ ...prev, landmark: undefined }));
        }
      }

      showSuccess('Location detected successfully!');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to get your location. Please try again.';
      showError(errorMessage);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleConfirmLocation = () => {
    const validationErrors: typeof errors = {};
    
    if (!addressLine.trim()) {
      validationErrors.addressLine = 'Please enter your address.';
    }
    if (!landmark.trim()) {
      validationErrors.landmark = 'Please enter a landmark.';
    }
    if (!city.trim()) {
      validationErrors.city = 'Please enter your city.';
    }
    if (!pincode || pincode.length !== 6) {
      validationErrors.pincode = 'Please enter a valid 6-digit pincode.';
    }
    
    // Validate Google Maps link if provided (optional field)
    // Just check if the link contains "maps" keyword
    if (googleMapsLink.trim()) {
      if (!googleMapsLink.trim().toLowerCase().includes('maps')) {
        validationErrors.googleMapsLink = 'Please enter a valid Google Maps link.';
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Navigate to next onboarding step
    navigation.navigate('BusinessOwnerDetails');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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
          <PageIndicators totalSteps={4} currentStep={1} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Where is your{'\n'}business located?</Text>
            <Text style={styles.subtitle}>
              Pin your exact service location to help{'\n'}customers find you easily.
            </Text>
          </View>

          <View style={styles.fieldsWrapper}>
            <OnboardingField
              label="Address Line"
              placeholder="House No., Street Name"
              required
              value={addressLine}
              onChangeText={handleAddressLineChange}
              errorText={errors.addressLine}
              marginBottom={vs(4)}
            />
            <OnboardingField
              label="Landmark"
              placeholder="Nearby landmark"
              required
              value={landmark}
              onChangeText={handleLandmarkChange}
              errorText={errors.landmark}
              marginBottom={vs(4)}
            />
            <OnboardingField
              label="Google Maps"
              placeholder="Paste your Google Maps link"
              value={googleMapsLink}
              onChangeText={handleGoogleMapsLinkChange}
              errorText={errors.googleMapsLink}
              marginBottom={vs(4)}
            />
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <OnboardingField
                  label="City"
                  placeholder="Enter your city"
                  required
                  value={city}
                  onChangeText={handleCityChange}
                  errorText={errors.city}
                  marginBottom={vs(4)}
                />
              </View>
              <View style={styles.halfField}>
                <OnboardingField
                  label="Pincode"
                  placeholder="Enter 6 digit pincode"
                  required
                  value={pincode}
                  onChangeText={handlePincodeChange}
                  keyboardType="number-pad"
                  maxLength={6}
                  errorText={errors.pincode}
                  marginBottom={vs(4)}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.useLocationButton,
              isLoadingLocation && styles.useLocationButtonDisabled,
            ]}
            onPress={handleUseCurrentLocation}
            activeOpacity={0.8}
            disabled={isLoadingLocation}
          >
            <Text style={styles.useLocationButtonText}>
              {isLoadingLocation ? 'Detecting location...' : 'Use current location'}
            </Text>
          </TouchableOpacity>
          <OnboardingCTAButton
            label="Confirm location"
            onPress={handleConfirmLocation}
            disabled={!isFormComplete}
          />
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
  rowFields: {
    flexDirection: 'row',
    gap: hs(12),
  },
  halfField: {
    flex: 1,
  },
  footer: {
    paddingBottom: vs(32),
    paddingTop: vs(12),
    gap: vs(12),
  },
  useLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: ms(12),
    paddingHorizontal: hs(24),
    minHeight: vs(44),
    width: '100%',
  },
  useLocationButtonDisabled: {
    opacity: 0.6,
  },
  useLocationButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },
});

export default BusinessLocation;

