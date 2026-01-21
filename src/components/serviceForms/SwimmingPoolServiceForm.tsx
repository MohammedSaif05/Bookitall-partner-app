/**
 * SwimmingPoolServiceForm Component
 * Form component for creating/editing Swimming Pool category services
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
import { GENDER_OPTIONS, AGE_GROUP_OPTIONS, SWIMMING_POOL_AMENITIES } from '../../config/serviceForms';

export interface SwimmingPoolServiceFormData {
  serviceName: string;
  slotDurationInMinutes: number;
  bufferTimeInMinutes: number;
  pricePerPerson: number;
  maxCapacity: number;
  ageGroup: 'adults' | 'children';
  allowedGenders: 'male' | 'female' | 'both' | 'mixed';
  dressCode?: string;
  amenities?: string[];
}

interface SwimmingPoolServiceFormProps {
  initialData?: Partial<SwimmingPoolServiceFormData>;
  onChange: (data: Partial<SwimmingPoolServiceFormData>) => void;
  errors?: Partial<Record<keyof SwimmingPoolServiceFormData, string>>;
}

const SwimmingPoolServiceForm: React.FC<SwimmingPoolServiceFormProps> = ({
  initialData,
  onChange,
  errors = {},
}) => {
  const [serviceName, setServiceName] = useState(initialData?.serviceName || '');
  const [slotDurationInMinutes, setSlotDurationInMinutes] = useState<string>(
    initialData?.slotDurationInMinutes?.toString() || ''
  );
  const [bufferTimeInMinutes, setBufferTimeInMinutes] = useState<string>(
    initialData?.bufferTimeInMinutes?.toString() || ''
  );
  const [pricePerPerson, setPricePerPerson] = useState<string>(
    initialData?.pricePerPerson?.toString() || ''
  );
  const [maxCapacity, setMaxCapacity] = useState<string>(
    initialData?.maxCapacity?.toString() || ''
  );
  const [ageGroup, setAgeGroup] = useState<string | undefined>(
    initialData?.ageGroup
  );
  const [allowedGenders, setAllowedGenders] = useState<string | undefined>(
    initialData?.allowedGenders
  );
  const [dressCode, setDressCode] = useState<string>(initialData?.dressCode || '');
  const [amenities, setAmenities] = useState<string[]>(initialData?.amenities || []);

  const [isAgeGroupModalVisible, setIsAgeGroupModalVisible] = useState(false);
  const [isGenderModalVisible, setIsGenderModalVisible] = useState(false);
  const [isAmenitiesModalVisible, setIsAmenitiesModalVisible] = useState(false);

  // Tooltips
  type ActiveTooltip =
    | null
    | 'serviceName'
    | 'slotDuration'
    | 'bufferTime'
    | 'pricePerPerson'
    | 'maxCapacity'
    | 'ageGroup'
    | 'allowedGenders'
    | 'dressCode'
    | 'amenities';

  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip>(null);

  // Update parent when form data changes
  useEffect(() => {
    const formData: Partial<SwimmingPoolServiceFormData> = {
      serviceName: serviceName.trim(),
      slotDurationInMinutes: slotDurationInMinutes ? parseInt(slotDurationInMinutes, 10) : 0,
      bufferTimeInMinutes: bufferTimeInMinutes ? parseInt(bufferTimeInMinutes, 10) : 0,
      pricePerPerson: pricePerPerson ? parseFloat(pricePerPerson) : 0,
      maxCapacity: maxCapacity ? parseInt(maxCapacity, 10) : 0,
      ageGroup: (ageGroup as 'adults' | 'children') || 'adults',
      allowedGenders: (allowedGenders as 'male' | 'female' | 'both' | 'mixed') || 'both',
      dressCode: dressCode.trim() || undefined,
      amenities: amenities.length > 0 ? amenities : undefined,
    };
    onChange(formData);
  }, [
    serviceName,
    slotDurationInMinutes,
    bufferTimeInMinutes,
    pricePerPerson,
    maxCapacity,
    ageGroup,
    allowedGenders,
    dressCode,
    amenities,
    onChange,
  ]);

  const handleAgeGroupSelect = (group: string) => {
    setAgeGroup(group);
    setIsAgeGroupModalVisible(false);
  };

  const handleGenderSelect = (gender: string) => {
    setAllowedGenders(gender);
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

  const getAgeGroupLabel = (value?: string) => {
    if (!value) return undefined;
    const option = AGE_GROUP_OPTIONS.find((opt) => opt.value === value);
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
          placeholder="e.g., Swimming Pool Booking"
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
          value={slotDurationInMinutes}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, '');
            setSlotDurationInMinutes(numericText);
          }}
          keyboardType="number-pad"
          errorText={errors.slotDurationInMinutes}
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

      {/* Price Per Person */}
      <View style={styles.fieldWrapper}>
        <OnboardingField
          label="Price Per Person"
          placeholder="e.g., 200.00"
          required
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'pricePerPerson' ? null : 'pricePerPerson'));
          }}
          showTooltip={activeTooltip === 'pricePerPerson'}
          tooltipText="The price each person will pay for one booking slot (in your local currency)."
          value={pricePerPerson}
          onChangeText={(text) => {
            // Allow decimal numbers
            const numericText = text.replace(/[^0-9.]/g, '');
            // Ensure only one decimal point
            const parts = numericText.split('.');
            const formattedText = parts.length > 2 
              ? parts[0] + '.' + parts.slice(1).join('')
              : numericText;
            setPricePerPerson(formattedText);
          }}
          keyboardType="decimal-pad"
          errorText={errors.pricePerPerson}
          marginBottom={vs(4)}
        />
      </View>

      {/* Max Capacity */}
      <View style={styles.fieldWrapper}>
        <OnboardingField
          label="Max Capacity"
          placeholder="e.g., 20"
          required
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'maxCapacity' ? null : 'maxCapacity'));
          }}
          showTooltip={activeTooltip === 'maxCapacity'}
          tooltipText="Maximum number of people allowed in the pool at one time."
          value={maxCapacity}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, '');
            setMaxCapacity(numericText);
          }}
          keyboardType="number-pad"
          errorText={errors.maxCapacity}
          marginBottom={vs(4)}
        />
      </View>

      {/* Age Group */}
      <View style={styles.fieldWrapper}>
        <OnboardingDropdownField
          label="Age Group"
          placeholder="Select age group"
          required
          value={getAgeGroupLabel(ageGroup)}
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'ageGroup' ? null : 'ageGroup'));
          }}
          showTooltip={activeTooltip === 'ageGroup'}
          tooltipText="Select if this service is for Adults or Children."
          onPress={() => {
            setActiveTooltip(null);
            setIsAgeGroupModalVisible(true);
          }}
          errorText={errors.ageGroup}
          marginBottom={vs(4)}
        />
      </View>

      {/* Allowed Genders */}
      <View style={styles.fieldWrapper}>
        <OnboardingDropdownField
          label="Allowed Genders"
          placeholder="Select who can book"
          required
          value={getGenderLabel(allowedGenders)}
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
          errorText={errors.allowedGenders}
          marginBottom={vs(4)}
        />
      </View>

      {/* Dress Code */}
      <View style={styles.fieldWrapper}>
        <OnboardingField
          label="Dress Code"
          placeholder="e.g., Swimwear required (optional)"
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'dressCode' ? null : 'dressCode'));
          }}
          showTooltip={activeTooltip === 'dressCode'}
          tooltipText="Specify any dress code requirements for this service. Optional."
          value={dressCode}
          onChangeText={(text) => {
            setDressCode(text);
          }}
          errorText={errors.dressCode}
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
          tooltipText="Select all facilities available at your swimming pool. Optional."
          onPress={() => {
            setActiveTooltip(null);
            setIsAmenitiesModalVisible(true);
          }}
          marginBottom={vs(4)}
        />
      </View>

      {/* Age Group Modal */}
      <Modal
        visible={isAgeGroupModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAgeGroupModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsAgeGroupModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Age Group</Text>
                {AGE_GROUP_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.modalOption,
                      ageGroup === option.value && styles.modalOptionSelected,
                    ]}
                    onPress={() => handleAgeGroupSelect(option.value)}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        ageGroup === option.value && styles.modalOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {ageGroup === option.value && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
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
                      allowedGenders === option.value && styles.modalOptionSelected,
                    ]}
                    onPress={() => handleGenderSelect(option.value)}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        allowedGenders === option.value && styles.modalOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {allowedGenders === option.value && (
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
                  {SWIMMING_POOL_AMENITIES.map((amenity) => {
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

export default SwimmingPoolServiceForm;

