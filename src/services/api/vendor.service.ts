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
import mime from 'mime';
import { Platform } from 'react-native';

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
 * Business Images Upload Response Data
 */
export interface BusinessImagesUploadResponseData {
  imageUrls: string[];
}

/**
 * Business Document Upload Response Data
 */
export interface BusinessDocumentUploadResponseData {
  documentUrl: string;
}

/**
 * Service Image Upload Response Data
 */
export interface ServiceImageUploadResponseData {
  imageUrl: string;
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
  latitude?: number;
  longitude?: number;
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
          ...(payload.latitude !== undefined && { latitude: payload.latitude }),
          ...(payload.longitude !== undefined && { longitude: payload.longitude }),
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
   * Two-step process:
   * 1. Upload image file to get URL
   * 2. Save image URL metadata
   * @param userId - User ID
   * @param serviceId - Service ID
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
      if (!userId) {
        throw new Error('User ID is required');
      }
      if (!serviceId) {
        throw new Error('Service ID is required');
      }
      if (!imageUri) {
        throw new Error('Image URI is required');
      }

      // Get auth token from storage
      const token = await AsyncStorage.getItem('auth_token');

      // Step 1: Upload image file using POST
      const formData = new FormData();
      // Append userId and serviceId as plain strings
      // Note: FormData.append automatically converts to string, so no need for JSON.stringify
      formData.append('userId', userId);
      formData.append('serviceId', serviceId);

      // Append image file
      const filename = imageUri.split('/').pop() || 'service-image.jpg';
      // Use mime package to get correct MIME type
      const type = mime.getType(filename) || 'image/jpeg';

      // For iOS, ensure proper URI format
      // React Native iOS FormData needs the file:// prefix
      // Also handle iOS photo library URIs (ph://, assets-library://)
      let finalUri = imageUri;
      if (!imageUri.startsWith('file://') && !imageUri.startsWith('content://') && !imageUri.startsWith('ph://') && !imageUri.startsWith('assets-library://') && !imageUri.startsWith('http://') && !imageUri.startsWith('https://')) {
        finalUri = `file://${imageUri}`;
      }
      
      // Clean up URI for iOS - remove any double slashes
      if (finalUri.includes('file:////')) {
        finalUri = finalUri.replace(/file:\/\/\/+/g, 'file:///');
      }
      
      // On iOS, ensure single slash after file:// (file:///path not file://path)
      if (Platform.OS === 'ios' && finalUri.startsWith('file://') && !finalUri.startsWith('file:///')) {
        // This shouldn't happen, but handle it just in case
        finalUri = finalUri.replace('file://', 'file:///');
      }

      // For iOS FormData, ensure proper file object structure
      // Match the exact structure used in business images upload
      const imageFile: any = {
        uri: finalUri,
        name: filename,
        type, // Now correctly set to 'image/jpeg' for jpg files
      };
      
      formData.append('serviceImage', imageFile);
      
      if (__DEV__) {
        console.log('[UploadServiceImage] FormData prepared:', {
          userId,
          serviceId,
          filename: imageFile.name,
          type: imageFile.type,
          uriLength: finalUri.length,
        });
      }

