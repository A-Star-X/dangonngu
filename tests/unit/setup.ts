import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { resetUpdateSignal } from '@/lib/updates';
import { resetLeaveGuard } from '@/lib/nav-guard';
import { resetRouteMemory } from '@/lib/route-memory';
import { dismiss } from '@/lib/toast';
import { LinkMock, patchHistory, routerCalls, routerMock, usePathnameMock, useSearchParamsMock } from './router-mock';

patchHistory();

vi.mock('next/navigation', () => ({
  useSearchParams: () => useSearchParamsMock(),
  usePathname: () => usePathnameMock(),
  useRouter: () => routerMock,
  notFound: () => {
    throw new Error('notFound');
  },
  redirect: (href: string) => {
    throw new Error(`redirect ${href}`);
  },
}));

vi.mock('@/i18n/navigation', () => ({
  Link: LinkMock,
  usePathname: () => usePathnameMock(),
  useRouter: () => routerMock,
  redirect: ({ href }: { href: string }) => {
    throw new Error(`redirect ${href}`);
  },
  getPathname: ({ href }: { href: string }) => href,
}));

afterEach(() => {
  cleanup();
  dismiss();
  window.history.replaceState(null, '', '/');
  routerCalls.length = 0;
  document.documentElement.classList.remove('dark');
  document.body.className = '';
  document.body.style.overflow = '';
  // gỡ speechSynthesis giả nếu có
  delete (window as unknown as Record<string, unknown>).speechSynthesis;
  delete (globalThis as unknown as Record<string, unknown>).SpeechSynthesisUtterance;
  resetUpdateSignal();
  resetLeaveGuard();
  resetRouteMemory();
  try {
    window.localStorage.clear();
  } catch {
    // bỏ qua
  }
});
