// @spec AU-03
import { EMAIL_REGEX } from './regex';

export const normalizeEmail = (value: string) => value.trim().toLowerCase();
export const isValidEmail = (value: string) => EMAIL_REGEX.test(normalizeEmail(value));
