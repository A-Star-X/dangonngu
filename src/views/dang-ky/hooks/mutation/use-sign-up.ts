'use client';
// @spec AU-02, AU-04
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import type { SignUpValues } from '../../utils/schema';

export function useSignUp() {
  const { signUp } = useAuth();
  return useMutation({ mutationFn: (v: SignUpValues) => signUp(v.email, v.password) });
}
