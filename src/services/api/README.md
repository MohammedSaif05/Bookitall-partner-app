# API Services Documentation

This directory contains the production-grade API client setup with axios interceptors.

## Structure

```
src/services/api/
├── client.ts          # Axios instance with interceptors
├── auth.service.ts    # Authentication API service
├── index.ts          # Centralized exports
└── README.md         # This file
```

## Features

- ✅ Axios instance with base URL configuration
- ✅ Request/Response interceptors
- ✅ Automatic token management
- ✅ Error handling and transformation
- ✅ Request/Response logging (development only)
- ✅ TypeScript support with full type safety
- ✅ Network error handling
- ✅ 401 Unauthorized handling
- ✅ Request duration tracking

## Usage

### Basic API Call

```typescript
import { authService } from '@/services/api';

// Send OTP
try {
  const response = await authService.sendOTP({
    phoneNumber: '+919876543210',
    countryCode: '+91',
  });
  
  if (response.success && response.data) {
    console.log('OTP sent:', response.data.message);
  }
} catch (error) {
  // Error is already formatted by interceptor
  console.error('Failed to send OTP:', error.response?.data?.message);
}
```

### Verify OTP

```typescript
import { authService } from '@/services/api';

try {
  const response = await authService.verifyOTP({
    phoneNumber: '+919876543210',
    otp: '123456',
  });
  
  if (response.success && response.data?.token) {
    // Token is automatically stored by the service
    console.log('Verified successfully');
  }
} catch (error) {
  console.error('OTP verification failed:', error.response?.data?.message);
}
```

### Using the API Client Directly

```typescript
import { apiClient } from '@/services/api';

// GET request
const response = await apiClient.get('/users/profile');

// POST request
const response = await apiClient.post('/users/update', {
  name: 'John Doe',
});

// With custom config
const response = await apiClient.post(
  '/endpoint',
  { data: 'value' },
  {
    skipAuth: true, // Skip adding auth token
    timeout: 5000,   // Custom timeout
  }
);
```

### Error Handling

```typescript
import { authService, type CustomAxiosError } from '@/services/api';

try {
  await authService.sendOTP({ phoneNumber: '+919876543210' });
} catch (error) {
  const apiError = error as CustomAxiosError;
  
  // Check error type
  if (!apiError.response) {
    // Network error
    console.error('No internet connection');
  } else {
    // API error
    const statusCode = apiError.response.status;
    const errorMessage = apiError.response.data?.message || 'Unknown error';
    
    switch (statusCode) {
      case 400:
        console.error('Bad request:', errorMessage);
        break;
      case 401:
        console.error('Unauthorized - token cleared');
        break;
      case 404:
        console.error('Not found');
        break;
      case 500:
        console.error('Server error');
        break;
      default:
        console.error('Error:', errorMessage);
    }
  }
}
```

## Configuration

### Base URL

The base URL is configured in `src/utils/constants.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://bookitall-user-service.onrender.com',
  TIMEOUT: 30000, // 30 seconds
};
```

### Token Storage

By default, tokens are stored in memory. For production, update the `DefaultTokenStorage` class in `client.ts` to use:

- `@react-native-async-storage/async-storage` for regular storage
- `expo-secure-store` or `react-native-keychain` for secure storage

Example with AsyncStorage:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

class DefaultTokenStorage implements TokenStorage {
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('auth_token');
  }

  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem('auth_token', token);
  }

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem('auth_token');
  }
}
```

## Adding New Services

1. Create a new service file (e.g., `user.service.ts`)
2. Import and use `apiClient` from `./client`
3. Define request/response types
4. Export from `index.ts`

Example:

```typescript
// user.service.ts
import { apiClient } from './client';
import type { ApiResponse } from '../../types/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

class UserService {
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return await apiClient.get('/users/profile');
  }
}

export const userService = new UserService();
export default userService;
```

## Interceptors

### Request Interceptor

- Adds authentication token (if available)
- Logs requests in development
- Tracks request start time

### Response Interceptor

- Logs responses in development
- Calculates request duration
- Handles errors globally

### Error Handling

- Network errors: Returns user-friendly message
- 401 Unauthorized: Clears token automatically
- 403 Forbidden: Logs warning
- 500+ Server Errors: Logs for monitoring

## Best Practices

1. **Always use try-catch** when calling API methods
2. **Check response.success** before accessing response.data
3. **Handle network errors** gracefully
4. **Use TypeScript types** for request/response payloads
5. **Don't expose sensitive data** in error messages
6. **Use skipAuth** for public endpoints that don't need authentication

