'use client';
// @spec C2-01, C2-02, C2-03
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export type CellState = 'chua' | 'dang' | 'nho' | 'can-on';

const CELL: Record<CellState, string> = {
  // Viền đậm hơn đường kẻ thường để ô trống thấy được ở cả giao diện tối (tương phản đồ họa 3:1).
  chua: 'border-muted-foreground/70 bg-transparent',
  dang: 'border-primary bg-primary',
  nho: 'border-success bg-success',
  // Vạch chéo màu nền thẻ để phân biệt "cần ôn" không cần màu (C2-02).
  'can-on': 'border-warning bg-warning relative overflow-hidden after:absolute after:top-1/2 after:left-1/2 after:h-[1.5px] after:w-4 after:-translate-x-1/2 after:-translate-y-1/2 after:-rotate-45 after:bg-card',
};

export function Strip({ cells, className }: { cells: CellState[]; className?: string }) {
  const t = useTranslations('strip');
  const shown = cells.slice(0, 8);
  const learned = shown.filter((c) => c === 'nho' || c === 'can-on').length;
  return (
    <ol className={cn('flex items-center gap-1', className)} aria-label={t('label', { learned, total: shown.length })}>
      {shown.map((c, i) => (
        <li
          key={i}
          className={cn('size-2.5 flex-none border-[1.5px] transition-colors duration-[var(--d-cell)]', CELL[c])}
          data-state={c}
          aria-label={t('cell', { n: i + 1, state: t(`state.${c}`) })}
        />
      ))}
    </ol>
  );
}
