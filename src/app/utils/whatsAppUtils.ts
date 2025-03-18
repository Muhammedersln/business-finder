/**
 * Opens a series of WhatsApp chat windows with a specified message
 * 
 * @param phoneNumbers - Array of phone numbers to message
 * @param message - The message to send
 * @param delayBetweenOpening - Delay in milliseconds between opening each window (default: 1000ms)
 */
export async function openWhatsAppChats(
  phoneNumbers: string[],
  message: string,
  delayBetweenOpening: number = 1000
): Promise<void> {
  if (!phoneNumbers || phoneNumbers.length === 0 || !message) {
    throw new Error('Geçerli telefon numaraları ve mesaj gereklidir');
  }

  const encodedMessage = encodeURIComponent(message);
  
  // Open WhatsApp chat windows one by one with a delay
  for (let i = 0; i < phoneNumbers.length; i++) {
    const phoneNumber = phoneNumbers[i];
    if (!phoneNumber) continue;
    
    // Format number for WhatsApp (remove spaces, dashes, etc.)
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    
    // Ensure number starts with country code (default to Turkey +90)
    let formattedNumber;
    if (cleanedNumber.startsWith('90')) {
      formattedNumber = cleanedNumber;
    } else if (cleanedNumber.startsWith('0')) {
      formattedNumber = `90${cleanedNumber.substring(1)}`;
    } else {
      formattedNumber = `90${cleanedNumber}`;
    }
    
    // Create WhatsApp link
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp link in new window/tab
    window.open(whatsappUrl, '_blank');
    
    // Wait before opening the next one to avoid browser blocking
    if (i < phoneNumbers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenOpening));
    }
  }
}

/**
 * Generate a CSV file from an array of phone numbers
 * 
 * @param phoneNumbers - Array of phone numbers to include in CSV
 * @returns Blob containing CSV data
 */
export function generateWhatsAppCSV(phoneNumbers: string[]): Blob {
  if (!phoneNumbers || phoneNumbers.length === 0) {
    throw new Error('Geçerli telefon numaraları gereklidir');
  }

  // Format phone numbers for WhatsApp
  const formattedNumbers = phoneNumbers.map(number => {
    // Remove non-numeric characters
    const cleanedNumber = number.replace(/\D/g, '');
    
    // Ensure number starts with country code (default to Turkey +90)
    if (cleanedNumber.startsWith('90')) {
      return cleanedNumber;
    } else if (cleanedNumber.startsWith('0')) {
      return `90${cleanedNumber.substring(1)}`;
    } else {
      return `90${cleanedNumber}`;
    }
  });

  // Create CSV content
  const csvContent = formattedNumbers.join('\n');
  
  // Create a blob from the content
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
} 