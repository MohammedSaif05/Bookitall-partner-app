/**
 * TurfServiceForm Component
 * Form component for creating/editing Turf category services
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
} from 'react-native';
import { OnboardingField, OnboardingDropdownField } from '../onboarding';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs, ms } from '../../theme/scaling';
import { SPORT_TYPES, GENDER_OPTIONS, TURF_AMENITIES } from '../../config/serviceForms';

export interface TurfServiceFormData {
  serviceName: string;
  sportType: string;
  serviceDurationInMinutes: number;
  bufferTimeInMinutes: number;
  price: number;
  maximumPlayers: number;
  serviceFor: 'male' | 'female' | 'both' | 'mixed';
  amenities: string[];
}

interface TurfServiceFormProps {
  initialData?: Partial<TurfServiceFormData>;
  onChange: (data: Partial<TurfServiceFormData>) => void;
  errors?: Partial<Record<keyof TurfServiceFormData, string>>;
}

const TurfServiceForm: React.FC<TurfServiceFormProps> = ({
  initialData,
  onChange,
  errors = {},
}) => {
  const [serviceName, setServiceName] = useState(initialData?.serviceName || '');
  const [sportType, setSportType] = useState<string | undefined>(initialData?.sportType);
  const [serviceDurationInMinutes, setServiceDurationInMinutes] = useState<string>(
    initialData?.serviceDurationInMinutes?.toString() || ''
  );
  const [bufferTimeInMinutes, setBufferTimeInMinutes] = useState<string>(
    initialData?.bufferTimeInMinutes?.toString() || ''
  );
  const [price, setPrice] = useState<string>(initialData?.price?.toString() || '');
  const [maximumPlayers, setMaximumPlayers] = useState<string>(
    initialData?.maximumPlayers?.toString() || ''
  );
  const [serviceFor, setServiceFor] = useState<string | undefined>(
    initialData?.serviceFor || undefined
  );
  const [amenities, setAmenities] = useState<string[]>(initialData?.amenities || []);

  const [isSportTypeModalVisible, setIsSportTypeModalVisible] = useState(false);
  const [isGenderModalVisible, setIsGenderModalVisible] = useState(false);
  const [isAmenitiesModalVisible, setIsAmenitiesModalVisible] = useState(false);

  // Tooltips (same styling as onboarding fields)
  type ActiveTooltip =
    | null
    | 'serviceName'
    | 'sportType'
    | 'slotDuration'
    | 'bufferTime'
    | 'price'
    | 'maximumPlayers'
    | 'allowedGenders'
    | 'amenities';

  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip>(null);

  // Update parent when form data changes
  useEffect(() => {
    const formData: Partial<TurfServiceFormData> = {
      serviceName: serviceName.trim(),
      sportType: sportType || '',
      serviceDurationInMinutes: serviceDurationInMinutes ? parseInt(serviceDurationInMinutes, 10) : 0,
      bufferTimeInMinutes: bufferTimeInMinutes ? parseInt(bufferTimeInMinutes, 10) : 0,
      price: price ? parseFloat(price) : 0,
      maximumPlayers: maximumPlayers ? parseInt(maximumPlayers, 10) : 0,
      serviceFor: (serviceFor as 'male' | 'female' | 'both' | 'mixed') || 'both',
      amenities,
    };
    onChange(formData);
  }, [
    serviceName,
    sportType,
    serviceDurationInMinutes,
    bufferTimeInMinutes,
    price,
    maximumPlayers,
    serviceFor,
    amenities,
    onChange,
  ]);

  const handleSportTypeSelect = (sport: string) => {
    setSportType(sport);
    setIsSportTypeModalVisible(false);
  };

  const handleGenderSelect = (gender: string) => {
    setServiceFor(gender);
    setIsGenderModalVisible(false);
  };

  const handleAmenityToggle = (amenity: string) => {
    setAmenities((prev) => {
      if (prev.includes(amenity)) {
        return prev.filter((a) => a !== amenity);
      }
      return [...prev, amenity];
    });
  };

  const getGenderLabel = (value?: string) => {
    if (!value) return undefined;
    const option = GENDER_OPTIONS.find((opt) => opt.value === value);
    return option?.label;
  };

  const getAmenitiesDisplayText = () => {
    if (amenities.length === 0) return undefined;
    if (amenities.length === 1) return amenities[0];
    return `${amenities.length} amenities selected`;
  };

  return (
    <View style={styles.container}>
        {/* Service Name */}
        <View style={styles.fieldWrapper}>
        <OnboardingField
          label="Service Name"
          placeholder="e.g., Cricket Pitch"
          required
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'serviceName' ? null : 'serviceName'));
          }}
          showTooltip={activeTooltip === 'serviceName'}
          tooltipText="Give your service a clear, descriptive name that customers will see."
          value={serviceName}
          onChangeText={(text) => {
            setServiceName(text);
            if (errors.serviceName) {
              // Clear error when user types
            }
          }}
          errorText={errors.serviceName}
          marginBottom={vs(4)}
        />
        </View>

        {/* Sport Type */}
        <View style={styles.fieldWrapper}>
        <OnboardingDropdownField
          label="Sport Type"
          placeholder="Select the sport"
          required
          value={sportType}
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'sportType' ? null : 'sportType'));
          }}
          showTooltip={activeTooltip === 'sportType'}
          tooltipText="Choose the sport this turf is designed for (Cricket, Football, Tennis, etc.)."
          onPress={() => {
            setActiveTooltip(null);
            setIsSportTypeModalVisible(true);
          }}
          errorText={errors.sportType}
          marginBottom={vs(4)}
        />
        </View>

        {/* Slot Duration */}
        <View style={styles.fieldWrapper}>
        <OnboardingField
          label="Slot Duration"
          placeholder="e.g., 60"
          required
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'slotDuration' ? null : 'slotDuration'));
          }}
          showTooltip={activeTooltip === 'slotDuration'}
          tooltipText="How long is each booking slot? Enter duration in minutes (e.g., 60 for 1 hour)."
          value={serviceDurationInMinutes}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, '');
            setServiceDurationInMinutes(numericText);
          }}
          keyboardType="number-pad"
          errorText={errors.serviceDurationInMinutes}
          marginBottom={vs(4)}
        />
        </View>

        {/* Buffer Time */}
        <View style={styles.fieldWrapper}>
        <OnboardingField
          label="Buffer Time"
          placeholder="e.g., 15"
          required
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'bufferTime' ? null : 'bufferTime'));
          }}
          showTooltip={activeTooltip === 'bufferTime'}
          tooltipText="Extra time between bookings for cleaning and preparation. Enter in minutes (e.g., 15)."
          value={bufferTimeInMinutes}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, '');
            setBufferTimeInMinutes(numericText);
          }}
          keyboardType="number-pad"
          errorText={errors.bufferTimeInMinutes}
          marginBottom={vs(4)}
        />
        </View>

        {/* Price */}
        <View style={styles.fieldWrapper}>
        <OnboardingField
          label="Price per Slot"
          placeholder="e.g., 500.00"
          required
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'price' ? null : 'price'));
          }}
          showTooltip={activeTooltip === 'price'}
          tooltipText="The price customers will pay for one booking slot (in your local currency)."
          value={price}
          onChangeText={(text) => {
            // Allow decimal numbers
            const numericText = text.replace(/[^0-9.]/g, '');
            // Ensure only one decimal point
            const parts = numericText.split('.');
            const formattedText = parts.length > 2 
              ? parts[0] + '.' + parts.slice(1).join('')
              : numericText;
            setPrice(formattedText);
          }}
          keyboardType="decimal-pad"
          errorText={errors.price}
          marginBottom={vs(4)}
        />
        </View>

        {/* Maximum Players */}
        <View style={styles.fieldWrapper}>
        <OnboardingField
          label="Maximum Players"
          placeholder="e.g., 22"
          required
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'maximumPlayers' ? null : 'maximumPlayers'));
          }}
          showTooltip={activeTooltip === 'maximumPlayers'}
          tooltipText="Maximum number of players allowed in one booking slot (e.g., 22 for cricket, 11 for football)."
          value={maximumPlayers}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, '');
            setMaximumPlayers(numericText);
          }}
          keyboardType="number-pad"
          errorText={errors.maximumPlayers}
          marginBottom={vs(4)}
        />
        </View>

        {/* Allowed Genders */}
        <View style={styles.fieldWrapper}>
        <OnboardingDropdownField
          label="Allowed Genders"
          placeholder="Select who can book"
          required
          value={getGenderLabel(serviceFor)}
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'allowedGenders' ? null : 'allowedGenders'));
          }}
          showTooltip={activeTooltip === 'allowedGenders'}
          tooltipText="Choose if this service is available for Male, Female, or Both genders."
          onPress={() => {
            setActiveTooltip(null);
            setIsGenderModalVisible(true);
          }}
          errorText={errors.serviceFor}
          marginBottom={vs(4)}
        />
        </View>

        {/* Amenities */}
        <View style={styles.fieldWrapper}>
        <OnboardingDropdownField
          label="Amenities"
          placeholder="Select available facilities"
          value={getAmenitiesDisplayText()}
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'amenities' ? null : 'amenities'));
          }}
          showTooltip={activeTooltip === 'amenities'}
          tooltipText="Select all facilities available at your turf (Parking, Changing Room, etc.). Optional."
          onPress={() => {
            setActiveTooltip(null);
            setIsAmenitiesModalVisible(true);
          }}
          marginBottom={vs(4)}
        />
        </View>

      {/* Sport Type Modal */}
      <Modal
        visible={isSportTypeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSportTypeModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsSportTypeModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Sport Type</Text>
                <ScrollView style={styles.amenitiesScrollView}>
                  {SPORT_TYPES.map((sport) => (
                    <TouchableOpacity
                      key={sport}
                      style={[
                        styles.modalOption,
                        sportType === sport && styles.modalOptionSelected,
                      ]}
                      onPress={() => handleSportTypeSelect(sport)}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          sportType === sport && styles.modalOptionTextSelected,
                        ]}
                      >
                        {sport}
                      </Text>
                      {sportType === sport && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Gender Modal */}
      <Modal
        visible={isGenderModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsGenderModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsGenderModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Allowed Genders</Text>
                {GENDER_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.modalOption,
                      serviceFor === option.value && styles.modalOptionSelected,
                    ]}
                    onPress={() => handleGenderSelect(option.value)}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        serviceFor === option.value && styles.modalOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {serviceFor === option.value && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Amenities Modal */}
      <Modal
        visible={isAmenitiesModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAmenitiesModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsAmenitiesModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Amenities</Text>
                <ScrollView style={styles.amenitiesScrollView}>
                  {TURF_AMENITIES.map((amenity) => {
                    const isSelected = amenities.includes(amenity);
                    return (
                      <TouchableOpacity
                        key={amenity}
                        style={[
                          styles.modalOption,
                          isSelected && styles.modalOptionSelected,
                        ]}
                        onPress={() => handleAmenityToggle(amenity)}
                      >
                        <Text
                          style={[
                            styles.modalOptionText,
                            isSelected && styles.modalOptionTextSelected,
                          ]}
                        >
                          {amenity}
                        </Text>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity
                  style={styles.modalDoneButton}
                  onPress={() => setIsAmenitiesModalVisible(false)}
                >
                  <Text style={styles.modalDoneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  fieldWrapper: {
    marginBottom: vs(16),
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
    maxHeight: '80%',
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: vs(16),
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(12),
    paddingHorizontal: hs(16),
    borderRadius: ms(8),
    marginBottom: vs(4),
    backgroundColor: colors.background.primary,
  },
  modalOptionSelected: {
    backgroundColor: colors.button.primary + '20',
  },
  modalOptionText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  modalOptionTextSelected: {
    color: colors.button.primary,
    fontWeight: '600',
  },
  checkmark: {
    color: colors.button.primary,
    fontSize: ms(18),
    fontWeight: 'bold',
  },
  amenitiesScrollView: {
    maxHeight: vs(400),
  },
  modalDoneButton: {
    marginTop: vs(16),
    paddingVertical: vs(12),
    borderRadius: ms(12),
    backgroundColor: colors.button.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDoneButtonText: {
    ...typography.button,
    color: colors.text.white,
  },
});

export default TurfServiceForm;

