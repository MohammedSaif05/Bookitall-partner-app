/**
 * Vendor API Service
 * Handles all vendor onboarding-related API calls
 * 
 * @format
 */

import { API_ENDPOINTS } from '../../utils/constants';
import apiClient from './client';
import type { ApiResponse } from '../../types/api';

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
}

// Export singleton instance
export const vendorService = new VendorService();

// Export default for convenience
export default vendorService;

