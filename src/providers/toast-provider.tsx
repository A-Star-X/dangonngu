'use client';
// @spec C7-01, C7-02, FND-11
import { useEffect, useLayoutEffect, useSyncExternalStore, type ReactNode } from 'react';
import { Slide, ToastContainer, type ToastTransitionProps } from 'react-toastify';

/** Không có hiệu ứng: dùng khi máy bật giảm chuyển động (FND-11) và trong môi trường test. */
function NoMotion({ children, isIn, done, playToast }: ToastTransitionProps) {
  useLayoutEffect(() => {
    playToast();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isIn) done();
  }, [isIn, done]);
  return <>{children}</>;
}

const QUERY = '(prefers-reduced-motion: reduce)';
const reducedMotion = () => /jsdom/i.test(navigator.userAgent) || (typeof window.matchMedia === 'function' && window.matchMedia(QUERY).matches);
function subscribe(fn: () => void) {
  if (typeof window.matchMedia !== 'function') return () => undefined;
  const mq = window.matchMedia(QUERY);
  mq.addEventListener?.('change', fn);
  return () => mq.removeEventListener?.('change', fn);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const still = useSyncExternalStore(subscribe, reducedMotion, () => true);
  return (
    <>
      {children}
      <ToastContainer
        position="bottom-center"
        autoClose={false}
        hideProgressBar
        newestOnTop
        closeOnClick={false}
        closeButton={false}
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        draggable={false}
        transition={still ? NoMotion : Slide}
        theme="light"
        icon={false}
        className="vitasr-toasts"
      />
    </>
  );
}
