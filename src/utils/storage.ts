/**
 * Storage Utility
 * Centralized storage management for user data
 * 
 * @format
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Keys
 */
const STORAGE_KEYS = {
  USER_ID: 'user_id',
  AUTH_TOKEN: 'auth_token',
  IS_ONBOARD_COMPLETED: 'is_onboard_completed',
} as const;

/**
 * User Storage
 * Manages user-related data in AsyncStorage
 */
class UserStorage {
  /**
   * Get stored user ID
   */
  async getUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

  /**
   * Store user ID
   */
  async setUserId(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    } catch (error) {
      console.error('Error storing user ID:', error);
    }
  }

  /**
   * Remove user ID
   */
  async removeUserId(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_ID);
    } catch (error) {
      console.error('Error removing user ID:', error);
    }
  }

  /**
   * Get stored auth token
   */
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Store auth token
   */
  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error storing auth token:', error);
    }
  }

  /**
   * Remove auth token
   */
  async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }

  /**
   * Get stored isOnBoardCompleted status
   */
  async getIsOnBoardCompleted(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.IS_ONBOARD_COMPLETED);
      return value === 'true';
    } catch (error) {
      console.error('Error getting isOnBoardCompleted:', error);
      return false;
    }
  }

  /**
   * Store isOnBoardCompleted status
   */
  async setIsOnBoardCompleted(isCompleted: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_ONBOARD_COMPLETED, String(isCompleted));
    } catch (error) {
      console.error('Error storing isOnBoardCompleted:', error);
    }
  }

  /**
   * Remove isOnBoardCompleted status
   */
  async removeIsOnBoardCompleted(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.IS_ONBOARD_COMPLETED);
    } catch (error) {
      console.error('Error removing isOnBoardCompleted:', error);
    }
  }

  /**
   * Clear all user data
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.IS_ONBOARD_COMPLETED,
      ]);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }
}

// Export singleton instance
export const userStorage = new UserStorage();

// Export default for convenience
export default userStorage;

