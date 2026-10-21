'use client';
// @spec APP-04, APP-10
// Việc chạy một lần khi mở app trên trình duyệt: đổi liên kết kiểu cũ (#/...) sang đường dẫn mới,
// đăng ký service worker ở bản build.
import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { legacyHashTarget } from '@/lib/routes';
import { registerServiceWorker } from '@/lib/updates';
import { appDeps } from './workspace-frame';

export function ClientBoot() {
  const router = useRouter();
  useEffect(() => {
    // APP-04: liên kết đã lưu từ bản cũ dùng dấu #, ví dụ /#/thu-vien?xem=cau.
    const target = legacyHashTarget(window.location.hash);
    if (target) router.replace(target);
  }, [router]);
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    registerServiceWorker(navigator.serviceWorker, {
      onFirstControl: () => {
        const src = appDeps().source as { warm?: () => Promise<void> };
        void src.warm?.();
      },
    });
  }, []);
  return null;
}
