'use client';
// @spec APP-04
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePathname } from '@/i18n/navigation';
import { routeName, toParams, type Route } from '@/lib/routes';

/** Route hiện tại của khu học: tên màn và tham số trên URL. */
export function useRoute(): Route {
  const pathname = usePathname();
  const sp = useSearchParams();
  const search = sp?.toString() ?? '';
  return useMemo(() => ({ name: routeName(pathname), params: toParams(search), raw: `${pathname}${search ? `?${search}` : ''}` }), [pathname, search]);
}
