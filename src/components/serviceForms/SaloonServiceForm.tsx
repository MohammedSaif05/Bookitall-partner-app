/**
 * SaloonServiceForm Component
 * Form component for creating/editing Saloon category services
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
  ActivityIndicator,
} from 'react-native';
import { OnboardingField, OnboardingDropdownField } from '../onboarding';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs, ms } from '../../theme/scaling';
import { GENDER_OPTIONS, SALOON_CATEGORY_LABELS } from '../../config/serviceForms';
import type { StaffMember } from '../../services/api/vendor.service';

export interface SaloonServiceFormData {
  serviceName: string;
  serviceDurationInMinutes: number;
  bufferTimeInMinutes: number;
  price: number;
  serviceFor: 'male' | 'female' | 'both' | 'mixed';
  maxConcurrentBookings: number;
  assignedStaff?: string[];
  categoryLabel?: string;
}

interface SaloonServiceFormProps {
  initialData?: Partial<SaloonServiceFormData>;
  onChange: (data: Partial<SaloonServiceFormData>) => void;
  errors?: Partial<Record<keyof SaloonServiceFormData, string>>;
  staffList?: StaffMember[];
  onFetchStaff?: () => void;
  loadingStaff?: boolean;
}

const SaloonServiceForm: React.FC<SaloonServiceFormProps> = ({
  initialData,
  onChange,
  errors = {},
  staffList = [],
  onFetchStaff,
  loadingStaff = false,
}) => {
  const [serviceName, setServiceName] = useState(initialData?.serviceName || '');
  const [serviceDurationInMinutes, setServiceDurationInMinutes] = useState<string>(
    initialData?.serviceDurationInMinutes?.toString() || ''
  );
  const [bufferTimeInMinutes, setBufferTimeInMinutes] = useState<string>(
    initialData?.bufferTimeInMinutes?.toString() || ''
  );
  const [price, setPrice] = useState<string>(initialData?.price?.toString() || '');
  const [serviceFor, setServiceFor] = useState<string | undefined>(
    initialData?.serviceFor || undefined
  );
  const [maxConcurrentBookings, setMaxConcurrentBookings] = useState<string>(
    initialData?.maxConcurrentBookings?.toString() || ''
  );
  const [assignedStaff, setAssignedStaff] = useState<string[]>(initialData?.assignedStaff || []);
  const [categoryLabel, setCategoryLabel] = useState<string | undefined>(
    initialData?.categoryLabel
  );

  const [isGenderModalVisible, setIsGenderModalVisible] = useState(false);
  const [isCategoryLabelModalVisible, setIsCategoryLabelModalVisible] = useState(false);
  const [isStaffModalVisible, setIsStaffModalVisible] = useState(false);

  // Tooltips
  type ActiveTooltip =
    | null
    | 'serviceName'
    | 'serviceDuration'
    | 'bufferTime'
    | 'price'
    | 'serviceFor'
    | 'maxConcurrentBookings'
    | 'assignedStaff'
    | 'categoryLabel';

  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip>(null);

  // Update parent when form data changes
  useEffect(() => {
    const formData: Partial<SaloonServiceFormData> = {
      serviceName: serviceName.trim(),
      serviceDurationInMinutes: serviceDurationInMinutes ? parseInt(serviceDurationInMinutes, 10) : 0,
      bufferTimeInMinutes: bufferTimeInMinutes ? parseInt(bufferTimeInMinutes, 10) : 0,
      price: price ? parseFloat(price) : 0,
      serviceFor: (serviceFor as 'male' | 'female' | 'both' | 'mixed') || 'both',
      maxConcurrentBookings: maxConcurrentBookings ? parseInt(maxConcurrentBookings, 10) : 0,
      assignedStaff: assignedStaff.length > 0 ? assignedStaff : undefined,
      categoryLabel: categoryLabel || undefined,
    };
    onChange(formData);
  }, [
    serviceName,
    serviceDurationInMinutes,
    bufferTimeInMinutes,
    price,
    serviceFor,
    maxConcurrentBookings,
    assignedStaff,
    categoryLabel,
    onChange,
  ]);

  const handleGenderSelect = (gender: string) => {
    setServiceFor(gender);
    setIsGenderModalVisible(false);
  };

  const handleCategoryLabelSelect = (label: string) => {
    setCategoryLabel(label);
    setIsCategoryLabelModalVisible(false);
  };

  const handleStaffToggle = (staffName: string) => {
    setAssignedStaff((prev) => {
      if (prev.includes(staffName)) {
        return prev.filter((name) => name !== staffName);
      } else {
        return [...prev, staffName];
      }
    });
  };

  const handleStaffSelectAll = () => {
    if (assignedStaff.length === staffList.length) {
      setAssignedStaff([]);
    } else {
      setAssignedStaff(staffList.map((staff) => staff.name));
    }
  };

  const handleStaffModalOpen = () => {
    setIsStaffModalVisible(true);
    if (onFetchStaff && staffList.length === 0) {
      onFetchStaff();
    }
  };

  const getGenderLabel = (value?: string) => {
    if (!value) return undefined;
    const option = GENDER_OPTIONS.find((opt) => opt.value === value);
    return option?.label;
  };

  const getStaffDisplayText = () => {
    if (assignedStaff.length === 0) {
      return undefined;
    }
    if (assignedStaff.length === 1) {
      return assignedStaff[0];
    }
    return `${assignedStaff.length} staff selected`;
  };

  return (
    <View style={styles.container}>
      {/* Service Name */}
      <View style={styles.fieldWrapper}>
        <OnboardingField
          label="Service Name"
          placeholder="e.g., Haircut & Styling"
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
          placeholder="e.g., 500.00"
          required
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'price' ? null : 'price'));
          }}
          showTooltip={activeTooltip === 'price'}
          tooltipText="The price customers will pay for this service (in your local currency)."
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

      {/* Service For */}
      <View style={styles.fieldWrapper}>
        <OnboardingDropdownField
          label="Service For"
          placeholder="Select who can book"
          required
          value={getGenderLabel(serviceFor)}
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'serviceFor' ? null : 'serviceFor'));
          }}
          showTooltip={activeTooltip === 'serviceFor'}
          tooltipText="Choose if this service is available for Male, Female, or Both genders."
          onPress={() => {
            setActiveTooltip(null);
            setIsGenderModalVisible(true);
          }}
          errorText={errors.serviceFor}
          marginBottom={vs(4)}
        />
      </View>

      {/* Max Concurrent Bookings */}
      <View style={styles.fieldWrapper}>
        <OnboardingField
          label="Max Concurrent Bookings"
          placeholder="e.g., 3"
          required
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'maxConcurrentBookings' ? null : 'maxConcurrentBookings'));
          }}
          showTooltip={activeTooltip === 'maxConcurrentBookings'}
          tooltipText="Maximum number of customers that can book this service at the same time slot."
          value={maxConcurrentBookings}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, '');
            setMaxConcurrentBookings(numericText);
          }}
          keyboardType="number-pad"
          errorText={errors.maxConcurrentBookings}
          marginBottom={vs(4)}
        />
      </View>

      {/* Assigned Staff */}
      <View style={styles.fieldWrapper}>
        <OnboardingDropdownField
          label="Assigned Staff"
          placeholder="Select staff (optional)"
          value={getStaffDisplayText()}
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'assignedStaff' ? null : 'assignedStaff'));
          }}
          showTooltip={activeTooltip === 'assignedStaff'}
          tooltipText="Select staff members who can provide this service. Optional."
          onPress={handleStaffModalOpen}
          marginBottom={vs(4)}
        />
      </View>

      {/* Category Label */}
      <View style={styles.fieldWrapper}>
        <OnboardingDropdownField
          label="Category Label"
          placeholder="Select category (optional)"
          value={categoryLabel}
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'categoryLabel' ? null : 'categoryLabel'));
          }}
          showTooltip={activeTooltip === 'categoryLabel'}
          tooltipText="Select a category label for this service (e.g., Hair, Facial). Optional."
          onPress={() => {
            setActiveTooltip(null);
            setIsCategoryLabelModalVisible(true);
          }}
          marginBottom={vs(4)}
        />
      </View>

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
                <Text style={styles.modalTitle}>Select Service For</Text>
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

      {/* Category Label Modal */}
      <Modal
        visible={isCategoryLabelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCategoryLabelModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsCategoryLabelModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Category Label</Text>
                <ScrollView style={styles.amenitiesScrollView}>
                  {SALOON_CATEGORY_LABELS.map((label) => (
                    <TouchableOpacity
                      key={label}
                      style={[
                        styles.modalOption,
                        categoryLabel === label && styles.modalOptionSelected,
                      ]}
                      onPress={() => handleCategoryLabelSelect(label)}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          categoryLabel === label && styles.modalOptionTextSelected,
                        ]}
                      >
                        {label}
                      </Text>
                      {categoryLabel === label && (
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

      {/* Staff Selection Modal */}
      <Modal
        visible={isStaffModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsStaffModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsStaffModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Staff</Text>
                  {staffList.length > 0 && (
                    <TouchableOpacity
                      style={styles.selectAllButton}
                      activeOpacity={0.8}
                      onPress={handleStaffSelectAll}
                    >
                      <Text style={styles.selectAllText}>
                        {assignedStaff.length === staffList.length ? 'Deselect all' : 'Select all'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {loadingStaff ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.button.primary} />
                    <Text style={styles.loadingText}>Loading staff...</Text>
                  </View>
                ) : staffList.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No active staff available</Text>
                  </View>
                ) : (
                  <ScrollView style={styles.amenitiesScrollView} showsVerticalScrollIndicator={false}>
                    {staffList.map((staff) => {
                      const isSelected = assignedStaff.includes(staff.name);
                      return (
                        <TouchableOpacity
                          key={staff.name}
                          style={[
                            styles.modalOption,
                            isSelected && styles.modalOptionSelected,
                          ]}
                          onPress={() => handleStaffToggle(staff.name)}
                        >
                          <Text
                            style={[
                              styles.modalOptionText,
                              isSelected && styles.modalOptionTextSelected,
                            ]}
                          >
                            {staff.name}
                          </Text>
                          {isSelected && <Text style={styles.checkmark}>✓</Text>}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
                
                <TouchableOpacity
                  style={styles.modalDoneButton}
                  onPress={() => setIsStaffModalVisible(false)}
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(16),
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
  selectAllButton: {
    paddingVertical: vs(4),
    paddingHorizontal: hs(8),
  },
  selectAllText: {
    ...typography.body,
    color: colors.button.primary,
    fontSize: ms(14),
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: vs(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: vs(12),
  },
  emptyContainer: {
    paddingVertical: vs(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
  },
});

export default SaloonServiceForm;

