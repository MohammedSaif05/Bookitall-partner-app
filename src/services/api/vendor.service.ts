/**
 * Vendor API Service
 * Handles all vendor onboarding-related API calls
 * 
 * @format
 */

import { API_ENDPOINTS, API_CONFIG } from '../../utils/constants';
import apiClient from './client';
import type { ApiResponse } from '../../types/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Business Setup Request Payload
 */
export interface BusinessSetupRequest {
  userId: string;
  step: number;
  businessName: string;
  businessCategory: string;
  businessType: string;
}

/**
 * Business Setup Response Data
 */
export interface BusinessSetupResponseData {
  message?: string;
  [key: string]: unknown;
}

/**
 * Business Location Request Payload
 */
export interface BusinessLocationRequest {
  userId: string;
  step: number;
  address: string;
  landmark: string;
  googleMapLink?: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

/**
 * Business Owner Details Request Payload
 */
export interface BusinessOwnerDetailsRequest {
  userId: string;
  step: number;
  ownerName: string;
  businessEmail?: string;
  alternatePhoneNumber?: string;
}

/**
 * Break Period for Operating Hours
 */
export interface BreakPeriod {
  break_start: string; // Format: "HH:mm" (24-hour)
  break_end: string;   // Format: "HH:mm" (24-hour)
}

/**
 * Day Timing for Different Timings Mode
 */
export interface DayTiming {
  day: string; // "Monday", "Tuesday", etc.
  start_time: string; // Format: "HH:mm" (24-hour)
  end_time: string;   // Format: "HH:mm" (24-hour)
  breaks: BreakPeriod[];
}

/**
 * Operating Hours Request Payload - Same Hours Mode
 */
export interface OperatingHoursSameRequest {
  userId: string;
  step: number;
  different_timings_each_day: false;
  working_days: string[]; // ["Monday", "Tuesday", ...]
  start_time: string;    // Format: "HH:mm" (24-hour)
  end_time: string;      // Format: "HH:mm" (24-hour)
  has_break_hours: boolean;
  breaks: BreakPeriod[];
}

/**
 * Operating Hours Request Payload - Different Timings Mode
 */
export interface OperatingHoursDifferentRequest {
  userId: string;
  step: number;
  different_timings_each_day: true;
  days: DayTiming[];
}

/**
 * Union type for Operating Hours Request
 */
export type OperatingHoursRequest = OperatingHoursSameRequest | OperatingHoursDifferentRequest;

/**
 * Staff Member
 */
export interface StaffMember {
  name: string;
  isActive: boolean;
}

/**
 * Service
 */
export interface Service {
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  serviceCost: number;
  gender: string;
  description: string;
  category: string;
  bufferTime: number;
  assignedStaff: string[];
  maximumNo: number;
  serviceImage?: string; // Optional service image URL
  isActive?: boolean; // Optional active status
}

/**
 * Services Response Data
 */
export interface ServicesResponseData {
  userId: string;
  businessName: string;
  services: Service[];
}

/**
 * Vendor Data Response
 * Response structure for vendor data
 */
export interface VendorData {
  _id: string;
  userId: string;
  __v: number;
  breaks: Array<{
    break_start: string;
    break_end: string;
  }>;
  createdAt: string;
  days: Array<{
    day: string;
    start_time: string;
    end_time: string;
    breaks: Array<{
      break_start: string;
      break_end: string;
    }>;
  }>;
  mobileNo: string;
  updatedAt: string;
  workingDays: string[];
  businessCategory: string;
  businessName: string;
  businessType: string;
  step: number;
  address: string;
  city: string;
  googleMapLink?: string;
  landmark: string;
  latitude: number;
  longitude: number;
  pincode: string;
  alternatePhoneNumber?: string;
  businessEmail?: string;
  ownerName: string;
  differentTimingsEachDay: boolean;
  endTime?: string;
  hasBreakHours: boolean;
  startTime?: string;
  isOnBoardCompleted: boolean;
  isBusinessVerified: boolean;
  staff?: StaffMember[]; // Optional staff array
  services?: Service[]; // Optional services array
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
  }; // Optional bank details
  businessImages?: string[]; // Optional business images array
  businessDocument?: string | string[]; // Optional business documents (can be string or array)
  serviceRejectMessage?: string; // Service rejection message
  bankRejectMessage?: string; // Bank details rejection message
  imageRejectMessage?: string; // Business images rejection message
  documentRejectMessage?: string; // Business document rejection message
  isBusinessDocumentApproved?: boolean; // Business document approval status
  isBusinessImageApproved?: boolean; // Business image approval status
  shopId?: string; // Shop ID
}

