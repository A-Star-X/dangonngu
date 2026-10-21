import { useCallback, useSyncExternalStore } from 'react';

/** Khớp media query; trình duyệt không có matchMedia (và lúc dựng trên máy chủ) thì coi như không khớp. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (fn: () => void) => {
      if (typeof window.matchMedia !== 'function') return () => undefined;
      const mq = window.matchMedia(query);
      mq.addEventListener?.('change', fn);
      return () => mq.removeEventListener?.('change', fn);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => typeof window.matchMedia === 'function' && window.matchMedia(query).matches,
    () => false,
  );
}
