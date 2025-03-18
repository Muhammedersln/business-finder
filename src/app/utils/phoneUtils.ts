/**
 * Format a phone number for WhatsApp by removing non-numeric characters
 * and ensuring it has the correct country code (default: Turkey +90)
 * 
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number for WhatsApp
 */
export function formatPhoneForWhatsApp(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  // Remove all non-numeric characters
  const cleanedNumber = phoneNumber.replace(/\D/g, '');
  
  // Ensure number starts with the country code
  if (cleanedNumber.startsWith('90')) {
    return cleanedNumber;
  } else if (cleanedNumber.startsWith('0')) {
    return `90${cleanedNumber.substring(1)}`;
  } else {
    return `90${cleanedNumber}`;
  }
}

/**
 * Check if a string is a valid phone number
 * 
 * @param phoneNumber - The phone number to validate
 * @returns boolean indicating if the phone number is valid
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  if (!phoneNumber) return false;
  
  // Remove all non-numeric characters
  const cleanedNumber = phoneNumber.replace(/\D/g, '');
  
  // Check if the number has a valid length (assuming Turkish phone numbers)
  // Turkish mobile numbers are 10 digits (excluding country code)
  const validLength = cleanedNumber.length === 10 || 
                     (cleanedNumber.startsWith('90') && cleanedNumber.length === 12) ||
                     (cleanedNumber.startsWith('0') && cleanedNumber.length === 11);
  
  return validLength;
} 