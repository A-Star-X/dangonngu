'use client';
// @spec AU-05
// Đã đăng nhập thì rời trang đăng nhập, đăng ký: về địa chỉ đang chờ (?tiep=) hoặc trang Học.
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { safeNext } from '@/components/layout/workspace-frame';
import { ROUTE_PATH } from '@/lib/routes';
import { useAuth } from '@/providers/auth-provider';

export function useNextPath(): string {
  const sp = useSearchParams();
  return safeNext(sp?.get('tiep')) ?? ROUTE_PATH.hoc;
}

export function useLeaveWhenSignedIn() {
  const { status } = useAuth();
  const router = useRouter();
  const next = useNextPath();
  useEffect(() => {
    if (status === 'signed-in') router.replace(next);
  }, [status, next, router]);
}
