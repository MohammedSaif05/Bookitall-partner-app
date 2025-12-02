/**
 * Location Utility
 * Handles geolocation and reverse geocoding functionality
 * 
 * @format
 */

import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import { Platform, PermissionsAndroid } from 'react-native';

/**
 * Location coordinates
 */
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Address details from reverse geocoding
 */
export interface AddressDetails {
  addressLine: string;
  city: string;
  pincode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Request location permissions
 * @returns Promise<boolean> - true if permission granted, false otherwise
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to find your business address.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Location permission error:', err);
      return false;
    }
  }
  
  // iOS: Use react-native-geolocation-service's requestAuthorization
  // This will prompt the user if permission hasn't been granted yet
  // If already granted, it returns 'granted' without prompting again
  if (Platform.OS === 'ios') {
    try {
      const authStatus = await Geolocation.requestAuthorization('whenInUse');
      // Authorization status: 'granted', 'denied', 'restricted', 'disabled'
      return authStatus === 'granted';
    } catch (err) {
      console.warn('iOS location permission error:', err);
      return false;
    }
  }
  
  return false;
};

/**
 * Check if location permission is granted
 * @returns Promise<boolean> - true if permission granted, false otherwise
 */
export const checkLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const result = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return result;
  }
  
  // iOS: requestAuthorization is idempotent - if already granted, it returns 'granted' without prompting
  // So we can safely use it to check the current status
  if (Platform.OS === 'ios') {
    try {
      const authStatus = await Geolocation.requestAuthorization('whenInUse');
      // Authorization status: 'granted', 'denied', 'restricted', 'disabled'
      return authStatus === 'granted';
    } catch (err) {
      console.warn('iOS location permission check error:', err);
      return false;
    }
  }
  
  return false;
};

/**
 * Get current location coordinates with high accuracy
 * @param options - Optional configuration for location accuracy
 * @returns Promise<LocationCoordinates> - Current latitude and longitude
 */
export const getCurrentLocation = (
  options?: {
    useWatchPosition?: boolean;
    watchTimeout?: number;
    fastMode?: boolean; // Fast mode: accept lower accuracy for speed
  }
): Promise<LocationCoordinates> => {
  // Platform-specific defaults for better iOS accuracy
  const isIOS = Platform.OS === 'ios';
  const defaultUseWatchPosition = isIOS ? true : false; // Use watchPosition by default on iOS for better accuracy
  const defaultWatchTimeout = isIOS ? 15000 : 4000; // Longer timeout on iOS to get accurate GPS fix
  const defaultFastMode = isIOS ? false : true; // Don't use fast mode on iOS - prioritize accuracy
  
  const { 
    useWatchPosition = defaultUseWatchPosition, 
    watchTimeout = defaultWatchTimeout, 
    fastMode = defaultFastMode 
  } = options || {};

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('🌍 Starting location detection...', {
      platform: Platform.OS,
      useWatchPosition,
      watchTimeout: `${watchTimeout}ms`,
      fastMode,
    });
  }

  return new Promise((resolve, reject) => {
    // Platform-specific configuration for optimal accuracy
    const fastLocationOptions: Geolocation.GeoOptions = {
      enableHighAccuracy: true, // Use GPS for high accuracy
      timeout: isIOS ? 20000 : 10000, // Longer timeout on iOS for GPS fix
      maximumAge: isIOS ? 0 : 5000, // iOS: Force fresh GPS fix (0 = no cache), Android: Accept 5s cache
      accuracy: {
        android: 'high' as const,
        ios: 'best' as const,
      },
      forceRequestLocation: true,
      showLocationDialog: true,
    };

    const watchOptions: Geolocation.GeoWatchOptions = {
      enableHighAccuracy: true,
      distanceFilter: 0, // No distance filter - get all updates
      interval: isIOS ? 2000 : 1000, // iOS: Check every 2s for better GPS fix, Android: 1s
      fastestInterval: isIOS ? 1000 : 500, // iOS: Fastest 1s, Android: 500ms
      accuracy: {
        android: 'high' as const,
        ios: 'best' as const,
      },
      forceRequestLocation: true,
      showLocationDialog: true,
    };

    // Try getCurrentPosition first (much faster)
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('⚡ Trying fast getCurrentPosition...');
    }

    const startTime = Date.now();
    Geolocation.getCurrentPosition(
      (position) => {
        const elapsed = Date.now() - startTime;
        const accuracy = position.coords.accuracy || 0;
        
        // Platform-specific accuracy requirements
        // iOS: Stricter accuracy (20m) since we're using watchPosition by default
        // Android: More lenient (100m in fast mode, 50m otherwise) since it's working well
        const acceptableAccuracy = isIOS 
          ? 20 // iOS: Require high accuracy (20m)
          : (fastMode ? 100 : 50); // Android: 100m in fast mode, 50m otherwise
        
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('📍 getCurrentPosition Result:', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: `${accuracy.toFixed(2)}m`,
            acceptable: accuracy <= acceptableAccuracy,
            timeElapsed: `${elapsed}ms`,
          });
        }

        // If accuracy is acceptable, use it immediately
        if (accuracy <= acceptableAccuracy || !useWatchPosition) {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.log('✅ Location Found (Fast):', {
              latitude: coords.latitude,
              longitude: coords.longitude,
              accuracy: `${accuracy.toFixed(2)}m`,
              timeElapsed: `${elapsed}ms`,
            });
          }
          
          resolve(coords);
        } else {
          // Accuracy not good enough, try watchPosition for better accuracy
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.log('👀 Accuracy not sufficient, trying watchPosition...');
          }
          
          useWatchPositionForBetterAccuracy(
            resolve,
            reject,
            watchOptions,
            watchTimeout,
            position // Use current position as initial best
          );
        }
      },
      (error) => {
        // If getCurrentPosition fails, try watchPosition as fallback
        if (useWatchPosition) {
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.log('⚠️ getCurrentPosition failed, trying watchPosition...');
          }
          
          useWatchPositionForBetterAccuracy(
            resolve,
            reject,
            watchOptions,
            watchTimeout,
            null
          );
        } else {
          // If watchPosition is disabled, just reject
          handleLocationError(error, reject);
        }
      },
      fastLocationOptions
    );
  });
};

