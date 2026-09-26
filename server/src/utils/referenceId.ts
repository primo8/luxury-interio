import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a standard UUID v4 for X-Reference-Id
 */
export function generateReferenceId(): string {
  return uuidv4();
}

/**
 * Generates a unique order ID: FUR-123456
 */
export function generateOrderId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `FUR-${randomNum}`;
}

/**
 * Normalizes a phone number to standard MSISDN format (e.g. 250788123456)
 * Handles Rwandan formats:
 * - 078XXXXXXX -> 25078XXXXXXX
 * - 079XXXXXXX -> 25079XXXXXXX
 * - 072XXXXXXX -> 25072XXXXXXX
 * - 073XXXXXXX -> 25073XXXXXXX
 * - +250... -> 250...
 */
export function normalizeMsisdn(phone: string): { isValid: boolean; normalized: string; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, normalized: '', error: 'Phone number is required' };
  }

  // Remove whitespace, dashes, plus, parentheses
  let cleaned = phone.replace(/[\s\-+()]/g, '');

  // If starts with 07, prepend 25
  if (/^07[2389]\d{7}$/.test(cleaned)) {
    cleaned = '25' + cleaned;
  }

  // If starts with 7, prepend 250
  if (/^7[2389]\d{7}$/.test(cleaned)) {
    cleaned = '250' + cleaned;
  }

  // Check valid 12-digit Rwanda format (250 78/79/72/73 XXXXXXX)
  if (/^2507[2389]\d{7}$/.test(cleaned)) {
    return { isValid: true, normalized: cleaned };
  }

  // Accept general international MSISDN 9-15 digits for flexibility in sandbox
  if (/^\d{9,15}$/.test(cleaned)) {
    return { isValid: true, normalized: cleaned };
  }

  return { 
    isValid: false, 
    normalized: cleaned, 
    error: 'Please enter a valid MTN MoMo phone number (e.g. 078XXXXXXX or 079XXXXXXX)' 
  };
}

/**
 * Masks a phone number for privacy in logs and UI responses
 * e.g. 250788123456 -> 250788***456 or 0788123456 -> 0788***456
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';
  const str = phone.trim();
  if (str.length <= 6) return '****';
  const visibleStart = str.slice(0, 4);
  const visibleEnd = str.slice(-3);
  return `${visibleStart}****${visibleEnd}`;
}
