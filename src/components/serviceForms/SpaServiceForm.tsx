/**
 * SpaServiceForm Component
 * Form component for creating/editing SPA category services
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
import { THERAPIST_GENDER_OPTIONS, SPA_ROOM_TYPES, SPA_TREATMENT_CATEGORIES } from '../../config/serviceForms';

export interface SpaServiceFormData {
  serviceName: string;
  serviceDurationInMinutes: number;
  bufferTimeInMinutes: number;
  price: number;
  therapistGender: 'male' | 'female';
  maxConcurrentSessions: number;
  roomType?: string;
  treatmentCategory?: string;
}

interface SpaServiceFormProps {
  initialData?: Partial<SpaServiceFormData>;
  onChange: (data: Partial<SpaServiceFormData>) => void;
  errors?: Partial<Record<keyof SpaServiceFormData, string>>;
}

const SpaServiceForm: React.FC<SpaServiceFormProps> = ({
  initialData,
  onChange,
  errors = {},
}) => {
  const [serviceName, setServiceName] = useState(initialData?.serviceName || '');
  const [serviceDurationInMinutes, setServiceDurationInMinutes] = useState<string>(
    initialData?.serviceDurationInMinutes?.toString() || ''
  );
  const [bufferTimeInMinutes, setBufferTimeInMinutes] = useState<string>(
    initialData?.bufferTimeInMinutes?.toString() || ''
  );
  const [price, setPrice] = useState<string>(initialData?.price?.toString() || '');
  const [therapistGender, setTherapistGender] = useState<string | undefined>(
    initialData?.therapistGender
  );
  const [maxConcurrentSessions, setMaxConcurrentSessions] = useState<string>(
    initialData?.maxConcurrentSessions?.toString() || ''
  );
  const [roomType, setRoomType] = useState<string | undefined>(initialData?.roomType);
  const [treatmentCategory, setTreatmentCategory] = useState<string | undefined>(
    initialData?.treatmentCategory
  );

  const [isTherapistGenderModalVisible, setIsTherapistGenderModalVisible] = useState(false);
  const [isRoomTypeModalVisible, setIsRoomTypeModalVisible] = useState(false);
  const [isTreatmentCategoryModalVisible, setIsTreatmentCategoryModalVisible] = useState(false);

  // Tooltips
  type ActiveTooltip =
    | null
    | 'serviceName'
    | 'serviceDuration'
    | 'bufferTime'
    | 'price'
    | 'therapistGender'
    | 'maxConcurrentSessions'
    | 'roomType'
    | 'treatmentCategory';

  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip>(null);

  // Update parent when form data changes
  useEffect(() => {
    const formData: Partial<SpaServiceFormData> = {
      serviceName: serviceName.trim(),
      serviceDurationInMinutes: serviceDurationInMinutes ? parseInt(serviceDurationInMinutes, 10) : 0,
      bufferTimeInMinutes: bufferTimeInMinutes ? parseInt(bufferTimeInMinutes, 10) : 0,
      price: price ? parseFloat(price) : 0,
      therapistGender: (therapistGender as 'male' | 'female') || 'male',
      maxConcurrentSessions: maxConcurrentSessions ? parseInt(maxConcurrentSessions, 10) : 0,
      roomType: roomType || undefined,
      treatmentCategory: treatmentCategory || undefined,
    };
    onChange(formData);
  }, [
    serviceName,
    serviceDurationInMinutes,
    bufferTimeInMinutes,
    price,
    therapistGender,
    maxConcurrentSessions,
    roomType,
    treatmentCategory,
    onChange,
  ]);

  const handleTherapistGenderSelect = (gender: string) => {
    setTherapistGender(gender);
    setIsTherapistGenderModalVisible(false);
  };

  const handleRoomTypeSelect = (type: string) => {
    setRoomType(type);
    setIsRoomTypeModalVisible(false);
  };

  const handleTreatmentCategorySelect = (category: string) => {
    setTreatmentCategory(category);
    setIsTreatmentCategoryModalVisible(false);
  };

  const getTherapistGenderLabel = (value?: string) => {
    if (!value) return undefined;
    const option = THERAPIST_GENDER_OPTIONS.find((opt) => opt.value === value);
    return option?.label;
  };

  return (
    <View style={styles.container}>
      {/* Service Name */}
      <View style={styles.fieldWrapper}>
        <OnboardingField
          label="Service Name"
          placeholder="e.g., Swedish Massage"
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

      {/* Service Duration */}
      <View style={styles.fieldWrapper}>
        <OnboardingField
          label="Service Duration"
          placeholder="e.g., 60"
          required
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'serviceDuration' ? null : 'serviceDuration'));
          }}
          showTooltip={activeTooltip === 'serviceDuration'}
          tooltipText="How long does this service take? Enter duration in minutes (e.g., 60 for 1 hour)."
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
          tooltipText="Extra time between appointments to prepare for the next customer. Enter in minutes (e.g., 15)."
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
          label="Price"
          placeholder="e.g., 1000.00"
          required
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'price' ? null : 'price'));
          }}
          showTooltip={activeTooltip === 'price'}
          tooltipText="The price customers will pay for this service session (in your local currency)."
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

      {/* Therapist Gender */}
      <View style={styles.fieldWrapper}>
        <OnboardingDropdownField
          label="Therapist Gender"
          placeholder="Select therapist gender"
          required
          value={getTherapistGenderLabel(therapistGender)}
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'therapistGender' ? null : 'therapistGender'));
          }}
          showTooltip={activeTooltip === 'therapistGender'}
          tooltipText="Select the gender of the therapist who will provide this service."
          onPress={() => {
            setActiveTooltip(null);
            setIsTherapistGenderModalVisible(true);
          }}
          errorText={errors.therapistGender}
          marginBottom={vs(4)}
        />
      </View>

      {/* Max Concurrent Sessions */}
      <View style={styles.fieldWrapper}>
        <OnboardingField
          label="Max Concurrent Sessions"
          placeholder="e.g., 2"
          required
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'maxConcurrentSessions' ? null : 'maxConcurrentSessions'));
          }}
          showTooltip={activeTooltip === 'maxConcurrentSessions'}
          tooltipText="Maximum number of sessions that can run simultaneously for this service."
          value={maxConcurrentSessions}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, '');
            setMaxConcurrentSessions(numericText);
          }}
          keyboardType="number-pad"
          errorText={errors.maxConcurrentSessions}
          marginBottom={vs(4)}
        />
      </View>

      {/* Room Type */}
      <View style={styles.fieldWrapper}>
        <OnboardingDropdownField
          label="Room Type"
          placeholder="Select room type (optional)"
          value={roomType}
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'roomType' ? null : 'roomType'));
          }}
          showTooltip={activeTooltip === 'roomType'}
          tooltipText="Select the type of room used for this service. Optional."
          onPress={() => {
            setActiveTooltip(null);
            setIsRoomTypeModalVisible(true);
          }}
          marginBottom={vs(4)}
        />
      </View>

      {/* Treatment Category */}
      <View style={styles.fieldWrapper}>
        <OnboardingDropdownField
          label="Treatment Category"
          placeholder="Select treatment category (optional)"
          value={treatmentCategory}
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'treatmentCategory' ? null : 'treatmentCategory'));
          }}
          showTooltip={activeTooltip === 'treatmentCategory'}
          tooltipText="Select the category of treatment. Optional."
          onPress={() => {
            setActiveTooltip(null);
            setIsTreatmentCategoryModalVisible(true);
          }}
          marginBottom={vs(4)}
        />
      </View>

      {/* Therapist Gender Modal */}
      <Modal
        visible={isTherapistGenderModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsTherapistGenderModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsTherapistGenderModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Therapist Gender</Text>
                {THERAPIST_GENDER_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.modalOption,
                      therapistGender === option.value && styles.modalOptionSelected,
                    ]}
                    onPress={() => handleTherapistGenderSelect(option.value)}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        therapistGender === option.value && styles.modalOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {therapistGender === option.value && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Room Type Modal */}
      <Modal
        visible={isRoomTypeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsRoomTypeModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsRoomTypeModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Room Type</Text>
                <ScrollView style={styles.amenitiesScrollView}>
                  {SPA_ROOM_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.modalOption,
                        roomType === type && styles.modalOptionSelected,
                      ]}
                      onPress={() => handleRoomTypeSelect(type)}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          roomType === type && styles.modalOptionTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                      {roomType === type && (
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

      {/* Treatment Category Modal */}
      <Modal
        visible={isTreatmentCategoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsTreatmentCategoryModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsTreatmentCategoryModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Treatment Category</Text>
                <ScrollView style={styles.amenitiesScrollView}>
                  {SPA_TREATMENT_CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.modalOption,
                        treatmentCategory === category && styles.modalOptionSelected,
                      ]}
                      onPress={() => handleTreatmentCategorySelect(category)}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          treatmentCategory === category && styles.modalOptionTextSelected,
                        ]}
                      >
                        {category}
                      </Text>
                      {treatmentCategory === category && (
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
});

export default SpaServiceForm;

