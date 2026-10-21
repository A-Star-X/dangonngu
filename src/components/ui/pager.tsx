'use client';
// @spec T3-04
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from './button';

export function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (n: number) => void }) {
  const t = useTranslations('pager');
  if (pages <= 1) return null;
  return (
    <nav className="flex items-center justify-between gap-3 pt-3" aria-label={t('label')}>
      <Button tone="outline" className="min-w-28" locked={page === 1} onClick={() => onPage(page - 1)} icon={<ChevronLeft className="size-4" aria-hidden />}>
        {t('prev')}
      </Button>
      <span className="num text-sm">{t('page', { n: page, total: pages })}</span>
      <Button tone="outline" className="min-w-28 flex-row-reverse" locked={page === pages} onClick={() => onPage(page + 1)} icon={<ChevronRight className="size-4" aria-hidden />}>
        {t('next')}
      </Button>
    </nav>
  );
}
