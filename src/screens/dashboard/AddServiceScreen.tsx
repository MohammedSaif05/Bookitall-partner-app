/**
 * AddServiceScreen
 * Screen for adding a new service
 *
 * @format
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Dimensions,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs, ms } from '../../theme/scaling';
import BackIcon from '../../assets/svg/icons/back.svg';
import InfoIcon from '../../assets/svg/icons/info.svg';
import UploadDocumentIcon from '../../assets/svg/icons/upload_document.svg';
import { OnboardingCTAButton, OnboardingDropdownField } from '../../components/onboarding';
import { TurfServiceForm, type TurfServiceFormData, SaloonServiceForm, type SaloonServiceFormData, SwimmingPoolServiceForm, type SwimmingPoolServiceFormData } from '../../components/serviceForms';
import type { RootStackScreenProps } from '../../navigation/types';
import { vendorService, type StaffMember, type VendorData } from '../../services/api/vendor.service';
import { userStorage } from '../../utils/storage';
import { showError, showSuccess } from '../../utils/flashMessage';
import type { CustomAxiosError } from '../../types/api';

type AddServiceScreenProps = RootStackScreenProps<'AddService'>;

const AddServiceScreen: React.FC<AddServiceScreenProps> = ({ navigation, route }) => {
  // Check if we're in edit mode
  const editService = route.params?.service;
  const isEditMode = !!editService;
  const serviceId = editService?.serviceId;

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [serviceName, setServiceName] = useState(editService?.serviceName || '');
  const [category, setCategory] = useState<string | undefined>(editService?.category || undefined);
  const [description, setDescription] = useState(editService?.description || '');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [showCategoryTooltip, setShowCategoryTooltip] = useState(false);
  const [showBufferTimeTooltip, setShowBufferTimeTooltip] = useState(false);
  const [showMaxCustomersTooltip, setShowMaxCustomersTooltip] = useState(false);
  const [showApplicableToTooltip, setShowApplicableToTooltip] = useState(false);
  const [price, setPrice] = useState(editService?.serviceCost?.toString() || editService?.pricePerSlot?.toString() || '');
  
  // Handle duration - check if it's in predefined list, otherwise use Custom
  const predefinedDurations = ['10', '15', '30', '45', '60'];
  const initialDuration = editService?.serviceDuration ? editService.serviceDuration.toString() : '';
  const isCustomDuration = initialDuration && !predefinedDurations.includes(initialDuration);
  const [selectedDuration, setSelectedDuration] = useState<string>(
    isCustomDuration ? 'Custom' : initialDuration
  );
  const [customDuration, setCustomDuration] = useState<string>(
    isCustomDuration ? initialDuration : ''
  );
  
  // Handle buffer time - check if it's in predefined list, otherwise use Custom
  const predefinedBuffers = ['0', '5', '10', '15', '30'];
  const initialBuffer = editService?.bufferTime ? editService.bufferTime.toString() : '';
  const isCustomBuffer = initialBuffer && !predefinedBuffers.includes(initialBuffer);
  const [selectedBuffer, setSelectedBuffer] = useState<string>(
    isCustomBuffer ? 'Custom' : initialBuffer
  );
  const [customBuffer, setCustomBuffer] = useState<string>(
    isCustomBuffer ? initialBuffer : ''
  );
  const [assignAllStaff, setAssignAllStaff] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>(editService?.assignedStaff || []);
  const [isStaffModalVisible, setIsStaffModalVisible] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  // Step 2 - Capacity
  const [maxCustomers, setMaxCustomers] = useState<string>(
    editService?.maximumNo ? editService.maximumNo.toString() : '1'
  );
  // Map gender to applicableTo
  const genderToApplicableTo: Record<string, string> = {
    both: 'Both',
    male: 'Male',
    female: 'Female',
  };
  const [applicableTo, setApplicableTo] = useState<string>(
    editService?.gender ? genderToApplicableTo[editService.gender] || 'Both' : 'Both'
  );
  const [isMaxCustomersModalVisible, setIsMaxCustomersModalVisible] = useState(false);
  const [isApplicableToModalVisible, setIsApplicableToModalVisible] = useState(false);
  // Step 2 - Images
  const [primaryImage, setPrimaryImage] = useState<string | null>(editService?.serviceImage || null);
  const originalImageUri = editService?.serviceImage || null;
  // Service active status
  const [isActive] = useState<boolean>(editService?.isActive ?? true);
  // const [galleryImages, setGalleryImages] = useState<string[]>([]); // Will be used for gallery images
  const [savingService, setSavingService] = useState(false);
  const [vendorData, setVendorData] = useState<VendorData | null>(null);

  const DESCRIPTION_MAX_LENGTH = 200;

  // Fetch vendor data to check business category
  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const userId = await userStorage.getUserId();
        if (userId) {
          const response = await vendorService.getVendorByUserId(userId);
          if (response.success && response.data) {
            setVendorData(response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching vendor data:', error);
      }
    };
    fetchVendorData();
  }, []);

  // Check if staff assignment should be hidden based on business category
  const shouldHideStaffAssignment = () => {
    if (!vendorData?.businessCategory) return false;
    const businessCategory = vendorData.businessCategory.toLowerCase();
    return businessCategory === 'turf' || businessCategory === 'swimming pool';
  };

  // Check if we should use category-based form (e.g., Turf)
  const isTurfCategory = () => {
    // Check editService category first (for edit mode)
    if (editService?.category) {
      return editService.category.toLowerCase() === 'turf';
    }
    // Check vendorData business category (for add mode)
    if (!vendorData?.businessCategory) return false;
    return vendorData.businessCategory.toLowerCase() === 'turf';
  };

  // Check if we should use category-based form (e.g., Saloon)
  const isSaloonCategory = () => {
    // Check editService category first (for edit mode)
    if (editService?.category) {
      return editService.category.toLowerCase() === 'saloon';
    }
    // Check vendorData business category (for add mode)
    if (!vendorData?.businessCategory) return false;
    return vendorData.businessCategory.toLowerCase() === 'saloon';
  };

  // Check if we should use category-based form (e.g., Swimming Pool)
  const isSwimmingPoolCategory = () => {
    // Check editService category first (for edit mode)
    if (editService?.category) {
      return editService.category.toLowerCase() === 'swimming-pool' || editService.category.toLowerCase() === 'swimming pool';
    }
    // Check vendorData business category (for add mode)
    if (!vendorData?.businessCategory) return false;
    const businessCategory = vendorData.businessCategory.toLowerCase();
    return businessCategory === 'swimming-pool' || businessCategory === 'swimming pool';
  };

  // Turf service form data - initialize from editService if in edit mode and category is turf
  const [turfFormData, setTurfFormData] = useState<Partial<TurfServiceFormData>>(() => {
    if (isEditMode && editService && editService.category === 'turf') {
      // Map editService fields to turf form data
      return {
        serviceName: editService.serviceName || '',
        sportType: editService.sportType || '',
        serviceDurationInMinutes: editService.slotDurationInMinutes || 0,
        bufferTimeInMinutes: editService.bufferTimeInMinutes || 0,
        price: editService.pricePerSlot || 0,
        maximumPlayers: editService.maxPlayers || 0,
        serviceFor: editService.allowedGenders === 'mixed' ? 'both' : (editService.allowedGenders as 'male' | 'female' | 'both') || 'both',
        amenities: editService.amenities || [],
      };
    }
    return {};
  });
  const [turfFormErrors, setTurfFormErrors] = useState<Partial<Record<keyof TurfServiceFormData, string>>>({});

  // Saloon service form data - initialize from editService if in edit mode and category is saloon
  const [saloonFormData, setSaloonFormData] = useState<Partial<SaloonServiceFormData>>(() => {
    if (editService && editService.category === 'saloon') {
      // Map editService fields to saloon form data (using correct API response fields)
      // Handle serviceFor: API returns 'male'|'female'|'mixed', form uses 'male'|'female'|'both'
      let serviceForValue: 'male' | 'female' | 'both' = 'both';
      if (editService.serviceFor) {
        serviceForValue = editService.serviceFor === 'mixed' ? 'both' : (editService.serviceFor as 'male' | 'female' | 'both');
      } else if (editService.gender) {
        serviceForValue = editService.gender === 'mixed' ? 'both' : (editService.gender as 'male' | 'female' | 'both');
      }

      return {
        serviceName: editService.serviceName || '',
        serviceDurationInMinutes: editService.serviceDurationInMinutes || editService.serviceDuration || 0,
        bufferTimeInMinutes: editService.bufferTimeInMinutes || editService.bufferTime || 0,
        price: editService.price || editService.serviceCost || 0,
        serviceFor: serviceForValue,
        maxConcurrentBookings: editService.maxConcurrentBookings || editService.maximumNo || 0,
        assignedStaff: editService.assignedStaff || [],
        categoryLabel: (editService as any).categoryLabel,
      };
    }
    return {};
  });
  const [saloonFormErrors, setSaloonFormErrors] = useState<Partial<Record<keyof SaloonServiceFormData, string>>>({});

  // Swimming Pool service form data - initialize from editService if in edit mode and category is swimming-pool
  const [swimmingPoolFormData, setSwimmingPoolFormData] = useState<Partial<SwimmingPoolServiceFormData>>(() => {
    if (editService && (editService.category === 'swimming-pool' || editService.category === 'swimming pool')) {
      // Map editService fields to swimming pool form data
      // Handle allowedGenders: API returns 'male'|'female'|'mixed', form uses 'male'|'female'|'both'
      let allowedGendersValue: 'male' | 'female' | 'both' = 'both';
      if (editService.allowedGenders) {
        allowedGendersValue = editService.allowedGenders === 'mixed' ? 'both' : (editService.allowedGenders as 'male' | 'female' | 'both');
      } else if (editService.gender) {
        allowedGendersValue = editService.gender === 'mixed' ? 'both' : (editService.gender as 'male' | 'female' | 'both');
      }

      return {
        serviceName: editService.serviceName || '',
        slotDurationInMinutes: editService.slotDurationInMinutes || editService.serviceDuration || 0,
        bufferTimeInMinutes: editService.bufferTimeInMinutes || editService.bufferTime || 0,
        pricePerPerson: (editService as any).pricePerPerson || editService.price || editService.serviceCost || 0,
        maxCapacity: (editService as any).maxCapacity || editService.maximumNo || 0,
        ageGroup: ((editService as any).ageGroup as 'adults' | 'children') || 'adults',
        allowedGenders: allowedGendersValue,
        dressCode: (editService as any).dressCode,
        amenities: (editService as any).amenities || [],
      };
    }
    return {};
  });
  const [swimmingPoolFormErrors, setSwimmingPoolFormErrors] = useState<Partial<Record<keyof SwimmingPoolServiceFormData, string>>>({});

  // Stable onChange to avoid infinite update loops (child useEffect depends on onChange)
  const handleTurfFormChange = useCallback((data: Partial<TurfServiceFormData>) => {
    setTurfFormData((prev) => {
      // If nothing actually changed, keep previous object to avoid re-renders
      const next = { ...prev, ...data };
      const keys = Object.keys(next) as Array<keyof typeof next>;
      for (const key of keys) {
        if (prev[key] !== next[key]) {
          return next;
        }
      }
      return prev;
    });
  }, []);

  // Stable onChange for saloon form
  const handleSaloonFormChange = useCallback((data: Partial<SaloonServiceFormData>) => {
    setSaloonFormData((prev) => {
      // If nothing actually changed, keep previous object to avoid re-renders
      const next = { ...prev, ...data };
      const keys = Object.keys(next) as Array<keyof typeof next>;
      for (const key of keys) {
        if (prev[key] !== next[key]) {
          return next;
        }
      }
      return prev;
    });
  }, []);

  // Stable onChange for swimming pool form
  const handleSwimmingPoolFormChange = useCallback((data: Partial<SwimmingPoolServiceFormData>) => {
    setSwimmingPoolFormData((prev) => {
      // If nothing actually changed, keep previous object to avoid re-renders
      const next = { ...prev, ...data };
      const keys = Object.keys(next) as Array<keyof typeof next>;
      for (const key of keys) {
        if (prev[key] !== next[key]) {
          return next;
        }
      }
      return prev;
    });
  }, []);

  const isDetailsStepValid = serviceName.trim().length > 0 && !!category;
  const isPricingStepValid = price.trim().length > 0;
  const isCapacityStepValid = maxCustomers.trim().length > 0 && applicableTo.trim().length > 0;
  
  // Check if turf form is valid (all fields filled + image selected)
  const isTurfFormValid = () => {
    if (!turfFormData.serviceName?.trim()) return false;
    if (!turfFormData.sportType) return false;
    if (!turfFormData.serviceDurationInMinutes || turfFormData.serviceDurationInMinutes <= 0) return false;
    if (turfFormData.bufferTimeInMinutes === undefined || turfFormData.bufferTimeInMinutes < 0) return false;
    if (!turfFormData.price || turfFormData.price <= 0) return false;
    if (!turfFormData.maximumPlayers || turfFormData.maximumPlayers <= 0) return false;
    if (!turfFormData.serviceFor) return false;
    if (!primaryImage) return false; // Image is required
    return true;
  };

  // Check if saloon form is valid (all fields filled + image selected)
  const isSaloonFormValid = () => {
    if (!saloonFormData.serviceName?.trim()) return false;
    if (!saloonFormData.serviceDurationInMinutes || saloonFormData.serviceDurationInMinutes <= 0) return false;
    if (saloonFormData.bufferTimeInMinutes === undefined || saloonFormData.bufferTimeInMinutes < 0) return false;
    if (!saloonFormData.price || saloonFormData.price <= 0) return false;
    if (!saloonFormData.serviceFor) return false;
    if (!saloonFormData.maxConcurrentBookings || saloonFormData.maxConcurrentBookings <= 0) return false;
    if (!primaryImage) return false; // Image is required
    return true;
  };

  // Check if swimming pool form is valid (all fields filled + image selected)
  const isSwimmingPoolFormValid = () => {
    if (!swimmingPoolFormData.serviceName?.trim()) return false;
    if (!swimmingPoolFormData.slotDurationInMinutes || swimmingPoolFormData.slotDurationInMinutes <= 0) return false;
    if (swimmingPoolFormData.bufferTimeInMinutes === undefined || swimmingPoolFormData.bufferTimeInMinutes < 0) return false;
    if (!swimmingPoolFormData.pricePerPerson || swimmingPoolFormData.pricePerPerson <= 0) return false;
    if (!swimmingPoolFormData.maxCapacity || swimmingPoolFormData.maxCapacity <= 0) return false;
    if (!swimmingPoolFormData.ageGroup) return false;
    if (!swimmingPoolFormData.allowedGenders) return false;
    if (!primaryImage) return false; // Image is required
    return true;
  };

  // Fetch staff when modal opens
  const fetchStaff = async () => {
    try {
      setLoadingStaff(true);
      const userId = await userStorage.getUserId();
      
      if (!userId) {
        showError('User ID not found. Please login again.');
        setLoadingStaff(false);
        return;
      }

      const response = await vendorService.getStaff(userId);
      
      if (response.success && response.data) {
        // Filter only active staff
        const activeStaff = response.data.filter(staff => staff.isActive);
        setStaffList(activeStaff);
      } else {
        showError('Failed to load staff list');
      }
    } catch {
      showError('Failed to load staff list');
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleStaffModalOpen = () => {
    setIsStaffModalVisible(true);
    if (staffList.length === 0) {
      fetchStaff();
    }
  };

  const handleStaffToggle = (staffName: string) => {
    setSelectedStaff((prev) => {
      if (prev.includes(staffName)) {
        return prev.filter((name) => name !== staffName);
      } else {
        return [...prev, staffName];
      }
    });
  };

  const handleStaffSelectAll = () => {
    if (selectedStaff.length === staffList.length) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(staffList.map((staff) => staff.name));
    }
  };

  const getStaffDisplayText = () => {
    if (selectedStaff.length === 0) {
      return undefined;
    }
    if (selectedStaff.length === 1) {
      return selectedStaff[0];
    }
    return `${selectedStaff.length} staff selected`;
  };

  const handleCancel = () => {
    if (step === 2) {
      setStep(1);
      return;
    }
    if (step === 1) {
      setStep(0);
      return;
    }
    navigation.goBack();
  };

  const handleContinue = () => {
    // For turf category, we use a single-step form
    if (isTurfCategory()) {
      handleSaveTurfService();
      return;
    }

    // For saloon category, we use a single-step form
    if (isSaloonCategory()) {
      handleSaveSaloonService();
      return;
    }

    // For swimming pool category, we use a single-step form
    if (isSwimmingPoolCategory()) {
      handleSaveSwimmingPoolService();
      return;
    }

    // Regular multi-step flow for other categories
    if (step === 0) {
      if (!isDetailsStepValid) {
        return;
      }
      setStep(1);
      return;
    }

    if (step === 1) {
      if (!isPricingStepValid) {
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!isCapacityStepValid) {
        return;
      }
      handleSaveService();
    }
  };

  const handleSaveTurfService = async () => {
    // Validate turf form data
    const errors: Partial<Record<keyof TurfServiceFormData, string>> = {};
    
    if (!turfFormData.serviceName?.trim()) {
      errors.serviceName = 'Please enter service name';
    }
    if (!turfFormData.sportType) {
      errors.sportType = 'Please select sport type';
    }
    if (!turfFormData.serviceDurationInMinutes || turfFormData.serviceDurationInMinutes <= 0) {
      errors.serviceDurationInMinutes = 'Please enter valid slot duration';
    }
    if (turfFormData.bufferTimeInMinutes === undefined || turfFormData.bufferTimeInMinutes < 0) {
      errors.bufferTimeInMinutes = 'Please enter valid buffer time';
    }
    if (!turfFormData.price || turfFormData.price <= 0) {
      errors.price = 'Please enter valid price';
    }
    if (!turfFormData.maximumPlayers || turfFormData.maximumPlayers <= 0) {
      errors.maximumPlayers = 'Please enter valid maximum players';
    }
    if (!turfFormData.serviceFor) {
      errors.serviceFor = 'Please select allowed genders';
    }

    if (Object.keys(errors).length > 0) {
      setTurfFormErrors(errors);
      return;
    }

    setTurfFormErrors({});

    try {
      setSavingService(true);
      const userId = await userStorage.getUserId();
      
      if (!userId) {
        showError('User ID not found. Please login again.');
        setSavingService(false);
        return;
      }

      // Convert "both" to "mixed" for serviceFor
      // TurfServiceFormData allows 'both', but API expects 'mixed'
      const serviceForValue: 'male' | 'female' | 'mixed' = 
        turfFormData.serviceFor === 'both' || turfFormData.serviceFor === 'mixed'
          ? 'mixed'
          : turfFormData.serviceFor === 'male'
          ? 'male'
          : 'female';

      // Prepare turf service data with correct field names for backend
      const serviceData = {
        category: 'turf',
        serviceName: turfFormData.serviceName!.trim(),
        sportType: turfFormData.sportType!, // required
        slotDurationInMinutes: turfFormData.serviceDurationInMinutes!, // renamed
        bufferTimeInMinutes: turfFormData.bufferTimeInMinutes!,
        pricePerSlot: turfFormData.price!, // renamed
        priceUnitLabel: 'per person',
        maxPlayers: turfFormData.maximumPlayers!, // renamed
        allowedGenders: serviceForValue, // renamed from serviceFor
        amenities: turfFormData.amenities || [],
      };

      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(
          'Adding turf service with payload:',
          JSON.stringify(serviceData, null, 2)
        );
      }

      if (isEditMode) {
        // EDIT MODE: Update existing turf service
        if (!serviceId || serviceId.trim() === '') {
          showError('Service ID not found. Cannot update service.');
          setSavingService(false);
          return;
        }

        // Use updateCategoryService for edit mode
        const response = await vendorService.updateCategoryService(
          userId,
          serviceId,
          serviceData
        );

        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log(
            'Update turf service API response:',
            JSON.stringify(response, null, 2)
          );
        }

        if (!response.success) {
          showError('Failed to update service. Please try again.');
          setSavingService(false);
          return;
        }

        // Update image if it changed
        if (primaryImage && primaryImage !== originalImageUri) {
          try {
            if (__DEV__) {
              // eslint-disable-next-line no-console
              console.log('Updating image for serviceId:', serviceId);
            }
            const imageResponse = await vendorService.updateServiceImage(
              userId,
              serviceId,
              primaryImage
            );

            if (imageResponse.success) {
              if (__DEV__) {
                // eslint-disable-next-line no-console
                console.log('Image updated successfully');
              }
            } else {
              if (__DEV__) {
                console.warn('Image update failed, but service was updated');
              }
            }
          } catch (imageError) {
            if (__DEV__) {
              console.error('Image update error:', imageError);
            }
          }
        }

        showSuccess('Service updated successfully!');
        navigation.navigate('Services');
      } else {
        // ADD MODE: Create new turf service
        const response = await vendorService.addCategoryService(userId, serviceData);

        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log(
            'Add turf service API response:',
            JSON.stringify(response, null, 2)
          );
        }

        if (!response.success) {
          showError('Failed to add service. Please try again.');
          setSavingService(false);
          return;
        }

        // Upload image if provided
        if (primaryImage && response.data) {
          const responseData = response.data as any;
          let newServiceId: string | undefined;
          
          // Extract serviceId from response
          if (responseData.services && Array.isArray(responseData.services) && responseData.services.length > 0) {
            const lastService = responseData.services[responseData.services.length - 1];
            newServiceId = lastService.serviceId;
          } else if (responseData.serviceId) {
            newServiceId = responseData.serviceId;
          }
          
          if (newServiceId) {
            try {
              // Delay to ensure service is fully saved
              await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
              
              const imageResponse = await vendorService.uploadServiceImage(
                userId,
                newServiceId,
                primaryImage
              );

              if (!imageResponse.success) {
                if (__DEV__) {
                  console.warn('Image upload failed, but service was created');
                }
              }
            } catch (imageError) {
              if (__DEV__) {
                console.error('Image upload error:', imageError);
              }
            }
          }
        }

        showSuccess('Service added successfully!');
        navigation.navigate('Services');
      }
    } catch (error) {
      const axiosError = error as CustomAxiosError;
      const errorMessage =
        axiosError.response?.data?.message || 'Failed to add service. Please try again.';

      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(
          'Add turf service API error:',
          JSON.stringify(axiosError.response?.data ?? error, null, 2)
        );
      }

      showError(errorMessage);
    } finally {
      setSavingService(false);
    }
  };

  const handleSaveSaloonService = async () => {
    // Validate saloon form data
    const errors: Partial<Record<keyof SaloonServiceFormData, string>> = {};
    
    if (!saloonFormData.serviceName?.trim()) {
      errors.serviceName = 'Please enter service name';
    }
    if (!saloonFormData.serviceDurationInMinutes || saloonFormData.serviceDurationInMinutes <= 0) {
      errors.serviceDurationInMinutes = 'Please enter valid service duration';
    }
    if (saloonFormData.bufferTimeInMinutes === undefined || saloonFormData.bufferTimeInMinutes < 0) {
      errors.bufferTimeInMinutes = 'Please enter valid buffer time';
    }
    if (!saloonFormData.price || saloonFormData.price <= 0) {
      errors.price = 'Please enter valid price';
    }
    if (!saloonFormData.serviceFor) {
      errors.serviceFor = 'Please select service for';
    }
    if (!saloonFormData.maxConcurrentBookings || saloonFormData.maxConcurrentBookings <= 0) {
      errors.maxConcurrentBookings = 'Please enter valid max concurrent bookings';
    }

    if (Object.keys(errors).length > 0) {
      setSaloonFormErrors(errors);
      return;
    }

    setSaloonFormErrors({});

    try {
      setSavingService(true);
      const userId = await userStorage.getUserId();
      
      if (!userId) {
        showError('User ID not found. Please login again.');
        setSavingService(false);
        return;
      }

      // Convert "both" to "mixed" for serviceFor
      const serviceForValue: 'male' | 'female' | 'mixed' = 
        saloonFormData.serviceFor === 'both' || saloonFormData.serviceFor === 'mixed'
          ? 'mixed'
          : saloonFormData.serviceFor === 'male'
          ? 'male'
          : 'female';

      // Prepare saloon service data
      const serviceData = {
        category: 'saloon',
        serviceName: saloonFormData.serviceName!.trim(),
        serviceDurationInMinutes: saloonFormData.serviceDurationInMinutes!,
        bufferTimeInMinutes: saloonFormData.bufferTimeInMinutes!,
        price: saloonFormData.price!,
        priceUnitLabel: 'per person',
        serviceFor: serviceForValue,
        maxConcurrentBookings: saloonFormData.maxConcurrentBookings!,
        assignedStaff: saloonFormData.assignedStaff || [],
        categoryLabel: saloonFormData.categoryLabel,
      };

      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(
          'Adding saloon service with payload:',
          JSON.stringify(serviceData, null, 2)
        );
      }

      if (isEditMode) {
        // EDIT MODE: Update existing saloon service
        if (!serviceId || serviceId.trim() === '') {
          showError('Service ID not found. Cannot update service.');
          setSavingService(false);
          return;
        }

        const response = await vendorService.updateSaloonService(
          userId,
          serviceId,
          serviceData
        );

        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log(
            'Update saloon service API response:',
            JSON.stringify(response, null, 2)
          );
        }

        if (!response.success) {
          showError('Failed to update service. Please try again.');
          setSavingService(false);
          return;
        }

        // Update image if it changed
        if (primaryImage && primaryImage !== originalImageUri) {
          try {
            if (__DEV__) {
              // eslint-disable-next-line no-console
              console.log('Updating image for serviceId:', serviceId);
            }
            const imageResponse = await vendorService.updateServiceImage(
              userId,
              serviceId,
              primaryImage
            );

            if (imageResponse.success) {
              if (__DEV__) {
                // eslint-disable-next-line no-console
                console.log('Image updated successfully');
              }
            } else {
              if (__DEV__) {
                console.warn('Image update failed, but service was updated');
              }
            }
          } catch (imageError) {
            if (__DEV__) {
              console.error('Image update error:', imageError);
            }
          }
        }

        showSuccess('Service updated successfully!');
        navigation.navigate('Services');
      } else {
        // ADD MODE: Create new saloon service
        const response = await vendorService.addSaloonService(userId, serviceData);

        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log(
            'Add saloon service API response:',
            JSON.stringify(response, null, 2)
          );
        }

        if (!response.success) {
          showError('Failed to add service. Please try again.');
          setSavingService(false);
          return;
        }

        // Upload image if provided
        if (primaryImage && response.data) {
          const responseData = response.data as any;
          let newServiceId: string | undefined;
          
          // Extract serviceId from response
          if (responseData.services && Array.isArray(responseData.services) && responseData.services.length > 0) {
            const lastService = responseData.services[responseData.services.length - 1];
            newServiceId = lastService.serviceId;
          } else if (responseData.serviceId) {
            newServiceId = responseData.serviceId;
          }
          
          if (newServiceId) {
            try {
              // Delay to ensure service is fully saved
              await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
              
              const imageResponse = await vendorService.uploadServiceImage(
                userId,
                newServiceId,
                primaryImage
              );

              if (!imageResponse.success) {
                if (__DEV__) {
                  console.warn('Image upload failed, but service was created');
                }
              }
            } catch (imageError) {
              if (__DEV__) {
                console.error('Image upload error:', imageError);
              }
            }
          }
        }

        showSuccess('Service added successfully!');
        navigation.navigate('Services');
      }
    } catch (error) {
      const axiosError = error as CustomAxiosError;
      const errorMessage =
        axiosError.response?.data?.message || 'Failed to add service. Please try again.';

      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(
          'Add saloon service API error:',
          JSON.stringify(axiosError.response?.data ?? error, null, 2)
        );
      }

      showError(errorMessage);
    } finally {
      setSavingService(false);
    }
  };

  const handleSaveSwimmingPoolService = async () => {
    // Validate swimming pool form data
    const errors: Partial<Record<keyof SwimmingPoolServiceFormData, string>> = {};
    
    if (!swimmingPoolFormData.serviceName?.trim()) {
      errors.serviceName = 'Please enter service name';
    }
    if (!swimmingPoolFormData.slotDurationInMinutes || swimmingPoolFormData.slotDurationInMinutes <= 0) {
      errors.slotDurationInMinutes = 'Please enter valid slot duration';
    }
    if (swimmingPoolFormData.bufferTimeInMinutes === undefined || swimmingPoolFormData.bufferTimeInMinutes < 0) {
      errors.bufferTimeInMinutes = 'Please enter valid buffer time';
    }
    if (!swimmingPoolFormData.pricePerPerson || swimmingPoolFormData.pricePerPerson <= 0) {
      errors.pricePerPerson = 'Please enter valid price per person';
    }
    if (!swimmingPoolFormData.maxCapacity || swimmingPoolFormData.maxCapacity <= 0) {
      errors.maxCapacity = 'Please enter valid max capacity';
    }
    if (!swimmingPoolFormData.ageGroup) {
      errors.ageGroup = 'Please select age group';
    }
    if (!swimmingPoolFormData.allowedGenders) {
      errors.allowedGenders = 'Please select allowed genders';
    }

    if (Object.keys(errors).length > 0) {
      setSwimmingPoolFormErrors(errors);
      return;
    }

    setSwimmingPoolFormErrors({});

    try {
      setSavingService(true);
      const userId = await userStorage.getUserId();
      
      if (!userId) {
        showError('User ID not found. Please login again.');
        setSavingService(false);
        return;
      }

      // Convert "both" to "mixed" for allowedGenders
      const allowedGendersValue: 'male' | 'female' | 'mixed' = 
        swimmingPoolFormData.allowedGenders === 'both' || swimmingPoolFormData.allowedGenders === 'mixed'
          ? 'mixed'
          : swimmingPoolFormData.allowedGenders === 'male'
          ? 'male'
          : 'female';

      // Prepare swimming pool service data
      const serviceData = {
        category: 'swimming-pool',
        serviceName: swimmingPoolFormData.serviceName!.trim(),
        slotDurationInMinutes: swimmingPoolFormData.slotDurationInMinutes!,
        bufferTimeInMinutes: swimmingPoolFormData.bufferTimeInMinutes!,
        pricePerPerson: swimmingPoolFormData.pricePerPerson!,
        priceUnitLabel: 'per person',
        maxCapacity: swimmingPoolFormData.maxCapacity!,
        ageGroup: swimmingPoolFormData.ageGroup!,
        allowedGenders: allowedGendersValue,
        dressCode: swimmingPoolFormData.dressCode,
        amenities: swimmingPoolFormData.amenities || [],
      };

      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(
          'Adding swimming pool service with payload:',
          JSON.stringify(serviceData, null, 2)
        );
      }

      if (isEditMode) {
        // EDIT MODE: Update existing swimming pool service
        if (!serviceId || serviceId.trim() === '') {
          showError('Service ID not found. Cannot update service.');
          setSavingService(false);
          return;
        }

        const response = await vendorService.updateSwimmingPoolService(
          userId,
          serviceId,
          serviceData
        );

        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log(
            'Update swimming pool service API response:',
            JSON.stringify(response, null, 2)
          );
        }

        if (!response.success) {
          showError('Failed to update service. Please try again.');
          setSavingService(false);
          return;
        }

        // Update image if it changed
        if (primaryImage && primaryImage !== originalImageUri) {
          try {
            if (__DEV__) {
              // eslint-disable-next-line no-console
              console.log('Updating image for serviceId:', serviceId);
            }
            const imageResponse = await vendorService.updateServiceImage(
              userId,
              serviceId,
              primaryImage
            );

            if (imageResponse.success) {
              if (__DEV__) {
                // eslint-disable-next-line no-console
                console.log('Image updated successfully');
              }
            } else {
              if (__DEV__) {
                console.warn('Image update failed, but service was updated');
              }
            }
          } catch (imageError) {
            if (__DEV__) {
              console.error('Image update error:', imageError);
            }
          }
        }

        showSuccess('Service updated successfully!');
        navigation.navigate('Services');
      } else {
        // ADD MODE: Create new swimming pool service
        const response = await vendorService.addSwimmingPoolService(userId, serviceData);

        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log(
            'Add swimming pool service API response:',
            JSON.stringify(response, null, 2)
          );
        }

        if (!response.success) {
          showError('Failed to add service. Please try again.');
          setSavingService(false);
          return;
        }

        // Upload image if provided
        if (primaryImage && response.data) {
          const responseData = response.data as any;
          let newServiceId: string | undefined;
          
          // Extract serviceId from response
          if (responseData.services && Array.isArray(responseData.services) && responseData.services.length > 0) {
            const lastService = responseData.services[responseData.services.length - 1];
            newServiceId = lastService.serviceId;
          } else if (responseData.serviceId) {
            newServiceId = responseData.serviceId;
          }
          
          if (newServiceId) {
            try {
              // Delay to ensure service is fully saved
              await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
              
              const imageResponse = await vendorService.uploadServiceImage(
                userId,
                newServiceId,
                primaryImage
              );

              if (!imageResponse.success) {
                if (__DEV__) {
                  console.warn('Image upload failed, but service was created');
                }
              }
            } catch (imageError) {
              if (__DEV__) {
                console.error('Image upload error:', imageError);
              }
            }
          }
        }

        showSuccess('Service added successfully!');
        navigation.navigate('Services');
      }
    } catch (error) {
      const axiosError = error as CustomAxiosError;
      const errorMessage =
        axiosError.response?.data?.message || 'Failed to add service. Please try again.';

      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(
          'Add swimming pool service API error:',
          JSON.stringify(axiosError.response?.data ?? error, null, 2)
        );
      }

      showError(errorMessage);
    } finally {
      setSavingService(false);
    }
  };

  const handleSaveService = async () => {
    try {
      setSavingService(true);
      const userId = await userStorage.getUserId();
      
      if (!userId) {
        showError('User ID not found. Please login again.');
        setSavingService(false);
        return;
      }

      // Get staff names - if assignAllStaff is true, use staffList names (already fetched when toggle was turned on), else use selectedStaff
      const assignedStaffNames: string[] = assignAllStaff
        ? staffList.map(staff => staff.name)
        : selectedStaff;

      // Map applicableTo to gender
      const genderMap: Record<string, string> = {
        'Both': 'both',
        'Male': 'male',
        'Female': 'female',
      };
      const gender = genderMap[applicableTo] || 'both';

      // Get duration - use custom if Custom is selected, otherwise use selectedDuration
      let serviceDuration: number;
      if (selectedDuration === 'Custom') {
        const customDur = parseInt(customDuration, 10);
        if (isNaN(customDur) || customDur <= 0) {
          showError('Please enter a valid custom duration');
          setSavingService(false);
          return;
        }
        serviceDuration = customDur;
      } else {
        serviceDuration = parseInt(selectedDuration, 10);
      }

      // Get buffer time - use custom if Custom is selected, otherwise use selectedBuffer
      let bufferTime: number;
      if (selectedBuffer === 'Custom') {
        const customBuf = parseInt(customBuffer, 10);
        if (isNaN(customBuf) || customBuf < 0) {
          showError('Please enter a valid custom buffer time');
          setSavingService(false);
          return;
        }
        bufferTime = customBuf;
      } else {
        bufferTime = parseInt(selectedBuffer, 10);
      }

      // Prepare service data
      const serviceData = {
        serviceName: serviceName.trim(),
        serviceDuration,
        serviceCost: parseFloat(price),
        gender,
        description: description.trim(),
        category: category || '',
        bufferTime,
        assignedStaff: assignedStaffNames,
        maximumNo: parseInt(maxCustomers, 10),
        isActive: isActive,
      };

      // // Log request data for debugging
      // console.log('Service Data being sent:', JSON.stringify(serviceData, null, 2));
      // console.log('User ID:', userId);
      // console.log('Edit Mode:', isEditMode);
      // console.log('Service ID:', serviceId);
      // console.log('Edit Service Object:', JSON.stringify(editService, null, 2));

      if (isEditMode) {
        // Validate serviceId exists
        if (!serviceId || serviceId.trim() === '') {
          console.error('Service ID is missing or empty:', serviceId);
          showError('Service ID not found. Cannot update service.');
          setSavingService(false);
          return;
        }

        // console.log('Calling updateService with:', {
        //   userId,
        //   serviceId,
        //   serviceDataKeys: Object.keys(serviceData),
        // });

        // EDIT MODE: Update existing service
        // Step 1: Update service data (JSON)
        const response = await vendorService.updateService(userId, serviceId, serviceData);

        // Log response for debugging
        // console.log('Update Service API Response:', JSON.stringify(response, null, 2));

        if (!response.success) {
          showError('Failed to update service. Please try again.');
          return;
        }

        // Step 2: Update image if it changed (new image selected)
        if (primaryImage && primaryImage !== originalImageUri) {
          try {
            if (__DEV__) {
              // eslint-disable-next-line no-console
              console.log('Updating image for serviceId:', serviceId);
            }
            const imageResponse = await vendorService.updateServiceImage(
              userId,
              serviceId,
              primaryImage
            );

            if (imageResponse.success) {
              if (__DEV__) {
                // eslint-disable-next-line no-console
                console.log('Image updated successfully');
              }
            } else {
              if (__DEV__) {
                console.warn('Image update failed, but service was updated');
              }
              // Don't show error - service was updated successfully
            }
          } catch (imageError) {
            if (__DEV__) {
              console.error('Image update error:', imageError);
            }
            // Don't show error - service was updated successfully
            // Image can be updated later if needed
          }
        }

        // Show success message
        showSuccess('Service updated successfully!');
        navigation.navigate('Services');
      } else {
        // ADD MODE: Create new service
        // Step 1: Call API to create service (JSON)
        const response = await vendorService.addService(userId, serviceData);

        // Log response for debugging
        // console.log('Add Service API Response:', JSON.stringify(response, null, 2));

        if (!response.success) {
          showError('Failed to add service. Please try again.');
          return;
        }

        // Step 2: Upload image if provided
        if (primaryImage && response.data) {
          // Extract serviceId from response
          // Response structure: { services: [{ serviceId: "...", ... }] }
          const responseData = response.data as any;
          let newServiceId: string | undefined;
          
          // Check if services array exists and get the LAST service's serviceId (newly created one)
          if (responseData.services && Array.isArray(responseData.services) && responseData.services.length > 0) {
            // Get the last service in the array (the newly created one)
            const lastService = responseData.services[responseData.services.length - 1];
            newServiceId = lastService.serviceId;
          } else if (responseData.serviceId) {
            // Fallback: check if serviceId is directly in response.data
            newServiceId = responseData.serviceId;
          }
          
          if (newServiceId) {
            try {
              // Delay to ensure service is fully saved and indexed on backend
              // Backend needs time to fully process and save the service before image upload
              await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
              
              // console.log('Uploading image for serviceId:', newServiceId);
              const imageResponse = await vendorService.uploadServiceImage(
                userId,
                newServiceId,
                primaryImage
              );

              if (imageResponse.success) {
                if (__DEV__) {
                  // eslint-disable-next-line no-console
                  console.log('Image uploaded successfully');
                }
              } else {
                if (__DEV__) {
                  console.warn('Image upload failed, but service was created');
                }
                // Don't show error - service was created successfully
              }
            } catch (imageError) {
              if (__DEV__) {
                console.error('Image upload error:', imageError);
              }
              // Don't show error - service was created successfully
              // Image can be uploaded later if needed
            }
          } else {
            if (__DEV__) {
              console.warn('ServiceId not found in response, skipping image upload');
              // eslint-disable-next-line no-console
              console.log('Response data structure:', JSON.stringify(responseData, null, 2));
            }
          }
        }

        // Show success message
        showSuccess('Service added successfully!');
        navigation.navigate('Services');
      }
    } catch (error) {
      const axiosError = error as CustomAxiosError;
      const errorMessage =
        axiosError.response?.data?.message || 'Failed to add service. Please try again.';
      showError(errorMessage);
    } finally {
      setSavingService(false);
    }
  };

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        // For Android 13+ (API 33+), use READ_MEDIA_IMAGES
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: 'Photo Permission',
              message: 'This app needs access to your photos to upload images.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          // For Android < 13, use READ_EXTERNAL_STORAGE
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'This app needs access to your storage to upload images.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn('Storage permission error:', err);
        return false;
      }
    }
    // iOS permissions are handled automatically by the image picker
    return true;
  };

  const handleImageUpload = async () => {
    try {
      // Request permission first
      const hasPermission = await requestStoragePermission();
      
      if (!hasPermission && Platform.OS === 'android') {
        Alert.alert(
          'Permission Required',
          'Please grant photo access permission to upload images.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image library
      launchImageLibrary(
        {
          mediaType: 'photo' as MediaType,
          quality: 0.8,
          selectionLimit: 1,
        },
        (response: ImagePickerResponse) => {
          if (response.didCancel) {
            // User cancelled the picker
            return;
          }

          if (response.errorMessage) {
            Alert.alert('Error', response.errorMessage);
            return;
          }

          if (response.assets && response.assets.length > 0) {
            const asset = response.assets[0];
            if (asset.uri) {
              setPrimaryImage(asset.uri);
            }
          }
        }
      );
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to open image picker. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <BackIcon width={hs(24)} height={vs(24)} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{isEditMode ? 'Edit Service' : 'Add Service'}</Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {isTurfCategory() ? (
              // Turf category form - single step
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                scrollEnabled={true}
                nestedScrollEnabled={true}
                bounces={true}
              >
                    <Text style={styles.sectionTitle}>Service Details</Text>
                    <TurfServiceForm
                      initialData={turfFormData}
                      onChange={handleTurfFormChange}
                      errors={turfFormErrors}
                    />
                    
                    <View style={[styles.sectionDivider, styles.sectionDividerThick]} />
                    
                    {/* Images */}
                    <Text style={styles.sectionTitle}>
                      Service Image<Text style={styles.asterisk}> *</Text>
                    </Text>
                    <Text style={styles.imagesInstruction}>
                      Upload service image (required)
                    </Text>

                    {/* Primary Image Upload */}
                    <TouchableOpacity
                      style={styles.imageUploadArea}
                      activeOpacity={0.8}
                      onPress={handleImageUpload}
                    >
                      {primaryImage ? (
                        <Image source={{ uri: primaryImage }} style={styles.uploadedImage} />
                      ) : (
                        <View style={styles.imageUploadContent}>
                          <View style={styles.uploadIconContainer}>
                            <UploadDocumentIcon
                              width={hs(48)}
                              height={vs(48)}
                              stroke={colors.text.secondary}
                            />
                          </View>
                          <Text style={styles.uploadText}>Upload Image</Text>
                          <Text style={styles.uploadHint}>
                            Tap to select an image from your gallery
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
              </ScrollView>
            ) : isSaloonCategory() ? (
              // Saloon category form - single step
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                scrollEnabled={true}
                nestedScrollEnabled={true}
                bounces={true}
              >
                    <Text style={styles.sectionTitle}>Service Details</Text>
                    <SaloonServiceForm
                      initialData={saloonFormData}
                      onChange={handleSaloonFormChange}
                      errors={saloonFormErrors}
                      staffList={staffList}
                      onFetchStaff={fetchStaff}
                      loadingStaff={loadingStaff}
                    />
                    
                    <View style={[styles.sectionDivider, styles.sectionDividerThick]} />
                    
                    {/* Images */}
                    <Text style={styles.sectionTitle}>
                      Service Image<Text style={styles.asterisk}> *</Text>
                    </Text>
                    <Text style={styles.imagesInstruction}>
                      Upload service image (required)
                    </Text>

                    {/* Primary Image Upload */}
                    <TouchableOpacity
                      style={styles.imageUploadArea}
                      activeOpacity={0.8}
                      onPress={handleImageUpload}
                    >
                      {primaryImage ? (
                        <Image source={{ uri: primaryImage }} style={styles.uploadedImage} />
                      ) : (
                        <View style={styles.imageUploadContent}>
                          <View style={styles.uploadIconContainer}>
                            <UploadDocumentIcon
                              width={hs(48)}
                              height={vs(48)}
                              stroke={colors.text.secondary}
                            />
                          </View>
                          <Text style={styles.uploadText}>Upload Image</Text>
                          <Text style={styles.uploadHint}>
                            Tap to select an image from your gallery
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
              </ScrollView>
            ) : isSwimmingPoolCategory() ? (
              // Swimming Pool category form - single step
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                scrollEnabled={true}
                nestedScrollEnabled={true}
                bounces={true}
              >
                    <Text style={styles.sectionTitle}>Service Details</Text>
                    <SwimmingPoolServiceForm
                      initialData={swimmingPoolFormData}
                      onChange={handleSwimmingPoolFormChange}
                      errors={swimmingPoolFormErrors}
                    />
                    
                    <View style={[styles.sectionDivider, styles.sectionDividerThick]} />
                    
                    {/* Images */}
                    <Text style={styles.sectionTitle}>
                      Service Image<Text style={styles.asterisk}> *</Text>
                    </Text>
                    <Text style={styles.imagesInstruction}>
                      Upload service image (required)
                    </Text>

                    {/* Primary Image Upload */}
                    <TouchableOpacity
                      style={styles.imageUploadArea}
                      activeOpacity={0.8}
                      onPress={handleImageUpload}
                    >
                      {primaryImage ? (
                        <Image source={{ uri: primaryImage }} style={styles.uploadedImage} />
                      ) : (
                        <View style={styles.imageUploadContent}>
                          <View style={styles.uploadIconContainer}>
                            <UploadDocumentIcon
                              width={hs(48)}
                              height={vs(48)}
                              stroke={colors.text.secondary}
                            />
                          </View>
                          <Text style={styles.uploadText}>Upload Image</Text>
                          <Text style={styles.uploadHint}>
                            Tap to select an image from your gallery
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
              </ScrollView>
            ) : (
              // Regular multi-step form for other categories
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                scrollEnabled={true}
                nestedScrollEnabled={true}
                bounces={true}
                onScrollBeginDrag={() => {
                  setShowCategoryTooltip(false);
                  setShowBufferTimeTooltip(false);
                  setShowMaxCustomersTooltip(false);
                  setShowApplicableToTooltip(false);
                }}
              >
                  {step === 0 ? (
                  <>
                    <Text style={styles.sectionTitle}>Service Details</Text>

                    {/* Service name */}
                  <View style={[styles.fieldGroup, styles.fieldGroupTight]}>
                      <Text style={styles.fieldLabel}>
                        Service name<Text style={styles.asterisk}> *</Text>
                      </Text>
                      <TextInput
                        style={styles.textInput}
                        value={serviceName}
                        onChangeText={setServiceName}
                        placeholder="Enter service name"
                        placeholderTextColor={colors.text.secondary}
                      />
                    </View>

                    {/* Category dropdown */}
                    <View style={[styles.fieldGroup, styles.fieldGroupTight]}>
                      <OnboardingDropdownField
                        label="Category"
                        placeholder="Select category"
                        required
                        showInfoIcon
                        onInfoPress={() => setShowCategoryTooltip((prev) => !prev)}
                        showTooltip={showCategoryTooltip}
                        tooltipText="Choose the pricing model for this service"
                        value={category}
                        onPress={() => {
                          setShowCategoryTooltip(false);
                          setIsCategoryModalVisible(true);
                        }}
                        marginBottom={vs(8)}
                      />
                    </View>

                    {/* Description */}
                    <View style={styles.fieldGroup}>
                      <View style={styles.labelRow}>
                        <Text style={styles.fieldLabel}>Description</Text>
                        <Text style={styles.charCount}>
                          {description.length}/{DESCRIPTION_MAX_LENGTH}
                        </Text>
                      </View>
                      <TextInput
                        style={[styles.textInput, styles.descriptionInput]}
                        value={description}
                        onChangeText={(text) =>
                          setDescription(text.slice(0, DESCRIPTION_MAX_LENGTH))
                        }
                        placeholder="Briefly explain what's included"
                        placeholderTextColor={colors.text.secondary}
                        multiline
                      />
                    </View>
                  </>
                ) : step === 1 ? (
                  <>
                    {/* Pricing */}
                    <Text style={styles.sectionTitle}>Pricing</Text>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>
                        Price<Text style={styles.asterisk}> *</Text>
                      </Text>
                      <TextInput
                        style={styles.textInput}
                        value={price}
                        onChangeText={setPrice}
                        placeholder="Enter price"
                        placeholderTextColor={colors.text.secondary}
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={[styles.sectionDivider, styles.sectionDividerThick]} />

                    {/* Duration */}
                    <Text style={styles.sectionTitle}>Duration</Text>

                    <View style={styles.durationHeaderRow}>
                      <Text style={styles.fieldLabel}>
                        Service duration<Text style={styles.asterisk}> *</Text>
                      </Text>
                      <Text style={styles.durationUnitText}>in mins</Text>
                    </View>

                    <View style={styles.chipRow}>
                      {['10', '15', '30', '45', '60', 'Custom'].map((value) => {
                        const isChipActive = selectedDuration === value;
                        return (
                          <TouchableOpacity
                            key={value}
                            style={[
                              styles.chip,
                              isChipActive ? styles.chipActive : styles.chipInactive,
                            ]}
                            activeOpacity={0.8}
                            onPress={() => {
                              setSelectedDuration(value);
                              if (value !== 'Custom') {
                                setCustomDuration('');
                              }
                            }}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                isChipActive && styles.chipTextActive,
                              ]}
                            >
                              {value}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {selectedDuration === 'Custom' && (
                      <View style={styles.customInputContainer}>
                        <TextInput
                          style={styles.customInput}
                          value={customDuration}
                          onChangeText={(text) => {
                            const numericValue = text.replace(/[^0-9]/g, '');
                            setCustomDuration(numericValue);
                          }}
                          placeholder="Enter custom duration"
                          placeholderTextColor={colors.text.secondary}
                          keyboardType="numeric"
                        />
                      </View>
                    )}

                    {/* Buffer time */}
                    <View style={styles.bufferHeaderRowContainer}>
                      <View style={styles.bufferHeaderRow}>
                        <Text style={styles.fieldLabel}>Buffer time</Text>
                        <TouchableOpacity
                          onPress={() => setShowBufferTimeTooltip((prev) => !prev)}
                          activeOpacity={0.8}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <InfoIcon width={hs(18)} height={hs(18)} stroke={colors.text.primary} />
                        </TouchableOpacity>
                      </View>
                      {showBufferTimeTooltip && (
                        <View style={styles.tooltipWrapper}>
                          <View style={styles.tooltipBubble}>
                            <Text style={styles.tooltipText}>
                              Extra time between appointments to prepare for the next customer
                            </Text>
                          </View>
                          <View style={styles.tooltipArrow} />
                        </View>
                      )}
                    </View>

                    <View style={styles.chipRow}>
                      {['0', '5', '10', '15', '30', 'Custom'].map((value) => {
                        const isChipActive = selectedBuffer === value;
                        return (
                          <TouchableOpacity
                            key={value}
                            style={[
                              styles.chip,
                              isChipActive ? styles.chipActive : styles.chipInactive,
                            ]}
                            activeOpacity={0.8}
                            onPress={() => {
                              setSelectedBuffer(value);
                              if (value !== 'Custom') {
                                setCustomBuffer('');
                              }
                            }}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                isChipActive && styles.chipTextActive,
                              ]}
                            >
                              {value}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {selectedBuffer === 'Custom' && (
                      <View style={styles.customInputContainer}>
                        <TextInput
                          style={styles.customInput}
                          value={customBuffer}
                          onChangeText={(text) => {
                            const numericValue = text.replace(/[^0-9]/g, '');
                            setCustomBuffer(numericValue);
                          }}
                          placeholder="Enter custom buffer time"
                          placeholderTextColor={colors.text.secondary}
                          keyboardType="numeric"
                        />
                      </View>
                    )}

                    {!shouldHideStaffAssignment() && (
                      <>
                        <View style={[styles.sectionDivider, styles.sectionDividerThick]} />

                        {/* Staff Assignment */}
                        <Text style={styles.sectionTitle}>Staff Assignment</Text>

                        <View style={styles.assignRow}>
                          <Text style={styles.fieldLabel}>Assign all available staff</Text>
                          <TouchableOpacity
                            activeOpacity={0.8}
                            style={[
                              styles.toggle,
                              assignAllStaff && styles.toggleActive,
                            ]}
                            onPress={async () => {
                              const newValue = !assignAllStaff;
                              setAssignAllStaff(newValue);
                              
                              if (newValue) {
                                // Fetch staff when toggle is turned on
                                try {
                                  const userId = await userStorage.getUserId();
                                  if (userId) {
                                    const response = await vendorService.getStaff(userId);
                                    if (response.success && response.data) {
                                      const activeStaff = response.data.filter(staff => staff.isActive);
                                      setStaffList(activeStaff);
                                      setSelectedStaff(activeStaff.map((staff) => staff.name));
                                    }
                                  }
                                } catch (error) {
                                  console.error('Error fetching staff:', error);
                                  showError('Failed to load staff list');
                                }
                              } else {
                                // Clear selection when toggle is turned off
                                setSelectedStaff([]);
                              }
                            }}
                          >
                            <View
                              style={[
                                styles.toggleThumb,
                                assignAllStaff && styles.toggleThumbActive,
                              ]}
                            />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.fieldGroup}>
                          <Text style={[styles.fieldLabel, styles.fieldLabelNoMargin]}>
                            Manual selection
                          </Text>
                          <View style={styles.dropdownWrapper}>
                            <OnboardingDropdownField
                              label=""
                              placeholder="Select staffs"
                              value={getStaffDisplayText()}
                              onPress={handleStaffModalOpen}
                              marginBottom={0}
                            />
                          </View>
                        </View>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {/* Capacity */}
                    <Text style={styles.sectionTitle}>Capacity</Text>

                    {/* Maximum customers per slot */}
                    <View style={styles.fieldGroupExtraTight}>
                      <OnboardingDropdownField
                        label="Maximum customers per slot"
                        placeholder="Select"
                        required
                        showInfoIcon
                        onInfoPress={() => setShowMaxCustomersTooltip((prev) => !prev)}
                        showTooltip={showMaxCustomersTooltip}
                        tooltipText="Maximum number of customers that can book this service in a single time slot"
                        value={maxCustomers}
                        onPress={() => {
                          setShowMaxCustomersTooltip(false);
                          setIsMaxCustomersModalVisible(true);
                        }}
                        marginBottom={0}
                      />
                    </View>

                    {/* Applicable to */}
                    <View style={styles.fieldGroupExtraTight}>
                      <OnboardingDropdownField
                        label="Applicable to"
                        placeholder="Select"
                        required
                        showInfoIcon
                        onInfoPress={() => setShowApplicableToTooltip((prev) => !prev)}
                        showTooltip={showApplicableToTooltip}
                        tooltipText="Select the gender this service is available for"
                        value={applicableTo}
                        onPress={() => {
                          setShowApplicableToTooltip(false);
                          setIsApplicableToModalVisible(true);
                        }}
                        marginBottom={0}
                      />
                    </View>

                    <View style={[styles.sectionDivider, styles.sectionDividerThick, styles.sectionDividerExtraTight]} />

                    {/* Images */}
                    <Text style={styles.sectionTitle}>Images</Text>
                    
                    <Text style={styles.imagesInstruction}>
                      Upload primary image and add up to 1 gallery images
                    </Text>

                    {/* Primary Image Upload */}
                    <TouchableOpacity
                      style={styles.imageUploadArea}
                      activeOpacity={0.8}
                      onPress={handleImageUpload}
                    >
                      {primaryImage ? (
                        <Image
                          source={{ uri: primaryImage }}
                          style={styles.uploadedImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.imageUploadContent}>
                          <View style={styles.uploadIconContainer}>
                            <UploadDocumentIcon width={hs(48)} height={vs(48)} />
                          </View>
                          <Text style={styles.uploadText}>Tap to upload photo</Text>
                          <Text style={styles.uploadHint}>
                            High-quality images help customers decide faster
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                </>
              )}
              </ScrollView>
            )}
          </View>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.8}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>
                  {isTurfCategory() || isSaloonCategory() || isSwimmingPoolCategory() ? 'Cancel' : step === 0 ? 'Cancel' : 'Back'}
                </Text>
              </TouchableOpacity>

              <OnboardingCTAButton
                label={
                  isTurfCategory() || isSaloonCategory() || isSwimmingPoolCategory()
                    ? isEditMode
                      ? 'Update Service'
                      : 'Save Service'
                    : step === 2
                    ? isEditMode
                      ? 'Update Service'
                      : 'Save Service'
                    : 'Continue'
                }
                onPress={handleContinue}
                disabled={
                  isTurfCategory()
                    ? !isTurfFormValid() || savingService
                    : isSaloonCategory()
                    ? !isSaloonFormValid() || savingService
                    : isSwimmingPoolCategory()
                    ? !isSwimmingPoolFormValid() || savingService
                    : step === 0
                    ? !isDetailsStepValid
                    : step === 1
                    ? !isPricingStepValid
                    : !isCapacityStepValid || savingService
                }
                loading={savingService}
                style={styles.continueButton}
              />
            </View>
          </View>

          {/* Category selection bottom sheet (same pattern as onboarding) */}
          <Modal
            visible={isCategoryModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setIsCategoryModalVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalBackdrop}
              onPress={() => setIsCategoryModalVisible(false)}
            >
              <TouchableOpacity activeOpacity={1}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select category</Text>
                  <TouchableOpacity
                    style={styles.modalOption}
                    activeOpacity={0.8}
                    onPress={() => {
                      setCategory('per person charges');
                      setIsCategoryModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>per person charges</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalOption}
                    activeOpacity={0.8}
                    onPress={() => {
                      setCategory('per hour charges');
                      setIsCategoryModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>per hour charges</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>

          {/* Staff selection bottom sheet with checkboxes */}
          <Modal
            visible={isStaffModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setIsStaffModalVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalBackdrop}
              onPress={() => setIsStaffModalVisible(false)}
            >
              <TouchableOpacity activeOpacity={1}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select staff</Text>
                    {staffList.length > 0 && (
                      <TouchableOpacity
                        style={styles.selectAllButton}
                        activeOpacity={0.8}
                        onPress={handleStaffSelectAll}
                      >
                        <Text style={styles.selectAllText}>
                          {selectedStaff.length === staffList.length ? 'Deselect all' : 'Select all'}
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
                    <ScrollView style={styles.staffListContainer} showsVerticalScrollIndicator={false}>
                      {staffList.map((staff) => {
                        const isSelected = selectedStaff.includes(staff.name);
                        return (
                          <TouchableOpacity
                            key={staff.name}
                            style={styles.staffOption}
                            activeOpacity={0.8}
                            onPress={() => handleStaffToggle(staff.name)}
                          >
                            <View style={styles.checkboxContainer}>
                              <View
                                style={[
                                  styles.checkbox,
                                  isSelected && styles.checkboxSelected,
                                ]}
                              >
                                {isSelected && (
                                  <Text style={styles.checkmark}>✓</Text>
                                )}
                              </View>
                              <Text style={styles.staffOptionText}>{staff.name}</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}
                  
                  <TouchableOpacity
                    style={styles.modalDoneButton}
                    activeOpacity={0.8}
                    onPress={() => setIsStaffModalVisible(false)}
                  >
                    <Text style={styles.modalDoneButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>

          {/* Maximum customers per slot selection modal */}
          <Modal
            visible={isMaxCustomersModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setIsMaxCustomersModalVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalBackdrop}
              onPress={() => setIsMaxCustomersModalVisible(false)}
            >
              <TouchableOpacity activeOpacity={1}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select maximum customers</Text>
                  <ScrollView 
                    style={styles.modalScrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.modalChipContainer}
                  >
                    <View style={styles.modalChipRow}>
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'].map((value) => {
                        const isChipActive = maxCustomers === value;
                        const screenWidth = Dimensions.get('window').width;
                        const modalPadding = hs(24) * 2; // Left + Right padding
                        const gapTotal = hs(8) * 6; // 6 gaps between 7 chips
                        const chipSize = (screenWidth - modalPadding - gapTotal) / 7;
                        
                        return (
                          <TouchableOpacity
                            key={value}
                            style={[
                              styles.modalChip,
                              {
                                width: chipSize,
                                height: chipSize,
                                borderRadius: chipSize / 2,
                              },
                              isChipActive ? styles.chipActive : styles.chipInactive,
                            ]}
                            activeOpacity={0.8}
                            onPress={() => {
                              setMaxCustomers(value);
                              setIsMaxCustomersModalVisible(false);
                            }}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                isChipActive && styles.chipTextActive,
                              ]}
                            >
                              {value}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>

          {/* Applicable to selection modal */}
          <Modal
            visible={isApplicableToModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setIsApplicableToModalVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalBackdrop}
              onPress={() => setIsApplicableToModalVisible(false)}
            >
              <TouchableOpacity activeOpacity={1}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select applicable to</Text>
                  {['Both', 'Male', 'Female'].map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={styles.modalOption}
                      activeOpacity={0.8}
                      onPress={() => {
                        setApplicableTo(value);
                        setIsApplicableToModalVisible(false);
                      }}
                    >
                      <Text style={styles.modalOptionText}>{value}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>

          {/* Loading Overlay */}
          <Modal
            visible={savingService}
            transparent
            animationType="fade"
            onRequestClose={() => {}} // Prevent closing during save
          >
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingContent}>
                <ActivityIndicator size="large" color={colors.text.primary} />
                <Text style={styles.loadingText}>
                  {isEditMode ? 'Updating service...' : 'Saving service...'}
                </Text>
              </View>
            </View>
          </Modal>
      </KeyboardAvoidingView>
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
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: hs(16),
    paddingTop: vs(16),
    paddingBottom: vs(12),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: hs(8),
    padding: vs(4),
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: hs(16),
    paddingTop: vs(16),
  },
  scrollContent: {
    paddingBottom: vs(24),
  },
  flex: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: vs(20),
  },
  fieldGroup: {
    marginBottom: vs(20),
  },
  fieldGroupTight: {
    marginBottom: vs(12),
  },
  fieldGroupExtraTight: {
    marginBottom: vs(8),
  },
  fieldLabel: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: vs(5),
  },
  fieldLabelNoMargin: {
    marginBottom: 0,
  },
  dropdownWrapper: {
    marginTop: vs(-20), // Counteract paddingVertical top (12) + labelRow marginBottom (6) + inputRow paddingTop (2) from OnboardingDropdownField
  },
  asterisk: {
    color: colors.text.primary,
  },
  textInput: {
    ...typography.body,
    color: colors.text.primary,
    paddingVertical: vs(4),
  },
  descriptionInput: {
    minHeight: vs(60),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  charCount: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: hs(16),
    paddingBottom: vs(24),
    paddingTop: vs(12),
    gap: hs(12),
  },
  cancelButton: {
    flex: 1,
    borderRadius: ms(12),
    paddingVertical: vs(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: vs(44),
    borderWidth: ms(1.5),
    borderColor: colors.border.medium,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },
  continueButton: {
    flex: 1,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.medium,
    marginVertical: vs(12),
  },
  sectionDividerThick: {
    height: ms(1),
    backgroundColor: colors.border.dark,
  },
  sectionDividerExtraTight: {
    marginTop: vs(4),
    marginBottom: vs(12),
  },
  durationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(12),
  },
  durationUnitText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: hs(8),
    marginBottom: vs(16),
  },
  chip: {
    paddingHorizontal: hs(12),
    paddingVertical: vs(8),
    borderRadius: ms(20),
    borderWidth: ms(1),
  },
  chipActive: {
    backgroundColor: colors.button.primary,
    borderColor: colors.button.primary,
  },
  chipInactive: {
    backgroundColor: 'transparent',
    borderColor: colors.border.medium,
  },
  chipText: {
    ...typography.body,
    color: colors.text.primary,
  },
  chipTextActive: {
    color: colors.text.white,
  },
  bufferHeaderRowContainer: {
    position: 'relative',
    marginBottom: vs(12),
  },
  bufferHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tooltipWrapper: {
    position: 'absolute',
    top: vs(28),
    right: 0,
    alignItems: 'flex-end',
    zIndex: 1000,
    elevation: 10,
  },
  tooltipBubble: {
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
  tooltipArrow: {
    position: 'absolute',
    top: -ms(6),
    right: ms(10),
    width: ms(12),
    height: ms(12),
    backgroundColor: colors.button.primary,
    transform: [{ rotate: '45deg' }],
    borderRadius: ms(2),
  },
  tooltipText: {
    ...typography.bodySmall,
    color: colors.text.white,
  },
  assignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(12),
  },
  toggle: {
    width: hs(44),
    height: vs(24),
    borderRadius: ms(12),
    backgroundColor: colors.border.medium,
    padding: ms(2),
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: colors.button.primary,
    justifyContent: 'flex-end',
  },
  toggleThumb: {
    width: vs(20),
    height: vs(20),
    borderRadius: ms(10),
    backgroundColor: colors.background.white,
  },
  toggleThumbActive: {
    backgroundColor: colors.background.white,
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
    maxHeight: Dimensions.get('window').height * 0.5,
  },
  modalScrollView: {
    maxHeight: Dimensions.get('window').height * 0.4,
  },
  modalChipContainer: {
    paddingBottom: vs(8),
  },
  modalChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: hs(8),
    justifyContent: 'space-between',
  },
  modalChip: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: ms(1),
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: vs(8),
  },
  modalOption: {
    paddingVertical: vs(12),
    paddingHorizontal: hs(4),
  },
  modalOptionText: {
    ...typography.body,
    color: colors.text.primary,
  },
  customInputContainer: {
    marginTop: vs(12),
    marginBottom: vs(16),
  },
  customInput: {
    ...typography.body,
    color: colors.text.primary,
    paddingVertical: vs(12),
    paddingHorizontal: hs(16),
    borderRadius: ms(12),
    borderWidth: ms(1),
    borderColor: colors.border.medium,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(16),
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
  staffListContainer: {
    maxHeight: vs(400),
  },
  staffOption: {
    paddingVertical: vs(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.medium,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: vs(20),
    height: vs(20),
    borderRadius: ms(4),
    borderWidth: ms(2),
    borderColor: colors.border.medium,
    marginRight: hs(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: colors.button.primary,
    backgroundColor: colors.button.primary,
  },
  checkmark: {
    color: colors.text.white,
    fontSize: ms(14),
    fontWeight: 'bold',
  },
  staffOptionText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
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
  imagesInstruction: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: vs(16),
  },
  imageUploadArea: {
    width: '100%',
    minHeight: vs(200),
    borderRadius: ms(12),
    backgroundColor: 'transparent',
    borderWidth: ms(1.5),
    borderColor: colors.border.dark,
    marginBottom: vs(20),
    overflow: 'hidden',
  },
  imageUploadContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(40),
    paddingHorizontal: hs(20),
  },
  uploadIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(12),
  },
  uploadText: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: vs(8),
    fontWeight: '600',
  },
  uploadHint: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  uploadedImage: {
    width: '100%',
    height: vs(200),
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: colors.background.white,
    borderRadius: ms(12),
    padding: vs(24),
    alignItems: 'center',
    minWidth: hs(120),
  },
});

export default AddServiceScreen;


