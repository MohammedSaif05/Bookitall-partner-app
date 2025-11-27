/**
 * API Usage Examples
 * Examples of how to integrate the API services into your screens
 * 
 * This file is for reference only - not meant to be imported
 * 
 * @format
 */

/* 
 * ============================================
 * Example 1: PhoneNumber Screen Integration
 * ============================================
 */

/*
import { useState } from 'react';
import { Alert } from 'react-native';
import { authService, type CustomAxiosError } from '@/services/api';

const PhoneNumberScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phoneNumber) return;

    setLoading(true);
    try {
      const response = await authService.sendOTP({
        phoneNumber: `+91${phoneNumber}`,
        countryCode: '+91',
      });

      if (response.success && response.data) {
        // Navigate to OTP screen with session info
        navigation.navigate('OTP', {
          phoneNumber: `+91${phoneNumber}`,
          sessionId: response.data.sessionId,
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to send OTP');
      }
    } catch (error) {
      const apiError = error as CustomAxiosError;
      const errorMessage =
        apiError.response?.data?.message ||
        'Network error. Please check your connection.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Your JSX here
  );
};
*/

/* 
 * ============================================
 * Example 2: OTP Screen Integration
 * ============================================
 */

/*
import { useState } from 'react';
import { Alert } from 'react-native';
import { authService, type CustomAxiosError } from '@/services/api';

const OTPScreen = ({ route }) => {
  const { phoneNumber, sessionId } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;

    setLoading(true);
    try {
      const response = await authService.verifyOTP({
        phoneNumber,
        otp: otpCode,
        sessionId,
      });

      if (response.success && response.data?.token) {
        // Token is automatically stored by the service
        // Navigate to next screen
        navigation.navigate('BusinessSetup');
      } else {
        Alert.alert('Error', response.message || 'Invalid OTP');
      }
    } catch (error) {
      const apiError = error as CustomAxiosError;
      
      // Handle specific error cases
      if (apiError.response?.status === 400) {
        Alert.alert('Invalid OTP', 'Please enter the correct OTP');
      } else if (apiError.response?.status === 401) {
        Alert.alert('Expired', 'OTP has expired. Please request a new one.');
      } else {
        const errorMessage =
          apiError.response?.data?.message ||
          'Network error. Please check your connection.';
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const response = await authService.resendOTP({
        phoneNumber,
        sessionId,
      });

      if (response.success) {
        Alert.alert('Success', 'OTP has been resent');
        // Reset timer
        setTimeLeft(45);
      } else {
        Alert.alert('Error', response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      const apiError = error as CustomAxiosError;
      const errorMessage =
        apiError.response?.data?.message ||
        'Network error. Please check your connection.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Your JSX here
  );
};
*/

/* 
 * ============================================
 * Example 3: Custom API Call with Error Handling
 * ============================================
 */

/*
import { apiClient, type CustomAxiosError } from '@/services/api';

const fetchUserData = async () => {
  try {
    const response = await apiClient.get('/users/profile');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch user data');
    }
  } catch (error) {
    const apiError = error as CustomAxiosError;
    
    // Handle different error types
    if (!apiError.response) {
      // Network error
      throw new Error('No internet connection');
    }
    
    const statusCode = apiError.response.status;
    const errorMessage = apiError.response.data?.message || 'Unknown error';
    
    switch (statusCode) {
      case 400:
        throw new Error(`Bad request: ${errorMessage}`);
      case 401:
        throw new Error('Session expired. Please login again.');
      case 403:
        throw new Error('You do not have permission to access this resource.');
      case 404:
        throw new Error('Resource not found.');
      case 500:
        throw new Error('Server error. Please try again later.');
      default:
        throw new Error(errorMessage);
    }
  }
};
*/

/* 
 * ============================================
 * Example 4: Using with React Query / SWR
 * ============================================
 */

/*
import { useQuery, useMutation } from '@tanstack/react-query';
import { authService } from '@/services/api';

// Query example
const useOTPStatus = (phoneNumber: string) => {
  return useQuery({
    queryKey: ['otp-status', phoneNumber],
    queryFn: async () => {
      const response = await authService.sendOTP({ phoneNumber });
      return response.data;
    },
    enabled: !!phoneNumber,
  });
};

// Mutation example
const useVerifyOTP = () => {
  return useMutation({
    mutationFn: async (data: { phoneNumber: string; otp: string }) => {
      const response = await authService.verifyOTP(data);
      return response.data;
    },
    onSuccess: (data) => {
      // Handle success
      console.log('OTP verified:', data);
    },
    onError: (error) => {
      // Handle error
      console.error('OTP verification failed:', error);
    },
  });
};
*/