/**
 * Use watchPosition to get better accuracy
 */
const useWatchPositionForBetterAccuracy = (
  resolve: (value: LocationCoordinates) => void,
  reject: (error: Error) => void,
  watchOptions: Geolocation.GeoWatchOptions,
  watchTimeout: number,
  initialPosition: Geolocation.GeoPosition | null
) => {
  const isIOS = Platform.OS === 'ios';
  let watchId: number | null = null;
  let bestPosition: Geolocation.GeoPosition | null = initialPosition;
  const startTime = Date.now();

  watchId = Geolocation.watchPosition(
    (position) => {
      const elapsed = Date.now() - startTime;
      
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('📍 Location Update:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: `${position.coords.accuracy?.toFixed(2)}m`,
          timeElapsed: `${elapsed}ms`,
        });
      }

      // Track the most accurate position
      if (
        !bestPosition ||
        (position.coords.accuracy &&
          bestPosition.coords.accuracy &&
          position.coords.accuracy < bestPosition.coords.accuracy)
      ) {
        bestPosition = position;
        
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('✅ New Best Position:', {
            latitude: bestPosition.coords.latitude,
            longitude: bestPosition.coords.longitude,
            accuracy: `${bestPosition.coords.accuracy?.toFixed(2)}m`,
          });
        }
      }

      // Platform-specific accuracy requirements for watchPosition
      // iOS: Require better accuracy (20m), Android: 50m is acceptable
      const requiredAccuracy = isIOS ? 20 : 50;
      const elapsedTime = Date.now() - startTime;
      if (
        (position.coords.accuracy && position.coords.accuracy <= requiredAccuracy) ||
        elapsedTime >= watchTimeout
      ) {
        if (watchId !== null) {
          Geolocation.clearWatch(watchId);
        }
        
        const finalCoords = {
          latitude: bestPosition.coords.latitude,
          longitude: bestPosition.coords.longitude,
        };
        
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('🎯 Final Location Coordinates:', {
            latitude: finalCoords.latitude,
            longitude: finalCoords.longitude,
            accuracy: `${bestPosition.coords.accuracy?.toFixed(2)}m`,
            timeElapsed: `${elapsedTime}ms`,
          });
        }
        
        resolve(finalCoords);
      }
    },
    (error) => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
      // If we have a position from initial getCurrentPosition, use it
      if (bestPosition) {
        resolve({
          latitude: bestPosition.coords.latitude,
          longitude: bestPosition.coords.longitude,
        });
      } else {
        handleLocationError(error, reject);
      }
    },
    watchOptions
  );

  // Fallback timeout
  setTimeout(() => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      if (bestPosition) {
        const coords = {
          latitude: bestPosition.coords.latitude,
          longitude: bestPosition.coords.longitude,
        };
        
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('⏱️ Location Coordinates (Timeout):', {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: `${bestPosition.coords.accuracy?.toFixed(2)}m`,
            timeElapsed: `${watchTimeout}ms`,
          });
        }
        
        resolve(coords);
      } else {
        handleLocationError(
          { code: 3, message: 'Location request timed out' } as Geolocation.GeoError,
          reject
        );
      }
    }
  }, watchTimeout);
};


