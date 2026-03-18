/**
 * Algerian mobile phone format: 0[5|6|7]XXXXXXXX
 * 05 = Ooredoo  |  06 = Djezzy  |  07 = Mobilis
 */

const ALGERIAN_PHONE_REGEX = /^0[567]\d{8}$/;

export type PhoneOperator = 'Ooredoo' | 'Djezzy' | 'Mobilis' | 'Unknown';

export const isValidAlgerianPhone = (value: string): boolean => {
  const digits = value.replace(/\s/g, '');
  return ALGERIAN_PHONE_REGEX.test(digits);
};

export const getOperator = (value: string): PhoneOperator => {
  const digits = value.replace(/\s/g, '');
  if (digits.startsWith('05')) return 'Ooredoo';
  if (digits.startsWith('06')) return 'Djezzy';
  if (digits.startsWith('07')) return 'Mobilis';
  return 'Unknown';
};

/**
 * Formats a raw digit string into display format: 0X XX XX XX XX
 * e.g. "0661234567" → "06 61 23 45 67"
 */
export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
};