'use client';
// Thứ tự bọc theo rule công nghệ: query client → theme → auth → toast.
import type { ReactNode } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import type { AuthApi } from '@/services/auth-services/type';
import { AuthProvider } from './auth-provider';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';
import { ToastProvider } from './toast-provider';

export function AppProviders({ children, queryClient, authApi }: { children: ReactNode; queryClient?: QueryClient; authApi?: AuthApi }) {
  return (
    <QueryProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider api={authApi}>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
