/**
 * Service Form Configurations
 * Category-based service form field definitions
 * 
 * @format
 */

/**
 * Sport types for Turf category
 */
export const SPORT_TYPES = [
  'Cricket',
  'Football',
  'Tennis',
  'Basketball',
  'Volleyball',
  'Badminton',
  'Squash',
  'Table Tennis',
  'Hockey',
  'Baseball',
  'Rugby',
  'Other',
] as const;

/**
 * Gender options for services
 */
export const GENDER_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Both', value: 'both' },
];

/**
 * Common amenities for Turf services
 * This can be expanded or fetched from API later
 */
export const TURF_AMENITIES = [
  'Parking',
  'Changing Room',
  'Washroom',
  'Water Facility',
  'Lighting',
  'Seating Area',
  'Cafeteria',
  'First Aid',
  'Equipment Rental',
  'WiFi',
] as const;

/**
 * Category labels for Saloon services
 */
export const SALOON_CATEGORY_LABELS = [
  'Hair',
  'Haircut',
  'Hair Color',
  'Hair Treatment',
  'Hair Styling',
  'Beard',
  'Facial',
  'Massage',
  'Manicure',
  'Pedicure',
  'Waxing',
  'Threading',
  'Makeup',
  'Bridal',
  'Other',
] as const;

/**
 * Age group options for Swimming Pool services
 */
export const AGE_GROUP_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'Adults', value: 'adults' },
  { label: 'Children', value: 'children' },
];

/**
 * Common amenities for Swimming Pool services
 */
export const SWIMMING_POOL_AMENITIES = [
  'Locker',
  'Shower',
  'Changing Room',
  'Towel Service',
  'Parking',
  'Cafeteria',
  'First Aid',
  'Lifeguard',
  'Pool Equipment',
  'WiFi',
] as const;

/**
 * Room types for SPA services
 */
export const SPA_ROOM_TYPES = [
  'Single',
  'Double',
  'Couple',
  'VIP',
  'Private',
  'Shared',
] as const;

/**
 * Treatment categories for SPA services
 */
export const SPA_TREATMENT_CATEGORIES = [
  'Massage',
  'Facial',
  'Body Treatment',
  'Aromatherapy',
  'Hot Stone',
  'Deep Tissue',
  'Swedish',
  'Thai',
  'Reflexology',
  'Scrub',
  'Waxing',
  'Manicure',
  'Pedicure',
  'Hair Treatment',
  'Other',
] as const;

/**
 * Therapist gender options for SPA services
 */
export const THERAPIST_GENDER_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

/**
 * Beautician levels for Beauty Parlour services
 */
export const BEAUTICIAN_LEVELS = [
  'Junior',
  'Senior',
  'Expert',
  'Master',
  'Specialist',
] as const;

/**
 * Treatment categories for Beauty Parlour services
 */
export const BEAUTY_PARLOUR_TREATMENT_CATEGORIES = [
  'Facial',
  'Haircut',
  'Hair Styling',
  'Hair Coloring',
  'Hair Treatment',
  'Manicure',
  'Pedicure',
  'Waxing',
  'Threading',
  'Bleach',
  'Cleanup',
  'Makeup',
  'Bridal Makeup',
  'Party Makeup',
  'Hair Spa',
  'Head Massage',
  'Hair Wash',
  'Other',
] as const;

/**
 * Common beauty products brands
 */
export const BEAUTY_PRODUCTS = [
  'Lakme',
  'O3+',
  'L\'Oreal',
  'Maybelline',
  'Revlon',
  'MAC',
  'Clinique',
  'Estee Lauder',
  'Lakme Absolute',
  'Ponds',
  'Garnier',
  'VLCC',
  'Kaya',
  'Biotique',
  'Forest Essentials',
  'The Body Shop',
  'Nykaa',
  'Sugar',
  'Colorbar',
  'Faces',
  'Other',
] as const;

/**
 * Service Form Field Configuration
 */
export interface ServiceFormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'dropdown' | 'multiselect';
  required: boolean;
  placeholder?: string;
  options?: readonly string[] | Array<{ label: string; value: string }>;
}

/**
 * Category-based Service Form Configuration
 */
export interface CategoryServiceFormConfig {
  categorySlug: string;
  fields: ServiceFormField[];
  defaultValues?: Record<string, unknown>;
}

/**
 * Turf Service Form Configuration
 */
export const TURF_SERVICE_FORM_CONFIG: CategoryServiceFormConfig = {
  categorySlug: 'turf',
  fields: [
    {
      key: 'serviceName',
      label: 'Service Name',
      type: 'text',
      required: true,
      placeholder: 'Enter service name',
    },
    {
      key: 'sportType',
      label: 'Sport Type',
      type: 'dropdown',
      required: true,
      placeholder: 'Select sport type',
      options: SPORT_TYPES,
    },
    {
      key: 'serviceDurationInMinutes',
      label: 'Slot Duration (minutes)',
      type: 'number',
      required: true,
      placeholder: 'Enter duration in minutes',
    },
    {
      key: 'bufferTimeInMinutes',
      label: 'Buffer Time (minutes)',
      type: 'number',
      required: true,
      placeholder: 'Enter buffer time in minutes',
    },
    {
      key: 'price',
      label: 'Price per Slot',
      type: 'number',
      required: true,
      placeholder: 'Enter price',
    },
    {
      key: 'maximumPlayers',
      label: 'Maximum Players',
      type: 'number',
      required: true,
      placeholder: 'Enter maximum players',
    },
    {
      key: 'serviceFor',
      label: 'Allowed Genders',
      type: 'dropdown',
      required: true,
      placeholder: 'Select allowed genders',
      options: GENDER_OPTIONS,
    },
    {
      key: 'amenities',
      label: 'Amenities',
      type: 'multiselect',
      required: false,
      placeholder: 'Select amenities',
      options: TURF_AMENITIES,
    },
  ],
  defaultValues: {
    priceUnitLabel: 'per person',
  },
};

/**
 * Map of category slug to form configuration
 */
export const SERVICE_FORM_CONFIGS: Record<string, CategoryServiceFormConfig> = {
  turf: TURF_SERVICE_FORM_CONFIG,
  // Add more category configs here as needed
};

