'use client';
// @spec APP-08
import { CloudOff, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useOnline } from '@/hooks/use-online';
import { useLearning } from '@/providers/learning-provider';
import { statusBadgeClass } from '@/utils/status-badge-colors';
import { cn } from '@/lib/utils';

export function Banners() {
  const t = useTranslations('banner');
  const { storageBlocked } = useLearning();
  const online = useOnline();
  return (
    <>
      {!online && (
        <p className={cn('flex items-start gap-2 rounded-card px-4 py-3 text-sm', statusBadgeClass('info'))} role="status">
          <CloudOff className="mt-0.5 size-4 flex-none" aria-hidden />
          {t('offline')}
        </p>
      )}
      {storageBlocked && (
        <p className={cn('flex items-start gap-2 rounded-card px-4 py-3 text-sm', statusBadgeClass('warning'))} role="alert">
          <TriangleAlert className="mt-0.5 size-4 flex-none" aria-hidden />
          {t('storageBlocked')}
        </p>
      )}
    </>
  );
}
