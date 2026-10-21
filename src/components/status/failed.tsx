'use client';
// @spec APP-08
import { CircleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

/** Lỗi tải: câu nói rõ chuyện gì xảy ra và cần làm gì, kèm nút Thử lại (APP-08, FND-12). */
export function Failed({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const t = useTranslations('statusDisplay');
  return (
    <div className="flex flex-col items-start gap-3 py-6" role="alert">
      <p className="flex items-start gap-2 text-data">
        <CircleAlert className="mt-1 size-4 flex-none text-danger" aria-hidden />
        {message ?? t('failed')}
      </p>
      {onRetry && (
        <Button tone="primary" onClick={onRetry}>
          {t('retry')}
        </Button>
      )}
    </div>
  );
}