/**
 * Handle location errors with detailed messages
 */
const handleLocationError = (
  error: Geolocation.GeoError,
  reject: (error: Error) => void
) => {
  let errorMessage = 'Failed to get your location.';

  switch (error.code) {
    case 1: // PERMISSION_DENIED
      errorMessage =
        'Location permission denied. Please enable location access in settings.';
      break;
    case 2: // POSITION_UNAVAILABLE
      errorMessage =
        'Location information is unavailable. Please ensure GPS is enabled and try again.';
      break;
    case 3: // TIMEOUT
      errorMessage =
        'Location request timed out. Please move to an area with better GPS signal and try again.';
      break;
    case 4: // PLAY_SERVICE_NOT_AVAILABLE (Android)
      errorMessage =
        'Google Play Services is not available. Please update Google Play Services.';
      break;
  }

  reject(new Error(errorMessage));
};

/**
 * Google Maps Geocoding API Key
 */
const GOOGLE_MAPS_API_KEY = 'AIzaSyBHk94v2evHb1oeKqDYdp0FSImI36YWnyE';

/**
 * Reverse geocode coordinates to get address details
 * Uses Google Maps Geocoding API
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Promise<AddressDetails> - Address details including city, pincode, and address line
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<AddressDetails> => {
  try {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('🗺️ Starting reverse geocoding...', {
        latitude,
        longitude,
      });
    }

    // Google Maps Geocoding API endpoint
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&result_type=street_address&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await axios.get(url, {
      timeout: 15000,
    });
    
    if (!response || !response.data) {
      throw new Error('No address found for this location.');
    }

    const data = response.data;
    
    // Check if API returned an error
    if (data.status !== 'OK') {
      throw new Error(
        `Geocoding API error: ${data.status} - ${data.error_message || 'Unknown error'}`
      );
    }

    if (!data.results || data.results.length === 0) {
      throw new Error('No address results found for this location.');
    }

    // Find the best result - prefer one with street_number + route for better address line
    let bestResult = data.results[0];
    for (const result of data.results) {
      const components = result.address_components || [];
      const hasStreetNumber = components.some((c: any) => c.types.includes('street_number'));
      const hasRoute = components.some((c: any) => c.types.includes('route'));
      
      // Prefer results with both street_number and route
      if (hasStreetNumber && hasRoute) {
        bestResult = result;
        break;
      }
    }

    const addressComponents = bestResult.address_components || [];
    
    // Extract address components from Google Maps response
    let addressLine = '';
    let city = '';
    let pincode = '';
    let landmark = '';

    // Extract postal code (from any result, prefer bestResult)
    const postalCodeComponent = addressComponents.find((component: any) =>
      component.types.includes('postal_code')
    );
    if (postalCodeComponent) {
      pincode = postalCodeComponent.long_name || postalCodeComponent.short_name || '';
    } else {
      // Fallback: search in all results for postal code
      for (const result of data.results) {
        const pc = result.address_components?.find((c: any) => c.types.includes('postal_code'));
        if (pc) {
          pincode = pc.long_name || pc.short_name || '';
          break;
        }
      }
    }

    // Extract city (locality) - from any result
    const cityComponent = addressComponents.find((component: any) =>
      component.types.includes('locality')
    );
    if (cityComponent) {
      city = cityComponent.long_name || cityComponent.short_name || '';
    } else {
      // Fallback: search in all results for city
      for (const result of data.results) {
        const cc = result.address_components?.find((c: any) => c.types.includes('locality'));
        if (cc) {
          city = cc.long_name || cc.short_name || '';
          break;
        }
      }
    }

    // Extract address line - prefer short format: street_number + route
    const streetNumber = addressComponents.find((component: any) =>
      component.types.includes('street_number')
    );
    const route = addressComponents.find((component: any) =>
      component.types.includes('route')
    );
    
    if (streetNumber && route) {
      // Best case: "224, Noor Masjid St" format
      addressLine = `${streetNumber.long_name}, ${route.short_name || route.long_name}`;
    } else if (route) {
      // Fallback: just route name
      addressLine = route.short_name || route.long_name;
    } else if (streetNumber) {
      // Fallback: just street number
      addressLine = streetNumber.long_name;
    } else {
      // Last resort: use formatted address but try to shorten it
      addressLine = bestResult.formatted_address || '';
      // Try to extract just the first part (before first comma)
      if (addressLine.includes(',')) {
        const parts = addressLine.split(',');
        addressLine = parts[0]?.trim() || addressLine;
      }
    }

    // Extract landmark - prioritize meaningful landmarks
    // Priority: route (if meaningful like "Noor Masjid") > sublocality > neighborhood > premise (if meaningful)
    const routeComponent = addressComponents.find((component: any) =>
      component.types.includes('route')
    );
    const sublocalityComponent = addressComponents.find((component: any) =>
      component.types.includes('sublocality') || component.types.includes('sublocality_level_1')
    );
    const neighborhoodComponent = addressComponents.find((component: any) =>
      component.types.includes('neighborhood')
    );
    const premiseComponent = addressComponents.find((component: any) =>
      component.types.includes('premise')
    );
    
    // Check if route is meaningful (not just "Street" or "Road")
    if (routeComponent) {
      const routeName = routeComponent.long_name || routeComponent.short_name || '';
      // If route contains meaningful words (not just generic street names)
      if (routeName && !/^(street|st|road|rd|avenue|ave|lane|ln|drive|dr|boulevard|blvd)$/i.test(routeName.trim())) {
        landmark = routeName;
      }
    }
    
    // If no meaningful route, use sublocality (like "Fort Area")
    if (!landmark && sublocalityComponent) {
      landmark = sublocalityComponent.long_name || sublocalityComponent.short_name || '';
    }
    
    // If still no landmark, use neighborhood (like "Aarif Nagar")
    if (!landmark && neighborhoodComponent) {
      landmark = neighborhoodComponent.long_name || neighborhoodComponent.short_name || '';
    }
    
    // Last resort: use premise only if it's meaningful (not just numbers)
    if (!landmark && premiseComponent) {
      const premiseName = premiseComponent.long_name || premiseComponent.short_name || '';
      // Only use premise if it's not just a number
      if (premiseName && !/^\d+$/.test(premiseName.trim())) {
        landmark = premiseName;
      }
    }

    // Log for debugging
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('✅ Reverse Geocoding Result:', {
        formatted_address: bestResult.formatted_address,
        addressLine,
        city,
        pincode,
        landmark: landmark || 'N/A',
        location_type: bestResult.geometry?.location_type,
      });
    }

    return {
      addressLine: addressLine || '',
      city: city || '',
      pincode: pincode || '',
      landmark: landmark || undefined,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    
    // Handle specific error cases
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('Geocoding service access denied. Please try again later.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timed out. Please check your internet connection.');
      }
    }
    
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to get address details. Please try again.'
    );
  }
};

/**
 * Get current location and reverse geocode to address
 * Handles permission request and location fetching
 * @returns Promise<AddressDetails> - Complete address details with coordinates
 */
export const getCurrentLocationAddress = async (): Promise<AddressDetails> => {
  // Check permission first
  const hasPermission = await checkLocationPermission();
  
  if (!hasPermission) {
    // Request permission
    const granted = await requestLocationPermission();
    if (!granted) {
      throw new Error('Location permission is required to use this feature.');
    }
  }

  // Get current location
  const coordinates = await getCurrentLocation();
  
  // Reverse geocode to get address
  const addressDetails = await reverseGeocode(
    coordinates.latitude,
    coordinates.longitude
  );

  // Include coordinates in the response
  return {
    ...addressDetails,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  };
};