      // POST request to upload image
      let uploadResponse: Response;
      try {
        if (__DEV__) {
          console.log('[UploadServiceImage] Uploading image:', {
            userId,
            serviceId,
            imageUri: finalUri,
            filename: imageFile.name,
            type: imageFile.type, // Should now show 'image/jpeg' instead of 'image/jpg'
          });
        }
        
        const uploadUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.VENDOR.UPLOAD_SERVICE_IMAGE}/${userId}/upload-service-image`;
        
        if (__DEV__) {
          console.log('[UploadServiceImage] Upload URL:', uploadUrl);
        }
        
        // Prepare headers - iOS FormData requires specific header handling
        // iOS has known issues with Accept header when using FormData with fetch
        const fetchOptions: RequestInit = {
          method: 'POST',
          body: formData,
        };
        
        // Build headers conditionally - iOS is very sensitive to headers with FormData
        // On iOS, only include headers if we have a token (no Accept header)
        // On Android, include Accept header even without token
        const headers: Record<string, string> = {};
        
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        
        // Only add Accept header on Android - iOS FormData fails with it
        if (Platform.OS === 'android') {
          headers.Accept = 'application/json';
        }
        
        // Only set headers if we have any (iOS doesn't like empty headers object)
        if (Object.keys(headers).length > 0) {
          fetchOptions.headers = headers;
        }
        
        // CRITICAL: Never set Content-Type for FormData - React Native will set it automatically
        // with the correct boundary. Manually setting it will cause upload to fail.
        
        if (__DEV__) {
          console.log('[UploadServiceImage] Platform:', Platform.OS);
          console.log('[UploadServiceImage] Fetch options:', {
            method: fetchOptions.method,
            hasHeaders: !!fetchOptions.headers,
            headers: fetchOptions.headers,
            hasToken: !!token,
          });
        }
        
        uploadResponse = await fetch(uploadUrl, fetchOptions);
      } catch (fetchError) {
        if (__DEV__) {
          console.error('[UploadServiceImage] Fetch error:', fetchError);
          console.error('[UploadServiceImage] Error details:', {
            message: fetchError instanceof Error ? fetchError.message : 'Unknown error',
            name: fetchError instanceof Error ? fetchError.name : 'Unknown',
            stack: fetchError instanceof Error ? fetchError.stack : undefined,
          });
        }
        throw new Error(
          fetchError instanceof Error && (fetchError.message.includes('Network request failed') || fetchError.message.includes('cannot parse response'))
            ? 'Network request failed. Please check your internet connection and try again.'
            : `Failed to upload service image: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`
        );
      }

      if (!uploadResponse.ok) {
        let errorData: any;
        try {
          const text = await uploadResponse.text();
          errorData = text ? JSON.parse(text) : { message: 'Unknown error' };
        } catch {
          errorData = { 
            success: false,
            message: `Upload failed with status ${uploadResponse.status}` 
          };
        }
        
        if (__DEV__) {
          console.error('[UploadServiceImage] Full error response:', JSON.stringify(errorData, null, 2));
          console.error('[UploadServiceImage] Response status:', uploadResponse.status);
          console.error('[UploadServiceImage] ServiceId sent:', serviceId);
          console.error('[UploadServiceImage] UserId sent:', userId);
        }
        
        // Extract error message from various possible formats
        const errorMessage = 
          errorData.message || 
          errorData.error?.message || 
          errorData.error ||
          `Upload failed with status ${uploadResponse.status}`;
        
        throw new Error(`Failed to upload service image: ${errorMessage}`);
      }

      const uploadRaw = await uploadResponse.text();
      if (__DEV__) {
        console.log('[UploadServiceImage] UPLOAD RAW RESPONSE:', uploadRaw);
      }

      let uploadResponseData: ApiResponse<ServiceImageUploadResponseData>;
      try {
        uploadResponseData = JSON.parse(uploadRaw);
      } catch {
        throw new Error('Server did not return valid JSON from upload endpoint');
      }

      if (!uploadResponseData.success || !uploadResponseData.data?.imageUrl) {
        throw new Error('Failed to upload service image: Invalid response from server');
      }

      const imageUrl = uploadResponseData.data.imageUrl;

      // Step 2: Save image URL metadata using PATCH
      const savePayload = {
        userId: userId,
        serviceId: serviceId,
        imageUrl: imageUrl,
      };

      const saveResponse = await apiClient.patch<BusinessSetupResponseData>(
        `${API_ENDPOINTS.VENDOR.SAVE_SERVICE_IMAGE}/${userId}/save-service-image`,
        savePayload
      );

      if (!saveResponse.success) {
        throw new Error('Failed to save service image metadata');
      }

      return saveResponse;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to upload service image. Please try again.';
      throw new Error(errorMessage);
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
   * Two-step process:
   * 1. Upload document file to get URL
   * 2. Save document URL metadata
   * @param userId - User ID
   * @param documentUri - Document file URI (single file)
   * @returns Promise with upload response
   */
  async uploadBusinessDocuments(
    userId: string,
    documentUri: string
  ): Promise<ApiResponse<BusinessSetupResponseData>> {
    try {
      // Validate inputs
      if (!userId) {
        throw new Error('User ID is required');
      }
      if (!documentUri) {
        throw new Error('Document is required');
      }

      // Get auth token from storage
      const token = await AsyncStorage.getItem('auth_token');

      // Step 1: Upload document file using POST
      const formData = new FormData();
      // Append userId as plain string
      // Note: FormData.append automatically converts to string, so no need for JSON.stringify
      formData.append('userId', userId);
      
      // Extract filename and determine type
      // Handle both file:// and content:// URIs (Android)
      let filename = documentUri.split('/').pop() || 'business-document.pdf';
      // For content URIs, try to extract filename from the URI itself
      if (documentUri.startsWith('content://')) {
        // Content URIs might have encoded filenames, try to extract from the end
        const contentParts = documentUri.split('%2F');
        if (contentParts.length > 0) {
          const lastPart = contentParts[contentParts.length - 1];
          if (lastPart && lastPart.includes('.')) {
            filename = decodeURIComponent(lastPart);
          }
        }
      }
      
      const match = /\.(\w+)$/.exec(filename);
      // Determine MIME type based on file extension
      let type = 'application/pdf'; // Default to PDF
      if (match) {
        const ext = match[1].toLowerCase();
        switch (ext) {
          case 'pdf':
            type = 'application/pdf';
            break;
          case 'doc':
            type = 'application/msword';
            break;
          case 'docx':
            type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
          case 'xls':
            type = 'application/vnd.ms-excel';
            break;
          case 'xlsx':
            type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            break;
          case 'ppt':
            type = 'application/vnd.ms-powerpoint';
            break;
          case 'pptx':
            type = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
            break;
          case 'txt':
            type = 'text/plain';
            break;
          case 'rtf':
            type = 'application/rtf';
            break;
          default:
            type = `application/${ext}`;
        }
      }

      // For iOS, ensure proper URI format
      // iOS needs file:// prefix, but don't add it if already present or if it's a content:// URI
      // Also handle iOS document picker URIs
      let finalUri = documentUri;
      if (!documentUri.startsWith('file://') && !documentUri.startsWith('content://') && !documentUri.startsWith('ph://') && !documentUri.startsWith('assets-library://') && !documentUri.startsWith('http://') && !documentUri.startsWith('https://')) {
        finalUri = `file://${documentUri}`;
      }

      const documentFile = {
        uri: finalUri,
        name: filename,
        type,
      };
      formData.append('businessDocument', documentFile as any);

      // POST request to upload document
      let uploadResponse: Response;
      try {
        if (__DEV__) {
          console.log('[UploadBusinessDocument] Uploading document:', {
            userId,
            documentUri,
            filename: documentFile.name,
            type: documentFile.type,
          });
        }
        
        uploadResponse = await fetch(
          `${API_CONFIG.BASE_URL}${API_ENDPOINTS.VENDOR.UPLOAD_BUSINESS_DOCUMENT}/${userId}/upload-business-document`,
          {
            method: 'POST',
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
              Accept: 'application/json',
              // Don't set Content-Type - fetch will set it automatically with boundary for FormData
            },
            body: formData,
          }
        );
      } catch (fetchError) {
        if (__DEV__) {
          console.error('[UploadBusinessDocument] Fetch error:', fetchError);
        }
        throw new Error(
          fetchError instanceof Error && (fetchError.message.includes('Network request failed') || fetchError.message.includes('cannot parse response'))
            ? 'Network request failed. Please check your internet connection and try again.'
            : `Failed to upload document: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`
        );
      }

      if (!uploadResponse.ok) {
        let errorData: any;
        try {
          const text = await uploadResponse.text();
          errorData = text ? JSON.parse(text) : { message: 'Unknown error' };
        } catch {
          errorData = {
            success: false,
            message: `Upload failed with status ${uploadResponse.status}`,
          };
        }

        const errorMessage =
          errorData.message ||
          errorData.error?.message ||
          errorData.error ||
          `Upload failed with status ${uploadResponse.status}`;

        throw new Error(`Failed to upload business document: ${errorMessage}`);
      }

      const uploadRaw = await uploadResponse.text();
      if (__DEV__) {
        console.log('[UploadBusinessDocument] UPLOAD RAW RESPONSE:', uploadRaw);
      }

      let uploadResponseData: ApiResponse<BusinessDocumentUploadResponseData>;
      try {
        uploadResponseData = JSON.parse(uploadRaw);
      } catch {
        throw new Error('Server did not return valid JSON from upload endpoint');
      }

      if (!uploadResponseData.success || !uploadResponseData.data?.documentUrl) {
        throw new Error('Failed to upload document: Invalid response from server');
      }

      const documentUrl = uploadResponseData.data.documentUrl;

      // Step 2: Save document URL metadata using PATCH
      const savePayload = {
        userId: userId,
        documentUrl: documentUrl,
      };

      const saveResponse = await apiClient.patch<BusinessSetupResponseData>(
        `${API_ENDPOINTS.VENDOR.SAVE_BUSINESS_DOCUMENT}/${userId}/save-business-document`,
        savePayload
      );

      if (!saveResponse.success) {
        throw new Error('Failed to save business document metadata');
      }

      return saveResponse;
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
   * Two-step process:
   * 1. Upload image files to get URLs
   * 2. Save image URLs metadata
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

      // Combine all images (primary + gallery) - minimum 2 files required
      const allImages = [primaryImageUri, ...galleryImageUris];
      
      if (allImages.length < 2) {
        throw new Error('At least 2 images are required');
      }

      // Get auth token from storage
      const token = await AsyncStorage.getItem('auth_token');

      // Step 1: Upload image files using POST
      const formData = new FormData();
      // Append userId as plain string
      // Note: FormData.append automatically converts to string, so no need for JSON.stringify
      formData.append('userId', userId);
      
      // Append all images as businessImages files
      allImages.forEach((uri, index) => {
        // Handle both file:// and content:// URIs (Android)
        let filename = uri.split('/').pop() || `image-${index}.jpg`;
        // For content URIs, try to extract filename from the URI itself
        if (uri.startsWith('content://')) {
          const contentParts = uri.split('%2F');
          if (contentParts.length > 0) {
            const lastPart = contentParts[contentParts.length - 1];
            if (lastPart && lastPart.includes('.')) {
              filename = decodeURIComponent(lastPart);
            }
          }
        }
        
        const match = /\.(\w+)$/.exec(filename);
        // Fix MIME type: jpg should be jpeg, and ensure proper image types
        let type = 'image/jpeg';
        if (match) {
          const ext = match[1].toLowerCase();
          if (ext === 'jpg' || ext === 'jpeg') {
            type = 'image/jpeg';
          } else if (ext === 'png') {
            type = 'image/png';
          } else if (ext === 'gif') {
            type = 'image/gif';
          } else if (ext === 'webp') {
            type = 'image/webp';
          } else {
            type = `image/${ext}`;
          }
        }

        // For iOS, ensure proper URI format
        // iOS needs file:// prefix, but don't add it if already present or if it's a content:// URI
        // Also handle iOS photo library URIs (ph://, assets-library://)
        let finalUri = uri;
        if (!uri.startsWith('file://') && !uri.startsWith('content://') && !uri.startsWith('ph://') && !uri.startsWith('assets-library://') && !uri.startsWith('http://') && !uri.startsWith('https://')) {
          finalUri = `file://${uri}`;
        }

        const imageFile = {
          uri: finalUri,
          name: filename,
          type,
        };
        formData.append('businessImages', imageFile as any);
      });

      // POST request to upload images
      let uploadResponse: Response;
      try {
        if (__DEV__) {
          console.log('[UploadBusinessImages] Uploading images:', {
            userId,
            imageCount: allImages.length,
            imageUris: allImages,
          });
        }
        
        uploadResponse = await fetch(
          `${API_CONFIG.BASE_URL}${API_ENDPOINTS.VENDOR.UPLOAD_BUSINESS_IMAGES}/${userId}/upload-business-images`,
          {
            method: 'POST',
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
              Accept: 'application/json',
              // Don't set Content-Type - fetch will set it automatically with boundary for FormData
            },
            body: formData,
          }
        );
      } catch (fetchError) {
        if (__DEV__) {
          console.error('[UploadBusinessImages] Fetch error:', fetchError);
        }
        throw new Error(
          fetchError instanceof Error && (fetchError.message.includes('Network request failed') || fetchError.message.includes('cannot parse response'))
            ? 'Network request failed. Please check your internet connection and try again.'
            : `Failed to upload images: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`
        );
      }

      if (!uploadResponse.ok) {
        let errorData: any;
        try {
          const text = await uploadResponse.text();
          errorData = text ? JSON.parse(text) : { message: 'Unknown error' };
        } catch {
          errorData = {
            success: false,
            message: `Upload failed with status ${uploadResponse.status}`,
          };
        }

        const errorMessage =
          errorData.message ||
          errorData.error?.message ||
          errorData.error ||
          `Upload failed with status ${uploadResponse.status}`;

        throw new Error(`Failed to upload business images: ${errorMessage}`);
      }

      const uploadRaw = await uploadResponse.text();
      if (__DEV__) {
        console.log('[UploadBusinessImages] UPLOAD RAW RESPONSE:', uploadRaw);
      }

      let uploadResponseData: ApiResponse<BusinessImagesUploadResponseData>;
      try {
        uploadResponseData = JSON.parse(uploadRaw);
      } catch {
        throw new Error('Server did not return valid JSON from upload endpoint');
      }

      if (!uploadResponseData.success || !uploadResponseData.data?.imageUrls) {
        throw new Error('Failed to upload images: Invalid response from server');
      }

      const imageUrls = uploadResponseData.data.imageUrls;

      // Step 2: Save image URLs metadata using PATCH
      const savePayload = {
        userId: userId,
        imageUrls: imageUrls,
      };

      const saveResponse = await apiClient.patch<BusinessSetupResponseData>(
        `${API_ENDPOINTS.VENDOR.SAVE_BUSINESS_IMAGES}/${userId}/save-business-images`,
        savePayload
      );

      if (!saveResponse.success) {
        throw new Error('Failed to save business images metadata');
      }

      return saveResponse;
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
   * Two-step process:
   * 1. Upload image file to get URL
   * 2. Save image URL metadata
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
      if (!userId) {
        throw new Error('User ID is required');
      }
      if (!serviceId) {
        throw new Error('Service ID is required');
      }
      if (!imageUri) {
        throw new Error('Image URI is required');
      }

      // Get auth token from storage
      const token = await AsyncStorage.getItem('auth_token');

      // Step 1: Upload image file using POST
      const formData = new FormData();
      // Append userId and serviceId as plain strings
      // Note: FormData.append automatically converts to string, so no need for JSON.stringify
      formData.append('userId', userId);
      formData.append('serviceId', serviceId);

      // Append image file
      const filename = imageUri.split('/').pop() || 'service-image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      // Fix MIME type: jpg should be jpeg, and ensure proper image types
      let type = 'image/jpeg';
      if (match) {
        const ext = match[1].toLowerCase();
        if (ext === 'jpg' || ext === 'jpeg') {
          type = 'image/jpeg';
        } else if (ext === 'png') {
          type = 'image/png';
        } else if (ext === 'gif') {
          type = 'image/gif';
        } else if (ext === 'webp') {
          type = 'image/webp';
        } else {
          type = `image/${ext}`;
        }
      }

      // For iOS, ensure proper URI format
      // iOS needs file:// prefix, but don't add it if already present or if it's a content:// URI
      let finalUri = imageUri;
      if (!imageUri.startsWith('file://') && !imageUri.startsWith('content://') && !imageUri.startsWith('ph://') && !imageUri.startsWith('assets-library://')) {
        finalUri = `file://${imageUri}`;
      }

      const imageFile = {
        uri: finalUri,
        name: filename,
        type,
      };
      formData.append('serviceImage', imageFile as any);

      // POST request to upload image
      let uploadResponse: Response;
      try {
        if (__DEV__) {
          console.log('[UpdateServiceImage] Uploading image:', {
            userId,
            serviceId,
            imageUri: finalUri,
            filename: imageFile.name,
            type: imageFile.type,
          });
        }
        
        uploadResponse = await fetch(
          `${API_CONFIG.BASE_URL}${API_ENDPOINTS.VENDOR.UPLOAD_SERVICE_IMAGE}/${userId}/upload-service-image`,
          {
            method: 'POST',
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
              Accept: 'application/json',
              // Don't set Content-Type - fetch will set it automatically with boundary for FormData
            },
            body: formData,
          }
        );
      } catch (fetchError) {
        if (__DEV__) {
          console.error('[UpdateServiceImage] Fetch error:', fetchError);
        }
        throw new Error(
          fetchError instanceof Error && (fetchError.message.includes('Network request failed') || fetchError.message.includes('cannot parse response'))
            ? 'Network request failed. Please check your internet connection and try again.'
            : `Failed to update service image: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`
        );
      }

      if (!uploadResponse.ok) {
        let errorData: any;
        try {
          const text = await uploadResponse.text();
          errorData = text ? JSON.parse(text) : { message: 'Unknown error' };
        } catch {
          errorData = { 
            success: false,
            message: `Upload failed with status ${uploadResponse.status}` 
          };
        }
        
        if (__DEV__) {
          console.error('[UpdateServiceImage] Full error response:', JSON.stringify(errorData, null, 2));
          console.error('[UpdateServiceImage] Response status:', uploadResponse.status);
          console.error('[UpdateServiceImage] ServiceId sent:', serviceId);
          console.error('[UpdateServiceImage] UserId sent:', userId);
        }
        
        // Extract error message from various possible formats
        const errorMessage = 
          errorData.message || 
          errorData.error?.message || 
          errorData.error ||
          `Upload failed with status ${uploadResponse.status}`;
        
        throw new Error(`Failed to update service image: ${errorMessage}`);
      }

      const uploadRaw = await uploadResponse.text();
      if (__DEV__) {
        console.log('[UpdateServiceImage] UPLOAD RAW RESPONSE:', uploadRaw);
      }

      let uploadResponseData: ApiResponse<ServiceImageUploadResponseData>;
      try {
        uploadResponseData = JSON.parse(uploadRaw);
      } catch {
        throw new Error('Server did not return valid JSON from upload endpoint');
      }

      if (!uploadResponseData.success || !uploadResponseData.data?.imageUrl) {
        throw new Error('Failed to update service image: Invalid response from server');
      }

      const imageUrl = uploadResponseData.data.imageUrl;

      // Step 2: Save image URL metadata using PATCH
      const savePayload = {
        userId: userId,
        serviceId: serviceId,
        imageUrl: imageUrl,
      };

      const saveResponse = await apiClient.patch<BusinessSetupResponseData>(
        `${API_ENDPOINTS.VENDOR.SAVE_SERVICE_IMAGE}/${userId}/save-service-image`,
        savePayload
      );

      if (!saveResponse.success) {
        throw new Error('Failed to save service image metadata');
      }

      return saveResponse;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update service image. Please try again.';
      throw new Error(errorMessage);
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

