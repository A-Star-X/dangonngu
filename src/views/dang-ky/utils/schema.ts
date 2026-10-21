// @spec AU-03
import { z } from 'zod';
import { isValidEmail } from '@/utils/email';
import { PASSWORD_MIN } from '@/views/dang-nhap/utils/schema';

export const signUpSchema = z
  .object({
    email: z.string().trim().min(1, 'emailRequired').refine(isValidEmail, 'emailInvalid'),
    password: z.string().min(1, 'passwordRequired').min(PASSWORD_MIN, 'passwordShort'),
    confirm: z.string().min(1, 'confirmRequired'),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'confirmMismatch' });

export type SignUpValues = z.infer<typeof signUpSchema>;
