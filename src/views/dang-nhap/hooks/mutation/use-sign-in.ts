'use client';
// @spec AU-01, AU-04
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import type { SignInValues } from '../../utils/schema';

export function useSignIn() {
  const { signIn } = useAuth();
  return useMutation({ mutationFn: (v: SignInValues) => signIn(v.email, v.password) });
}
