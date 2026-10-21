'use client';
import { Inbox } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

export function NoData({ message, action }: { message?: ReactNode; action?: ReactNode }) {
  const t = useTranslations('statusDisplay');
  return (
    <div className="flex flex-col items-start gap-3 py-6" role="status">
      <p className="flex items-start gap-2 text-data text-muted-foreground">
        <Inbox className="mt-1 size-4 flex-none" aria-hidden />
        <span>{message ?? t('noData')}</span>
      </p>
      {action}
    </div>
  );
}
