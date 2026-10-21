'use client';
// @spec APP-08
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/** Đang tải. Mặc định là vòng xoay nhỏ; khối nội dung lớn truyền khung xương đúng hình (APP-08). */
export function Loading({ className }: { className?: string }) {
  const t = useTranslations('statusDisplay');
  return (
    <div className={cn('flex items-center gap-2 py-6 text-description', className)} role="status" aria-busy="true">
      <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />
      {t('loading')}
    </div>
  );
}

/** Khung xương: thẻ câu hoặc danh sách (APP-08: không để màn trắng, không vòng xoay giữa màn). */
export function Skeleton({ shape }: { shape: 'card' | 'list' | 'hoc' | 'units' }) {
  const t = useTranslations('statusDisplay');
  if (shape === 'units') {
    // Hình T3 cách xem Unit (T3-09): tiêu đề, nút chọn cách xem, lưới thẻ unit 1, 2, 3 cột.
    const block = 'skeleton rounded-card bg-muted motion-safe:animate-pulse';
    return (
      <div className="flex flex-col gap-4" aria-busy="true" role="status" data-testid="skeleton">
        <span className="sr-only">{t('loading')}</span>
        <div className={cn(block, 'h-8 w-40')} />
        <div className="skeleton h-11 w-44 rounded-button bg-muted motion-safe:animate-pulse" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={cn(block, 'h-36')} />
          ))}
        </div>
      </div>
    );
  }
  if (shape === 'hoc') {
    // Hình T1 (T1-06): dưới 1200 px một cột (mục tiêu tuần rồi thẻ câu); từ 1200 px thẻ câu bên trái, các khối phụ bên phải.
    const block = 'skeleton rounded-card bg-muted motion-safe:animate-pulse';
    return (
      <div className="grid grid-cols-1 gap-4 wide:grid-cols-[minmax(0,560px)_minmax(320px,1fr)] wide:items-start wide:gap-x-8" aria-busy="true" role="status" data-testid="skeleton">
        <span className="sr-only">{t('loading')}</span>
        <div className="order-2 flex flex-col gap-4 wide:order-1 wide:row-span-3">
          <div className={cn(block, 'h-72')} />
          <div className="skeleton h-11 w-48 rounded-button bg-muted motion-safe:animate-pulse" />
        </div>
        <div className={cn(block, 'order-1 h-14 wide:order-2')} />
        <div className={cn(block, 'order-3 h-14')} />
        <div className={cn(block, 'order-4 h-32')} />
      </div>
    );
  }
  if (shape === 'list') {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" role="status" data-testid="skeleton">
        <span className="sr-only">{t('loading')}</span>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton h-14 rounded-card bg-muted motion-safe:animate-pulse" />
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4" aria-busy="true" role="status" data-testid="skeleton">
      <span className="sr-only">{t('loading')}</span>
      <div className="skeleton h-56 rounded-card bg-muted motion-safe:animate-pulse" />
      <div className="skeleton h-11 w-48 rounded-button bg-muted motion-safe:animate-pulse" />
    </div>
  );
}
