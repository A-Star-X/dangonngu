'use client';
// @spec T3-09, T1-08
// Một unit trong danh sách: chỉ thông tin tổng quan (tên, nghĩa, số câu, tiến độ); bấm để mở Chi tiết Unit (S10).
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { unitCounts, unitLevel, unitStatuses, type DisplayStatus, type LanguageData, type Progress, type Unit } from '@/domain';
import { AppLink } from '@/components/ui/app-link';
import { href } from '@/lib/routes';
import { Strip, type CellState } from './strip';

const CELL: Record<DisplayStatus, CellState> = { 'chua-hoc': 'chua', 'da-nho': 'nho', 'can-on': 'can-on' };
export const unitCells = (u: Unit, progress: Progress, now: number) => unitStatuses(u, progress, now).map((s) => CELL[s]);

export function UnitCard({ d, u, progress, now }: { d: LanguageData; u: Unit; progress: Progress; now: number }) {
  const t = useTranslations('unit');
  const lv = unitLevel(d, u);
  const c = unitCounts(u, progress, now);
  const n = u.ids.length;
  const started = c.chuaHoc < n;
  return (
    <AppLink
      href={href('unit', { so: u.number })}
      className="group flex h-full min-h-11 flex-col gap-3 rounded-card border border-border bg-card p-4 text-card-foreground hover:border-primary"
      data-so={u.number}
      data-testid="unit-card"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-label text-muted-foreground">
          {t('name', { n: u.number })}
          {lv ? ` · ${lv}` : ''}
        </span>
        <ChevronRight className="size-4 flex-none text-muted-foreground group-hover:text-primary" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        {u.title && (
          <span className="src text-base font-semibold [overflow-wrap:anywhere]" lang={d.lang}>
            {u.title}
          </span>
        )}
        {u.translation && (
          <span className="vi truncate text-sm text-muted-foreground" lang="vi">
            {u.translation}
          </span>
        )}
      </span>
      <span className="flex items-center justify-between gap-3">
        <span aria-hidden>
          <Strip cells={unitCells(u, progress, now)} />
        </span>
        <span className="num text-sm text-muted-foreground">
          {started ? (
            <>
              {c.daNho}/{n}
              <span className="sr-only"> {t('remembered')}</span>
            </>
          ) : (
            t('count', { count: n })
          )}
        </span>
      </span>
    </AppLink>
  );
}