/**
 * Vendor Service
 * Provides methods for vendor onboarding operations
 */
class VendorService {
  /**
   * Get vendor data by userId
   * @param userId - User ID
   * @returns Promise with vendor data response
   */
  async getVendorByUserId(userId: string): Promise<ApiResponse<VendorData>> {
    try {
      const response = await apiClient.get<VendorData>(
        `${API_ENDPOINTS.VENDOR.GET_VENDOR}/${userId}`
      );
      return response;
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }
  /**
   * Update business setup (Step 1)
   * @param payload - Business setup data
   * @returns Promise with update response
   */
  async updateBusinessSetup(payload: BusinessSetupRequest): Promise<ApiResponse<BusinessSetupResponseData>> {
    try {
      const response = await apiClient.patch<BusinessSetupResponseData>(
        `${API_ENDPOINTS.VENDOR.ONBOARDING}/${payload.userId}`,
        {
          userId: payload.userId,
          step: payload.step,
          businessName: payload.businessName,
          businessCategory: payload.businessCategory,
          businessType: payload.businessType,
        }
      );
      return response;
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }

  /**
   * Update business location (Step 2)
   * @param payload - Business location data
   * @returns Promise with update response
   */
  async updateBusinessLocation(payload: BusinessLocationRequest): Promise<ApiResponse<BusinessSetupResponseData>> {
    try {
      const response = await apiClient.patch<BusinessSetupResponseData>(
        `${API_ENDPOINTS.VENDOR.ONBOARDING}/${payload.userId}`,
        {
          userId: payload.userId,
          step: payload.step,
          address: payload.address,
          landmark: payload.landmark,
          googleMapLink: payload.googleMapLink || undefined,
          city: payload.city,
          pincode: payload.pincode,
          latitude: payload.latitude,
          longitude: payload.longitude,
        }
      );
      return response;
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }

  /**
   * Update business owner details (Step 3)
   * @param payload - Business owner details data
   * @returns Promise with update response
   */
  async updateBusinessOwnerDetails(payload: BusinessOwnerDetailsRequest): Promise<ApiResponse<BusinessSetupResponseData>> {
    try {
      const requestBody: Record<string, unknown> = {
        userId: payload.userId,
        step: payload.step,
        ownerName: payload.ownerName,
      };

      // Only include optional fields if they have values
      if (payload.businessEmail && payload.businessEmail.trim().length > 0) {
        requestBody.businessEmail = payload.businessEmail.trim();
      }
      if (payload.alternatePhoneNumber && payload.alternatePhoneNumber.trim().length > 0) {
        requestBody.alternatePhoneNumber = payload.alternatePhoneNumber.trim();
      }

      const response = await apiClient.patch<BusinessSetupResponseData>(
        `${API_ENDPOINTS.VENDOR.ONBOARDING}/${payload.userId}`,
        requestBody
      );
      return response;
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }

  /**
   * Update operating hours (Step 4)
   * @param payload - Operating hours data (same or different timings)
   * @returns Promise with update response
   */
  async updateOperatingHours(payload: OperatingHoursRequest): Promise<ApiResponse<BusinessSetupResponseData>> {
    try {
      const response = await apiClient.patch<BusinessSetupResponseData>(
        `${API_ENDPOINTS.VENDOR.ONBOARDING}/${payload.userId}`,
        payload
      );
      return response;
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }

  /**
   * Get staff members
   * @param userId - User ID
   * @returns Promise with staff list response
   */
  async getStaff(userId: string): Promise<ApiResponse<StaffMember[]>> {
    try {
      const response = await apiClient.get<StaffMember[]>(
        `${API_ENDPOINTS.VENDOR.ONBOARDING}/${userId}/staff`
      );
      return response;
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }

  /**
   * Add staff member
   * @param userId - User ID
   * @param staffName - Staff member name
   * @returns Promise with update response
   */
  async addStaff(userId: string, staffName: string): Promise<ApiResponse<BusinessSetupResponseData>> {
    try {
      const response = await apiClient.patch<BusinessSetupResponseData>(
        `${API_ENDPOINTS.VENDOR.ONBOARDING}/${userId}/add-staff`,
        {
          staff: [
            {
              name: staffName.trim(),
              isActive: true,
            },
          ],
        }
      );
      return response;
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }

  /**
   * Delete staff member
   * @param userId - User ID
   * @param staffName - Staff member name to delete
   * @returns Promise with delete response
   */
  async deleteStaff(userId: string, staffName: string): Promise<ApiResponse<BusinessSetupResponseData>> {
    try {
      const response = await apiClient.delete<BusinessSetupResponseData>(
        `${API_ENDPOINTS.VENDOR.ONBOARDING}/${userId}/staff`,
        {
          data: {
            name: staffName.trim(),
          },
        }
      );
      return response;
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }

  /**
   * Update staff member
   * @param userId - User ID
   * @param currentName - Current staff member name
   * @param newName - New staff member name
   * @param isActive - Staff active status
   * @returns Promise with update response
   */
  async updateStaff(
    userId: string,
    currentName: string,
    newName: string,
    isActive: boolean
  ): Promise<ApiResponse<BusinessSetupResponseData>> {
    try {
      const response = await apiClient.patch<BusinessSetupResponseData>(
        `${API_ENDPOINTS.VENDOR.ONBOARDING}/${userId}/update-staff`,
        {
          currentName: currentName.trim(),
          newName: newName.trim(),
          isActive,
        }
      );
      return response;
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }

  /**
   * Add service (JSON)
   * @param userId - User ID
   * @param serviceData - Service data object
   * @returns Promise with add service response
   */
  async addService(
    userId: string,
    serviceData: {
      serviceName: string;
      serviceDuration: number;
      serviceCost: number;
      gender: string;
      description: string;
      category: string;
      bufferTime: number;
      assignedStaff: string[];
      maximumNo: number;
    }
  ): Promise<ApiResponse<BusinessSetupResponseData>> {
    try {
      // Validate serviceData is not null/undefined
      if (!serviceData) {
        throw new Error('Service data is required');
      }

      // Prepare payload with service nested inside
      const payload = {
        service: serviceData,
      };

      // if (__DEV__) {
      //   console.log('[AddService] Payload being sent:', JSON.stringify(payload, null, 2));
      // }

      // Make PATCH request with JSON payload
      const response = await apiClient.patch<BusinessSetupResponseData>(
        `${API_ENDPOINTS.VENDOR.ADD_SERVICE_JSON}/${userId}/add-service-json`,
        payload
      );

      return response;
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }

  /**
   * Upload service image
   * @param userId - User ID
   * @param serviceId - Service ID from add-service-json response
   * @param imageUri - Image URI
   * @returns Promise with upload response
   */
  async uploadServiceImage(
    userId: string,
    serviceId: string,
    imageUri: string
  ): Promise<ApiResponse<BusinessSetupResponseData>> {
    try {
      // Validate inputs
      if (!serviceId) {
        throw new Error('Service ID is required');
      }
      if (!imageUri) {
        throw new Error('Image URI is required');
      }

      // Create FormData for image upload
      // Backend expects exactly: serviceId (text) and serviceImage (file)
      // userId is already in the URL path, so don't include it in FormData
      const formData = new FormData();
      
      // Append serviceId as string (required by backend)
      formData.append('serviceId', serviceId);

      // Append image file (required by backend)
      // React Native FormData requires uri, type, and name
      const imageFile = {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'service-image.jpg',
      };
      formData.append('serviceImage', imageFile as any);

      // if (__DEV__) {
      //   console.log('[UploadServiceImage] Uploading image for serviceId:', serviceId);
      //   console.log('[UploadServiceImage] FormData entries:');
      //   // Log FormData structure (note: FormData doesn't support direct inspection in RN)
      //   console.log('[UploadServiceImage] serviceId:', serviceId);
      //   console.log('[UploadServiceImage] imageFile:', {
      //     uri: imageUri,
      //     type: 'image/jpeg',
      //     name: 'service-image.jpg',
      //   });
      // }

      // Make PATCH request with FormData
      // Use fetch API directly for FormData as it's more reliable in React Native
      const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.VENDOR.ADD_SERVICE}/${userId}/add-service`;
      
      // Get auth token from storage
      const token = await AsyncStorage.getItem('auth_token');
      
      // if (__DEV__) {
      //   console.log('[UploadServiceImage] Request URL:', url);
      //   console.log('[UploadServiceImage] ServiceId:', serviceId);
      //   console.log('[UploadServiceImage] Image URI:', imageUri);
      // }
      
      // Use fetch API for FormData upload (more reliable in React Native)
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          Accept: 'application/json',
          // Don't set Content-Type - fetch will set it automatically with boundary for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        let errorData: any;
        try {
          const text = await response.text();
          errorData = text ? JSON.parse(text) : { message: 'Unknown error' };
        } catch {
          errorData = { 
            success: false,
            message: `Upload failed with status ${response.status}` 
          };
        }
        
        if (__DEV__) {
          console.error('[UploadServiceImage] Full error response:', JSON.stringify(errorData, null, 2));
          console.error('[UploadServiceImage] Response status:', response.status);
          console.error('[UploadServiceImage] ServiceId sent:', serviceId);
          console.error('[UploadServiceImage] UserId sent:', userId);
        }
        
        // Extract error message from various possible formats
        const errorMessage = 
          errorData.message || 
          errorData.error?.message || 
          errorData.error ||
          `Upload failed with status ${response.status}`;
        
        throw new Error(`Failed to add service image: ${errorMessage}`);
      }

      const responseData: ApiResponse<BusinessSetupResponseData> = await response.json();
      
      // if (__DEV__) {
      //   console.log('[UploadServiceImage] Success response:', JSON.stringify(responseData, null, 2));
      // }
      
      return responseData;
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }

  /**
   * Get services for a vendor
   * @param userId - User ID
   * @returns Promise with services response
   */
  async getServices(userId: string): Promise<ApiResponse<ServicesResponseData>> {
    try {
      const response = await apiClient.get<ServicesResponseData>(
        `${API_ENDPOINTS.VENDOR.GET_SERVICES}/${userId}/services`
      );
      return response;
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }

  /**
   * Delete a service
   * @param userId - User ID
   * @param serviceId - Service ID to delete
   * @returns Promise with delete response
   */
  async deleteService(
    userId: string,
    serviceId: string
  ): Promise<ApiResponse<BusinessSetupResponseData>> {
    try {
      const response = await apiClient.delete<BusinessSetupResponseData>(
        `${API_ENDPOINTS.VENDOR.ADD_SERVICE}/${userId}/service`,
        {
          data: {
            serviceId,
          },
        }
      );
      return response;
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }

  /**
   * Update service (JSON)
   * @param userId - User ID
   * @param serviceId - Service ID to update
   * @param serviceData - Updated service data
   * @returns Promise with update response
   */
  async updateService(
    userId: string,
    serviceId: string,
    serviceData: {
      serviceName: string;
      serviceDuration: number;
      serviceCost: number;
      gender: string;
      description: string;
      category: string;
      bufferTime: number;
      assignedStaff: string[];
      maximumNo: number;
      isActive?: boolean;
    }
  ): Promise<ApiResponse<BusinessSetupResponseData>> {
    try {
      // Validate inputs
      if (!userId) {
        throw new Error('User ID is required');
      }
      if (!serviceId) {
        throw new Error('Service ID is required');
      }
      if (!serviceData) {
        throw new Error('Service data is required');
      }

      // Prepare payload exactly as backend expects: userId, serviceId, and all service fields
      const payload: {
        userId: string;
        serviceId: string;
        serviceName: string;
        serviceDuration: number;
        serviceCost: number;
        gender: string;
        description: string;
        category: string;
        bufferTime: number;
        assignedStaff: string[];
        maximumNo: number;
        isActive?: boolean;
      } = {
        userId: userId,
        serviceId: serviceId,
        serviceName: serviceData.serviceName,
        serviceDuration: serviceData.serviceDuration,
        serviceCost: serviceData.serviceCost,
        gender: serviceData.gender,
        description: serviceData.description,
        category: serviceData.category,
        bufferTime: serviceData.bufferTime,
        assignedStaff: serviceData.assignedStaff,
        maximumNo: serviceData.maximumNo,
      };

      // Add isActive if provided
      if (serviceData.isActive !== undefined) {
        payload.isActive = serviceData.isActive;
      }

      // if (__DEV__) {
      //   console.log('[UpdateService] UserId:', userId);
      //   console.log('[UpdateService] ServiceId:', serviceId);
      //   console.log('[UpdateService] Payload being sent:', JSON.stringify(payload, null, 2));
      // }

      // Make PATCH request with JSON payload
      const response = await apiClient.patch<BusinessSetupResponseData>(
        `${API_ENDPOINTS.VENDOR.ADD_SERVICE_JSON}/${userId}/update-service-json`,
        payload
      );

      return response;
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }

  /**
   * Upload business documents
   * @param userId - User ID
   * @param documentUris - Array of document file URIs
   * @returns Promise with upload response
   */
  async uploadBusinessDocuments(
    userId: string,
    documentUris: string[]
  ): Promise<ApiResponse<BusinessSetupResponseData>> {
    try {
      // Validate inputs
      if (!userId) {
        throw new Error('User ID is required');
      }
      if (!documentUris || documentUris.length === 0) {
        throw new Error('At least one document is required');
      }

      // Create FormData for document upload
      const formData = new FormData();
      formData.append('userId', userId);

      // Append each document file
      documentUris.forEach((uri, index) => {
        const documentFile = {
          uri: uri,
          type: 'application/pdf',
          name: `business-document-${index + 1}.pdf`,
        };
        formData.append('businessDocument', documentFile as any);
      });

      // Get auth token from storage
      const token = await AsyncStorage.getItem('auth_token');

      // Use fetch API directly for FormData as it's more reliable in React Native
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.VENDOR.BUSINESS_DOCUMENT}/${userId}/business-document`,
        {
          method: 'PATCH',
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            Accept: 'application/json',
            // Don't set Content-Type - fetch will set it automatically with boundary for FormData
          },
          body: formData,
        }
      );

      if (!response.ok) {
        let errorData: any;
        try {
          const text = await response.text();
          errorData = text ? JSON.parse(text) : { message: 'Unknown error' };
        } catch {
          errorData = {
            success: false,
            message: `Upload failed with status ${response.status}`,
          };
        }

        const errorMessage =
          errorData.message ||
          errorData.error?.message ||
          errorData.error ||
          `Upload failed with status ${response.status}`;

        throw new Error(`Failed to upload business documents: ${errorMessage}`);
      }

      const responseData: ApiResponse<BusinessSetupResponseData> =
        await response.json();

      return responseData;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to upload business documents. Please try again.';
      throw new Error(errorMessage);
    }
  }

  /**
   * Upload business images
   * @param userId - User ID
   * @param primaryImageUri - Primary image URI
   * @param galleryImageUris - Array of gallery image URIs
   * @returns Promise with upload response
   */
  async uploadBusinessImages(
    userId: string,
    primaryImageUri: string,
    galleryImageUris: string[]
  ): Promise<ApiResponse<BusinessSetupResponseData>> {
    try {
      // Validate inputs
      if (!userId) {
        throw new Error('User ID is required');
      }
      if (!primaryImageUri) {
        throw new Error('Primary image is required');
      }

      // Create FormData for image upload
      const formData = new FormData();
      formData.append('userId', userId);

      // Combine all images (primary + gallery) and send all as businessImages
      const allImages = [primaryImageUri, ...galleryImageUris];
      
      // Append all images as businessImages keys
      allImages.forEach((uri, index) => {
        const imageFile = {
          uri: uri,
          type: 'image/jpeg',
          name: `business-image-${index + 1}.jpg`,
        };
        formData.append('businessImages', imageFile as any);
      });

      // Get auth token from storage
      const token = await AsyncStorage.getItem('auth_token');

      // Use fetch API directly for FormData as it's more reliable in React Native
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.VENDOR.BUSINESS_IMAGES}/${userId}/business-images`,
        {
          method: 'PATCH',
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            Accept: 'application/json',
            // Don't set Content-Type - fetch will set it automatically with boundary for FormData
          },
          body: formData,
        }
      );

      if (!response.ok) {
        let errorData: any;
        try {
          const text = await response.text();
          errorData = text ? JSON.parse(text) : { message: 'Unknown error' };
        } catch {
          errorData = {
            success: false,
            message: `Upload failed with status ${response.status}`,
          };
        }

        const errorMessage =
          errorData.message ||
          errorData.error?.message ||
          errorData.error ||
          `Upload failed with status ${response.status}`;

        throw new Error(`Failed to upload business images: ${errorMessage}`);
      }

      const responseData: ApiResponse<BusinessSetupResponseData> =
        await response.json();

      return responseData;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to upload business images. Please try again.';
      throw new Error(errorMessage);
    }
  }

  /**
   * Toggle service active status
   * @param userId - User ID
   * @param serviceId - Service ID
   * @param isActive - Active status (true/false)
   * @returns Promise with update response
   */
  async toggleServiceStatus(
    userId: string,
    serviceId: string,
    isActive: boolean
  ): Promise<ApiResponse<BusinessSetupResponseData>> {
    try {
      // Validate inputs
      if (!userId) {
        throw new Error('User ID is required');
      }
      if (!serviceId) {
        throw new Error('Service ID is required');
      }

      // Prepare payload with only userId, serviceId, and isActive
      const payload = {
        userId: userId,
        serviceId: serviceId,
        isActive: isActive,
      };

      // if (__DEV__) {
      //   console.log('[ToggleServiceStatus] Payload being sent:', JSON.stringify(payload, null, 2));
      // }

      // Make PATCH request with JSON payload
      const response = await apiClient.patch<BusinessSetupResponseData>(
        `${API_ENDPOINTS.VENDOR.ADD_SERVICE_JSON}/${userId}/update-service-json`,
        payload
      );

      return response;
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }

  /**
   * Update service image
   * @param userId - User ID
   * @param serviceId - Service ID
   * @param imageUri - Image URI
   * @returns Promise with update response
   */
  async updateServiceImage(
    userId: string,
    serviceId: string,
    imageUri: string
  ): Promise<ApiResponse<BusinessSetupResponseData>> {
    try {
      // Validate inputs
      if (!serviceId) {
        throw new Error('Service ID is required');
      }
      if (!imageUri) {
        throw new Error('Image URI is required');
      }

      // Create FormData for image upload
      // Backend expects exactly: serviceId and serviceImage
      const formData = new FormData();
      
      // Append serviceId as string (required by backend)
      formData.append('serviceId', serviceId);

      // Append image file (required by backend)
      // React Native FormData requires uri, type, and name
      const imageFile = {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'service-image.jpg',
      };
      formData.append('serviceImage', imageFile as any);

      // if (__DEV__) {
      //   console.log('[UpdateServiceImage] Uploading image for serviceId:', serviceId);
      // }

      // Make PATCH request with FormData
      // Use fetch API directly for FormData as it's more reliable in React Native
      const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.VENDOR.ADD_SERVICE}/${userId}/update-service`;
      
      // Get auth token from storage
      const token = await AsyncStorage.getItem('auth_token');
      
      // if (__DEV__) {
      //   console.log('[UpdateServiceImage] Request URL:', url);
      //   console.log('[UpdateServiceImage] ServiceId:', serviceId);
      //   console.log('[UpdateServiceImage] Image URI:', imageUri);
      // }
      
      // Use fetch API for FormData upload (more reliable in React Native)
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          Accept: 'application/json',
          // Don't set Content-Type - fetch will set it automatically with boundary for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        let errorData: any;
        try {
          const text = await response.text();
          errorData = text ? JSON.parse(text) : { message: 'Unknown error' };
        } catch {
          errorData = { 
            success: false,
            message: `Upload failed with status ${response.status}` 
          };
        }
        
        if (__DEV__) {
          console.error('[UpdateServiceImage] Full error response:', JSON.stringify(errorData, null, 2));
          console.error('[UpdateServiceImage] Response status:', response.status);
          console.error('[UpdateServiceImage] ServiceId sent:', serviceId);
          console.error('[UpdateServiceImage] UserId sent:', userId);
        }
        
        // Extract error message from various possible formats
        const errorMessage = 
          errorData.message || 
          errorData.error?.message || 
          errorData.error ||
          `Upload failed with status ${response.status}`;
        
        throw new Error(`Failed to update service image: ${errorMessage}`);
      }

      const responseData: ApiResponse<BusinessSetupResponseData> = await response.json();
      
      // if (__DEV__) {
      //   console.log('[UpdateServiceImage] Success response:', JSON.stringify(responseData, null, 2));
      // }
      
      return responseData;
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }

  /**
   * Add bank details
   * @param userId - User ID
   * @param bankDetails - Bank details object
   * @returns Promise with response
   */
  async addBankDetails(
    userId: string,
    bankDetails: {
      accountHolderName: string;
      accountNumber: string;
      ifscCode: string;
    }
  ): Promise<ApiResponse<BusinessSetupResponseData>> {
    try {
      // Validate inputs
      if (!userId) {
        throw new Error('User ID is required');
      }
      if (!bankDetails) {
        throw new Error('Bank details are required');
      }
      if (!bankDetails.accountHolderName || !bankDetails.accountNumber || !bankDetails.ifscCode) {
        throw new Error('All bank detail fields are required');
      }

      // Prepare payload as backend expects
      const payload = {
        userId: userId,
        bankDetails: {
          accountNumber: bankDetails.accountNumber.trim(),
          ifscCode: bankDetails.ifscCode.trim(),
          accountHolderName: bankDetails.accountHolderName.trim(),
        },
      };

      // Make PATCH request with JSON payload
      const response = await apiClient.patch<BusinessSetupResponseData>(
        `${API_ENDPOINTS.VENDOR.ONBOARDING}/${userId}/add-bank-details`,
        payload
      );

      return response;
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }
}

// Export singleton instance
export const vendorService = new VendorService();

// Export default for convenience
export default vendorService;

