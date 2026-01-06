/**
 * Flash Message Utility
 * Centralized utility for showing flash messages throughout the app
 * 
 * @format
 */

import { showMessage, MessageOptions } from 'react-native-flash-message';
import { colors } from '../theme/colors';
import { ms, hs, vs } from '../theme/scaling';

/**
 * Show error flash message
 * @param message - Error message to display
 * @param options - Additional flash message options
 */
export const showError = (message: string, options?: Partial<MessageOptions>): void => {
  showMessage({
    message,
    type: 'danger',
    backgroundColor: colors.status.error,
    color: colors.text.white,
    duration: 4000,
    position: 'bottom',
    style: {
      paddingHorizontal: hs(16),
      paddingVertical: vs(8),
      borderRadius: ms(12),
      marginHorizontal: hs(16),
      marginBottom: vs(20),
      minHeight: vs(36),
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      elevation: 10, // Android
    },
    textStyle: {
      fontSize: ms(14),
      fontWeight: '500',
      textAlign: 'center',
      color: colors.text.white, // Explicitly set color for iOS
      width: '100%',
    },
    ...options,
  });
};

/**
 * Show success flash message
 * @param message - Success message to display
 * @param options - Additional flash message options
 */
export const showSuccess = (message: string, options?: Partial<MessageOptions>): void => {
  showMessage({
    message,
    type: 'success',
    backgroundColor: colors.status.success,
    color: colors.text.white,
    duration: 3000,
    position: 'bottom',
    style: {
      paddingHorizontal: hs(16),
      paddingVertical: vs(8),
      borderRadius: ms(12),
      marginHorizontal: hs(16),
      marginBottom: vs(20),
      minHeight: vs(36),
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      elevation: 10, // Android
    },
    textStyle: {
      fontSize: ms(14),
      fontWeight: '500',
      textAlign: 'center',
      color: colors.text.white, // Explicitly set color for iOS
      width: '100%',
    },
    ...options,
  });
};

/**
 * Show info flash message
 * @param message - Info message to display
 * @param options - Additional flash message options
 */
export const showInfo = (message: string, options?: Partial<MessageOptions>): void => {
  showMessage({
    message,
    type: 'info',
    backgroundColor: colors.status.info,
    color: colors.text.white,
    duration: 3000,
    position: 'bottom',
    style: {
      paddingHorizontal: hs(16),
      paddingVertical: vs(8),
      borderRadius: ms(12),
      marginHorizontal: hs(16),
      marginBottom: vs(20),
      minHeight: vs(36),
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      elevation: 10, // Android
    },
    textStyle: {
      fontSize: ms(14),
      fontWeight: '500',
      textAlign: 'center',
      color: colors.text.white, // Explicitly set color for iOS
      width: '100%',
    },
    ...options,
  });
};

/**
 * Show warning flash message
 * @param message - Warning message to display
 * @param options - Additional flash message options
 */
export const showWarning = (message: string, options?: Partial<MessageOptions>): void => {
  showMessage({
    message,
    type: 'warning',
    backgroundColor: colors.status.warning,
    color: colors.text.white,
    duration: 3000,
    position: 'bottom',
    style: {
      paddingHorizontal: hs(16),
      paddingVertical: vs(8),
      borderRadius: ms(12),
      marginHorizontal: hs(16),
      marginBottom: vs(20),
      minHeight: vs(36),
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      elevation: 10, // Android
    },
    textStyle: {
      fontSize: ms(14),
      fontWeight: '500',
      textAlign: 'center',
      color: colors.text.white, // Explicitly set color for iOS
      width: '100%',
    },
    ...options,
  });
};

