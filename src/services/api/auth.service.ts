/**
 * Authentication API Service
 * Handles all authentication-related API calls
 * 
 * @format
 */

import { API_ENDPOINTS } from '../../utils/constants';
import apiClient from './client';
import type { ApiResponse } from '../../types/api';

/**
 * Send OTP Request Payload
 */
export interface SendOTPRequest {
  mobileNo: string;
}

/**
 * Send OTP Response Data
 */
export interface SendOTPResponseData {
  message: string;
}

/**
 * Send OTP Response
 */
export interface SendOTPResponse {
  success: boolean;
  data: SendOTPResponseData;
}

/**
 * Verify OTP Request Payload
 */
export interface VerifyOTPRequest {
  mobileNo: string;
  otp: string;
}

/**
 * Verify OTP Response Data
 */
export interface VerifyOTPResponseData {
  message: string;
  userId: string;
}

/**
 * Verify OTP Response
 */
export interface VerifyOTPResponse {
  success: boolean;
  data: VerifyOTPResponseData;
}

/**
 * Resend OTP Request Payload
 */
export interface ResendOTPRequest {
  phoneNumber: string;
  sessionId?: string;
}

/**
 * Resend OTP Response
 */
export interface ResendOTPResponse {
  success: boolean;
  message: string;
  sessionId?: string;
  expiresIn?: number;
}

/**
 * Authentication Service
 * Provides methods for authentication operations
 */
class AuthService {
  /**
   * Send OTP to phone number
   * @param payload - Mobile number (10 digits without country code)
   * @returns Promise with OTP send response
   */
  async sendOTP(payload: SendOTPRequest): Promise<ApiResponse<SendOTPResponseData>> {
    try {
      const response = await apiClient.post<SendOTPResponseData>(
        API_ENDPOINTS.AUTH.SEND_OTP,
        {
          mobileNo: payload.mobileNo,
        }
      );
      return response;
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }

  /**
   * Verify OTP code
   * @param payload - Mobile number and OTP code
   * @returns Promise with verification response
   */
  async verifyOTP(payload: VerifyOTPRequest): Promise<ApiResponse<VerifyOTPResponseData>> {
    try {
      const response = await apiClient.post<VerifyOTPResponseData>(
        API_ENDPOINTS.AUTH.VERIFY_OTP,
        {
          mobileNo: payload.mobileNo,
          otp: payload.otp,
        }
      );

      return response;
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }

  /**
   * Resend OTP to phone number
   * @param payload - Phone number and optional session ID
   * @returns Promise with resend OTP response
   */
  async resendOTP(payload: ResendOTPRequest): Promise<ApiResponse<ResendOTPResponse>> {
    try {
      const response = await apiClient.post<ResendOTPResponse>(
        API_ENDPOINTS.AUTH.RESEND_OTP,
        {
          phoneNumber: payload.phoneNumber,
          sessionId: payload.sessionId,
        }
      );
      return response;
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }

  /**
   * Logout user
   * Clears authentication token
   */
  async logout(): Promise<void> {
    await apiClient.clearAuthToken();
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export default for convenience
export default authService;

