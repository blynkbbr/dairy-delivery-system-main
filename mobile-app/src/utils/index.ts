import { VALIDATION } from '../constants';

// Format currency
export const formatCurrency = (amount: number, currency = '₹'): string => {
  return `${currency}${amount.toFixed(2)}`;
};

// Format date
export const formatDate = (date: string | Date, format = 'DD/MM/YYYY'): string => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MMM DD, YYYY':
      return d.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    case 'DD MMM':
      return d.toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric' 
      });
    default:
      return `${day}/${month}/${year}`;
  }
};

// Format time
export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });
};

// Format phone number
export const formatPhoneNumber = (phone: string): string => {
  if (phone.length === 10) {
    return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
  }
  return phone;
};

// Validation functions
export const validatePhoneNumber = (phone: string): boolean => {
  return VALIDATION.PHONE_NUMBER.PATTERN.test(phone);
};

export const validateOTP = (otp: string): boolean => {
  return VALIDATION.OTP.PATTERN.test(otp);
};

export const validateName = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length >= VALIDATION.NAME.MIN_LENGTH && 
         trimmed.length <= VALIDATION.NAME.MAX_LENGTH;
};

export const validatePostalCode = (code: string): boolean => {
  return VALIDATION.POSTAL_CODE.PATTERN.test(code);
};

// Get status color
export const getStatusColor = (status: string, colorMap: Record<string, string>): string => {
  return colorMap[status] || '#6B7280'; // Default gray color
};

// Capitalize first letter
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength - 3) + '...';
};

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Debounce function
export const debounce = <T extends (...args: any[]) => void>(
  func: T, 
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance; // Distance in kilometers
};

// Format distance
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

// Get day of week name
export const getDayName = (dayIndex: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex] || '';
};

// Get short day name
export const getShortDayName = (dayIndex: number): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayIndex] || '';
};

// Check if string is empty
export const isEmpty = (value: string | null | undefined): boolean => {
  return !value || value.trim().length === 0;
};

// Safe JSON parse
export const safeJSONParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return fallback;
  }
};

// Retry async function
export const retryAsync = async <T>(
  fn: () => Promise<T>, 
  retries: number = 3, 
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryAsync(fn, retries - 1, delay);
    }
    throw error;
  }
};

// Check if app is in development mode
export const isDevelopment = (): boolean => {
  return __DEV__;
};

// Log function that only works in development
export const devLog = (...args: any[]): void => {
  if (isDevelopment()) {
    console.log(...args);
  }
};