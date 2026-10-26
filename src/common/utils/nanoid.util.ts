import { customAlphabet } from 'nanoid';

/**
 * Alfabeto alfanumérico URL-safe de 62 caracteres (0-9, A-Z, a-z).
 * Com 10 caracteres: 62^10 = 839.299.365.868.340.224 combinações únicas (zero colisões).
 */
export const NANOID_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export const NANOID_LENGTH = 10;

export const generateNanoId = customAlphabet(NANOID_ALPHABET, NANOID_LENGTH);

export const NANOID_REGEX = /^[0-9A-Za-z]{10}$/;
