/**
 * BeautyParlourServiceForm Component
 * Form component for creating/editing Beauty Parlour category services
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
import { GENDER_OPTIONS, BEAUTICIAN_LEVELS, BEAUTY_PARLOUR_TREATMENT_CATEGORIES, BEAUTY_PRODUCTS } from '../../config/serviceForms';

export interface BeautyParlourServiceFormData {
  serviceName: string;
  serviceDurationInMinutes: number;
  bufferTimeInMinutes: number;
  price: number;
  serviceFor: 'male' | 'female' | 'both';
  maxConcurrentSessions: number;
  beauticianLevel?: string;
  treatmentCategory?: string;
  productsUsed?: string[];
}

interface BeautyParlourServiceFormProps {
  initialData?: Partial<BeautyParlourServiceFormData>;
  onChange: (data: Partial<BeautyParlourServiceFormData>) => void;
  errors?: Partial<Record<keyof BeautyParlourServiceFormData, string>>;
}

const BeautyParlourServiceForm: React.FC<BeautyParlourServiceFormProps> = ({
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
  const [serviceFor, setServiceFor] = useState<string | undefined>(
    initialData?.serviceFor
  );
  const [maxConcurrentSessions, setMaxConcurrentSessions] = useState<string>(
    initialData?.maxConcurrentSessions?.toString() || ''
  );
  const [beauticianLevel, setBeauticianLevel] = useState<string | undefined>(
    initialData?.beauticianLevel
  );
  const [treatmentCategory, setTreatmentCategory] = useState<string | undefined>(
    initialData?.treatmentCategory
  );
  const [productsUsed, setProductsUsed] = useState<string[]>(
    initialData?.productsUsed || []
  );

  const [isServiceForModalVisible, setIsServiceForModalVisible] = useState(false);
  const [isBeauticianLevelModalVisible, setIsBeauticianLevelModalVisible] = useState(false);
  const [isTreatmentCategoryModalVisible, setIsTreatmentCategoryModalVisible] = useState(false);
  const [isProductsModalVisible, setIsProductsModalVisible] = useState(false);

  // Tooltips
  type ActiveTooltip =
    | null
    | 'serviceName'
    | 'serviceDuration'
    | 'bufferTime'
    | 'price'
    | 'serviceFor'
    | 'maxConcurrentSessions'
    | 'beauticianLevel'
    | 'treatmentCategory'
    | 'productsUsed';

  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip>(null);

  // Update parent when form data changes
  useEffect(() => {
    const formData: Partial<BeautyParlourServiceFormData> = {
      serviceName: serviceName.trim(),
      serviceDurationInMinutes: serviceDurationInMinutes ? parseInt(serviceDurationInMinutes, 10) : 0,
      bufferTimeInMinutes: bufferTimeInMinutes ? parseInt(bufferTimeInMinutes, 10) : 0,
      price: price ? parseFloat(price) : 0,
      serviceFor: (serviceFor as 'male' | 'female' | 'both') || 'both',
      maxConcurrentSessions: maxConcurrentSessions ? parseInt(maxConcurrentSessions, 10) : 0,
      beauticianLevel: beauticianLevel || undefined,
      treatmentCategory: treatmentCategory || undefined,
      productsUsed: productsUsed.length > 0 ? productsUsed : undefined,
    };
    onChange(formData);
  }, [
    serviceName,
    serviceDurationInMinutes,
    bufferTimeInMinutes,
    price,
    serviceFor,
    maxConcurrentSessions,
    beauticianLevel,
    treatmentCategory,
    productsUsed,
    onChange,
  ]);

  const handleServiceForSelect = (gender: string) => {
    setServiceFor(gender);
    setIsServiceForModalVisible(false);
  };

  const handleBeauticianLevelSelect = (level: string) => {
    setBeauticianLevel(level);
    setIsBeauticianLevelModalVisible(false);
  };

  const handleTreatmentCategorySelect = (category: string) => {
    setTreatmentCategory(category);
    setIsTreatmentCategoryModalVisible(false);
  };

  const handleProductToggle = (product: string) => {
    setProductsUsed((prev) => {
      if (prev.includes(product)) {
        return prev.filter((p) => p !== product);
      } else {
        return [...prev, product];
      }
    });
  };

  const getServiceForLabel = (value?: string) => {
    if (!value) return undefined;
    const option = GENDER_OPTIONS.find((opt) => opt.value === value);
    return option?.label;
  };

  const getProductsDisplayText = () => {
    if (productsUsed.length === 0) return undefined;
    if (productsUsed.length === 1) return productsUsed[0];
    return `${productsUsed.length} products selected`;
  };

  return (
    <View style={styles.container}>
      {/* Service Name */}
      <View style={styles.fieldWrapper}>
        <OnboardingField
          label="Service Name"
          placeholder="e.g., Deep Cleansing Facial"
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

      {/* Service For */}
      <View style={styles.fieldWrapper}>
        <OnboardingDropdownField
          label="Service For"
          placeholder="Select gender"
          required
          value={getServiceForLabel(serviceFor)}
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'serviceFor' ? null : 'serviceFor'));
          }}
          showTooltip={activeTooltip === 'serviceFor'}
          tooltipText="Select the gender this service is available for (Male, Female, or Both)."
          onPress={() => {
            setActiveTooltip(null);
            setIsServiceForModalVisible(true);
          }}
          errorText={errors.serviceFor}
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

      {/* Beautician Level */}
      <View style={styles.fieldWrapper}>
        <OnboardingDropdownField
          label="Beautician Level"
          placeholder="Select beautician level (optional)"
          value={beauticianLevel}
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'beauticianLevel' ? null : 'beauticianLevel'));
          }}
          showTooltip={activeTooltip === 'beauticianLevel'}
          tooltipText="Select the level of beautician who will provide this service. Optional."
          onPress={() => {
            setActiveTooltip(null);
            setIsBeauticianLevelModalVisible(true);
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

      {/* Products Used */}
      <View style={styles.fieldWrapper}>
        <OnboardingDropdownField
          label="Products Used"
          placeholder="Select products (optional)"
          value={getProductsDisplayText()}
          showInfoIcon
          onInfoPress={() => {
            setActiveTooltip((prev) => (prev === 'productsUsed' ? null : 'productsUsed'));
          }}
          showTooltip={activeTooltip === 'productsUsed'}
          tooltipText="Select the beauty products used for this service. You can select multiple products. Optional."
          onPress={() => {
            setActiveTooltip(null);
            setIsProductsModalVisible(true);
          }}
          marginBottom={vs(4)}
        />
      </View>

      {/* Service For Modal */}
      <Modal
        visible={isServiceForModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsServiceForModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsServiceForModalVisible(false)}>
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
                    onPress={() => handleServiceForSelect(option.value)}
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

      {/* Beautician Level Modal */}
      <Modal
        visible={isBeauticianLevelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsBeauticianLevelModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsBeauticianLevelModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Beautician Level</Text>
                <ScrollView style={styles.amenitiesScrollView}>
                  {BEAUTICIAN_LEVELS.map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.modalOption,
                        beauticianLevel === level && styles.modalOptionSelected,
                      ]}
                      onPress={() => handleBeauticianLevelSelect(level)}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          beauticianLevel === level && styles.modalOptionTextSelected,
                        ]}
                      >
                        {level}
                      </Text>
                      {beauticianLevel === level && (
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
                  {BEAUTY_PARLOUR_TREATMENT_CATEGORIES.map((category) => (
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

      {/* Products Used Modal */}
      <Modal
        visible={isProductsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsProductsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsProductsModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Products Used</Text>
                <ScrollView style={styles.amenitiesScrollView}>
                  {BEAUTY_PRODUCTS.map((product) => {
                    const isSelected = productsUsed.includes(product);
                    return (
                      <TouchableOpacity
                        key={product}
                        style={[
                          styles.modalOption,
                          isSelected && styles.modalOptionSelected,
                        ]}
                        onPress={() => handleProductToggle(product)}
                      >
                        <Text
                          style={[
                            styles.modalOptionText,
                            isSelected && styles.modalOptionTextSelected,
                          ]}
                        >
                          {product}
                        </Text>
                        {isSelected && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity
                  style={styles.modalDoneButton}
                  onPress={() => setIsProductsModalVisible(false)}
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

export default BeautyParlourServiceForm;

