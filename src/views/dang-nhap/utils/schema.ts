// @spec AU-03
import { z } from 'zod';
import { isValidEmail } from '@/utils/email';

export const PASSWORD_MIN = 8;

/** Thông báo lỗi là khóa trong namespace auth.errors, dịch lúc hiện. */
export const signInSchema = z.object({
  email: z.string().trim().min(1, 'emailRequired').refine(isValidEmail, 'emailInvalid'),
  password: z.string().min(1, 'passwordRequired'),
});

export type SignInValues = z.infer<typeof signInSchema>;
