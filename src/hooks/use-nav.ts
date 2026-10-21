'use client';
// @spec APP-04, S3-07, S5-08
// Chuyển màn trong khu học. Cùng đường dẫn thì chỉ đổi tham số trên URL (không tải lại màn);
// khác đường dẫn thì dùng router của Next. Mọi lần chuyển đều hỏi chặn rời màn trước (S3-07, S5-08).
import { useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { canLeave } from '@/lib/nav-guard';
import { href, ROUTE_PATH, type ParamsIn, type RouteName } from '@/lib/routes';

export interface NavOptions {
  replace?: boolean;
  /** Bỏ qua chặn rời màn (đã hỏi người dùng rồi). */
  force?: boolean;
}

export type Navigate = (name: RouteName, params?: ParamsIn, opts?: NavOptions) => boolean;

export function useNav(): Navigate {
  const router = useRouter();
  return useCallback(
    (name, params, opts) => {
      const to = href(name, params);
      if (!opts?.force && !canLeave(to)) return false;
      const samePath = window.location.pathname === ROUTE_PATH[name];
      if (samePath) {
        if (`${window.location.pathname}${window.location.search}` === to && !opts?.replace) return true;
        // Truyền state null để Next cập nhật router (useSearchParams); state có dấu nội bộ của Next thì Next bỏ qua.
        if (opts?.replace) window.history.replaceState(null, '', to);
        else window.history.pushState(null, '', to);
      } else if (opts?.replace) router.replace(to);
      else router.push(to);
      return true;
    },
    [router],
  );
}
