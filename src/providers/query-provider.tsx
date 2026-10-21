'use client';
// Bộ nhớ đệm query và mutation (react-query). Dữ liệu câu là file tĩnh theo phiên bản nên không tự tải lại.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: Infinity, refetchOnWindowFocus: false, refetchOnReconnect: false },
      mutations: { retry: 1 },
    },
  });
}

export function QueryProvider({ children, client }: { children: ReactNode; client?: QueryClient }) {
  const [qc] = useState(() => client ?? makeQueryClient());
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}
